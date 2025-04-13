package gokrazy

import (
	"fmt"
	"net/http"
)

func handleLog(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "BUG: ResponseWriter does not implement http.Flusher", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")

	evtStream := eventStreamRequested(r)
	if evtStream {
		// See https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events for description
		// of server-sent events protocol.
		w.Header().Set("Content-type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
	}

	path := r.FormValue("path")
	svc := findSvc(path)
	if svc == nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	streamName := r.FormValue("stream")

	var stdout, stderr <-chan string
	var closeFunc func()

	switch streamName {
	case "stdout":
		stdout, closeFunc = svc.Stdout.Stream()
		stderr = make(<-chan string)
	case "stderr":
		stderr, closeFunc = svc.Stderr.Stream()
		stdout = make(<-chan string)
	case "both":
		var closeStdout, closeStderr func()
		stdout, closeStdout = svc.Stdout.Stream()
		stderr, closeStderr = svc.Stderr.Stream()
		closeFunc = func() {
			closeStdout()
			closeStderr()
		}
	default:
		http.Error(w, "stream not found", http.StatusNotFound)
		return
	}
	defer closeFunc()

	for {
		select {
		case line := <-stdout:
			if evtStream {
				line = fmt.Sprintf("data: %s\n", line)
				if streamName == "both" {
					line = "event: stdout\n" + line
				}
			}
			if _, err := fmt.Fprintln(w, line); err != nil {
				return
			}
			flusher.Flush()

		case line := <-stderr:
			if evtStream {
				line = fmt.Sprintf("data: %s\n", line)
				if streamName == "both" {
					line = "event: stderr\n" + line
				}
			}
			if _, err := fmt.Fprintln(w, line); err != nil {
				return
			}
			flusher.Flush()

		case <-r.Context().Done():
			// Client closed stream. Stop and release all resources immediately.
			return
		}
	}
}
