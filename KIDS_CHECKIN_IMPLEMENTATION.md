# Kids Check-In System Implementation Guide

## Overview
This guide describes the implementation of a kids check-in system for Vine Church's kids ministry. The system supports both member children and visitor children, with different workflows for each.

## ✅ Completed Implementation

### Database Schema - DONE
- ✅ `visitor_children` table created
- ✅ `check_ins` table created
- ✅ `current_checked_in_children` view created
- ✅ Row Level Security (RLS) policies configured
- ✅ Teacher role enum added
- ✅ All indexes created for performance

**File:** `supabase-checkin-schema.sql`

### API Routes - DONE
- ✅ Check-ins API (`/api/check-ins`)
  - GET: Fetch check-in records
  - POST: Create check-in
  - PUT: Update for check-out
- ✅ Visitor Children API (`/api/visitor-children`)
  - GET: Fetch visitor children
  - POST: Create visitor child
  - PUT: Update visitor child

**Files:** 
- `src/app/api/check-ins.ts` (needs to be moved to `src/app/api/check-ins/route.ts`)
- `src/app/api/visitor-children-route.ts` (needs to be moved to `src/app/api/visitor-children/route.ts`)

### Translations - DONE
- ✅ Portuguese translations added (`messages/pt.json`)
- ✅ English translations added (`messages/en.json`)
- ✅ Complete translation keys for all UI elements

### Setup Script - DONE
- ✅ `setup-checkin-api.js` - Creates directories and moves files

## 📋 Manual Steps Required

### Step 1: Set Up API Routes
Run the setup script to create the proper directory structure:
```bash
node setup-checkin-api.js
```

This will:
- Create `src/app/api/check-ins/` directory
- Create `src/app/api/visitor-children/` directory
- Move route files to correct locations
- Clean up temporary files

### Step 2: Database Setup
1. Open Supabase SQL Editor
2. Run the `supabase-checkin-schema.sql` file
3. Verify tables and policies are created

### Step 3: Update User Roles
Assign the teacher role to users who should manage check-ins:
```sql
UPDATE public.users SET role = 'teacher' WHERE email = 'teacher@example.com';
```

### Step 4: Create UI Components
Next implementation phase: Create React components for the check-in interface.

Recommended file structure:
```
src/app/[locale]/kids-checkin/
├── page.tsx
├── KidsCheckinClient.tsx
├── CheckinForm.tsx
├── CurrentCheckins.tsx
└── CheckinHistory.tsx
```

## Features Implemented

### For Teachers/Admins:
- ✅ Check in member children
- ✅ Check in visitor children (capture all required info)
- ✅ View all currently checked-in children
- ✅ Check out children
- ✅ Different teachers can check in and check out
- ✅ Search visitor children by name or parent phone

### For Parents:
- ✅ View their own children's check-in status
- ✅ Access check-in history (through API)

## Data Captured

### Member Children Check-In:
- Service date and time
- Child (from existing children table)
- Checked in by (teacher name)
- Optional notes

### Visitor Children Check-In:
- Child name
- Date of birth
- Parent name
- Parent phone (required)
- Parent email (optional)
- Allergies
- Special needs
- Emergency contact name
- Emergency contact phone
- Photo permission
- Service date and time
- Checked in by (teacher name)
- Optional notes

### Check-Out:
- Check-out timestamp
- Checked out by (teacher name)
- Optional notes

## Security Implementation

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Teachers and admins can perform check-in/out operations
- ✅ Parents can only view their own children's check-ins
- ✅ API routes verify user roles before operations
- ✅ Visitor children data is only accessible to teachers/admins

## Next Steps

### 1. UI Implementation (To Do)
Create React components for:
- [ ] Teacher check-in interface (`/[locale]/kids-checkin`)
- [ ] View checked-in children
- [ ] Check-out interface
- [ ] History view

### 2. Navigation (To Do)
- [ ] Add link to kids check-in in the admin menu
- [ ] Add navigation item for teachers

### 3. Testing (To Do)
Test all workflows:
- [ ] Member child check-in
- [ ] Visitor child check-in
- [ ] Check-out process
- [ ] Different teachers performing operations
- [ ] Parent viewing their children

## File Locations

- ✅ Database Schema: `supabase-checkin-schema.sql`
- ✅ Setup Script: `setup-checkin-api.js`
- ✅ API Routes (temporary): 
  - `src/app/api/check-ins.ts` → move to `src/app/api/check-ins/route.ts`
  - `src/app/api/visitor-children-route.ts` → move to `src/app/api/visitor-children/route.ts`
- ✅ Translations: `messages/pt.json` and `messages/en.json`
- ⏳ UI Components: (to be implemented)
  - `src/app/[locale]/kids-checkin/page.tsx`
  - `src/app/[locale]/kids-checkin/KidsCheckinClient.tsx`

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | Ready to deploy |
| API Routes | ✅ Complete | Need directory setup |
| Translations | ✅ Complete | Both PT and EN |
| Setup Script | ✅ Complete | Ready to run |
| UI Components | ⏳ Pending | Next phase |
| Navigation | ⏳ Pending | Next phase |
| Testing | ⏳ Pending | After UI |

## Quick Start

1. Run setup script:
   ```bash
   node setup-checkin-api.js
   ```

2. Deploy database schema in Supabase SQL Editor:
   ```sql
   -- Run supabase-checkin-schema.sql
   ```

3. Assign teacher role to users:
   ```sql
   UPDATE public.users SET role = 'teacher' WHERE email = 'YOUR_TEACHER_EMAIL';
   ```

4. Proceed with UI implementation (see Next Steps above)

