import { ShieldCheck, Loader2 } from 'lucide-react';
import KycUploadForm from './KycUploadForm';
import KycDocumentPreview from './KycDocumentPreview';

const CheckoutKycPanel = ({
  needsUpload,
  isVerified,
  previewUrl,
  onSubmit,
  isUploading,
  isLoading,
  uploadError,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-bold text-primary">Verificación de identidad</h2>
    </div>

    <p className="text-sm text-slate-500">
      Antes de proceder al pago, completa tus datos y sube una imagen de tu DUI o pasaporte.
    </p>

    {isLoading && !isVerified && !isUploading && (
      <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Verificando identidad...</span>
      </div>
    )}

    {needsUpload && (
      <KycUploadForm
        onSubmit={onSubmit}
        isUploading={isUploading}
        error={uploadError}
      />
    )}

    {isVerified && <KycDocumentPreview previewUrl={previewUrl} />}
  </div>
);

export default CheckoutKycPanel;
