package iface

import (
	"net"
	"syscall"
	"unsafe"
)

// as per https://manpages.debian.org/jessie/manpages/netdevice.7.en.html
type ifreqAddr struct {
	name [16]byte
	addr syscall.RawSockaddrInet4
	pad  [8]byte
}

// as per https://manpages.debian.org/jessie/manpages/netdevice.7.en.html
type ifreqFlags struct {
	name  [16]byte
	flags uint16
	pad   [22]byte
}

// as per http://lxr.free-electrons.com/source/include/uapi/linux/route.h#L30
type rtentry struct {
	pad1    uint64
	dst     syscall.RawSockaddrInet4
	gateway syscall.RawSockaddrInet4
	genmask syscall.RawSockaddrInet4
	flags   uint16
	pad     [512]byte
}

type Configsocket struct {
	fd   int
	name [16]byte
}

func NewConfigSocket(iface string) (Configsocket, error) {
	fd, err := syscall.Socket(syscall.AF_INET, syscall.SOCK_DGRAM, 0)
	if err != nil {
		return Configsocket{}, err
	}

	cs := Configsocket{
		fd: fd,
	}
	copy(cs.name[:], []byte(iface))
	return cs, nil
}

func (cs Configsocket) Close() error {
	return syscall.Close(cs.fd)
}

func (cs Configsocket) ifreqAddr(request uintptr, addr net.IP) error {
	req := ifreqAddr{
		name: cs.name,
		addr: syscall.RawSockaddrInet4{
			Family: syscall.AF_INET,
		},
	}
	copy(req.addr.Addr[:], addr)

	if _, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(cs.fd), request, uintptr(unsafe.Pointer(&req))); errno != 0 {
		return errno
	}
	return nil
}

func (cs Configsocket) SetAddress(addr net.IP) error {
	return cs.ifreqAddr(syscall.SIOCSIFADDR, addr)
}

func (cs Configsocket) SetNetmask(addr net.IPMask) error {
	return cs.ifreqAddr(syscall.SIOCSIFNETMASK, net.IP(addr))
}

func (cs Configsocket) SetBroadcast(addr net.IP) error {
	return cs.ifreqAddr(syscall.SIOCSIFBRDADDR, addr)
}

func (cs Configsocket) Up() error {
	req := ifreqFlags{name: cs.name}
	if _, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(cs.fd), syscall.SIOCGIFFLAGS, uintptr(unsafe.Pointer(&req))); errno != 0 {
		return errno
	}

	req.flags |= syscall.IFF_UP
	req.flags |= syscall.IFF_RUNNING

	if _, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(cs.fd), syscall.SIOCSIFFLAGS, uintptr(unsafe.Pointer(&req))); errno != 0 {
		return errno
	}

	return nil
}

func (cs Configsocket) AddRoute(dst, gateway net.IP, genmask net.IPMask) syscall.Errno {
	req := rtentry{
		dst:     syscall.RawSockaddrInet4{Family: syscall.AF_INET},
		gateway: syscall.RawSockaddrInet4{Family: syscall.AF_INET},
		genmask: syscall.RawSockaddrInet4{Family: syscall.AF_INET},
		flags:   syscall.RTF_UP | syscall.RTF_GATEWAY,
	}
	copy(req.dst.Addr[:], dst)
	copy(req.gateway.Addr[:], gateway)
	copy(req.genmask.Addr[:], genmask)
	_, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(cs.fd), syscall.SIOCADDRT, uintptr(unsafe.Pointer(&req)))
	return errno
}

func (cs Configsocket) DelRoute(dst, gateway net.IP, genmask net.IPMask) syscall.Errno {
	req := rtentry{
		dst:     syscall.RawSockaddrInet4{Family: syscall.AF_INET},
		gateway: syscall.RawSockaddrInet4{Family: syscall.AF_INET},
		genmask: syscall.RawSockaddrInet4{Family: syscall.AF_INET},
		flags:   syscall.RTF_UP | syscall.RTF_GATEWAY,
	}
	copy(req.dst.Addr[:], dst)
	copy(req.gateway.Addr[:], gateway)
	copy(req.genmask.Addr[:], genmask)
	_, _, errno := syscall.Syscall(syscall.SYS_IOCTL, uintptr(cs.fd), syscall.SIOCDELRT, uintptr(unsafe.Pointer(&req)))
	return errno
}
