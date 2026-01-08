package gokrazy

import (
	"testing"
	"time"
)

func TestWaitForSleep(t *testing.T) {
	start := time.Now()
	waitForSleep("10ms")
	elapsed := time.Since(start)

	if elapsed < 10*time.Millisecond {
		t.Errorf("expected sleep to last at least 10ms, got %v", elapsed)
	}
}


func TestWaitFor(t *testing.T) {
	// Test that it doesn't panic on known values
	// We can't really test the waiting behaviour easily without blocking,
	// but we can test "sleep=0s" which should return immediately.

	start := time.Now()
	WaitFor("sleep=1ms")
	elapsed := time.Since(start)
	if elapsed < 1*time.Millisecond {
		t.Errorf("WaitFor(sleep=1ms): expected at least 1ms, got %v", elapsed)
	}

	// Test "interface=lo" (localhost should be up)
	start = time.Now()
	WaitFor("interface=lo")
	// This usually returns instantly if lo is up.
	// We can't easily assert on time, but ensuring it doesn't hang forever or panic is good.
}
