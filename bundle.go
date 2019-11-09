package gokrazy

//go:generate sh -c "go run goembed.go -package bundled -var assets assets/header.tmpl assets/footer.tmpl assets/overview.tmpl assets/status.tmpl assets/favicon.ico assets/bootstrap-3.3.7.min.css assets/bootstrap-table-1.11.0.min.css assets/bootstrap-table-1.11.0.min.js assets/jquery-3.1.1.min.js > internal/bundled/GENERATED_bundled.go"
