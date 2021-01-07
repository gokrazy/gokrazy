package gokrazy

import (
	"net/http"
	"strings"
)

// TODO: Configurable https-port
func httpsRedirect(handler http.Handler) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// get hostname without port
		target := r.URL.Host
		if port := ":" + r.URL.Port(); strings.HasSuffix(target, port) {
			target = strings.TrimSuffix(target, port)
		}

		// serve localhost on http
		if target == "localhost" {
			handler.ServeHTTP(w, r)
			return
		}

		r.URL.Host = r.Host
		r.URL.Scheme = "https"
		http.Redirect(w, r, r.URL.String(), http.StatusFound) // Redirect to https
	}
}
