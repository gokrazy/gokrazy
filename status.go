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
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gokrazy/gokrazy/internal/bundled"

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

func initStatus(services []*service) {
	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		path := r.FormValue("path")
		var svc *service
		for _, s := range services {
			if s.cmd.Path != path {
				continue
			}
			svc = s
			break
		}
		var buf bytes.Buffer
		if err := statusTmpl.Execute(&buf, struct {
			Service        *service
			BuildTimestamp string
			Hostname       string
		}{
			Service:        svc,
			BuildTimestamp: buildTimestamp,
			Hostname:       hostname,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		io.Copy(w, &buf)
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
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
		}{
			Services:       services,
			PermDev:        mustFindRootDevice() + "4",
			PermUsed:       int64(st.Bsize) * int64(st.Blocks-st.Bfree),
			PermAvail:      int64(st.Bsize) * int64(st.Bavail),
			PermTotal:      int64(st.Bsize) * int64(st.Blocks),
			PrivateAddrs:   privateAddrs,
			PublicAddrs:    publicAddrs,
			BuildTimestamp: buildTimestamp,
			Meminfo:        parseMeminfo(),
			Hostname:       hostname,
		}); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		io.Copy(w, &buf)
	})
}
