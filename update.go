package gokrazy

import (
	"bytes"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"hash"
	"hash/crc32"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

	"github.com/gokrazy/internal/deviceconfig"
	"github.com/gokrazy/internal/fat"
	"github.com/gokrazy/internal/rootdev"
	"github.com/google/renameio/v2"
)

var rootRe = regexp.MustCompile(`root=[^ ]+`)

func readCmdline() ([]byte, error) {
	f, err := os.OpenFile(rootdev.Partition(rootdev.Boot), os.O_RDWR, 0600)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	rd, err := fat.NewReader(f)
	if err != nil {
		return nil, err
	}
	offset, length, err := rd.Extents("/cmdline.txt")
	if err != nil {
		return nil, err
	}
	if _, err := f.Seek(offset, io.SeekStart); err != nil {
		return nil, err
	}
	b := make([]byte, length)
	if _, err := f.Read(b); err != nil {
		return nil, err
	}
	return b, nil
}

func modifyCmdlineFile(f *os.File, offset, length int64, replace func([]byte) []byte) error {
	if _, err := f.Seek(offset, io.SeekStart); err != nil {
		return err
	}
	b := make([]byte, length)
	if _, err := f.Read(b); err != nil {
		return err
	}
	if _, err := f.Seek(offset, io.SeekStart); err != nil {
		return err
	}

	rep := replace(b)
	if pad := len(b) - len(rep); pad > 0 {
		// The file content length can shrink when switching from PARTUUID= (the
		// default) to /dev/mmcblk0p[23], on an older gokrazy installation.
		// Because we overwrite the file in place and have no means to truncate
		// it to a smaller length, we pad the command line with spaces instead.
		// Note that we need to insert spaces before the trailing newline,
		// otherwise the system won’t boot:
		rep = bytes.ReplaceAll(rep,
			[]byte{'\n'},
			append(bytes.Repeat([]byte{' '}, pad), '\n'))
	}

	if _, err := f.Write(rep); err != nil {
		return err
	}

	return nil
}

func modifyCmdline(replace func([]byte) []byte) error {
	f, err := os.OpenFile(rootdev.Partition(rootdev.Boot), os.O_RDWR, 0600)
	if err != nil {
		return err
	}
	defer f.Close()
	rd, err := fat.NewReader(f)
	if err != nil {
		return err
	}

	offset, length, err := rd.Extents("/cmdline.txt")
	if err != nil {
		return err
	}
	if err := modifyCmdlineFile(f, offset, length, replace); err != nil {
		return err
	}

	offset, length, err = rd.Extents("/loader/entries/gokrazy.conf")
	if err != nil {
		// This file might not be present yet when using a recent gokrazy
		// installation with an older gokr-packer.
		log.Printf("updating systemd-boot config: %v", err)
		return nil
	}
	if err := modifyCmdlineFile(f, offset, length, replace); err != nil {
		return err
	}
	return f.Close()
}

func switchRootPartition(newRootPartition int) error {
	return modifyCmdline(func(b []byte) []byte {
		return rootRe.ReplaceAllLiteral(b, []byte("root="+rootdev.PartitionCmdline(newRootPartition)))
	})
}

func enableTestboot() error {
	return modifyCmdline(func(b []byte) []byte {
		return bytes.ReplaceAll(b,
			[]byte{'\n'},
			[]byte(" gokrazy.try_boot_inactive=1\n"))
	})
}

func streamRequestTo(path string, offset int64, r io.Reader) error {
	f, err := os.OpenFile(path, os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer f.Close()

	if offset > 0 {
		if _, err := f.Seek(offset, io.SeekStart); err != nil {
			return err
		}
	}

	if _, err := io.Copy(f, r); err != nil {
		return err
	}
	if err := f.Sync(); err != nil {
		return err
	}
	return f.Close()
}

// createFile is different from streamRequestTo in that it creates new files
// (instead of just overwriting existing ones) and not syncing to disk, because
// it is intended for the /uploadtemp handler.
func createFile(path string, r io.Reader) error {
	f, err := renameio.TempFile("", path)
	if err != nil {
		return err
	}
	defer f.Cleanup()
	if _, err := io.Copy(f, r); err != nil {
		return err
	}
	return f.CloseAtomicallyReplace()
}

func nonConcurrentUpdateHandler(dest string) func(http.ResponseWriter, *http.Request) {
	return nonConcurrentLimitedUpdateHandler(dest, 0, 0)
}

func nonConcurrentLimitedUpdateHandler(dest string, offset int64, maxLength int64) func(http.ResponseWriter, *http.Request) {
	var mu sync.Mutex
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "expected a PUT request", http.StatusBadRequest)
			return
		}

		mu.Lock()
		defer mu.Unlock()

		var hash hash.Hash
		switch r.Header.Get("X-Gokrazy-Update-Hash") {
		case "crc32":
			hash = crc32.NewIEEE()
		default:
			hash = sha256.New()
		}

		var reader io.Reader = r.Body
		if maxLength > 0 {
			reader = io.LimitReader(reader, maxLength)
		}

		if err := streamRequestTo(dest, offset, io.TeeReader(reader, hash)); err != nil {
			log.Printf("updating %q failed: %v", dest, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Fprintf(w, "%x", hash.Sum(nil))
	}
}

func nonConcurrentSwitchHandler(newRootPartition int) func(http.ResponseWriter, *http.Request) {
	var mu sync.Mutex
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "expected a POST request", http.StatusBadRequest)
			return
		}

		mu.Lock()
		defer mu.Unlock()

		if err := switchRootPartition(newRootPartition); err != nil {
			log.Printf("switching root partition to %q failed: %v", newRootPartition, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func nonConcurrentTestbootHandler(newRootPartition int) func(http.ResponseWriter, *http.Request) {
	var mu sync.Mutex
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "expected a POST request", http.StatusBadRequest)
			return
		}

		mu.Lock()
		defer mu.Unlock()

		if err := enableTestboot(); err != nil {
			log.Printf("enabling test-boot of new root partition %q failed: %v", newRootPartition, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

type extraUpdateHandler struct {
	name      string
	device    string
	offset    int64
	maxLength int64
}

var extraUpdateHandlers []*extraUpdateHandler

func setupDeviceSpecifics() {
	modelName := Model()
	cfg, ok := deviceconfig.DeviceConfigs[modelName]
	if !ok {
		return
	}

	log.Printf("setting up device-specific update handlers for %q", modelName)

	for _, rootDevFile := range cfg.RootDeviceFiles {
		extraUpdateHandlers = append(extraUpdateHandlers, &extraUpdateHandler{
			name:      rootDevFile.Name,
			device:    rootdev.BlockDevice(),
			offset:    rootDevFile.Offset,
			maxLength: rootDevFile.MaxLength,
		})
	}
}

// Allow for slow VM shutdown of 90 seconds, and then some
const defaultSignalDelay = 100 * time.Second

func initUpdate() error {
	// The /update/features handler is used for negotiation of individual
	// feature support (e.g. PARTUUID= support) between the packer and update
	// target.
	gpt := ""
	if strings.Contains(rootdev.PARTUUID(), "-") {
		gpt = ",gpt"
	}
	featureStr := fmt.Sprintf("partuuid,updatehash%s,", gpt)
	http.HandleFunc("/update/features", func(w http.ResponseWriter, r *http.Request) {
		if !jsonRequested(r) {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			io.WriteString(w, featureStr)
			return
		}

		// This response contains all information that the
		// github.com/gokrazy/updater package needs to obtain from the
		// target device, in one single go.
		b, err := json.Marshal(struct {
			Features string         `json:"features"`
			EEPROM   *eepromVersion `json:"EEPROM"`
		}{
			Features: featureStr,
			EEPROM:   lastInstalledEepromVersion,
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(b)
	})
	inactiveRootPartition := rootdev.InactiveRootPartition()
	log.Printf("update handler will be called with inactiveRootPartition = %v", inactiveRootPartition)
	http.HandleFunc("/update/mbr", nonConcurrentUpdateHandler(rootdev.BlockDevice()))
	http.HandleFunc("/update/root", nonConcurrentUpdateHandler(rootdev.Partition(inactiveRootPartition)))
	http.HandleFunc("/update/switch", nonConcurrentSwitchHandler(inactiveRootPartition))
	http.HandleFunc("/update/testboot", nonConcurrentTestbootHandler(inactiveRootPartition))

	for _, extraUpdateHandler := range extraUpdateHandlers {
		http.HandleFunc(fmt.Sprintf("/update/device-specific/%s", extraUpdateHandler.name), nonConcurrentLimitedUpdateHandler(extraUpdateHandler.device, extraUpdateHandler.offset, extraUpdateHandler.maxLength))
	}

	// bakery updates only the boot partition, which would reset the active root
	// partition to 2.
	updateHandler := nonConcurrentUpdateHandler(rootdev.Partition(rootdev.Boot))
	http.HandleFunc("/update/boot", updateHandler)
	http.HandleFunc("/update/bootonly", func(w http.ResponseWriter, r *http.Request) {
		updateHandler(w, r)
		if err := switchRootPartition(rootdev.ActiveRootPartition()); err != nil {
			log.Printf("switching root partition to %d failed: %v", rootdev.ActiveRootPartition(), err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})
	http.HandleFunc("/reboot", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "expected a POST request", http.StatusBadRequest)
			return
		}

		signalDelay := defaultSignalDelay
		if s := r.FormValue("wait_per_signal"); s != "" {
			var err error
			signalDelay, err = time.ParseDuration(s)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		}

		rc := http.NewResponseController(w)
		start := time.Now()
		killSupervisedServicesAndUmountPerm(signalDelay)
		fmt.Fprintf(w, "All services killed in %s\n", time.Since(start))
		rc.Flush()

		log.Println("Rebooting")
		w.Write([]byte("Rebooting...\n"))
		rc.Flush()

		go func() {
			time.Sleep(time.Second) // give the http response some time to be sent
			if err := reboot(r.FormValue("kexec") != "off"); err != nil {
				log.Println("could not reboot:", err)
			}
		}()
	})
	http.HandleFunc("/poweroff", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "expected a POST request", http.StatusBadRequest)
			return
		}

		signalDelay := defaultSignalDelay
		if s := r.FormValue("wait_per_signal"); s != "" {
			var err error
			signalDelay, err = time.ParseDuration(s)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		}

		rc := http.NewResponseController(w)
		start := time.Now()
		killSupervisedServicesAndUmountPerm(signalDelay)
		fmt.Fprintf(w, "All services killed in %s\n", time.Since(start))
		rc.Flush()

		log.Println("Powering off")
		w.Write([]byte("Powering off...\n"))
		rc.Flush()

		go func() {
			time.Sleep(time.Second) // give the http response some time to be sent
			if err := unix.Reboot(unix.LINUX_REBOOT_CMD_POWER_OFF); err != nil {
				log.Println("could not power off:", err)
			}
		}()
	})
	http.HandleFunc("/uploadtemp/", uploadTemp)
	http.HandleFunc("/divert", divert)

	return nil
}

func killSupervisedServicesAndUmountPerm(signalDelay time.Duration) {
	killSupervisedServices(signalDelay)

	log.Println("Unmounting /perm")
	if err := syscall.Unmount("/perm", unix.MNT_FORCE); err != nil {
		log.Printf("unmounting /perm failed: %v", err)
	}
}

func uploadTemp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "expected a PUT request", http.StatusBadRequest)
		return
	}
	dest := strings.TrimPrefix(r.URL.Path, "/uploadtemp/")
	log.Printf("uploadtemp dest=%q", dest)
	if strings.Contains(dest, "/") {
		// relative path in the temp directory
		dest = filepath.Join(os.TempDir(), dest)
		if err := os.MkdirAll(filepath.Dir(dest), 0700); err != nil {
			log.Printf("updating %q failed: %v", dest, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// not relative, create a subdirectory underneath the temp directory
		tmpdir, err := os.MkdirTemp("", "uploadtemp")
		if err != nil {
			log.Printf("updating %q failed: %v", dest, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// tmpdir will intentionally not be deleted, as the caller of
		// /uploadtemp will use the uploaded file afterwards.
		dest = filepath.Join(tmpdir, dest)
	}

	if err := createFile(dest, r.Body); err != nil {
		log.Printf("updating %q failed: %v", dest, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(struct {
		Dest string `json:"dest"`
	}{
		Dest: dest,
	})
	if err != nil {
		log.Print(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(b); err != nil {
		log.Print(err)
	}
}

type divertRequest struct {
	Path      string   `json:"Path"`
	Diversion string   `json:"Diversion"`
	Flags     []string `json:"Flags"`
}

func divert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "expected a POST request", http.StatusBadRequest)
		return
	}

	var req divertRequest
	if r.Header.Get("Content-Type") == "application/json" {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "couldn't read request body", http.StatusBadRequest)
			return
		}
		err = json.Unmarshal(body, &req)
		if err != nil {
			http.Error(w, "couldn't unmarshal request body", http.StatusBadRequest)
			return
		}
	} else {
		req.Diversion = r.FormValue("diversion")
		req.Path = r.FormValue("path")
	}

	if req.Diversion == "" {
		http.Error(w, "diversion parameter is not set", http.StatusBadRequest)
		return
	}

	svc := findSvc(req.Path)
	newService := svc == nil
	if newService {
		log.Printf("adding new service in-memory to make diversion work")
		cmd := exec.Command(req.Path, req.Flags...)
		svc = NewService(cmd).s
	}

	// Ensure diversion binary is executable (/uploadtemp creates regular,
	// non-executable files).
	diversion := filepath.Join(os.TempDir(), req.Diversion)
	if err := os.Chmod(diversion, 0755); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	svc.setDiversion(diversion)
	cmd := svc.Cmd()
	cmd.Args = append([]string{cmd.Args[0]}, req.Flags...)
	svc.setCmd(cmd)

	if newService {
		services.Lock()
		services.S = append(services.S, svc)
		services.Unlock()
		go supervise(svc)
	}

	if err := restart(svc, syscall.SIGTERM); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
