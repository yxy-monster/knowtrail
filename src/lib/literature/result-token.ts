import crypto from 'crypto';
import type { LiteraturePaper, LiteratureProviderId } from './types';

const HMAC_SECRET_ENV = 'LITERATURE_HMAC_SECRET';

function getSecret(): string {
  return process.env[HMAC_SECRET_ENV] || 'dev-literature-hmac-secret-change-in-prod';
}

interface SignedPayload {
  title: string;
  authors: { name: string }[];
  year: number | string;
  doi?: string;
  arxivId?: string;
  abstract: string;
  venue: string;
  url: string;
  source: LiteratureProviderId;
  provider: string;
  evidenceScope: string;
  retrievedAt: string;
}

export function signLiteratureResult(paper: LiteraturePaper): string {
  const payload: SignedPayload = {
    title: paper.title,
    authors: paper.authors,
    year: paper.year,
    doi: paper.doi,
    arxivId: paper.arxivId,
    abstract: paper.abstract,
    venue: paper.venue,
    url: paper.url,
    source: paper.source,
    provider: paper.provider,
    evidenceScope: paper.evidenceScope,
    retrievedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', getSecret()).update(json).digest('hex');
  const b64 = Buffer.from(json).toString('base64url');
  return `${b64}.${hmac}`;
}

export function verifyLiteratureResult(token: string): SignedPayload | null {
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx < 0) return null;

  const b64 = token.slice(0, dotIdx);
  const providedHmac = token.slice(dotIdx + 1);

  let json: string;
  try {
    json = Buffer.from(b64, 'base64url').toString('utf-8');
  } catch {
    return null;
  }

  const expectedHmac = crypto.createHmac('sha256', getSecret()).update(json).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac))) {
    return null;
  }

  try {
    return JSON.parse(json) as SignedPayload;
  } catch {
    return null;
  }
}

export function literatureSourceId(payload: SignedPayload): string {
  return `${payload.source}:${payload.doi || payload.arxivId || payload.title.slice(0, 50)}`;
}

export function literatureText(payload: SignedPayload, fullText?: string): string {
  const authors = payload.authors.map(a => a.name).join(', ');
  const lines = [
    `# ${payload.title}`,
    '',
    `**作者**: ${authors}`,
    `**年份**: ${payload.year}`,
    `**来源**: ${payload.venue}`,
    `**DOI**: ${payload.doi || 'N/A'}`,
    `**数据源**: ${payload.provider}`,
    '',
    '## 摘要',
    '',
    payload.abstract || '(无摘要)',
  ];

  if (fullText) {
    lines.push('', '## 全文', '', fullText);
  }

  return lines.join('\n');
}
