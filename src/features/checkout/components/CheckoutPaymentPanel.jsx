import { ArrowRight, Lock, CreditCard } from 'lucide-react';

const CheckoutPaymentPanel = ({ isEnabled, total, onPay, isPending, error }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5 transition ${!isEnabled ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-2">
      <CreditCard className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-bold text-primary">Pago seguro</h2>
    </div>

    {!isEnabled ? (
      <p className="text-sm text-slate-400 py-4">
        Completa la verificación KYC para habilitar el pago.
      </p>
    ) : (
      <>
        <p className="text-sm text-slate-500">
          Serás redirigido a la pasarela segura de Stripe para completar el pago de tu reserva.
        </p>

        <p className="flex items-start gap-2 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Pago procesado con cifrado de extremo a extremo. No almacenamos tus datos bancarios.
        </p>

        {error && (
          <p className="text-sm text-red-600 rounded-lg border border-red-100 bg-red-50 px-4 py-3">{error}</p>
        )}

        <button
          type="button"
          disabled={!isEnabled || isPending}
          onClick={onPay}
          className="w-full min-h-[52px] rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Redirigiendo a Stripe...' : `Confirmar y Pagar $${total?.toLocaleString()}`}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </>
    )}
  </div>
);

export default CheckoutPaymentPanel;
