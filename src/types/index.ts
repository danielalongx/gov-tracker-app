export type Direction = 'up' | 'down' | 'neutral';
export type Sentiment = 'bullish' | 'bearish' | 'mixed' | 'neutral';

export interface AffectedCompany {
  name: string;
  ticker: string;
  direction: Direction;
}

export interface Signal {
  id: string;
  source: string;
  publishedAt: string; // ISO 8601
  sentiment: Sentiment;
  headline: string;
  affectedCompanies: AffectedCompany[];
  relevance: number; // 1–10
  articleUrl: string;
  sectors: string[];
  regions: string[];
  disclaimer?: string;      // backend-supplied legal disclaimer (guru/ARK signals)
  dimension_scores?: DimensionScores; // optional per-dimension signal scores
}

export interface DimensionScores {
  news?: number;
  financial?: number;
  regulatory?: number;
  pipeline?: number;
  capitalFlows?: number;
  technical?: number;
}

export interface DimensionWeights {
  news: number;
  financial: number;
  regulatory: number;
  pipeline: number;
  capitalFlows: number;
  technical: number;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  sector: string;
  addedAt: string; // ISO 8601
  mockPrice?: number;
  mockChange?: number;
  mockPE?: number;
  mockMarketCap?: string;
}

export interface UserPreferences {
  experienceLevel: number; // 1–10
  riskTolerance: number;   // 1–10
  regions: string[];
  sectors: string[];
  notificationTimes: string[]; // '08:00' | '12:00' | '20:00'
  followedGurus?: string[];    // display labels; undefined = all followed
  language?: string;           // summary language code, default 'zh'
}
