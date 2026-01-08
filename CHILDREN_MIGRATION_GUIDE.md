# Children Table Migration Guide

This guide explains the database migration from JSONB children column to a separate children table.

## Overview

The children data has been moved from a JSONB column in `member_profiles` to a separate `children` table. This change enables:

1. **Two-parent support**: Each child can be associated with two parent members
2. **Check-in system**: Additional fields for allergies, medical notes, special needs, and photo permission
3. **Better data integrity**: Proper foreign key relationships and constraints
4. **Easier querying**: Standard SQL joins instead of JSONB operations

## Database Changes

### New Children Table

```sql
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent1_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  parent2_id UUID REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  allergies TEXT,
  medical_notes TEXT,
  special_needs TEXT,
  photo_permission BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT at_least_one_parent CHECK (parent1_id IS NOT NULL OR parent2_id IS NOT NULL)
);
```

### Removed from member_profiles

- `children JSONB DEFAULT '[]'` column has been removed

## Migration Steps

### 1. Run the Schema Update

Execute the SQL from `supabase-member-schema.sql` file in your Supabase SQL editor:

```bash
# The file contains:
# - DROP TABLE children IF EXISTS
# - CREATE TABLE children with all fields
# - RLS policies
# - Indexes
# - Triggers
# - Permissions
```

### 2. Migrate Existing Data (If Applicable)

If you have existing production data in the `children` JSONB column, you need to migrate it:

```sql
-- Migration script to move JSONB children to separate table
DO $$
DECLARE
  member_record RECORD;
  child_record JSONB;
  child_age INTEGER;
  child_dob DATE;
BEGIN
  -- Loop through all members who have children
  FOR member_record IN
    SELECT id, children
    FROM member_profiles
    WHERE children IS NOT NULL
    AND jsonb_array_length(children) > 0
  LOOP
    -- Loop through each child in the JSONB array
    FOR child_record IN
      SELECT * FROM jsonb_array_elements(member_record.children)
    LOOP
      -- Calculate date of birth from age
      child_age := (child_record->>'age')::INTEGER;
      child_dob := CURRENT_DATE - (child_age || ' years')::INTERVAL;

      -- Insert into children table
      INSERT INTO children (
        name,
        date_of_birth,
        parent1_id,
        parent2_id,
        photo_permission
      ) VALUES (
        child_record->>'name',
        child_dob,
        member_record.id,
        NULL, -- No second parent in old data
        true -- Default permission
      );
    END LOOP;
  END LOOP;
END $$;

-- After verifying migration, remove the old column
ALTER TABLE member_profiles DROP COLUMN IF EXISTS children;
```

### 3. Verify Migration

```sql
-- Check that all children were migrated
SELECT
  mp.name as parent_name,
  c.name as child_name,
  c.date_of_birth,
  EXTRACT(YEAR FROM AGE(c.date_of_birth)) as age
FROM member_profiles mp
JOIN children c ON c.parent1_id = mp.id OR c.parent2_id = mp.id
ORDER BY mp.name, c.date_of_birth;
```

## API Changes

### New Endpoints

**GET /api/children?parent_id={id}**
- Fetches all children for a given parent
- Returns array of Child objects

**POST /api/children**
- Creates a new child
- Required: name, date_of_birth, parent1_id
- Optional: parent2_id, allergies, medical_notes, special_needs, photo_permission

**PUT /api/children**
- Updates a child's information
- Required: id in request body
- All other fields optional

**DELETE /api/children?id={id}**
- Deletes a child record
- Requires child id as query parameter

### Updated Endpoints

**POST/PUT /api/member-profile**
- `children` field has been removed from request/response
- Children are now managed via /api/children endpoint

## Frontend Changes

### MemberProfileClient.tsx
- Children are now stored in separate state: `useState<Child[]>([])`
- Children are fetched separately from member profile
- Add/edit/delete operations call /api/children instead of modifying formData

### MembersAdminClient.tsx
- Admin view fetches children for all members
- Displays children with calculated age from date_of_birth

## Security (RLS Policies)

The children table has comprehensive Row Level Security:

1. **Parents can read their own children**: Members can see children where they are parent1 or parent2
2. **Parents can insert children**: Members can create children with themselves as parent1_id
3. **Parents can update their children**: Members can modify children they are associated with
4. **Parents can delete their children**: Members can remove children they are associated with
5. **Admins have full access**: Users with admin role can manage all children

## Testing Checklist

- [ ] New members can add children with name and date of birth
- [ ] Children display with correct calculated age
- [ ] Members can edit child information
- [ ] Members can delete children
- [ ] Admin view shows all children for all members
- [ ] RLS prevents unauthorized access to other members' children
- [ ] Two parents can be associated with one child (for future use)

## Rollback Plan

If you need to rollback:

1. Re-add children JSONB column to member_profiles
2. Migrate data back from children table to JSONB
3. Drop children table
4. Revert API and frontend code changes

```sql
-- Rollback migration
ALTER TABLE member_profiles ADD COLUMN children JSONB DEFAULT '[]';

UPDATE member_profiles mp
SET children = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', c.name,
      'age', EXTRACT(YEAR FROM AGE(c.date_of_birth))
    )
  )
  FROM children c
  WHERE c.parent1_id = mp.id OR c.parent2_id = mp.id
);

DROP TABLE children;
```
