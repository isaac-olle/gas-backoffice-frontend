import { useState } from 'react';
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useGasErrors } from './hooks/useGasErrors';
import { GasError } from '../modules/errors/domain/GasError';
import { Modal, DetailRow } from './components/modals/Modal';

export function ErrorsPage() {
  const { errors, loading, error } = useGasErrors();
  const [selectedError, setSelectedError] = useState<GasError | null>(null);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">Errors</h2>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 text-sm text-red-400 py-6">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!loading && !error && errors.length === 0 && (
        <p className="text-sm text-slate-500 py-6 text-center">No hi ha errors.</p>
      )}

      {!loading && !error && errors.length > 0 && (
        <div className="space-y-3">
          {errors.map((gasError) => (
            <button
              key={gasError.id}
              type="button"
              onClick={() => setSelectedError(gasError)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 flex items-start justify-between gap-4 transition"
            >
              <div className="min-w-0 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 font-mono">
                      {gasError.code}
                    </span>
                    <span className="text-[11px] text-slate-500">{gasError.type}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 mt-1.5">
                    {gasError.description}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {new Date(gasError.occurredAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedError && (
        <Modal title={selectedError.code} onClose={() => setSelectedError(null)}>
          <DetailRow label="ID">{selectedError.id}</DetailRow>
          <DetailRow label="Type">{selectedError.type}</DetailRow>
          <DetailRow label="Description">{selectedError.description}</DetailRow>
          <DetailRow label="Request ID">{selectedError.requestId}</DetailRow>
          <DetailRow label="Occurred at">
            {new Date(selectedError.occurredAt).toLocaleString()}
          </DetailRow>
          <DetailRow label="Cause">
            {selectedError.cause.length > 0 ? selectedError.cause.join('; ') : '—'}
          </DetailRow>
          {selectedError.stackTrace && (
            <>
              <DetailRow label="Stack origin">{selectedError.stackTrace.origin}</DetailRow>
              <DetailRow label="Stack line">{selectedError.stackTrace.line}</DetailRow>
            </>
          )}
          {selectedError.details !== null && selectedError.details !== undefined && (
            <DetailRow label="Details">
              <pre className="whitespace-pre-wrap text-left font-mono text-xs">
                {JSON.stringify(selectedError.details, null, 2)}
              </pre>
            </DetailRow>
          )}
        </Modal>
      )}
    </section>
  );
}
