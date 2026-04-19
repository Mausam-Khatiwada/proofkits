'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wand2, X, RefreshCw, Copy, Check, Loader2, Crown, Send } from 'lucide-react';
import { SiGmail, SiWhatsapp, SiX } from 'react-icons/si';
import type { AiUsageSnapshot } from '@/lib/billing/plans';
import { getUpgradeHref } from '@/lib/billing/plans';

interface GeneratedMessages {
  email: { subject: string; body: string };
  whatsapp: string;
  twitter: string;
}

interface WriteAskPanelProps {
  widgetId: string;
  userPlan: string;
  aiUsage: AiUsageSnapshot;
}

interface GenerateAskResponse extends GeneratedMessages {
  usage?: {
    limit: number | null;
    usedThisMonth: number;
    remainingThisMonth: number | null;
  };
  error?: string;
}

function buildMailtoHref(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildWhatsAppHref(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** First @handle in message (X screen names, 1–15 chars). */
function parseTwitterHandle(text: string): string | null {
  const m = text.match(/@([a-zA-Z0-9_]{1,15})\b/);
  return m ? m[1] : null;
}

function buildTwitterComposeHref(text: string): string {
  const handle = parseTwitterHandle(text);
  if (handle) {
    return `https://x.com/messages/compose?recipient=${encodeURIComponent(handle)}&text=${encodeURIComponent(text)}`;
  }
  return 'https://x.com/messages/compose';
}

export function WriteAskPanel({ widgetId, userPlan, aiUsage }: WriteAskPanelProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<GeneratedMessages | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [twitterSendHint, setTwitterSendHint] = useState<string | null>(null);
  const [usage, setUsage] = useState({
    limit: aiUsage.limit,
    usedThisMonth: aiUsage.usedThisMonth,
    remainingThisMonth: aiUsage.remainingThisMonth,
  });
  useEffect(() => {
    setUsage({
      limit: aiUsage.limit,
      usedThisMonth: aiUsage.usedThisMonth,
      remainingThisMonth: aiUsage.remainingThisMonth,
    });
  }, [aiUsage.limit, aiUsage.usedThisMonth, aiUsage.remainingThisMonth, aiUsage.period]);
  const isPro = userPlan?.toLowerCase() === 'pro';
  const isLocked = !isPro && usage.remainingThisMonth !== null && usage.remainingThisMonth <= 0;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessages(null);
    try {
      const res = await fetch(`/api/widgets/${widgetId}/generate-ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, service }),
      });

      const data = (await res.json()) as GenerateAskResponse;

      if (!res.ok) {
        setError(data.error ?? 'Failed to generate messages');
        setLoading(false);
        return;
      }

      if (data.usage) {
        setUsage(data.usage);
      }

      setMessages({
        email: data.email,
        whatsapp: data.whatsapp,
        twitter: data.twitter,
      });
      setLoading(false);
    } catch {
      setError('Failed to generate messages');
      setLoading(false);
    }
  }

  async function copyText(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function sendTwitterMessage(text: string) {
    setTwitterSendHint(null);
    const handle = parseTwitterHandle(text);
    if (handle) {
      window.open(buildTwitterComposeHref(text), '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Testimonial request', text });
        return;
      }
    } catch {
      // User cancelled share sheet or share failed — fall through.
    }
    await navigator.clipboard.writeText(text);
    window.open('https://x.com/messages/compose', '_blank', 'noopener,noreferrer');
    setTwitterSendHint('Message copied — paste it into your DM in the tab that opened.');
    window.setTimeout(() => setTwitterSendHint(null), 6000);
  }

  function handleClose() {
    setOpen(false);
    setMessages(null);
    setCustomerName('');
    setService('');
    setError(null);
    setTwitterSendHint(null);
  }

  if (!open) {
    if (isLocked) {
      return (
        <Link
          href={getUpgradeHref('ai_outreach')}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-700"
        >
          <Crown className="w-4 h-4" />
          Upgrade for More AI Requests
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all duration-200 text-sm inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Wand2 className="w-4 h-4" />
        {isPro || usage.remainingThisMonth === null
          ? 'AI: Write the ask for me'
          : `AI: Write the ask for me (${usage.remainingThisMonth} left)`}
      </button>
    );
  }

  return (
    <div className="dash-glass mb-6 border border-violet-200/30 p-6 dark:border-violet-500/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              AI Outreach Generator
            </h3>
            <p className="text-xs text-[#7C6D9A]">
              {isPro
                ? 'Unlimited AI request messages included in Pro.'
                : `${usage.usedThisMonth} of ${usage.limit ?? 0} free AI request messages used this month.`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!messages && isLocked ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm font-semibold text-violet-900">Starter AI limit reached</p>
          <p className="mt-1 text-sm text-violet-800">
            You have used all 5 AI request messages for this month. Upgrade to Pro for unlimited AI outreach.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href={getUpgradeHref('ai_outreach')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : !messages ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="ask-customer"
              className="block text-xs text-gray-500 mb-1"
            >
              Customer name
            </label>
            <input
              id="ask-customer"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="e.g. Sarah from Acme Inc"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="ask-service"
              className="block text-xs text-gray-500 mb-1"
            >
              What did you do for them?
            </label>
            <input
              id="ask-service"
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              placeholder="e.g. built their logo and brand identity"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate messages'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <MessageBlock
            platform="email"
            email={messages.email}
            fieldKey="email"
            copiedField={copiedField}
            onCopy={copyText}
          />
          <MessageBlock
            platform="whatsapp"
            text={messages.whatsapp}
            fieldKey="whatsapp"
            copiedField={copiedField}
            onCopy={copyText}
          />
          <div>
            <MessageBlock
              platform="twitter"
              text={messages.twitter}
              fieldKey="twitter"
              copiedField={copiedField}
              onCopy={copyText}
              onSendTwitter={() => sendTwitterMessage(messages.twitter)}
            />
            {twitterSendHint ? (
              <p className="mt-2 text-xs text-violet-600">{twitterSendHint}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setMessages(null);
              setError(null);
              setTwitterSendHint(null);
            }}
            className="text-sm text-[#7C6D9A] hover:text-violet-600 transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate again
          </button>
        </div>
      )}
    </div>
  );
}

const sendButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border border-violet-200 bg-violet-600 text-white hover:bg-violet-700';

function MessageBlock(
  props:
    | {
        platform: 'email';
        email: { subject: string; body: string };
        fieldKey: string;
        copiedField: string | null;
        onCopy: (text: string, field: string) => void;
      }
    | {
        platform: 'whatsapp';
        text: string;
        fieldKey: string;
        copiedField: string | null;
        onCopy: (text: string, field: string) => void;
      }
    | {
        platform: 'twitter';
        text: string;
        fieldKey: string;
        copiedField: string | null;
        onCopy: (text: string, field: string) => void;
        onSendTwitter: () => void | Promise<void>;
      }
) {
  const copyPlain =
    props.platform === 'email'
      ? `Subject: ${props.email.subject}\n\n${props.email.body}`
      : props.text;

  const title =
    props.platform === 'email' ? 'Email' : props.platform === 'whatsapp' ? 'WhatsApp' : 'X DM';

  const mailtoHref =
    props.platform === 'email'
      ? buildMailtoHref(props.email.subject, props.email.body)
      : null;
  const whatsappHref =
    props.platform === 'whatsapp' ? buildWhatsAppHref(props.text) : null;
  const twitterComposeHref =
    props.platform === 'twitter' ? buildTwitterComposeHref(props.text) : null;

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="mt-0.5 shrink-0" aria-hidden>
            {props.platform === 'email' ? (
              <SiGmail className="h-6 w-6 text-[#EA4335]" aria-hidden />
            ) : props.platform === 'whatsapp' ? (
              <SiWhatsapp className="h-6 w-6 text-[#25D366]" aria-hidden />
            ) : (
              <SiX className="h-6 w-6 text-gray-900" aria-hidden />
            )}
          </span>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-800">{title}</span>
            {props.platform === 'email' && (
              <p className="text-xs text-violet-500 mt-0.5 break-words">
                Subject: {props.email.subject}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => props.onCopy(copyPlain, props.fieldKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              props.copiedField === props.fieldKey
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-white hover:bg-violet-50 text-gray-600 border border-gray-200 hover:border-violet-200'
            }`}
          >
            {props.copiedField === props.fieldKey ? (
              <>
                <Check className="w-3 h-3" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>

          {mailtoHref ? (
            <a
              href={mailtoHref}
              className={sendButtonClass}
              aria-label="Open in your mail app to send"
            >
              <Send className="w-3 h-3" />
              Send
            </a>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={sendButtonClass}
              aria-label="Send in WhatsApp"
            >
              <Send className="w-3 h-3" />
              Send
            </a>
          ) : null}
          {props.platform === 'twitter' && twitterComposeHref ? (
            parseTwitterHandle(props.text) ? (
              <a
                href={twitterComposeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={sendButtonClass}
                aria-label="Open X DM compose with this message"
              >
                <Send className="w-3 h-3" />
                Send
              </a>
            ) : (
              <button
                type="button"
                onClick={() => void props.onSendTwitter()}
                className={sendButtonClass}
                aria-label="Share or open X to send this message"
              >
                <Send className="w-3 h-3" />
                Send
              </button>
            )
          ) : null}
        </div>
      </div>
      <textarea
        readOnly
        value={copyPlain}
        rows={4}
        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-gray-700 text-sm resize-none focus:outline-none"
      />
    </div>
  );
}
