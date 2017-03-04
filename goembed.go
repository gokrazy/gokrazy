// copied from https://github.com/dsymonds/goembed/ with pull requests applied

// +build ignore

// goembed generates a Go source file from an input file.
package main

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"text/template"
	"unicode/utf8"
)

var (
	packageFlag = flag.String("package", "", "Go package name")
	varFlag     = flag.String("var", "", "Go var name")
	gzipFlag    = flag.Bool("gzip", false, "Whether to gzip contents")
)

func main() {
	flag.Parse()

	fmt.Printf("package %s\n\n", *packageFlag)

	if *gzipFlag {
		err := gzipPrologue.Execute(os.Stdout, map[string]interface{}{
			"Args":    flag.Args(),
			"VarName": *varFlag,
		})
		if err != nil {
			log.Fatal(err)
		}
	}

	if flag.NArg() > 0 {
		fmt.Println("// Table of contents")
		fmt.Printf("var %v = map[string][]byte{\n", *varFlag)
		for i, filename := range flag.Args() {
			fmt.Printf("\t%#v: %s_%d,\n", filename, *varFlag, i)
		}
		fmt.Println("}")

		// Using a separate variable for each []byte, instead of
		// combining them into a single map literal, enables a storage
		// optimization: the compiler places the data directly in the
		// program's noptrdata section instead of the heap.
		for i, filename := range flag.Args() {
			if err := oneVar(fmt.Sprintf("%s_%d", *varFlag, i), filename); err != nil {
				log.Fatal(err)
			}
		}
	} else {
		if err := oneVarReader(*varFlag, os.Stdin); err != nil {
			log.Fatal(err)
		}
	}
}

func oneVar(varName, filename string) error {
	f, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer f.Close()
	return oneVarReader(varName, f)
}

func oneVarReader(varName string, r io.Reader) error {
	// Generate []byte(<big string constant>) instead of []byte{<list of byte values>}.
	// The latter causes a memory explosion in the compiler (60 MB of input chews over 9 GB RAM).
	// Doing a string conversion avoids some of that, but incurs a slight startup cost.
	if !*gzipFlag {
		fmt.Printf(`var %s = []byte("`, varName)
	} else {
		var buf bytes.Buffer
		gzw, _ := gzip.NewWriterLevel(&buf, gzip.BestCompression)
		if _, err := io.Copy(gzw, r); err != nil {
			return err
		}
		if err := gzw.Close(); err != nil {
			return err
		}
		fmt.Printf("var %s []byte // set in init\n\n", varName)
		fmt.Printf(`var %s_gzip = []byte("`, varName)
		r = &buf
	}

	bufw := bufio.NewWriter(os.Stdout)
	if _, err := io.Copy(&writer{w: bufw}, r); err != nil {
		return err
	}
	if err := bufw.Flush(); err != nil {
		return err
	}
	fmt.Println(`")`)
	return nil
}

type writer struct {
	w io.Writer
}

func (w *writer) Write(data []byte) (n int, err error) {
	n = len(data)

	for err == nil && len(data) > 0 {
		// https://golang.org/ref/spec#String_literals: "Within the quotes, any
		// character may appear except newline and unescaped double quote. The
		// text between the quotes forms the value of the literal, with backslash
		// escapes interpreted as they are in rune literals […]."
		switch b := data[0]; b {
		case '\\':
			_, err = w.w.Write([]byte(`\\`))
		case '"':
			_, err = w.w.Write([]byte(`\"`))
		case '\n':
			_, err = w.w.Write([]byte(`\n`))

		case '\x00':
			// https://golang.org/ref/spec#Source_code_representation: "Implementation
			// restriction: For compatibility with other tools, a compiler may
			// disallow the NUL character (U+0000) in the source text."
			_, err = w.w.Write([]byte(`\x00`))

		default:
			// https://golang.org/ref/spec#Source_code_representation: "Implementation
			// restriction: […] A byte order mark may be disallowed anywhere else in
			// the source."
			const byteOrderMark = '\uFEFF'

			if r, size := utf8.DecodeRune(data); r != utf8.RuneError && r != byteOrderMark {
				_, err = w.w.Write(data[:size])
				data = data[size:]
				continue
			}

			_, err = fmt.Fprintf(w.w, `\x%02x`, b)
		}
		data = data[1:]
	}

	return n - len(data), err
}

var gzipPrologue = template.Must(template.New("").Parse(`
import (
	"bytes"
	"compress/gzip"
	"io/ioutil"
)

func init() {
	var (
		r *gzip.Reader
		err error
	)

{{ if gt (len .Args) 0 }}
{{ range $idx, $var := .Args }}
{{ $n := printf "%s_%d" $.VarName $idx }}
	r, err = gzip.NewReader(bytes.NewReader({{ $n }}_gzip))
	if err != nil {
		panic(err)
	}
	{{ $n }}, err = ioutil.ReadAll(r)
	r.Close()
	if err != nil {
		panic(err)
	}
{{ end }}
{{ else }}
	r, err = gzip.NewReader(bytes.NewReader({{ .VarName }}_gzip))
	if err != nil {
		panic(err)
	}
	{{ .VarName }}, err = ioutil.ReadAll(r)
	r.Close()
	if err != nil {
		panic(err)
	}
{{ end }}
}
`))
