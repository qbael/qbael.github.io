import assert from 'node:assert/strict';
import test from 'node:test';

import { fileExtension, fileKind } from './files.ts';
import {
  closeTab,
  openTab,
  resolveDrawerFocus,
  resolveFile,
  shouldHandleNavigation,
  shouldFocusHeading,
  tryNavigation,
} from './tabs.ts';
import { fetchVisitCount, parseVisitCount } from './visits.ts';

void test('file kinds follow the last extension, including nested paths', () => {
  assert.equal(fileExtension('projects / Medify.java'), 'java');
  assert.equal(fileKind('about.tsx'), 'tsx');
  assert.equal(fileKind('education.json'), 'json');
  assert.equal(fileKind('achievements.yaml'), 'yaml');
  assert.equal(fileKind('experience.ts'), 'ts');
  assert.equal(fileKind('skills.toml'), 'toml');
  assert.equal(fileKind('visitors.log'), 'log');
  assert.equal(fileKind('Instory.cs'), 'csharp');
  assert.equal(fileKind('smartdoc.py'), 'python');
  assert.equal(fileKind('phone-store.php'), 'php');
  assert.equal(fileKind('school-bus.ts'), 'ts');
  assert.equal(fileKind('sport-store.sql'), 'sql');
  assert.equal(fileKind('notes'), 'unknown');
});

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

void test('public visit counts accept zero and grouped totals only', () => {
  assert.equal(parseVisitCount({ count: '0' }), 0);
  assert.equal(parseVisitCount({ count: '1,234' }), 1234);
  assert.equal(parseVisitCount({ count: '1234' }), 1234);
  for (const count of [
    '-1',
    '1.5',
    '01',
    '12,34',
    '1,234,56',
    '9,007,199,254,740,992',
    'NaN',
  ]) {
    assert.throws(() => parseVisitCount({ count }));
  }
  for (const value of [null, {}, { count: 1 }, { count: '' }]) {
    assert.throws(() => parseVisitCount(value));
  }
});

void test('public visit fetch handles success and unavailable responses', async () => {
  assert.equal(
    await fetchVisitCount(
      async () => new Response(JSON.stringify({ count: '1,234' })),
    ),
    1234,
  );
  await assert.rejects(
    fetchVisitCount(async () => new Response(null, { status: 503 })),
    /Counter unavailable/,
  );
  await assert.rejects(
    fetchVisitCount(async () => {
      throw new Error('Network unavailable');
    }),
    /Network unavailable/,
  );
  await assert.rejects(
    fetchVisitCount(async () => new Response(JSON.stringify({ count: '-1' }))),
    /Invalid visit count/,
  );
});
