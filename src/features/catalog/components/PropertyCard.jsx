import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Users, Star, Building2 } from 'lucide-react';
import { usePropertyPrimaryPhoto } from '../hooks/usePropertyPrimaryPhoto';

const NoPhoto = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#091124] to-slate-800">
    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2">
      <Building2 className="w-6 h-6 text-amber-500" />
    </div>
    <span className="text-white/60 text-[10px] uppercase tracking-widest">RentPro</span>
  </div>
);

const PropertyCard = ({ property }) => {
  const { id, title, city, country, pricePerNight, bedrooms, bathrooms, maxGuests, averageRating, isAvailable } = property;

  const { photoUrl, onError: onPhotoError } = usePropertyPrimaryPhoto(id);
  const price = parseFloat(pricePerNight).toLocaleString('en-US', { minimumFractionDigits: 0 });
  const hasRating = averageRating != null && averageRating > 0;
  const rating = hasRating ? parseFloat(averageRating).toFixed(1) : 'Nuevo';

  return (
    <Link
      to={`/tenant/property/${id}`}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={onPhotoError}
          />
        ) : (
          <NoPhoto />
        )}
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full text-xs font-bold text-[#091124] shadow-sm">
          {bedrooms} Hab.
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-full text-xs font-bold text-[#091124] shadow-sm">
          <Star 
            className={`h-4 w-4 ${hasRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-300 text-slate-300'}`} 
          />
          <span className={hasRating ? 'text-[#091124]' : 'text-slate-400'}>
            {rating}
          </span>
        </div>

        {isAvailable === false && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-[#091124] text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg">
              No disponible
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 justify-between gap-5">
        
        <div>
          <h3 className="text-[22px] font-extrabold text-[#091124] line-clamp-1 leading-tight tracking-tight">{title}</h3>
          
          <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm font-medium">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{city}, {country}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-[15px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.5} />
              {bedrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.5} />
              {bathrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.5} />
              {maxGuests}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
          <div>
            <span className="text-3xl font-extrabold text-[#091124] tracking-tight">${price}</span>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Por noche
            </span>
          </div>
          <span className="text-sm font-bold text-amber-500 transition-colors group-hover:text-amber-600 mb-1">
            Ver detalle &rarr;
          </span>
        </div>

      </div>
    </Link>
  );
};

export default PropertyCard;