package main

import (
	"testing"

	"github.com/gokrazy/gokrazy/integration/integrationtest"
)

func TestMBRBoot(t *testing.T) {
	integrationtest.Run(t, "github.com/gokrazy/mbrboot", "qemumbrtesting", nil)
}
