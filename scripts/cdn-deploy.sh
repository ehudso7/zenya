#!/bin/bash

# CDN Deployment Script
# Uploads static assets to CDN with proper cache headers

set -e

echo "🚀 Starting CDN deployment..."

# Configuration
CDN_BUCKET=${CDN_BUCKET:-"zenya-ai-static"}
CDN_DISTRIBUTION_ID=${CDN_DISTRIBUTION_ID:-""}
BUILD_DIR=".next"
PUBLIC_DIR="public"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is required but not installed."
    echo "Install it with: brew install awscli"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured."
    echo "Run: aws configure"
    exit 1
fi

echo "📦 Building production assets..."
npm run build

echo "📤 Uploading static assets to S3..."

# Upload Next.js static files
aws s3 sync "$BUILD_DIR/static" "s3://$CDN_BUCKET/_next/static" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-encoding "gzip" \
    --delete

# Upload public directory
aws s3 sync "$PUBLIC_DIR" "s3://$CDN_BUCKET" \
    --exclude "*.html" \
    --exclude "*.json" \
    --exclude "*.xml" \
    --exclude "*.txt" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Upload images with specific cache headers
aws s3 sync "$PUBLIC_DIR" "s3://$CDN_BUCKET" \
    --exclude "*" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.png" \
    --include "*.gif" \
    --include "*.webp" \
    --include "*.avif" \
    --include "*.svg" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "image/*"

# Upload fonts with CORS headers
aws s3 sync "$PUBLIC_DIR/fonts" "s3://$CDN_BUCKET/fonts" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "font/*" \
    --metadata "Access-Control-Allow-Origin=*"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CDN_DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$CDN_DISTRIBUTION_ID" \
        --paths "/*"
fi

echo "✅ CDN deployment complete!"
echo ""
echo "📊 Deployment Summary:"
echo "- S3 Bucket: s3://$CDN_BUCKET"
if [ -n "$CDN_DISTRIBUTION_ID" ]; then
    echo "- CloudFront Distribution: $CDN_DISTRIBUTION_ID"
fi
echo ""
echo "🔗 CDN URLs:"
echo "- Static assets: https://cdn.zenyaai.com/_next/static/"
echo "- Public assets: https://cdn.zenyaai.com/"
echo ""
echo "📝 Next steps:"
echo "1. Update NEXT_PUBLIC_CDN_URL in your environment"
echo "2. Deploy the application with CDN enabled"
echo "3. Verify assets are loading from CDN"