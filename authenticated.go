package gokrazy

import (
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
	s := strings.SplitN(r.Header.Get("Authorization"), " ", 2)
	if len(s) != 2 || s[0] != "Basic" {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, "no Basic Authorization header set", http.StatusUnauthorized)
		return
	}

	b, err := base64.StdEncoding.DecodeString(s[1])
	if err != nil {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, fmt.Sprintf("could not decode Authorization header as base64: %v", err), http.StatusUnauthorized)
		return
	}

	pair := strings.SplitN(string(b), ":", 2)
	if len(pair) != 2 ||
		pair[0] != "gokrazy" ||
		pair[1] != httpPassword {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, "invalid username/password", http.StatusUnauthorized)
		return
	}

	http.DefaultServeMux.ServeHTTP(w, r)
}
