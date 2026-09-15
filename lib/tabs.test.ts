import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import {
  closeTab,
  openTab,
  resolveDrawerFocus,
  resolveFile,
  shouldHandleNavigation,
  shouldFocusHeading,
  tryNavigation,
} from './tabs.ts';
import {
  handleVisitRequest,
  hasCountedView,
  INCREMENT_VIEW_COUNT_SQL,
  READ_VIEW_COUNT_SQL,
  VIEW_COOKIE,
} from './visits.ts';

void test('opens once, activates existing tabs, and keeps their order', () => {
  assert.deepEqual(openTab({ tabs: ['about'], active: 'about' }, 'projects'), {
    tabs: ['about', 'projects'],
    active: 'projects',
  });
  assert.deepEqual(
    openTab({ tabs: ['about', 'projects'], active: 'projects' }, 'about'),
    {
      tabs: ['about', 'projects'],
      active: 'about',
    },
  );
});

void test('closing activates the nearest tab and always keeps About readable', () => {
  assert.deepEqual(
    closeTab(
      { tabs: ['about', 'projects', 'skills'], active: 'projects' },
      'projects',
      'about',
    ),
    { tabs: ['about', 'skills'], active: 'skills', focus: 'skills' },
  );
  assert.deepEqual(
    closeTab({ tabs: ['about'], active: 'about' }, 'about', 'about'),
    { tabs: ['about'], active: 'about', focus: 'about' },
  );
});

void test('only unmodified primary clicks use client navigation', () => {
  const primary = {
    button: 0,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  };
  assert.equal(shouldHandleNavigation(primary), true);
  assert.equal(shouldHandleNavigation({ ...primary, button: 1 }), false);
  assert.equal(shouldHandleNavigation({ ...primary, ctrlKey: true }), false);
  assert.equal(shouldHandleNavigation({ ...primary, metaKey: true }), false);
  assert.equal(shouldHandleNavigation({ ...primary, shiftKey: true }), false);
  assert.equal(shouldHandleNavigation({ ...primary, altKey: true }), false);
});

void test('deep links and drawer focus follow the navigation contract', () => {
  assert.equal(resolveFile('skills', ['about', 'skills'], 'about'), 'skills');
  assert.equal(resolveFile('unknown', ['about', 'skills'], 'about'), 'about');
  assert.equal(resolveFile('', ['about', 'skills'], 'about'), 'about');
  const heading = { id: 'heading-skills' };
  const trigger = { id: 'files-trigger' };
  assert.equal(
    resolveDrawerFocus('skills', () => heading, trigger),
    heading,
  );
  assert.equal(
    resolveDrawerFocus('skills', () => null, trigger),
    trigger,
  );
  assert.equal(
    resolveDrawerFocus(null, () => heading, trigger),
    trigger,
  );
  assert.equal(shouldFocusHeading('drawer'), false);
  assert.equal(shouldFocusHeading('tab'), false);
  assert.equal(shouldFocusHeading('initial'), false);
});

void test('failed history updates leave navigation available to abort', () => {
  assert.equal(
    tryNavigation(() => undefined),
    true,
  );
  assert.equal(
    tryNavigation(() => {
      throw new Error('History unavailable');
    }),
    false,
  );
});

void test('the production visit handler counts once and rejects cross-origin requests', async () => {
  const database = new DatabaseSync(':memory:');
  database.exec(
    readFileSync(
      new URL('../drizzle/0000_open_zarek.sql', import.meta.url),
      'utf8',
    ),
  );
  const store = () => ({
    read: async () => database.prepare(READ_VIEW_COUNT_SQL).get(1),
    increment: async () => database.prepare(INCREMENT_VIEW_COUNT_SQL).get(),
  });
  const url = 'https://portfolio.test/api/visits';
  const first = await handleVisitRequest(
    new Request(url, {
      method: 'POST',
      headers: { origin: 'https://portfolio.test' },
    }),
    store,
  );
  const repeat = await handleVisitRequest(
    new Request(url, {
      method: 'POST',
      headers: {
        cookie: `${VIEW_COOKIE}=1`,
        origin: 'https://portfolio.test',
      },
    }),
    store,
  );
  const crossOrigin = await handleVisitRequest(
    new Request(url, {
      method: 'POST',
      headers: { origin: 'https://example.com' },
    }),
    store,
  );

  assert.deepEqual(await first.json(), { total: 1 });
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('cache-control'), 'no-store');
  assert.match(
    first.headers.get('set-cookie') ?? '',
    /^portfolio_view_counted=1; Path=\/; HttpOnly; SameSite=Lax; Secure$/,
  );
  assert.deepEqual(await repeat.json(), { total: 1 });
  assert.equal(repeat.status, 200);
  assert.equal(repeat.headers.get('set-cookie'), null);
  assert.equal(crossOrigin.status, 403);
  assert.equal(crossOrigin.headers.get('set-cookie'), null);
  assert.equal(
    (database.prepare(READ_VIEW_COUNT_SQL).get(1) as { total: number }).total,
    1,
  );

  database.exec('DELETE FROM page_view_counter');
  const missing = await handleVisitRequest(
    new Request(url, {
      method: 'POST',
      headers: { cookie: `${VIEW_COOKIE}=1` },
    }),
    store,
  );
  assert.equal(missing.status, 503);

  database.exec(
    'INSERT INTO page_view_counter (id, total) VALUES (1, 9007199254740992)',
  );
  const unsafe = await handleVisitRequest(
    new Request(url, {
      method: 'POST',
      headers: { cookie: `${VIEW_COOKIE}=1` },
    }),
    store,
  );
  assert.equal(unsafe.status, 503);

  assert.equal(hasCountedView(null), false);
  assert.equal(hasCountedView('theme=dark; portfolio_view_counted=1'), true);
  assert.equal(hasCountedView('portfolio_view_counted=10'), false);
  database.close();
});
