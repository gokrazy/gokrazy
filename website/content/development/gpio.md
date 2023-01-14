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

periph.io supports the Raspberry Pi 3 and Raspberry Pi 4, starting with version
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

	"periph.io/x/periph/conn/gpio"
	"periph.io/x/periph/host"
	"periph.io/x/periph/host/rpi"
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
	return nil
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
