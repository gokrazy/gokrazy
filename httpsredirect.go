package gokrazy

import (
	"net/http"
)

func httpsRedirect(redirectPort string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		r.URL.Host = r.Host
		if redirectPort != "443" {
			r.URL.Host += ":" + redirectPort
		}
		r.URL.Scheme = "https"
		http.Redirect(w, r, r.URL.String(), http.StatusFound) // Redirect to https
	}
}
