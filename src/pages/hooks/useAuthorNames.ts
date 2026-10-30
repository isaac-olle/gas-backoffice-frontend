import { useCallback, useRef, useState } from 'react';
import { useUsersContext } from '../../modules/users/UsersContext';

export function useAuthorNames() {
  const { useCases } = useUsersContext();
  const [names, setNames] = useState<Record<string, string>>({});
  const requested = useRef<Set<string>>(new Set());

  const resolve = useCallback(
    (authorIds: string[]) => {
      authorIds.forEach((authorId) => {
        if (requested.current.has(authorId)) return;
        requested.current.add(authorId);

        useCases
          .getManagedUser(authorId)
          .then((user) => setNames((previous) => ({ ...previous, [authorId]: user.name })))
          .catch(() => setNames((previous) => ({ ...previous, [authorId]: authorId })));
      });
    },
    [useCases],
  );

  return { names, resolve };
}
