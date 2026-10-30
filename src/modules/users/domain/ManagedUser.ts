export type ManagedUserRole = 'subscription_user' | 'system_administrator' | 'admin' | 'tenant';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  authorId: string;
  authorRole: string;
  isSystem: boolean;
  version: number;
  subscriptionIds: string[];
}
