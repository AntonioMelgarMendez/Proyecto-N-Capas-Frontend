import { resolveContractContent } from '../utils/contractTemplate';

const formatDateTime = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ContractSummary = ({ contract, reservationSummary }) => {
  if (!contract) return null;

  const contractText = resolveContractContent(contract.content, {
    ...reservationSummary,
    contractId: contract.contractId,
    reservationId: contract.reservationId ?? reservationSummary?.reservationId,
    tenantSignatureDate: contract.tenantSignatureDate,
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left space-y-3 mb-6">
      <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        <p><span className="font-semibold text-primary">Contrato #</span> {contract.contractId}</p>
        <p><span className="font-semibold text-primary">Reserva #</span> {contract.reservationId}</p>
        <p><span className="font-semibold text-primary">Estado:</span> {contract.status}</p>
        {contract.tenantSignatureDate && (
          <p><span className="font-semibold text-primary">Firmado:</span> {formatDateTime(contract.tenantSignatureDate)}</p>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Contenido del contrato</p>
        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">{contractText}</p>
      </div>

      {contract.signatureHash && (
        <p className="text-[10px] font-mono text-slate-400 break-all border-t border-slate-200 pt-3">
          Hash: {contract.signatureHash}
        </p>
      )}
    </div>
  );
};

export default ContractSummary;
