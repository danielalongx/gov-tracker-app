import { Signal, Sentiment, Direction } from '../types';

// Replace with your Railway URL after deployment
// e.g. 'https://gov-tracker-production.up.railway.app'
const RAILWAY_URL = ''

export const API_BASE_URL = RAILWAY_URL || 'http://localhost:8000'

// ── Raw API shapes ──────────────────────────────────────────────────────────

interface ApiCompany {
  name: string;
  ticker: string | null;
  impact: string;
}

interface ApiAnalysis {
  sentiment: string;
  relevance_score: number;
  summary: string;
  tickers: string[];
  industries: string[];
  companies: ApiCompany[];
  disclaimer?: string;
}

interface ApiSignal {
  id: number;
  source: string;
  source_name: string;
  content: string;
  article_url: string;
  published_at: string | null;
  fetched_at: string;
  analysis: ApiAnalysis;
}

// ── Mapping helpers ─────────────────────────────────────────────────────────

function sourceToRegions(source: string): string[] {
  const s = source.toLowerCase();
  if (s.includes('denmark')) return ['丹麦'];
  if (s.includes('eu_') || s.includes('europa') || s.includes('europe')) return ['欧洲'];
  if (s.includes('china') || s.includes('xinhua') || s.includes('cn_')) return ['中国'];
  if (s.includes('trump') || s.includes('federal') || s.includes('us_') || s === 'reuters') return ['美国'];
  return [];
}

function toSentiment(raw: string): Sentiment {
  if (raw === 'bullish') return 'bullish';
  if (raw === 'bearish') return 'bearish';
  if (raw === 'neutral') return 'neutral';
  return 'mixed';
}

function toDirection(impact: string): Direction {
  if (impact === 'bullish') return 'up';
  if (impact === 'bearish') return 'down';
  return 'neutral';
}

function apiSignalToSignal(s: ApiSignal): Signal {
  return {
    id: String(s.id),
    source: s.source_name || s.source,
    publishedAt: s.published_at ?? s.fetched_at,
    sentiment: toSentiment(s.analysis.sentiment),
    headline: s.analysis.summary,
    affectedCompanies: s.analysis.companies.map(c => ({
      name: c.name,
      ticker: c.ticker ?? '',
      direction: toDirection(c.impact),
    })),
    relevance: s.analysis.relevance_score,
    articleUrl: s.article_url ?? '',
    sectors: s.analysis.industries,
    regions: sourceToRegions(s.source),
    disclaimer: s.analysis.disclaimer,
  };
}

// ── Public fetch functions ──────────────────────────────────────────────────

export interface GetSignalsParams {
  limit?: number;
  offset?: number;
  source?: string;
  sentiment?: string;
  min_score?: number;
}

export async function getSignals(params: GetSignalsParams = {}): Promise<Signal[]> {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));
  if (params.source) qs.set('source', params.source);
  if (params.sentiment) qs.set('sentiment', params.sentiment);
  if (params.min_score !== undefined) qs.set('min_score', String(params.min_score));

  const url = `${API_BASE_URL}/signals${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data: ApiSignal[] = await res.json();
  return data.map(apiSignalToSignal);
}

export async function getSignal(id: number | string): Promise<Signal> {
  const res = await fetch(`${API_BASE_URL}/signals/${id}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data: ApiSignal = await res.json();
  return apiSignalToSignal(data);
}

// ── Stock endpoints ──────────────────────────────────────────────────────────

export interface StockSnapshot {
  ticker: string;
  price: number | null;
  pe_ratio: number | null;
  market_cap: number | null;
  target_price: number | null;
  eps_ttm: number | null;
  week52_high: number | null;
  week52_low: number | null;
  volume: number | null;
  fetched_at: string;
}

export async function getStockSnapshot(ticker: string): Promise<StockSnapshot | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/stocks/${ticker}/snapshot`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getTickerSignals(ticker: string, minScore = 6): Promise<Signal[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/stocks/${ticker}/signals?min_score=${minScore}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data: ApiSignal[] = await res.json();
    return data.map(apiSignalToSignal);
  } catch {
    return [];
  }
}

// ── Subscription tiers ───────────────────────────────────────────────────────

export interface Tier {
  id: string;
  name: string;
  price_monthly: number;
  max_stocks: number | null;
  custom_weights: boolean;
  digest_count: number;
  api_access: boolean;
}

export async function getTiers(): Promise<Tier[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/subscription/tiers`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tiers ?? [];
  } catch {
    return [];
  }
}

export async function createCheckout(
  userId: number,
  tier: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/subscription/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, tier, success_url: successUrl, cancel_url: cancelUrl }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.checkout_url ?? null;
  } catch {
    return null;
  }
}

// ── Watchlist (server-side sync) ─────────────────────────────────────────────

export async function syncWatchlistItem(
  userId: number,
  ticker: string,
  name: string,
  sector: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, name, sector }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface CompanyProfile {
  ticker: string
  company_name: string
  sector: string
  listed_market: string
  pricing_currency: string
  geo_exposure: Record<string, number>
  revenue_segments: Record<string, number>
  characteristics: Record<string, boolean | number>
}

export async function getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/company/${ticker}/profile`, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export async function syncWeights(
  userId: number,
  ticker: string,
  weights: Record<string, number>,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/watchlist/${ticker}/weights`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
