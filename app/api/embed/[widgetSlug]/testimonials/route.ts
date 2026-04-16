import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Resend } from 'resend';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { sanitizeOptionalPlainText, sanitizePlainText } from '@/lib/security/input-sanitize';
import { emitDomainEvent } from '@/lib/events/outbox';

const testimonialSchema = z.object({
  author_name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  author_role: z.string().max(100, 'Role is too long').optional(),
  author_company: z.string().max(100, 'Company name is too long').optional(),
  body: z.string().min(1, 'Testimonial is required').max(2000, 'Testimonial is too long (max 2000 characters)'),
  rating: z.number().int().min(1).max(5),
});

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ widgetSlug: string }> }
) {
  const { widgetSlug } = await params;
  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'public_embed_testimonial_submit',
    limit: 12,
    windowMs: 60_000,
    keyExtras: [widgetSlug],
  });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabase();

  const { data: widget } = await supabase
    .from('widgets')
    .select('id, user_id, name')
    .eq('slug', widgetSlug)
    .single();

  if (!widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = testimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const sanitizedAuthorName = sanitizePlainText(parsed.data.author_name, 100);
  const sanitizedAuthorRole = sanitizeOptionalPlainText(parsed.data.author_role, 100);
  const sanitizedAuthorCompany = sanitizeOptionalPlainText(parsed.data.author_company, 100);
  const sanitizedBody = sanitizePlainText(parsed.data.body, 2000);

  const { error } = await supabase
    .from('testimonials')
    .insert({
      widget_id: widget.id,
      author_name: sanitizedAuthorName,
      author_role: sanitizedAuthorRole,
      author_company: sanitizedAuthorCompany,
      body: sanitizedBody,
      rating: parsed.data.rating,
      approved: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await emitDomainEvent({
    eventType: 'testimonial.submitted',
    aggregateType: 'widget',
    aggregateId: widget.id,
    payload: {
      widgetId: widget.id,
      widgetSlug,
      rating: parsed.data.rating,
    },
  });

  // Send email notification to widget owner (non-critical)
  try {
    const { data: owner } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', widget.user_id)
      .single();

    if (owner?.email && process.env.RESEND_API_KEY) {
      const safeName = escapeHtml(sanitizedAuthorName);
      const safeBody = escapeHtml(sanitizedBody);
      const safeWidgetName = escapeHtml(widget.name);

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'ProofKits <notifications@proofkit.io>',
        to: owner.email,
        subject: `New testimonial submitted for "${safeWidgetName}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #1e1b4b;">New Testimonial Submitted</h2>
            <p>A new testimonial has been submitted for your widget <strong>${safeWidgetName}</strong>.</p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px;"><strong>${safeName}</strong></p>
              <p style="margin: 0 0 8px; color: #64748b;">${'★'.repeat(parsed.data.rating)}${'☆'.repeat(5 - parsed.data.rating)}</p>
              <p style="margin: 0; color: #334155;">${safeBody}</p>
            </div>
            <p style="color: #64748b;">Log in to your dashboard to review and approve it.</p>
          </div>
        `,
      });
    }
  } catch {
    // Email sending is non-critical; don't fail the request
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetSlug: string }> }
) {
  const { widgetSlug } = await params;
  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'public_embed_testimonial_read',
    limit: 180,
    windowMs: 60_000,
    keyExtras: [widgetSlug],
  });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabase();

  const { data: widget } = await supabase
    .from('widgets')
    .select('id, show_badge, theme')
    .eq('slug', widgetSlug)
    .single();

  if (!widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, author_name, author_role, author_company, author_avatar_url, body, rating, created_at')
    .eq('widget_id', widget.id)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  return new NextResponse(
    JSON.stringify({
      widget: { show_badge: widget.show_badge, theme: widget.theme },
      testimonials: testimonials ?? [],
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
