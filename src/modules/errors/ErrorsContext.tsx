import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IGasErrorRepository } from './domain/IGasErrorRepository';
import { GasError } from './domain/GasError';
import { listErrors } from './application/ListErrors';

interface ErrorsUseCases {
  listErrors: () => Promise<GasError[]>;
}

interface ErrorsContextType {
  useCases: ErrorsUseCases;
}

const ErrorsContext = createContext<ErrorsContextType | undefined>(undefined);

interface ErrorsProviderProps {
  gasErrorRepository: IGasErrorRepository;
  children: ReactNode;
}

export function ErrorsProvider({ gasErrorRepository, children }: ErrorsProviderProps) {
  const useCases = useMemo<ErrorsUseCases>(
    () => ({
      listErrors: () => listErrors(gasErrorRepository),
    }),
    [gasErrorRepository],
  );

  return <ErrorsContext.Provider value={{ useCases }}>{children}</ErrorsContext.Provider>;
}

export function useErrorsContext() {
  const context = useContext(ErrorsContext);
  if (context === undefined) {
    throw new Error('useErrorsContext must be used within an ErrorsProvider');
  }
  return context;
}
