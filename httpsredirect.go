package gokrazy

import "net/http"

// TODO: Configurable https-port
func httpsRedirect(w http.ResponseWriter, r *http.Request) {
	newURI := "https://" + r.Host + r.URL.String()
	http.Redirect(w, r, newURI, http.StatusFound)
}
