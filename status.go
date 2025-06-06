package gokrazy

import (
	"bytes"
	"debug/buildinfo"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	"github.com/gokrazy/gokrazy/internal/assets"
	"github.com/gokrazy/internal/config"
	"github.com/gokrazy/internal/rootdev"

	"golang.org/x/sys/unix"
)

func parseMeminfo() map[string]int64 {
	meminfo, err := ioutil.ReadFile("/proc/meminfo")
	if err != nil {
		return nil
	}
	vals := make(map[string]int64)
	for _, line := range strings.Split(string(meminfo), "\n") {
		if !strings.HasPrefix(line, "MemTotal") &&
			!strings.HasPrefix(line, "MemAvailable") {
			continue
		}
		parts := strings.Split(line, ":")
		if len(parts) < 2 {
			continue
		}
		val, err := strconv.ParseInt(strings.TrimSpace(strings.TrimSuffix(parts[1], " kB")), 0, 64)
		if err != nil {
			continue
		}
		vals[parts[0]] = val * 1024 // KiB to B
	}
	return vals
}

// readFile0 returns the file contents or an empty string if the file could not
// be read. All bytes from any \0 byte onwards are stripped (as found in
// /proc/device-tree/model).
//
// Additionally, whitespace is trimmed.
func readFile0(filename string) string {
	b, _ := ioutil.ReadFile(filename)
	if idx := bytes.IndexByte(b, 0); idx > -1 {
		b = b[:idx]
	}
	return string(bytes.TrimSpace(b))
}

var modelCache atomic.Value // of string

// Model returns a human readable description of the current device model,
// e.g. “Raspberry Pi 4 Model B Rev 1.1” or “PC Engines apu2” or “QEMU”
// or ultimately “unknown model”.
func Model() string {
	if s, ok := modelCache.Load().(string); ok {
		return s
	}
	andCache := func(s string) string {
		modelCache.Store(s)
		return s
	}
	// the supported Raspberry Pis have this file
	if m := readFile0("/proc/device-tree/model"); m != "" {
		return andCache(m)
	}
	// The PC Engines apu2c4 (and other PCs) have this file instead:
	vendor := readFile0("/sys/class/dmi/id/board_vendor")
	name := readFile0("/sys/class/dmi/id/board_name")
	if vendor != "" || name != "" {
		return andCache(vendor + " " + name)
	}
	// QEMU has none of that. But it does say "QEMU" here, so use this as
	// another fallback:
	if v := readFile0("/sys/class/dmi/id/sys_vendor"); v != "" {
		return andCache(v)
	}
	// If we can't find anything else, at least return some non-empty string so
	// fbstatus doesn't render funny with empty parens. Plus this gives people
	// something to grep for to add more model detection.
	return "unknown model"
}

func readModuleInfo(path string) (string, error) {
	bi, err := buildinfo.ReadFile(path)
	if err != nil {
		return "", err
	}
	lines := strings.Split(strings.TrimSpace(bi.String()), "\n")
	shortened := make([]string, len(lines))
	for idx, line := range lines {
		row := strings.Split(line, "\t")
		if len(row) > 3 {
			row = row[:3]
		}
		shortened[idx] = strings.Join(row, "\t")
	}
	return strings.Join(shortened, "\n"), nil
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

func jsonRequested(r *http.Request) bool {
	// When this function was introduced, it incorrectly checked the
	// Content-Type header (which specifies the type of the body, if any), where
	// it should have looked at the Accept header. Hence, we now consider both,
	// at least for some time.
	return strings.Contains(strings.ToLower(r.Header.Get("Accept")), "application/json") ||
		strings.Contains(strings.ToLower(r.Header.Get("Content-type")), "application/json")
}

func eventStreamRequested(r *http.Request) bool {
	return strings.Contains(strings.ToLower(r.Header.Get("Accept")), "text/event-stream")
}

var templates = template.Must(template.New("root").
	Funcs(map[string]interface{}{
		"printSBOMHash": func(sbomHash string) string {
			const sbomHashLen = 10
			if len(sbomHash) < sbomHashLen {
				return sbomHash
			}
			return sbomHash[:sbomHashLen]
		},

		"shortenSHA256": func(hash string) string {
			if len(hash) > 10 {
				return hash[:10]
			}
			return hash
		},
		"restarting": func(t time.Time) bool {
			return time.Since(t).Seconds() < 5
		},

		"last": func(s []string) string {
			if len(s) == 0 {
				return ""
			}
			return s[len(s)-1]
		},

		"megabytes": func(val int64) string {
			return fmt.Sprintf("%.1f MiB", float64(val)/1024/1024)
		},

		"gigabytes": func(val int64) string {
			return fmt.Sprintf("%.1f GiB", float64(val)/1024/1024/1024)
		},

		"baseName": func(path string) string {
			return filepath.Base(path)
		},

		"initRss": func() int64 {
			return rssOfPid(1)
		},

		"rssPercentage": func(meminfo map[string]int64, rss int64) string {
			used := float64(meminfo["MemTotal"] - meminfo["MemAvailable"])
			return fmt.Sprintf("%.f", float64(rss)/used*100)
		},
	}).
	ParseFS(assets.Assets, "*.tmpl"))

func mountTargets() ([]string, error) {
	b, err := os.ReadFile("/etc/gokrazy/mountdevices.json")
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, fmt.Errorf("reading mountdevices.json: %v", err)
	}
	var mountdevices []config.MountDevice
	if err := json.Unmarshal(b, &mountdevices); err != nil {
		return nil, fmt.Errorf("reading mountdevices.json: %v", err)
	}
	var targets []string
	for _, dev := range mountdevices {
		targets = append(targets, dev.Target)
	}
	return targets, nil
}

type filesystemStatus struct {
	Dev   string
	Used  int64
	Avail int64
	Total int64
}

func initStatus() {
	model := Model()

	var uname unix.Utsname
	if err := unix.Uname(&uname); err != nil {
		log.Printf("getting uname: %v", err)
	}
	kernel := parseUtsname(uname)

	_, sbomHash, err := ReadSBOM()
	if err != nil {
		log.Printf("getting SBOM: %v", err)
	}

	mountTargets, err := mountTargets()
	if err != nil {
		log.Printf("getting mount targets: %v", err)
	}

	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.FS(assets.Assets))))

	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		token := xsrfTokenFromCookies(r.Cookies())
		if token == 0 {
			// Only generate a new XSRF token if the old one is expired, so that
			// loading a different form in the background doesn’t render the
			// current one unusable.
			token = xsrfToken()
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "gokrazy_xsrf",
			Value:    fmt.Sprintf("%d", token),
			Expires:  time.Now().Add(24 * time.Hour),
			HttpOnly: true,
		})

		path := r.FormValue("path")
		svc := findSvc(path)
		if svc == nil {
			http.Error(w, "service not found", http.StatusNotFound)
			return
		}

		if jsonRequested(r) {
			b, err := json.Marshal(svc)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write(b)
			return
		}

		var buf bytes.Buffer
		if err := templates.ExecuteTemplate(&buf, "status.tmpl", struct {
			Service        *service
			BuildTimestamp string
			SBOMHash       string
			Hostname       string
			Model          string
			XsrfToken      int32
			EEPROM         *eepromVersion
			Kernel         string
		}{
			Service:        svc,
			BuildTimestamp: buildTimestamp,
			SBOMHash:       sbomHash,
			Hostname:       hostname,
			Model:          model,
			XsrfToken:      token,
			EEPROM:         lastInstalledEepromVersion,
			Kernel:         kernel,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		status := "started"
		if svc.Stopped() {
			status = "stopped"
		}
		w.Header().Set("X-Gokrazy-Status", status)
		w.Header().Set("X-Gokrazy-GOARCH", runtime.GOARCH)
		io.Copy(w, &buf)
	})

	http.HandleFunc("/log", handleLog)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")

		var st unix.Statfs_t
		if err := unix.Statfs("/perm", &st); err != nil {
			log.Printf("could not stat /perm: %v", err)
		}
		privateAddrs, err := PrivateInterfaceAddrs()
		if err != nil {
			log.Printf("could not get private addrs: %v", err)
		}
		publicAddrs, err := PublicInterfaceAddrs()
		if err != nil {
			log.Printf("could not get public addrs: %v", err)
		}

		permUUID := rootdev.PARTUUID()
		if strings.Contains(permUUID, "-") {
			permUUID = strings.TrimSuffix(permUUID, "01") + "04"
		} else {
			permUUID += "-04"
		}

		var mountDevices []filesystemStatus
		for _, target := range mountTargets {
			var st unix.Statfs_t
			if err := unix.Statfs(target, &st); err != nil {
				log.Printf("could not stat %s: %v", target, err)
			}
			mountDevices = append(mountDevices, filesystemStatus{
				Dev:   target,
				Used:  int64(st.Bsize) * int64(st.Blocks-st.Bfree),
				Avail: int64(st.Bsize) * int64(st.Bavail),
				Total: int64(st.Bsize) * int64(st.Blocks),
			})
		}

		services.Lock()
		defer services.Unlock()
		status := struct {
			Services       []*service
			PermDev        string
			PermUsed       int64
			PermAvail      int64
			PermTotal      int64
			PrivateAddrs   []string
			PublicAddrs    []string
			BuildTimestamp string
			SBOMHash       string
			Meminfo        map[string]int64
			Hostname       string
			Model          string
			PermUUID       string
			EEPROM         *eepromVersion
			Kernel         string
			MountDevices   []filesystemStatus
		}{
			Services:       services.S,
			PermDev:        rootdev.Partition(rootdev.Perm),
			PermUsed:       int64(st.Bsize) * int64(st.Blocks-st.Bfree),
			PermAvail:      int64(st.Bsize) * int64(st.Bavail),
			PermTotal:      int64(st.Bsize) * int64(st.Blocks),
			PrivateAddrs:   privateAddrs,
			PublicAddrs:    publicAddrs,
			BuildTimestamp: buildTimestamp,
			SBOMHash:       sbomHash,
			Meminfo:        parseMeminfo(),
			Hostname:       hostname,
			Model:          model,
			PermUUID:       permUUID,
			EEPROM:         lastInstalledEepromVersion,
			Kernel:         kernel,
			MountDevices:   mountDevices,
		}

		if jsonRequested(r) {
			b, err := json.Marshal(status)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write(b)
			return
		}

		var buf bytes.Buffer
		if err := templates.ExecuteTemplate(&buf, "overview.tmpl", status); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		io.Copy(w, &buf)
	})
}
