'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sun, Moon, Copy, Check, Sparkles, Layers, Zap, FlaskConical, LayoutGrid, Eye, Code2, X, Lock, Crown } from 'lucide-react';
import {
  TESTIMONIAL_STYLES,
  sampleTestimonial,
  type StyleMode,
  type StyleDefinition,
} from './testimonial-styles';
import { FREE_STYLE_LIMIT, getUpgradeHref, isStyleLockedForPlan } from '@/lib/billing/plans';

type Category = 'all' | 'simple' | 'premium' | 'animated' | 'experimental';

interface StyleGalleryContentProps {
  widgets: { id: string; name: string; slug: string }[];
  userPlan: string;
}

const CATEGORY_META: Record<Category, { label: string; icon: typeof LayoutGrid }> = {
  all: { label: 'All Styles', icon: LayoutGrid },
  simple: { label: 'Simple', icon: Layers },
  premium: { label: 'Premium', icon: Sparkles },
  animated: { label: 'Animated', icon: Zap },
  experimental: { label: 'Experimental', icon: FlaskConical },
};

export function StyleGalleryContent({ widgets, userPlan }: StyleGalleryContentProps) {
  const isPro = userPlan?.toLowerCase() === 'pro';
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [styleModes, setStyleModes] = useState<Record<string, StyleMode>>(() => {
    const initial: Record<string, StyleMode> = {};
    TESTIMONIAL_STYLES.forEach((s) => {
      initial[s.id] = 'light';
    });
    return initial;
  });
  const [previewStyle, setPreviewStyle] = useState<StyleDefinition | null>(null);
  const [embedModal, setEmbedModal] = useState<StyleDefinition | null>(null);
  const [selectedWidget, setSelectedWidget] = useState(widgets[0]?.slug ?? '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered =
    activeCategory === 'all'
      ? TESTIMONIAL_STYLES
      : TESTIMONIAL_STYLES.filter((s) => s.category === activeCategory);

  function toggleMode(styleId: string) {
    setStyleModes((prev) => ({
      ...prev,
      [styleId]: prev[styleId] === 'light' ? 'dark' : 'light',
    }));
  }

  function getEmbedCode(style: StyleDefinition) {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<div id="proofengine-widget"></div>\n<script src="${appUrl}/widget.js" data-widget-slug="${selectedWidget}" data-style="${style.id}" data-theme="${styleModes[style.id] ?? 'light'}"></script>`;
  }

  async function handleCopy(style: StyleDefinition) {
    const code = getEmbedCode(style);
    await navigator.clipboard.writeText(code);
    setCopiedId(style.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const categoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      simple: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
      premium: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
      animated: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      experimental: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    };
    return colors[cat] ?? 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-auto min-h-[4rem] bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex flex-wrap items-center justify-between gap-2 py-2">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Style Gallery ✨
          </h1>
          <p className="text-sm text-[#7C6D9A] -mt-0.5">
            {isPro
              ? `All ${TESTIMONIAL_STYLES.length} styles unlocked`
              : `${FREE_STYLE_LIMIT} of ${TESTIMONIAL_STYLES.length} styles free — upgrade for all`}
          </p>
        </div>
        {!isPro && (
          <Link
            href={getUpgradeHref('premium_styles')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        )}
      </header>

      <div className="px-4 py-6 md:px-8">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const isActive = activeCategory === cat;
            const count =
              cat === 'all'
                ? TESTIMONIAL_STYLES.length
                : TESTIMONIAL_STYLES.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white text-gray-600 border border-[#EDE9FE] hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {meta.label}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Style Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((style) => {
            const Component = style.component;
            const mode = styleModes[style.id] ?? 'light';
            const isDark = mode === 'dark';
            // Use the global index from TESTIMONIAL_STYLES for gating
            const globalIndex = TESTIMONIAL_STYLES.findIndex((s) => s.id === style.id);
            const isLocked = !isPro && isStyleLockedForPlan(userPlan, globalIndex);

            return (
              <div
                key={style.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-[0_1px_3px_rgba(124,58,237,0.06)] transition-all duration-300 group style-gallery-card ${
                  isLocked
                    ? 'border-gray-200/60 opacity-95'
                    : 'border-[#EDE9FE] hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)]'
                }`}
              >
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-[#EDE9FE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {style.name}
                    </h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${categoryBadge(style.category)}`}>
                      {style.category}
                    </span>
                    {isLocked && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700">
                        <Crown className="w-3 h-3" />
                        PRO
                      </span>
                    )}
                  </div>
                  {/* Light/Dark Toggle */}
                  <button
                    type="button"
                    onClick={() => !isLocked && toggleMode(style.id)}
                    disabled={isLocked}
                    className={`relative w-16 h-8 rounded-full p-1 transition-all duration-500 ${
                      isDark
                        ? 'bg-[#1a1a2e] border border-violet-500/30'
                        : 'bg-amber-100 border border-amber-200'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isLocked ? 'Upgrade to Pro to unlock' : `Switch to ${isDark ? 'light' : 'dark'} mode`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isDark
                          ? 'translate-x-8 bg-indigo-600'
                          : 'translate-x-0 bg-amber-400'
                      }`}
                    >
                      {isDark ? (
                        <Moon className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Preview Area */}
                <div className="relative">
                  <div
                    className={`p-5 transition-colors duration-500 style-preview-isolate ${
                      isDark
                        ? 'bg-[#0d1117]'
                        : ''
                    } ${isLocked ? 'blur-[2px] select-none pointer-events-none' : ''}`}
                    style={!isDark ? { background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' } : undefined}
                  >
                    <Component data={sampleTestimonial} mode={mode} />
                  </div>
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px]">
                      <div className="flex flex-col items-center gap-2 p-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Pro Style</p>
                        <Link
                          href={getUpgradeHref('premium_styles')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-500/20"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Unlock with Pro
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-[#EDE9FE] flex items-center justify-between bg-white">
                  <p className="text-xs text-gray-400 max-w-[60%] truncate">
                    {style.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreviewStyle(style)}
                          className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="Full Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmbedModal(style);
                            setSelectedWidget(widgets[0]?.slug ?? '');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          Get Code
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-16 text-center">
            <Sparkles className="w-12 h-12 text-violet-200 mx-auto" />
            <p className="text-gray-400 font-medium mt-3">
              No styles in this category yet
            </p>
          </div>
        )}
      </div>

      {/* ── Full Preview Modal ── */}
      {previewStyle && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setPreviewStyle(null)}
        >
          <div
            className="w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {previewStyle.name}
                </h3>
                <button
                  type="button"
                  onClick={() => toggleMode(previewStyle.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                >
                  {styleModes[previewStyle.id] === 'dark' ? (
                    <><Sun className="w-3.5 h-3.5" /> Light</>
                  ) : (
                    <><Moon className="w-3.5 h-3.5" /> Dark</>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPreviewStyle(null)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className={`rounded-2xl p-8 transition-colors duration-500 style-preview-isolate ${
                styleModes[previewStyle.id] === 'dark'
                  ? 'bg-[#0d1117]'
                  : ''
              }`}
              style={styleModes[previewStyle.id] !== 'dark' ? { background: '#ffffff' } : undefined}
            >
              {(() => {
                const C = previewStyle.component;
                return (
                  <C
                    data={sampleTestimonial}
                    mode={styleModes[previewStyle.id] ?? 'light'}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Embed Code Modal ── */}
      {embedModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setEmbedModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-[#EDE9FE]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Embed {embedModal.name}
                </h2>
                <p className="text-sm text-[#7C6D9A]">
                  Copy this code and paste it into your site
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmbedModal(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Widget Selector */}
            {widgets.length > 0 ? (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Select Widget
                </label>
                <select
                  value={selectedWidget}
                  onChange={(e) => setSelectedWidget(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
                >
                  {widgets.map((w) => (
                    <option key={w.id} value={w.slug}>
                      {w.name} (/{w.slug})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                Create a widget first to get an embed code.
              </div>
            )}

            {/* Theme Selector */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">
                Theme
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setStyleModes((prev) => ({ ...prev, [embedModal.id]: 'light' }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    styleModes[embedModal.id] === 'light'
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-amber-200'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStyleModes((prev) => ({ ...prev, [embedModal.id]: 'dark' }))
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    styleModes[embedModal.id] === 'dark'
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-gray-900 rounded-xl p-4 mb-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {getEmbedCode(embedModal)}
              </pre>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={() => handleCopy(embedModal)}
              disabled={!selectedWidget}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copiedId === embedModal.id ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Embed Code
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
