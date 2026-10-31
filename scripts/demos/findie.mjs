// Run: node site/scripts/demos/findie.mjs [--check], from the Portfolio directory.
// Uses the real Findie frontend with read-only fictional API responses; no production services.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { cp, mkdir, readFile, symlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import seed from '../../public/projects/demo-assets/findie-data.json' with { type: 'json' };

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(scriptDir, '../../../..');
const source = resolve(workspace, 'Hackathon/apps/web');
const runtime = resolve(workspace, 'Portfolio/tmp/project-demos/findie');
const assets = resolve(scriptDir, '../../public/projects/demo-assets');
export const { users, hub, items, claim, intake } = seed;
const photos = new Map(Object.entries(seed.photos));
const page = (values, url) => ({ items: values, page: 1, pageSize: Number(url.searchParams.get('pageSize')) || 12, hasMore: false });

// shortcut: screen-specific personas serve a capture fixture; use real OAuth to verify authorization.
export function fixtureResponse(method, path, referer = '') {
  const url = new URL(path, 'http://127.0.0.1:5182');
  if (method !== 'GET') return { status: 405, value: { error: 'Read-only portfolio fixture. No actions are persisted.' } };
  const persona = referer.includes('/intakes/') ? users.staff : referer.includes('/claims/') ? users.holder : users.claimant;
  const visible = (item) => ({ ...item, canClaim: item.custody.kind === 'person' && persona.id !== users.holder.id });
  if (photos.has(url.pathname)) return { status: 200, asset: photos.get(url.pathname) };
  const routes = {
    '/api/users/me': persona,
    '/api/reception-points': [hub],
    [`/api/reception-points/${hub.id}`]: hub,
    [`/api/claims/${claim.id}`]: claim,
    '/api/claims': page([claim], url),
    [`/api/intake-requests/${intake.id}`]: intake,
    '/api/intake-requests': page([intake], url),
  };
  if (Object.hasOwn(routes, url.pathname)) return { status: 200, value: routes[url.pathname] };
  const item = items.find((candidate) => url.pathname === `/api/items/${candidate.id}`);
  if (item) return { status: 200, value: visible(item) };
  if (url.pathname === '/api/items') {
    const q = (url.searchParams.get('q') || '').toLocaleLowerCase('vi');
    const area = (url.searchParams.get('area') || '').toLocaleLowerCase('vi');
    const from = url.searchParams.get('from'), until = url.searchParams.get('until');
    return { status: 200, value: page(items.filter((item) =>
      `${item.title} ${item.publicDescription}`.toLocaleLowerCase('vi').includes(q)
      && item.foundArea.toLocaleLowerCase('vi').includes(area)
      && (!from || item.foundOn >= from) && (!until || item.foundOn <= until)).map(visible), url) };
  }
  return { status: 404, value: { error: 'Endpoint is outside the portfolio capture fixture.' } };
}

async function selfCheck() {
  assert.equal(seed.demo, true);
  assert.equal(new Set(items.map(({ id }) => id)).size, 6);
  assert(items.every((item) => /^[\da-f-]{36}$/.test(item.id) && item.images.length === 1));
  assert.equal(fixtureResponse('GET', '/api/items?area=Khu%C3%B4n%20vi%C3%AAn%20Demo').value.items.length, 6);
  assert.equal(fixtureResponse('GET', '/api/items?q=bal%C3%B4').value.items[0].id, intake.itemId);
  assert.equal(fixtureResponse('GET', '/api/items?from=2026-10-29').value.items.length, 2);
  assert.equal(fixtureResponse('GET', `/api/items/${claim.itemId}`, '/claims/demo').value.canClaim, false);
  assert.equal(fixtureResponse('GET', '/api/users/me', '/intakes/demo').value.id, users.staff.id);
  assert.equal(fixtureResponse('GET', '/api/missing').status, 404);
  assert.equal(fixtureResponse('POST', `/api/claims/${claim.id}/decision`).status, 405);
  assert.equal(items.find(({ id }) => id === intake.itemId).custody.kind, 'person');
  assert.equal(intake.targetPointId, hub.id);
  for (const [path, filename] of photos) {
    assert.match(filename, /^findie-[a-z]+\.svg$/);
    assert.match(path, /^\/api\/items\/[\da-f-]+\/images\/[\da-f-]+\/content$/);
    assert.match(await readFile(resolve(assets, filename), 'utf8'), /<svg/);
  }
  console.log('Findie fixture checks passed: six items, filters, personas, custody, images and read-only API.');
}

async function run() {
  await selfCheck();
  if (process.argv.includes('--check')) return;
  await mkdir(runtime, { recursive: true });
  for (const name of ['src', 'index.html', 'package.json']) await cp(resolve(source, name), resolve(runtime, name), { recursive: true });
  await symlink(resolve(source, 'node_modules'), resolve(runtime, 'node_modules'), 'dir').catch((error) => { if (error.code !== 'EEXIST') throw error; });
  const require = createRequire(resolve(source, 'package.json'));
  const [{ createServer: createViteServer }, { default: react }, { default: tailwindcss }] = await Promise.all(
    ['vite', '@vitejs/plugin-react', '@tailwindcss/vite'].map((name) => import(pathToFileURL(require.resolve(name)).href)));
  const api = createServer(async (request, response) => {
    try {
      const result = fixtureResponse(request.method, request.url, request.headers.referer);
      const body = result.asset ? await readFile(resolve(assets, result.asset)) : JSON.stringify(result.value);
      response.writeHead(result.status, { 'Content-Type': result.asset ? 'image/svg+xml' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(body);
    } catch (error) {
      console.error(error.message);
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end('{"error":"Fixture failed; no production services were called."}');
    }
  });
  await new Promise((accept, reject) => { api.once('error', reject); api.listen(5182, '127.0.0.1', accept); });
  const web = await createViteServer({
    configFile: false, root: runtime, cacheDir: resolve(runtime, '.vite'), plugins: [react(), tailwindcss()],
    server: { host: '127.0.0.1', port: 5181, strictPort: true, proxy: { '/api': 'http://127.0.0.1:5182' } },
  });
  try { await web.listen(); } catch (error) { api.close(); throw error; }
  console.log(JSON.stringify({
    note: 'Real Findie React components. Fictional sample data and SVG specimens. Read-only API; no real auth, search inference or database.',
    home: 'http://127.0.0.1:5181/',
    search: 'http://127.0.0.1:5181/search?mode=basic&area=Khu%C3%B4n+vi%C3%AAn+Demo',
    item: `http://127.0.0.1:5181/items/${items[0].id}`,
    claim: `http://127.0.0.1:5181/claims/${claim.id}`,
    intake: `http://127.0.0.1:5181/intakes/${intake.id}`,
  }, null, 2));
  const stop = async () => { await web.close(); api.close(() => process.exit(0)); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run().catch((error) => { console.error(error); process.exit(1); });
