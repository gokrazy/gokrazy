package gokrazy

import (
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/gokrazy/internal/fat"
	"github.com/gokrazy/internal/rootdev"
)

type eepromVersion struct {
	PieepromSHA256 string // pieeprom.sig
	VL805SHA256    string // vl805.sig
}

// filled by SuperviseServices()
var lastInstalledEepromVersion *eepromVersion

func readLastInstalledEepromVersion() (*eepromVersion, error) {
	f, err := os.OpenFile(rootdev.Partition(rootdev.Boot), os.O_RDONLY, 0600)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	rd, err := fat.NewReader(f)
	if err != nil {
		return nil, err
	}
	if _, err := rd.ModTime("/RECOVERY.000"); err != nil {
		return nil, fmt.Errorf("RECOVERY.000 not found, assuming update unsuccessful")
	}
	// Get all extents before we start seeking, which confuses the fat.Reader.
	offsetE, lengthE, err := rd.Extents("/pieeprom.sig")
	if err != nil {
		return nil, err
	}
	offsetV, lengthV, err := rd.Extents("/vl805.sig")
	if err != nil {
		return nil, err
	}
	result := &eepromVersion{}

	{
		if _, err := f.Seek(offsetE, io.SeekStart); err != nil {
			return nil, err
		}
		b := make([]byte, lengthE)
		if _, err := f.Read(b); err != nil {
			return nil, err
		}
		result.PieepromSHA256 = strings.TrimSpace(string(b))
	}

	{
		if _, err := f.Seek(offsetV, io.SeekStart); err != nil {
			return nil, err
		}
		b := make([]byte, lengthV)
		if _, err := f.Read(b); err != nil {
			return nil, err
		}
		result.VL805SHA256 = strings.TrimSpace(string(b))
	}

	return result, nil
}
