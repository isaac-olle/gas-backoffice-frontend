import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IClientRepository } from './domain/IClientRepository';
import { CreateClientInput } from './domain/IClientRepository';
import { Client } from './domain/Client';
import { listClients } from './application/ListClients';
import { createClient } from './application/CreateClient';

interface ClientsUseCases {
  listClients: () => Promise<Client[]>;
  createClient: (input: CreateClientInput) => Promise<void>;
}

interface ClientsContextType {
  useCases: ClientsUseCases;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

interface ClientsProviderProps {
  clientRepository: IClientRepository;
  children: ReactNode;
}

export function ClientsProvider({ clientRepository, children }: ClientsProviderProps) {
  const useCases = useMemo<ClientsUseCases>(
    () => ({
      listClients: () => listClients(clientRepository),
      createClient: (input) => createClient(clientRepository, input),
    }),
    [clientRepository],
  );

  return <ClientsContext.Provider value={{ useCases }}>{children}</ClientsContext.Provider>;
}

export function useClientsContext() {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error('useClientsContext must be used within a ClientsProvider');
  }
  return context;
}
