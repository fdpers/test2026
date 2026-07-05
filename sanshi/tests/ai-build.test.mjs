import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const promptUrl = new URL('../ai/system-prompt.md', import.meta.url);
const releaseUrl = new URL('../../release.json', import.meta.url);
const sourceUrl = new URL('../academy.html', import.meta.url);
const outputUrl = new URL('../../dist/academy.html', import.meta.url);
const rootUrl = new URL('../../', import.meta.url);

test('canonical v1 prompt preserves its epistemic boundaries', async () => {
  const [prompt, releaseSource] = await Promise.all([
    readFile(promptUrl, 'utf8'),
    readFile(releaseUrl, 'utf8'),
  ]);
  const release = JSON.parse(releaseSource);

  assert.match(prompt, /^# 三式研习院 · 站内 AI 助教系统提示词（canonical v1）/);
  for (const section of ['【可验证事实】', '【符号解读】', '【不确定】', '【可行一步】']) {
    assert.ok(prompt.includes(section), `missing four-part section: ${section}`);
  }
  for (const step of ['定盘', '立骨', '观动', '会通', '验证']) {
    assert.ok(prompt.includes(step), `missing five-step method item: ${step}`);
  }
  assert.match(prompt, /奇门只回答「此刻、此事、此方向」/);
  assert.match(prompt, /绝不使用「注定」「必然」「一定会」等决定论措辞/);

  const digest = createHash('sha256').update(Buffer.from(prompt, 'utf8')).digest('hex');
  assert.equal(release.promptVersion, 'canonical-v1');
  assert.equal(release.promptSha256, digest);
});

test('offline academy source remains free of AI network paths', async () => {
  const source = await readFile(sourceUrl, 'utf8');

  assert.doesNotMatch(source, /\/api\/(?:health|chat)/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test('AI academy build is deterministic and carries release metadata', async () => {
  await rm(outputUrl, { force: true });
  const env = { ...process.env, BUILD_COMMIT: 'test-revision' };
  const runBuild = () => spawnSync(
    process.execPath,
    ['scripts/build-academy.mjs'],
    { cwd: rootUrl, env, encoding: 'utf8' },
  );

  const firstRun = runBuild();
  assert.equal(firstRun.status, 0, firstRun.stderr || firstRun.stdout);
  const first = await readFile(outputUrl);

  const secondRun = runBuild();
  assert.equal(secondRun.status, 0, secondRun.stderr || secondRun.stdout);
  const second = await readFile(outputUrl);

  assert.deepEqual(second, first);
  const artifact = first.toString('utf8');
  assert.match(artifact, /data-ai-study-panel/);
  assert.match(artifact, /\/api\/health/);
  assert.match(artifact, /\/api\/chat/);
  assert.match(artifact, /"version":"1\.1\.0"/);
  assert.match(artifact, /"sourceRevision":"test-revision"/);
});
