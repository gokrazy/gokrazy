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
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

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

func streamRequestTo(path string, r io.Reader) error {
	f, err := os.OpenFile(path, os.O_WRONLY, 0600)
	if err != nil {
		return err
	}
	defer f.Close()
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
		if err := streamRequestTo(dest, io.TeeReader(r.Body, hash)); err != nil {
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

func initUpdate() error {
	// The /update/features handler is used for negotiation of individual
	// feature support (e.g. PARTUUID= support) between the packer and update
	// target.
	gpt := ""
	if strings.Contains(rootdev.PARTUUID(), "-") {
		gpt = ",gpt"
	}
	http.HandleFunc("/update/features", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "partuuid,updatehash%s,", gpt)
	})
	http.HandleFunc("/update/mbr", nonConcurrentUpdateHandler(rootdev.BlockDevice()))
	http.HandleFunc("/update/root", nonConcurrentUpdateHandler(rootdev.Partition(rootdev.InactiveRootPartition())))
	http.HandleFunc("/update/switch", nonConcurrentSwitchHandler(rootdev.InactiveRootPartition()))
	http.HandleFunc("/update/testboot", nonConcurrentTestbootHandler(rootdev.InactiveRootPartition()))
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

		go func() {
			killSupervisedServices()

			// give the HTTP response some time to be sent; allow processes some time to terminate
			time.Sleep(1 * time.Second)

			if err := syscall.Unmount("/perm", unix.MNT_FORCE); err != nil {
				log.Printf("unmounting /perm failed: %v", err)
			}

			if err := reboot(); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}()
	})
	http.HandleFunc("/uploadtemp/", uploadTemp)
	http.HandleFunc("/divert", divert)

	return nil
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

func divert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "expected a POST request", http.StatusBadRequest)
		return
	}

	diversion := r.FormValue("diversion")
	if diversion == "" {
		http.Error(w, "diversion parameter is not set", http.StatusBadRequest)
		return
	}

	path := r.FormValue("path")
	svc := findSvc(path)
	if svc == nil {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}

	// Ensure diversion binary is executable (/uploadtemp creates regular,
	// non-executable files).
	diversion = filepath.Join(os.TempDir(), diversion)
	if err := os.Chmod(diversion, 0755); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	svc.setDiversion(diversion)

	if err := restart(svc, syscall.SIGTERM); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
