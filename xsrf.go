package gokrazy

import (
	cryptorand "crypto/rand"
	"encoding/binary"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
)

func xsrfTokenFromCookies(cookies []*http.Cookie) int32 {
	for _, c := range cookies {
		if c.Name != "gokrazy_xsrf" {
			continue
		}
		if i, err := strconv.ParseInt(c.Value, 0, 32); err == nil {
			return int32(i)
		}
	}
	return 0
}

// lazyXsrf is a lazily initialized source of random numbers for generating XSRF
// tokens. It is lazily initialized to not block early boot when reading
// cryptographically strong random bytes to seed the RNG.
var lazyXsrf struct {
	once sync.Once
	rnd  *rand.Rand
}

func xsrfToken() int32 {
	lazyXsrf.once.Do(func() {
		var buf [8]byte
		if _, err := cryptorand.Read(buf[:]); err != nil {
			log.Fatalf("lazyXsrf: cryptorand.Read: %v", err)
		}
		lazyXsrf.rnd = rand.New(rand.NewSource(int64(binary.BigEndian.Uint64(buf[:]))))
	})
	return lazyXsrf.rnd.Int31()
}
