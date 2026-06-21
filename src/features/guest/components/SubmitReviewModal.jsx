import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { isReviewEligibleStatus } from '../constants/reviewEligibility';

const InteractiveStarRating = ({ value, onChange }) => (
  <div className="flex items-center justify-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-1 transition-transform hover:scale-110"
        aria-label={`${star} estrellas`}
      >
        <Star
          className={`h-8 w-8 ${
            star <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-slate-300'
          }`}
        />
      </button>
    ))}
  </div>
);

/**
 * Modal for tenants to submit a review after a completed reservation.
 */
const SubmitReviewModal = ({
  isOpen,
  onClose,
  reservation,
  landlordId,
  isLoadingLandlord,
  onSubmit,
  isPending,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !reservation) return null;

  const handleClose = () => {
    if (isPending) return;
    setRating(0);
    setComment('');
    setValidationError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!isReviewEligibleStatus(reservation.status)) {
      setValidationError('Esta reserva aún no puede reseñarse.');
      return;
    }
    if (!landlordId) {
      setValidationError('No se pudo obtener el arrendador de la propiedad.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setValidationError('Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    onSubmit({ rating, comment: comment.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-primary">Dejar reseña</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-primary">{reservation.propertyTitle}</p>
            <p className="text-xs text-slate-500">Reserva R-{reservation.id}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 text-center">¿Cómo fue tu experiencia?</p>
            <InteractiveStarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Comentario (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Cuéntanos sobre la propiedad y el arrendador..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {validationError && (
            <p className="text-xs text-rose-600 text-center">{validationError}</p>
          )}

          {isLoadingLandlord && (
            <p className="text-xs text-slate-400 text-center">Cargando datos del arrendador...</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isLoadingLandlord || !landlordId}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? 'Enviando...' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;
