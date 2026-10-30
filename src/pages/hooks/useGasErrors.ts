import { useEffect, useState } from 'react';
import { useErrorsContext } from '../../modules/errors/ErrorsContext';
import { GasError } from '../../modules/errors/domain/GasError';

export function useGasErrors() {
  const { useCases } = useErrorsContext();
  const [errors, setErrors] = useState<GasError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    useCases
      .listErrors()
      .then((result) => {
        if (active) setErrors(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Error carregant els errors');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [useCases]);

  return { errors, loading, error };
}
