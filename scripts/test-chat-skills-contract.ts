import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

const chatSkillsPath = path.join(process.cwd(), 'src/lib/research-chat-skills.ts');
assert.ok(fs.existsSync(chatSkillsPath), 'Research chat should define a shared Skills contract');

const chatSkillsSource = fs.readFileSync(chatSkillsPath, 'utf8');
const editorSource = read('src/components/editor/EditorPanel.tsx');
const skillSelectorSource = read('src/components/editor/ResearchChatSkillSelector.tsx');
const chatRouteSource = read('src/app/api/ai/chat/route.ts');
const studioTaxonomySource = read('src/lib/studio-research-taxonomy.ts');

for (const skillId of ['literature-review', 'academic-writing', 'text-polishing', 'peer-review']) {
  assert.match(chatSkillsSource, new RegExp(`id: '${skillId}'`), `${skillId} should be available in the middle chat`);
}

assert.match(skillSelectorSource, /data-testid="chat-skill-trigger"/, 'The composer should expose a discoverable Skills trigger');
assert.match(skillSelectorSource, /data-testid="chat-skill-menu"/, 'The Skills menu should have a stable rendered contract');
assert.match(skillSelectorSource, /data-testid="chat-skill-chip"/, 'The selected Skill should remain visible beside the composer');
assert.match(editorSource, /clearChatSkill/, 'The selected Skill should be removable without clearing the draft');
assert.match(editorSource, /sendQuestion\(draft, \{ skill: selectedChatSkill \}\)/, 'Normal chat submissions should use the selected Skill');
assert.match(editorSource, /skill: options\.skill \|\| undefined/, 'Chat requests should send the selected Skill to the server');
assert.match(editorSource, /handleGenerateReport\(draft\)/, 'The literature review Skill should reuse the grounded report flow');
assert.match(chatRouteSource, /resolveResearchChatSkillInstruction\(skill\)/, 'The chat route should resolve server-owned Skill instructions');
assert.match(chatRouteSource, /skillInstruction/, 'The server should add the Skill instruction without exposing it as user text');
assert.match(
  studioTaxonomySource,
  /CHAT_SKILL_PRODUCT_IDS[\s\S]*filter\(product => !CHAT_SKILL_PRODUCT_IDS\.has\(product\.id\)\)/,
  'Chat-first tools should no longer be duplicated in the right product directory',
);

console.log(JSON.stringify({
  ok: true,
  checked: [
    'four chat Skills are discoverable',
    'the selected Skill is visible and removable',
    'chat submissions carry the selected Skill',
    'literature review reuses the grounded report flow',
    'server-owned Skill instructions shape model behavior',
    'right product directory does not duplicate chat-first tools',
  ],
}, null, 2));
