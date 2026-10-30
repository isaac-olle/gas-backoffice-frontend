import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IProtectedResourceRepository } from './domain/IProtectedResourceRepository';
import { CreateProtectedResourceInput } from './domain/IProtectedResourceRepository';
import { ProtectedResource } from './domain/ProtectedResource';
import { listProtectedResources } from './application/ListProtectedResources';
import { createProtectedResource } from './application/CreateProtectedResource';

interface ProtectedResourcesUseCases {
  listProtectedResources: () => Promise<ProtectedResource[]>;
  createProtectedResource: (input: CreateProtectedResourceInput) => Promise<void>;
}

interface ProtectedResourcesContextType {
  useCases: ProtectedResourcesUseCases;
}

const ProtectedResourcesContext = createContext<ProtectedResourcesContextType | undefined>(
  undefined,
);

interface ProtectedResourcesProviderProps {
  protectedResourceRepository: IProtectedResourceRepository;
  children: ReactNode;
}

export function ProtectedResourcesProvider({
  protectedResourceRepository,
  children,
}: ProtectedResourcesProviderProps) {
  const useCases = useMemo<ProtectedResourcesUseCases>(
    () => ({
      listProtectedResources: () => listProtectedResources(protectedResourceRepository),
      createProtectedResource: (input) => createProtectedResource(protectedResourceRepository, input),
    }),
    [protectedResourceRepository],
  );

  return (
    <ProtectedResourcesContext.Provider value={{ useCases }}>
      {children}
    </ProtectedResourcesContext.Provider>
  );
}

export function useProtectedResourcesContext() {
  const context = useContext(ProtectedResourcesContext);
  if (context === undefined) {
    throw new Error(
      'useProtectedResourcesContext must be used within a ProtectedResourcesProvider',
    );
  }
  return context;
}
