import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, Pencil, Eye, BedDouble, Bath, Users, Building2, Trash2 } from 'lucide-react';
import { propertyApi } from '../../../api/propertyApi';

const NoPhoto = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-primary to-slate-700">
    <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-2">
      <Building2 className="w-6 h-6 text-accent" />
    </div>
    <span className="text-white/60 text-[10px] uppercase tracking-widest">RentPro</span>
  </div>
);

const PropertyLandlordCard = ({ property, onDelete }) => {
  const { id, title, city, country, pricePerNight, bedrooms, bathrooms, maxGuests, isAvailable, averageRating } = property;
  const [failedUrls, setFailedUrls] = useState(new Set());

  const { data: photosData } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => propertyApi.getPhotos(id).then((r) => r.data ?? []),
  });

  const validPhotos = (photosData ?? []).filter((p) => !failedUrls.has(p.s3Url));
  const primaryPhoto = validPhotos.find((p) => p.isPrimary) ?? validPhotos[0] ?? null;
  const photoUrl = primaryPhoto?.s3Url ?? null;
  const handleImgError = (url) => setFailedUrls((prev) => new Set([...prev, url]));

  const pricePerMonth = Math.round(parseFloat(pricePerNight) * 30);
  const rating = averageRating ? parseFloat(averageRating).toFixed(1) : null;

  return (
    <div className="rounded-xl bg-white overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all">

      {/* Photo */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => handleImgError(photoUrl)}
          />
        ) : (
          <NoPhoto />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-primary/60 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/30 bg-slate-500/10 px-2.5 py-1 text-[11px] font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Inactivo
            </span>
          )}
        </div>

        {/* Rating */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {rating}
          </div>
        )}

        {/* Title + city over photo */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-base font-bold leading-tight">{title}</p>
          <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {city}, {country}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">

        {/* Price + stats */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-2xl font-bold text-primary">${pricePerMonth.toLocaleString()}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">por mes</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-accent" />{bedrooms}</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-accent" />{bathrooms}</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-accent" />{maxGuests}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            to={`/landlord/properties/${id}`}
            className="flex-1 h-8 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
          <Link
            to={`/tenant/property/${id}`}
            className="h-8 px-3 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Vista pública
          </Link>
          <button
            onClick={() => onDelete(id, title)}
            className="h-8 w-8 rounded-md border border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center shrink-0"
            title="Eliminar propiedad"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PropertyLandlordCard;
