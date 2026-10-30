import { FormEvent, useState } from 'react';
import { Loader2, AlertCircle, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useManagedUsers } from './hooks/useManagedUsers';
import { useSubscriptions } from './hooks/useSubscriptions';
import { ManagedUser } from '../modules/users/domain/ManagedUser';
import { isValidEmail } from '../modules/users/domain/Email';
import { useUsersContext } from '../modules/users/UsersContext';
import { Modal, DetailRow } from './components/modals/Modal';
import { Dropdown } from './components/forms/Dropdown';

export function UsersPage() {
  const { managedUsers, loading, error, reload } = useManagedUsers();
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError } = useSubscriptions();
  const { useCases } = useUsersContext();
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'subscription_user'>('subscription_user');
  const [step, setStep] = useState(1);
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<Set<string>>(new Set());
  const [isSystem, setIsSystem] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [userForPermission, setUserForPermission] = useState<ManagedUser | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [addingPermissionId, setAddingPermissionId] = useState<string | null>(null);
  const emailIsValid = isValidEmail(email);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      await useCases.createManagedUser({
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim(),
        role,
        isSystem,
        subscriptionIds: Array.from(selectedSubscriptionIds),
      });
      await reload();
      setShowCreateForm(false);
      setName('');
      setEmail('');
      setRole('subscription_user');
      setStep(1);
      setSelectedSubscriptionIds(new Set());
      setIsSystem(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Error creant l’usuari');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (user: ManagedUser) => {
    if (user.isSystem) return;
    setDeleteError(null);
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const user = userToDelete;
    setDeletingUserId(user.id);
    try {
      await useCases.deleteManagedUser(user.id);
      await reload();
      setUserToDelete(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error eliminant l’usuari');
    } finally {
      setDeletingUserId(null);
    }
  };

  const addPermission = async (subscriptionId: string) => {
    if (!userForPermission) return;
    setAddingPermissionId(subscriptionId);
    setPermissionError(null);
    try {
      await useCases.addSubscriptionPermission(userForPermission.id, subscriptionId);
      setUserForPermission((user) =>
        user
          ? { ...user, subscriptionIds: [...user.subscriptionIds, subscriptionId] }
          : user,
      );
    } catch (err: unknown) {
      setPermissionError(err instanceof Error ? err.message : 'Error afegint el permís');
    } finally {
      setAddingPermissionId(null);
    }
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200">Users</h2>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          New user
        </button>
      </div>

      {showCreateForm && (
        <Modal title="New user" onClose={() => setShowCreateForm(false)}>
          <div className="mb-5 flex items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 ${step === 1 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              1. User details
            </span>
            <span className={`rounded-full px-3 py-1 ${step === 2 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              2. Subscriptions
            </span>
          </div>

          <form onSubmit={handleCreate} className="grid gap-4">
            {step === 1 && (
              <>
                <label className="text-sm text-slate-400">
                  Name <span className="text-xs text-slate-500">(Required)</span>
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-red-500"
                  />
                </label>
                <label className="text-sm text-slate-400">
                  Email <span className="text-xs text-slate-500">(Required)</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-red-500"
                  />
                  {email.length > 0 && !emailIsValid && (
                    <span className="mt-1 block text-xs text-red-400">Enter a valid email.</span>
                  )}
                </label>
                <label className="text-sm text-slate-400">
                  Role
                  <Dropdown
                    value={role}
                    options={[{ value: 'subscription_user', label: 'subscription_user' }]}
                    onChange={setRole}
                  />
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isSystem}
                  onClick={() => setIsSystem((value) => !value)}
                  className="flex items-center gap-3 text-sm text-slate-400"
                >
                  <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${isSystem ? 'bg-red-600' : 'bg-slate-700'}`}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${isSystem ? 'translate-x-6' : 'translate-x-1'}`} />
                  </span>
                  System user: {isSystem ? 'true' : 'false'}
                </button>
                <button
                  type="button"
                  disabled={!name.trim() || !emailIsValid}
                  onClick={() => setStep(2)}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-slate-400">Select the subscriptions this user can use.</p>
                {subscriptionsLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-red-600" />}
                {!subscriptionsLoading && subscriptionsError && <p className="text-sm text-red-400">{subscriptionsError}</p>}
                {!subscriptionsLoading && !subscriptionsError && subscriptions.length === 0 && (
                  <p className="text-sm text-slate-500">No subscriptions available.</p>
                )}
                {!subscriptionsLoading && !subscriptionsError && subscriptions.length > 0 && (
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {subscriptions.map((subscription) => {
                      const selected = selectedSubscriptionIds.has(subscription.id);
                      return (
                        <button
                          key={subscription.id}
                          type="button"
                          onClick={() => setSelectedSubscriptionIds((current) => {
                            const next = new Set(current);
                            if (selected) next.delete(subscription.id);
                            else next.add(subscription.id);
                            return next;
                          })}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${selected ? 'border-red-600 bg-red-600/10 text-slate-200' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                          <span>{subscription.name}</span>
                          <span className={`h-4 w-4 rounded border ${selected ? 'border-red-500 bg-red-600' : 'border-slate-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
                {createError && <p className="text-sm text-red-400">{createError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={creating || subscriptionsLoading}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? 'Creating…' : 'Create user'}
                  </button>
                </div>
              </>
            )}
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

      {!loading && !error && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="font-medium py-2 pr-4">Name</th>
              <th className="font-medium py-2 pr-4">Email</th>
              <th className="font-medium py-2">Role</th>
              <th className="font-medium py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managedUsers.map((managedUser) => (
              <tr
                key={managedUser.id}
                onClick={() => setSelectedUser(managedUser)}
                className="border-b border-slate-800/60 last:border-0 cursor-pointer hover:bg-slate-800/40"
              >
                <td className="py-2.5 pr-4 text-slate-200">{managedUser.name}</td>
                <td className="py-2.5 pr-4 text-slate-400">{managedUser.email}</td>
                <td className="py-2.5">
                  <span className="text-xs text-red-500 font-medium capitalize">
                    {formatRole(managedUser.role)}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    disabled={managedUser.role === 'system_administrator'}
                    title={managedUser.role === 'system_administrator' ? 'System administrators cannot be modified' : 'Add subscription permission'}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPermissionError(null);
                      setUserForPermission(managedUser);
                    }}
                    className="mr-1 inline-flex rounded-md p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={managedUser.isSystem || deletingUserId === managedUser.id}
                    title={managedUser.isSystem ? 'System users cannot be deleted' : 'Delete user'}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete(managedUser);
                    }}
                    className="inline-flex rounded-md p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <Modal title={selectedUser.name} onClose={() => setSelectedUser(null)}>
          <DetailRow label="ID">{selectedUser.id}</DetailRow>
          <DetailRow label="Email">{selectedUser.email}</DetailRow>
          <DetailRow label="Role">{formatRole(selectedUser.role)}</DetailRow>
          <DetailRow label="Author ID">{selectedUser.authorId}</DetailRow>
          <DetailRow label="Author role">{selectedUser.authorRole}</DetailRow>
          <DetailRow label="System">{selectedUser.isSystem ? 'Yes' : 'No'}</DetailRow>
          <DetailRow label="Version">{selectedUser.version}</DetailRow>
        </Modal>
      )}

      {userToDelete && (
        <Modal title="Delete user" onClose={() => setUserToDelete(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete{' '}
              <span className="font-medium text-slate-100">{userToDelete.name}</span>?
            </p>
            {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deletingUserId === userToDelete.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingUserId === userToDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {userForPermission && (
        <Modal title="Add subscription permission" onClose={() => setUserForPermission(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Select a subscription for <span className="font-medium text-slate-100">{userForPermission.name}</span>.
            </p>
            {subscriptions.length === 0 && (
              <p className="text-sm text-slate-500">No subscriptions available.</p>
            )}
            {subscriptions.length > 0 && (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {subscriptions.map((subscription) => {
                  const hasAccess = userForPermission.subscriptionIds.includes(subscription.id);
                  return (
                    <div key={subscription.id} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-200">{subscription.name}</p>
                        <p className="truncate font-mono text-xs text-slate-500">{subscription.id}</p>
                      </div>
                      {hasAccess ? (
                        <span className="shrink-0 text-xs text-emerald-400">Has access</span>
                      ) : (
                        <button
                          type="button"
                          disabled={addingPermissionId === subscription.id}
                          onClick={() => void addPermission(subscription.id)}
                          className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {addingPermissionId === subscription.id ? 'Adding…' : 'Add'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {permissionError && <p className="text-sm text-red-400">{permissionError}</p>}
            <div className="flex justify-end">
              <button type="button" onClick={() => setUserForPermission(null)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function formatRole(role: string): string {
  return role.replace(/[-_]+/g, ' ');
}
