import { Scope } from './Scope';

export interface IScopeRepository {
  getScope(scopeId: string): Promise<Scope>;
}
