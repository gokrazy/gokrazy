package gokrazy

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gokrazy/gokrazy/internal/bundled"
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

var commonTmpls = mustParseCommonTmpls()

func mustParseCommonTmpls() *template.Template {
	t := template.New("root")
	t = template.Must(t.New("header").Parse(bundled.Asset("header.tmpl")))
	t = template.Must(t.New("footer").Parse(bundled.Asset("footer.tmpl")))
	return t
}

var overviewTmpl = template.Must(template.Must(commonTmpls.Clone()).New("overview").
	Funcs(map[string]interface{}{
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
	Parse(bundled.Asset("overview.tmpl")))

var statusTmpl = template.Must(template.Must(commonTmpls.Clone()).New("statusTmpl").Parse(bundled.Asset("status.tmpl")))

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

func model() string {
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

func initStatus(services []*service) {
	model := model()

	for _, fn := range []string{
		"favicon.ico",
		"bootstrap-3.3.7.min.css",
		"bootstrap-table-1.11.0.min.css",
		"bootstrap-table-1.11.0.min.js",
		"jquery-3.1.1.min.js",
	} {
		http.Handle("/"+fn, bundled.HTTPHandlerFunc(fn))
	}
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
		var buf bytes.Buffer
		if err := statusTmpl.Execute(&buf, struct {
			Service        *service
			BuildTimestamp string
			Hostname       string
			Model          string
			XsrfToken      int32
		}{
			Service:        svc,
			BuildTimestamp: buildTimestamp,
			Hostname:       hostname,
			Model:          model,
			XsrfToken:      token,
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

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
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
		var buf bytes.Buffer
		if err := overviewTmpl.Execute(&buf, struct {
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
		}{
			Services:       services,
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
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		io.Copy(w, &buf)
	})
}
