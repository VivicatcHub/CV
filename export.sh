#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

CHROME="${CHROME:-$(command -v google-chrome-stable || command -v google-chrome || command -v chromium || command -v chromium-browser || true)}"
[ -n "$CHROME" ] || {
	echo "Chrome/Chromium not found (set CHROME=/path/to/chrome)" >&2
	exit 1
}

DATA=data.json
[ -f "$DATA" ] || DATA=data.example.json
PORT="${PORT:-8765}"
OUT=exports
mkdir -p "$OUT"

python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 0.5

python3 - "$DATA" "$@" <<'EOF' |
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
wanted = sys.argv[2:]
name = data.get("basics", {}).get("name")
compos = [{"id": "base"}] + data.get("compos", [])
for c in compos:
    if wanted and c["id"] not in wanted:
        continue
    file = c.get("file") or (c["id"] == "base" and data.get("meta", {}).get("file")) or " - ".join(x for x in ["CV", name, c.get("label")] if x)
    print(f'{c["id"]}\t{file.replace("/", "-")}')
EOF
	while IFS=$'\t' read -r id file; do
		query=""
		[ "$id" = base ] || query="?compo=$id"
		"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
			--virtual-time-budget=5000 --print-to-pdf="$OUT/$file.pdf" \
			"http://127.0.0.1:$PORT/$query" 2>/dev/null
		echo "✓ $OUT/$file.pdf"
	done
