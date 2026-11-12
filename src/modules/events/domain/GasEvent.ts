export interface GasEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  authorId: string | null;
  authorRole: string | null;
  payload: unknown;
  occurredAt: string;
}
