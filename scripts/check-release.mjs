import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const expected = {
  version: '1.2.0',
  operationId: 'OP-20260706-002',
  baseline: '7996142680f9d593d36c1a1433e31b221d2a56e2',
};

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const version = read('VERSION').trim();
const release = JSON.parse(read('release.json'));
const worklog = read('WORKLOG.md');
const changelog = read('sanshi/CHANGELOG.md');

assert(/^\d+\.\d+\.\d+$/.test(version), `VERSION is not semantic: ${version}`);
assert(version === expected.version, `Expected VERSION ${expected.version}, got ${version}`);
assert(release.version === version, 'release.json version does not match VERSION');
assert(release.operationId === expected.operationId, 'release.json operationId mismatch');
assert(release.baseline === expected.baseline, 'release.json baseline mismatch');
assert(release.promptVersion === 'canonical-v1', 'release.json promptVersion mismatch');
assert(!JSON.stringify(release).match(/TODO|TBD|PLACEHOLDER|<commit>/i), 'release.json contains unresolved metadata');

const activeRows = worklog
  .split(/\r?\n/)
  .filter((line) => line.startsWith(`| ${expected.operationId} |`));
assert(activeRows.length === 1, `Expected one active WORKLOG row, found ${activeRows.length}`);
assert(activeRows[0].includes(`| ${version} |`), 'WORKLOG version mismatch');
assert(activeRows[0].includes('| Codex |'), 'WORKLOG owner mismatch');
assert(activeRows[0].includes('| codex/four-site-dialog-v1.2 |'), 'WORKLOG branch mismatch');

assert(changelog.includes(expected.operationId), 'CHANGELOG is missing the operation ID');
assert(changelog.includes(version), 'CHANGELOG is missing the target version');

console.log(`release ${version} / ${expected.operationId}`);
