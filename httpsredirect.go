package gokrazy

import "net/http"

// TODO: Configurable https-port
func httpsRedirect(w http.ResponseWriter, r *http.Request) {
	r.URL.Host = r.Host
	r.URL.Scheme = "https"
	http.Redirect(w, r, r.URL.String(), http.StatusFound) // Redirect to https
}
