'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Wand2, X, RefreshCw, Copy, Check, Loader2, Crown } from 'lucide-react';
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

export function WriteAskPanel({ widgetId, userPlan, aiUsage }: WriteAskPanelProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<GeneratedMessages | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [usage, setUsage] = useState({
    limit: aiUsage.limit,
    usedThisMonth: aiUsage.usedThisMonth,
    remainingThisMonth: aiUsage.remainingThisMonth,
  });
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

  function handleClose() {
    setOpen(false);
    setMessages(null);
    setCustomerName('');
    setService('');
    setError(null);
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
    <div className="bg-white rounded-2xl border border-violet-200 p-6 mb-6 shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
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
            label="📧 Email"
            sublabel={`Subject: ${messages.email.subject}`}
            text={`Subject: ${messages.email.subject}\n\n${messages.email.body}`}
            fieldKey="email"
            copiedField={copiedField}
            onCopy={copyText}
          />
          <MessageBlock
            label="💬 WhatsApp"
            text={messages.whatsapp}
            fieldKey="whatsapp"
            copiedField={copiedField}
            onCopy={copyText}
          />
          <MessageBlock
            label="🐦 Twitter DM"
            text={messages.twitter}
            fieldKey="twitter"
            copiedField={copiedField}
            onCopy={copyText}
          />
          <button
            type="button"
            onClick={() => {
              setMessages(null);
              setError(null);
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

function MessageBlock({
  label,
  sublabel,
  text,
  fieldKey,
  copiedField,
  onCopy,
}: {
  label: string;
  sublabel?: string;
  text: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          {sublabel && (
            <p className="text-xs text-violet-500 mt-0.5">{sublabel}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onCopy(text, fieldKey)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            copiedField === fieldKey
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-white hover:bg-violet-50 text-gray-600 border border-gray-200 hover:border-violet-200'
          }`}
        >
          {copiedField === fieldKey ? (
            <>
              <Check className="w-3 h-3" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        rows={4}
        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-gray-700 text-sm resize-none focus:outline-none"
      />
    </div>
  );
}
