package gokrazy

import (
	"net"
	"net/http"
)

func targetForRequest(r *http.Request, redirectPort string) string {
	host, _, err := net.SplitHostPort(r.Host)
	if err != nil {
		host = r.Host
	}
	r.URL.Host = host
	if redirectPort != "443" {
		r.URL.Host += ":" + redirectPort
	}
	r.URL.Scheme = "https"
	return r.URL.String()
}

func httpsRedirect(redirectPort string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		target := targetForRequest(r, redirectPort)
		http.Redirect(w, r, target, http.StatusFound) // Redirect to https
	}
}
