package gokrazy

import "sync"

type statusCode int32

const (
	Stopped  statusCode = iota // Process not running
	Running                    // Process was started and is very likely still running
	Stopping                   // Process is being stopped, but it might still be running
)

type processState struct {
	lock         sync.Mutex
	statusChange *sync.Cond
	status       statusCode
}

func NewProcessState() *processState {
	p := &processState{}
	p.statusChange = sync.NewCond(&p.lock)

	return p
}

func (p *processState) Set(status statusCode) {
	p.lock.Lock()
	defer p.lock.Unlock()

	if p.status == Stopped && status == Stopping {
		// Not a valid state transition. Ignore it.
		return
	}

	p.status = status
	p.statusChange.Broadcast()
}

func (p *processState) WaitTill(status statusCode) {
	p.lock.Lock()
	defer p.lock.Unlock()

	for p.status != status {
		p.statusChange.Wait()
	}

	return
}
