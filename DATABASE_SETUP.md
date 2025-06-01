# Database Setup Instructions

This guide will help you set up the Zenya database in Supabase.

## Prerequisites
- A Supabase project
- Access to the SQL Editor in your Supabase dashboard

## Setup Steps

### 1. Run the Database Schema Setup

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the entire contents of `/scripts/setup-database.sql`
5. Run the query

This will create:
- All necessary tables (users, curriculums, lessons, etc.)
- Row Level Security policies
- Triggers for automatic user creation
- Sample curriculum data

### 2. Create a Demo User (Optional)

To create a demo user for testing:

1. First, create the auth user in Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add user"
   - Email: `demo@zenyaai.com`
   - Password: `demo-password-2025`
   - Click "Create user"

2. Then run the demo user setup:
   - Go to SQL Editor
   - Copy contents of `/scripts/create-demo-user.sql`
   - Run the query

### 3. Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if curriculums exist
SELECT COUNT(*) FROM public.curriculums;
-- Should return 5

-- Check if lessons exist
SELECT COUNT(*) FROM public.lessons;
-- Should return 25 (5 lessons per curriculum)

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
-- Should show policies for all tables
```

## Environment Variables

Make sure your `.env.local` file has these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### "User not found" error
- Make sure the trigger `on_auth_user_created` is created
- Check that the `handle_new_user()` function exists

### "Permission denied" errors
- Verify RLS policies are enabled
- Check that policies are created for each table

### Curriculum/Lessons not loading
- Run the setup script again
- Check if data exists in the tables
- Verify RLS policies allow public read access

## Testing Authentication

1. Go to http://localhost:3000/auth/signin-password
2. Create a new account or use the demo account
3. You should be redirected to the profile page after first login
4. Complete your profile to access the learning content