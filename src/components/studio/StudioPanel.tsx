'use client';

import { useEffect, useMemo, useState } from 'react';
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

export const ACTIVE_TOOL_STORAGE_KEY = 'knowtrail:studio-active-tool';

export function StudioPanel({
  compact = false,
  activeTab,
  onSelect,
}: {
  compact?: boolean;
  activeTab: StudioTab | null;
  onSelect: (tab: StudioTab) => void;
}) {
  const [hideVirtualClassroom, setHideVirtualClassroom] = useState(false);
  const visibleNavItems = useMemo(
    () => getVisibleStudioNav(hideVirtualClassroom),
    [hideVirtualClassroom],
  );
  const DirectoryIcon = STUDIO_NAV[0].icon;

  useEffect(() => {
    setHideVirtualClassroom(shouldHideVirtualClassroom());
  }, []);

  return (
    <div
      data-testid="studio-directory-scroll"
      className="h-full min-h-0 overflow-y-auto"
      data-density={compact ? 'compact' : 'default'}
    >
      <div className={compact ? 'px-4 pb-4 pt-3' : 'px-5 pb-5 pt-5'}>
        <div className={compact ? 'mb-4 flex items-center gap-2.5' : 'mb-5 flex items-center gap-3'}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-subtle)]">
            <DirectoryIcon className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h2 className={compact
              ? 'text-sm font-semibold tracking-tight text-[var(--text-primary)]'
              : 'text-base font-semibold tracking-tight text-[var(--text-primary)]'}>产物中心</h2>
            <p className="text-[11px] text-[var(--text-tertiary)]">选择工具，在中间工作区完成输入与结果</p>
          </div>
        </div>

        <StudioToolSwitcher
          compact={compact}
          activeTab={activeTab}
          onSelect={onSelect}
          navItems={visibleNavItems}
        />
      </div>
    </div>
  );
}

export function StudioWorkspacePanel({
  compact = false,
  activeTab,
  onClose,
}: {
  compact?: boolean;
  activeTab: StudioTab;
  onClose: () => void;
}) {
  const navItem: StudioNavItem = STUDIO_NAV.find(item => item.id === activeTab) ?? STUDIO_NAV[0];
  const NavIcon = navItem.icon;

  return (
    <div
      data-testid="studio-workspace-center"
      className="flex h-full min-h-0 flex-col"
      data-density={compact ? 'compact' : 'default'}
    >
      <div className={compact
        ? 'flex shrink-0 items-center gap-2.5 border-b border-[#E4E9F1] px-4 py-3'
        : 'flex shrink-0 items-center gap-3 border-b border-[var(--glass-border)] px-5 py-4'}>
        <button
          type="button"
          data-testid="studio-back-to-chat"
          onClick={onClose}
          className="liquid-glass-btn flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-subtle)] px-3 text-[var(--text-secondary)]"
          aria-label="返回文献问答"
          title="返回文献问答"
        >
          <ArrowLeft className="pointer-events-none h-4 w-4" />
          <span>返回文献问答</span>
        </button>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-gradient-to-br ${navItem.accent}`}>
          <NavIcon className="h-4 w-4 text-[var(--text-secondary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold tracking-tight text-[var(--text-primary)]">{navItem.label}</h2>
          <p className="truncate text-[11px] text-[var(--text-tertiary)]">{navItem.desc}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--glass-border)] bg-[var(--glass-subtle)] px-2 py-1 text-[10px] font-medium text-[var(--text-tertiary)]">
          中间工作区
        </span>
      </div>

      <div
        data-testid="studio-workspace-scroll"
        className={`min-h-0 flex-1 overflow-y-auto ${compact ? 'px-5 py-4' : 'px-6 py-5'}`}
      >
        <div className="mx-auto w-full max-w-4xl">
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
    </div>
  );
}
