import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

function sourceRevision() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.BUILD_COMMIT) return process.env.BUILD_COMMIT;
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}

function insertBefore(source, marker, content, label) {
  const index = source.lastIndexOf(marker);
  if (index < 0) throw new Error(`Cannot find ${label} injection marker`);
  return `${source.slice(0, index)}${content}${source.slice(index)}`;
}

function insertIntoPage(source, content) {
  const scriptIndex = source.indexOf('<script>');
  const pageEndIndex = source.lastIndexOf('</div>', scriptIndex);
  if (scriptIndex < 0 || pageEndIndex < 0) throw new Error('Cannot find page injection marker');
  return `${source.slice(0, pageEndIndex)}${content}${source.slice(pageEndIndex)}`;
}

const [source, panel, styles, client, releaseSource] = await Promise.all([
  read('sanshi/academy.html'),
  read('sanshi/ai/panel.html'),
  read('sanshi/ai/client.css'),
  read('sanshi/ai/client.js'),
  read('release.json'),
]);
const release = { ...JSON.parse(releaseSource), sourceRevision: sourceRevision() };

let artifact = insertBefore(source, '</style>', `\n/* AI study workspace */\n${styles}\n`, 'style');
artifact = insertIntoPage(artifact, `\n${panel}\n`);
artifact += `\n<script>\nwindow.__SANSHI_RELEASE__=${JSON.stringify(release)};\n${client}\n</script>\n`;

await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/academy.html'), artifact, 'utf8');
