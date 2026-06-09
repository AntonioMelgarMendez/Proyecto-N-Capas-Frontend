import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, Pencil, User, Building2, Trash2 } from 'lucide-react';
import { propertyApi } from '../../../api/propertyApi';

const NoPhoto = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#091124] to-slate-800">
    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2">
      <Building2 className="w-6 h-6 text-amber-500" />
    </div>
    <span className="text-white/60 text-[10px] uppercase tracking-widest">RentPro</span>
  </div>
);

const PropertyLandlordCard = ({ property, onDelete }) => {
  const { 
    id, 
    title, 
    city, 
    country, 
    pricePerNight, 
    isAvailable, 
    averageRating,
    tenantName = "",
    occupancy = isAvailable ? 92 : 0
  } = property;

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
  const formattedPrice = pricePerMonth.toLocaleString('es-ES');
  const rating = averageRating ? parseFloat(averageRating).toFixed(1) : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => handleImgError(photoUrl)}
          />
        ) : (
          <NoPhoto />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#091124]/90 via-[#091124]/20 to-transparent opacity-90" />
        <div className="absolute top-4 left-4">
          {isAvailable ? (
            <div className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Activo
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-[#091124]/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-200 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Pendiente
            </div>
          )}
        </div>
        {rating && (
          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#091124] shadow-md">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating}
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold tracking-tight line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 mt-1 text-slate-200 text-sm font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>{city}{country ? `, ${country}` : ''}</span>
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-2xl font-extrabold text-[#091124] tracking-tight block leading-none mb-1">
              €{formattedPrice}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Por mes
            </span>
          </div>
          {isAvailable && (
            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Inquilino actual
              </span>
              <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-[#091124]">
                <User className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
                <span className="line-clamp-1 max-w-[100px]">{tenantName}</span>
              </div>
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-medium text-slate-500">Ocupación anual</span>
            <span className="text-xs font-bold text-[#091124]">{occupancy}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>
        <div className="mt-auto flex gap-2">
          <Link
            to={`/landlord/properties/${id}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#091124] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#131f3b]"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          <Link
            to={`/tenant/property/${id}`}
            className="flex items-center justify-center px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#091124] transition-colors hover:bg-slate-50 shadow-sm"
          >
            Vista pública
          </Link>
          <button
            onClick={() => onDelete(id, title)}
            className="flex items-center justify-center w-11 rounded-xl border border-red-100 text-red-400 transition-colors hover:bg-red-50 hover:border-red-200 shrink-0"
            title="Eliminar propiedad"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PropertyLandlordCard;