import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

const guide = read('src/components/library/SourceGuideModal.tsx');
const library = read('src/components/library/LibraryPanel.tsx');

assert.match(library, /data-testid="library-add-source"/, 'Library header needs one primary add-source action');
assert.match(library, />\s*添加来源\s*</, 'The primary source action must use the expected user language');
assert.match(library, /handleUrlAsSource/, 'Direct URL intake must use the persisted ingestion path');

for (const testId of [
  'source-guide-upload',
  'source-guide-url',
  'source-guide-paste-submit',
  'source-guide-discover',
]) {
  assert.match(guide, new RegExp(`data-testid="${testId}"`), `Unified intake is missing ${testId}`);
}
assert.match(library, /网页抓取失败/, 'URL intake needs recoverable Chinese failure feedback');
assert.match(library, /网址格式不正确/, 'URL intake needs recoverable format feedback');
assert.match(guide, /正在读取网页/, 'URL intake needs an immediate loading state');

console.log('source intake usability contract passed');
