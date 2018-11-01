package gokrazy

import (
	"fmt"
	"os"
	"syscall"
)

type netlinkListener struct {
	fd  int
	buf []byte
}

func listenNetlink() (*netlinkListener, error) {
	fd, err := syscall.Socket(syscall.AF_NETLINK, syscall.SOCK_DGRAM, syscall.NETLINK_ROUTE)
	if err != nil {
		return nil, fmt.Errorf("socket(AF_NETLINK, SOCK_DGRAM, NETLINK_ROUTE): %v", err)
	}

	saddr := &syscall.SockaddrNetlink{
		Family: syscall.AF_NETLINK,
		Groups: (1 << (syscall.RTNLGRP_IPV4_IFADDR - 1)) |
			(1 << (syscall.RTNLGRP_IPV6_IFADDR - 1)),
	}

	if err := syscall.Bind(fd, saddr); err != nil {
		return nil, fmt.Errorf("bind: %v", err)
	}

	return &netlinkListener{
		fd: fd,
		// use the page size as buffer size, like libnl
		buf: make([]byte, os.Getpagesize()),
	}, nil
}

func (l *netlinkListener) ReadMsgs() ([]syscall.NetlinkMessage, error) {
	n, err := syscall.Read(l.fd, l.buf)
	if err != nil {
		return nil, fmt.Errorf("Read: %v", err)
	}

	msgs, err := syscall.ParseNetlinkMessage(l.buf[:n])
	if err != nil {
		return nil, fmt.Errorf("ParseNetlinkMessage: %v", err)
	}

	return msgs, nil
}
