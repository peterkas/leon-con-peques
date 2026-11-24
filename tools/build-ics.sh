#!/bin/sh
# Regenera ics/<id>.ics a partir de data.js usando JavaScriptCore (incluido en macOS).
set -eu
cd "$(dirname "$0")/.."
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc

OUT=$(mktemp)
trap 'rm -f "$OUT"' EXIT
"$JSC" data.js tools/ics.js > "$OUT"
if grep -q '^Exception' "$OUT"; then cat "$OUT" >&2; exit 1; fi

rm -rf ics && mkdir ics
# Reparte la salida en ficheros; jsc añade un salto de línea extra tras cada print.
awk '
  /^=====FILE / { if (f) close(f); f = substr($0, 11); next }
  f && $0 != "" { printf "%s\n", $0 > f }
' "$OUT"
echo "ics: $(ls ics | wc -l | tr -d ' ') ficheros generados"
