package gokrazy

import (
	"container/ring"
	"encoding/json"
	"errors"
	"fmt"
	"io"
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

func (w *remoteSyslogWriter) Stream() (<-chan string, func()) {
	return w.lines.Stream()
}

func (w *remoteSyslogWriter) Write(b []byte) (int, error) {
	w.lines.Write(b)
	w.syslogMu.Lock()
	defer w.syslogMu.Unlock()
	if w.syslog == nil {
		return len(b), nil
	}
	for _, line := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		w.syslog.Write([]byte(line + "\n"))
	}
	return len(b), nil
}

type lineRingBuffer struct {
	sync.RWMutex
	remainder string
	r         *ring.Ring
	streams   map[chan string]struct{}
}

func newLineRingBuffer(size int) *lineRingBuffer {
	return &lineRingBuffer{
		r:       ring.New(size),
		streams: make(map[chan string]struct{}),
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

		line := text[:idx]
		lrb.r.Value = line
		for stream := range lrb.streams {
			select {
			case stream <- line:
			default:
				// If receiver channel is blocking, skip. This means streams
				// will miss log lines if they are full.
			}
		}
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

// Stream generates a new channel which will stream any logged lines, including everything currently
// in the ring buffer. Deregister the stream by calling the close function.
func (lrb *lineRingBuffer) Stream() (<-chan string, func()) {
	lrb.Lock()
	defer lrb.Unlock()

	// Need a chan that has at least len(ring) entries in it, otherwise populating it with existing
	// contents of the ring will block forever.
	stream := make(chan string, 101)
	lrb.r.Do(func(x interface{}) {
		if x != nil {
			stream <- x.(string)
		}
	})
	lrb.streams[stream] = struct{}{}

	return stream, func() {
		lrb.Lock()
		defer lrb.Unlock()

		delete(lrb.streams, stream)
		close(stream)
	}
}

type lineswriter interface {
	io.Writer
	Lines() []string
	Stream() (<-chan string, func())
}

type supervisionMode int

const (
	superviseLoop supervisionMode = iota
	superviseOnce
	superviseDone
)

type service struct {
	// config (never updated)
	ModuleInfo string

	// state
	stopped   bool
	stoppedMu sync.RWMutex
	cmd       *exec.Cmd
	cmdMu     sync.Mutex
	Stdout    lineswriter
	Stderr    lineswriter
	started   time.Time
	startedMu sync.RWMutex
	process   *os.Process
	processMu sync.RWMutex

	diversionMu sync.Mutex
	diversion   string

	supervisionMu sync.Mutex
	supervision   supervisionMode

	waitForClock bool

	state *processState
}

func (s *service) setDiversion(d string) {
	s.diversionMu.Lock()
	defer s.diversionMu.Unlock()
	s.diversion = d
}

func (s *service) Diverted() string {
	s.diversionMu.Lock()
	defer s.diversionMu.Unlock()
	return s.diversion
}

func (s *service) Cmd() *exec.Cmd {
	s.cmdMu.Lock()
	defer s.cmdMu.Unlock()
	return s.cmd
}

func (s *service) setCmd(cmd *exec.Cmd) {
	s.cmdMu.Lock()
	defer s.cmdMu.Unlock()
	s.cmd = cmd
}

func (s *service) Name() string {
	return s.Cmd().Args[0]
}

func (s *service) supervisionMode() supervisionMode {
	s.supervisionMu.Lock()
	defer s.supervisionMu.Unlock()
	return s.supervision
}

func (s *service) setSupervisionMode(mode supervisionMode) {
	s.supervisionMu.Lock()
	defer s.supervisionMu.Unlock()
	s.supervision = mode
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
		// Use syscall.Kill instead of s.process.Signal since we want
		// to the send the signal to all process of the group (-pid)
		err := syscall.Kill(-s.process.Pid, signal)
		if errno, ok := err.(syscall.Errno); ok {
			if errno == syscall.ESRCH {
				return nil // no such process, nothing to signal
			}
		}
		return err
	}
	return nil // no process, nothing to signal
}

func (s *service) setProcess(p *os.Process) {
	s.processMu.Lock()
	defer s.processMu.Unlock()
	s.process = p
}

func (s *service) MarshalJSON() ([]byte, error) {
	pid := 0
	if proc := s.Process(); proc != nil {
		pid = proc.Pid
	}
	return json.Marshal(&struct {
		Stopped   bool
		StartTime time.Time
		Pid       int
		Path      string
		Args      []string
		Diverted  string
	}{
		Stopped:   s.Stopped(),
		StartTime: s.Started(),
		Pid:       pid,
		Path:      s.Cmd().Path,
		Args:      s.Cmd().Args,
		Diverted:  s.Diverted(),
	})
}

func rssOfPid(pid int) int64 {
	statm, err := os.ReadFile(fmt.Sprintf("/proc/%d/statm", pid))
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
	b, err := os.ReadFile("/perm/remote_syslog/target")
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
	tag := filepath.Base(s.Cmd().Path)
	if modInfo, err := readModuleInfo(s.Cmd().Path); err == nil {
		s.ModuleInfo = modInfo
	} else {
		log.Printf("cannot read module info from %s: %v", s.Cmd().Path, err)
	}

	s.state = NewProcessState()

	s.Stdout = newLogWriter(tag)
	s.Stderr = newLogWriter(tag)
	l := log.New(s.Stderr, "", log.LstdFlags|log.Ldate|log.Ltime)
	attempt := 0

	// Wait for clock to be updated via ntp for services
	// that need correct time. This can be enabled
	// by adding a settings file named waitforclock.txt under
	// waitforclock/<package> directory.
	if strings.HasPrefix(s.Cmd().Path, "/user/") && s.waitForClock {
		l.Print("gokrazy: waiting for clock to be synced")
		WaitForClock()
	}

	for {
		if s.Stopped() {
			time.Sleep(1 * time.Second)
			continue
		}

		cmd := &exec.Cmd{
			Path:   s.Cmd().Path,
			Args:   s.Cmd().Args,
			Env:    s.Cmd().Env,
			Stdout: s.Stdout,
			Stderr: s.Stderr,
			SysProcAttr: &syscall.SysProcAttr{
				// create a new process group for each service to make it easier to terminate all its
				// processes with a single signal.
				Setpgid: true,
			},
		}
		if d := s.Diverted(); d != "" {
			cmd.Path = d
			args := make([]string, len(cmd.Args))
			copy(args, cmd.Args)
			args[0] = d
			cmd.Args = args
		}
		if cmd.Env == nil {
			cmd.Env = os.Environ() // for older gokr-packer versions
		}
		if attempt == 0 {
			cmd.Env = append(cmd.Env, "GOKRAZY_FIRST_START=1")
		}
		// Designate a subdirectory under /perm/home as $HOME.
		// This mirrors what gokrazy system daemons and
		// ported daemons would do, so setting $HOME
		// increases the chance that third-party daemons
		// just work.
		base := filepath.Base(s.Cmd().Path)
		oldDir := "/perm/" + base
		homeDir := "/perm/home/" + base
		// Older gokrazy installations used /perm/<base>,
		// but since we started creating one directory for each
		// supervised process, it is better to use /perm/home/<base>
		// to avoid cluttering the /perm partition.
		if _, err := os.Stat(oldDir); err == nil {
			homeDir = oldDir
		}
		cmd.Env = append(cmd.Env, "HOME="+homeDir)
		if err := os.MkdirAll(homeDir, 0700); err != nil {
			if errors.Is(err, syscall.EROFS) {
				l.Printf("gokrazy: cannot create $HOME directory without writeable /perm partition")
			} else {
				l.Printf("gokrazy: creating $HOME: %v", err)
			}
		} else {
			// Process execution fails when cmd.Dir points to
			// a non-existant directory.
			cmd.Dir = homeDir
		}

		l.Printf("gokrazy: attempt %d, starting %q", attempt, cmd.Args)
		s.setStarted(time.Now())
		attempt++

		pid := -1
		if err := cmd.Start(); err != nil {
			if d := s.Diverted(); os.IsNotExist(err) && d != "" {
				l.Printf("gokrazy: removing no longer existing diversion %q", d)
				s.setDiversion("")
			}
			l.Println("gokrazy: " + err.Error())
		} else {
			pid = cmd.Process.Pid
		}

		s.state.Set(Running)
		s.setProcess(cmd.Process)

		err := cmd.Wait()
		if err != nil {
			if isDontSupervise(err) {
				l.Println("gokrazy: process should not be supervised, stopping")
				s.setStopped(true)
			}
			l.Println("gokrazy: " + err.Error())
		} else {
			l.Printf("gokrazy: exited successfully, stopping")
			s.setStopped(true)
		}

		if s.supervisionMode() == superviseOnce {
			s.setSupervisionMode(superviseDone)
			if !s.Stopped() {
				l.Println("gokrazy: running process only once, stopping")
				s.setStopped(true)
			}
		}

		for {
			if pid <= 0 {
				// Sanity check pid value.
				// Sending 0 for pid in Wait4 has special meaning, which we don't want.
				break
			}

			// Wait4 return the pid of a process that exited,
			// or -1 if there are no processes to be waited on (or error).
			wpid, _ := syscall.Wait4(-pid, nil, 0, nil)
			if wpid == -1 {
				break
			}
		}
		s.state.Set(Stopped)
		time.Sleep(1 * time.Second)
	}
}

var services struct {
	sync.Mutex
	S []*service
}

// signalSupervisedServices sends a given signal to all non-stopped processes.
// It returns the corresponding processState to allow waiting for a given state.
func signalSupervisedServices(signal syscall.Signal) []*processState {
	services.Lock()
	defer services.Unlock()

	states := make([]*processState, 0, len(services.S))
	for _, s := range services.S {
		// s.Stopped() only checks the "stopped" flag of the service (if it shouldn't restart).
		// We check the actual state as well to be sure to re-send a signal if we are already
		// in the "Stopping" state.
		if s.Stopped() && s.state.Get() == Stopped {
			continue
		}

		// NOTE: Stopping can be inaccurate if the process exited after the check above.
		// In that case, `state.Set(Stopping)` will be ignored - see `processState.Set()`.
		s.state.Set(Stopping)

		s.setStopped(true)
		s.Signal(signal)
		states = append(states, s.state)
	}
	return states
}

// killSupervisedServices is called before rebooting when upgrading, allowing
// processes to terminate in an orderly fashion.
func killSupervisedServices(signalDelay time.Duration) {
	termStates := signalSupervisedServices(syscall.SIGTERM)
	termDone := make(chan struct{})
	go func() {
		for _, s := range termStates {
			s.WaitTill(Stopped)
		}
		close(termDone)
	}()

	select {
	case <-termDone:
		log.Println("All processes shut down")
		return
	case <-time.After(signalDelay):
	}
	log.Println("Some processes did not stop, send sigkill")

	killStates := signalSupervisedServices(syscall.SIGKILL)
	killDone := make(chan struct{})
	go func() {
		for _, s := range killStates {
			s.WaitTill(Stopped)
		}
		close(killDone)
	}()

	select {
	case <-killDone:
		log.Println("All processes shut down")
		return
	case <-time.After(signalDelay):
	}

	log.Println("Some processes did not stop after sigkill")
}

func findSvc(path string) *service {
	services.Lock()
	defer services.Unlock()
	for _, s := range services.S {
		if s.Cmd().Path == path {
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
		if r.FormValue("supervise") == "once" {
			s.setSupervisionMode(superviseOnce)
		} else {
			s.setSupervisionMode(superviseLoop)
		}
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
	services.Lock()
	services.S = svc
	defer services.Unlock()
	for _, s := range services.S {
		go supervise(s)
	}

	http.HandleFunc("/stop", stopstartHandler)
	http.HandleFunc("/restart", stopstartHandler)
}
