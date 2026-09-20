export type LiteratureProviderId =
  | 'crossref'
  | 'europepmc'
  | 'semantic-scholar'
  | 'openalex'
  | 'arxiv'
  | 'pubmed'
  | 'scite';

export const LITERATURE_PROVIDER_IDS: readonly LiteratureProviderId[] = [
  'crossref',
  'europepmc',
  'semantic-scholar',
  'openalex',
  'arxiv',
  'pubmed',
  'scite',
];

export interface OALocation {
  url: string;
  pdfUrl?: string;
  source: string;
  license?: string;
}

export interface LiteraturePaper {
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
  evidenceScope: 'abstract' | 'metadata' | 'fulltext';
  oaLocations?: OALocation[];
  fullText?: string;
}

export interface LiteratureResult extends LiteraturePaper {
  resultId: string;
  retrievedAt: string;
  alsoFoundIn: LiteratureProviderId[];
}

export interface FullTextResult {
  fullText: string;
  pdfUrl: string;
  source: 'unpaywall' | 'direct';
  charCount: number;
}

export type CitationStyle = 'bibtex' | 'apa' | 'mla' | 'chicago' | 'ieee' | 'GB/T 7714';

export interface CitationPaper {
  title: string;
  authors: { name: string }[];
  year: number | string;
  doi?: string;
  arxivId?: string;
  venue?: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
}
