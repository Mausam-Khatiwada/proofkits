import { Star } from 'lucide-react';

interface StarDisplayProps {
  rating: number;
}

export function StarDisplay({ rating }: StarDisplayProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-[color:color-mix(in_srgb,var(--dash-border)_65%,var(--dash-text))] opacity-45'
          }`}
        />
      ))}
    </div>
  );
}
