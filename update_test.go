package gokrazy

import (
	"bytes"
	"regexp"
	"strings"
	"testing"
)

// As written by gok: the kernel command line padded with 64 spaces, with no
// trailing newline, in cmdline.txt and in the systemd-boot entry.
const testCmdline = "console=tty1 root=PARTUUID=60c24cc1-f3f9-427a-8199-4f9f2cab0001/PARTNROFF=1 ro init=/gokrazy/init rootwait panic=10 oops=panic"

var (
	testPadded      = testCmdline + strings.Repeat(" ", 64)
	testLoaderEntry = "title gokrazy\nlinux /vmlinuz\noptions " + testPadded
)

func rewrite(t *testing.T, b string, replace func([]byte) []byte) string {
	t.Helper()
	rep, err := rewriteCmdline([]byte(b), replace)
	if err != nil {
		t.Fatal(err)
	}
	if len(rep) != len(b) {
		t.Fatalf("length changed from %d to %d: %q", len(b), len(rep), rep)
	}
	return string(rep)
}

func testboot(b []byte) []byte { return addCmdlineFlag(b, "gokrazy.try_boot_inactive=1") }

func TestEnableTestbootCmdlineTxt(t *testing.T) {
	got := rewrite(t, testPadded, testboot)
	if want := testCmdline + " gokrazy.try_boot_inactive=1"; strings.TrimRight(got, " ") != want {
		t.Fatalf("got %q, want %q", got, want)
	}
	// Enabling it twice doesn't add the flag twice.
	if again := rewrite(t, got, testboot); again != got {
		t.Fatalf("flag added twice: %q", again)
	}
}

func TestEnableTestbootLoaderEntry(t *testing.T) {
	got := rewrite(t, testLoaderEntry, testboot)
	lines := strings.Split(got, "\n")
	// systemd-boot reads the kernel's file name from the linux line, so only
	// the options line may change.
	if lines[0] != "title gokrazy" || lines[1] != "linux /vmlinuz" {
		t.Fatalf("title or linux line changed: %q", got)
	}
	if want := "options " + testCmdline + " gokrazy.try_boot_inactive=1"; strings.TrimRight(lines[2], " ") != want {
		t.Fatalf("options line %q, want %q", lines[2], want)
	}
}

func TestSwitchOnBootAfterTestboot(t *testing.T) {
	// What maybeSwitchToInactive does on the test boot: the replacement is
	// shorter, so the command line is padded back to length.
	for _, b := range []string{testPadded, testLoaderEntry} {
		got := rewrite(t, rewrite(t, b, testboot), func(b []byte) []byte {
			return bytes.ReplaceAll(b, []byte("gokrazy.try_boot_inactive=1"), []byte("gokrazy.switch_on_boot=1"))
		})
		if !strings.Contains(got, testCmdline+" gokrazy.switch_on_boot=1") || strings.Contains(got, "try_boot") {
			t.Fatalf("got %q", got)
		}
	}
}

func TestSwitchRootPartition(t *testing.T) {
	re := regexp.MustCompile(`root=[^ ]+`)
	got := rewrite(t, testLoaderEntry, func(b []byte) []byte {
		return re.ReplaceAllLiteral(b, []byte("root=/dev/mmcblk0p3"))
	})
	if !strings.HasPrefix(got, "title gokrazy\nlinux /vmlinuz\noptions console=tty1 root=/dev/mmcblk0p3 ro ") {
		t.Fatalf("got %q", got)
	}
}

func TestRewriteCmdlineWithTrailingNewline(t *testing.T) {
	// Older images: a trailing newline and no padding. Shrinking pads before
	// the newline; growing is refused rather than written past the file’s end.
	old := "console=tty1 root=/dev/mmcblk0p2 rootwait\n"
	got := rewrite(t, old, func(b []byte) []byte { return bytes.Replace(b, []byte("rootwait"), []byte("rw"), 1) })
	if got != "console=tty1 root=/dev/mmcblk0p2 rw      \n" {
		t.Fatalf("got %q", got)
	}
	if _, err := rewriteCmdline([]byte(old), testboot); err == nil {
		t.Fatal("a command line without padding grew in place")
	}
}
