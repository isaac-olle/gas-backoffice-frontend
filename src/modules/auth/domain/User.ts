export type UserRole =
  | 'system_administrator'
  | 'subscription_user'
  // Legacy role names kept for backwards compatibility with older API responses.
  | 'admin'
  | 'tenant'
  | 'system administrator'
  | 'system-administrator';

export function isAdminRole(role: UserRole | null): boolean {
  if (!role) return false;

  const normalizedRole = role.trim().toLowerCase().replace(/[-_]+/g, ' ');
  return normalizedRole === 'admin' || normalizedRole === 'system administrator';
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  authorId?: string;
  authorRole?: string;
}
