---
title: "Access permanent data"
menuTitle: "Access permanent data"
weight: 70
---

## Create the filesystem

gokrazy provides a handy way to create the permanent data filesystem on the fourth partition of your gokrazy installation.
The [gokrazy/mkfs](https://github.com/gokrazy/mkfs) program will create the filesystem.
To actually access the permanent data partition from your own program, gokrazy will mount the partition under `/perm` directory during the startup.

You can add the `gokrazy/mkfs` program to your gokrazy instance:

```bash
gok add github.com/gokrazy/mkfs
```

…or, if you want to run it only once without otherwise including it in your
installation, you can use `gok run`:

```bash
git clone https://github.com/gokrazy/mkfs
cd mkfs
gok -i bakery run
```

## Permanent data in action

The Go program demonstrates the functionality of the permanent data mount:

```go
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"io/ioutil"
	"os"
)

const config = "/perm/my-example/config.json"

type Config struct {
	FilesToCreate int `json:"files_to_create"`
}

func main() {
	_, err := os.Stat(config)
	if err != nil {
		fsErr := &fs.ErrNotExist
		if !errors.As(err, fsErr) {
			panic(err)
		}

		content, err := json.Marshal(&Config{FilesToCreate: 4})
		if err != nil {
			panic(err)
		}

		if err = ioutil.WriteFile(config, content, 0600); err != nil {
			panic(err)
		}
	}

	content, err := ioutil.ReadFile(config)
	if err != nil {
		panic(err)
	}

	var c Config
	if err := json.Unmarshal(content, &c); err != nil {
		panic(err)
	}

	for i := 0; i < c.FilesToCreate; i++ {
		if err := ioutil.WriteFile(fmt.Sprintf("/perm/my-example/%d.txt", i), []byte("gokrazy rocks"), 0600); err != nil {
			panic(err)
		}
	}
}

```

## Manual inspection/modification

You can inspect and modify the data on the permanent data filesystem manually.
This can be handy if you need e.g. to pass a configuration file for your application.
To access the filesystem put the SD card into your PC/notebook. Your OS will likely mount the filesystem automatically.
Copy the file to the permanent data filesystem.

```bash
mkdir /path/to-mounted/filesystem/my-example
sudo cp config.json /path/to-mounted/filesystem/my-example
```

If you want to access files on the permanent data filesystem you may need the [sudo](https://en.wikipedia.org/wiki/Sudo) capability.
