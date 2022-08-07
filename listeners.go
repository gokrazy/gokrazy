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
	gokrazyGdns = func() *net.IPNet {
		_, net, err := net.ParseCIDR("fdf5:3606:2a21::/48")
		if err != nil {
			log.Panic(err)
		}
		return net
	}()
)

// IsInPrivateNet reports whether the specified IP address is a private address,
// including loopback and link-local unicast addresses.
func IsInPrivateNet(ip net.IP) bool {
	return ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast()
}

func isPrivate(iface string, ipaddr net.IP) bool {
	if strings.HasPrefix(iface, "uplink") {
		return false
	}
	return IsInPrivateNet(ipaddr)
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
			if ipaddr.IsLinkLocalUnicast() {
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
func updateListeners(port, redirectPort string, tlsEnabled bool, tlsConfig *tls.Config) error {
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
				Handler:   http.HandlerFunc(httpsRedirect(redirectPort)),
				TLSConfig: tlsConfig,
			}
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
