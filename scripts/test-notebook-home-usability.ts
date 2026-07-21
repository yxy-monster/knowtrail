import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

const home = read('src/components/home/NotebookHome.tsx');
const cards = read('src/components/home/NotebookCards.tsx');

assert.match(home, /projectNotebookHome/, 'Notebook filters, sorting and view controls must drive the rendered projection');
assert.match(home, /notebook-home-filter-\$\{value\}/, 'Notebook range buttons need stable test targets');
assert.match(home, /\['mine', '我的文献本'\]/, 'Personal notebooks need a real filter');
assert.match(home, /\['featured', '精选模板'\]/, 'Featured notebooks need a real filter');
assert.match(home, /notebook-home-sort/, 'Notebook sorting needs a real select control');
assert.match(home, /notebook-home-view-grid/, 'Notebook grid view needs a real control');
assert.match(home, /notebook-home-view-list/, 'Notebook list view needs a real control');
assert.match(home, /data-testid="notebook-home-search"/, 'Notebook search must remain a real control');
assert.match(home, /没有匹配的文献本/, 'Search needs an explicit empty result state');
assert.match(home, /清除搜索/, 'Search empty state needs a recovery action');
assert.match(home, /focus-visible:ring-/, 'Home commands need visible keyboard focus');

assert.match(cards, /grid-cols-2[\s\S]*sm:grid-cols-4/, 'Featured notebooks must fit one row on normal desktop widths');
assert.match(cards, /min-h-\[140px\]/, 'Featured cards must use a compact stable height');
assert.match(cards, /min-h-\[184px\]/, 'Notebook cards must avoid the previous oversized layout');
assert.match(cards, /data-testid={`notebook-home-actions-\$\{notebook\.id\}`}/, 'Notebook cards need a real lifecycle menu');
assert.match(cards, /重命名/, 'Notebook cards must expose rename');
assert.match(cards, /归档/, 'Notebook cards must expose archive');
assert.match(cards, /ArrowUpRight/, 'Open action must remain visible without relying on hover');
assert.match(cards, /focus-visible:ring-/, 'Cards need visible keyboard focus');
assert.match(cards, /pointer-events-none[\s\S]*item\.title/, 'Featured card content must not intercept the full-card click target');

assert.match(home, /已归档/, 'Archived notebooks need a visible recovery section');
assert.match(home, /恢复/, 'Archived notebooks need a restore action');
assert.match(home, /重命名文献本/, 'Rename needs a clear dialog instead of a prompt');

console.log('notebook home usability contract passed');
