import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidUuid } from '@/lib/validation';
import { z } from 'zod';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';
import { requireAuthenticatedUser, requireTestimonialOwner } from '@/lib/security/permissions';
import { canAccessPricingFeature, getAiUsageSnapshot } from '@/lib/billing/plans';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

const refineSchema = z
  .object({
    mode: z.enum(['grammar', 'shorten', 'tone']),
    tone: z.enum(['professional', 'friendly', 'persuasive']).optional(),
    body: z.string().min(1).max(2000),
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'tone' && !val.tone) {
      ctx.addIssue({ code: 'custom', message: 'tone is required when mode is tone', path: ['tone'] });
    }
  });

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function buildPrompt(mode: z.infer<typeof refineSchema>['mode'], tone: string | undefined, body: string): string {
  const quoted = JSON.stringify(body);
  if (mode === 'grammar') {
    return `You improve client testimonials. Fix grammar, spelling, and clarity only. Preserve meaning, facts, and first-person voice where present. Do not shorten unless fixing errors.

Testimonial text: ${quoted}

Return JSON only, no markdown fences: {"refined":"..."}`;
  }
  if (mode === 'shorten') {
    return `Condense this testimonial into a shorter, high-impact quote suitable for a landing page. Keep the core praise and authenticity. Aim for roughly half the length or fewer, max ~80 words.

Testimonial text: ${quoted}

Return JSON only, no markdown fences: {"refined":"..."}`;
  }
  const t = tone ?? 'professional';
  return `Rewrite this testimonial with a more ${t} tone (${t === 'professional' ? 'polished and credible' : t === 'friendly' ? 'warm and conversational' : 'compelling and confident'}). Keep factual claims accurate; do not invent experiences.

Testimonial text: ${quoted}

Return JSON only, no markdown fences: {"refined":"..."}`;
}

function parseRefinedJson(raw: string): string | null {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as { refined?: unknown };
    if (typeof parsed.refined === 'string' && parsed.refined.trim().length > 0) {
      return parsed.refined.trim().slice(0, 2000);
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const { testimonialId } = await params;

  if (!isValidUuid(testimonialId)) {
    return NextResponse.json({ error: 'Invalid testimonial ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'denied', detail: 'unauthorized', targetId: testimonialId, request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_testimonial_ai_refine',
    limit: 30,
    windowMs: 60_000,
    keyExtras: [user.id, testimonialId],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'denied', userId: user.id, detail: 'rate_limited', targetId: testimonialId, request });
    return rateLimitResponse;
  }

  const testimonial = await requireTestimonialOwner({
    supabase,
    userId: user.id,
    testimonialId,
    select: 'id, widget_id',
  });

  if (!testimonial) {
    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'denied', userId: user.id, detail: 'not_found_or_not_owner', targetId: testimonialId, request });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { profile, plan } = await resolveBillingContextForUser({ supabase, user, syncPlan: true });
  if (!canAccessPricingFeature(plan, 'testimonial_editor')) {
    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'denied', userId: user.id, detail: 'plan_testimonial_editor', targetId: testimonialId, request });
    return NextResponse.json(
      { error: 'AI testimonial tools are available on Pro. Upgrade to refine grammar, length, and tone.' },
      { status: 403 }
    );
  }

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = refineSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload' },
      { status: 400 }
    );
  }

  const usage = getAiUsageSnapshot(plan, profile);

  if (usage.remainingThisMonth !== null && usage.remainingThisMonth <= 0) {
    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'denied', userId: user.id, detail: 'monthly_ai_limit_reached', targetId: testimonialId, request });
    return NextResponse.json(
      { error: 'Starter includes 5 AI request messages per month. Upgrade to Pro for unlimited AI.' },
      { status: 403 }
    );
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
  }

  const prompt = buildPrompt(parsed.data.mode, parsed.data.tone, parsed.data.body);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'error', userId: user.id, detail: `groq_${res.status}`, targetId: testimonialId, request });
      return NextResponse.json(
        { error: `AI error: ${res.status} ${errorText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data: GroqResponse = await res.json();
    const rawText = data.choices?.[0]?.message?.content ?? '';
    const refined = parseRefinedJson(rawText);

    if (!refined) {
      logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'error', userId: user.id, detail: 'invalid_ai_response_shape', targetId: testimonialId, request });
      return NextResponse.json({ error: 'Unexpected response format from AI' }, { status: 502 });
    }

    const nextUsedThisMonth = usage.usedThisMonth + 1;
    const { error: usageUpdateError } = await supabase
      .from('profiles')
      .update({
        ai_requests_used: nextUsedThisMonth,
        ai_requests_period: usage.period,
      })
      .eq('id', user.id);

    if (usageUpdateError) {
      logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'error', userId: user.id, detail: 'ai_usage_save_failed', targetId: testimonialId, request });
    }

    const usagePayload = {
      limit: usage.limit,
      usedThisMonth: nextUsedThisMonth,
      remainingThisMonth: usage.limit === null ? null : Math.max(usage.limit - nextUsedThisMonth, 0),
    };

    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'success', userId: user.id, targetId: testimonialId, request });
    return NextResponse.json({ refined, usage: usagePayload });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logSecurityEvent({ action: 'testimonial.ai_refine', outcome: 'error', userId: user.id, detail: message, targetId: testimonialId, request });
    return NextResponse.json({ error: `Failed to refine: ${message}` }, { status: 500 });
  }
}
