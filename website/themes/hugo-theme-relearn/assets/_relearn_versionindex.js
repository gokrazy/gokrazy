{{- $versions := partialCached "_relearn/siteVersions.gotmpl" . -}}
var relearn_versionindex = {{ $versions | jsonify (dict "indent" "  ") }}
