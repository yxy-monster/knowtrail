import { searchLiterature, SOURCE_DISPLAY_NAMES } from './providers';
import { deduplicateResults, getAlsoFoundIn } from './dedupe';
import { signLiteratureResult } from './result-token';
import { checkRateLimit, withConcurrencyLimit } from './request';
import type { LiteraturePaper, LiteratureProviderId, LiteratureResult } from './types';
import { LITERATURE_PROVIDER_IDS } from './types';

export interface SearchOptions {
  query: string;
  sources?: LiteratureProviderId[];
  limitPerSource?: number;
  userId?: string;
  yearFrom?: number;
  yearTo?: number;
}

export async function searchAllSources(options: SearchOptions): Promise<LiteratureResult[]> {
  const { query, sources = [...LITERATURE_PROVIDER_IDS], limitPerSource = 10, userId = 'anonymous', yearFrom, yearTo } = options;

  const rateCheck = checkRateLimit(userId);
  if (!rateCheck.allowed) {
    throw new Error(`请求频率超限，请 ${rateCheck.retryAfter} 秒后重试`);
  }

  const allPapers: LiteraturePaper[] = [];

  const tasks = sources.map(source =>
    withConcurrencyLimit(async () => {
      try {
        return await searchLiterature(source, query, limitPerSource);
      } catch (err) {
        console.error(`[${source}] search failed:`, err instanceof Error ? err.message : 'unknown');
        return [];
      }
    })
  );

  const results = await Promise.all(tasks);
  for (const batch of results) {
    allPapers.push(...batch);
  }

  const deduped = deduplicateResults(allPapers.map(paper => ({
    ...paper,
    authors: paper.authors.map(author => ({ name: author.name.trim() })).filter(author => author.name),
  })));

  const filtered = deduped.filter(paper => {
    const year = typeof paper.year === 'string' ? parseInt(paper.year, 10) : paper.year;
    if (yearFrom && year < yearFrom) return false;
    if (yearTo && year > yearTo) return false;
    return true;
  });

  return filtered.map(paper => {
    const resultId = signLiteratureResult(paper);
    const alsoFoundIn = getAlsoFoundIn(paper, allPapers);
    return {
      ...paper,
      resultId,
      retrievedAt: new Date().toISOString(),
      alsoFoundIn,
    };
  });
}

export { SOURCE_DISPLAY_NAMES };
