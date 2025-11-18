# Supabase Database Setup for Sermons

This document explains how to set up the Supabase database for managing sermons on the Vine Church Cambridge website.

## Overview

The sermons feature now uses Supabase (PostgreSQL) database to store and retrieve sermon content. The implementation includes:

- Database table to store sermons in both Portuguese and English
- Automatic fallback to static data if database is unavailable
- Read-only access for now (admin CRUD functionality to be added later)

## Database Schema

The `sermons` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique identifier for the sermon |
| title_pt | TEXT | Sermon title in Portuguese |
| title_en | TEXT | Sermon title in English |
| preacher | TEXT | Name of the preacher |
| date | DATE | Date the sermon was preached (YYYY-MM-DD) |
| excerpt_pt | TEXT | Short excerpt in Portuguese |
| excerpt_en | TEXT | Short excerpt in English |
| content_pt | TEXT | Full sermon content in Portuguese (Markdown format) |
| content_en | TEXT | Full sermon content in English (Markdown format) |
| scripture | TEXT | Optional Bible verse reference |
| created_at | TIMESTAMP | Auto-generated creation timestamp |
| updated_at | TIMESTAMP | Auto-updated modification timestamp |

## Setup Instructions

### 1. Create the Supabase Table

1. Log in to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the content from `supabase-schema.sql` file
4. Execute the SQL script

This will:
- Create the `sermons` table
- Set up indexes for better performance
- Enable Row Level Security (RLS)
- Create policies for public read access and authenticated write access
- Add the sample sermon data

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials from your project settings:
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the `anon` public key

3. Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the sermons page (`/pt/sermons` or `/en/sermons`)
3. Verify that sermons are being loaded from the database

## How It Works

### Fallback System

The implementation includes a robust fallback mechanism:

1. **Primary**: Attempts to fetch sermons from Supabase database
2. **Fallback**: If the database is unavailable or returns no data, it uses the static sermons from `/src/data/sermons.ts`

This ensures the website continues to work even if:
- Environment variables are not configured
- Supabase is temporarily unavailable
- The database table is empty

### Data Flow

```
User visits /sermons
    ↓
getSortedSermons() called
    ↓
Try to fetch from Supabase
    ↓
Success? → Return database data
    ↓
Error/No data? → Return static data
```

## Adding New Sermons

### Current Method (Manual)

Since the admin page is not yet implemented, sermons can be added manually through the Supabase dashboard:

1. Go to your Supabase project
2. Navigate to Table Editor > sermons
3. Click "Insert row"
4. Fill in all required fields:
   - `id`: Use format "title-slug-YYYY-MM-DD"
   - `title_pt` and `title_en`: Sermon titles
   - `preacher`: Preacher's name
   - `date`: Date in YYYY-MM-DD format
   - `excerpt_pt` and `excerpt_en`: Short descriptions
   - `content_pt` and `content_en`: Full content in Markdown
   - `scripture`: Optional Bible reference
5. Click "Save"

### Future Method (Coming Soon)

An admin page will be created to handle CRUD operations, allowing authorized users to:
- Create new sermons
- Edit existing sermons
- Delete sermons
- Upload and manage sermon content

## Content Format

Sermons are stored in **Markdown format**, supporting:
- Headers (# ## ###)
- Bold (**text**)
- Italic (*text*)
- Blockquotes (> text)
- Lists (- item or 1. item)
- Horizontal rules (---)

## Security

- **Row Level Security (RLS)** is enabled on the sermons table
- Public users have **read-only** access
- Only authenticated users can insert, update, or delete sermons
- The `anon` key used in the frontend only allows read operations

## Troubleshooting

### Sermons not loading from database

Check the browser console or server logs for error messages. Common issues:

1. **Missing environment variables**: Ensure `.env.local` is properly configured
2. **Invalid credentials**: Verify your Supabase URL and anon key
3. **Table doesn't exist**: Make sure you ran the SQL schema script
4. **RLS blocking access**: Verify the public read policy is enabled

### Fallback always being used

If you see "Falling back to static sermons data" in the logs:

1. Check that environment variables are set correctly
2. Verify the Supabase table has data
3. Ensure your Supabase project is active and accessible

## Migration Notes

The static sermon data in `/src/data/sermons.ts` is kept as:
- A fallback mechanism
- A template for the expected data structure
- Historical reference

You can migrate existing sermons to the database using the sample INSERT statement in `supabase-schema.sql` as a template.

## Next Steps

- [ ] Create admin authentication
- [ ] Build admin dashboard for sermon management
- [ ] Add image upload support for sermons
- [ ] Implement sermon search functionality
- [ ] Add sermon categories/tags
