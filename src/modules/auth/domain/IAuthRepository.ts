import { User } from './User';

export interface InitLoginParams {
  idpReferenceName: string;
}

export interface ExchangeCodeParams {
  idpReferenceName: string;
  code: string;
  state: string;
}

export interface IAuthRepository {
  // Inicia el login: redirigeix el navegador a l'endpoint del backend que fa el flux OAuth.
  initLogin(params: InitLoginParams): void;
  // Bescanvia el codi d'autorització per tokens; el backend guarda la sessió en
  // una cookie HttpOnly i no torna cap token al body.
  exchangeCode(params: ExchangeCodeParams): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
