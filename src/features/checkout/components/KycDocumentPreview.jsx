const KycDocumentPreview = ({ previewUrl }) => {
  if (!previewUrl) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">Documento verificado</p>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        <img src={previewUrl} alt="Documento de identidad" className="w-full max-h-48 object-contain" />
      </div>
    </div>
  );
};

export default KycDocumentPreview;
