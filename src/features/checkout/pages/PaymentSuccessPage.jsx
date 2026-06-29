import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, LayoutDashboard } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { PAID_STATUSES } from '../constants';
import { useTenantSidebar } from '../hooks/useTenantSidebar';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import { useContract } from '../hooks/useContract';
import { getPaymentStatusFromResponse } from '../utils/paymentStatus';
import CheckoutStepper from '../components/CheckoutStepper';
import CheckoutContractPanel from '../components/CheckoutContractPanel';
import ContractSummary from '../components/ContractSummary';
import { loadCheckoutContext } from '../utils/checkoutContext';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  const extensionRequestId = searchParams.get('extensionRequestId');
  const sessionId = searchParams.get('session_id');
  const isExtensionPayment = !!extensionRequestId;
  const sidebar = useTenantSidebar();
  const checkoutContext = loadCheckoutContext(reservationId);

  const { data: statusRes, isLoading, isFetching } = usePaymentStatus(reservationId, sessionId);
  const status = getPaymentStatusFromResponse(statusRes);
  const isPaid = status && PAID_STATUSES.includes(status);
  const isPaymentPending = isLoading || (!isPaid && isFetching);

  const {
    contract,
    needsSignature,
    signMutation,
    isLoading: contractLoading,
  } = useContract(reservationId, isPaid && !isExtensionPayment);

  const isContractSigned = !!contract;
  const signError = signMutation.error?.message;

  const activeStep = isExtensionPayment
    ? (isPaid ? 3 : 1)
    : (isContractSigned ? 3 : isPaid ? 2 : 1);

  const handleSign = (termsAccepted) => signMutation.mutate(termsAccepted);

  const reservationSummary = checkoutContext ? {
    reservationId,
    propertyTitle: checkoutContext.propertyTitle,
    address: checkoutContext.address,
    city: checkoutContext.city,
    country: checkoutContext.country,
    checkIn: checkoutContext.checkIn,
    checkOut: checkoutContext.checkOut,
    numberOfGuests: checkoutContext.numberOfGuests,
    subtotal: checkoutContext.subtotal,
    cleaning: checkoutContext.cleaning,
    serviceFee: checkoutContext.serviceFee,
    totalAmount: checkoutContext.totalAmount,
  } : { reservationId };

  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        role="INQUILINO"
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
        onMobileOpenChange={sidebar.setIsMobileMenuOpen}
      />

      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="w-full max-w-2xl mx-auto text-center pt-8">

          <CheckoutStepper activeStep={activeStep} />

          {isExtensionPayment && isPaymentPending && !isPaid && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm mt-4">
              <Loader2 className="h-14 w-14 text-accent animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-primary mb-2">Procesando pago de extensión...</h1>
              <p className="text-sm text-slate-500">Confirmando tu pago con Stripe.</p>
            </div>
          )}

          {isExtensionPayment && isPaid && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm mt-4">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-primary mb-2">Extensión pagada</h1>
              <p className="text-sm text-slate-500 mb-6">
                La solicitud #{extensionRequestId} fue pagada. Tu check-out en la reserva #{reservationId} ha sido extendido.
              </p>
              <Link
                to="/tenant/reservations"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Ver mis reservas
              </Link>
            </div>
          )}

          {!isExtensionPayment && isPaymentPending && !isPaid && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm mt-4">
              <Loader2 className="h-14 w-14 text-accent animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-primary mb-2">Procesando pago...</h1>
              <p className="text-sm text-slate-500">
                Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos.
              </p>
            </div>
          )}

          {!isExtensionPayment && isPaid && contractLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm mt-4">
              <Loader2 className="h-14 w-14 text-accent animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-primary mb-2">Pago confirmado</h1>
              <p className="text-sm text-slate-500">Cargando contrato...</p>
            </div>
          )}

          {!isExtensionPayment && isPaid && needsSignature && !contractLoading && (
            <div className="mt-4">
              <CheckoutContractPanel
                content={contract?.content}
                reservationSummary={reservationSummary}
                onSign={handleSign}
                isPending={signMutation.isPending}
                error={signError}
              />
            </div>
          )}

          {!isExtensionPayment && isPaid && isContractSigned && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm mt-4">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-primary mb-2">Reserva confirmada</h1>
              <p className="text-sm text-slate-500 mb-6">
                Tu reserva #{reservationId} está completa. Contrato firmado digitalmente.
              </p>

              <ContractSummary contract={contract} reservationSummary={reservationSummary} />

              <Link
                to="/tenant/reservations"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Ver mis reservas
              </Link>
            </div>
          )}

          {!isExtensionPayment && !isPaymentPending && !isPaid && reservationId && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm mt-4">
              <h1 className="text-xl font-bold text-primary mb-2">Estado: {status ?? 'pendiente'}</h1>
              <p className="text-sm text-slate-500 mb-6">
                El pago aún no se ha confirmado. Si ya pagaste, espera unos segundos o contacta soporte.
              </p>
              <Link
                to="/tenant/reservations"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl border border-slate-200 text-sm font-semibold text-primary hover:bg-slate-50 transition-colors"
              >
                Ver mis reservas
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
