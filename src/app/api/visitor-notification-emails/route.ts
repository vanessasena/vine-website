import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function authorizeAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { client: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const client = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error: authError } = await client.auth.getUser(authHeader.slice(7));

  if (authError || !user) {
    return { client: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: userData } = await client
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    return { client: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { client, response: null };
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function GET(request: NextRequest) {
  const { client, response } = await authorizeAdmin(request);
  if (response) return response;

  const { data, error } = await client
    .from('visitor_notification_emails')
    .select('email')
    .order('email');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notification emails' }, { status: 500 });
  }

  return NextResponse.json({ data: data.map(({ email }) => email) });
}

export async function POST(request: NextRequest) {
  const { client, response } = await authorizeAdmin(request);
  if (response) return response;

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const { data, error } = await client
    .from('visitor_notification_emails')
    .insert({ email })
    .select('email')
    .single();

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }
  if (error) {
    return NextResponse.json({ error: 'Failed to add notification email' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { client, response } = await authorizeAdmin(request);
  if (response) return response;

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const { data, error } = await client
    .from('visitor_notification_emails')
    .delete()
    .eq('email', email)
    .select('email')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to remove notification email' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Notification email not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}
