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
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gokrazy/gokrazy/internal/assets"
	"github.com/gokrazy/internal/fat"
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

// mustReadFile0 returns the file contents or an empty string if the file could
// not be read. All trailing \0 bytes are stripped (as found in
// /proc/device-tree/model).
func mustReadFile0(filename string) string {
	b, err := ioutil.ReadFile(filename)
	if err != nil {
		return ""
	}
	if idx := bytes.IndexByte(b, 0); idx > -1 {
		b = b[:idx]
	}
	return string(b)
}

// Model returns a human readable description of the current device model,
// e.g. “Raspberry Pi 4 Model B Rev 1.1” or “PC Engines apu2”.
func Model() string {
	// the supported Raspberry Pis have this file
	model := mustReadFile0("/proc/device-tree/model")
	if model == "" {
		// The PC Engines apu2c4 (and other PCs) have this file instead:
		vendor := mustReadFile0("/sys/class/dmi/id/board_vendor")
		name := mustReadFile0("/sys/class/dmi/id/board_name")
		if vendor == "" || name == "" {
			return "" // unsupported platform
		}
		model = strings.TrimSpace(vendor) + " " + strings.TrimSpace(name)
	}
	return strings.TrimSpace(model)
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

type eepromVersion struct {
	PieepromSHA256 string // pieeprom.sig
	VL805SHA256    string // vl805.sig
}

func lastInstalledEepromVersion() (*eepromVersion, error) {
	f, err := os.OpenFile(rootdev.Partition(rootdev.Boot), os.O_RDONLY, 0600)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	rd, err := fat.NewReader(f)
	if err != nil {
		return nil, err
	}
	if _, err := rd.ModTime("/RECOVERY.000"); err != nil {
		return nil, fmt.Errorf("RECOVERY.000 not found, assuming update unsuccessful")
	}
	// Get all extents before we start seeking, which confuses the fat.Reader.
	offsetE, lengthE, err := rd.Extents("/pieeprom.sig")
	if err != nil {
		return nil, err
	}
	offsetV, lengthV, err := rd.Extents("/vl805.sig")
	if err != nil {
		return nil, err
	}
	result := &eepromVersion{}

	{
		if _, err := f.Seek(offsetE, io.SeekStart); err != nil {
			return nil, err
		}
		b := make([]byte, lengthE)
		if _, err := f.Read(b); err != nil {
			return nil, err
		}
		result.PieepromSHA256 = strings.TrimSpace(string(b))
	}

	{
		if _, err := f.Seek(offsetV, io.SeekStart); err != nil {
			return nil, err
		}
		b := make([]byte, lengthV)
		if _, err := f.Read(b); err != nil {
			return nil, err
		}
		result.VL805SHA256 = strings.TrimSpace(string(b))
	}

	return result, nil
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
	return strings.Contains(strings.ToLower(r.Header.Get("Content-type")), "application/json")
}

func eventStreamRequested(r *http.Request) bool {
	return strings.Contains(strings.ToLower(r.Header.Get("Accept")), "text/event-stream")
}

var templates = template.Must(template.New("root").
	Funcs(map[string]interface{}{
		"shortenSHA256": func(hash string) string {
			if len(hash) > 10 {
				return hash[:10]
			}
			return hash
		},
		"restarting": func(t time.Time) bool {
			return time.Since(t).Seconds() < 5
		},

		"last": func(stdout, stderr []string) string {
			if len(stdout) == 0 && len(stderr) == 0 {
				return ""
			}
			both := append(stdout, stderr...)
			sort.Strings(both)
			return both[len(both)-1]
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

func initStatus() {
	model := Model()

	lastInstalledEepromVersion, err := lastInstalledEepromVersion()
	if err != nil {
		log.Printf("getting EEPROM version: %v", err)
	}

	var uname unix.Utsname
	if err := unix.Uname(&uname); err != nil {
		log.Printf("getting uname: %v", err)
	}
	kernel := parseUtsname(uname)

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
			Hostname       string
			Model          string
			XsrfToken      int32
			EEPROM         *eepromVersion
			Kernel         string
		}{
			Service:        svc,
			BuildTimestamp: buildTimestamp,
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

	http.HandleFunc("/log", func(w http.ResponseWriter, r *http.Request) {
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
	})

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
			Meminfo        map[string]int64
			Hostname       string
			Model          string
			PermUUID       string
			EEPROM         *eepromVersion
			Kernel         string
		}{
			Services:       services.S,
			PermDev:        rootdev.Partition(rootdev.Perm),
			PermUsed:       int64(st.Bsize) * int64(st.Blocks-st.Bfree),
			PermAvail:      int64(st.Bsize) * int64(st.Bavail),
			PermTotal:      int64(st.Bsize) * int64(st.Blocks),
			PrivateAddrs:   privateAddrs,
			PublicAddrs:    publicAddrs,
			BuildTimestamp: buildTimestamp,
			Meminfo:        parseMeminfo(),
			Hostname:       hostname,
			Model:          model,
			PermUUID:       permUUID,
			EEPROM:         lastInstalledEepromVersion,
			Kernel:         kernel,
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
