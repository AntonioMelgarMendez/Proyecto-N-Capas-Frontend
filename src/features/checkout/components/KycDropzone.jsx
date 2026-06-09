import { useRef, useState } from 'react';
import { Upload, Loader2, FileImage } from 'lucide-react';

const KycDropzone = ({ onFileSelect, selectedFile, isUploading = false }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition ${
        isDragging ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent/50 hover:bg-slate-50'
      } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      {isUploading ? (
        <Loader2 className="h-10 w-10 text-accent animate-spin" />
      ) : (
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
          {selectedFile ? (
            <FileImage className="h-7 w-7 text-accent" />
          ) : (
            <Upload className="h-7 w-7 text-slate-400" />
          )}
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">
          {selectedFile ? selectedFile.name : 'Sube la imagen del documento'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Arrastra el archivo o haz clic para seleccionar</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

export default KycDropzone;
