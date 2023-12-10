---
title: "Controlling a GPIO input/output pin"
menuTitle: "Input/output via GPIO pins"
weight: 20
aliases:
  - /userguide/gpio/
---

In this guide, we are using [periph.io](https://periph.io/), a library for
peripheral I/O in Go, to set one of the Raspberry Pi’s General Purpose I/O
(GPIO) pins to a logical high (3.3V) or low (0V) signal.

periph.io supports the Raspberry Pi 3, Raspberry Pi Zero 2W and Raspberry Pi 4, starting with version
`v3.6.4`.

## Connect GPIO pins based on pinout

To verify the code is doing what we expect, let’s connect a multimeter as per
[pinout.xyz](https://pinout.xyz)’s pinout:

![](/img/raspberry-pi-pinout.png)

- pin number 18 (signal `BCM24`, labeled `24` in the pinout above)
- pin number 20 (signal `GND`)

We need to set the multimeter to “Voltage measurement, DC (direct current)”.

## Setting an output pin signal

To set the pin high and low, alternatingly, with a 5 second frequency, we will
be using the `hello-gpio` program, which is a slightly modified version of the
example at [periph.io/device/led](https://periph.io/device/led/):

```go
package main

import (
	"log"
	"time"

	"periph.io/x/conn/v3/gpio"
	host "periph.io/x/host/v3"
	"periph.io/x/host/v3/rpi"
)

func doGPIO() error {
	log.Printf("Loading periph.io drivers")
	// Load periph.io drivers:
	if _, err := host.Init(); err != nil {
		return err
	}
	log.Printf("Toggling GPIO forever")
	t := time.NewTicker(5 * time.Second)
	for l := gpio.Low; ; l = !l {
		log.Printf("setting GPIO pin number 18 (signal BCM24) to %v", l)
		// Lookup a pin by its location on the board:
		if err := rpi.P1_18.Out(l); err != nil {
			return err
		}
		<-t.C
	}
}

func main() {
	if err := doGPIO(); err != nil {
		log.Fatal(err)
	}
}
```

You have two options to run this program on your Raspberry Pi:

1. Use `gok run` to temporarily run this program on a running gokrazy instance.
2. Use `gok add` to permanently include this program in your gokrazy instance:

```bash
# From the hello-gpio directory, run:
gok add .
# Then, deploy as usual:
gok update
```

At this point, we should be able to see the high/low signal on the multimeter,
alternating between 3.3V (high) and 0V (low) every 5 seconds:

<a href="/img/2020-06-15-gpio.jpg"><img src="/img/2020-06-15-gpio.thumb.jpg" srcset="/img/2020-06-15-gpio.thumb.2x.jpg 2x,/img/2020-06-15-gpio.thumb.3x.jpg 3x" width="700" style="border: 1px solid grey; margin-bottom: 2em; margin-top: 1em"></a>

## Setting up an input pin

To setup a Pin as an input and to act on change to High level, such as a button,
we must poll the Pin periodically because [periph.io’s](http://periph.io/) edge
detection, which examples like the
[periph.io/device/button example](https://periph.io/device/button/) rely on,
[is not available on gokrazy](https://github.com/gokrazy/gokrazy/issues/233).

The below example configures a single Pin for Input and uses Go channels to
signal level changes that can be acted on. Keep in mind that shortening the
polling interval will increase CPU usage.

```go
package main

import (
	"log"
	"time"

	"periph.io/x/conn/v3/gpio"
	"periph.io/x/conn/v3/gpio/gpioreg"
	host "periph.io/x/host/v3"
)

type pinLevelMessage struct {
	State gpio.Level
	Reset gpio.Level
}

func setupGPIOInput(pinName string, levelChan chan pinLevelMessage) (gpio.PinIO, error) {
	log.Printf("Loading periph.io drivers")
	if _, err := host.Init(); err != nil {
		return nil, err
	}

	// Find Pin by name
	p := gpioreg.ByName(pinName)

	// Configure Pin for input, configure pull as needed
	// Edge mode is currently not supported
	if err := p.In(gpio.PullNoChange, gpio.NoEdge); err != nil {
		return nil, err
	}

	// Setup Input signalling
	go func() {
		lastLevel := p.Read()
		// How often to poll levels, 100-150ms is fairly responsive unless
		// button presses are very fast.
		// Shortening the polling interval <100ms significantly increases
		// CPU load.
		for range time.Tick(100 * time.Millisecond) {
			currentLevel := p.Read()
			log.Printf("level: %v", currentLevel)

			if currentLevel != lastLevel {
				levelChan <- pinLevelMessage{State: currentLevel, Reset: !currentLevel}
				lastLevel = currentLevel
			}
		}
	}()
	return p, nil
}

func main() {
	// Channel for communicating Pin levels
	levelChan := make(chan pinLevelMessage)

	p, err := setupGPIOInput("GPIO4", levelChan)
	if err != nil {
		log.Fatal(err)
	}

	// Main loop, act on level changes
	for {
		select {
		case msg := <-levelChan:
			if msg.State {
				log.Printf("Pin %s is High, processing high state tasks", p.Name())
				// Process high state tasks
			} else if msg.Reset {
				log.Printf("Pin %s is Low, resetting to wait for high state", p.Name())
				// Process resetting logic, if any
			}
		default:
			// Any other ongoing tasks
		}
	}
}

```
