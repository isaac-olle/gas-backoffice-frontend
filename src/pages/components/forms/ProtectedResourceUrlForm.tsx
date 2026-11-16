import { FormEvent, useState } from 'react';

interface ProtectedResourceUrlFormProps {
  initialUrl: string | null;
  onSave: (url: string) => Promise<void>;
}

export function ProtectedResourceUrlForm({ initialUrl, onSave }: ProtectedResourceUrlFormProps) {
  const [url, setUrl] = useState(initialUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(url.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desant la URL');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-slate-800 pt-4">
      <label className="block text-sm text-slate-400">
        URL <span className="text-xs text-slate-500">(Optional)</span>
        <input type="url" value={url} disabled={saving} onChange={(event) => setUrl(event.target.value)}
          placeholder="https://api.example.com" pattern="https?://[^#]+"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-red-500 disabled:opacity-50" />
      </label>
      <p className="text-xs text-slate-500">HTTP or HTTPS URL without a fragment. Leave empty to remove the URL.</p>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={saving || url.trim() === (initialUrl ?? '')}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? 'Saving…' : 'Save URL'}
      </button>
    </form>
  );
}
