package gokrazy

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"sync"
	"syscall"
	"time"

	"golang.org/x/sys/unix"

	"github.com/gokrazy/internal/fat"
	"github.com/gokrazy/internal/rootdev"
)

var rootRe = regexp.MustCompile(`root=[^ ]+`)

func switchRootPartition(newRootPartition int) error {
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

	rep := rootRe.ReplaceAllLiteral(b, []byte("root="+rootdev.PartitionCmdline(newRootPartition)))
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
	if err := f.Sync(); err != nil {
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

func initUpdate() error {
	http.HandleFunc("/update/mbr", nonConcurrentUpdateHandler(rootdev.BlockDevice()))
	http.HandleFunc("/update/root", nonConcurrentUpdateHandler(rootdev.Partition(rootdev.InactiveRootPartition())))
	http.HandleFunc("/update/switch", nonConcurrentSwitchHandler(rootdev.InactiveRootPartition()))
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

	return nil
}
