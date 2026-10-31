import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { projects } from './projects.ts';

void test('featured projects lead the list and every case study has local images', () => {
  assert.deepEqual(
    projects.slice(0, 3).map(({ name }) => name),
    ['Findie', 'Medify', 'Instory'],
  );
  assert.equal(new Set(projects.map(({ id }) => id)).size, projects.length);

  for (const project of projects) {
    for (const text of [
      project.problem,
      project.capabilities,
      project.architecture,
    ]) {
      assert.ok(text.trim(), `${project.name} is missing case-study content`);
    }
    assert.ok(
      project.built.length && project.tech.length && project.screenshots.length,
    );
    assert.equal(new URL(project.repo).hostname, 'github.com');
    for (const screenshot of project.screenshots) {
      assert.ok(screenshot.label.trim());
      assert.ok(screenshot.src.startsWith('/projects/'));
      assert.ok(
        existsSync(new URL(`../public${screenshot.src}`, import.meta.url)),
        `Missing ${project.name} screenshot: ${screenshot.src}`,
      );
    }
  }
});
