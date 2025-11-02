#!/bin/bash

echo "🔧 Fixing Widget Loading Issue..."
echo ""

# 1. Clean everything
echo "1️⃣ Cleaning old builds..."
rm -rf dist/
rm -rf node_modules/.cache
echo "   ✅ Cleaned"
echo ""

# 2. Rebuild UI
echo "2️⃣ Building UI widgets..."
npm run build:ui
if [ $? -ne 0 ]; then
  echo "   ❌ UI build failed!"
  exit 1
fi
echo "   ✅ UI built"
echo ""

# 3. Check widget files
echo "3️⃣ Verifying widget files..."
for widget in book-list book-detail cart order-history; do
  file="dist/ui/$widget/index.html"
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    echo "   ✅ $widget: $size bytes"
    
    if [ $size -lt 1000 ]; then
      echo "   ⚠️  WARNING: File too small, might be incorrect"
    fi
  else
    echo "   ❌ $widget: NOT FOUND"
  fi
done
echo ""

# 4. Rebuild server
echo "4️⃣ Building server..."
npm run build:server
if [ $? -ne 0 ]; then
  echo "   ❌ Server build failed!"
  exit 1
fi
echo "   ✅ Server built"
echo ""

# 5. Check server file
echo "5️⃣ Verifying server..."
if [ -f "dist/server/index.js" ]; then
  echo "   ✅ Server file exists"
else
  echo "   ❌ Server file NOT FOUND"
  exit 1
fi
echo ""

# 6. Start server with debug
echo "6️⃣ Starting server..."
echo "   Watch for [Widget] logs..."
echo ""
npm start