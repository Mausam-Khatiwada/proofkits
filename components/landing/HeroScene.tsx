'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';

/* ── Floating card data ────────────────────────────────────────── */

const heroCards = [
  {
    id: 'top',
    name: 'Thor P. Sattler',
    initials: 'TS',
    gradient: 'from-violet-500 to-fuchsia-500',
    badge: null,
    content: null,
    isSmall: true,
  },
  {
    id: 'main',
    name: '',
    initials: '',
    gradient: '',
    badge: null,
    content: {
      title: 'ProofEngine helped us increase our conversion rate by 35%',
      author: 'Andrew Clarke',
      authorInitials: 'AC',
      tag: 'verified',
    },
    isSmall: false,
  },
  {
    id: 'bottom',
    name: '',
    initials: '',
    gradient: '',
    badge: 'Conversion Boost',
    content: {
      tag: 'Sentence Boost',
      quote:
        'ProofEngine helped us increase our proof-our fever-a-est lat conesttimonials. "35%"',
      stars: 5,
      author: 'Commerce Event',
    },
    isSmall: false,
  },
];

export function HeroScene() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      setPointer((p) => ({
        x: p.x + (target.current.x - p.x) * 0.08,
        y: p.y + (target.current.y - p.y) * 0.08,
      }));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-scene-container relative hidden md:block"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        target.current = {
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        };
      }}
      onMouseLeave={() => {
        target.current = { x: 0, y: 0 };
      }}
    >
      {/* Glow backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />

      {/* SVG connection lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 500 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.6)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.2)" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.3)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.6)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Connection from top card to main card */}
        <path
          d="M 260 60 C 280 120, 320 140, 350 155"
          stroke="url(#lineGrad1)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />
        {/* Connection from main card to bottom card */}
        <path
          d="M 300 210 C 280 260, 240 280, 220 300"
          stroke="url(#lineGrad2)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />
        {/* Small decorative dots along paths */}
        <circle cx="260" cy="60" r="3" fill="#a855f7" opacity="0.8" />
        <circle cx="350" cy="155" r="3" fill="#a855f7" opacity="0.8" />
        <circle cx="220" cy="300" r="3" fill="#8b5cf6" opacity="0.6" />
        {/* Extra subtle lines */}
        <path
          d="M 140 350 C 180 320, 200 310, 220 300"
          stroke="rgba(139,92,246,0.25)"
          strokeWidth="1"
          strokeDasharray="4 6"
          filter="url(#glow)"
        />
        <path
          d="M 400 100 C 380 130, 360 140, 350 155"
          stroke="rgba(168,85,247,0.2)"
          strokeWidth="1"
          strokeDasharray="4 6"
          filter="url(#glow)"
        />
      </svg>

      {/* ── Top small avatar card ── */}
      <div
        className="absolute right-[6rem] top-[0.5rem] z-10"
        style={{
          transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 6}px, 0)`,
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#14112a]/80 px-3 py-1.5 backdrop-blur-xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[9px] font-bold text-white">
            TS
          </div>
          <span className="text-xs font-medium text-white/90">Thor P. Sattler</span>
        </div>
      </div>

      {/* ── Main testimonial card (right) ── */}
      <div
        className="absolute right-0 top-[2.5rem] z-20 w-[17rem]"
        style={{
          transform: `translate3d(${pointer.x * 12}px, ${pointer.y * 10}px, 0)`,
        }}
      >
        <div className="rounded-2xl border border-white/10 bg-[#16132e]/85 p-5 shadow-[0_20px_60px_rgba(88,28,135,0.3)] backdrop-blur-xl">
          <p className="text-sm font-semibold leading-6 text-white">
            ProofEngine helped us increase our conversion rate by <span className="text-violet-300">35%</span>
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[9px] font-bold text-white">
                AC
              </div>
              <span className="text-xs text-white/70">Andrew Clarke</span>
            </div>
            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              verified
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom detailed card ── */}
      <div
        className="absolute left-[1rem] top-[10rem] z-30 w-[20rem]"
        style={{
          transform: `translate3d(${pointer.x * 6}px, ${pointer.y * 8}px, 0)`,
        }}
      >
        <div className="rounded-2xl border border-white/10 bg-[#16132e]/85 shadow-[0_24px_70px_rgba(88,28,135,0.35)] backdrop-blur-xl">
          {/* Badge */}
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">Conversion Boost</span>
          </div>

          <div className="p-4">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-violet-300/70">
              Sentence Boost
            </div>
            <p className="text-sm leading-6 text-white/85">
              &ldquo;ProofEngine helped us increase our proof-
              <br />
              our fever-a-est lat conesttimonials. &ldquo;35%&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mt-2 text-xs font-medium text-violet-300/80">Commerce Event</p>
          </div>
        </div>
      </div>

      {/* Floating small node dots (decorative) */}
      <div className="absolute left-[8rem] top-[6rem] h-2 w-2 rounded-full bg-violet-500/60 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
      <div className="absolute right-[3rem] top-[16rem] h-1.5 w-1.5 rounded-full bg-fuchsia-400/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
    </div>
  );
}

/* ── Mobile fallback ── */
export function HeroSceneMobile() {
  return (
    <div className="mt-10 grid gap-3 md:hidden">
      {/* Main card */}
      <div className="rounded-2xl border border-white/10 bg-[#16132e]/80 p-5 backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-300">Conversion Boost</span>
        </div>
        <p className="text-sm font-semibold leading-6 text-white">
          ProofEngine helped us increase our conversion rate by <span className="text-violet-300">35%</span>
        </p>
        <div className="mt-3 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[9px] font-bold text-white">
            AC
          </div>
          <span className="text-xs text-white/70">Andrew Clarke</span>
        </div>
      </div>
    </div>
  );
}
