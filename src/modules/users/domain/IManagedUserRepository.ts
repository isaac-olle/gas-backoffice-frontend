import { ManagedUser, ManagedUserRole } from './ManagedUser';

export interface CreateManagedUserInput {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  isSystem: boolean;
  subscriptionIds: string[];
}

export interface IManagedUserRepository {
  listManagedUsers(): Promise<ManagedUser[]>;
  getManagedUser(userId: string): Promise<ManagedUser>;
  createManagedUser(input: CreateManagedUserInput): Promise<void>;
  deleteManagedUser(userId: string): Promise<void>;
  addSubscriptionPermission(userId: string, subscriptionId: string): Promise<void>;
}
