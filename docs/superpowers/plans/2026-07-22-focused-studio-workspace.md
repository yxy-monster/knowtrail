# Focused Studio Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the right-column “tool directory followed by a long appended workspace” with a focused directory-to-workspace transition that preserves the selected tool and allows an immediate return to the directory.

**Architecture:** Keep the existing `StudioPanel` tool state and all existing product panels. Add an explicit `directory | workspace` view state inside `StudioPanel`; selecting a tool enters the workspace view, while a sticky workspace header returns to the directory without triggering any AI request. Persist the selected tool in session storage so refresh restores the focused workspace, while directory scroll remains local to the switcher container.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, existing Lucide icons, source-contract tests executed with `tsx`.

## Global Constraints

- Modify only the KnowTrail worktree on `research/paper-platform-sync-20260712`.
- Preserve every existing Studio product, panel, provider boundary, guest/account isolation rule, `hideVirtualClassroom`, and generation trigger.
- Do not modify or stage the protected paper-server files.
- Use `pnpm`; do not add dependencies.
- The directory and active workspace must each own their scrolling; the right column must not append the workspace below the directory.

---

### Task 1: Lock the focused-workspace interaction contract

**Files:**
- Modify: `scripts/test-studio-nav-side-effects.ts`

**Interfaces:**
- Consumes: `StudioPanel`, `StudioToolSwitcher`, the existing `StudioTab` union.
- Produces: source assertions for `studioView`, `openWorkspace`, `returnToDirectory`, session persistence, directory-only rendering, and workspace-only rendering.

- [ ] **Step 1: Write the failing test**

Add assertions requiring `StudioPanel` to expose a directory view and a focused workspace view, and remove the old contract that requires one shared vertical scroll container:

```ts
assert.match(studioPanelSource, /type StudioView = 'directory' \| 'workspace'/);
assert.match(studioPanelSource, /const \[studioView, setStudioView\] = useState<StudioView>\('directory'\)/);
assert.match(studioPanelSource, /function openWorkspace\(tab: StudioTab\)/);
assert.match(studioPanelSource, /function returnToDirectory\(\)/);
assert.match(studioPanelSource, /sessionStorage\.setItem\('knowtrail:studio-active-tool'/);
assert.match(studioPanelSource, /studioView === 'directory'/);
assert.match(studioPanelSource, /studioView === 'workspace'/);
assert.match(studioPanelSource, /data-testid="studio-back-to-directory"/);
assert.doesNotMatch(studioPanelSource, /切换入口只打开对应工作区，检索或生成需在下方明确操作。/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:studio-nav-side-effects`

Expected: FAIL because `StudioPanel` has no focused view state or back-to-directory action.

- [ ] **Step 3: Keep the failure scoped**

Confirm the failing assertion refers only to the new directory/workspace contract, not a missing file, syntax error, or provider configuration.

---

### Task 2: Implement directory-to-workspace navigation

**Files:**
- Modify: `src/components/studio/StudioPanel.tsx`
- Modify: `src/components/studio/StudioToolSwitcher.tsx`
- Test: `scripts/test-studio-nav-side-effects.ts`

**Interfaces:**
- Consumes: `StudioToolSwitcher.onSelect(tab: StudioTab)` and every existing product panel.
- Produces: `openWorkspace(tab: StudioTab): void` and `returnToDirectory(): void`; `studioView` determines which surface is mounted.

- [ ] **Step 1: Add the minimum focused view state**

In `StudioPanel`, add:

```ts
type StudioView = 'directory' | 'workspace';
const ACTIVE_TOOL_STORAGE_KEY = 'knowtrail:studio-active-tool';
const [studioView, setStudioView] = useState<StudioView>('directory');

function openWorkspace(tab: StudioTab) {
  setActiveTab(tab);
  setStudioView('workspace');
  window.sessionStorage.setItem(ACTIVE_TOOL_STORAGE_KEY, tab);
}

function returnToDirectory() {
  setStudioView('directory');
}
```

Restore only valid visible tool ids on mount. Do not call an API or create a new product state store.

- [ ] **Step 2: Render one surface at a time**

Directory view renders the compact header, `StudioToolSwitcher`, and a short usage hint. Workspace view renders a sticky header with the active tool icon, name, selected description, readiness boundary, and a `data-testid="studio-back-to-directory"` back button, followed by only the active product panel in its own `overflow-y-auto` region.

- [ ] **Step 3: Preserve directory position**

Keep the switcher mounted only while the directory is visible and give its directory container `overflow-y-auto`. Store its scroll position in a React ref before entering the workspace and restore it in a layout effect when returning.

- [ ] **Step 4: Verify the focused contract passes**

Run: `pnpm test:studio-nav-side-effects`

Expected: PASS and output includes `ok: true`.

- [ ] **Step 5: Verify surrounding product behavior**

Run:

```powershell
pnpm test:studio-generation-readiness
pnpm smoke:workbench-studio-ui
pnpm ts-check
pnpm lint:build
pnpm build
```

Expected: all commands exit 0; existing product panels, generation buttons, provider readiness messages, and virtual-classroom hiding remain intact.

- [ ] **Step 6: Commit**

```powershell
git add docs/superpowers/plans/2026-07-22-focused-studio-workspace.md scripts/test-studio-nav-side-effects.ts src/components/studio/StudioPanel.tsx src/components/studio/StudioToolSwitcher.tsx
git commit -m "feat(workbench): focus studio tool workspaces"
```

---

### Task 3: Publish and verify the formal user path

**Files:**
- No additional source files.

**Interfaces:**
- Consumes: the packaged KnowTrail release and existing atomic deployment scripts.
- Produces: formal-domain evidence for directory → tool workspace → back → refresh recovery.

- [ ] **Step 1: Package the verified application**

Run the repository's existing Linux packaging command and record its output path and source commit.

- [ ] **Step 2: Deploy atomically**

Use the existing reversible release/current/previous workflow. Confirm the manifest reports the new source commit and `dirty=false` before switching `current`.

- [ ] **Step 3: Verify the formal path**

At `http://ucas.sitianai.com/#/research-agent`, verify at the same desktop viewport:

1. Right column initially shows the tool directory without an appended workspace.
2. Clicking `研究脉络` replaces the directory with its focused workspace and gives immediate visual feedback.
3. `返回全部工具` restores the directory at its prior position.
4. Reopening the tool and refreshing preserves the active tool and selected source state.
5. Console has no new errors; unavailable AI providers remain clearly unavailable and never report false success.

- [ ] **Step 4: Record one audit screenshot for the directory and one for the focused workspace**

Save both screenshots beside the existing full-workbench audit evidence.

---

## Self-Review

- Spec coverage: directory/workspace separation, immediate return, scroll ownership, tool-state restoration, provider boundaries, build, deployment, and formal-domain verification are covered.
- Placeholder scan: no deferred implementation placeholders remain.
- Type consistency: `StudioView`, `StudioTab`, `openWorkspace`, and `returnToDirectory` use the existing product id union and callback contract.
