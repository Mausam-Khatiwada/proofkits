'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';

type SceneCard = {
  id: string;
  tab: string;
  tag: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  width: string;
  top: string;
  left: string;
  rx: number;
  ry: number;
  z: number;
  scale?: number;
};

const cards: SceneCard[] = [
  {
    id: '1',
    tab: 'tab 01',
    tag: 'Marketing lead',
    quote: 'We replaced static screenshots with Proofengine widgets and instantly made our landing page feel alive.',
    name: 'Emma Lawson',
    role: 'Growth Lead, StellarOS',
    initials: 'EL',
    gradient: 'from-violet-500 to-blue-500',
    width: 'w-[18.5rem]',
    top: 'top-4',
    left: 'left-3',
    rx: 8,
    ry: -14,
    z: -70,
  },
  {
    id: '2',
    tab: 'tab 02',
    tag: 'Founder',
    quote:
      'Proofengine turned social proof into our highest-performing trust layer. The workflow and polish feel enterprise-grade.',
    name: 'Mausam Khatiwada',
    role: 'Founder, TechFlow',
    initials: 'MK',
    gradient: 'from-fuchsia-500 to-indigo-500',
    width: 'w-[23.5rem]',
    top: 'top-12',
    left: 'left-16',
    rx: 4,
    ry: -8,
    z: 40,
    scale: 1.06,
  },
  {
    id: '3',
    tab: 'tab 03',
    tag: 'Customer success',
    quote:
      'Our team sends request links in one click, and replies come back cleaner and more usable with almost no manual editing.',
    name: 'Sofia Diaz',
    role: 'Head of CX, PrimeLane',
    initials: 'SD',
    gradient: 'from-cyan-400 to-indigo-500',
    width: 'w-[19rem]',
    top: 'top-40',
    left: 'left-0',
    rx: -6,
    ry: 12,
    z: -10,
  },
  {
    id: '4',
    tab: 'tab 04',
    tag: 'Product manager',
    quote: 'The animation quality feels premium. Visitors pause to read cards instead of scrolling past them.',
    name: 'Arjun Patel',
    role: 'PM, CloudOrbit',
    initials: 'AP',
    gradient: 'from-emerald-400 to-teal-500',
    width: 'w-[17.5rem]',
    top: 'top-[9.5rem]',
    left: 'left-[12.5rem]',
    rx: -10,
    ry: -14,
    z: -55,
  },
];

export function PremiumTestimonialScene() {
  const [activeCard, setActiveCard] = useState<string>('2');
  const [sceneHover, setSceneHover] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const pointerTarget = useRef({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      setPointer((prev) => ({
        x: prev.x + (pointerTarget.current.x - prev.x) * 0.11,
        y: prev.y + (pointerTarget.current.y - prev.y) * 0.11,
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (sceneHover) return;

    const interval = window.setInterval(() => {
      setActiveCard((prev) => {
        const currentIndex = cards.findIndex((card) => card.id === prev);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % cards.length;
        return cards[nextIndex].id;
      });
    }, 3200);

    return () => window.clearInterval(interval);
  }, [sceneHover]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const orderedCards = useMemo(() => {
    const maxIndex = cards.length + 12;
    return cards.map((card, index) => ({
      ...card,
      zIndex: card.id === activeCard ? maxIndex : index + 1,
    }));
  }, [activeCard]);

  const sceneTilt = {
    transform: `rotateX(${pointer.y * -6.5}deg) rotateY(${pointer.x * 8.5}deg)`,
  };

  return (
    <div className="relative w-full md:mt-0">
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {cards.map((card, index) => (
          <article
            key={`mobile-${card.id}`}
            className="landing-card-float rounded-2xl border border-slate-200/90 bg-white p-3 shadow-[0_24px_60px_rgba(56,73,112,0.22)] backdrop-blur-2xl dark:border-slate-700/65 dark:bg-[#0b1536]/92 dark:shadow-[0_24px_60px_rgba(15,23,42,0.52)]"
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            <div className="rounded-xl border border-slate-200/85 bg-white dark:border-slate-600/50 dark:bg-[linear-gradient(180deg,rgba(23,33,74,0.96),rgba(10,16,38,0.94))]">
              <header className="flex items-center justify-between border-b border-slate-200/85 px-3 py-2.5 dark:border-slate-600/50">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                </div>
                <div className="rounded-md border border-slate-300/80 bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-500/50 dark:bg-slate-700/40 dark:text-slate-200">
                  {card.tab}
                </div>
              </header>

              <div className="p-4">
                <div className="mb-3 inline-flex rounded-md border border-violet-300/50 bg-violet-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-violet-700 dark:border-violet-300/35 dark:bg-violet-500/18 dark:text-violet-100">
                  {card.tag}
                </div>
                <div className="mb-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star key={`mobile-star-${card.id}-${item}`} className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-300 dark:text-amber-300" />
                  ))}
                </div>
                <p className="text-sm leading-7 text-slate-700/95 dark:text-slate-100/92">&ldquo;{card.quote}&rdquo;</p>

                <footer className="mt-4 flex items-center gap-3 border-t border-slate-200/80 pt-3 dark:border-slate-600/50">
                  <div className={`rounded-xl bg-gradient-to-br ${card.gradient} p-[1px]`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-xs font-semibold text-slate-900 dark:bg-[#0b1536] dark:text-white">
                      {card.initials}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300/75">{card.role}</p>
                  </div>
                </footer>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="relative hidden min-h-[36rem] items-start justify-start [perspective:2400px] md:flex">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/25 blur-[125px] dark:bg-violet-400/24" />
        <div className="pointer-events-none absolute right-16 top-8 h-48 w-48 rounded-full bg-cyan-500/20 blur-[95px] dark:bg-cyan-400/20" />

        <div
          className="group relative h-[32rem] w-full max-w-[33rem] origin-top-left scale-[0.86] transform-gpu transition-transform duration-500 [transform-style:preserve-3d] will-change-transform lg:scale-[0.9] xl:scale-[0.95]"
          style={sceneTilt}
          onMouseEnter={() => setSceneHover(true)}
          onMouseLeave={() => {
            setSceneHover(false);
            pointerTarget.current = { x: 0, y: 0 };
            if (hoverTimeoutRef.current) {
              window.clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            pointerTarget.current = { x, y };
          }}
        >
          {orderedCards.map((card, index) => {
            const isActive = card.id === activeCard;
            const depthBoost = isActive ? 150 : sceneHover ? 22 : 8;
            const dynamicZ = card.z + depthBoost;
            const dynamicRx = card.rx + pointer.y * (isActive ? -7 : -4);
            const dynamicRy = card.ry + pointer.x * (isActive ? 12 : 6.5);
            const dynamicScale = isActive ? card.scale ?? 1.03 : sceneHover ? 1 : 0.99;
            const dynamicX = pointer.x * (isActive ? 14 : 7);
            const dynamicY = pointer.y * (isActive ? 12 : 5);

            return (
              <div
                key={`card-wrap-${card.id}`}
                className={['absolute', card.width, card.top, card.left, 'landing-card-float'].join(' ')}
                style={{
                  animationDuration: `${11 + index * 1.3}s`,
                  animationDelay: `${index * 0.45}s`,
                  zIndex: card.zIndex,
                }}
              >
                <article
                  onMouseEnter={() => {
                    if (activeCard === card.id) return;
                    if (hoverTimeoutRef.current) {
                      window.clearTimeout(hoverTimeoutRef.current);
                    }
                    hoverTimeoutRef.current = window.setTimeout(() => {
                      setActiveCard(card.id);
                    }, 90);
                  }}
                  className={[
                    'landing-card-glow rounded-[1.35rem] border border-slate-200/90 bg-white p-3 backdrop-blur-2xl dark:border-slate-700/70 dark:bg-[#0b1536]/92',
                    'transform-gpu transition-[transform,box-shadow,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
                    isActive
                      ? 'opacity-100 shadow-[0_38px_96px_rgba(56,73,112,0.28),0_0_70px_rgba(129,140,248,0.2)] dark:shadow-[0_62px_130px_rgba(8,15,45,0.72),0_0_90px_rgba(109,40,217,0.34)]'
                      : 'opacity-95 shadow-[0_22px_52px_rgba(56,73,112,0.2)] dark:shadow-[0_24px_56px_rgba(15,23,42,0.42)]',
                  ].join(' ')}
                  style={{
                    transform: `translate3d(${dynamicX}px, ${dynamicY}px, ${dynamicZ}px) rotateX(${dynamicRx}deg) rotateY(${dynamicRy}deg) scale(${dynamicScale})`,
                  }}
                >
                  <div className="rounded-[1.05rem] border border-slate-200/85 bg-white dark:border-slate-600/50 dark:bg-[linear-gradient(180deg,rgba(23,33,74,0.96),rgba(10,16,38,0.94))]">
                    <header className="flex items-center justify-between border-b border-slate-200/85 px-3 py-2.5 dark:border-slate-600/50">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                      </div>
                      <div className="rounded-md border border-slate-300/80 bg-white/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-500/50 dark:bg-slate-700/40 dark:text-slate-200">
                        {card.tab}
                      </div>
                    </header>

                    <div className="p-4">
                      <div className="mb-3 inline-flex rounded-md border border-violet-300/50 bg-violet-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-violet-700 dark:border-violet-300/35 dark:bg-violet-500/18 dark:text-violet-100">
                        {card.tag}
                      </div>

                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <Star key={`${card.id}-${item}`} className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-300 dark:text-amber-300" />
                          ))}
                        </div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-300/55 bg-violet-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700 dark:border-violet-300/40 dark:bg-violet-500/28 dark:text-violet-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : null}
                      </div>

                      <p className="text-sm leading-7 text-slate-700/95 dark:text-slate-100/92">&ldquo;{card.quote}&rdquo;</p>

                      <footer className="mt-4 flex items-center gap-3 border-t border-slate-200/80 pt-3 dark:border-slate-600/50">
                        <div className={`rounded-xl bg-gradient-to-br ${card.gradient} p-[1px]`}>
                          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-xs font-semibold text-slate-900 dark:bg-[#0b1536] dark:text-white">
                            {card.initials}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300/75">{card.role}</p>
                        </div>
                      </footer>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
