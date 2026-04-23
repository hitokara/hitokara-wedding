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
  --window-size=1200,700 \
  --virtual-time-budget=8000 \
  --screenshot="$OUT_PNG" \
  "$URL" 2>/dev/null

if [ ! -f "$OUT_PNG" ]; then
  echo "❌ Render failed"; exit 1
fi

# Crop to exactly 1200x630 (in case window-size produced extra rows) + convert to JPEG q88
sips --cropToHeightWidth 630 1200 "$OUT_PNG" --out "$OUT_PNG" >/dev/null 2>&1 || true
sips -s format jpeg -s formatOptions 88 "$OUT_PNG" --out "$OUT_JPG" >/dev/null

SIZE=$(stat -f%z "$OUT_JPG")
DIM=$(sips -g pixelWidth -g pixelHeight "$OUT_JPG" | tail -2 | tr '\n' ' ')
echo "✅ Saved to: $OUT_JPG"
echo "   Size: $((SIZE/1024)) KB"
echo "   Dim:  $DIM"
