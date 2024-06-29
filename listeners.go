package gokrazy

import (
	"crypto/tls"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"

	"github.com/gokrazy/gokrazy/ifaddr"
)

// IsInPrivateNet reports whether the specified IP address is a private address,
// including loopback and link-local unicast addresses.
func IsInPrivateNet(ip net.IP) bool {
	return ifaddr.IsInPrivateNet(ip)
}

// PrivateInterfaceAddrs returns all private (as per RFC1918, RFC4193,
// RFC3330, RFC3513, RFC3927, RFC4291) host addresses of all active
// interfaces, suitable to be passed to net.JoinHostPort.
func PrivateInterfaceAddrs() ([]string, error) {
	return ifaddr.PrivateInterfaceAddrs()
}

// PublicInterfaceAddrs returns all public (excluding RFC1918, RFC4193,
// RFC3330, RFC3513, RFC3927, RFC4291) host addresses of all active
// interfaces, suitable to be passed to net.JoinHostPort.
func PublicInterfaceAddrs() ([]string, error) {
	return ifaddr.PublicInterfaceAddrs()
}

// Wrapper to keep track of allocated servers per host
type krazyServer struct {
	srv  *http.Server
	port string
}

var (
	listenersMu sync.Mutex
	listeners   = make(map[string][]*krazyServer) // by private IP address or unix socket path
)

// gokrazyHTTPUnixSocket is the unix socket path that
// the HTTP server listens on when httpPassword is empty.
const gokrazyHTTPUnixSocket = "/run/gokrazy-http.sock"

// tlsConfig: tlsConfig. nil, if the listeners should not use https (e.g. for redirects)
func updateListeners(port, redirectPort string, tlsEnabled bool, tlsConfig *tls.Config) error {
	var hosts []string // private IP addresses or unix socket path
	var err error

	// If NoPassword is used, the HTTP server doesn't run over HTTP
	// and instead only listens on a Unix socket. Packages running
	// in the appliance can proxy to the Unix socket as desired.
	if httpPassword == "" {
		hosts = []string{gokrazyHTTPUnixSocket}
	} else {
		hosts, err = PrivateInterfaceAddrs()
		if err != nil {
			return err
		}
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
		var ln net.Listener
		var addr string
		if strings.HasPrefix(host, "/") {
			// Unix socket
			ln, err = net.Listen("unix", host)
			if err != nil {
				log.Printf("listen: %v", err)
				continue
			}
			log.Printf("now listening on %s", host)
		} else {
			addr = net.JoinHostPort(host, port)
			ln, err = net.Listen("tcp", addr)
			if err != nil {
				log.Printf("listen: %v", err)
				continue
			}
			log.Printf("now listening on %s", addr)
		}
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
		listeners[host] = append(listeners[host], &krazyServer{srv, port})
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
