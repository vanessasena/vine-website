# Database Setup Guide - Member Area System

## Quick Fix for Infinite Recursion Error

If you're getting the error: **"infinite recursion detected in policy for relation 'users'"**

Run this immediately in Supabase SQL Editor:
```sql
-- Copy and paste the entire contents of fix-rls-infinite-recursion.sql
```

Then proceed with the setup below if this is a fresh installation.

---

## Step-by-Step Setup Instructions

### Step 1: Run the Main Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `supabase-member-schema.sql`
4. Click **Run** to execute the schema

This creates:
- `user_role` enum type
- `public.users` table with RLS policies
- `public.member_profiles` table with RLS policies
- Necessary indexes
- Update timestamp triggers
- The `handle_new_user()` function

### Step 2: Create the Auth Trigger (CRITICAL)

The trigger on `auth.users` requires elevated permissions. You have **two options**:

#### Option A: SQL Editor (Recommended)
1. In Supabase SQL Editor, run this command separately:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

2. If you get a permissions error, proceed to Option B

#### Option B: Database Webhooks (Alternative)
1. Go to **Database** → **Webhooks** in Supabase Dashboard
2. Click **Create a new hook**
3. Configure:
   - **Name**: `on_auth_user_created`
   - **Table**: `auth.users`
   - **Events**: `Insert`
   - **Type**: `SQL`
   - **SQL**:
   ```sql
   SELECT public.handle_new_user();
   ```

### Step 3: Verify the Trigger Works

1. Create a test account through your app at `/login`
2. Go to **Table Editor** → `public.users`
3. Verify that a new row was created with:
   - The same `id` as in `auth.users`
   - The email address
   - Role set to `'member'`

### Step 4: Create Your First Admin User

1. Sign up for an account through the app
2. Find your user ID in **Table Editor** → `public.users`
3. Run this SQL to promote yourself to admin:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Step 5: Test the System

1. **Test Sign Up**:
   - Create a new account at `/pt/login` or `/en/login`
   - Verify redirect to `/member` page
   - Check that user appears in `public.users` table

2. **Test Member Profile**:
   - Fill out your member profile
   - Save and verify data appears in `public.member_profiles`

3. **Test Admin Access**:
   - Log in with your admin account
   - Verify redirect to `/admin` page
   - Check you can view all member profiles at `/admin/members`

## Troubleshooting

### Issue: "Infinite recursion detected in policy for relation 'users'"

**Symptoms**: Error 500 when trying to access admin panel or member area. Full error: `infinite recursion detected in policy for relation "users"`

**Cause**: The RLS policies are checking the `users` table to determine if a user is admin, which triggers the same policy again, creating an infinite loop.

**Solution**: Run the fix script:
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `fix-rls-infinite-recursion.sql`
3. Click **Run**
4. Refresh your browser and try logging in again

This creates a `SECURITY DEFINER` function that bypasses RLS to check admin status, breaking the recursion loop.

### Issue: No User Created in `public.users` Table

**Symptoms**: After signup, user exists in `auth.users` but not in `public.users`

**Solution**: The app now has a fallback mechanism that manually creates the user record during signup and login. However, you should still set up the trigger for better reliability.

**Manual Fix**: If users are missing, run this SQL:
```sql
INSERT INTO public.users (id, email, role)
SELECT id, email, 'member'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
```

### Issue: "Failed to fetch profile" Error

**Cause**: User exists in `auth.users` but not in `public.users`

**Solution**: Run the manual fix SQL above, then log out and log back in

### Issue: Can't Access Admin Panel

**Cause**: User role is not set to 'admin'

**Solution**: Run the UPDATE query from Step 4 with your email

### Issue: RLS Policies Block Access

**Cause**: Row Level Security policies might be too restrictive

**Check**: Verify you're logged in and the session is valid
```sql
SELECT auth.uid(); -- Should return your user ID
```

## Schema Verification Checklist

Run these queries to verify your setup:

```sql
-- 1. Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'member_profiles');

-- 2. Check if trigger function exists
SELECT proname
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Check if trigger exists (might fail if no permissions)
SELECT tgname
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 4. Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'member_profiles');

-- 5. List all users and their roles
SELECT id, email, role, created_at
FROM public.users
ORDER BY created_at DESC;
```

## Important Notes

1. **Fallback Mechanism**: The app now automatically creates user records during signup/login if the trigger fails, so the system will work even without the trigger

2. **Security**: Never disable RLS on these tables in production

3. **Email Verification**: Supabase can be configured to require email verification - check your Auth settings

4. **Password Policy**: Current minimum is 6 characters - adjust in Supabase Auth settings if needed

## Need Help?

If you encounter issues:
1. Check Supabase logs in **Logs** → **Postgres Logs**
2. Check browser console for JavaScript errors
3. Verify environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
