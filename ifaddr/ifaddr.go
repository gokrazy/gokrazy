// Package ifaddr provides functions to obtain the private and public host
// addresses of all active interfaces. These functions work on gokrazy and on
// other operating systems (Linux, macOS).
package ifaddr

import (
	"log"
	"net"
	"strings"
)

var (
	gokrazyGdns = func() *net.IPNet {
		_, net, err := net.ParseCIDR("fdf5:3606:2a21::/48")
		if err != nil {
			log.Panic(err)
		}
		return net
	}()

	tailnet = func() *net.IPNet {
		// see https://tailscale.com/kb/1015/100.x-addresses/
		_, net, err := net.ParseCIDR("100.64.0.0/10")
		if err != nil {
			log.Panic(err)
		}
		return net
	}()
)

// IsInPrivateNet reports whether the specified IP address is a private address,
// including loopback, link-local unicast addresses and tailscale tailnet
// addresses.
func IsInPrivateNet(ip net.IP) bool {
	return ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || tailnet.Contains(ip)
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
