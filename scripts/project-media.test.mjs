import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readProjectMedia } from './project-media.mjs';

test('project folders discover, order and encode image/video files', () => {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-media-'));
  try {
    assert.deepEqual(readProjectMedia(root), {});
    const project = join(root, 'projects', 'sample');
    mkdirSync(join(project, 'screens'), { recursive: true });
    mkdirSync(join(root, 'projects', 'empty'));
    for (const file of ['10-demo.mp4', '02-dashboard.PNG', 'cover.webp', 'README.md', 'screens/03-api flow.webm']) writeFileSync(join(project, file), 'fixture');
    const media = readProjectMedia(root);
    assert.deepEqual(media.empty, []);
    assert.equal(media.sample.length, 4);
    assert.equal(media.sample[0].src, '/projects/sample/cover.webp');
    assert.equal(media.sample[1].label, 'dashboard');
    assert.equal(media.sample[2].type, 'video');
    assert.equal(media.sample[3].src, '/projects/sample/screens/03-api%20flow.webm');
    assert.equal(media.sample[3].label, 'api flow');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
