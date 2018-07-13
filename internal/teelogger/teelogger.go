// Package teelogger provides loggers which send their output to multiple
// writers, like the tee(1) command.
package teelogger

import (
	"io"
	"io/ioutil"
	"log"
	"os"
)

// NewConsole returns a logger which returns to /dev/console and os.Stderr.
func NewConsole() *log.Logger {
	var w io.Writer
	w, err := os.OpenFile("/dev/console", os.O_RDWR, 0600)
	if err != nil {
		w = ioutil.Discard
	}
	return log.New(io.MultiWriter(os.Stderr, w), "", log.LstdFlags|log.Lshortfile)
}
