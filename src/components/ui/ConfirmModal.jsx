const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  isPending = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmCls = variant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 text-white'
    : 'bg-primary hover:bg-primary/90 text-white';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-[#091124]">{title}</h3>
          {message && <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 ${confirmCls}`}
          >
            {isPending ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
