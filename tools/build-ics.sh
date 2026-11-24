#!/bin/sh
# Valida data.js y genera ics/<id>.ics. Usa JavaScriptCore (macOS) o, si no hay, Node.
set -eu
cd "$(dirname "$0")/.."
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
if [ -x "$JSC" ]; then RUN="$JSC"; else RUN="node tools/node-run.js"; fi

$RUN data.js lib.js tools/check.js

OUT=$(mktemp)
trap 'rm -f "$OUT"' EXIT
if ! $RUN data.js lib.js tools/ics.js > "$OUT" || grep -q '^Exception' "$OUT"; then cat "$OUT" >&2; exit 1; fi

rm -rf ics && mkdir ics
# Reparte la salida en ficheros (las líneas vacías son separadores de print).
awk '
  /^=====FILE / { if (f) close(f); f = substr($0, 11); next }
  f && $0 != "" { printf "%s\n", $0 > f }
' "$OUT"
echo "ics: $(ls ics | wc -l | tr -d ' ') ficheros generados"
