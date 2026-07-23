'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
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
      <div
        data-testid="studio-conversation-header"
        className={compact
          ? 'flex shrink-0 items-center gap-3 border-b border-[#E4E9F1] bg-[var(--bg-primary)] px-4 py-3'
          : 'flex shrink-0 items-center gap-3 border-b border-[var(--glass-border)] bg-[var(--bg-primary)] px-5 py-4'}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
          <MessageSquare className="h-4 w-4 text-blue-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="shrink-0 text-sm font-semibold tracking-tight text-[var(--text-primary)]">文献问答</h2>
            <span className="truncate text-[11px] font-medium text-blue-600">{navItem.label}模式</span>
          </div>
          <p className="truncate text-[11px] text-[var(--text-tertiary)]">
            输入、处理进度和结果都保留在当前会话中
          </p>
        </div>
        <button
          type="button"
          data-testid="studio-back-to-chat"
          onClick={onClose}
          className="liquid-glass-btn flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-subtle)] px-3 text-xs text-[var(--text-secondary)]"
          aria-label="返回文献问答"
          title="返回文献问答"
        >
          <ArrowLeft className="pointer-events-none h-4 w-4" />
          <span>返回文献问答</span>
        </button>
      </div>

      <div
        data-testid="studio-workspace-scroll"
        className={`min-h-0 flex-1 overflow-y-auto bg-[var(--bg-primary)] ${compact ? 'px-4 py-4' : 'px-6 py-5'}`}
      >
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div data-testid="studio-tool-intro-message" className="flex items-start gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-gradient-to-br ${navItem.accent}`}>
              <NavIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-[var(--border-subtle)] bg-[var(--glass-subtle)] px-4 py-3">
              <div className="text-xs font-semibold text-[var(--text-primary)]">已切换到{navItem.label}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
                {navItem.desc}。请在下方提供输入，我会在同一会话中持续显示处理进度和结果。
              </p>
            </div>
          </div>

          <div
            data-testid="studio-tool-composer"
            className="ml-11 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-[0_16px_40px_rgba(70,96,128,0.08)]"
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
      </div>
    </div>
  );
}
