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
	kind, encoded, found := stringsCut(r.Header.Get("Authorization"), " ")
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

	username, password, found := stringsCut(string(b), ":")
	if !found ||
		username != "gokrazy" ||
		subtle.ConstantTimeCompare([]byte(password), []byte(httpPassword)) != 1 {
		w.Header().Set("WWW-Authenticate", `Basic realm="gokrazy"`)
		http.Error(w, "invalid username/password", http.StatusUnauthorized)
		return
	}

	http.DefaultServeMux.ServeHTTP(w, r)
}

// TODO: replace with strings.Cut (available in go 1.18)
// when go 1.19 is out
// https://github.com/gokrazy/gokrazy/pull/120#discussion_r834514081
//
// Cut slices s around the first instance of sep,
// returning the text before and after sep.
// The found result reports whether sep appears in s.
// If sep does not appear in s, cut returns s, "", false.
//
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
func stringsCut(s, sep string) (before, after string, found bool) {
	if i := strings.Index(s, sep); i >= 0 {
		return s[:i], s[i+len(sep):], true
	}
	return s, "", false
}
