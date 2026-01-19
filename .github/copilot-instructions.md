<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Vine Church KWC Website

This is a bilingual (Portuguese/English) church website built with Next.js for Vine Church in Kitchener, Ontario.

## Project Overview
- **Technology**: Next.js with React
- **Languages**: Portuguese (default) and English
- **Deployment**: Vercel
- **Database**: Supabase (PostgreSQL with authentication and storage)
- **Features**: Responsive design, internationalization, modern church website layout

## Development Guidelines
- Portuguese is the primary language and should be the default
- English translations should be complete and accurate
- Follow modern web development practices
- Ensure mobile responsiveness
- Use semantic HTML and accessibility best practices
- All locale-aware routes should use `/${locale}/...` pattern
- Client components can extract locale from pathname using `usePathname()`
- **Always check for and reuse existing utility functions** in `src/lib/` before creating new ones
- **Never duplicate code** - if functionality exists, import and use it

## Database & Backend
- **Supabase**: Backend-as-a-Service for database, authentication, and file storage
- **Tables**:
  - `sermons`: Stores sermon content with bilingual fields (title_pt, title_en, content_pt, content_en, etc.)
  - `vine_kids_gallery`: Stores gallery images with bilingual alt text and metadata
- **Storage**: Supabase Storage bucket `website` for images and media files
- **Authentication**: Email/password authentication for admin access
- **API Routes**: Located in `src/app/api/` for CRUD operations

## Admin Panel
- **Access**: `/${locale}/admin` (requires authentication)
- **Login**: `/${locale}/login`
- **Features**:
  - Sermon management (CRUD operations with bilingual content)
  - Vine Kids gallery management (upload, edit, delete images)
  - Markdown preview support for sermon content
  - Inline editing for gallery image metadata (alt text, display order)
- **Authentication**: Uses Supabase Auth with session management
- **Data Source Indicator**: Shows whether data is from database or static fallback

## Kids Check-in System
- **Access**: `/${locale}/kids-checkin` (requires authentication as teacher or admin)
- **Features**:
  - Check in/out member children and visitor children
  - Capture visitor child information (name, DOB, parent details, allergies, special needs, emergency contact)
  - View currently checked-in children with health and emergency information
  - Check-in history with date range and status filtering
- **Authentication Pattern**: Server page passes locale to client component, which handles auth check
  - Use `createClient()` with Supabase in client components to verify session
  - Check user role from `users` table (must be 'teacher' or 'admin')
  - Redirect to login if not authenticated, to home if insufficient permissions
- **Database Tables**:
  - `visitor_children`: Stores temporary visitor child records
  - `check_ins`: Tracks all check-in/check-out events
  - `current_checked_in_children` view: Quick access to currently checked-in children
- **API Routes**:
  - `GET/POST/PUT /api/check-ins`: Manage check-in records
  - `GET/POST/PUT /api/visitor-children`: Manage visitor child records
  - Both routes require role-based access control (teacher/admin only)

## Content Structure
- Quem somos (About Us)
- Agenda (Schedule)
- Vine Kids (Children's Ministry)
  - Gallery: Dynamic photo gallery from database
- Galeria (Gallery)
- Palavras (Words/Sermons)
  - Dynamic sermon listing and detail pages
  - Markdown-formatted content
- Células (Cell Groups)

## Church Information

## Common Issues & Solutions

### Date Display Issues
**Problem**: Dates from database showing one day earlier when displayed
**Cause**: ISO date strings (e.g., "2020-01-15") are treated as UTC by JavaScript's `new Date()`, causing timezone offset issues
**Solution**: Always use `formatLocalDate()` from `src/lib/utils.ts` to display dates from the database
```typescript
import { formatLocalDate } from '@/lib/utils';
// Use formatLocalDate(dateString) instead of new Date(dateString).toLocaleDateString()
```

## Utility Functions
- **`formatLocalDate(dateString)`**: Formats ISO date strings as local dates, avoiding timezone offset issues. Located in `src/lib/utils.ts`

## Church Information
- Location: Kitchener, Ontario
- Address: 417 King St W, Kitchener, ON N2G 1C2
- Service: Sunday at 10 AM
- Pastor: Pr Boris Carvalho