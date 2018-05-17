package gokrazy

import (
	"crypto/sha256"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"sync"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

	"github.com/gokrazy/internal/fat"
)

var rootRe = regexp.MustCompile(`root=/dev/mmcblk0p([2-3])`)

func switchRootPartition(newRootPartition string) error {
	f, err := os.OpenFile("/dev/mmcblk0p1", os.O_RDWR, 0600)
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

	rep := rootRe.ReplaceAllLiteral(b, []byte("root=/dev/mmcblk0p"+newRootPartition))
	if _, err := f.Write(rep); err != nil {
		return err
	}

	return f.Close()
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
	return f.Close()
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

		hash := sha256.New()
		if err := streamRequestTo(dest, io.TeeReader(r.Body, hash)); err != nil {
			log.Printf("updating %q failed: %v", dest, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Fprintf(w, "%x", hash.Sum(nil))
	}
}

func nonConcurrentSwitchHandler(newRootPartition string) func(http.ResponseWriter, *http.Request) {
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

func initUpdate() error {
	cmdline, err := ioutil.ReadFile("/proc/cmdline")
	if err != nil {
		return err
	}

	matches := rootRe.FindStringSubmatch(string(cmdline))
	if matches == nil {
		return fmt.Errorf("identify 2/3 partition: kernel command line %q did not match %v", string(cmdline), rootRe)
	}

	rootPartition := matches[1]
	var inactiveRootPartition string
	switch rootPartition {
	case "2":
		inactiveRootPartition = "3"
	case "3":
		inactiveRootPartition = "2"
	default:
		return fmt.Errorf("root partition %q (from %q) is unexpectedly neither 2 nor 3", rootPartition, matches[0])
	}

	http.HandleFunc("/update/boot", nonConcurrentUpdateHandler("/dev/mmcblk0p1"))
	http.HandleFunc("/update/root", nonConcurrentUpdateHandler("/dev/mmcblk0p"+inactiveRootPartition))
	http.HandleFunc("/update/switch", nonConcurrentSwitchHandler(inactiveRootPartition))
	// bakery updates only the boot partition, which would reset the active root
	// partition to 2.
	updateHandler := nonConcurrentUpdateHandler("/dev/mmcblk0p1")
	http.HandleFunc("/update/bootonly", func(w http.ResponseWriter, r *http.Request) {
		updateHandler(w, r)
		if err := switchRootPartition(rootPartition); err != nil {
			log.Printf("switching root partition to %q failed: %v", rootPartition, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})
	http.HandleFunc("/reboot", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "expected a POST request", http.StatusBadRequest)
			return
		}

		// TODO: implement a shutdown sequence, i.e. kill + timeout + term; unmount, then force-unmount?

		if err := syscall.Unmount("/perm", unix.MNT_FORCE); err != nil {
			log.Printf("unmounting /perm failed: %v", err)
		}

		go func() {
			time.Sleep(1 * time.Second) // give the HTTP response some time to be sent
			if err := unix.Reboot(unix.LINUX_REBOOT_CMD_RESTART); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}()
	})

	return nil
}
