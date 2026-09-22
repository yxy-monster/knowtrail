import type { FullTextResult } from './types';

const UNPAYWALL_API = 'https://api.unpaywall.org/v2';

function getUnpaywallEmail(): string {
  return process.env.UNPAYWALL_EMAIL || 'research@tashan.chat';
}

interface UnpaywallResponse {
  best_oa_location?: {
    url_for_pdf?: string | null;
    url?: string | null;
    host_type?: string;
  } | null;
  oa_locations?: Array<{
    url_for_pdf?: string | null;
    url?: string | null;
  }>;
  is_oa: boolean;
  title?: string;
}

export async function discoverOaLocations(doi: string): Promise<{ pdfUrl: string | null; landingUrl: string | null }> {
  const email = getUnpaywallEmail();
  const url = `${UNPAYWALL_API}/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Unpaywall API returned ${res.status} for DOI ${doi}`);
  }

  const data = (await res.json()) as UnpaywallResponse;

  const pdfUrl = data.best_oa_location?.url_for_pdf ||
    data.oa_locations?.find(l => l.url_for_pdf)?.url_for_pdf ||
    null;

  const landingUrl = data.best_oa_location?.url ||
    data.oa_locations?.find(l => l.url)?.url ||
    null;

  return { pdfUrl, landingUrl };
}

async function downloadPdf(pdfUrl: string): Promise<Buffer> {
  const res = await fetch(pdfUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (research tool)' },
    signal: AbortSignal.timeout(60000),
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`PDF download failed: HTTP ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  process.env.PDF_PARSER_DISABLE_TEST = '1';
  const pdfParse = (await import('pdf-parse-fixed')).default;
  const result = await pdfParse(buffer);
  return result.text || '';
}

export async function fetchFullText(doi: string): Promise<FullTextResult> {
  const { pdfUrl, landingUrl } = await discoverOaLocations(doi);

  if (!pdfUrl && !landingUrl) {
    throw new FullTextError('no_oa', '该论文暂无开放获取全文');
  }

  const targetUrl = pdfUrl || landingUrl;
  if (!targetUrl) {
    throw new FullTextError('no_oa', '该论文暂无开放获取全文');
  }

  const buffer = await downloadPdf(targetUrl);
  const fullText = await extractPdfText(buffer);

  if (!fullText.trim()) {
    throw new FullTextError('extraction_failed', 'PDF 文本提取失败，可能是扫描件');
  }

  return {
    fullText,
    pdfUrl: targetUrl,
    source: 'unpaywall',
    charCount: fullText.length,
  };
}

export async function fetchFullTextFromUrl(pdfUrl: string): Promise<string> {
  const buffer = await downloadPdf(pdfUrl);
  const text = await extractPdfText(buffer);
  if (!text.trim()) {
    throw new FullTextError('extraction_failed', 'PDF 文本提取失败');
  }
  return text;
}

export class FullTextError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'FullTextError';
  }
}
