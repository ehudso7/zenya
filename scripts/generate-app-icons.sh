#!/bin/bash

# Script to generate placeholder app icons for Zenya
# In production, replace these with professionally designed icons

set -e

echo "🎨 Generating app icon placeholders..."

# Create directories
mkdir -p public/icons
mkdir -p public/screenshots
mkdir -p public/shortcuts

# Function to create a colored square with text
create_icon() {
    size=$1
    output=$2
    
    # Create icon using ImageMagick (if available) or create a placeholder HTML
    if command -v convert &> /dev/null; then
        convert -size ${size}x${size} \
            -background "#3B82F6" \
            -fill white \
            -gravity center \
            -pointsize $((size/4)) \
            -annotate +0+0 "Z" \
            "$output"
    else
        # Create a simple HTML file as placeholder
        cat > "$output.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .logo {
            color: white;
            font-size: ${size/4}px;
            font-weight: 800;
            text-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="logo">Z</div>
</body>
</html>
EOF
        echo "Created placeholder: $output.html (convert to PNG manually)"
    fi
}

# Generate standard app icons
sizes=(72 96 128 144 152 192 384 512)
for size in "${sizes[@]}"; do
    echo "Creating icon-${size}.png..."
    create_icon $size "public/icon-${size}.png"
done

# Generate maskable icons (with padding)
echo "Creating maskable icons..."
create_icon 192 "public/maskable-icon-192.png"
create_icon 512 "public/maskable-icon-512.png"

# Generate Apple Touch icons
echo "Creating Apple touch icons..."
create_icon 180 "public/apple-touch-icon.png"
create_icon 167 "public/apple-touch-icon-ipad.png"
create_icon 1024 "public/icon-1024.png"

# Create favicon
echo "Creating favicon..."
create_icon 32 "public/favicon-32x32.png"
create_icon 16 "public/favicon-16x16.png"

# Create shortcut icons
echo "Creating shortcut icons..."
create_icon 96 "public/shortcuts/learn.png"
create_icon 96 "public/shortcuts/progress.png"

# Create OG image placeholder
cat > public/og-image.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: white;
        }
        .logo {
            font-size: 120px;
            font-weight: 800;
            margin-bottom: 20px;
            text-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .tagline {
            font-size: 36px;
            font-weight: 500;
            opacity: 0.9;
            text-align: center;
            max-width: 800px;
        }
    </style>
</head>
<body>
    <div class="logo">Zenya</div>
    <div class="tagline">AI Learning Companion for Neurodiverse Minds</div>
</body>
</html>
EOF

echo ""
echo "✅ Icon placeholders created!"
echo ""
echo "⚠️  IMPORTANT: These are placeholder icons."
echo "For production, you need to:"
echo "1. Design professional app icons with your brand"
echo "2. Convert HTML placeholders to PNG format"
echo "3. Ensure icons meet platform requirements:"
echo "   - iOS: 1024x1024 master icon"
echo "   - Android: 512x512 master icon"
echo "   - PWA: Multiple sizes with transparency"
echo ""
echo "Tools for icon generation:"
echo "- https://maskable.app/ (for maskable icons)"
echo "- https://www.pwabuilder.com/imageGenerator"
echo "- https://favicon.io/"