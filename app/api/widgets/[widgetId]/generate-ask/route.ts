import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidUuid } from '@/lib/validation';
import { z } from 'zod';
import { enforceSameOriginMutation } from '@/lib/security/request-guard';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';
import { requireWidgetOwner } from '@/lib/security/permissions';
import { getAiUsageSnapshot } from '@/lib/billing/plans';
import { resolveBillingContextForUser } from '@/lib/billing/profile';

const generateAskSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(100),
  service: z.string().min(1, 'Service description is required').max(300),
});

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface GeneratedMessages {
  email: { subject: string; body: string };
  whatsapp: string;
  twitter: string;
}

interface GenerateAskResponse extends GeneratedMessages {
  usage: {
    limit: number | null;
    usedThisMonth: number;
    remainingThisMonth: number | null;
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const originGuardResponse = enforceSameOriginMutation(request);
  if (originGuardResponse) return originGuardResponse;

  const { widgetId } = await params;

  if (!isValidUuid(widgetId)) {
    return NextResponse.json({ error: 'Invalid widget ID' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logSecurityEvent({ action: 'widget.generate_ask', outcome: 'denied', detail: 'unauthorized', targetId: widgetId, request });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: 'auth_widget_generate_ask',
    limit: 25,
    windowMs: 60_000,
    keyExtras: [user.id, widgetId],
  });
  if (rateLimitResponse) {
    logSecurityEvent({ action: 'widget.generate_ask', outcome: 'denied', userId: user.id, detail: 'rate_limited', targetId: widgetId, request });
    return rateLimitResponse;
  }

  // Verify widget ownership
  const widget = await requireWidgetOwner({
    supabase,
    userId: user.id,
    widgetId,
    select: 'id, user_id, slug',
  });

  if (!widget) {
    logSecurityEvent({ action: 'widget.generate_ask', outcome: 'denied', userId: user.id, detail: 'not_found_or_not_owner', targetId: widgetId, request });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { profile, plan } = await resolveBillingContextForUser({ supabase, user, syncPlan: true });
  const usage = getAiUsageSnapshot(plan, profile);

  if (usage.remainingThisMonth !== null && usage.remainingThisMonth <= 0) {
    logSecurityEvent({ action: 'widget.generate_ask', outcome: 'denied', userId: user.id, detail: 'monthly_ai_limit_reached', targetId: widgetId, request });
    return NextResponse.json(
      { error: 'Starter includes 5 AI request messages per month. Upgrade to Pro for unlimited AI outreach.' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = generateAskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json(
      { error: 'Groq API key not configured' },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const collectionLink = `${appUrl}/collect/${widget.slug}`;

  const prompt = `Write 3 short outreach messages asking for a testimonial.
Customer name: ${parsed.data.customerName}. What was done for them: ${parsed.data.service}.
Collection link: ${collectionLink}.
Format: one Email (subject + body), one WhatsApp message, one Twitter DM.
Each under 80 words. Warm, specific, not pushy. Return as JSON only, no markdown fencing:
{ "email": { "subject": "...", "body": "..." }, "whatsapp": "...", "twitter": "..." }`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      logSecurityEvent({ action: 'widget.generate_ask', outcome: 'error', userId: user.id, detail: `groq_${res.status}`, targetId: widgetId, request });
      return NextResponse.json(
        { error: `Groq API error: ${res.status} ${errorText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data: GroqResponse = await res.json();
    const rawText = data.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const messages: GeneratedMessages = JSON.parse(cleaned);

    // Validate the shape
    if (!messages.email?.subject || !messages.email?.body || !messages.whatsapp || !messages.twitter) {
      logSecurityEvent({ action: 'widget.generate_ask', outcome: 'error', userId: user.id, detail: 'invalid_ai_response_shape', targetId: widgetId, request });
      return NextResponse.json(
        { error: 'Unexpected response format from AI' },
        { status: 502 }
      );
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
      logSecurityEvent({ action: 'widget.generate_ask', outcome: 'error', userId: user.id, detail: 'ai_usage_save_failed', targetId: widgetId, request });
    }

    const responsePayload: GenerateAskResponse = {
      ...messages,
      usage: {
        limit: usage.limit,
        usedThisMonth: nextUsedThisMonth,
        remainingThisMonth: usage.limit === null ? null : Math.max(usage.limit - nextUsedThisMonth, 0),
      },
    };

    logSecurityEvent({ action: 'widget.generate_ask', outcome: 'success', userId: user.id, targetId: widgetId, request });
    return NextResponse.json(responsePayload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logSecurityEvent({ action: 'widget.generate_ask', outcome: 'error', userId: user.id, detail: message, targetId: widgetId, request });
    return NextResponse.json(
      { error: `Failed to generate messages: ${message}` },
      { status: 500 }
    );
  }
}
