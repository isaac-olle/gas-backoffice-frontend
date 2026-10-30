import { FormEvent, useEffect, useState } from 'react';
import { Boxes, ShieldCheck, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useClients } from './hooks/useClients';
import { useProtectedResources } from './hooks/useProtectedResources';
import { useScopeNames } from './hooks/useScopeNames';
import { useAuthorNames } from './hooks/useAuthorNames';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useClientsContext } from '../modules/clients/ClientsContext';
import { useProtectedResourcesContext } from '../modules/protected_resources/ProtectedResourcesContext';
import { Client } from '../modules/clients/domain/Client';
import { ProtectedResource } from '../modules/protected_resources/domain/ProtectedResource';
import { Modal, DetailRow } from './components/modals/Modal';
import { Dropdown } from './components/forms/Dropdown';

export function DashboardPage() {
  const { clients, loading: clientsLoading, error: clientsError, reload: clientReload } = useClients();
  const {
    protectedResources,
    loading: resourcesLoading,
    error: resourcesError,
    reload: resourceReload,
  } = useProtectedResources();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedResource, setSelectedResource] = useState<ProtectedResource | null>(null);
  const { names: scopeNames, resolve: resolveScopeNames } = useScopeNames();
  const { names: authorNames, resolve: resolveAuthorNames } = useAuthorNames();
  const { subscriptions } = useSubscriptions();
  const { useCases: clientUseCases } = useClientsContext();
  const { useCases: resourceUseCases } = useProtectedResourcesContext();
  const [creationMode, setCreationMode] = useState<'client' | 'resource' | null>(null);
  const [creationStep, setCreationStep] = useState(1);
  const [selectedAllowedScopeIds, setSelectedAllowedScopeIds] = useState<Set<string>>(new Set());
  const [creationName, setCreationName] = useState('');
  const [creationSubscriptionId, setCreationSubscriptionId] = useState('');
  const [redirectUris, setRedirectUris] = useState('http://localhost:3000/oidc/callback/google');
  const [isPublic, setIsPublic] = useState(false);
  const [useClientSecret, setUseClientSecret] = useState(true);
  const [secretId, setSecretId] = useState('');
  const [secret, setSecret] = useState('');
  const [useAssertionKey, setUseAssertionKey] = useState(false);
  const [keyId, setKeyId] = useState('');
  const [key, setKey] = useState('');
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const subscriptionNames = new Map(
    subscriptions.map((subscription) => [subscription.id, subscription.name]),
  );

  const openCreation = (mode: 'client' | 'resource') => {
    setCreationMode(mode);
    setCreationStep(1);
    setSelectedAllowedScopeIds(new Set());
    setCreationName('');
    setCreationSubscriptionId(subscriptions[0]?.id ?? '');
    setRedirectUris('http://localhost:3000/oidc/callback/google');
    setIsPublic(false);
    setUseClientSecret(true);
    setSecretId(crypto.randomUUID());
    setSecret('');
    setUseAssertionKey(false);
    setKeyId('');
    setKey('');
    setCreationError(null);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!creationMode || !creationName.trim() || !creationSubscriptionId) return;
    if (creationMode === 'client' && creationStep < 3) {
      if (creationStep === 2 && (!useClientSecret && !useAssertionKey)) {
        setCreationError('Select at least one authentication method.');
        return;
      }
      setCreationStep((step) => step + 1);
      return;
    }
    if (creationMode === 'client' && (!useClientSecret && !useAssertionKey)) {
      setCreationError('Select at least one authentication method.');
      return;
    }
    setCreating(true);
    setCreationError(null);
    try {
      if (creationMode === 'resource') {
        await resourceUseCases.createProtectedResource({
          id: crypto.randomUUID(),
          subscriptionId: creationSubscriptionId,
          name: creationName.trim(),
        });
      } else {
        await clientUseCases.createClient({
          id: crypto.randomUUID(),
          subscriptionId: creationSubscriptionId,
          name: creationName.trim(),
          allowedGrantTypes: ['authorization_code'],
          redirectUris: redirectUris.split('\n').map((uri) => uri.trim()).filter(Boolean),
          public: isPublic,
          authentication: {
            ...(useClientSecret && secretId.trim() && secret
              ? { clientSecret: { id: secretId.trim(), secret } }
              : {}),
            ...(useAssertionKey && keyId.trim() && key
              ? { clientAssertionKey: { id: keyId.trim(), key, format: 'PEM' } }
              : {}),
          },
          allowedScopes: Array.from(selectedAllowedScopeIds),
        });
      }
      setCreationMode(null);
      setCreationName('');
      if (creationMode === 'resource') await resourceReload();
      else await clientReload();
    } catch (err: unknown) {
      setCreationError(err instanceof Error ? err.message : 'Error creant el recurs');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    resolveScopeNames(
      protectedResources.flatMap((resource) => resource.scopes.map((scopeId) => ({ scopeId }))),
    );
  }, [protectedResources, resolveScopeNames]);

  useEffect(() => {
    if (!selectedClient) return;
    resolveAuthorNames([selectedClient.authorId]);
    resolveScopeNames(
      selectedClient.allowedScopes.map((scopeId) => ({ scopeId })),
    );
  }, [selectedClient, resolveAuthorNames, resolveScopeNames]);

  useEffect(() => {
    if (!selectedResource) return;
    resolveAuthorNames([selectedResource.authorId]);
    resolveScopeNames(
      selectedResource.scopes.map((scopeId) => ({ scopeId })),
    );
  }, [selectedResource, resolveAuthorNames, resolveScopeNames]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel
        title="Clients"
        icon={Boxes}
        loading={clientsLoading}
        error={clientsError}
        isEmpty={clients.length === 0}
        action={<button type="button" onClick={() => openCreation('client')} className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500"><Plus className="h-3.5 w-3.5" /> New client</button>}
      >
        <div className="space-y-3">
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelectedClient(client)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 flex items-start justify-between gap-4 transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{client.name}</p>
                <p className="text-xs text-slate-500 font-mono truncate mt-1">{client.id}</p>
              </div>
              <StatusBadge status={client.status} />
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        title="Protected Resources"
        icon={ShieldCheck}
        loading={resourcesLoading}
        error={resourcesError}
        isEmpty={protectedResources.length === 0}
        action={<button type="button" onClick={() => openCreation('resource')} className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500"><Plus className="h-3.5 w-3.5" /> New resource</button>}
      >
        <div className="space-y-3">
          {protectedResources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => setSelectedResource(resource)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-4 flex items-start justify-between gap-4 transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{resource.name}</p>
                <p className="text-xs text-slate-500 font-mono truncate mt-1">{resource.id}</p>
              </div>
              <StatusBadge status={resource.status} />
            </button>
          ))}
        </div>
      </Panel>

      {selectedClient && (
        <Modal title={selectedClient.name} onClose={() => setSelectedClient(null)}>
          <DetailRow label="ID">{selectedClient.id}</DetailRow>
          <DetailRow label="Status">{selectedClient.status}</DetailRow>
          <DetailRow label="Subscription">
            {subscriptionNames.get(selectedClient.subscriptionId) ?? selectedClient.subscriptionId}
          </DetailRow>
          <DetailRow label="Author">{authorNames[selectedClient.authorId] ?? selectedClient.authorId}</DetailRow>
          <DetailRow label="Author role">{selectedClient.authorRole}</DetailRow>
          <DetailRow label="Public">{selectedClient.public ? 'Yes' : 'No'}</DetailRow>
          <DetailRow label="System">{selectedClient.isSystem ? 'Yes' : 'No'}</DetailRow>
          <DetailRow label="Version">{selectedClient.version}</DetailRow>
          <DetailRow label="Allowed grant types">
            {selectedClient.allowedGrantTypes.join(', ') || '—'}
          </DetailRow>
          <DetailRow label="Redirect URIs">
            {selectedClient.redirectUris.join(', ') || '—'}
          </DetailRow>
          <DetailRow label="Allowed scopes">
            {selectedClient.allowedScopes
              .map((scopeId) => scopeNames[scopeId] ?? scopeId)
              .join(', ') || '—'}
          </DetailRow>
          <DetailRow label="Secret IDs">{selectedClient.secretIds.join(', ') || '—'}</DetailRow>
        </Modal>
      )}

      {selectedResource && (
        <Modal title={selectedResource.name} onClose={() => setSelectedResource(null)}>
          <DetailRow label="ID">{selectedResource.id}</DetailRow>
          <DetailRow label="Status">{selectedResource.status}</DetailRow>
          <DetailRow label="Author">{authorNames[selectedResource.authorId] ?? selectedResource.authorId}</DetailRow>
          <DetailRow label="Author role">{selectedResource.authorRole}</DetailRow>
          <DetailRow label="System">{selectedResource.isSystem ? 'Yes' : 'No'}</DetailRow>
          <DetailRow label="Version">{selectedResource.version}</DetailRow>
          <DetailRow label="Scopes">
            {selectedResource.scopes
              .map((scopeId) => scopeNames[scopeId] ?? scopeId)
              .join(', ') || '—'}
          </DetailRow>
        </Modal>
      )}

      {creationMode && (
        <Modal
          title={creationMode === 'client' ? 'New client' : 'New protected resource'}
          onClose={() => setCreationMode(null)}
        >
          {creationMode === 'client' && (
            <div className="mb-5 flex items-center gap-2 text-xs">
              <span className={`rounded-full px-3 py-1 ${creationStep === 1 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Information</span>
              <span className={`rounded-full px-3 py-1 ${creationStep === 2 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Authentication</span>
              <span className={`rounded-full px-3 py-1 ${creationStep === 3 ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Allowed scopes</span>
            </div>
          )}
          <form onSubmit={handleCreate} className="grid gap-4">
            {(creationMode === 'resource' || creationStep === 1) && <label className="text-sm text-slate-400">
              Subscription <span className="text-xs text-slate-500">(Required)</span>
              {subscriptions.length > 0 ? (
                <Dropdown
                  value={creationSubscriptionId}
                  options={subscriptions.map((subscription) => ({ value: subscription.id, label: subscription.name }))}
                  onChange={setCreationSubscriptionId}
                />
              ) : (
                <p className="mt-1 text-xs text-red-400">No subscriptions available.</p>
              )}
            </label>}
            {(creationMode === 'resource' || creationStep === 1) && <label className="text-sm text-slate-400">
              Name <span className="text-xs text-slate-500">(Required)</span>
              <input required value={creationName} onChange={(event) => setCreationName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-red-500" />
            </label>}
            {creationMode === 'client' && creationStep === 1 && (
              <>
                <label className="text-sm text-slate-400">
                  Allowed grant types
                  <input value="authorization_code" readOnly className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-400" />
                </label>
                <label className="text-sm text-slate-400">
                  Redirect URIs <span className="text-xs text-slate-500">(one per line)</span>
                  <textarea required value={redirectUris} onChange={(event) => setRedirectUris(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-red-500" />
                </label>
                <button type="button" role="switch" aria-checked={isPublic} onClick={() => setIsPublic((value) => !value)} className="flex items-center gap-3 text-sm text-slate-400">
                  <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${isPublic ? 'bg-red-600' : 'bg-slate-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} /></span>
                  Public: {isPublic ? 'true' : 'false'}
                </button>
              </>
            )}
            {creationMode === 'client' && creationStep === 2 && (
              <>
                <p className="text-sm text-slate-400">Configure at least one authentication method.</p>
                <button type="button" role="switch" aria-checked={useClientSecret} onClick={() => setUseClientSecret((value) => !value)} className="flex items-center gap-3 text-sm text-slate-400">
                  <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full ${useClientSecret ? 'bg-red-600' : 'bg-slate-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${useClientSecret ? 'translate-x-6' : 'translate-x-1'}`} /></span>
                  Client secret
                </button>
                {useClientSecret && <div className="grid gap-3 rounded-lg border border-slate-800 p-3">
                  <input required placeholder="Secret" value={secret} onChange={(event) => setSecret(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200" />
                </div>}
                <button type="button" role="switch" aria-checked={useAssertionKey} onClick={() => setUseAssertionKey((value) => !value)} className="flex items-center gap-3 text-sm text-slate-400">
                  <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full ${useAssertionKey ? 'bg-red-600' : 'bg-slate-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${useAssertionKey ? 'translate-x-6' : 'translate-x-1'}`} /></span>
                  Client assertion key
                </button>
                {useAssertionKey && <div className="grid gap-3 rounded-lg border border-slate-800 p-3">
                  <div className="flex gap-2">
                    <input readOnly placeholder="Key ID" value={keyId} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400" />
                    <button type="button" onClick={() => setKeyId(crypto.randomUUID())} className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">Generate UUID</button>
                  </div>
                  <textarea required placeholder="-----BEGIN PUBLIC KEY-----" value={key} onChange={(event) => setKey(event.target.value)} rows={5} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200" />
                  <p className="text-xs text-slate-500">Format: PEM</p>
                </div>}
              </>
            )}
            {creationMode === 'client' && creationStep === 3 && (
              <>
                <p className="text-sm text-slate-400">Select the scopes this client is allowed to use.</p>
                {Array.from(new Set(protectedResources.flatMap((resource) => resource.scopes))).length === 0 ? (
                  <p className="text-sm text-slate-500">No scopes available.</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {Array.from(new Set(protectedResources.flatMap((resource) => resource.scopes))).map((scopeId) => {
                      const selected = selectedAllowedScopeIds.has(scopeId);
                      return (
                        <button
                          key={scopeId}
                          type="button"
                          onClick={() => setSelectedAllowedScopeIds((current) => {
                            const next = new Set(current);
                            if (selected) next.delete(scopeId);
                            else next.add(scopeId);
                            return next;
                          })}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${selected ? 'border-red-600 bg-red-600/10 text-slate-200' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                          <span>{scopeNames[scopeId] ?? scopeId}</span>
                          <span className={`h-4 w-4 rounded border ${selected ? 'border-red-500 bg-red-600' : 'border-slate-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {creationError && <p className="text-sm text-red-400">{creationError}</p>}
            <div className="flex gap-3">
              {creationMode === 'client' && creationStep > 1 && <button type="button" onClick={() => setCreationStep((step) => step - 1)} className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Back</button>}
              <button type="submit" disabled={creating || !creationName.trim() || !creationSubscriptionId || subscriptions.length === 0 || (creationMode === 'client' && creationStep === 2 && (!useClientSecret && !useAssertionKey || (useClientSecret && (!secretId.trim() || !secret)) || (useAssertionKey && (!keyId.trim() || !key))))} className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">
                {creating ? 'Creating…' : creationMode === 'client' && creationStep < 3 ? 'Next' : creationMode === 'client' ? 'Create client' : 'Create resource'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const isActive = status === 'active';
  return (
    <span
      className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
        isActive
          ? 'text-emerald-400 border-emerald-800 bg-emerald-950/50'
          : 'text-slate-400 border-slate-700 bg-slate-800'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

interface PanelProps {
  title: string;
  icon: typeof Boxes;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function Panel({ title, icon: Icon, loading, error, isEmpty, children, action }: PanelProps) {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-red-500" />
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>

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

      {!loading && !error && isEmpty && (
        <p className="text-sm text-slate-500 py-6 text-center">No hi ha dades.</p>
      )}

      {!loading && !error && !isEmpty && children}
    </section>
  );
}
