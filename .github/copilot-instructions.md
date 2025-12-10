<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Vine Church KWC Website

This is a bilingual (Portuguese/English) church website built with Next.js for Vine Church in Cambridge, Ontario.

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
- Location: Cambridge, Ontario
- Address: 55 Dickson Street, 8 Petty Pl, Cambridge, ON N1R 7A5
- Service: Sunday at 10 AM
- Pastor: Pr Boris Carvalho