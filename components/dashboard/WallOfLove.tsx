import { Star, CheckCircle, Heart } from 'lucide-react';
import type { Testimonial } from '@/lib/types';
import { getInitials, getAvatarColor } from './utils';

interface WallOfLoveProps {
  testimonials: Testimonial[];
}

export function WallOfLove({ testimonials }: WallOfLoveProps) {
  const topTestimonials = testimonials
    .filter((t) => t.approved)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="dash-glass p-5 transition-shadow duration-300">
      <h3 className="font-semibold text-sm text-gray-800">Wall of Love ❤️</h3>
      <p className="text-xs text-gray-400">Your highest rated</p>

      {topTestimonials.length === 0 ? (
        <div className="mt-4 text-center py-6">
          <Heart className="w-8 h-8 text-violet-200 mx-auto" />
          <p className="text-sm text-gray-400 mt-2">No approved testimonials</p>
          <p className="text-xs text-gray-300">
            Approve testimonials to see them here
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {topTestimonials.map((t) => (
            <div key={t.id}>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s <= t.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {t.rating}.0
                </span>
              </div>
              <p className="text-sm text-gray-600 italic line-clamp-2 leading-relaxed mt-1">
                &ldquo;{t.body}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold ${getAvatarColor(
                    t.author_name
                  )}`}
                >
                  {getInitials(t.author_name)}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {t.author_name}
                </span>
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {topTestimonials.length > 0 && (
        <a
          href="/wall-of-love"
          className="text-violet-600 text-xs mt-4 block hover:text-violet-700 transition-colors"
        >
          View Wall of Love →
        </a>
      )}
    </div>
  );
}
