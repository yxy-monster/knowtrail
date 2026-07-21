'use client';

import { useState } from 'react';
import { Archive, ArrowUpRight, BookOpen, Clock3, FileText, MoreHorizontal, PencilLine, Plus } from 'lucide-react';
import {
  formatNotebookDate,
  type WorkspaceNotebook,
} from '@/components/home/workspace-types';
import { FEATURED_NOTEBOOKS } from '@/components/home/featured-notebooks';

export function FeaturedNotebookStrip({
  disabled,
  onOpen,
}: {
  disabled: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-7 sm:px-5 sm:pb-8" data-testid="notebook-home-featured-strip">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">精选模板</h2>
        <span className="text-sm text-slate-500">4 个研究场景</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {FEATURED_NOTEBOOKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            disabled={disabled}
            className="home-motion-card group flex min-h-[140px] flex-col overflow-hidden rounded-xl border border-white/20 p-4 text-left text-white shadow-[0_10px_28px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: item.image }}
            data-testid={`notebook-home-featured-${item.id}`}
            aria-label={`打开精选文献本 ${item.title}`}
          >
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-white/90 sm:text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/92 text-slate-950">
                <BookOpen className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>
            <h3 className="mt-4 text-base font-semibold leading-snug sm:text-lg">{item.title}</h3>
            <p className="mt-auto pt-2 text-xs font-medium text-white/75">{item.author} · {item.meta}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export function CreateNotebookCard({ disabled, onCreate }: { disabled: boolean; onCreate: () => void }) {
  return (
    <button
      type="button"
      onClick={onCreate}
      disabled={disabled}
      className="home-motion-card flex min-h-[184px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      data-testid="notebook-home-create-card"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Plus className="h-5 w-5" />
      </span>
      <span className="mt-4 block text-base font-semibold tracking-tight text-slate-950">新建文献本</span>
    </button>
  );
}

export function NotebookCard({
  notebook,
  active,
  disabled,
  onOpen,
  onRename,
  onArchive,
  canArchive,
}: {
  notebook: WorkspaceNotebook;
  active: boolean;
  disabled: boolean;
  onOpen: () => void;
  onRename: () => void;
  onArchive: () => void;
  canArchive: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article
      className={`home-motion-card group relative min-h-[184px] rounded-xl border transition hover:-translate-y-0.5 ${
        active
          ? 'border-blue-300 bg-blue-50 shadow-[0_10px_26px_rgba(37,99,235,0.10)]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_10px_26px_rgba(15,23,42,0.07)]'
      }`}
      data-testid={`notebook-home-card-${notebook.id}`}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className="flex min-h-[182px] w-full flex-col justify-between rounded-xl p-5 pr-14 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={`打开文献本 ${notebook.title}`}
      >
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${notebook.accent}`}>
          <FileText className="h-5 w-5 text-slate-700" />
        </span>

        <span>
          <span className="line-clamp-2 block text-lg font-semibold leading-snug tracking-tight text-slate-950">{notebook.title}</span>
          <span className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            {formatNotebookDate(notebook.updatedAt)} · {notebook.sourceCount} 个来源
          </span>
          <span
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700"
            data-testid={`notebook-home-open-${notebook.id}`}
          >
            打开文献本 <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>

      <div className="absolute right-3 top-3" data-testid={`notebook-home-actions-${notebook.id}`}>
        <button
          type="button"
          onClick={() => setMenuOpen(open => !open)}
          disabled={disabled}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          aria-label={`管理文献本 ${notebook.title}`}
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onRename(); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <PencilLine className="h-4 w-4" /> 重命名
            </button>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onArchive(); }}
              disabled={!canArchive}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              title={canArchive ? '归档后可随时恢复' : '至少保留一个使用中的文献本'}
            >
              <Archive className="h-4 w-4" /> 归档
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
