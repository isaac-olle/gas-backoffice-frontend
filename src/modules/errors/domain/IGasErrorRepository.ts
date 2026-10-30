import { GasError } from './GasError';

export interface IGasErrorRepository {
  listErrors(): Promise<GasError[]>;
}
