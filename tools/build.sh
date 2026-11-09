#!/usr/bin/env bash
# Baut für jede Plattform einen eigenen Ordner + ZIP in dist/.
#   dist/web/              -> GitHub Pages / eigene Website
#   dist/komet-web.zip     -> itch.io (Upload als "HTML"-Spiel)
#   dist/komet-crazygames.zip
#   dist/komet-poki.zip
set -euo pipefail
cd "$(dirname "$0")/.."

FILES=(index.html manifest.webmanifest sw.js css js fonts assets)
PLATFORMS=(web crazygames poki)

rm -rf dist
mkdir -p dist
for platform in "${PLATFORMS[@]}"; do
  out="dist/$platform"
  mkdir -p "$out"
  cp -r "${FILES[@]}" "$out/"
  # Plattform in der Konfiguration setzen
  sed -i.bak "s/platform: '[a-z]*'/platform: '$platform'/" "$out/js/config.js" && rm "$out/js/config.js.bak"
  # Portale brauchen keinen Service Worker / kein Manifest
  if [ "$platform" != "web" ]; then rm -f "$out/sw.js" "$out/manifest.webmanifest"; fi
  (cd "$out" && zip -qr "../komet-$platform.zip" .)
  echo "✓ dist/komet-$platform.zip ($(du -h "dist/komet-$platform.zip" | cut -f1))"
done
