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
    const response = responses.shift();
    return new Response(response?.body ?? null, { status: response?.status ?? 204 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  return calls;
}

const login = { idpReferenceName: 'microsoft', code: 'code', state: 'state' };

test('disabled by default and when false, even if callback supplies a token', async (t) => {
  for (const enabled of [undefined, 'false']) {
    const calls = mockFetch(t, [{ status: 200, body: '{"csrf_token":"secret"}' }]);
    const { auth, httpClient } = await client(enabled);
    await auth.exchangeCode(login);
    await httpClient.post('/v1/backoffice/clients', { name: 'Client' });
    await auth.signOut();
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
      { status: 200, body: '{"csrf_token":"secret"}' }, { status },
    ]);
    const { auth, httpClient } = await client('true');
    await auth.exchangeCode(login);
    if (status === 500) await assert.rejects(auth.signOut());
    else await auth.signOut();
    await httpClient.post('/v1/backoffice/resources', {});
    assert.equal(calls[1].headers['X-CSRF-Token'], 'secret');
    assert.equal(calls[2].headers['X-CSRF-Token'], undefined);
  }
});

test('empty, absent and invalid callback tokens clear the previous token', async (t) => {
  for (const response of [null, '{}', '{"csrf_token":null}', '{"csrf_token":""}', '{"csrf_token":123}']) {
    const calls = mockFetch(t, [{ status: response === null ? 204 : 200, body: response }]);
    const { auth, httpClient, setCsrfToken } = await client('true');
    setCsrfToken('previous');
    await auth.exchangeCode(login);
    await httpClient.post('/v1/backoffice/resources', {});
    assert.ok(calls.every((call) => call.headers['X-CSRF-Token'] === undefined));
  }
});

test('fresh page module has no token; failed callback also removes stale token', async (t) => {
  const calls = mockFetch(t, [{ status: 500 }]);
  const first = await client('true');
  first.setCsrfToken('previous');
  await assert.rejects(first.auth.exchangeCode(login));
  await first.httpClient.post('/v1/backoffice/resources', {});
  first.setCsrfToken('previous');
  const reloaded = await client('true');
  await reloaded.httpClient.post('/v1/backoffice/resources', {});
  assert.ok(calls.every((call) => call.headers['X-CSRF-Token'] === undefined));
});
