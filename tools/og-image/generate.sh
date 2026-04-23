#!/usr/bin/env bash
# Generate OG/SNS thumbnail (1200x630) from template.html using Chrome headless.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
HTML="$HERE/template.html"
RAW_PNG="$HERE/og-raw.png"
CROP_PNG="$HERE/og-default.png"
OUT_JPG="$HERE/../../public/og-default.jpg"
URL="file://$HTML"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "▶ Rendering $HTML"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size=1200,720 \
  --virtual-time-budget=8000 \
  --screenshot="$RAW_PNG" \
  "$URL" 2>/dev/null

if [ ! -f "$RAW_PNG" ]; then
  echo "❌ Render failed"; exit 1
fi

# Top-left crop to 1200x630 using Python (sips --cropOffset is unreliable)
python3 - <<PY
from PIL import Image
img = Image.open("$RAW_PNG")
img.crop((0, 0, 1200, 630)).save("$CROP_PNG")
PY

# Convert to JPEG q88
sips -s format jpeg -s formatOptions 88 "$CROP_PNG" --out "$OUT_JPG" >/dev/null

rm -f "$RAW_PNG" "$CROP_PNG"

SIZE=$(stat -f%z "$OUT_JPG")
DIM=$(sips -g pixelWidth -g pixelHeight "$OUT_JPG" | tail -2 | tr '\n' ' ')
echo "✅ Saved to: $OUT_JPG"
echo "   Size: $((SIZE/1024)) KB"
echo "   Dim:  $DIM"
