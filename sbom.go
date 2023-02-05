package gokrazy

import (
	"encoding/json"
	"os"
)

func ReadSBOM() (*json.RawMessage, string, error) {
	b, err := os.ReadFile("/etc/gokrazy/sbom.json")
	if err != nil {
		return nil, "", err
	}

	type SBOMWithHash struct {
		SBOMHash string           `json:"sbom_hash"`
		SBOM     *json.RawMessage `json:"sbom"`
	}
	var sh SBOMWithHash
	if err := json.Unmarshal(b, &sh); err != nil {
		return nil, "", err
	}
	return sh.SBOM, sh.SBOMHash, nil
}
