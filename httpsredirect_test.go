package gokrazy

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHTTPSRedirect(t *testing.T) {
	for _, tt := range []struct {
		name         string
		redirectPort string
		want         string
	}{
		{
			name:         "https",
			redirectPort: "443", // default https port
			want:         "https://localhost/",
		},

		{
			name:         "https on non-standard port",
			redirectPort: "2443",
			want:         "https://localhost:2443/",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mux := http.NewServeMux()
			mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				got := targetForRequest(r, tt.redirectPort)
				got = strings.ReplaceAll(got, "127.0.0.1", "localhost")
				got = strings.ReplaceAll(got, "[::1]", "localhost")
				fmt.Fprintf(w, "%s", got)
			})
			srv := httptest.NewServer(mux)
			defer srv.Close()
			resp, err := srv.Client().Get(srv.URL)
			if err != nil {
				t.Fatal(err)
			}
			b, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatal(err)
			}
			got := strings.TrimSpace(string(b))

			if got != tt.want {
				t.Errorf("targetForRequest(req, %v) = %v, want %v", tt.redirectPort, got, tt.want)
			}
		})
	}
}
