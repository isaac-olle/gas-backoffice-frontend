import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IScopeRepository } from './domain/IScopeRepository';
import { Scope } from './domain/Scope';
import { getScope, GetScopeInput } from './application/GetScope';

interface ScopesUseCases {
  getScope: (input: GetScopeInput) => Promise<Scope>;
}

interface ScopesContextType {
  useCases: ScopesUseCases;
}

const ScopesContext = createContext<ScopesContextType | undefined>(undefined);

interface ScopesProviderProps {
  scopeRepository: IScopeRepository;
  children: ReactNode;
}

export function ScopesProvider({ scopeRepository, children }: ScopesProviderProps) {
  const useCases = useMemo<ScopesUseCases>(
    () => ({
      getScope: (input) => getScope(scopeRepository, input),
    }),
    [scopeRepository],
  );

  return <ScopesContext.Provider value={{ useCases }}>{children}</ScopesContext.Provider>;
}

export function useScopesContext() {
  const context = useContext(ScopesContext);
  if (context === undefined) {
    throw new Error('useScopesContext must be used within a ScopesProvider');
  }
  return context;
}
