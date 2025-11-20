package gokrazy

import (
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gokrazy/internal/fat"
	"github.com/gokrazy/internal/rootdev"
)

type eepromVersion struct {
	PieepromSHA256 string // pieeprom.sig
	VL805SHA256    string // vl805.sig
	FirmwareDate   string // build timestamp of running firmware (yyyy-mm-dd)
}

// filled by SuperviseServices()
var lastInstalledEepromVersion *eepromVersion

func readEEPROMVersions(model string) (*eepromVersion, error) {
	var versions eepromVersion
	if err := readRunningEepromVersion(&versions); err != nil {
		log.Printf("(not critical) could not read running EEPROM firmware version: %v", err)
	}
	if err := readLastInstalledEepromVersion(&versions, model); err != nil {
		return nil, err
	}
	return &versions, nil
}

func readRunningEepromVersion(versions *eepromVersion) error {
	b, err := os.ReadFile("/sys/firmware/devicetree/base/chosen/bootloader/build-timestamp")
	if err != nil {
		return err
	}
	if len(b) < 4 {
		return fmt.Errorf("build-timestamp file unexpectedly < 4 bytes long: %x (%d)", b, len(b))
	}
	buildUnix := binary.BigEndian.Uint32(b)
	buildTime := time.Unix(int64(buildUnix), 0)
	versions.FirmwareDate = buildTime.Format("2006-01-02")
	return nil
}

func readLastInstalledEepromVersion(versions *eepromVersion, model string) error {
	f, err := os.OpenFile(rootdev.Partition(rootdev.Boot), os.O_RDONLY, 0600)
	if err != nil {
		return err
	}
	defer f.Close()

	rd, err := fat.NewReader(f)
	if err != nil {
		return err
	}
	if strings.HasPrefix(model, "Raspberry Pi 4 ") {
		// Only the Pi 4 firmware renames recovery.bin to RECOVERY.000,
		// the Pi 5 uses the timestamp from the .sig files to run/skip
		// an update, but no files are renamed.
		if _, err := rd.ModTime("/RECOVERY.000"); err != nil {
			return fmt.Errorf("RECOVERY.000 not found, assuming update unsuccessful")
		}
	}
	// Get all extents before we start seeking, which confuses the fat.Reader.
	offsetE, lengthE, err := rd.Extents("/pieeprom.sig")
	if err != nil {
		return err
	}
	offsetV, lengthV, err := rd.Extents("/vl805.sig")
	if err != nil {
		if strings.HasPrefix(model, "Raspberry Pi 4 ") {
			return err
		}
	}

	{
		if _, err := f.Seek(offsetE, io.SeekStart); err != nil {
			return err
		}
		b := make([]byte, lengthE)
		if _, err := f.Read(b); err != nil {
			return err
		}
		versions.PieepromSHA256 = strings.TrimSpace(string(b))
	}

	if offsetV > 0 && lengthV > 0 {
		if _, err := f.Seek(offsetV, io.SeekStart); err != nil {
			return err
		}
		b := make([]byte, lengthV)
		if _, err := f.Read(b); err != nil {
			return err
		}
		versions.VL805SHA256 = strings.TrimSpace(string(b))
	}

	return nil
}
