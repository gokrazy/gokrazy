package gokrazy

import (
	"net"
	"net/http"
)

func httpsRedirect(redirectPort string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		host, _, _ := net.SplitHostPort(r.RemoteAddr)
		ip := net.ParseIP(host)
		if ip.IsLoopback() {
			http.DefaultServeMux.ServeHTTP(w, r)
			return
		}

		r.URL.Host = r.Host
		if redirectPort != "443" {
			r.URL.Host += ":" + redirectPort
		}
		r.URL.Scheme = "https"
		http.Redirect(w, r, r.URL.String(), http.StatusFound) // Redirect to https
	}
}
