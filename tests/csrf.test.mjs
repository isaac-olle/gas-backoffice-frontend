import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

let moduleId = 0;
const originalFetch = globalThis.fetch;
function moduleUrl(source) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  });
  return `data:text/javascript;base64,${Buffer.from(`${outputText}\n// ${moduleId++}`).toString('base64')}`;
}

async function client(enabled) {
  const source = await readFile(new URL('../src/shared/infrastructure/http/httpClient.ts', import.meta.url), 'utf8');
  const env = { VITE_API_BASE_URL: 'https://api.example.test', VITE_CSRF_ENABLED: enabled };
  const url = moduleUrl(source.replaceAll('import.meta.env', JSON.stringify(env)));
  const http = await import(url);
  const authSource = await readFile(new URL('../src/modules/auth/infrastructure/repositories/AuthRepository.ts', import.meta.url), 'utf8');
  const { AuthRepository } = await import(moduleUrl(authSource.replace('../../../../shared/infrastructure/http/httpClient', url)));
  return { ...http, auth: new AuthRepository() };
}

function mockFetch(t, responses = []) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options });
    const response = await responses.shift();
    return new Response(response?.body ?? null, { status: response?.status ?? 204 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  return calls;
}

const login = { idpReferenceName: 'microsoft', code: 'code', state: 'state' };
const csrfPath = '/v1/backoffice/auth/csrf';
const refreshPath = '/v1/backoffice/auth/refresh';
const resourcePath = '/v1/backoffice/resources';
const recovered = { status: 200, body: '{"csrf_token":"recovered"}' };

function paths(calls) {
  return calls.map((call) => new URL(call.url).pathname);
}

test('disabled by default and when false, even if callback supplies a token', async (t) => {
  for (const enabled of [undefined, 'false']) {
    const calls = mockFetch(t, [{ status: 200, body: '{"csrf_token":"secret"}' }]);
    const { auth, httpClient } = await client(enabled);
    await auth.exchangeCode(login);
    await httpClient.post('/v1/backoffice/clients', { name: 'Client' });
    await auth.signOut();
    assert.equal(calls.length, 3);
    assert.ok(calls.every((call) => call.headers['X-CSRF-Token'] === undefined));
    assert.ok(calls.every((call) => call.credentials === 'include'));
  }
});

test('callback token protects mutations but not GET, callback or other API paths', async (t) => {
  const calls = mockFetch(t, [{ status: 200, body: '{"csrf_token":"secret"}' }]);
  const { auth, httpClient } = await client('true');
  await auth.exchangeCode(login);
  for (const method of ['post', 'put', 'patch', 'delete']) {
    await httpClient[method]('/v1/backoffice/resources', method === 'delete' ? undefined : {});
  }
  await httpClient.get('/v1/backoffice/resources');
  await httpClient.post('/v1/other', {});
  assert.equal(calls[0].headers['X-CSRF-Token'], undefined);
  for (const call of calls.slice(1, 5)) assert.equal(call.headers['X-CSRF-Token'], 'secret');
  assert.equal(calls[1].headers['Content-Type'], 'application/json');
  assert.equal(calls[4].headers['Content-Type'], undefined);
  for (const call of calls.slice(5)) assert.equal(call.headers['X-CSRF-Token'], undefined);
  assert.ok(calls.every((call) => call.credentials === 'include'));
});

test('refresh and mutation retry carry the token', async (t) => {
  const calls = mockFetch(t, [
    { status: 200, body: '{"csrf_token":"secret"}' },
    { status: 401 }, { status: 204 }, { status: 204 },
  ]);
  const { auth, httpClient } = await client('true');
  await auth.exchangeCode(login);
  await httpClient.patch('/v1/backoffice/resources', {});
  assert.equal(calls[2].url, 'https://api.example.test/v1/backoffice/auth/refresh');
  for (const call of calls.slice(1)) {
    assert.equal(call.headers['X-CSRF-Token'], 'secret');
    assert.equal(call.credentials, 'include');
  }
});

test('logout sends the token and clears it even if logout fails', async (t) => {
  for (const status of [204, 500]) {
    const calls = mockFetch(t, [
      { status: 200, body: '{"csrf_token":"secret"}' }, { status }, recovered,
    ]);
    const { auth, httpClient } = await client('true');
    await auth.exchangeCode(login);
    if (status === 500) await assert.rejects(auth.signOut());
    else await auth.signOut();
    await httpClient.post('/v1/backoffice/resources', {});
    assert.equal(calls[1].headers['X-CSRF-Token'], 'secret');
    assert.equal(paths(calls)[2], csrfPath);
    assert.equal(calls[3].headers['X-CSRF-Token'], 'recovered');
  }
});

test('empty, absent and invalid callback tokens clear the previous token', async (t) => {
  for (const response of [null, '{}', '{"csrf_token":null}', '{"csrf_token":""}', '{"csrf_token":123}']) {
    const calls = mockFetch(t, [{ status: response === null ? 204 : 200, body: response }, recovered]);
    const { auth, httpClient, setCsrfToken } = await client('true');
    setCsrfToken('previous');
    await auth.exchangeCode(login);
    await httpClient.post('/v1/backoffice/resources', {});
    assert.deepEqual(paths(calls), ['/v1/backoffice/auth/callback', csrfPath, resourcePath]);
    assert.equal(calls[2].headers['X-CSRF-Token'], 'recovered');
  }
});

test('reload with an active session recovers on the first write', async (t) => {
  const calls = mockFetch(t, [
    { status: 200, body: '{"csrf_token":"previous"}' }, { status: 204 }, recovered,
  ]);
  const first = await client('true');
  await first.auth.exchangeCode(login);
  const reloaded = await client('true');
  await reloaded.httpClient.get(resourcePath);
  await reloaded.httpClient.post(resourcePath, {});
  await reloaded.httpClient.delete(resourcePath);
  assert.deepEqual(paths(calls).slice(1), [resourcePath, csrfPath, resourcePath, resourcePath]);
  assert.equal(calls[1].headers['X-CSRF-Token'], undefined);
  assert.equal(calls[2].method, 'GET');
  assert.equal(calls[2].credentials, 'include');
  assert.equal(calls[2].headers?.['X-CSRF-Token'], undefined);
  assert.ok(calls.slice(3).every((call) => call.headers['X-CSRF-Token'] === 'recovered'));
});

test('failed callback clears the previous token', async (t) => {
  const calls = mockFetch(t, [{ status: 500 }, recovered]);
  const { auth, httpClient, setCsrfToken } = await client('true');
  setCsrfToken('previous');
  await assert.rejects(auth.exchangeCode(login));
  await httpClient.post(resourcePath, {});
  assert.equal(paths(calls)[1], csrfPath);
  assert.equal(calls[2].headers['X-CSRF-Token'], 'recovered');
});

test('automatic refresh recovers the token before retrying a read', async (t) => {
  const calls = mockFetch(t, [{ status: 401 }, recovered]);
  const { httpClient } = await client('true');
  await httpClient.get(resourcePath);
  assert.deepEqual(paths(calls), [resourcePath, csrfPath, refreshPath, resourcePath]);
  assert.equal(calls[2].headers['X-CSRF-Token'], 'recovered');
  assert.equal(calls[3].headers['X-CSRF-Token'], undefined);
});

test('logout recovers the token when memory is empty', async (t) => {
  const calls = mockFetch(t, [recovered]);
  const { auth } = await client('true');
  await auth.signOut();
  assert.deepEqual(paths(calls), [csrfPath, '/v1/backoffice/auth/logout']);
  assert.equal(calls[1].headers['X-CSRF-Token'], 'recovered');
});

test('concurrent writes share a pending recovery', async (t) => {
  let respond;
  const calls = mockFetch(t, [new Promise((resolve) => { respond = resolve; })]);
  const { httpClient } = await client('true');
  const writes = [httpClient.post(resourcePath), httpClient.delete(resourcePath)];
  assert.deepEqual(paths(calls), [csrfPath]);
  respond(recovered);
  await Promise.all(writes);
  assert.deepEqual(paths(calls), [csrfPath, resourcePath, resourcePath]);
  assert.ok(calls.slice(1).every((call) => call.headers['X-CSRF-Token'] === 'recovered'));
});

test('a pending recovery cannot populate a replaced session', async (t) => {
  let respond;
  const calls = mockFetch(t, [
    new Promise((resolve) => { respond = resolve; }),
    { status: 200, body: '{"csrf_token":"new-session"}' },
  ]);
  const { auth, httpClient } = await client('true');
  const oldWrite = httpClient.post(resourcePath);
  const rejected = assert.rejects(oldWrite, /Session changed/);
  await auth.exchangeCode(login);
  respond(recovered);
  await rejected;
  await httpClient.post(resourcePath);
  assert.deepEqual(paths(calls), [csrfPath, '/v1/backoffice/auth/callback', resourcePath]);
  assert.equal(calls[2].headers['X-CSRF-Token'], 'new-session');
});

test('a pending callback cannot restore a token after logout', async (t) => {
  let respond;
  const calls = mockFetch(t, [
    new Promise((resolve) => { respond = resolve; }), recovered, { status: 204 }, recovered,
  ]);
  const { auth, httpClient } = await client('true');
  const callback = auth.exchangeCode(login);
  const rejected = assert.rejects(callback, /Session changed/);
  await Promise.resolve();
  await auth.signOut();
  respond({ status: 200, body: '{"csrf_token":"stale"}' });
  await rejected;
  await httpClient.post(resourcePath);
  assert.deepEqual(paths(calls), [
    '/v1/backoffice/auth/callback', csrfPath, '/v1/backoffice/auth/logout', csrfPath, resourcePath,
  ]);
  assert.equal(calls[4].headers['X-CSRF-Token'], 'recovered');
});

test('CSRF 401 expires the session once without sending refresh or protected requests', async (t) => {
  const calls = mockFetch(t, [{ status: 401 }, { status: 401 }]);
  const { auth, httpClient } = await client('true');
  const users = [];
  const unsubscribe = auth.onAuthStateChange((user) => users.push(user));
  const read = auth.getCurrentUser();
  await Promise.resolve();
  const results = await Promise.allSettled([read, httpClient.post(resourcePath)]);
  assert.deepEqual(results[0], { status: 'fulfilled', value: null });
  assert.equal(results[1].status, 'rejected');
  assert.match(results[1].reason.message, /401/);
  assert.deepEqual(users, [null]);
  assert.deepEqual(paths(calls), ['/v1/backoffice/users/me', csrfPath]);
  unsubscribe();
});

test('CSRF 401 during automatic refresh preserves the original read error', async (t) => {
  const calls = mockFetch(t, [{ status: 401, body: '{"message":"read unauthorized"}' }, { status: 401 }]);
  const { auth, httpClient } = await client('true');
  const users = [];
  const unsubscribe = auth.onAuthStateChange((user) => users.push(user));
  await assert.rejects(httpClient.get(resourcePath), /read unauthorized/);
  assert.deepEqual(users, [null]);
  assert.deepEqual(paths(calls), [resourcePath, csrfPath]);
  unsubscribe();
});
