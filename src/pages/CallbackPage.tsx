import { useEffect, useState } from 'react';
import { useAuth } from '../modules/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface CallbackPageProps {
  idpReferenceName: string;
}

export function CallbackPage({ idpReferenceName }: CallbackPageProps) {
  const { useCases } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const errorParam = params.get('error');
    if (errorParam) {
      setError(params.get('error_description') ?? errorParam);
      return;
    }

    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      // No deixem l'usuari atrapat en una ruta de callback incompleta.
      window.location.replace('/');
      return;
    }

    // Neteja el codi i el state de la URL immediatament per no deixar-los a l'historial.
    window.history.replaceState({}, '', window.location.pathname);

    useCases.completeLogin({ idpReferenceName, code, state }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Error desconegut durant l\'autenticació');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
          <p className="text-red-400 max-w-sm">{error}</p>
          <a href="/" className="text-slate-400 hover:text-white text-sm underline">
            Torna a l&apos;inici de sessió
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );
}
