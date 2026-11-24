// Client HTTP transversal. És l'ÚNIC lloc que llegeix la base del backend
// (`VITE_API_BASE_URL`); cap repositori ni component accedeix a import.meta.env.
// Els repositoris dels mòduls hi ataquen per implementar els seus ports.

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const csrfEnabled = import.meta.env.VITE_CSRF_ENABLED === 'true';
const callbackPath = '/v1/backoffice/auth/callback';
const csrfPath = '/v1/backoffice/auth/csrf';
const refreshPath = '/v1/backoffice/auth/refresh';
const logoutPath = '/v1/backoffice/auth/logout';
let csrfToken: string | null = null;
let sessionVersion = 0;
let csrfPromise: Promise<string> | null = null;
let refreshPromise: Promise<void> | null = null;
const sessionExpiredListeners = new Set<() => void>();

export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => { sessionExpiredListeners.delete(listener); };
}

function expireSession(): void {
  clearCsrfToken();
  for (const listener of sessionExpiredListeners) listener();
}

export function setCsrfToken(token: unknown): void {
  clearCsrfToken();
  csrfToken = parseCsrfToken(token);
}

export function clearCsrfToken(): void {
  sessionVersion++;
  csrfToken = null;
  csrfPromise = null;
  refreshPromise = null;
}

function parseCsrfToken(token: unknown): string | null {
  return typeof token === 'string' && token.trim() ? token : null;
}

function assertCurrentSession(version: number): void {
  if (version !== sessionVersion) throw new Error('Session changed');
}

async function recoverCsrfToken(version: number): Promise<string> {
  assertCurrentSession(version);
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = fetch(`${baseUrl}${csrfPath}`, { method: 'GET', credentials: 'include' })
      .then(async (response) => {
        assertCurrentSession(version);
        if (response.status === 401) expireSession();
        if (!response.ok) throw new Error(await extractErrorMessage(response));

        const data = await response.json();
        assertCurrentSession(version);
        const token = parseCsrfToken(data?.csrf_token);
        if (!token) throw new Error('Missing CSRF token');
        csrfToken = token;
        return token;
      })
      .finally(() => {
        if (version === sessionVersion) csrfPromise = null;
      });
  }
  return csrfPromise;
}

async function requestHeaders(
  path: string, method: string, version: number, hasBody = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (csrfEnabled && method !== 'GET'
    && path.startsWith('/v1/backoffice/') && path !== callbackPath) {
    headers['X-CSRF-Token'] = await recoverCsrfToken(version);
  }
  return headers;
}

if (!baseUrl) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Cos JSON. Es serialitza automàticament.
  body?: unknown;
  signal?: AbortSignal;
}

function refreshSession(version: number): Promise<void> {
  assertCurrentSession(version);
  if (!refreshPromise) {
    refreshPromise = requestHeaders(refreshPath, 'POST', version)
      .then((headers) => {
        assertCurrentSession(version);
        return fetch(`${baseUrl}${refreshPath}`, { method: 'POST', credentials: 'include', headers });
      })
      .then(async (response) => {
        assertCurrentSession(version);
        if (response.status === 401) expireSession();
        if (!response.ok) {
          throw new Error(await extractErrorMessage(response));
        }
      })
      .finally(() => {
        if (version === sessionVersion) refreshPromise = null;
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
  const version = sessionVersion;
  const headers = await requestHeaders(path, method, version, body !== undefined);
  assertCurrentSession(version);

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    // La sessió la gestiona el backend via cookie (login OAuth); l'enviem sempre.
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 401 && canRefresh && path !== refreshPath
    && path !== csrfPath && path !== callbackPath) {
    try {
      await refreshSession(version);
      assertCurrentSession(version);
      return request<T>(path, options, false);
    } catch {
      // Si el refresh falla, mantenim l'error 401 de la request original.
    }
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const text = response.status === 204 ? '' : await response.text();
  assertCurrentSession(version);
  const result = text ? JSON.parse(text) : undefined;
  if (path === callbackPath) {
    setCsrfToken(result?.csrf_token);
  }
  return result as T;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const options = { method: 'POST', body } as const;
  if (path !== logoutPath) return request<T>(path, options);

  const version = sessionVersion;
  try {
    return await request<T>(path, options);
  } finally {
    if (version === sessionVersion) clearCsrfToken();
  }
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
  post,
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Base absoluta del backend, per a redireccions de navegador (flux OAuth).
export const apiBaseUrl = baseUrl;
