'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  Loader2,
  Sparkles,
  Minimize2,
  SlidersHorizontal,
  Columns2,
  Save,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import type { Testimonial } from '@/lib/types';
import type { AiUsageSnapshot } from '@/lib/billing/plans';
import { getUpgradeHref } from '@/lib/billing/plans';

type Draft = {
  body: string;
  author_name: string;
  author_role: string;
  author_company: string;
};

function toDraft(t: Testimonial): Draft {
  return {
    body: t.body,
    author_name: t.author_name,
    author_role: t.author_role ?? '',
    author_company: t.author_company ?? '',
  };
}

function draftsEqual(a: Draft, b: Draft): boolean {
  return (
    a.body === b.body &&
    a.author_name === b.author_name &&
    a.author_role === b.author_role &&
    a.author_company === b.author_company
  );
}

export interface TestimonialEditorModalProps {
  testimonial: Testimonial | null;
  open: boolean;
  onClose: () => void;
  userPlan: string;
  aiUsage: AiUsageSnapshot;
  onSaved: () => void;
  onAiUsageChange?: (usage: AiUsageSnapshot) => void;
}

export function TestimonialEditorModal({
  testimonial,
  open,
  onClose,
  userPlan,
  aiUsage,
  onSaved,
  onAiUsageChange,
}: TestimonialEditorModalProps) {
  const [baseline, setBaseline] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [usage, setUsage] = useState(aiUsage);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'persuasive'>('professional');
  const [compareOriginal, setCompareOriginal] = useState(false);
  const [pendingRefinement, setPendingRefinement] = useState<{ before: string; after: string } | null>(null);
  const [aiLoading, setAiLoading] = useState<'grammar' | 'shorten' | 'tone' | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = userPlan?.toLowerCase() === 'pro';
  const aiLocked = !isPro && usage.remainingThisMonth !== null && usage.remainingThisMonth <= 0;

  useEffect(() => {
    setUsage(aiUsage);
  }, [aiUsage]);

  useEffect(() => {
    if (!open || !testimonial) return;
    const d = toDraft(testimonial);
    setBaseline(d);
    setDraft(d);
    setPendingRefinement(null);
    setCompareOriginal(false);
    setError(null);
    setAiLoading(null);
  }, [open, testimonial]);

  const dirty = useMemo(() => {
    if (!baseline || !draft) return false;
    return !draftsEqual(baseline, draft);
  }, [baseline, draft]);

  const requestClose = useCallback(() => {
    if (dirty || pendingRefinement) {
      const ok = window.confirm(
        pendingRefinement
          ? 'Discard your edits and the AI preview?'
          : 'Discard unsaved changes to this testimonial?'
      );
      if (!ok) return;
    }
    onClose();
  }, [dirty, pendingRefinement, onClose]);

  const runRefine = async (mode: 'grammar' | 'shorten' | 'tone') => {
    if (!testimonial || !draft) return;
    if (aiLocked) return;
    setError(null);
    setAiLoading(mode);
    try {
      const res = await fetch(`/api/testimonials/${testimonial.id}/ai-refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          tone: mode === 'tone' ? tone : undefined,
          body: draft.body,
        }),
      });
      const data = (await res.json()) as {
        refined?: string;
        usage?: { limit: number | null; usedThisMonth: number; remainingThisMonth: number | null };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? 'AI refinement failed');
        setAiLoading(null);
        return;
      }
      if (data.usage) {
        const next: AiUsageSnapshot = {
          limit: data.usage.limit,
          usedThisMonth: data.usage.usedThisMonth,
          remainingThisMonth: data.usage.remainingThisMonth,
          period: usage.period,
        };
        setUsage(next);
        onAiUsageChange?.(next);
      }
      if (data.refined) {
        setPendingRefinement({ before: draft.body, after: data.refined });
      }
    } catch {
      setError('AI refinement failed');
    } finally {
      setAiLoading(null);
    }
  };

  const acceptRefinement = () => {
    if (!pendingRefinement || !draft) return;
    setDraft((d) => (d ? { ...d, body: pendingRefinement.after } : d));
    setPendingRefinement(null);
  };

  const discardRefinement = () => {
    setPendingRefinement(null);
  };

  const handleSave = async () => {
    if (!testimonial || !draft || !baseline) return;
    setSaveLoading(true);
    setError(null);
    try {
      const payload: Record<string, string | null> = {};
      if (draft.body !== baseline.body) payload.body = draft.body;
      if (draft.author_name !== baseline.author_name) payload.author_name = draft.author_name;
      const roleTrim = draft.author_role.trim();
      const baseRole = baseline.author_role.trim();
      if (roleTrim !== baseRole) payload.author_role = roleTrim === '' ? null : roleTrim;
      const companyTrim = draft.author_company.trim();
      const baseCompany = baseline.author_company.trim();
      if (companyTrim !== baseCompany) payload.author_company = companyTrim === '' ? null : companyTrim;

      if (Object.keys(payload).length === 0) {
        setSaveLoading(false);
        onClose();
        return;
      }

      const res = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Save failed');
        setSaveLoading(false);
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError('Save failed');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!open || !testimonial || !draft || !baseline) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close editor"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-editor-title"
        className="relative z-[101] flex max-h-[min(92vh,900px)] w-full max-w-3xl flex-col rounded-t-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_-8px_40px_rgba(124,58,237,0.12)] sm:rounded-2xl sm:shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--dash-border)] px-5 py-4">
          <div>
            <h2 id="testimonial-editor-title" className="text-base font-semibold text-[var(--dash-text)]">
              Testimonial editor
            </h2>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Refine copy, run AI assists, and compare versions before saving.
            </p>
            <p className="mt-1 text-[11px] text-[var(--dash-soft)]">
              {isPro
                ? 'Unlimited AI assists on Pro.'
                : `${usage.usedThisMonth} of ${usage.limit ?? 0} AI request messages used this month (shared with outreach generator).`}
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-lg p-2 text-[var(--dash-soft)] transition-colors hover:bg-[var(--dash-surface-muted)] hover:text-[var(--dash-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          {aiLocked ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
              <p className="text-sm text-violet-900">AI assists use your monthly AI quota.</p>
              <Link
                href={getUpgradeHref('ai_outreach')}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
              >
                <Crown className="h-3.5 w-3.5" />
                Upgrade
              </Link>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--dash-muted)]">Author name</label>
              <input
                value={draft.author_name}
                onChange={(e) => setDraft((d) => (d ? { ...d, author_name: e.target.value } : d))}
                className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none ring-violet-500/30 focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--dash-muted)]">Role</label>
              <input
                value={draft.author_role}
                onChange={(e) => setDraft((d) => (d ? { ...d, author_role: e.target.value } : d))}
                placeholder="e.g. Founder"
                className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none ring-violet-500/30 focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[var(--dash-muted)]">Company</label>
              <input
                value={draft.author_company}
                onChange={(e) => setDraft((d) => (d ? { ...d, author_company: e.target.value } : d))}
                placeholder="Optional"
                className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2 text-sm text-[var(--dash-text)] outline-none ring-violet-500/30 focus:ring-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-medium text-[var(--dash-muted)]">Testimonial body</label>
              <button
                type="button"
                onClick={() => setCompareOriginal((c) => !c)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  compareOriginal
                    ? 'border-violet-300 bg-violet-50 text-violet-800'
                    : 'border-[var(--dash-border)] bg-[var(--dash-surface-muted)] text-[var(--dash-text)] hover:border-violet-300/50'
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" />
                {compareOriginal ? 'Hide compare' : 'Compare to original'}
              </button>
            </div>

            {compareOriginal ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-soft)]">Original</p>
                  <div className="min-h-[140px] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] p-3 text-sm leading-relaxed text-[var(--dash-muted)]">
                    {baseline.body}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600">Current draft</p>
                  <textarea
                    value={draft.body}
                    onChange={(e) => setDraft((d) => (d ? { ...d, body: e.target.value } : d))}
                    rows={6}
                    className="w-full resize-y rounded-xl border border-violet-300/40 bg-[var(--dash-surface-muted)] p-3 text-sm leading-relaxed text-[var(--dash-text)] outline-none ring-violet-500/20 focus:ring-2"
                  />
                </div>
              </div>
            ) : (
              <textarea
                value={draft.body}
                onChange={(e) => setDraft((d) => (d ? { ...d, body: e.target.value } : d))}
                rows={8}
                className="w-full resize-y rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] p-3 text-sm leading-relaxed text-[var(--dash-text)] outline-none ring-violet-500/30 focus:ring-2"
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!aiLoading || aiLocked || !draft.body.trim()}
              onClick={() => void runRefine('grammar')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--dash-text)] transition-colors hover:border-violet-300/50 hover:bg-violet-500/10 disabled:opacity-50"
            >
              {aiLoading === 'grammar' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-violet-600" />}
              Fix grammar
            </button>
            <button
              type="button"
              disabled={!!aiLoading || aiLocked || !draft.body.trim()}
              onClick={() => void runRefine('shorten')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--dash-text)] transition-colors hover:border-violet-300/50 hover:bg-violet-500/10 disabled:opacity-50"
            >
              {aiLoading === 'shorten' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Minimize2 className="h-3.5 w-3.5 text-cyan-600" />}
              Shorten
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-w-0 items-center gap-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-2 py-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as typeof tone)}
                  className="min-w-[8.5rem] max-w-full cursor-pointer bg-transparent text-xs font-semibold text-[var(--dash-text)] outline-none"
                  disabled={!!aiLoading || aiLocked}
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </span>
              <button
                type="button"
                disabled={!!aiLoading || aiLocked || !draft.body.trim()}
                onClick={() => void runRefine('tone')}
                className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {aiLoading === 'tone' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Optimize tone'
                )}
              </button>
            </div>
          </div>

          {pendingRefinement ? (
            <div className="mt-5 rounded-2xl border border-[var(--dash-border)] bg-gradient-to-br from-violet-500/12 to-[var(--dash-surface-muted)] p-4">
              <p className="text-xs font-semibold text-violet-900">AI preview — compare before accepting</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-soft)]">Before</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] p-3 text-sm leading-relaxed text-[var(--dash-muted)]">
                    {pendingRefinement.before}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">After (AI)</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-emerald-200/60 bg-emerald-500/10 p-3 text-sm leading-relaxed text-[var(--dash-text)]">
                    {pendingRefinement.after}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={acceptRefinement}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  Use refined version
                </button>
                <button
                  type="button"
                  onClick={discardRefinement}
                  className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--dash-text)] hover:bg-[var(--dash-surface)]"
                >
                  Keep current draft
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--dash-border)] px-5 py-4">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-surface-muted)] hover:text-[var(--dash-text)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saveLoading || !dirty}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
