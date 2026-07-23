import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

const pageSource = read('src/app/page.tsx');
const studioPanelSource = read('src/components/studio/StudioPanel.tsx');
const layoutSource = read('src/components/layout/ThreeColumnLayout.tsx');

assert.match(
  pageSource,
  /centerPanel=\{\([\s\S]*<WorkbenchCenterPanel[\s\S]*activeStudioTab=\{activeStudioTab\}/,
  'The selected Studio tool should render through the center workbench panel.',
);
assert.match(
  pageSource,
  /rightPanel=\{\([\s\S]*<StudioPanel[\s\S]*activeTab=\{activeStudioTab\}[\s\S]*onSelect=\{openStudioWorkspace\}/,
  'The right panel should remain the Studio tool directory and only select tools.',
);
assert.match(
  studioPanelSource,
  /export function StudioWorkspacePanel/,
  'Studio should expose a dedicated workspace component for the center panel.',
);
assert.match(
  studioPanelSource,
  /data-testid="studio-workspace-center"/,
  'The center tool workspace should expose a stable rendered contract.',
);
assert.match(
  studioPanelSource,
  /data-testid="studio-back-to-chat"[\s\S]*返回文献问答/,
  'The center tool workspace should provide a clear return to document chat.',
);
assert.doesNotMatch(
  studioPanelSource.slice(
    studioPanelSource.indexOf('export function StudioPanel'),
    studioPanelSource.indexOf('export function StudioWorkspacePanel'),
  ),
  /<TextPolishingPanel|<PaperSearchPanel|<DeepResearchPanel/,
  'The right tool directory must not render tool input or generation panels.',
);
assert.match(
  layoutSource,
  /centerFocusKey\?: string \| null/,
  'The three-column layout should accept a mobile center-focus request.',
);
assert.match(
  layoutSource,
  /if \(centerFocusKey\) setMobilePanel\('center'\)/,
  'Selecting a tool on mobile should move the user from the right directory to the center workspace.',
);

console.log(JSON.stringify({
  ok: true,
  checked: [
    'right panel remains the tool directory',
    'selected tool input and results render in the center panel',
    'center workspace returns to document chat',
    'mobile tool selection focuses the center panel',
  ],
}, null, 2));
