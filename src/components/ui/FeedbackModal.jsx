import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const variantConfig = {
  success: {
    icon: CheckCircle,
    iconClass: 'text-emerald-500',
    bgClass: 'bg-emerald-50',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-500',
    bgClass: 'bg-rose-50',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-50',
  },
};

const FeedbackModal = ({
  isOpen,
  title,
  message,
  variant = 'info',
  confirmLabel = 'Entendido',
  onClose,
}) => {
  if (!isOpen) return null;

  const config = variantConfig[variant] ?? variantConfig.info;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100 text-center">
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${config.bgClass}`}>
          <Icon className={`h-7 w-7 ${config.iconClass}`} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#091124]">{title}</h3>
          {message && <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
