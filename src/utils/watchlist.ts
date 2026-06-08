import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchlistItem, DimensionWeights, DimensionScores } from '../types';

const WATCHLIST_KEY = 'watchlist';

export const DEFAULT_WEIGHTS: DimensionWeights = {
  news: 7,
  financial: 6,
  regulatory: 5,
  pipeline: 5,
  capitalFlows: 6,
  technical: 3,
};

export async function loadWatchlist(): Promise<WatchlistItem[]> {
  const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
  return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
}

export async function saveWatchlist(items: WatchlistItem[]): Promise<void> {
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
}

export async function loadWeights(ticker: string): Promise<DimensionWeights> {
  const raw = await AsyncStorage.getItem(`watchlist_weights_${ticker}`);
  return raw ? (JSON.parse(raw) as DimensionWeights) : { ...DEFAULT_WEIGHTS };
}

export async function saveWeights(ticker: string, weights: DimensionWeights): Promise<void> {
  await AsyncStorage.setItem(`watchlist_weights_${ticker}`, JSON.stringify(weights));
}

export function computePersonalScore(
  dimensionScores: DimensionScores,
  weights: DimensionWeights,
): number | null {
  const keys: (keyof DimensionWeights)[] = [
    'news', 'financial', 'regulatory', 'pipeline', 'capitalFlows', 'technical',
  ];
  let wSum = 0;
  let total = 0;
  for (const k of keys) {
    const score = dimensionScores[k as keyof DimensionScores];
    if (score !== undefined) {
      wSum  += score * weights[k];
      total += weights[k];
    }
  }
  return total > 0 ? Math.round((wSum / total) * 10) / 10 : null;
}
