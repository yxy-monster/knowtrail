'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { KnowledgeMapPanel } from './KnowledgeMapPanel';
import { PresentationWorkspacePanel } from './PresentationPanels';
import { VirtualClassroomPanel } from './VirtualClassroomPanel';
import { PaperSearchPanel } from './PaperSearchPanel';
import { DeepResearchPanel } from './DeepResearchPanel';
import { HypothesisGenerationPanel } from './HypothesisGenerationPanel';
import { DataProcessingPanel } from './DataProcessingPanel';
import { ExperimentDesignPanel } from './ExperimentDesignPanel';
import { AcademicWritingPanel } from './AcademicWritingPanel';
import { TextPolishingPanel } from './TextPolishingPanel';
import { PeerReviewPanel } from './PeerReviewPanel';
import { ScientificIllustrationPanel } from './ScientificIllustrationPanel';
import {
  STUDIO_NAV,
  StudioToolSwitcher,
  getVisibleStudioNav,
  shouldHideVirtualClassroom,
  type StudioNavItem,
  type StudioTab,
} from './StudioToolSwitcher';

type StudioView = 'directory' | 'workspace';

const ACTIVE_TOOL_STORAGE_KEY = 'knowtrail:studio-active-tool';

export function StudioPanel({ compact = false }: { compact?: boolean }) {
  const [activeTab, setActiveTab] = useState<StudioTab>(STUDIO_NAV[0].id);
  const [studioView, setStudioView] = useState<StudioView>('directory');
  const [hideVirtualClassroom, setHideVirtualClassroom] = useState(false);
  const directoryScrollRef = useRef<HTMLDivElement>(null);
  const directoryScrollTopRef = useRef(0);
  const visibleNavItems = useMemo(
    () => getVisibleStudioNav(hideVirtualClassroom),
    [hideVirtualClassroom],
  );

  useEffect(() => {
    const shouldHideClassroom = shouldHideVirtualClassroom();
    const availableItems = getVisibleStudioNav(shouldHideClassroom);
    const savedTab = window.sessionStorage.getItem(ACTIVE_TOOL_STORAGE_KEY);

    setHideVirtualClassroom(shouldHideClassroom);
    if (savedTab && availableItems.some(item => item.id === savedTab)) {
      setActiveTab(savedTab as StudioTab);
      setStudioView('workspace');
    }
  }, []);

  useEffect(() => {
    if (!visibleNavItems.some(item => item.id === activeTab)) {
      setActiveTab(visibleNavItems[0].id);
    }
  }, [activeTab, visibleNavItems]);

  useEffect(() => {
    if (studioView !== 'directory' || !directoryScrollRef.current) return;
    directoryScrollRef.current.scrollTop = directoryScrollTopRef.current;
  }, [studioView]);

  function openWorkspace(tab: StudioTab) {
    directoryScrollTopRef.current = directoryScrollRef.current?.scrollTop ?? 0;
    setActiveTab(tab);
    setStudioView('workspace');
    window.sessionStorage.setItem(ACTIVE_TOOL_STORAGE_KEY, tab);
  }

  function returnToDirectory() {
    setStudioView('directory');
    window.sessionStorage.removeItem(ACTIVE_TOOL_STORAGE_KEY);
  }

  const navItem: StudioNavItem = visibleNavItems.find(n => n.id === activeTab) ?? visibleNavItems[0];
  const NavIcon = navItem.icon;

  return (
    <div className="h-full min-h-0 overflow-hidden" data-density={compact ? 'compact' : 'default'}>
      {studioView === 'directory' && (
        <div
          ref={directoryScrollRef}
          data-testid="studio-directory-scroll"
          className="h-full overflow-y-auto"
        >
          <div className={compact ? 'px-4 pb-4 pt-3' : 'px-5 pb-5 pt-5'}>
            <div className={compact ? 'mb-4 flex items-center gap-2.5' : 'mb-5 flex items-center gap-3'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-subtle)]">
                <NavIcon className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <div>
                <h2 className={compact
                  ? 'text-sm font-semibold tracking-tight text-[var(--text-primary)]'
                  : 'text-base font-semibold tracking-tight text-[var(--text-primary)]'}>产物中心</h2>
                <p className="text-[11px] text-[var(--text-tertiary)]">选择一项工具进入专注工作区</p>
              </div>
            </div>

            <StudioToolSwitcher compact={compact} activeTab={activeTab} onSelect={openWorkspace} navItems={visibleNavItems} />
          </div>
        </div>
      )}

      {studioView === 'workspace' && (
        <div className="flex h-full min-h-0 flex-col">
          <div className={compact
            ? 'flex shrink-0 items-center gap-2.5 border-b border-[#E4E9F1] px-3 py-3'
            : 'flex shrink-0 items-center gap-3 border-b border-[var(--glass-border)] px-4 py-4'}>
            <button
              type="button"
              data-testid="studio-back-to-directory"
              onClick={returnToDirectory}
              className="liquid-glass-btn flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-subtle)] px-3 text-[var(--text-secondary)]"
              aria-label="返回全部工具"
              title="返回全部工具"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>全部工具</span>
            </button>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-gradient-to-br ${navItem.accent}`}>
              <NavIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold tracking-tight text-[var(--text-primary)]">{navItem.label}</h2>
              <p className="truncate text-[11px] text-[var(--text-tertiary)]">{navItem.desc}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--glass-border)] bg-[var(--glass-subtle)] px-2 py-1 text-[10px] font-medium text-[var(--text-tertiary)]">
              专注工作区
            </span>
          </div>

          <div
            data-testid="studio-workspace-scroll"
            className={`min-h-0 flex-1 overflow-y-auto ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}
          >
            {activeTab === 'paper-search' && <PaperSearchPanel />}
            {activeTab === 'deep-research' && <DeepResearchPanel />}
            {activeTab === 'hypothesis-generation' && <HypothesisGenerationPanel />}
            {activeTab === 'data-processing' && <DataProcessingPanel />}
            {activeTab === 'experiment-design' && <ExperimentDesignPanel />}
            {activeTab === 'academic-writing' && <AcademicWritingPanel />}
            {activeTab === 'text-polishing' && <TextPolishingPanel />}
            {activeTab === 'scientific-illustration' && <ScientificIllustrationPanel />}
            {activeTab === 'peer-review' && <PeerReviewPanel />}
            {activeTab === 'presentation' && <PresentationWorkspacePanel />}
            {activeTab === 'knowledge' && <KnowledgeMapPanel />}
            {activeTab === 'virtual-classroom' && <VirtualClassroomPanel />}
          </div>
        </div>
      )}
    </div>
  );
}
