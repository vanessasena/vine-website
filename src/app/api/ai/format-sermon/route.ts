import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { sermonModel } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse, generateRequestId } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Query user role using the service role client (bypasses RLS on the users table)
async function getUserRoleWithServiceClient(supabase: ReturnType<typeof createClient<any>>, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return (data as { role: string }).role;
}

const MAX_TEXT_LENGTH = 50_000;

const SermonOutputSchema = z.object({
  title_pt: z.string().describe('Sermon title in Portuguese (concise, 5-10 words)'),
  title_en: z.string().describe('Sermon title in English (concise, 5-10 words)'),
  scripture: z.string().describe('Main Bible scripture reference(s) found in the text, e.g. "João 3:16" or "John 3:16 / João 3:16". Empty string if none found.'),
  content_pt: z.string().describe('Full sermon content in Portuguese, formatted in Markdown. Use # for main title, ## for section headings, ### for sub-headings, **bold** for key phrases, > for Bible quotes/verses, - for list items, and blank lines between paragraphs. Preserve all theological meaning.'),
  content_en: z.string().describe('Full sermon content translated to English, formatted in Markdown. Same structure as the Portuguese version. Natural, fluent English.'),
  excerpt_pt: z.string().describe('A concise 3-sentence summary of the sermon in Portuguese. Plain text, no markdown.'),
  excerpt_en: z.string().describe('A concise 3-sentence summary of the sermon in English. Plain text, no markdown.'),
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  // Check if AI Gateway API key is configured
  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      createErrorResponse(
        'server_error',
        'AI service is not configured. Please set AI_GATEWAY_API_KEY.',
        'AI_NOT_CONFIGURED',
        undefined,
        requestId
      ),
      { status: 503 }
    );
  }

  // Auth check via Bearer token (session is stored in localStorage, not cookies)
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      createErrorResponse('unauthorized', 'Authentication required', 'UNAUTHORIZED', undefined, requestId),
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      createErrorResponse('unauthorized', 'Authentication required', 'UNAUTHORIZED', undefined, requestId),
      { status: 401 }
    );
  }

  const role = await getUserRoleWithServiceClient(supabase, user.id);
  if (role !== 'admin' && role !== 'trainee') {
    return NextResponse.json(
      createErrorResponse('forbidden', 'Insufficient permissions', 'FORBIDDEN', undefined, requestId),
      { status: 403 }
    );
  }

  // Parse and validate body
  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      createErrorResponse('validation', 'Invalid JSON body', 'INVALID_JSON', undefined, requestId),
      { status: 400 }
    );
  }

  const { text } = body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      createErrorResponse('validation', 'Text is required', 'TEXT_REQUIRED', undefined, requestId),
      { status: 400 }
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      createErrorResponse(
        'validation',
        `Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`,
        'TEXT_TOO_LONG',
        { length: text.length, maxLength: MAX_TEXT_LENGTH },
        requestId
      ),
      { status: 400 }
    );
  }

  try {
    const { object } = await generateObject({
      model: sermonModel,
      schema: SermonOutputSchema,
      prompt: `You are a church content editor for Vine Church KWC, a Brazilian church in Kitchener, Ontario. Your task is to process the following raw sermon text (in Portuguese) and produce structured bilingual content.

Instructions:
1. **Format** the full sermon content in Portuguese using Markdown:
   - Use # for the main title/theme
   - Use ## for major section headings
   - Use ### for sub-points
   - Use **bold** for key theological phrases and important points
   - Use > (blockquote) for Bible verses and scripture quotes
   - Separate paragraphs with blank lines
   - Use - for bullet lists where appropriate
   - Keep all the theological content and meaning intact

2. **Translate** the formatted Portuguese Markdown content to natural, fluent English, preserving the Markdown structure.

3. **Generate a title** in both Portuguese and English (concise, 5-10 words, capturing the main theme).

4. **Extract scripture references** — list all Bible book/chapter:verse references found in the text (e.g., "João 3:16 / John 3:16"). Return empty string if none.

5. **Write a 3-sentence summary** in Portuguese (plain text, no markdown) capturing the main message.

6. **Write a 3-sentence summary** in English (plain text, no markdown) translating/adapting the Portuguese summary.

Raw sermon text:
---
${text.trim()}
---`,
    });

    return NextResponse.json({ success: true, data: object, requestId }, { status: 200 });
  } catch (err) {
    console.error('AI processing error:', err);
    return NextResponse.json(
      createErrorResponse(
        'server_error',
        'Failed to process sermon with AI. Please try again.',
        'AI_ERROR',
        undefined,
        requestId
      ),
      { status: 500 }
    );
  }
}
