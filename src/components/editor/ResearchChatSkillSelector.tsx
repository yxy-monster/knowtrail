'use client';
import { useRef } from 'react';
import {
  BookOpenText,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Sparkles,
  WandSparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  getResearchChatSkill,
  RESEARCH_CHAT_SKILLS,
  type ResearchChatSkillId,
} from '@/lib/research-chat-skills';

const SKILL_ICONS: Record<ResearchChatSkillId, LucideIcon> = {
  'literature-review': FileText,
  'academic-writing': BookOpenText,
  'text-polishing': WandSparkles,
  'peer-review': ClipboardCheck,
};

export function ResearchChatSkillSelector({
  selectedSkillId,
  onSelect,
  onClear,
  disabled,
}: {
  selectedSkillId: ResearchChatSkillId | null;
  onSelect: (skillId: ResearchChatSkillId) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const selectedSkill = getResearchChatSkill(selectedSkillId);
  const SelectedIcon = selectedSkill ? SKILL_ICONS[selectedSkill.id] : null;

  return (
    <div className="mx-auto mb-2 flex max-w-3xl flex-wrap items-center gap-2">
      <details ref={menuRef} className="group relative">
        <summary
            data-testid="chat-skill-trigger"
            aria-disabled={disabled}
            onClick={event => {
              if (disabled) event.preventDefault();
            }}
            className="liquid-glass-btn inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-[var(--text-secondary)] transition marker:hidden hover:text-[var(--text-primary)] group-open:text-[var(--text-primary)] aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            aria-label="选择对话 Skill"
            title="选择写作、润色、综述或审查能力"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Skills
            <ChevronDown className="h-3 w-3" />
        </summary>
        <div
          data-testid="chat-skill-menu"
          className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[320px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-[0_18px_50px_rgba(43,70,105,0.16)]"
        >
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold text-[var(--text-primary)]">选择对话 Skill</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--text-tertiary)]">
              Skill 会使用当前选中的证据来源，并保留在对话中继续追问。
            </p>
          </div>
          <div className="space-y-1">
            {RESEARCH_CHAT_SKILLS.map(skill => {
              const Icon = SKILL_ICONS[skill.id];
              const selected = skill.id === selectedSkillId;
              return (
                <button
                  key={skill.id}
                  type="button"
                  data-testid={`chat-skill-option-${skill.id}`}
                  aria-pressed={selected}
                  onClick={() => {
                    onSelect(skill.id);
                    if (menuRef.current) menuRef.current.open = false;
                  }}
                  className={`flex w-full cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left outline-none transition ${
                    selected
                      ? 'border-blue-400/35 bg-blue-500/10'
                      : 'border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--glass-subtle)]'
                  }`}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/8 text-blue-500">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-[var(--text-primary)]">{skill.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-[var(--text-tertiary)]">{skill.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </details>

      {selectedSkill && SelectedIcon ? (
        <button
          type="button"
          data-testid="chat-skill-chip"
          onClick={onClear}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 text-[11px] font-semibold text-blue-700 transition hover:border-blue-400/45 hover:bg-blue-500/15 dark:text-blue-200"
          aria-label={`取消 ${selectedSkill.label} Skill`}
          title="取消当前 Skill，恢复普通文献问答"
        >
          <SelectedIcon className="h-3.5 w-3.5" />
          {selectedSkill.label}
          <X className="h-3 w-3" />
        </button>
      ) : (
        <span className="text-[10px] text-[var(--text-tertiary)]">普通文献问答</span>
      )}

      {selectedSkill ? (
        <span className="text-[10px] text-[var(--text-tertiary)]" aria-live="polite">
          将以“{selectedSkill.label}”处理下一条消息
        </span>
      ) : null}
    </div>
  );
}
