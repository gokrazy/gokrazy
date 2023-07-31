---
layout: default
title: Showcase
aliases:
  - /showcase.html
  - /showcase/
weight: 1
---

## Written for gokrazy

The following third-party programs specifically target gokrazy.

To get your program listed here, just <a
href="https://github.com/gokrazy/gokrazy">send us a pull request</a>.

### scan2drive

[**scan2drive**](https://github.com/stapelberg/scan2drive) is an appliance (with
a web interface) that scans paper documents 📄 from a scanner 🖨️ as PDFs to
Google Drive for full-text search.

### router7

[**router7**](https://github.com/rtr7/router7) is a small home internet router
completely written in Go.

### hmgo

[**hmgo**](https://github.com/stapelberg/hmgo) is a minimal HomeMatic house
automation central control unit replacement (specific to <a
href="https://github.com/stapelberg">stapelberg</a>’s home network).

### beatbox

[**beatbox**](https://github.com/anisse/beatbox) is a Raspberry Pi 3-based toy
that combines a Mir:ror and NFC figurines for playing music stored on the device
or directly from Spotify.

### consrv

[**consrv**](https://github.com/mdlayher/consrv) is a Raspberry Pi 4-based
appliance that provides a basic SSH to serial console bridge for accessing
remote devices.

### krazyotelcol
[**krazyotelcol**](https://github.com/svrnm/krazyotelcol) is an appliance 
running the [OpenTelemetry 
Collector](https://github.com/open-telemetry/opentelemetry-collector), a 
vendor-agnostic implementation on how to receive, process and export telemetry
data.

### Restic's rest-server

[**Rest Server**](https://github.com/restic/rest-server) is a high performance
HTTP server that implements restic's REST backend API. Running it requires some
setup and other configurations which are available in
[this blog post](https://dcpri.me/2022/08/31/restic-rest-server-gokrazy/).

### waiw

[**waiw**](https://github.com/BrunoTeixeira1996/waiw) is a Go webserver to store 
movies/series/animes ratings and comments. Running it requires some setup but the
README describes every step to make it work.

## Successfully tested

The following third-party programs have been successfully used with gokrazy
but might require additional setup:

### Prometheus

[**Prometheus**](https://prometheus.io/) is a monitoring and alerting system
built on a time series database.

The [**Prometheus node exporter**](https://github.com/prometheus/node_exporter)
exposes various metrics of the system on which it is running for use with the <a
href="https://prometheus.io">prometheus</a> monitoring and alerting system.

The [**Prometheus blackbox
exporter**](https://github.com/prometheus/blackbox_exporter) allows blackbox
probing of endpoints over HTTP, HTTPS, DNS, TCP and ICMP for use with the <a
href="https://prometheus.io">prometheus</a> monitoring and alerting system.

### Grafana

[**Grafana**](https://grafana.com/) is an open platform for beautiful analytics
and monitoring.

### MinIO

[**MinIO**](https://min.io/) is a high performance, S3-compatible, cloud native
object storage service.

See also [Available packages → MinIO](/packages/minio/).

## No Go software for your idea?

You can prototype your idea by temporarily using existing software to close the
gap. See <a href="/prototyping/">Prototyping</a>.
