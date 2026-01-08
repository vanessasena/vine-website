# Member Area Implementation - Vine Church KWC

## Overview
This document describes the implementation of the member area system with role-based access control for the Vine Church KWC website.

## Features Implemented

### 1. Database Schema
**File:** `supabase-member-schema.sql`

Created two main tables:
- **`users`**: Extends Supabase auth with role information (member/admin)
- **`member_profiles`**: Stores detailed member information including:
  - Name, email, phone, date of birth
  - Is baptized, pays tithe
  - Volunteer areas (array)
  - Life group membership
  - Timestamps for creation and updates

**Key Features:**
- Row Level Security (RLS) policies for data protection
- Automatic user record creation on signup
- Auto-updating timestamps
- Proper indexes for performance

### 2. Member Profile API
**File:** `src/app/api/member-profile/route.ts`

Endpoints:
- `GET`: Fetch user's own profile and role
- `POST`: Create new member profile
- `PUT`: Update existing member profile

All endpoints require authentication and respect RLS policies.

### 3. Member Area Pages
**Files:**
- `src/app/[locale]/member/page.tsx`
- `src/app/[locale]/member/MemberProfileClient.tsx`

Features:
- Profile creation and editing
- All required fields with validation
- Checkbox selections for volunteer areas
- Auto-redirect if user is admin
- Bilingual support (PT/EN)

### 4. Admin Member Management
**Files:**
- `src/app/[locale]/admin/members/page.tsx`
- `src/app/[locale]/admin/members/MembersAdminClient.tsx`

Features:
- View all member profiles (admin only)
- Filter by volunteer area
- Pagination (10 items per page)
- Detailed member view modal
- Search and sorting capabilities

### 5. Role-Based Authentication
**File:** `src/lib/roles.ts`

Utility functions:
- `checkAuth()`: Verify if user is authenticated
- `getUserRole()`: Get user's role
- `isAdmin()`: Check if user is admin
- `isMemberOrAdmin()`: Check if user has member or admin role
- `verifyAuthAndRole()`: API route authentication helper

### 6. Login Updates
**File:** `src/app/[locale]/login/LoginClient.tsx`

Updated to:
- Check user role after login
- Redirect admins to `/admin`
- Redirect members to `/member`
- Handle role fetch errors gracefully

### 7. Admin Panel Updates
**File:** `src/app/[locale]/admin/AdminClient.tsx`

Updates:
- Added role verification on mount
- Redirect non-admins to member area
- Added link to member profiles management
- Replaced volunteer link with member profiles link

### 8. Navigation Updates
**File:** `src/components/Navigation.tsx`

Changes:
- Removed volunteer page links (both desktop and mobile)
- Kept other navigation items intact

### 9. Translations
**Files:**
- `messages/pt.json`
- `messages/en.json`

Added complete translations for:
- Member profile fields
- Volunteer area options
- Form labels and buttons
- Status messages
- UI text

### 10. Removed Files
Deleted volunteer functionality:
- `src/app/[locale]/volunteers/` (public volunteer page)
- `src/app/[locale]/admin/volunteers/` (admin volunteer management)
- `src/app/api/volunteers/` (volunteer API routes)
- `supabase-volunteers-schema.sql` (old schema)

## Database Setup Instructions

1. **Run the SQL schema in Supabase:**
   ```sql
   -- Execute the contents of supabase-member-schema.sql in Supabase SQL Editor
   ```

2. **Create your first admin user:**
   ```sql
   -- After signing up a user through the app, promote them to admin:
   UPDATE public.users
   SET role = 'admin'
   WHERE email = 'your-admin-email@example.com';
   ```

## User Flows

### Member Flow:
1. Sign up at `/login`
2. Automatically redirected to `/member`
3. Create profile with all required information
4. Can edit profile anytime
5. No access to admin pages

### Admin Flow:
1. Sign up at `/login` (must be promoted to admin via SQL)
2. Automatically redirected to `/admin`
3. Full access to all admin features
4. Can view all member profiles at `/admin/members`
5. Has all permissions that members have

## Security Features

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Role-based access**: Different permissions for member vs admin
- **Authentication required**: All sensitive routes require login
- **Client-side guards**: Redirect unauthorized users
- **Server-side validation**: API routes verify roles

## Member Profile Fields

### Required:
- Name
- Email
- Phone

### Optional:
- Date of Birth
- Is Baptized (checkbox)
- Pays Tithe (checkbox)
- Volunteer Areas (multi-select)
- Life Group (text)

### Volunteer Area Options:
1. Louvor e Adoração (Worship and Praise)
2. Tecnologia e Multimídia (Technology and Multimedia)
3. Recepção e Acolhimento (Reception and Hospitality)
4. Vine Kids (Children's Ministry)
5. Ministério de Adolescentes (Teen Ministry)
6. Liderança de Células (Life Group Leadership)
7. Intercessão (Intercession)
8. Mídias Sociais (Social Media)
9. Limpeza e Organização (Cleaning and Organization)
10. Cozinha (Kitchen)
11. Organização de Eventos (Event Planning)
12. Transporte (Transportation)
13. Outros (Other)

## Next Steps

1. **Deploy the database schema** to your Supabase project
2. **Promote at least one user to admin** via SQL
3. **Test the login flow** for both member and admin users
4. **Verify RLS policies** are working correctly
5. **Customize volunteer areas** if needed for your church
6. **Add additional features** as needed (e.g., member search, export, etc.)

## Notes

- The old volunteer registration system has been completely replaced
- Member profiles now contain all volunteer information
- Admins can view all member profiles with filtering options
- The system is fully bilingual (Portuguese and English)
- All dates are formatted according to locale
- Pagination is implemented for large member lists
