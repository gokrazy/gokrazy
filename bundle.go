package gokrazy

//go:generate sh -c "go run goembed.go -package bundled -var assets assets/header.tmpl assets/footer.tmpl assets/overview.tmpl assets/status.tmpl assets/favicon.ico > internal/bundled/GENERATED_bundled.go"
