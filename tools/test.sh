#!/bin/sh
# Pruebas locales: valida data.js, genera ics/ y pinta la página con un mini-DOM.
#   ./tools/test.sh               (hoy)
#   ./tools/test.sh 2026-12-05    (simulando otra fecha)
set -eu
cd "$(dirname "$0")/.."
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
if [ -x "$JSC" ]; then RUN="$JSC"; else RUN="node tools/node-run.js"; fi
DAY="${1:-$(date +%F)}"

./tools/build-ics.sh

PAGE=$(mktemp)
DEFS=$(mktemp)
trap 'rm -f "$PAGE" "$DEFS"' EXIT
# Script principal de index.html (el bloque <script> sin src)
sed -n '/^<script>$/,/^<\/script>$/p' index.html | sed '1d;$d' > "$PAGE"
echo "var FAKE_TODAY='$DAY';" > "$DEFS"
OUT=$($RUN "$DEFS" tools/smoke/dom.js data.js lib.js "$PAGE" tools/smoke/report.js 2>&1) || { echo "$OUT" >&2; exit 1; }
echo "$OUT"
if echo "$OUT" | grep -q '^Exception'; then exit 1; fi
