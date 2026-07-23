export type ResearchChatSkillId =
  | 'literature-review'
  | 'academic-writing'
  | 'text-polishing'
  | 'peer-review';

export interface ResearchChatSkill {
  id: ResearchChatSkillId;
  label: string;
  description: string;
  placeholder: string;
  allowsEmptyPrompt?: boolean;
}

export const RESEARCH_CHAT_SKILLS = [
  {
    id: 'literature-review',
    label: '文献综述',
    description: '综合当前来源，梳理论点、分歧与研究缺口',
    placeholder: '可选：说明综述重点、结构或目标读者',
    allowsEmptyPrompt: true,
  },
  {
    id: 'academic-writing',
    label: '学术写作',
    description: '基于证据撰写引言、相关工作或讨论',
    placeholder: '说明要写的章节、核心问题和篇幅要求',
  },
  {
    id: 'text-polishing',
    label: '文本润色',
    description: '保护事实与引用，改善表达并解释修改',
    placeholder: '粘贴待润色文字，并说明语言、风格或篇幅要求',
  },
  {
    id: 'peer-review',
    label: '论文审查',
    description: '定位论证、方法与证据问题，给出可执行建议',
    placeholder: '说明审查范围、关注重点或目标期刊要求',
  },
] as const satisfies readonly ResearchChatSkill[];

const RESEARCH_CHAT_SKILL_IDS = new Set<ResearchChatSkillId>(
  RESEARCH_CHAT_SKILLS.map(skill => skill.id),
);

export function isResearchChatSkillId(value: unknown): value is ResearchChatSkillId {
  return typeof value === 'string' && RESEARCH_CHAT_SKILL_IDS.has(value as ResearchChatSkillId);
}

export function getResearchChatSkill(skillId: ResearchChatSkillId | null): ResearchChatSkill | null {
  return RESEARCH_CHAT_SKILLS.find(skill => skill.id === skillId) ?? null;
}
