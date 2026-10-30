import { useCallback, useRef, useState } from 'react';
import { useScopesContext } from '../../modules/scopes/ScopesContext';

interface ScopeRef {
  scopeId: string;
}

export function useScopeNames() {
  const { useCases } = useScopesContext();
  const [names, setNames] = useState<Record<string, string>>({});
  const requested = useRef<Set<string>>(new Set());

  const resolve = useCallback(
    (refs: ScopeRef[]) => {
      refs.forEach(({ scopeId }) => {
        if (requested.current.has(scopeId)) return;
        requested.current.add(scopeId);

        useCases
          .getScope({ scopeId })
          .then((scope) => {
            setNames((prev) => ({ ...prev, [scopeId]: scope.name }));
          })
          .catch((err: unknown) => {
            // No s'ha pogut resoldre el nom: ens quedem amb l'id com a fallback.
            console.error(`No s'ha pogut resoldre l'scope ${scopeId}:`, err);
            setNames((prev) => ({ ...prev, [scopeId]: scopeId }));
          });
      });
    },
    [useCases],
  );

  return { names, resolve };
}
