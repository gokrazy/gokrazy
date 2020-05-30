package gokrazy

import (
	"container/ring"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"log/syslog"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

// remoteSyslogError throttles printing error messages about remote
// syslog. Since a remote syslog writer is created for stdout and stderr of each
// supervised process, error messages during early boot spam the serial console
// without limiting. When the value is 0, a log message can be printed. A
// background goroutine resets the value to 0 once a second.
var remoteSyslogError uint32

func init() {
	go func() {
		for range time.Tick(1 * time.Second) {
			atomic.StoreUint32(&remoteSyslogError, 0)
		}
	}()
}

type remoteSyslogWriter struct {
	raddr, tag string

	lines *lineRingBuffer

	syslogMu sync.Mutex
	syslog   io.Writer
}

func (w *remoteSyslogWriter) establish() {
	for {
		sl, err := syslog.Dial("udp", w.raddr, syslog.LOG_INFO, w.tag)
		if err != nil {
			if atomic.SwapUint32(&remoteSyslogError, 1) == 0 {
				log.Printf("remote syslog: %v", err)
			}
			time.Sleep(1 * time.Second)
			continue
		}
		w.syslogMu.Lock()
		defer w.syslogMu.Unlock()
		// replay buffer in case any messages were sent before the connection
		// could be established (before the network is ready)
		for _, line := range w.lines.Lines() {
			sl.Write([]byte(line + "\n"))
		}
		// send all future writes to syslog
		w.syslog = sl
		return
	}
}

func (w *remoteSyslogWriter) Lines() []string {
	return w.lines.Lines()
}

func (w *remoteSyslogWriter) Write(b []byte) (int, error) {
	w.lines.Write(b)
	w.syslogMu.Lock()
	defer w.syslogMu.Unlock()
	if w.syslog != nil {
		w.syslog.Write(b)
	}
	return len(b), nil
}

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

type lineswriter interface {
	io.Writer
	Lines() []string
}

type service struct {
	// config (never updated)
	ModuleInfo string

	// state
	stopped   bool
	stoppedMu sync.RWMutex
	cmd       *exec.Cmd
	Stdout    lineswriter
	Stderr    lineswriter
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

var syslogRaddr string

func initRemoteSyslog() {
	b, err := ioutil.ReadFile("/perm/remote_syslog/target")
	if err != nil {
		if !os.IsNotExist(err) {
			log.Print(err)
		}
		return
	}
	raddr := strings.TrimSpace(string(b))
	log.Printf("sending process stdout/stderr to remote syslog %s", raddr)
	syslogRaddr = raddr
}

func newLogWriter(tag string) lineswriter {
	lb := newLineRingBuffer(100)
	if syslogRaddr == "" {
		return lb
	}
	wr := &remoteSyslogWriter{
		raddr: syslogRaddr,
		tag:   tag,
		lines: lb,
	}
	go wr.establish()
	return wr
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
	tag := filepath.Base(s.cmd.Path)
	if modInfo, err := readModuleInfo(s.cmd.Path); err == nil {
		s.ModuleInfo = modInfo
	} else {
		log.Printf("cannot read module info from %s: %v", s.cmd.Path, err)
	}

	s.Stdout = newLogWriter(tag)
	s.Stderr = newLogWriter(tag)
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
			Env:    os.Environ(),
			Stdout: s.Stdout,
			Stderr: s.Stderr,
			SysProcAttr: &syscall.SysProcAttr{
				Unshareflags: syscall.CLONE_NEWNS,
			},
		}
		if attempt == 0 {
			cmd.Env = append(cmd.Env, "GOKRAZY_FIRST_START=1")
		}
		// Designate a subdirectory under /perm as $HOME.
		// This mirrors what gokrazy system daemons and
		// ported daemons would do, so setting $HOME
		// increases the chance that third-party daemons
		// just work.
		cmd.Env = append(cmd.Env, "HOME=/perm/"+filepath.Base(s.cmd.Path))

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
