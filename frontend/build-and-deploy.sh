#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_STATIC="$ROOT_DIR/backend/static/frontend"
TEMPLATES="$ROOT_DIR/backend/templates"

echo "=== Building frontend ==="
npm run build

echo "=== Copying new assets to backend/static/frontend/assets/ ==="
cp -R dist/assets/* "$BACKEND_STATIC/assets/"

echo "=== Fixing favicon path in built index.html ==="
# Vite copies public/logo.png to dist/ with href="/logo.png"
# In production, it's served at /static/frontend/logo.png
sed -i '' 's|href="/logo.png"|href="/static/frontend/logo.png"|g' dist/index.html

echo "=== Copying index.html to templates/ ==="
cp dist/index.html "$TEMPLATES/index.html"

echo "=== Done ==="
echo "Backend static assets updated (existing media preserved)"
