import assert from 'node:assert/strict';
import {
  archiveNotebook,
  renameNotebook,
  restoreNotebook,
  visibleNotebooks,
} from '../src/lib/notebook-lifecycle';
import type { WorkspaceNotebook } from '../src/components/home/workspace-types';

const notebooks: WorkspaceNotebook[] = [
  { id: 'default', title: '未命名文献本', sourceCount: 0, updatedAt: '2026-07-21T00:00:00.000Z', accent: '' },
  { id: 'project', title: '星系研究', sourceCount: 3, updatedAt: '2026-07-21T01:00:00.000Z', accent: '' },
];

const renamed = renameNotebook(notebooks, 'project', '  星系潮汐结构  ', '2026-07-21T02:00:00.000Z');
assert.equal(renamed.find(item => item.id === 'project')?.title, '星系潮汐结构');
assert.equal(renamed.find(item => item.id === 'project')?.updatedAt, '2026-07-21T02:00:00.000Z');
assert.deepEqual(renameNotebook(notebooks, 'project', '   ', '2026-07-21T02:00:00.000Z'), notebooks);

const archived = archiveNotebook(renamed, 'project', '2026-07-21T03:00:00.000Z');
assert.equal(visibleNotebooks(archived).length, 1);
assert.equal(archived.find(item => item.id === 'project')?.archivedAt, '2026-07-21T03:00:00.000Z');
assert.deepEqual(archiveNotebook(visibleNotebooks(archived), 'default', '2026-07-21T04:00:00.000Z'), visibleNotebooks(archived));

const restored = restoreNotebook(archived, 'project', '2026-07-21T05:00:00.000Z');
assert.equal(visibleNotebooks(restored).length, 2);
assert.equal(restored.find(item => item.id === 'project')?.archivedAt, undefined);
assert.equal(restored.find(item => item.id === 'project')?.updatedAt, '2026-07-21T05:00:00.000Z');

console.log('notebook lifecycle contract passed');
