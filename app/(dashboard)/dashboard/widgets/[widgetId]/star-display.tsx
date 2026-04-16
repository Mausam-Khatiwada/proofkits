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
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}
