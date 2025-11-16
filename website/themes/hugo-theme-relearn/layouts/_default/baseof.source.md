{{/* the following check avoids to print out content of headless bundles if called from nestedContent.gotmpl */}}
{{- with and .File .File.Filename -}}
{{ readFile . | safeHTML }}
{{- end }}