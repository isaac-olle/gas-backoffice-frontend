import { useState } from 'react';
import { AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Subscription } from '../modules/subscriptions/domain/Subscription';
import { useSubscriptions } from './hooks/useSubscriptions';
import { DetailRow, Modal } from './components/modals/Modal';
import { useSubscriptionsContext } from '../modules/subscriptions/SubscriptionsContext';

export function SubscriptionsPage() {
  const { subscriptions, loading, error, reload } = useSubscriptions();
  const { createSubscription, deleteSubscription } = useSubscriptionsContext();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);
    try {
      await createSubscription({ id: crypto.randomUUID(), name: name.trim() });
      await reload();
      setName('');
      setShowCreate(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Error creant la subscripció');
    }
  };

  const confirmDelete = async () => {
    if (!subscriptionToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSubscription(subscriptionToDelete.id);
      await reload();
      setSubscriptionToDelete(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error eliminant la subscripció');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Subscriptions</h2>
        <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-500">
          <Plus className="h-4 w-4" /> New subscription
        </button>
      </div>

      {showCreate && (
        <Modal title="New subscription" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="grid gap-4">
            <label className="text-sm text-slate-400">
              Name <span className="text-xs text-slate-500">(Required)</span>
              <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-red-500" />
            </label>
            {createError && <p className="text-sm text-red-400">{createError}</p>}
            <button type="submit" disabled={!name.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">Create subscription</button>
          </form>
        </Modal>
      )}

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

      {!loading && !error && subscriptions.length === 0 && (
        <p className="text-sm text-slate-500 py-6 text-center">No hi ha subscripcions.</p>
      )}

      {!loading && !error && subscriptions.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="font-medium py-2 pr-4">Name</th>
              <th className="font-medium py-2">ID</th>
              <th className="font-medium py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                onClick={() => setSelectedSubscription(subscription)}
                className="border-b border-slate-800/60 last:border-0 cursor-pointer hover:bg-slate-800/40"
              >
                <td className="py-2.5 pr-4 text-slate-200">{subscription.name}</td>
                <td className="py-2.5 text-slate-400 font-mono text-xs">{subscription.id}</td>
                <td className="py-2.5 text-right">
                  <button type="button" title="Delete subscription" onClick={(event) => { event.stopPropagation(); setDeleteError(null); setSubscriptionToDelete(subscription); }} className="inline-flex rounded-md p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedSubscription && (
        <Modal title={selectedSubscription.name} onClose={() => setSelectedSubscription(null)}>
          <DetailRow label="ID">{selectedSubscription.id}</DetailRow>
        </Modal>
      )}

      {subscriptionToDelete && (
        <Modal title="Delete subscription" onClose={() => setSubscriptionToDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Are you sure you want to delete <span className="font-medium text-slate-100">{subscriptionToDelete.name}</span>?</p>
            {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setSubscriptionToDelete(null)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
              <button type="button" onClick={() => void confirmDelete()} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
