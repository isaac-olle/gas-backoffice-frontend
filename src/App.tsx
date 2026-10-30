import { useState } from 'react';
import { useAuth } from './modules/auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { MainLayout } from './pages/components/layout/MainLayout';
import { Loader2 } from 'lucide-react';

const CALLBACK_PATH_PREFIX = '/oidc/callback/';

function App() {
  const { user, loading } = useAuth();
  // Llegim el pathname una sola vegada en muntar (sense router, dues rutes: / i /oidc/callback/:idp).
  const [pathname] = useState(() => window.location.pathname);

  if (pathname.startsWith(CALLBACK_PATH_PREFIX)) {
    const idpReferenceName = pathname.slice(CALLBACK_PATH_PREFIX.length);

    if (!user) {
      // Mostrem la pàgina de callback fins que completeLogin posi l'usuari.
      return <CallbackPage idpReferenceName={idpReferenceName} />;
    }
    // Login completat: netegem la URL i mostrem l'app.
    window.history.replaceState({}, '', '/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainLayout />;
}

export default App;
