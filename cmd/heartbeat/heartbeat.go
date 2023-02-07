package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gokrazy/gokrazy"
	"golang.org/x/sys/unix"
)

// TODO: use this structure from gokrazy/api, once available
type humanReadable struct {
	// TODO: add model on the server side
	Model  string `json:"model"`
	Kernel string `json:"kernel"`
	// TODO: include firmware and eeprom hashes after making
	// lastInstalledEepromVersion() from status.go public.
}

// TODO: use this structure from gokrazy/api, once available
type heartbeatRequest struct {
	MachineID     string           `json:"machine_id"`
	Hostname      string           `json:"hostname"`
	SBOMHash      string           `json:"sbom_hash"`
	SBOM          *json.RawMessage `json:"sbom"`
	HumanReadable humanReadable    `json:"human_readable"`
}

func heartbeat1(gusBase string, req heartbeatRequest) error {
	// TODO(optimization): try a lean request first: machine id and hash over
	// the remaining fields. If the server replies that a full request is
	// needed, send the full request.

	b, err := json.Marshal(&req)
	if err != nil {
		return err
	}
	httpReq, err := http.NewRequest("POST", strings.TrimSuffix(gusBase, "/")+"/api/v1/heartbeat", bytes.NewReader(b))
	if err != nil {
		return err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		return err
	}
	// Read and close body to re-use this HTTP client for later requests
	defer resp.Body.Close()
	ioutil.ReadAll(resp.Body)
	if got, want := resp.StatusCode, http.StatusOK; got != want {
		return fmt.Errorf("unexpected HTTP status: got %v, want %v", resp.Status, want)
	}
	log.Printf("heartbeat request successfully sent")
	return nil
}

func parseUtsname(u unix.Utsname) string {
	if u == (unix.Utsname{}) {
		// Empty utsname, no info to parse.
		return "unknown"
	}

	str := func(b [65]byte) string {
		// Trim all trailing NULL bytes.
		return string(bytes.TrimRight(b[:], "\x00"))
	}

	return fmt.Sprintf("%s %s (%s)",
		str(u.Sysname), str(u.Release), str(u.Machine))
}

func buildHeartbeatRequest() heartbeatRequest {
	machineID := gokrazy.MachineID()
	model := gokrazy.Model()
	hostname, _ := os.Hostname()

	var uname unix.Utsname
	if err := unix.Uname(&uname); err != nil {
		log.Printf("getting uname: %v", err)
	}
	kernel := parseUtsname(uname)

	sbom, sbomHash, err := gokrazy.ReadSBOM()
	if err != nil {
		log.Printf("reading SBOM: %v", err)
	}

	return heartbeatRequest{
		MachineID: machineID,
		Hostname:  hostname,
		SBOMHash:  sbomHash,
		SBOM:      sbom,
		HumanReadable: humanReadable{
			Model:  model,
			Kernel: kernel,
		},
	}
}

func main() {
	var (
		frequency = flag.Duration("frequency",
			1*time.Minute,
			"frequency with which heartbeats should be sent")

		gusServer = flag.String("gus_server",
			"",
			"base URL (without /api/…) of the GUS server to send heartbeats to")
	)
	flag.Parse()

	if *gusServer == "" {
		os.Exit(125) // do not supervise
	}

	// Wait for clock synchronization, which implies waiting for the network and
	// for the /perm partition to be mounted.
	gokrazy.WaitForClock()

	req := buildHeartbeatRequest()

	for first := true; ; first = false {
		if !first {
			jitter := time.Duration(rand.Int63n(250)) * time.Millisecond
			time.Sleep(*frequency + jitter)
		}
		if err := heartbeat1(*gusServer, req); err != nil {
			log.Print(err)
		}
	}
}
