package gokrazy

import (
	"os/exec"
	"reflect"
	"testing"
)

func TestSetWaitFor(t *testing.T) {
	cmd := exec.Command("true")
	s := NewService(cmd)

	// Check initial state
	if len(s.s.waitFor) != 0 {
		t.Errorf("expected initial waitFor to be empty, got %v", s.s.waitFor)
	}

	// Set waitFor
	waitItems := []string{"clock", "net-online"}
	s.SetWaitFor(waitItems)

	if !reflect.DeepEqual(s.s.waitFor, waitItems) {
		t.Errorf("expected waitFor to be %v, got %v", waitItems, s.s.waitFor)
	}
}
