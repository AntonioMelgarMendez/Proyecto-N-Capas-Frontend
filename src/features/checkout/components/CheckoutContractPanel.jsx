import { useState, useMemo } from 'react';
import { FileSignature, Loader2 } from 'lucide-react';
import { resolveContractContent } from '../utils/contractTemplate';

const CheckoutContractPanel = ({ content, reservationSummary, onSign, isPending, error }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const contractText = useMemo(
    () => resolveContractContent(content, reservationSummary),
    [content, reservationSummary],
  );

  const handleSign = () => {
    if (!termsAccepted) return;
    onSign(true);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5 text-left">
      <div className="flex items-center gap-2">
        <FileSignature className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-primary">Firma del contrato</h2>
      </div>

      <p className="text-sm text-slate-500">
        Tu pago fue confirmado. Revisa el contrato y fírmalo digitalmente para finalizar la reserva.
      </p>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 max-h-64 overflow-y-auto">
        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-[system-ui]">{contractText}</p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          disabled={isPending}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent/30"
        />
        <span className="text-sm text-slate-600">
          Acepto los términos y condiciones del contrato de arrendamiento.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600 rounded-lg border border-red-100 bg-red-50 px-4 py-3">{error}</p>
      )}

      <button
        type="button"
        disabled={!termsAccepted || isPending}
        onClick={handleSign}
        className="w-full min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Firmando contrato...
          </>
        ) : (
          'Firmar contrato digitalmente'
        )}
      </button>
    </div>
  );
};

export default CheckoutContractPanel;
