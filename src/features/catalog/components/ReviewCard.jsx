import { Star } from 'lucide-react';

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const ReviewCard = ({ review }) => {
  const { reviewerName, rating, comment, reviewType, createdAt } = review;

  const isLandlordReview = reviewType === 'TENANT_TO_LANDLORD';

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-slate-700 text-white text-xs font-bold flex-shrink-0">
            {initials(reviewerName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary leading-tight">{reviewerName}</p>
            <p className="text-[10px] text-slate-400">{createdAt ? formatDate(createdAt) : ''}</p>
          </div>
        </div>

        {/* Review type badge */}
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isLandlordReview
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {isLandlordReview ? 'Al propietario' : 'Al inquilino'}
        </span>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      {comment && <p className="text-sm text-slate-600 leading-relaxed">{comment}</p>}
    </div>
  );
};

export default ReviewCard;
