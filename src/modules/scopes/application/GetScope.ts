import { IScopeRepository } from '../domain/IScopeRepository';
import { Scope } from '../domain/Scope';

export interface GetScopeInput {
  scopeId: string;
}

export function getScope(scopeRepository: IScopeRepository, input: GetScopeInput): Promise<Scope> {
  return scopeRepository.getScope(input.scopeId);
}
