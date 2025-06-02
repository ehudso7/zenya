#!/bin/bash

# Script to remove sensitive files from Git repository and update .gitignore
# Run this script from the project root directory

set -e  # Exit on error

echo "🔒 Starting security cleanup for Zenya repository..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo -e "${RED}Error: This script must be run from the Zenya project root directory${NC}"
    exit 1
fi

echo "📋 Step 1: Identifying sensitive files in the repository..."
echo ""

# List of files that should be removed
FILES_TO_REMOVE=(
    # Environment files (if any slipped through)
    ".env"
    ".env.production"
    ".env.development"
    ".env.test"
    ".env.staging"
    
    # Scripts with sensitive data
    "scripts/create-demo-user.sql"
    
    # Internal documentation (already removed but checking)
    "CLAUDE.md"
    "AUTH_FIX_INSTRUCTIONS.md"
    
    # Any other potentially sensitive files
    "secrets.json"
    "credentials.json"
    ".secrets"
)

# Optional: Database schema files (uncomment if you want to remove these)
# SCHEMA_FILES=(
#     "scripts/setup-database.sql"
#     "supabase/schema.sql"
#     "supabase/seed.sql"
#     "supabase/seed_learning.sql"
#     "supabase/migrations/002_user_profiles.sql"
#     "supabase/migrations/003_learning_system.sql"
# )

echo "🔍 Checking which sensitive files are tracked in Git..."
echo ""

FOUND_FILES=()
for file in "${FILES_TO_REMOVE[@]}"; do
    if git ls-files --error-unmatch "$file" 2>/dev/null; then
        FOUND_FILES+=("$file")
        echo -e "${YELLOW}Found tracked file: $file${NC}"
    fi
done

# Uncomment to also check schema files
# for file in "${SCHEMA_FILES[@]}"; do
#     if git ls-files --error-unmatch "$file" 2>/dev/null; then
#         FOUND_FILES+=("$file")
#         echo -e "${YELLOW}Found tracked schema file: $file${NC}"
#     fi
# done

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ No sensitive files found in Git tracking${NC}"
else
    echo ""
    echo "🗑️  Step 2: Removing ${#FOUND_FILES[@]} sensitive files from Git..."
    echo ""
    
    for file in "${FOUND_FILES[@]}"; do
        echo -e "Removing: ${RED}$file${NC}"
        git rm --cached "$file" 2>/dev/null || true
    done
fi

echo ""
echo "📝 Step 3: Updating .gitignore..."
echo ""

# Create a temporary file with additional gitignore entries
cat > .gitignore.additions << 'EOF'

# ===== SECURITY: Explicitly excluded sensitive files =====
# Added by cleanup-sensitive-files.sh script

# Environment files
.env
.env.*
!.env.example
!.env.*.example

# Database scripts with sensitive data
scripts/create-demo-user.sql
scripts/*-demo-*.sql
scripts/*-test-*.sql

# Internal documentation
CLAUDE.md
AUTH_FIX_INSTRUCTIONS.md
FILES_TO_REMOVE_FROM_GITHUB.md

# Credentials and secrets
**/secrets.json
**/credentials.json
**/*.key
**/*.pem
**/*.pfx
**/*.p12

# Database dumps and backups
*.sql.backup
*.dump
*.sql.gz

# User data
user-data/
user-uploads/
user-sessions/

# AI Models and training data
models/
training-data/
*.model
*.weights
*.checkpoint

# Analytics and metrics
analytics-reports/
user-metrics/
performance-logs/

# Business sensitive
contracts/
legal/
financial-data/
business-plans/

# Local development
local-scripts/
dev-tools/
.local/

# === END SECURITY ADDITIONS ===
EOF

# Check if these entries already exist in .gitignore
echo "Checking existing .gitignore entries..."
NEEDS_UPDATE=false

while IFS= read -r line; do
    if ! grep -qF "$line" .gitignore 2>/dev/null; then
        NEEDS_UPDATE=true
        break
    fi
done < .gitignore.additions

if [ "$NEEDS_UPDATE" = true ]; then
    echo -e "${YELLOW}Adding security exclusions to .gitignore...${NC}"
    echo "" >> .gitignore
    cat .gitignore.additions >> .gitignore
    git add .gitignore
    echo -e "${GREEN}✅ Updated .gitignore${NC}"
else
    echo -e "${GREEN}✅ .gitignore already has security exclusions${NC}"
fi

rm -f .gitignore.additions

echo ""
echo "🔍 Step 4: Checking for sensitive patterns in tracked files..."
echo ""

# Search for potential secrets in tracked files
echo "Searching for potential API keys, passwords, or secrets..."
SUSPICIOUS_FILES=$(git ls-files | xargs grep -l -E "(api[_-]?key|password|secret|token|credential)" 2>/dev/null | grep -v -E "(\.md|\.example|\.test\.|\.spec\.|types/|interface)" || true)

if [ -n "$SUSPICIOUS_FILES" ]; then
    echo -e "${YELLOW}⚠️  Warning: These files may contain sensitive information:${NC}"
    echo "$SUSPICIOUS_FILES" | while read -r file; do
        echo -e "  ${YELLOW}$file${NC}"
    done
    echo ""
    echo "Please review these files manually to ensure no secrets are exposed."
else
    echo -e "${GREEN}✅ No obvious sensitive patterns found in tracked files${NC}"
fi

echo ""
echo "📊 Step 5: Summary of changes..."
echo ""

# Show git status
git status --short

echo ""
echo "🚀 Step 6: Creating commit (if there are changes)..."
echo ""

if [ -n "$(git status --porcelain)" ]; then
    echo "Creating commit for security cleanup..."
    git add -A
    git commit -m "security: Comprehensive cleanup of sensitive files

- Remove any remaining sensitive files from tracking
- Update .gitignore with comprehensive security exclusions
- Ensure environment files, credentials, and internal docs stay local
- Add patterns to prevent future accidental commits

This is an automated cleanup by cleanup-sensitive-files.sh

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

    echo -e "${GREEN}✅ Changes committed${NC}"
    echo ""
    echo -e "${YELLOW}Ready to push changes to GitHub? (y/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git push origin main
        echo -e "${GREEN}✅ Changes pushed to GitHub${NC}"
    else
        echo "Changes committed locally. Run 'git push origin main' when ready."
    fi
else
    echo -e "${GREEN}✅ No changes needed - repository is already clean${NC}"
fi

echo ""
echo "🎯 Additional Security Recommendations:"
echo ""
echo "1. If any files contained actual secrets (not just templates):"
echo "   - Change all exposed credentials immediately"
echo "   - Consider using BFG Repo-Cleaner to remove from history"
echo ""
echo "2. Set up pre-commit hooks to prevent future accidents:"
echo "   - Install pre-commit: npm install --save-dev pre-commit"
echo "   - Configure hooks to scan for secrets"
echo ""
echo "3. Use environment variable management:"
echo "   - Use .env.example files with dummy values"
echo "   - Document all required variables in README"
echo "   - Use a secrets manager for production"
echo ""
echo -e "${GREEN}✅ Security cleanup complete!${NC}"