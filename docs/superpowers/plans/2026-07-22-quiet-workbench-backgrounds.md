# Quiet Workbench Backgrounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the embedded research workbench a visible fog-blue page base and warm-white panel hierarchy without changing layout or behavior.

**Architecture:** Keep the existing `quiet-research-workbench` theme boundary and change only its light-surface tokens, border, and panel shadow. Extend the existing notebook-home usability contract to pin those theme values, then verify unchanged workbench interactions on the formal domain.

**Tech Stack:** CSS custom properties, Next.js 16, React 19, TypeScript contract scripts, Codex in-app browser.

## Global Constraints

- Preserve the current three-column layout, panel sizing, folding, dragging, source cards, question flow, tool entries, and guest/account state.
- Keep the existing pale-blue question background as the only large-area content illustration.
- Do not add high-saturation gradients, new assets, dependencies, or provider changes.
- KnowTrail remains local-only; do not push without separate authorization.
- Formal acceptance uses only `http://ucas.sitianai.com/` and the in-app browser.

---

### Task 1: Establish the fog-blue and warm-white hierarchy

**Files:**
- Modify: `src/styles/quiet-research-workbench.css:1-26`
- Modify: `scripts/test-notebook-home-usability.ts:7-55`

**Interfaces:**
- Consumes: existing `.quiet-research-workbench`, `.quiet-workbench-shell`, and `.quiet-workbench-panel` class contract.
- Produces: stable `--quiet-bg`, `--quiet-panel`, `--quiet-panel-muted`, `--quiet-border`, and panel shadow values used by all three workbench columns.

- [ ] **Step 1: Add the failing visual contract**

Add the stylesheet read and exact assertions to `scripts/test-notebook-home-usability.ts`:

```ts
const quietWorkbench = read('src/styles/quiet-research-workbench.css');

assert.match(quietWorkbench, /--quiet-bg: #eaf1f8;/, 'The workbench needs a visible fog-blue page base');
assert.match(quietWorkbench, /--quiet-panel: #fbfcfe;/, 'The three columns need a warm-white surface');
assert.match(quietWorkbench, /--quiet-panel-muted: #f5f8fc;/, 'Muted panel areas need a distinct light surface');
assert.match(quietWorkbench, /--quiet-border: #d8e2ee;/, 'Panel borders must remain soft on the new page base');
```

- [ ] **Step 2: Run the contract and confirm the old all-white hierarchy fails**

Run:

```powershell
pnpm test:notebook-home-usability
```

Expected: failure for `--quiet-bg: #eaf1f8` because the current stylesheet still uses `#f2f5fa` and pure-white panels.

- [ ] **Step 3: Apply the minimum theme change**

Update the opening theme block in `src/styles/quiet-research-workbench.css`:

```css
.quiet-research-workbench {
  --quiet-bg: #eaf1f8;
  --quiet-panel: #fbfcfe;
  --quiet-panel-muted: #f5f8fc;
  --quiet-border: #d8e2ee;
  --quiet-text: #142033;
  --quiet-muted: #65738a;
  --quiet-accent: #2866d7;
  color: var(--quiet-text);
  background: var(--quiet-bg);
}
```

Keep the panel solid and tune only its existing shadow:

```css
box-shadow: 0 1px 2px rgb(15 23 42 / 3%), 0 12px 30px rgb(52 76 108 / 6%);
```

- [ ] **Step 4: Verify source and layout contracts**

Run:

```powershell
pnpm test:notebook-home-usability
pnpm test:source-intake-usability
pnpm run ts-check
pnpm run lint:build
pnpm validate
pnpm build
```

Expected: every command exits `0`; the existing scientific-illustration broad-pattern build warning may remain unchanged.

- [ ] **Step 5: Commit the visual implementation**

```powershell
git add -- src/styles/quiet-research-workbench.css scripts/test-notebook-home-usability.ts
git commit -m "style(workbench): soften research background hierarchy"
```

- [ ] **Step 6: Deploy and verify the formal path**

Package the committed build, run standby health on an unused loopback port, atomically promote with explicit production port `5098`, and keep the prior release as `previous`.

In the in-app browser, verify at one consistent desktop viewport:

1. Enter the research workbench and confirm the fog-blue base is visible between and around the three warm-white panels.
2. Open a source and confirm the reading surface, citations, text contrast, and panel hierarchy remain legible.
3. Close the source, collapse and reopen each side panel, then refresh.
4. Confirm the source count and restored source remain present, no horizontal overflow appears, and console has no new error.
5. Save matching screenshots for the default and source-reading states.
