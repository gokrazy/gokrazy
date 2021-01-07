package gokrazy

import (
	"crypto/tls"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
)

var (
	privateNets   []net.IPNet
	ipv6LinkLocal net.IPNet
	gokrazyGdns   = func() *net.IPNet {
		_, net, err := net.ParseCIDR("fdf5:3606:2a21::/48")
		if err != nil {
			log.Panic(err)
		}
		return net
	}()
)

// PrivateNetworks contains the CIDR representation of all networks which
// gokrazy considers private.
var PrivateNetworks = []string{
	// loopback: https://tools.ietf.org/html/rfc3330#section-2
	"127.0.0.0/8",
	// loopback: https://tools.ietf.org/html/rfc3513#section-2.4
	"::1/128",

	// reserved: https://tools.ietf.org/html/rfc1918#section-3
	"10.0.0.0/8",
	"172.16.0.0/12",
	"192.168.0.0/16",
	// reserved: https://tools.ietf.org/html/rfc4193#section-3.1
	"fc00::/7",

	// link-local: https://tools.ietf.org/html/rfc3927#section-1.2
	"169.254.0.0/16",
	// link-local: https://tools.ietf.org/html/rfc4291#section-2.4
	"fe80::/10",
}

func init() {
	privateNets = make([]net.IPNet, len(PrivateNetworks))
	for idx, s := range PrivateNetworks {
		_, net, err := net.ParseCIDR(s)
		if err != nil {
			log.Panic(err.Error())
		}
		privateNets[idx] = *net
		if s == "fe80::/10" {
			ipv6LinkLocal = *net
		}
	}
}

// IsInPrivateNet reports whether ip is in PrivateNetworks.
func IsInPrivateNet(ip net.IP) bool {
	return isPrivate("", ip)
}

func isPrivate(iface string, ipaddr net.IP) bool {
	if strings.HasPrefix(iface, "uplink") {
		return false
	}
	for _, n := range privateNets {
		if n.Contains(ipaddr) {
			return true
		}
	}
	return false
}

func interfaceAddrs(keep func(string, net.IP) bool) ([]string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	var hosts []string
	for _, i := range ifaces {
		if i.Flags&net.FlagUp != net.FlagUp {
			continue
		}
		addrs, err := i.Addrs()
		if err != nil {
			return nil, err
		}

		for _, a := range addrs {
			ipaddr, _, err := net.ParseCIDR(a.String())
			if err != nil {
				return nil, err
			}

			if gokrazyGdns.Contains(ipaddr) {
				continue
			}

			if !keep(i.Name, ipaddr) {
				continue
			}

			host := ipaddr.String()
			if ipv6LinkLocal.Contains(ipaddr) {
				host = host + "%" + i.Name
			}
			hosts = append(hosts, host)
		}
	}
	return hosts, nil
}

// PrivateInterfaceAddrs returns all private (as per RFC1918, RFC4193,
// RFC3330, RFC3513, RFC3927, RFC4291) host addresses of all active
// interfaces, suitable to be passed to net.JoinHostPort.
func PrivateInterfaceAddrs() ([]string, error) {
	return interfaceAddrs(isPrivate)
}

// PublicInterfaceAddrs returns all public (excluding RFC1918, RFC4193,
// RFC3330, RFC3513, RFC3927, RFC4291) host addresses of all active
// interfaces, suitable to be passed to net.JoinHostPort.
func PublicInterfaceAddrs() ([]string, error) {
	return interfaceAddrs(func(iface string, addr net.IP) bool {
		return !isPrivate(iface, addr)
	})
}

// Wrapper to keep track of allocated servers per host
type krazyServer struct {
	srv  *http.Server
	port string
}

var (
	listeners   = make(map[string][]*krazyServer)
	listenersMu sync.Mutex
)

// tlsConfig: tlsConfig. nil, if the listeners should not use https (e.g. for redirects)
func updateListeners(port string, tlsEnabled bool, tlsConfig *tls.Config) error {
	hosts, err := PrivateInterfaceAddrs()
	if err != nil {
		return err
	}

	listenersMu.Lock()
	defer listenersMu.Unlock()
	vanished := make(map[string]bool)
	for host := range listeners {
		vanished[host] = false
	}
	for _, host := range hosts {
		if servers, ok := listeners[host]; ok {
			// confirm found
			delete(vanished, host)
			cont := false
			for _, server := range servers {
				if server.port == port {
					cont = true
					break
				}
			}
			if cont {
				continue
			}
		}
		addr := net.JoinHostPort(host, port)
		ln, err := net.Listen("tcp", addr)
		if err != nil {
			log.Printf("listen: %v", err)
			continue
		}
		log.Printf("now listening on %s", addr)
		// add a new listener
		var srv *http.Server
		if tlsEnabled && tlsConfig == nil {
			// "Redirect" server
			srv = &http.Server{
				TLSConfig: tlsConfig,
			}
			srv.Handler = http.HandlerFunc(httpsRedirect(srv.Handler))
		} else {
			// "Content" server
			srv = &http.Server{
				Handler:   http.HandlerFunc(authenticated),
				TLSConfig: tlsConfig,
			}
		}
		if _, ok := listeners[host]; ok {
			listeners[host] = append(listeners[host], &krazyServer{srv, port})
		} else {
			listeners[host] = []*krazyServer{&krazyServer{srv, port}}
		}
		go func(host string, srv *http.Server) {
			var err error
			if tlsEnabled && tlsConfig != nil {
				err = srv.ServeTLS(ln, "", "")
			} else {
				err = srv.Serve(ln)
			}
			log.Printf("serving on %s: %v", addr, err)
			listenersMu.Lock()
			defer listenersMu.Unlock()
			delete(listeners, host)
		}(host, srv)

	}
	for host := range vanished {
		log.Printf("no longer listening on %s", net.JoinHostPort(host, port))
		for _, server := range listeners[host] {
			server.srv.Close()
		}
		delete(listeners, host)
	}
	return nil
}
