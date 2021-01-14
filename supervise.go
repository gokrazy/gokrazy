package gokrazy

import (
	"container/ring"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

type lineRingBuffer struct {
	sync.RWMutex
	remainder string
	r         *ring.Ring
}

func newLineRingBuffer(size int) *lineRingBuffer {
	return &lineRingBuffer{
		r: ring.New(size),
	}
}

func (lrb *lineRingBuffer) Write(b []byte) (int, error) {
	lrb.Lock()
	defer lrb.Unlock()
	text := lrb.remainder + string(b)
	for {
		idx := strings.Index(text, "\n")
		if idx == -1 {
			break
		}

		lrb.r.Value = text[:idx]
		lrb.r = lrb.r.Next()
		text = text[idx+1:]
	}
	lrb.remainder = text
	return len(b), nil
}

func (lrb *lineRingBuffer) Lines() []string {
	lrb.RLock()
	defer lrb.RUnlock()
	lines := make([]string, 0, lrb.r.Len())
	lrb.r.Do(func(x interface{}) {
		if x != nil {
			lines = append(lines, x.(string))
		}
	})
	return lines
}

type service struct {
	stopped   bool
	stoppedMu sync.RWMutex
	cmd       *exec.Cmd
	Stdout    *lineRingBuffer
	Stderr    *lineRingBuffer
	started   time.Time
	startedMu sync.RWMutex
	attempt   uint64
	process   *os.Process
	processMu sync.RWMutex
}

func (s *service) Name() string {
	return s.cmd.Args[0]
}

func (s *service) Stopped() bool {
	s.stoppedMu.RLock()
	defer s.stoppedMu.RUnlock()
	return s.stopped
}

func (s *service) setStopped(val bool) {
	s.stoppedMu.Lock()
	defer s.stoppedMu.Unlock()
	s.stopped = val
}

func (s *service) Started() time.Time {
	s.startedMu.RLock()
	defer s.startedMu.RUnlock()
	return s.started
}

func (s *service) setStarted(t time.Time) {
	s.startedMu.Lock()
	defer s.startedMu.Unlock()
	s.started = t
}

func (s *service) Process() *os.Process {
	s.processMu.RLock()
	defer s.processMu.RUnlock()
	return s.process
}

func (s *service) Signal(signal syscall.Signal) error {
	s.processMu.RLock()
	defer s.processMu.RUnlock()
	if s.process != nil {
		return s.process.Signal(signal)
	}
	return nil // no process, nothing to signal
}

func (s *service) setProcess(p *os.Process) {
	s.processMu.Lock()
	defer s.processMu.Unlock()
	s.process = p
}

func (s *service) MarshalJSON() ([]byte, error) {
	return json.Marshal(&struct {
		Stopped   bool
		StartTime time.Time
		Attempt   uint64
		Pid       int
		Path      string
		Args      []string
	}{
		Stopped:   s.stopped,
		StartTime: s.started,
		Attempt:   s.attempt,
		Pid:       s.process.Pid,
		Path:      s.cmd.Path,
		Args:      s.cmd.Args,
	})
}

func rssOfPid(pid int) int64 {
	statm, err := ioutil.ReadFile(fmt.Sprintf("/proc/%d/statm", pid))
	if err != nil {
		return 0
	}
	parts := strings.Split(strings.TrimSpace(string(statm)), " ")
	if len(parts) < 2 {
		return 0
	}
	rss, err := strconv.ParseInt(parts[1], 0, 64)
	if err != nil {
		return 0
	}
	return rss * 4096
}

func (s *service) RSS() int64 {
	if p := s.Process(); p != nil {
		return rssOfPid(s.Process().Pid)
	}
	return 0
}

func isDontSupervise(err error) bool {
	ee, ok := err.(*exec.ExitError)
	if !ok {
		return false
	}

	ws, ok := ee.Sys().(syscall.WaitStatus)
	if !ok {
		return false
	}

	return ws.ExitStatus() == 125
}

func supervise(s *service) {
	s.Stdout = newLineRingBuffer(100)
	s.Stderr = newLineRingBuffer(100)
	l := log.New(s.Stderr, "", log.LstdFlags|log.Ldate|log.Ltime)
	attempt := 0
	for {
		if s.Stopped() {
			time.Sleep(1 * time.Second)
			continue
		}

		l.Printf("gokrazy: attempt %d, starting %+v", attempt, s.cmd.Args)
		s.setStarted(time.Now())
		cmd := &exec.Cmd{
			Path:   s.cmd.Path,
			Args:   s.cmd.Args,
			Stdout: s.Stdout,
			Stderr: s.Stderr,
			SysProcAttr: &syscall.SysProcAttr{
				Unshareflags: syscall.CLONE_NEWNS,
			},
		}
		if attempt == 0 {
			cmd.Env = append(cmd.Env, "GOKRAZY_FIRST_START=1")
		}

		attempt++

		if err := cmd.Start(); err != nil {
			l.Println("gokrazy: " + err.Error())
		}

		s.setProcess(cmd.Process)

		if err := cmd.Wait(); err != nil {
			if isDontSupervise(err) {
				l.Println("gokrazy: process should not be supervised, stopping")
				s.setStopped(true)
			}
			l.Println("gokrazy: " + err.Error())
		} else {
			l.Printf("gokrazy: exited successfully")
		}
		time.Sleep(1 * time.Second)
	}
}

var services []*service

// killSupervisedServices is called before rebooting when upgrading, allowing
// processes to terminate in an orderly fashion.
func killSupervisedServices() {
	for _, s := range services {
		if s.Stopped() {
			continue
		}

		s.setStopped(true)

		if p := s.Process(); p != nil {
			p.Signal(syscall.SIGTERM)
		}
	}
}

func findSvc(path string) *service {
	for _, s := range services {
		if s.cmd.Path == path {
			return s
		}
	}
	return nil
}

func restart(s *service, signal syscall.Signal) error {
	if s.Stopped() {
		s.setStopped(false) // start process in next supervise iteration
		return nil
	}

	return s.Signal(signal) // kill to restart
}

func stop(s *service, signal syscall.Signal) error {
	if s.Stopped() {
		return nil // nothing to do
	}

	s.setStopped(true)
	return s.Signal(signal)
}

func stopstartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "expected a POST request", http.StatusBadRequest)
		return
	}

	cookieToken := xsrfTokenFromCookies(r.Cookies())
	if cookieToken == 0 {
		http.Error(w, "XSRF cookie missing", http.StatusBadRequest)
		return
	}
	i, err := strconv.ParseInt(r.FormValue("xsrftoken"), 0, 32)
	if err != nil {
		http.Error(w, fmt.Sprintf("parsing XSRF token form value: %v", err), http.StatusBadRequest)
		return
	}
	if formToken := int32(i); cookieToken != formToken {
		http.Error(w, "XSRF token mismatch", http.StatusForbidden)
		return
	}

	signal := syscall.SIGTERM
	if r.FormValue("signal") == "kill" {
		signal = syscall.SIGKILL
	}

	path := r.FormValue("path")
	s := findSvc(path)
	if s == nil {
		http.Error(w, "no such service", http.StatusNotFound)
		return
	}

	if r.URL.Path == "/restart" {
		err = restart(s, signal)
	} else {
		err = stop(s, signal)
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// StatusSeeOther will result in a GET request for the
	// redirect location
	u, _ := url.Parse("/status")
	u.RawQuery = url.Values{
		"path": []string{path},
	}.Encode()
	http.Redirect(w, r, u.String(), http.StatusSeeOther)
}

func superviseServices(svc []*service) {
	services = svc
	for _, s := range services {
		go supervise(s)
	}

	http.HandleFunc("/stop", stopstartHandler)
	http.HandleFunc("/restart", stopstartHandler)
}
