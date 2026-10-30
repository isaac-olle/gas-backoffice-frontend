import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IManagedUserRepository } from './domain/IManagedUserRepository';
import { ManagedUser } from './domain/ManagedUser';
import { CreateManagedUserInput } from './domain/IManagedUserRepository';
import { listManagedUsers } from './application/ListManagedUsers';
import { getManagedUser } from './application/GetManagedUser';
import { createManagedUser } from './application/CreateManagedUser';
import { deleteManagedUser } from './application/DeleteManagedUser';
import { addSubscriptionPermission } from './application/AddSubscriptionPermission';

interface UsersUseCases {
  listManagedUsers: () => Promise<ManagedUser[]>;
  getManagedUser: (userId: string) => Promise<ManagedUser>;
  createManagedUser: (input: CreateManagedUserInput) => Promise<void>;
  deleteManagedUser: (userId: string) => Promise<void>;
  addSubscriptionPermission: (userId: string, subscriptionId: string) => Promise<void>;
}

interface UsersContextType {
  useCases: UsersUseCases;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

interface UsersProviderProps {
  managedUserRepository: IManagedUserRepository;
  children: ReactNode;
}

export function UsersProvider({ managedUserRepository, children }: UsersProviderProps) {
  const useCases = useMemo<UsersUseCases>(
    () => ({
      listManagedUsers: () => listManagedUsers(managedUserRepository),
      getManagedUser: (userId) => getManagedUser(managedUserRepository, userId),
      createManagedUser: (input) => createManagedUser(managedUserRepository, input),
      deleteManagedUser: (userId) => deleteManagedUser(managedUserRepository, userId),
      addSubscriptionPermission: (userId, subscriptionId) =>
        addSubscriptionPermission(managedUserRepository, userId, subscriptionId),
    }),
    [managedUserRepository],
  );

  return <UsersContext.Provider value={{ useCases }}>{children}</UsersContext.Provider>;
}

export function useUsersContext() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsersContext must be used within a UsersProvider');
  }
  return context;
}
