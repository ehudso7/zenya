# Local Files Guide for Zenya AI Learning Platform

This document outlines which files should remain local and not be committed to the repository.

## Files That Should Remain Local

### 1. Environment Files
- `.env` - Local environment variables
- `.env.local` - Local development settings
- `.env.development` - Development-specific settings
- `.env.test` - Test environment settings
- `.env.staging` - Staging environment settings

**Why:** Contains API keys, database credentials, and other sensitive configuration.

### 2. User Data & Privacy
- `/user-data/` - User personal information
- `/user-uploads/` - Files uploaded by users
- `/user-sessions/` - Session data
- `/analytics-data/` - User behavior analytics
- `*.user-data` - Any user data files
- `*.session-data` - Session information

**Why:** GDPR compliance and user privacy protection.

### 3. AI Model & Training Data
- `/models/` - Trained AI models
- `/training-data/` - Training datasets
- `/datasets/` - Raw datasets
- `*.model`, `*.weights`, `*.checkpoint` - Model files
- `*.pkl`, `*.h5` - Serialized models

**Why:** Large files, proprietary models, and potentially sensitive training data.

### 4. Development Documentation
- `CLAUDE.md` - AI assistant instructions
- `AUTH_FIX_INSTRUCTIONS.md` - Authentication troubleshooting
- `/docs-drafts/` - Work-in-progress documentation
- `/internal-docs/` - Internal team documentation

**Why:** Contains implementation details and internal processes.

### 5. Business & Legal
- `/contracts/` - Legal contracts
- `/legal/` - Legal documents
- `/business-plans/` - Business strategy
- `/financial-data/` - Financial information

**Why:** Confidential business information.

### 6. Testing & Development Tools
- `/local-scripts/` - Developer-specific scripts
- `/dev-tools/` - Local development tools
- `/test-data/` - Test datasets with potentially sensitive data
- `/mock-data/` - Mock data that might contain patterns from real data

**Why:** May contain hardcoded credentials or sensitive patterns.

### 7. Monitoring & Performance
- `/error-reports/` - Detailed error logs
- `/crash-dumps/` - Application crash dumps
- `/performance-logs/` - Performance metrics
- `*.heapdump` - Memory dumps
- `*.trace` - Execution traces

**Why:** May contain user data or system information.

### 8. Database Files
- `*.db`, `*.sqlite`, `*.sqlite3` - Local database files
- `/db-backups/` - Database backups
- `/database-dumps/` - Database exports

**Why:** Contains all application data including user information.

## What SHOULD Be Committed

### ✅ Safe to Commit:
- Source code (without hardcoded secrets)
- Public documentation
- Configuration templates (`.env.example`)
- Database migrations (without seed data containing real user info)
- Public assets (images, styles)
- Test files (without sensitive data)
- Build configuration
- Package manifests (`package.json`)

### ❌ Never Commit:
- Passwords or API keys
- User personal data
- Session tokens
- Database dumps with real data
- Internal documentation
- Business sensitive information
- Large binary files (models, datasets)

## Best Practices

1. **Use Environment Variables**: Never hardcode secrets in source code
2. **Create Example Files**: Provide `.env.example` with dummy values
3. **Document Requirements**: List required environment variables in README
4. **Use Git Hooks**: Set up pre-commit hooks to prevent accidental commits
5. **Regular Audits**: Periodically check for accidentally committed sensitive files

## If You Accidentally Commit Sensitive Data

1. Remove the file from tracking: `git rm --cached <file>`
2. Add to `.gitignore`
3. Commit the changes
4. If already pushed, consider the data compromised and rotate credentials
5. Use `git filter-branch` or BFG Repo-Cleaner for historical removal

## Setting Up Local Development

When setting up the project locally:

1. Copy `.env.example` to `.env.local`
2. Fill in your personal API keys and credentials
3. Never commit `.env.local`
4. Keep `CLAUDE.md` locally for AI assistant context
5. Store any personal scripts in `/local-scripts/`