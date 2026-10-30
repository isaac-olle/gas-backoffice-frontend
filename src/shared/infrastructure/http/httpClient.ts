// Client HTTP transversal. És l'ÚNIC lloc que llegeix la base del backend
// (`VITE_API_BASE_URL`); cap repositori ni component accedeix a import.meta.env.
// Els repositoris dels mòduls hi ataquen per implementar els seus ports.

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;

if (!baseUrl) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

if (!clientId) {
  throw new Error('Missing VITE_OAUTH_CLIENT_ID environment variable');
}

const refreshPath = '/v1/backoffice/auth/refresh';
let refreshPromise: Promise<void> | null = null;

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Cos JSON. Es serialitza automàticament.
  body?: unknown;
  signal?: AbortSignal;
}

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${baseUrl}${refreshPath}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await extractErrorMessage(response));
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: HttpRequestOptions = {},
  canRefresh = true,
): Promise<T> {
  const { method = 'GET', body, signal } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    // La sessió la gestiona el backend via cookie (login OAuth); l'enviem sempre.
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 401 && canRefresh && path !== refreshPath) {
    try {
      await refreshSession();
      return request<T>(path, options, false);
    } catch {
      // Si el refresh falla, mantenim l'error 401 de la request original.
    }
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  // 204 No Content (p. ex. DELETE) o cos buit.
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    // Formats habituals: { message }, { error }, { error: { message } }.
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.error?.message === 'string') return data.error.message;
  } catch {
    // resposta sense JSON: continuem amb el genèric
  }
  return `Request failed with status ${response.status}`;
}

export const httpClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Base absoluta del backend, per a redireccions de navegador (flux OAuth).
export const apiBaseUrl = baseUrl;

// client_id públic del backoffice com a client OAuth del propi GAS.
export const oauthClientId = clientId;
