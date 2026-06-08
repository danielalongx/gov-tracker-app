import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Signal } from '../types';
import { MOCK_SIGNALS } from '../data/mockSignals';
import { getSignals } from '../api/client';
import { loadPreferences } from '../utils/storage';
import { loadWatchlist, loadWeights, computePersonalScore, DEFAULT_WEIGHTS } from '../utils/watchlist';
import { DimensionWeights, WatchlistItem } from '../types';
import { getNextPushTime } from '../utils/notifications';
import { isGuruSource } from '../utils/guruNames';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import SignalCard from '../components/SignalCard';
import SkeletonCard from '../components/SkeletonCard';
import { Colors, Spacing, Radius } from '../theme';

// ── Clock icon (pure-geometry, no icon lib) ──────────────────────────────────

function ClockIcon({ size = 44, color = Colors.neutral }: { size?: number; color?: string }) {
  const r = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      {/* Outer ring */}
      <View
        style={{
          position: 'absolute',
          width: size, height: size,
          borderRadius: r,
          borderWidth: 2,
          borderColor: color,
        }}
      />
      {/* Minute hand — pointing to 12 (up from center) */}
      <View
        style={{
          position: 'absolute',
          width: 2,
          height: r * 0.64,
          backgroundColor: color,
          borderRadius: 1,
          top: r - r * 0.64,
          left: r - 1,
        }}
      />
      {/* Hour hand — pointing to 3 (right from center) */}
      <View
        style={{
          position: 'absolute',
          height: 2,
          width: r * 0.52,
          backgroundColor: color,
          borderRadius: 1,
          top: r - 1,
          left: r,
        }}
      />
      {/* Center dot */}
      <View
        style={{
          position: 'absolute',
          width: 4, height: 4,
          borderRadius: 2,
          backgroundColor: color,
          top: r - 2, left: r - 2,
        }}
      />
    </View>
  );
}

// ── Filter bar ───────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'guru' | 'institutional' | 'industry' | 'macro' | 'topic';

const FILTER_KEYS: { key: FilterKey; label: string; dot: string | null }[] = [
  { key: 'all',          label: '全部', dot: null },
  { key: 'guru',         label: 'Guru', dot: Colors.accentGold },
  { key: 'institutional', label: '机构', dot: '#2563EB' },
  { key: 'industry',     label: '产业', dot: '#16A34A' },
  { key: 'macro',        label: '宏观', dot: '#7C3AED' },
  { key: 'topic',        label: '话题', dot: '#EF4444' },
];

function FilterBar({ active, onSelect }: { active: FilterKey; onSelect: (k: FilterKey) => void }) {
  return (
    <View style={filterStyles.outerWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={filterStyles.row}
        style={filterStyles.scroll}
      >
        {FILTER_KEYS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => onSelect(f.key)}
            activeOpacity={0.7}
            style={[filterStyles.chip, active === f.key && filterStyles.chipActive]}
          >
            <Text
              numberOfLines={1}
              style={[filterStyles.label, active === f.key && filterStyles.labelActive]}
            >
              {f.label}
            </Text>
            {f.dot !== null && (
              <View style={[filterStyles.dot, { backgroundColor: f.dot }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const filterStyles = StyleSheet.create({
  outerWrap: {
    height: 44,
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    height: 44,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 4,
  },
  chipActive: { borderColor: Colors.accentBlue },
  label: { fontSize: 14, color: Colors.textSecondary },
  labelActive: { color: Colors.textPrimary, fontWeight: '500' },
});

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ nextPushTime, lang }: { nextPushTime: string | null; lang: string }) {
  return (
    <View style={styles.empty}>
      <ClockIcon size={44} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('empty_state_title', lang)}</Text>
      <Text style={styles.emptySub}>
        {nextPushTime
          ? `${t('empty_state_next_push', lang)}${nextPushTime}`
          : t('empty_state_pull', lang)}
      </Text>
    </View>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>⚠ {message}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const lang = useLanguage();
  const [signals,      setSignals]      = useState<Signal[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,       setFilter]       = useState<FilterKey>('all');
  const [rawTimes,     setRawTimes]     = useState<string[]>([]);
  const [wlWeights,    setWlWeights]    = useState<Record<string, DimensionWeights>>({});
  const [wlTickers,    setWlTickers]    = useState<Set<string>>(new Set());

  const filteredSignals = useMemo(() => {
    const MACRO_KW = ['GDP', 'CPI', 'employment', 'interest rate', 'Fed',
      '美联储', '就业', '通胀', '利率', '降准', '降息', '货币政策'];

    const isGuru = (s: Signal) => isGuruSource(s.source);
    const isInstitutional = (s: Signal) =>
      !isGuru(s) && (
        s.source.toLowerCase().includes('etf') ||
        s.source.toLowerCase().includes('fund') ||
        s.source.toLowerCase().includes('ark')
      );
    const isIndustry = (s: Signal) => s.sectors.length > 0 && !isGuru(s);
    const isMacro = (s: Signal) => MACRO_KW.some(kw => s.headline.includes(kw));

    switch (filter) {
      case 'all':          return signals;
      case 'guru':         return signals.filter(isGuru);
      case 'institutional': return signals.filter(isInstitutional);
      case 'industry':     return signals.filter(isIndustry);
      case 'macro':        return signals.filter(isMacro);
      case 'topic': {
        const categorized = new Set(
          signals.filter(s => isGuru(s) || isInstitutional(s) || isMacro(s)).map(s => s.id),
        );
        return signals
          .filter(s => s.relevance >= 8 && !categorized.has(s.id))
          .sort((a, b) => b.relevance - a.relevance);
      }
      default: return signals;
    }
  }, [signals, filter]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const data = await getSignals({ limit: 40, min_score: 6 });
      setSignals(data);
    } catch {
      setSignals(MOCK_SIGNALS);
      setError(t('feed_no_server', lang));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Notification times
  useEffect(() => {
    loadPreferences().then(p => setRawTimes(p?.notificationTimes ?? []));
  }, []);

  // Watchlist weights for personal score
  useEffect(() => {
    loadWatchlist().then(async (items: WatchlistItem[]) => {
      setWlTickers(new Set(items.map(i => i.ticker)));
      const map: Record<string, DimensionWeights> = {};
      await Promise.all(items.map(async i => {
        map[i.ticker] = await loadWeights(i.ticker);
      }));
      setWlWeights(map);
    });
  }, []);

  const nextPushTime = rawTimes.length > 0
    ? getNextPushTime(rawTimes, t('today', lang), t('tomorrow', lang))
    : null;

  const onRefresh = useCallback(() => load(true), [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('feed_title', lang)}</Text>
      </View>

      {error && <ErrorBanner message={error} />}

      {!loading && (
        <>
          <FilterBar active={filter} onSelect={setFilter} />
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              {t('feed_signal_count', lang, { count: filteredSignals.length })}
            </Text>
          </View>
        </>
      )}

      {loading ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <SkeletonCard />
          <View style={styles.separator} />
          <SkeletonCard />
          <View style={styles.separator} />
          <SkeletonCard />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredSignals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const matchTicker = item.affectedCompanies.find(c => wlTickers.has(c.ticker))?.ticker;
            const personalScore = (matchTicker && item.dimension_scores)
              ? computePersonalScore(item.dimension_scores, wlWeights[matchTicker] ?? DEFAULT_WEIGHTS)
              : null;
            return <SignalCard signal={item} lang={lang} personalScore={personalScore} />;
          }}
          contentContainerStyle={[
            styles.list,
            filteredSignals.length === 0 && styles.listEmpty,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState nextPushTime={nextPushTime} lang={lang} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accentBlue}
              colors={[Colors.accentBlue]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  errorText: { fontSize: 12, color: '#664D03' },
  countRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 2,
  },
  countText: { fontSize: 12, color: Colors.textSecondary },
  list: { padding: Spacing.lg },
  listEmpty: { flex: 1 },
  separator: { height: Spacing.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
});
