import { useState } from 'react';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const NoPhoto = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-primary to-slate-700 select-none">
    <div className="w-20 h-20 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
      <Building2 className="w-10 h-10 text-accent" />
    </div>
    <span className="text-white font-bold text-lg tracking-tight">RentPro</span>
    <span className="text-white/50 text-xs mt-1 uppercase tracking-widest">Property OS</span>
  </div>
);

const PhotoGallery = ({ photos = [] }) => {
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

  return (
    <div className="rounded-xl overflow-hidden shadow-xl">
      {/* Main area */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {hasPhotos ? (
          <img
            key={validPhotos[current]?.s3Url}
            src={validPhotos[current]?.s3Url}
            alt={`Foto ${current + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleError(validPhotos[current]?.s3Url)}
          />
        ) : (
          <NoPhoto />
        )}

        {hasPhotos && (
          <div className="absolute inset-0 bg-linear-to-t from-primary/40 via-transparent to-transparent pointer-events-none" />
        )}

        {/* Navigation arrows */}
        {validPhotos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-white transition shadow-lg"
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-white transition shadow-lg"
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-mono text-primary backdrop-blur">
              {current + 1} / {validPhotos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validPhotos.length > 1 && (
        <div className="flex gap-2 p-3 bg-white overflow-x-auto">
          {validPhotos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setCurrent(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md transition ${
                i === current ? 'ring-2 ring-accent' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={photo.s3Url}
                alt=""
                className="h-full w-full object-cover"
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
