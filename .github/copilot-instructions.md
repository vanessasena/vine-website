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
- **Icons**: use Font Awesome icons (via our existing setup) instead of emojis throughout the project

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

## Structured Error Handling & API Calls

### Error System Overview
The application uses a **structured error handling system** to ensure no errors are silent and users always receive clear feedback. All errors follow a unified format with tracking IDs for debugging.

### Error Types
When making API calls, errors are categorized as:
- `validation`: Input validation failed (HTTP 400)
- `not_found`: Resource not found (HTTP 404)
- `unauthorized`: Authentication required/failed (HTTP 401)
- `forbidden`: Insufficient permissions (HTTP 403)
- `conflict`: Resource conflict (HTTP 409)
- `server_error`: Server-side error (HTTP 5xx)
- `network`: Network connectivity issue
- `timeout`: Request timeout (> 30 seconds)
- `partial_failure`: Partial operation success (HTTP 207) - e.g., visitor saved but children failed

### Error Response Format
All API errors return structured responses:
```typescript
{
  success: false,
  error: {
    code: 'ERROR_CODE',           // Machine-readable error code
    type: 'error_type',           // One of the error types above
    message: 'User-friendly message',
    details: {...},               // Additional error context
    requestId: 'req_xxx_yyy',     // Unique ID for support/debugging
    timestamp: '2026-01-25T...'   // ISO timestamp
  }
}
```

### Using useApiCall Hook
For making API calls in client components, **always use the `useApiCall` hook** instead of raw `fetch()`. It handles errors, retries, and timeouts automatically.

**Example:**
```typescript
'use client';
import { useApiCall } from '@/lib/hooks/useApiCall';

export function MyComponent() {
  const { call: apiCall } = useApiCall();

  const handleSubmit = async () => {
    const { data, error } = await apiCall('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (error) {
      // Handle specific error types
      if (error.type === 'partial_failure') {
        setError(`Operation partially failed. ${error.details.failureReason}`);
      } else if (error.type === 'network') {
        setError('Network error. Please check your connection.');
      } else if (error.type === 'timeout') {
        setError('Request timed out. Please try again.');
      } else {
        setError(`${error.message} (ID: ${error.requestId})`);
      }
      return;
    }

    // Process successful response
    console.log('Success:', data);
  };
}
```

### Hook Options
Customize the hook with options:
```typescript
const { call: apiCall } = useApiCall({
  maxRetries: 3,        // Default: 3 (retries on transient errors)
  retryDelay: 1000,     // Default: 1000ms (exponential backoff)
  timeoutMs: 30000,     // Default: 30000ms (30 seconds)
});
```

### Creating Error Responses in API Routes
In `src/app/api/` routes, use `createErrorResponse()` to return structured errors:

```typescript
import { createErrorResponse, generateRequestId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  // Validation error
  if (!required_field) {
    return NextResponse.json(
      createErrorResponse(
        'validation',
        'Field is required',
        'FIELD_MISSING',
        { missingFields: ['field1', 'field2'] },
        requestId
      ),
      { status: 400 }
    );
  }

  // Partial failure example
  if (primaryOperation.ok && secondaryOperation.failed) {
    return NextResponse.json(
      createErrorResponse(
        'partial_failure',
        'Primary saved but secondary failed',
        'PARTIAL_FAILURE',
        { primaryId: result.id, secondaryError: ... },
        requestId
      ),
      { status: 207 } // HTTP 207 Multi-Status
    );
  }

  // Success
  return NextResponse.json(
    { success: true, data: result, requestId },
    { status: 201 }
  );
}
```

### Key Rules
1. **Never silently fail** - Always return errors to the client
2. **Use request IDs** - Every error includes a unique `requestId` for debugging
3. **Distinguish error types** - Show different UX based on error type (network vs validation vs server)
4. **Detect partial failures** - Use HTTP 207 when some operations succeed and others fail
5. **Include details** - In `details` field, provide context to help users understand what happened
6. **Retry transient errors** - Hook automatically retries on 429 (rate limit) and 503 (service unavailable)

### Extracting Errors from API Responses
Use `extractErrorMessage()` to normalize errors from any API:
```typescript
import { extractErrorMessage } from '@/lib/utils';

const errorInfo = await extractErrorMessage(response);
// Returns: { message, type, requestId, details }
```

## Church Information
- Location: Kitchener, Ontario
- Address: 417 King St W, Kitchener, ON N2G 1C2
- Service: Sunday at 10 AM
- Pastor: Pr Boris Carvalho