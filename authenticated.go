package gokrazy

import (
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
)

func authenticated(w http.ResponseWriter, r *http.Request) {
	// defense in depth
	if httpPassword == "" {
		http.Error(w, "httpPassword not set", http.StatusInternalServerError)
		return
	}
	kind, encoded, found := strings.Cut(r.Header.Get("Authorization"), " ")
	if !found || kind != "Basic" {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, "no Basic Authorization header set", http.StatusUnauthorized)
		return
	}

	b, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, fmt.Sprintf("could not decode Authorization header as base64: %v", err), http.StatusUnauthorized)
		return
	}

	username, password, found := strings.Cut(string(b), ":")
	if !found ||
		username != "gokrazy" ||
		subtle.ConstantTimeCompare([]byte(password), []byte(httpPassword)) != 1 {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, "invalid username/password", http.StatusUnauthorized)
		return
	}

	http.DefaultServeMux.ServeHTTP(w, r)
}
