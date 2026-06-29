import { Star } from 'lucide-react';

const StarRating = ({ value = 0, size = 'sm' }) => {
  const cls = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-slate-300'
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;
