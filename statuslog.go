package gokrazy

import (
	"fmt"
	"net/http"
)

func handleLog(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	evtStream := eventStreamRequested(r)
	if evtStream {
		w.Header().Set("Content-type", "text/event-stream")
	}

	path := r.FormValue("path")
	svc := findSvc(path)
	if svc == nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	streamName := r.FormValue("stream")

	var stream <-chan string
	var closeFunc func()

	switch streamName {
	case "stdout":
		stream, closeFunc = svc.Stdout.Stream()
	case "stderr":
		stream, closeFunc = svc.Stderr.Stream()
	default:
		http.Error(w, "stream not found", http.StatusNotFound)
		return
	}
	defer closeFunc()

	for {
		select {
		case line := <-stream:
			// See https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events for description
			// of server-sent events protocol.
			if evtStream {
				line = fmt.Sprintf("data: %s\n", line)
			}
			if _, err := fmt.Fprintln(w, line); err != nil {
				return
			}
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			}
		case <-r.Context().Done():
			// Client closed stream. Stop and release all resources immediately.
			return
		}
	}
}
