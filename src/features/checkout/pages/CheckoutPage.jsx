import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { propertyApi } from '../../../api/propertyApi';
import { pickPrimaryPhoto, resolvePropertyPhotoSrc } from '../../../utils/propertyPhoto';
import { loadCheckoutContext } from '../utils/checkoutContext';
import { useStore } from '../../../store/useStore';
import { useTenantSidebar } from '../hooks/useTenantSidebar';
import { useIdentity } from '../hooks/useIdentity';
import { usePaymentCheckout } from '../hooks/usePaymentCheckout';
import CheckoutStepper from '../components/CheckoutStepper';
import CheckoutKycPanel from '../components/CheckoutKycPanel';
import CheckoutPaymentPanel from '../components/CheckoutPaymentPanel';
import ReservationSummaryCard from '../components/ReservationSummaryCard';

const CheckoutPage = () => {
  const { reservationId } = useParams();
  const location = useLocation();
  const sidebar = useTenantSidebar();
  const tenantId = useStore((s) => s.user?.id);

  const checkoutContext = location.state ?? loadCheckoutContext(reservationId);
  const propertyId = checkoutContext?.propertyId;

  const { data: propertyRes, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyApi.getById(propertyId).then((r) => r.data),
    enabled: !!propertyId,
  });

  const { data: photosRes } = useQuery({
    queryKey: ['photos', propertyId],
    queryFn: () => propertyApi.getPhotos(propertyId).then((r) => r.data ?? []),
    enabled: !!propertyId,
  });

  const {
    isVerified,
    needsUpload,
    uploadMutation,
    previewUrl,
    isLoading: identityLoading,
  } = useIdentity(tenantId);

  const checkoutMutation = usePaymentCheckout();

  const property = propertyRes ?? null;
  const photos = photosRes ?? [];
  const coverPhoto = resolvePropertyPhotoSrc(pickPrimaryPhoto(photos));

  const checkIn = checkoutContext?.checkIn;
  const checkOut = checkoutContext?.checkOut;
  const duration = checkoutContext?.duration ?? 1;
  const subtotal = checkoutContext?.subtotal ?? 0;
  const cleaning = checkoutContext?.cleaning ?? 0;
  const serviceFee = checkoutContext?.serviceFee ?? 0;
  const total = checkoutContext?.totalAmount ?? 0;
  const monthlyPrice = checkoutContext?.monthlyPrice ?? Math.round((property?.pricePerNight ?? 0) * 30);

  const activeStep = isVerified ? 1 : 0;
  const payError = checkoutMutation.error?.message;

  const handleKycSubmit = (payload) => uploadMutation.mutate(payload);
  const handlePay = () => {
    checkoutMutation.mutate({ reservationId, checkoutContext });
  };

  if (!checkoutContext) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebar.items} role="INQUILINO" isCollapsed={sidebar.isCollapsed} onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)} onMobileOpenChange={sidebar.setIsMobileMenuOpen} />
        <main className={sidebar.mainClass(sidebar.isCollapsed)}>
          <p className="text-center py-24 text-slate-600">Reserva no encontrada. Inicia el proceso desde el detalle de la propiedad.</p>
          <div className="text-center">
            <Link to="/tenant/catalog" className="text-sm font-medium text-accent hover:underline">Volver al catálogo</Link>
          </div>
        </main>
      </div>
    );
  }

  if (propertyLoading) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebar.items} role="INQUILINO" isCollapsed={sidebar.isCollapsed} onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)} onMobileOpenChange={sidebar.setIsMobileMenuOpen} />
        <main className={sidebar.mainClass(sidebar.isCollapsed)}>
          <div className="animate-pulse h-8 w-48 bg-slate-100 rounded mb-8" />
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="h-80 bg-slate-100 rounded-2xl" />
            <div className="h-96 bg-slate-100 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

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
        <div className="w-full max-w-6xl mx-auto">

          <Link
            to={propertyId ? `/tenant/property/${propertyId}` : '/tenant/catalog'}
            className={sidebar.backLinkClassName}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <div className="mb-8 lg:mb-10 text-center lg:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Reserva</span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              Confirma tu <span className="font-serif italic font-normal text-accent">reserva</span>
            </h1>
          </div>

          <CheckoutStepper activeStep={activeStep} />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(40%,420px)] lg:gap-8 lg:items-start">
            <div className="space-y-6">
              <CheckoutKycPanel
                needsUpload={needsUpload}
                isVerified={isVerified}
                previewUrl={previewUrl}
                onSubmit={handleKycSubmit}
                isUploading={uploadMutation.isPending}
                isLoading={identityLoading}
                uploadError={uploadMutation.error?.message}
              />

              <CheckoutPaymentPanel
                isEnabled={isVerified}
                total={total}
                onPay={handlePay}
                isPending={checkoutMutation.isPending}
                error={payError}
              />
            </div>

            <ReservationSummaryCard
              property={property}
              coverPhoto={coverPhoto}
              checkIn={checkIn}
              checkOut={checkOut}
              duration={duration}
              subtotal={subtotal}
              cleaning={cleaning}
              serviceFee={serviceFee}
              total={total}
              monthlyPrice={monthlyPrice}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
