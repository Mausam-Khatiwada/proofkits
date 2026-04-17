'use client';

import { Star, Quote, Terminal, Zap, Heart } from 'lucide-react';

export interface TestimonialData {
  author: string;
  body: string;
  rating: number;
  role?: string;
  company?: string;
}

export type StyleMode = 'light' | 'dark';

interface StyleProps {
  data: TestimonialData;
  mode: StyleMode;
}

const sampleTestimonial: TestimonialData = {
  author: 'Sarah Chen',
  body: 'ProofEngine transformed how we collect social proof. Our conversion rate jumped 34% in just two weeks. The setup was incredibly easy and the results speak for themselves.',
  rating: 5,
  role: 'Head of Growth',
  company: 'Vercel',
};

export { sampleTestimonial };

// ─── Helper: Star Rating ───
function Stars({ rating, color = 'text-amber-400' }: { rating: number; color?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? `fill-current ${color}` : 'text-gray-300/40'}`}
        />
      ))}
    </div>
  );
}

// ─── Helper: Initials Avatar ───
function Avatar({ name, bg }: { name: string; bg: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${bg}`}
    >
      {initials}
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 1: Classic Card
// ══════════════════════════════════════
export function ClassicCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-300 ${
        dark
          ? 'bg-[#1a1a2e] border-[#2a2a4a] text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{ boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      <Stars rating={data.rating} />
      <p className={`text-sm leading-relaxed mt-3 mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
        &ldquo;{data.body}&rdquo;
      </p>
      <div className={`flex items-center gap-3 pt-3 border-t ${dark ? 'border-white/10' : 'border-gray-100'}`}>
        <Avatar name={data.author} bg="bg-violet-600" />
        <div>
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{data.author}</p>
          {(data.role || data.company) && (
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {[data.role, data.company].filter(Boolean).join(' at ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 2: Minimal
// ══════════════════════════════════════
export function MinimalStyle({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`p-6 rounded-2xl transition-all duration-300 ${
        dark ? 'bg-[#161625] text-white' : 'bg-white text-gray-900'
      }`}
      style={{ boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <p
        className={`text-base leading-relaxed font-light italic ${
          dark ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        &ldquo;{data.body}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-8 h-px ${dark ? 'bg-gray-500' : 'bg-gray-400'}`} />
        <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>
          {data.author}
          {data.company && (
            <span className={`font-normal ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              , {data.company}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 3: Gradient Glow
// ══════════════════════════════════════
export function GradientGlow({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div className="relative rounded-2xl p-[2px] style-gradient-glow-border">
      <div
        className={`rounded-2xl p-6 h-full ${
          dark ? 'bg-[#0f0f23] text-white' : 'bg-white text-gray-900'
        }`}
      >
        <Stars rating={data.rating} color={dark ? 'text-violet-400' : 'text-violet-500'} />
        <p className={`text-sm leading-relaxed mt-3 mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          &ldquo;{data.body}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <Avatar name={data.author} bg="bg-gradient-to-br from-violet-500 to-cyan-500" />
          <div>
            <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{data.author}</p>
            {(data.role || data.company) && (
              <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                {[data.role, data.company].filter(Boolean).join(' at ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 4: Glassmorphism
// ══════════════════════════════════════
export function GlassCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 ${
        dark
          ? 'bg-white/5 border-white/10 text-white'
          : 'bg-white/90 border-gray-200/80 text-gray-900'
      }`}
      style={{
        boxShadow: dark
          ? '0 8px 32px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 8px 32px rgba(100,100,140,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      <Stars rating={data.rating} />
      <p className={`text-sm leading-relaxed mt-3 mb-4 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
        &ldquo;{data.body}&rdquo;
      </p>
      <div className={`flex items-center gap-3 pt-3 border-t ${dark ? 'border-white/10' : 'border-gray-200/60'}`}>
        <Avatar name={data.author} bg={dark ? 'bg-violet-500/80' : 'bg-violet-600'} />
        <div>
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{data.author}</p>
          {(data.role || data.company) && (
            <p className={`text-xs ${dark ? 'text-violet-300/70' : 'text-gray-500'}`}>
              {[data.role, data.company].filter(Boolean).join(' at ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 5: Neon Pulse
// ══════════════════════════════════════
export function NeonPulse({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-2xl p-6 border-2 transition-all duration-300 style-neon-pulse ${
        dark
          ? 'bg-[#0a0a1a] border-cyan-400/60 text-white'
          : 'bg-white border-cyan-500 text-gray-900'
      }`}
      style={{
        boxShadow: dark
          ? '0 0 20px rgba(34,211,238,0.15), 0 0 60px rgba(34,211,238,0.05), inset 0 0 20px rgba(34,211,238,0.03)'
          : '0 0 15px rgba(6,182,212,0.15), 0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <Stars rating={data.rating} color={dark ? 'text-cyan-400' : 'text-cyan-600'} />
      <p className={`text-sm leading-relaxed mt-3 mb-4 ${dark ? 'text-cyan-100/80' : 'text-gray-700'}`}>
        &ldquo;{data.body}&rdquo;
      </p>
      <div className={`flex items-center gap-3 pt-3 border-t ${dark ? 'border-cyan-400/20' : 'border-cyan-200'}`}>
        <Avatar name={data.author} bg={dark ? 'bg-cyan-600' : 'bg-cyan-700'} />
        <div>
          <p className={`text-sm font-semibold ${dark ? 'text-cyan-100' : 'text-gray-900'}`}>
            {data.author}
          </p>
          {(data.role || data.company) && (
            <p className={`text-xs ${dark ? 'text-cyan-400/60' : 'text-gray-500'}`}>
              {[data.role, data.company].filter(Boolean).join(' at ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 6: Slide-In Card
// ══════════════════════════════════════
export function SlideInCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-300 style-slide-in ${
        dark
          ? 'bg-[#1a1a2e] border-[#2a2a4a] text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{
        boxShadow: dark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-1 self-stretch rounded-full flex-shrink-0 ${
            dark ? 'bg-gradient-to-b from-violet-500 to-cyan-500' : 'bg-gradient-to-b from-violet-500 to-indigo-500'
          }`}
        />
        <div>
          <Stars rating={data.rating} />
          <p className={`text-sm leading-relaxed mt-2 mb-4 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            &ldquo;{data.body}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <Avatar name={data.author} bg="bg-gradient-to-br from-violet-600 to-indigo-600" />
            <div>
              <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{data.author}</p>
              {(data.role || data.company) && (
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {[data.role, data.company].filter(Boolean).join(' at ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 7: Brutalist
// ══════════════════════════════════════
export function BrutalistCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`p-6 border-4 transition-all duration-300 ${
        dark
          ? 'bg-[#111] border-white text-white'
          : 'bg-[#fffdf5] border-black text-black'
      }`}
      style={{
        boxShadow: dark ? '8px 8px 0px #fff' : '8px 8px 0px #000',
      }}
    >
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="text-lg">
            {i <= data.rating ? '■' : '□'}
          </span>
        ))}
      </div>
      <p
        className={`text-sm leading-relaxed mb-4 font-mono ${
          dark ? 'text-gray-200' : 'text-gray-800'
        }`}
      >
        &quot;{data.body}&quot;
      </p>
      <div className={`pt-3 border-t-4 ${dark ? 'border-white/40' : 'border-black/30'}`}>
        <p className={`font-mono font-bold text-sm uppercase tracking-wider ${dark ? 'text-white' : 'text-black'}`}>{data.author}</p>
        {(data.role || data.company) && (
          <p className={`font-mono text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            {[data.role, data.company].filter(Boolean).join(' // ')}
          </p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 8: Retro Terminal
// ══════════════════════════════════════
export function RetroTerminal({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-300 border ${
        dark ? 'border-green-500/30' : 'border-gray-300'
      }`}
    >
      {/* Title Bar */}
      <div className="px-4 py-2 flex items-center gap-2 bg-[#1e1e2e]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] font-mono text-gray-400 ml-2">testimonial.sh</span>
      </div>
      {/* Content */}
      <div
        className={`p-5 font-mono text-sm ${
          dark ? 'bg-[#0d1a0d] text-green-400' : 'bg-[#1a1a28] text-green-400'
        }`}
      >
        <p className="text-xs text-green-600 mb-2">
          <Terminal className="w-3 h-3 inline mr-1" />
          $ cat review.txt
        </p>
        <p className="leading-relaxed mb-3 text-green-300/90">
          &gt; &quot;{data.body}&quot;
        </p>
        <div className="pt-2 border-t border-green-500/20">
          <p className="text-green-500 text-xs">
            -- {data.author}
            {data.role && ` [${data.role}`}
            {data.company && ` @ ${data.company}`}
            {data.role && ']'}
          </p>
          <p className="text-green-600/60 text-xs mt-1">
            rating: {'★'.repeat(data.rating)}{'☆'.repeat(5 - data.rating)}
          </p>
          <span className="style-typing-cursor inline-block text-green-400 text-xs mt-1">_</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 9: Magazine Quote
// ══════════════════════════════════════
export function MagazineQuote({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`p-8 rounded-2xl transition-all duration-300 relative overflow-hidden border ${
        dark
          ? 'bg-[#1a1a2e] border-[#2a2a4a] text-white'
          : 'bg-[#fefdfb] border-[#e8e0d4] text-gray-900'
      }`}
      style={{ boxShadow: dark ? 'none' : '0 2px 12px rgba(120,100,70,0.08)' }}
    >
      {/* Large decorative quote */}
      <Quote
        className={`w-16 h-16 absolute -top-1 -left-1 ${
          dark ? 'text-violet-500/15' : 'text-amber-700/10'
        }`}
        style={{ transform: 'rotate(180deg)' }}
      />
      <div className="relative z-10">
        <p
          className={`text-lg leading-relaxed mb-6 italic ${
            dark ? 'text-gray-200' : 'text-gray-800'
          }`}
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          &ldquo;{data.body}&rdquo;
        </p>
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-px ${
              dark ? 'bg-violet-500/40' : 'bg-amber-800/30'
            }`}
          />
          <div>
            <p
              className={`text-sm font-semibold tracking-wide uppercase ${dark ? 'text-white' : 'text-gray-900'}`}
              style={{ letterSpacing: '0.12em' }}
            >
              {data.author}
            </p>
            {(data.role || data.company) && (
              <p
                className={`text-xs mt-0.5 ${
                  dark ? 'text-violet-300/60' : 'text-gray-500'
                }`}
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
              >
                {[data.role, data.company].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 mt-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i <= data.rating
                  ? dark
                    ? 'fill-violet-400 text-violet-400'
                    : 'fill-amber-500 text-amber-500'
                  : dark
                    ? 'text-gray-600'
                    : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 10: Floating Bubble
// ══════════════════════════════════════
export function FloatingBubble({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div className="style-float-bubble">
      {/* Bubble */}
      <div
        className={`rounded-3xl p-6 relative transition-all duration-300 ${
          dark
            ? 'bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/20 text-white'
            : 'bg-white border border-violet-300/50 text-gray-900'
        }`}
        style={{
          boxShadow: dark
            ? '0 12px 40px rgba(139, 92, 246, 0.12)'
            : '0 8px 30px rgba(139, 92, 246, 0.1)',
        }}
      >
        <Stars rating={data.rating} color={dark ? 'text-violet-400' : 'text-violet-500'} />
        <p className={`text-sm leading-relaxed mt-3 ${dark ? 'text-violet-100/80' : 'text-gray-700'}`}>
          &ldquo;{data.body}&rdquo;
        </p>
        {/* Tail */}
        <div
          className={`absolute -bottom-2.5 left-8 w-5 h-5 rotate-45 ${
            dark
              ? 'bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border-b border-r border-violet-500/20'
              : 'bg-white border-b border-r border-violet-300/50'
          }`}
        />
      </div>
      {/* Author below bubble */}
      <div className="flex items-center gap-3 mt-5 ml-4">
        <Avatar
          name={data.author}
          bg={dark ? 'bg-violet-700' : 'bg-violet-600'}
        />
        <div>
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
            {data.author}
          </p>
          {(data.role || data.company) && (
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {[data.role, data.company].filter(Boolean).join(' at ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 11: Polaroid
// ══════════════════════════════════════
export function PolaroidCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className="transition-all duration-300"
      style={{
        transform: 'rotate(-1.5deg)',
      }}
    >
      <div
        className={`p-5 pb-8 rounded-sm ${
          dark ? 'bg-[#2a2a2a]' : 'bg-white'
        }`}
        style={{
          boxShadow: dark
            ? '0 6px 25px rgba(0,0,0,0.5), 2px 2px 0 rgba(255,255,255,0.03)'
            : '0 6px 25px rgba(0,0,0,0.12), 2px 2px 0 rgba(0,0,0,0.02)',
        }}
      >
        {/* "Photo" area */}
        <div
          className={`rounded-sm p-5 mb-4 ${
            dark
              ? 'bg-gradient-to-br from-violet-950 to-slate-900'
              : 'bg-gradient-to-br from-violet-100 to-blue-50'
          }`}
        >
          <Stars rating={data.rating} color={dark ? 'text-amber-300' : 'text-amber-500'} />
          <p
            className={`text-sm leading-relaxed mt-2 ${
              dark ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            &ldquo;{data.body}&rdquo;
          </p>
        </div>
        {/* Handwriting-style author */}
        <div className="px-1">
          <p
            className={`text-base font-medium ${dark ? 'text-gray-200' : 'text-gray-800'}`}
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
          >
            — {data.author}
          </p>
          {(data.role || data.company) && (
            <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              {[data.role, data.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 12: Ticket / Receipt
// ══════════════════════════════════════
export function TicketCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div className="relative">
      <div
        className={`rounded-xl overflow-hidden font-mono transition-all duration-300 border-2 border-dashed ${
          dark
            ? 'bg-[#191922] border-gray-600 text-gray-200'
            : 'bg-[#fffef9] border-gray-300 text-gray-800'
        }`}
      >
        <div className={`px-5 py-3 text-center border-b-2 border-dashed ${dark ? 'border-gray-600' : 'border-gray-300'}`}>
          <p className={`text-[10px] uppercase tracking-[0.3em] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            ★ Verified Review ★
          </p>
        </div>
        <div className="px-5 py-4">
          <p className={`text-xs leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
            {data.body}
          </p>
          <div className={`mt-3 pt-3 border-t-2 border-dashed ${dark ? 'border-gray-600' : 'border-gray-300'} flex justify-between items-end`}>
            <div>
              <p className={`text-xs font-bold uppercase ${dark ? 'text-white' : 'text-gray-900'}`}>{data.author}</p>
              {(data.role || data.company) && (
                <p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {[data.role, data.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${dark ? 'text-amber-400' : 'text-amber-600'}`}>
                {data.rating}/5
              </p>
              <p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>SCORE</p>
            </div>
          </div>
        </div>
        <div className={`px-5 py-2 text-center border-t-2 border-dashed ${dark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
          <p className={`text-[9px] tracking-widest uppercase ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
            THANK YOU FOR YOUR FEEDBACK
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 13: Aurora / Northern Lights
// ══════════════════════════════════════
export function AuroraCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div className="relative rounded-2xl overflow-hidden transition-all duration-300">
      {/* Aurora background */}
      <div
        className="absolute inset-0 style-aurora-bg"
        style={{
          background: dark
            ? 'linear-gradient(135deg, #0c1445 0%, #1a0a3e 25%, #0d2137 50%, #061030 75%, #130a2e 100%)'
            : 'linear-gradient(135deg, #e0f0ff 0%, #f0e6ff 25%, #e6f5f0 50%, #f5f0ff 75%, #e8f4ff 100%)',
        }}
      />
      {/* Animated overlay shimmer */}
      <div
        className="absolute inset-0 style-aurora-shimmer"
        style={{
          background: dark
            ? 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.08) 25%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.08) 75%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.12) 25%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.12) 75%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
      <div className="relative z-10 p-6">
        <Stars rating={data.rating} color={dark ? 'text-emerald-400' : 'text-emerald-500'} />
        <p className={`text-sm leading-relaxed mt-3 mb-4 ${dark ? 'text-white/85' : 'text-gray-800'}`}>
          &ldquo;{data.body}&rdquo;
        </p>
        <div className={`flex items-center gap-3 pt-3 border-t ${dark ? 'border-white/10' : 'border-gray-400/20'}`}>
          <Avatar name={data.author} bg={dark ? 'bg-emerald-600' : 'bg-emerald-600'} />
          <div>
            <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{data.author}</p>
            {(data.role || data.company) && (
              <p className={`text-xs ${dark ? 'text-emerald-300/60' : 'text-gray-500'}`}>
                {[data.role, data.company].filter(Boolean).join(' at ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 14: Social Post
// ══════════════════════════════════════
export function SocialPost({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-300 ${
        dark
          ? 'bg-[#16181c] border-[#2f3336] text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      style={{ boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Header like a social post */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={data.author} bg={dark ? 'bg-blue-600' : 'bg-blue-500'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
              {data.author}
            </p>
            <svg className="w-4 h-4 flex-shrink-0 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            @{data.author.toLowerCase().replace(/\s/g, '')} · {data.role && `${data.role}`}
            {data.company && ` at ${data.company}`}
          </p>
        </div>
      </div>
      {/* Body */}
      <p className={`text-sm leading-relaxed mb-3 ${dark ? 'text-gray-200' : 'text-gray-700'}`}>
        {data.body}
      </p>
      {/* Stars */}
      <Stars rating={data.rating} />
      {/* Engagement bar */}
      <div className={`flex items-center gap-6 mt-3 pt-3 border-t ${dark ? 'border-[#2f3336]' : 'border-gray-100'}`}>
        <button type="button" className={`flex items-center gap-1.5 text-xs ${dark ? 'text-gray-500 hover:text-pink-400' : 'text-gray-400 hover:text-pink-500'} transition-colors`}>
          <Heart className="w-4 h-4" />
          <span>2.4k</span>
        </button>
        <button type="button" className={`flex items-center gap-1.5 text-xs ${dark ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'} transition-colors`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          <span>Share</span>
        </button>
        <button type="button" className={`flex items-center gap-1.5 text-xs ${dark ? 'text-gray-500 hover:text-green-400' : 'text-gray-400 hover:text-green-500'} transition-colors`}>
          <Zap className="w-4 h-4" />
          <span>Boost</span>
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// STYLE 15: Spotlight / Stage
// ══════════════════════════════════════
export function SpotlightCard({ data, mode }: StyleProps) {
  const dark = mode === 'dark';
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        dark ? 'bg-[#0a0a0f]' : 'bg-[#fafafa]'
      }`}
      style={{
        boxShadow: dark
          ? '0 0 0 1px rgba(255,255,255,0.06)'
          : '0 0 0 1px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      {/* Spotlight gradient top */}
      <div
        className="h-24 relative"
        style={{
          background: dark
            ? 'radial-gradient(ellipse at center top, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0.05) 50%, transparent 80%)'
            : 'radial-gradient(ellipse at center top, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0.08) 50%, transparent 80%)',
        }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Avatar name={data.author} bg="bg-gradient-to-br from-amber-500 to-orange-600" />
        </div>
      </div>
      <div className="px-6 pt-8 pb-6 text-center">
        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
          {data.author}
        </p>
        {(data.role || data.company) && (
          <p className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {[data.role, data.company].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex justify-center mt-2">
          <Stars rating={data.rating} color={dark ? 'text-amber-400' : 'text-amber-500'} />
        </div>
        <p className={`text-sm leading-relaxed mt-4 italic ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          &ldquo;{data.body}&rdquo;
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// Style Registry
// ══════════════════════════════════════
export interface StyleDefinition {
  id: string;
  name: string;
  category: 'simple' | 'premium' | 'animated' | 'experimental';
  description: string;
  component: React.ComponentType<StyleProps>;
}

export const TESTIMONIAL_STYLES: StyleDefinition[] = [
  {
    id: 'classic-card',
    name: 'Classic Card',
    category: 'simple',
    description: 'Clean, professional card with shadow and star rating',
    component: ClassicCard,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'simple',
    description: 'Typography-focused elegance with subtle backdrop',
    component: MinimalStyle,
  },
  {
    id: 'gradient-glow',
    name: 'Gradient Glow',
    category: 'premium',
    description: 'Animated gradient border with soft glow',
    component: GradientGlow,
  },
  {
    id: 'glass-card',
    name: 'Glassmorphism',
    category: 'premium',
    description: 'Frosted glass with blurred background effect',
    component: GlassCard,
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    category: 'animated',
    description: 'Cyberpunk neon border with pulsing glow',
    component: NeonPulse,
  },
  {
    id: 'slide-in',
    name: 'Slide-In Card',
    category: 'animated',
    description: 'Slides in from side with accent bar',
    component: SlideInCard,
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    category: 'experimental',
    description: 'Raw, bold aesthetic with thick borders',
    component: BrutalistCard,
  },
  {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    category: 'experimental',
    description: 'Green-on-black terminal with typing cursor',
    component: RetroTerminal,
  },
  {
    id: 'magazine-quote',
    name: 'Magazine Quote',
    category: 'premium',
    description: 'Editorial serif typography with warm tones',
    component: MagazineQuote,
  },
  {
    id: 'floating-bubble',
    name: 'Floating Bubble',
    category: 'animated',
    description: 'Speech bubble with gentle bobbing animation',
    component: FloatingBubble,
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    category: 'experimental',
    description: 'Instant-photo style with slight tilt',
    component: PolaroidCard,
  },
  {
    id: 'ticket',
    name: 'Receipt Ticket',
    category: 'experimental',
    description: 'Dashed-border receipt with monospace font',
    component: TicketCard,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'premium',
    description: 'Northern-lights gradient with shimmer effect',
    component: AuroraCard,
  },
  {
    id: 'social-post',
    name: 'Social Post',
    category: 'simple',
    description: 'Looks like a viral social media post',
    component: SocialPost,
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    category: 'premium',
    description: 'Stage-lit centered card with warm spotlight',
    component: SpotlightCard,
  },
];
