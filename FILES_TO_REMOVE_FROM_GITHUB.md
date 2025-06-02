# Files to Remove from GitHub

These files need to be manually removed from the GitHub repository as they contain sensitive information or should remain local-only:

## Files That MUST Be Removed:

### 1. **Environment Configuration**
- `.env.production` - Contains production configuration (even though values are commented, it reveals structure)

### 2. **Database Scripts with Sensitive Data**
- `scripts/create-demo-user.sql` - Contains hardcoded demo password: "demo-password-2025"

## Files to Consider Removing (Optional but Recommended):

### 3. **Database Setup Scripts**
While these don't contain passwords, they reveal your complete database schema which could be a security concern:
- `scripts/setup-database.sql` - Full database schema
- `supabase/schema.sql` - Database schema
- `supabase/seed.sql` - Seed data
- `supabase/seed_learning.sql` - Learning content seed data
- `supabase/migrations/002_user_profiles.sql` - User profile migration
- `supabase/migrations/003_learning_system.sql` - Learning system migration

## How to Remove These Files:

1. Remove from Git tracking:
```bash
git rm --cached .env.production
git rm --cached scripts/create-demo-user.sql
```

2. If you want to remove the database scripts too:
```bash
git rm --cached scripts/setup-database.sql
git rm --cached supabase/schema.sql
git rm --cached supabase/seed.sql
git rm --cached supabase/seed_learning.sql
git rm --cached supabase/migrations/002_user_profiles.sql
git rm --cached supabase/migrations/003_learning_system.sql
```

3. These files are already properly ignored in .gitignore, but let's ensure they're explicitly listed.

## Files That Are OK to Keep:

- `app/auth/*` - These are application routes, not sensitive
- `.env.example` - This is a template with dummy values
- `.env.local.example` - This is a template with dummy values

## Important Notes:

1. After removing these files, they will still exist in Git history. If any contained actual secrets (like the demo password), you should:
   - Change the demo password immediately
   - Consider using git-filter-branch or BFG Repo-Cleaner to remove from history

2. For future database migrations:
   - Keep migration files but ensure they don't contain any hardcoded credentials
   - Use environment variables for any sensitive values
   - Document the schema structure separately from implementation details