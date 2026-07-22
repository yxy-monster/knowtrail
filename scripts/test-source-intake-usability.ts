import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

const guide = read('src/components/library/SourceGuideModal.tsx');
const library = read('src/components/library/LibraryPanel.tsx');
const page = read('src/app/page.tsx');

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
assert.match(
  library,
  /data-testid="library-source-detail-panel"[\s\S]{0,240}className="flex h-full w-full flex-col overflow-hidden/,
  'Source reading must replace the library panel in place instead of opening a floating modal',
);
assert.match(library, /来源阅读/, 'The in-place source reader needs a clear panel title');
assert.match(
  library,
  /className="pointer-events-none flex-1 min-w-0"/,
  'Source-card text must not block the full-card open target',
);
assert.match(
  library,
  /data-testid="library-citation-focus"[\s\S]{0,180}pointer-events-auto/,
  'Citation controls must remain independently interactive inside a full-card open target',
);
assert.match(
  page,
  /<AcademicPresenterContent[\s\S]{0,500}accountAuthRequired=\{accountAuthRequired\}/,
  'Embedded paper-host guests must use the resolved auth boundary so persisted sources restore after refresh',
);

console.log('source intake usability contract passed');
