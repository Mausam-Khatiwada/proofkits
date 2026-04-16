import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

export function ComingSoon({
  icon: Icon,
  title,
  description,
  features,
}: ComingSoonProps) {
  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-[#EDE9FE] pl-14 pr-4 md:px-8 flex items-center">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </header>
      <div className="px-4 py-6 md:px-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-violet-500" />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3" />
            Coming Soon
          </span>
          <h2 className="text-xl font-semibold text-gray-900 mt-3 mb-2">
            {title}
          </h2>
          <p className="text-sm text-[#7C6D9A] mb-6">{description}</p>
          <div className="bg-white rounded-2xl border border-[#EDE9FE] p-5 text-left shadow-[0_1px_3px_rgba(124,58,237,0.06)]">
            <p className="text-[10px] font-medium text-[#7C6D9A] uppercase tracking-widest mb-3">
              Planned Features
            </p>
            <ul className="space-y-2.5">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 text-sm text-gray-600"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
