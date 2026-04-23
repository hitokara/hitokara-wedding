#!/usr/bin/env bash
# Generate LINE Rich Menu PNG from template.html using Chrome headless.
# LINE Rich Menu large size: 2500 x 1686 px

set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
HTML="$HERE/template.html"
OUT="$HERE/rich-menu.png"
URL="file://$HTML"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "❌ Chrome not found at $CHROME"
  exit 1
fi

echo "▶ Rendering $HTML → $OUT"

# Wait ~2s for fonts to load, full-page screenshot
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size=2500,1686 \
  --virtual-time-budget=4000 \
  --screenshot="$OUT" \
  "$URL" 2>/dev/null

if [ -f "$OUT" ]; then
  SIZE=$(stat -f%z "$OUT" 2>/dev/null || stat -c%s "$OUT")
  DIM=$(sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null | tail -2 | tr '\n' ' ')
  echo "✅ Generated: $OUT"
  echo "   Size:    $((SIZE/1024)) KB"
  echo "   Dim:     $DIM"
else
  echo "❌ Output file not created"
  exit 1
fi
