import { useState } from 'react';
import { Activity, AlertCircle, Loader2 } from 'lucide-react';
import { GasEvent } from '../modules/events/domain/GasEvent';
import { useGasEvents } from './hooks/useGasEvents';
import { DetailRow, Modal } from './components/modals/Modal';

export function EventsPage() {
  const { events, loading, error } = useGasEvents();
  const [selectedEvent, setSelectedEvent] = useState<GasEvent | null>(null);

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">Events</h2>
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
        </div>
      )}
      {!loading && error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-400 py-6">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <p className="text-sm text-slate-500 py-6 text-center">No hi ha events.</p>
      )}
      {!loading && !error && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event) => (
            <button key={event.id} type="button" onClick={() => setSelectedEvent(event)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 flex flex-wrap items-start justify-between gap-4 transition">
              <div className="min-w-0 flex items-start gap-3">
                <Activity className="w-4 h-4 mt-0.5 shrink-0 text-sky-400" />
                <div className="min-w-0 break-all">
                  <p className="text-sm font-medium text-slate-200">{event.type}</p>
                  <p className="text-xs text-slate-500 mt-1.5">{event.aggregateType} · {event.aggregateId}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{new Date(event.occurredAt).toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
      {selectedEvent && (
        <Modal title={selectedEvent.type} onClose={() => setSelectedEvent(null)}>
          <DetailRow label="ID">{selectedEvent.id}</DetailRow>
          <DetailRow label="Type">{selectedEvent.type}</DetailRow>
          <DetailRow label="Aggregate type">{selectedEvent.aggregateType}</DetailRow>
          <DetailRow label="Aggregate ID">{selectedEvent.aggregateId}</DetailRow>
          <DetailRow label="Author ID">{selectedEvent.authorId ?? '—'}</DetailRow>
          <DetailRow label="Author role">{selectedEvent.authorRole ?? '—'}</DetailRow>
          <DetailRow label="Occurred at">{new Date(selectedEvent.occurredAt).toLocaleString()}</DetailRow>
          <DetailRow label="Payload">
            <code className="block whitespace-pre-wrap text-left font-mono text-xs">{JSON.stringify(selectedEvent.payload ?? null, null, 2)}</code>
          </DetailRow>
        </Modal>
      )}
    </section>
  );
}
