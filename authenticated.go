package gokrazy

import (
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"net"
	"net/http"
	"strings"
)

func authenticated(w http.ResponseWriter, r *http.Request) {
	// If httpPassword is empty, we only allow access via the unix socket. Out
	// of paranoia, even though it should only be listening via the unix socket,
	// verify that's where it came from.
	//
	// See https://github.com/gokrazy/gokrazy/issues/265
	if httpPassword == "" {
		addr, ok := r.Context().Value(http.LocalAddrContextKey).(*net.UnixAddr)
		if ok && addr.Name == GokrazyHTTPUnixSocket {
			http.DefaultServeMux.ServeHTTP(w, r)
		} else {
			http.Error(w, "httpPassword not set and request from unexpected address", http.StatusInternalServerError)
		}
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
