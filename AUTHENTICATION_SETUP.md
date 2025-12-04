# Authentication Setup Guide

This guide will help you set up authentication for the admin page using Supabase.

## Prerequisites

- Supabase project created
- Service role key added to `.env` file

## Steps to Enable Authentication

### 1. Enable Email Authentication in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Enable **Email** provider (it should be enabled by default)

### 2. Create an Admin User

You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email**: Your admin email (e.g., `admin@vinechurch.ca`)
   - **Password**: A strong password
   - **Auto Confirm User**: Check this box
4. Click **Create User**

#### Option B: Using SQL (if you prefer)

Run this SQL in your Supabase SQL Editor:

```sql
-- This will create a user via the auth system
-- Replace with your desired email and password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@vinechurch.ca', -- Change this
  crypt('your_secure_password', gen_salt('bf')), -- Change this
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

**Note**: The password in the SQL method needs to be manually hashed. It's easier to use the Dashboard method.

### 3. Configure Email Settings (Optional)

If you want to enable password reset and other email features:

1. Go to **Authentication** → **Email Templates**
2. Configure your email templates
3. Go to **Authentication** → **Settings**
4. Configure SMTP settings or use Supabase's built-in email service

### 4. Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000/pt/login` (or `/en/login`)
3. Enter the email and password you created
4. You should be redirected to the admin page

### 5. Sign Out

- Click the **Sign Out** button in the admin page header
- You'll be redirected back to the login page

## Security Notes

1. **Service Role Key**: Keep your `SUPABASE_SERVICE_ROLE_KEY` secret and never expose it in client-side code
2. **Strong Passwords**: Use strong passwords for admin accounts
3. **HTTPS**: In production, always use HTTPS
4. **Row-Level Security**: The RLS policies ensure only authenticated users can create/update/delete sermons

## Troubleshooting

### "Invalid email or password" error

- Double-check the email and password
- Make sure the user exists in Supabase Authentication → Users
- Ensure the user's email is confirmed (check "Email Confirmed At" column)

### "Database not configured" error

- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env`
- Restart your development server after changing `.env`

### Redirect loop or not redirecting

- Clear your browser cookies and local storage
- Check the browser console for errors
- Ensure Supabase authentication is properly configured

## Additional Features (Future Enhancement)

You can add more features like:
- Password reset via email
- Multiple admin users with different roles
- Session timeout
- Two-factor authentication
- Audit logging

## Row-Level Security Policies

The current RLS policies on the `sermons` table:

- **SELECT**: Anyone can read sermons (public access)
- **INSERT/UPDATE/DELETE**: Only authenticated users can modify sermons

This ensures the API routes using the service role key can bypass RLS, while the public can only read sermons.
