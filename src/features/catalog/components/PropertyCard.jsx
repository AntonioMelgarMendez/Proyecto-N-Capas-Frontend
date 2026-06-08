import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Users, Star } from 'lucide-react';

const IMAGES = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
];

const PropertyCard = ({ property }) => {
  const { id, title, city, country, pricePerNight, bedrooms, bathrooms, maxGuests, averageRating, isAvailable } = property;

  const img = IMAGES[Number(id) % IMAGES.length];
  const rating = averageRating ? parseFloat(averageRating).toFixed(1) : null;
  const price = parseFloat(pricePerNight).toLocaleString('en-US', { minimumFractionDigits: 0 });

  return (
    <Link
      to={`/tenant/property/${id}`}
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5 block"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />

        {/* Type badge — top left */}
        <div className="absolute top-3 left-3">
          <span className="bg-white text-primary text-xs font-semibold px-2.5 py-0.5 rounded-md shadow-sm">
            {bedrooms} hab.
          </span>
        </div>

        {/* Rating chip — top right */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {rating}
          </div>
        )}

        {/* Unavailable overlay */}
        {isAvailable === false && (
          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
            <span className="bg-white/90 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
              No disponible
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-primary text-base leading-tight line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>{city}, {country}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {bedrooms} cama{bedrooms !== 1 ? 's' : ''}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {bathrooms} baño{bathrooms !== 1 ? 's' : ''}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {maxGuests} huésp.
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-xl font-bold text-primary">${price}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide ml-1">/ noche</span>
          </div>
          <span className="text-xs font-semibold text-accent">Ver detalle →</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
