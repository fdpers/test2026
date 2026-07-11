import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const siteFiles = ['bazi.html', 'ziwei.html', 'qimen.html', 'huitong.html'];
const readSite = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('four chart sites expose readings and dialogue without browser provider keys', async () => {
  for (const name of siteFiles) {
    const source = await readSite(name);
    assert.match(source, /深度对话/, `${name} should expose the dialogue surface`);
    assert.match(source, /\/api\/chat/, `${name} should call the same-origin chat gateway`);
    assert.match(source, /\/api\/health/, `${name} should probe the same-origin gateway`);
    assert.match(source, /密钥留在服务器|provider 密钥只留在服务器/, `${name} should explain server-held provider keys`);

    assert.doesNotMatch(source, /(?:^|[-_])ai-key\b/i, `${name} must not store AI keys in browser storage`);
    assert.doesNotMatch(source, /huitong-ai-key/i, `${name} must not preserve the old Huitong key name`);
    assert.doesNotMatch(source, /chat\/completions/i, `${name} must not call provider APIs directly`);
    assert.doesNotMatch(source, /Base URL|API Key（|只存本地|浏览器直连/, `${name} must not invite browser-key direct mode`);
  }
});

test('standalone chart sites keep per-system reading sections', async () => {
  const bazi = await readSite('bazi.html');
  const ziwei = await readSite('ziwei.html');
  const qimen = await readSite('qimen.html');

  assert.match(bazi, /本盘解读 · 命理假设/);
  assert.match(bazi, /日主|喜忌|大运/);
  assert.match(ziwei, /本盘解读 · 命理假设/);
  assert.match(ziwei, /命宫|四化|大限/);
  assert.match(qimen, /本局解读|本局概况/);
  assert.match(qimen, /此刻|此事|方向/);
});
