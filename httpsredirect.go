package gokrazy

import (
	"net"
	"net/http"
)

func httpsRedirect(w http.ResponseWriter, r *http.Request) {
	// get hostname without port
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}

	ip := net.ParseIP(host)
	if IsInPrivateNet(ip) {
		http.DefaultServeMux.ServeHTTP(w, r)
		return
	}

	r.URL.Host = r.Host
	r.URL.Scheme = "https"
	http.Redirect(w, r, r.URL.String(), http.StatusFound) // Redirect to https
}
