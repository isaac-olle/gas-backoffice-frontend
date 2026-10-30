import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { User, UserRole } from './domain/User';
import { IAuthRepository } from './domain/IAuthRepository';
import { authorize } from './application/Authorize';
import { completeLogin } from './application/CompleteLogin';
import { signOut } from './application/SignOut';
import { getCurrentUser } from './application/GetCurrentUser';
import { observeAuthState } from './application/ObserveAuthState';

interface AuthUseCases {
  authorize: () => void;
  completeLogin: (input: { idpReferenceName: string; code: string; state: string }) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  observeAuthState: (onChange: (user: User | null) => void) => () => void;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  useCases: AuthUseCases;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  authRepository: IAuthRepository;
  children: ReactNode;
}

export function AuthProvider({ authRepository, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // En el callback OIDC encara no hi ha cookie de sessió: primer cal
    // intercanviar el code/state i només després consultar /users/me.
    if (window.location.pathname.startsWith('/oidc/callback/')) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    getCurrentUser(authRepository)
      .then((result) => {
        if (active) setUser(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authRepository]);

  const useCases = useMemo<AuthUseCases>(
    () => ({
      authorize: () => authorize(authRepository, { idpReferenceName: 'google' }),
      completeLogin: async (input) => {
        const result = await completeLogin(authRepository, {
          idpReferenceName: input.idpReferenceName,
          code: input.code,
          state: input.state,
        });
        setUser(result.user);
      },
      signOut: async () => {
        await signOut(authRepository);
        setUser(null);
      },
      getCurrentUser: () => getCurrentUser(authRepository),
      observeAuthState: (onChange) => observeAuthState(authRepository, onChange),
    }),
    [authRepository],
  );

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, useCases }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
