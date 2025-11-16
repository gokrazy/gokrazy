{{/* the following check avoids to print out content of headless bundles if called from nestedContent.gotmpl */}}
{{- if .RelPermalink -}}
# {{ .Title }}

{{ strings.TrimLeft "\n\r\t " .RawContent | safeHTML }}
{{- end }}