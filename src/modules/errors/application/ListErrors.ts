import { IGasErrorRepository } from '../domain/IGasErrorRepository';
import { GasError } from '../domain/GasError';

export function listErrors(gasErrorRepository: IGasErrorRepository): Promise<GasError[]> {
  return gasErrorRepository.listErrors();
}
