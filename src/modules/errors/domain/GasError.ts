export interface GasErrorStackTrace {
  origin: string;
  line: number;
}

export interface GasError {
  id: string;
  type: string;
  code: string;
  description: string;
  details: unknown;
  cause: string[];
  stackTrace: GasErrorStackTrace | null;
  requestId: string;
  occurredAt: string;
}
