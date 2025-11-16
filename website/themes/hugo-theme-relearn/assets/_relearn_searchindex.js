{{- $pages := slice }}
{{- range .Site.Pages }}
  {{- if partial "_relearn/pageIsSpecial.gotmpl" . }}
  {{- /* This wants to be partialCached but can't since Hugo 0.146.7 }}
  {{- else if and .Title .RelPermalink (or (ne .Site.Params.disableSearchHiddenPages true) (not (partialCached "_relearn/pageIsHiddenSelfOrAncestor.gotmpl" (dict "page" . "to" .Site.Home) .Path .Site.Home.Path) ) ) */}}
  {{- else if and .Title .RelPermalink (or (ne .Site.Params.disableSearchHiddenPages true) (not (partial "_relearn/pageIsHiddenSelfOrAncestor.gotmpl" (dict "page" . "to" .Site.Home) .Path .Site.Home.Path) ) ) }}
    {{- $tags := slice }}
    {{- range .GetTerms "tags" }}
      {{- $tags = $tags | append (partial "title.gotmpl" (dict "page" .Page "linkTitle" true) | plainify) }}
    {{- end }}
    {{- $pages = $pages | append (dict
      "uri" (partial "permalink.gotmpl" (dict "to" .))
      "title" (partial "title.gotmpl" (dict "page" .) | plainify)
      "tags" $tags
      "breadcrumb" (trim (partial "breadcrumbs.html" (dict "page" . "dirOnly" true) | plainify | htmlUnescape) "\n\r\t ")
      "description" (trim (or .Description .Summary | plainify | htmlUnescape) "\n\r\t " )
      "content" (trim (.Plain | htmlUnescape) "\n\r\t ")
    ) }}
  {{- end }}
{{- end -}}
var relearn_searchindex = {{ $pages | jsonify (dict "indent" "  ") }}
