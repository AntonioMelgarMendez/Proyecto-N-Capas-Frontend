import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import KycDropzone from './KycDropzone';
import { KYC_DOCUMENT_TYPES, minKycExpiryDate } from '../constants';

const fieldCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent';

const KycUploadForm = ({ onSubmit, isUploading = false, error }) => {
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!documentType) {
      setValidationError('Selecciona el tipo de documento.');
      return;
    }
    if (!documentNumber.trim()) {
      setValidationError('Ingresa el número de documento.');
      return;
    }
    if (!expiryDate) {
      setValidationError('Ingresa la fecha de vencimiento.');
      return;
    }
    if (expiryDate <= new Date().toISOString().split('T')[0]) {
      setValidationError('La fecha de vencimiento debe ser posterior a hoy.');
      return;
    }
    if (!file) {
      setValidationError('Selecciona la imagen del documento.');
      return;
    }

    onSubmit({ documentType, documentNumber: documentNumber.trim(), expiryDate, file });
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="kyc-document-type" className="block text-xs font-semibold text-primary mb-1.5">
            Tipo de documento <span className="text-accent">*</span>
          </label>
          <select
            id="kyc-document-type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className={fieldCls}
            disabled={isUploading}
          >
            <option value="">Seleccionar...</option>
            {KYC_DOCUMENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kyc-document-number" className="block text-xs font-semibold text-primary mb-1.5">
            Número de documento <span className="text-accent">*</span>
          </label>
          <input
            id="kyc-document-number"
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Ej. 12345678-9"
            className={fieldCls}
            disabled={isUploading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="kyc-expiry-date" className="block text-xs font-semibold text-primary mb-1.5">
          Fecha de vencimiento <span className="text-accent">*</span>
        </label>
        <input
          id="kyc-expiry-date"
          type="date"
          value={expiryDate}
          min={minKycExpiryDate()}
          onChange={(e) => setExpiryDate(e.target.value)}
          className={fieldCls}
          disabled={isUploading}
        />
      </div>

      <KycDropzone
        onFileSelect={setFile}
        selectedFile={file}
        isUploading={isUploading}
      />

      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Subiendo documento...
          </span>
        ) : (
          'Enviar verificación'
        )}
      </button>
    </form>
  );
};

export default KycUploadForm;
