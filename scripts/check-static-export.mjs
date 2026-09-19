import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist/client';
const html = readFileSync(join(root, 'index.html'), 'utf8');
const files = readdirSync(root, { recursive: true });

for (const asset of ['avatar.jpeg', 'Ho-Quoc-Bao-Resume.pdf', 'favicon.svg']) {
  assert.ok(existsSync(join(root, asset)), `Missing ${asset}`);
  assert.ok(
    html.includes(`/${asset}`),
    `Root page does not reference ${asset}`,
  );
}

const staticAssets = [
  ...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g),
];
assert.ok(staticAssets.some(([, path]) => path.endsWith('.css')));
assert.ok(staticAssets.some(([, path]) => path.endsWith('.js')));
for (const [, path] of staticAssets) {
  assert.ok(existsSync(join(root, path.slice(1))), `Missing ${path}`);
}

const trackers = [
  ...html.matchAll(/<script\b[^>]*data-goatcounter="([^"]+)"[^>]*>/g),
];
assert.equal(trackers.length, 1, 'Expected one GoatCounter tracker');
assert.equal(trackers[0][1], 'https://portfolio-qbael.goatcounter.com/count');
assert.match(trackers[0][0], /src="https:\/\/gc\.zgo\.at\/count\.js"/);
assert.match(trackers[0][0], /\basync(?:="")?/);
const settings = trackers[0][0].match(
  /data-goatcounter-settings="([^"]+)"/,
)?.[1];
assert.deepEqual(JSON.parse(settings?.replaceAll('&quot;', '"') ?? 'null'), {
  path: '/',
  no_events: true,
});

assert.ok(!html.includes('/_next/image?'), 'Image optimizer is not static');
assert.ok(!files.some((path) => path.startsWith('api/visits')));
assert.ok(
  files
    .filter((path) => path.endsWith('.js'))
    .some((path) =>
      readFileSync(join(root, path), 'utf8').includes('/counter/TOTAL.json'),
    ),
  'Public total counter is missing from the client bundle',
);
assert.ok(
  !files
    .filter((path) => path.endsWith('.js'))
    .some((path) =>
      readFileSync(join(root, path), 'utf8').includes('/api/visits'),
    ),
);

console.log('Static export, root assets, and GoatCounter tracking verified.');
