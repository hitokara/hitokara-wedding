#!/usr/bin/env bash
# Generate OG/SNS thumbnail (1200x630) from template.html using Chrome headless.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
HTML="$HERE/template.html"
OUT_PNG="$HERE/og-default.png"
OUT_JPG="$HERE/../../public/og-default.jpg"
URL="file://$HTML"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "▶ Rendering $HTML → $OUT_PNG"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size=1200,630 \
  --virtual-time-budget=5000 \
  --screenshot="$OUT_PNG" \
  "$URL" 2>/dev/null

if [ ! -f "$OUT_PNG" ]; then
  echo "❌ Render failed"; exit 1
fi

# Convert PNG → JPEG q88 for smaller file (SNS prefers <1MB)
sips -s format jpeg -s formatOptions 88 "$OUT_PNG" --out "$OUT_JPG" >/dev/null

SIZE=$(stat -f%z "$OUT_JPG")
DIM=$(sips -g pixelWidth -g pixelHeight "$OUT_JPG" | tail -2 | tr '\n' ' ')
echo "✅ Saved to: $OUT_JPG"
echo "   Size: $((SIZE/1024)) KB"
echo "   Dim:  $DIM"
