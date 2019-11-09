package bundled

import (
	"bytes"
	"net/http"
	"time"
)

func Asset(basename string) string {
	return string(assets["assets/"+basename])
}

func HTTPHandlerFunc(basename string) http.Handler {
	modTime := time.Now()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeContent(w, r, basename, modTime, bytes.NewReader(assets["assets/"+basename]))
	})
}
