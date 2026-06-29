import { useState } from 'react';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const NoPhoto = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#091124] to-slate-800 select-none">
    <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
      <Building2 className="w-10 h-10 text-amber-500" />
    </div>
    <span className="text-white font-bold text-lg tracking-tight">RentPro</span>
    <span className="text-white/50 text-xs mt-1 uppercase tracking-widest">Property OS</span>
  </div>
);

const PhotoGallery = ({ photos = [], large = false }) => {
  const [current, setCurrent] = useState(0);
  const [failedSet, setFailedSet] = useState(new Set());

  const validPhotos = photos.filter((p) => !failedSet.has(p.s3Url));
  const hasPhotos = validPhotos.length > 0;

  const prev = () => setCurrent((c) => (c - 1 + validPhotos.length) % validPhotos.length);
  const next = () => setCurrent((c) => (c + 1) % validPhotos.length);

  const handleError = (url) => {
    setFailedSet((prev) => new Set([...prev, url]));
    setCurrent(0);
  };

  const mainFrameClass = large
    ? 'relative w-full aspect-[3/2] overflow-hidden bg-slate-100'
    : 'relative aspect-[16/10] bg-slate-100 overflow-hidden';

  return (
    <div className={`overflow-hidden bg-white border border-slate-100 shadow-sm ${large ? 'w-full rounded-2xl' : 'rounded-2xl'}`}>
      <div className={mainFrameClass}>
        {hasPhotos ? (
          <img
            key={validPhotos[current]?.s3Url}
            src={validPhotos[current]?.s3Url}
            alt={`Foto ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
            onError={() => handleError(validPhotos[current]?.s3Url)}
          />
        ) : (
          <div className="absolute inset-0">
            <NoPhoto />
          </div>
        )}

        {hasPhotos && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#091124]/30 via-transparent to-transparent pointer-events-none" />
        )}

        {validPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/95 hover:bg-white transition-all shadow-md"
            >
              <ChevronLeft className="h-5 w-5 text-[#091124]" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/95 hover:bg-white transition-all shadow-md"
            >
              <ChevronRight className="h-5 w-5 text-[#091124]" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold tracking-wide text-[#091124] shadow-sm">
              {current + 1} / {validPhotos.length}
            </div>
          </>
        )}
      </div>

      {validPhotos.length > 1 && (
        <div className={`flex overflow-x-auto bg-white border-t border-slate-100 ${large ? 'gap-2.5 p-3' : 'gap-2.5 p-3'}`}>
          {validPhotos.map((photo, i) => (
            <button
              key={photo.id || i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                large ? 'h-16 w-24 sm:h-[72px] sm:w-[108px]' : 'h-[60px] w-[88px]'
              } ${i === current ? 'ring-2 ring-accent opacity-100' : 'opacity-50 hover:opacity-100'}`}
            >
              <img
                src={photo.s3Url}
                alt={`Miniatura ${i + 1}`}
                className="h-full w-full object-cover object-center"
                onError={() => handleError(photo.s3Url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
