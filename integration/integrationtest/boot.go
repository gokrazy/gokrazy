//go:build gokrazy
// +build gokrazy

package main

import (
	"log"
	"os"

	"github.com/gokrazy/internal/rootdev"
)

func main() {
	w, err := os.OpenFile("/dev/console", os.O_RDWR, 0600)
	if err != nil {
		log.Fatal(err)
	}
	logger := log.New(w, "", log.LstdFlags|log.Lshortfile)

	logger.Printf("PartitionCmdline(2) = %s", rootdev.PartitionCmdline(2))
	logger.Printf("PartitionCmdline(3) = %s", rootdev.PartitionCmdline(3))
	logger.Printf("PARTUUID() = %s", rootdev.PARTUUID())

	logger.Printf("SUCCESS")

	// Disable supervision, this program only needs to run once.
	os.Exit(125)
}
