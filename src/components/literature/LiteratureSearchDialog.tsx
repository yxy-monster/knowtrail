'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Loader2,
  ExternalLink,
  FileText,
  Quote,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import type { LiteratureResult, LiteratureProviderId, CitationStyle } from '@/lib/literature/types';

const SOURCE_LABELS: Record<LiteratureProviderId, string> = {
  crossref: 'Crossref',
  europepmc: 'Europe PMC',
  'semantic-scholar': 'Semantic Scholar',
  openalex: 'OpenAlex',
  arxiv: 'arXiv',
  pubmed: 'PubMed',
  scite: 'Scite',
};

const SOURCE_COLORS: Record<LiteratureProviderId, string> = {
  crossref: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  europepmc: 'bg-green-500/10 text-green-400 border-green-500/20',
  'semantic-scholar': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  openalex: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  arxiv: 'bg-red-500/10 text-red-400 border-red-500/20',
  pubmed: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  scite: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const CITATION_STYLES: { value: CitationStyle; label: string }[] = [
  { value: 'apa', label: 'APA 7th' },
  { value: 'GB/T 7714', label: 'GB/T 7714' },
  { value: 'mla', label: 'MLA 9th' },
  { value: 'chicago', label: 'Chicago 17th' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'bibtex', label: 'BibTeX' },
];

interface LiteratureSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (result: LiteratureResult) => void;
}

export function LiteratureSearchDialog({ open, onOpenChange, onImport }: LiteratureSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<Set<LiteratureProviderId>>(
    new Set(['crossref', 'europepmc', 'semantic-scholar', 'openalex', 'arxiv', 'pubmed', 'scite'])
  );
  const [results, setResults] = useState<LiteratureResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fulltextLoading, setFulltextLoading] = useState<string | null>(null);
  const [citeStyle, setCiteStyle] = useState<CitationStyle>('apa');

  const toggleSource = useCallback((source: LiteratureProviderId) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) {
        if (next.size > 1) next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/api/literature/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          sources: Array.from(selectedSources),
          limitPerSource: 10,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `搜索失败 (${res.status})`);
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setLoading(false);
    }
  }, [query, selectedSources]);

  const handleGetFullText = useCallback(async (result: LiteratureResult) => {
    if (!result.doi) return;
    setFulltextLoading(result.resultId);

    try {
      const res = await fetch('/api/literature/fulltext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'doi', doi: result.doi }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || '全文获取失败');
        return;
      }

      const data = await res.json();
      if (onImport) {
        const fullResult = { ...result, fullText: data.fullText, evidenceScope: 'fulltext' as const };
        onImport(fullResult);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '全文获取失败');
    } finally {
      setFulltextLoading(null);
    }
  }, [onImport]);

  const handleCite = useCallback(async (result: LiteratureResult) => {
    try {
      const res = await fetch('/api/literature/cite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: [{
            title: result.title,
            authors: result.authors,
            year: result.year,
            doi: result.doi,
            arxivId: result.arxivId,
            venue: result.venue,
            url: result.url,
          }],
          style: citeStyle,
        }),
      });

      if (!res.ok) throw new Error('引用格式化失败');

      const data = await res.json();
      const citation = data.citations?.[0] || '';
      await navigator.clipboard.writeText(citation);
      setCopiedId(result.resultId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : '引用格式化失败');
    }
  }, [citeStyle]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            文献检索
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="输入关键词搜索文献..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SOURCE_LABELS) as LiteratureProviderId[]).map(source => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                  selectedSources.has(source)
                    ? SOURCE_COLORS[source]
                    : 'bg-zinc-800/50 text-zinc-500 border-zinc-700 opacity-50'
                }`}
              >
                {SOURCE_LABELS[source]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">引用格式:</span>
            <Select value={citeStyle} onValueChange={v => setCiteStyle(v as CitationStyle)}>
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITATION_STYLES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">
              {error}
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 pr-3">
              {results.map(result => (
                <div
                  key={result.resultId}
                  className="border border-zinc-800 rounded-lg p-3 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-snug flex-1">
                      {result.title}
                    </h3>
                    <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${SOURCE_COLORS[result.source]}`}>
                      {SOURCE_LABELS[result.source]}
                    </Badge>
                  </div>

                  <div className="text-xs text-zinc-400">
                    {result.authors.slice(0, 3).map(a => a.name).join(', ')}
                    {result.authors.length > 3 && ' et al.'}
                    {' · '}
                    {result.year}
                    {result.venue && ` · ${result.venue}`}
                  </div>

                  {result.abstract && (
                    <p className="text-xs text-zinc-500 line-clamp-3">
                      {result.abstract}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 pt-1">
                    {result.doi && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => handleGetFullText(result)}
                        disabled={fulltextLoading === result.resultId}
                      >
                        {fulltextLoading === result.resultId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        获取全文
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => handleCite(result)}
                    >
                      {copiedId === result.resultId ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Quote className="h-3 w-3" />
                      )}
                      引用
                    </Button>

                    {result.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        原文
                      </Button>
                    )}

                    {result.alsoFoundIn.length > 0 && (
                      <span className="text-[10px] text-zinc-600 ml-auto">
                        也在 {result.alsoFoundIn.map(s => SOURCE_LABELS[s]).join(', ')} 中找到
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {!loading && results.length === 0 && !error && (
                <div className="text-center text-sm text-zinc-500 py-8">
                  输入关键词开始搜索文献
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                  <span className="ml-2 text-sm text-zinc-400">正在搜索...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {results.length > 0 && (
            <>
              <Separator />
              <div className="text-xs text-zinc-500">
                共 {results.length} 条结果
                {onImport && ' · 点击"获取全文"可导入文库'}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
