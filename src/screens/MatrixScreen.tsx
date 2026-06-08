import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, CardShadow } from '../theme';
import { MATRIX_DATA, MatrixEntry } from '../data/matrixData';
import { StockDetailScreen } from '../screens/StockDetailScreen';
import { WatchlistItem } from '../types';

const SCREEN_W = Dimensions.get('window').width;
const H_PAD = Spacing.lg;       // 24
const CARD_GAP = Spacing.sm;    // 8
const CARD_W = (SCREEN_W - H_PAD * 2 - CARD_GAP) / 2;

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // emerald
  if (score >= 60) return '#2563EB'; // blue
  if (score >= 40) return '#F59E0B'; // amber
  return '#9CA3AF';                  // gray
}

function sectorBg(score: number): string {
  if (score >= 80) return '#D1FAE5';
  if (score >= 60) return '#DBEAFE';
  if (score >= 40) return '#FEF3C7';
  return '#F3F4F6';
}

function entryToWatchlistItem(e: MatrixEntry): WatchlistItem {
  return {
    ticker: e.ticker,
    name: e.name,
    sector: e.sector,
    addedAt: new Date().toISOString(),
    mockPrice: e.mockPrice,
    mockChange: e.mockChange,
    mockPE: e.mockPE,
    mockMarketCap: e.mockMarketCap,
  };
}

// ── Trend arrow ───────────────────────────────────────────────────────────────

function TrendArrow({ trend }: { trend: MatrixEntry['trend'] }) {
  const glyph = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const color = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF';
  return <Text style={{ fontSize: 14, color, fontWeight: '600' }}>{glyph}</Text>;
}

// ── Matrix card ───────────────────────────────────────────────────────────────

function MatrixCard({
  entry,
  rank,
  onPress,
}: {
  entry: MatrixEntry;
  rank: number;
  onPress: () => void;
}) {
  const isTop5 = rank <= 5;
  const color = scoreColor(entry.score);

  return (
    <TouchableOpacity
      style={[styles.card, isTop5 && styles.cardGold]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      {/* Rank badge */}
      {isTop5 && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}># {rank}</Text>
        </View>
      )}

      {/* Header: ticker + trend */}
      <View style={styles.cardRow}>
        <Text style={[styles.ticker, isTop5 && styles.tickerGold]} numberOfLines={1}>
          {entry.ticker}
        </Text>
        <TrendArrow trend={entry.trend} />
      </View>

      {/* Company name */}
      <Text style={styles.name} numberOfLines={2}>{entry.name}</Text>

      {/* Sector chip */}
      <View style={[styles.sectorChip, { backgroundColor: sectorBg(entry.score) }]}>
        <Text style={[styles.sectorLabel, { color }]}>{entry.sector}</Text>
      </View>

      {/* Score bar */}
      <View style={styles.scoreRow}>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${entry.score}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={[styles.scoreNum, { color }]}>{entry.score}</Text>
      </View>

      {/* Signal count */}
      <Text style={styles.sigCount}>{entry.signalCount} 条信号</Text>

      {/* Top signal hint */}
      {entry.topSignal && (
        <Text style={styles.topSignal} numberOfLines={2}>{entry.topSignal}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function MatrixScreen() {
  const [selected, setSelected] = useState<MatrixEntry | null>(null);

  const sorted = useMemo(
    () => [...MATRIX_DATA].sort((a, b) => b.score - a.score),
    [],
  );

  if (selected) {
    return (
      <StockDetailScreen
        item={entryToWatchlistItem(selected)}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>矩阵</Text>
        <Text style={styles.headerSub}>信号热度排名 · 近90天</Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { label: '80–100', color: '#10B981' },
          { label: '60–79',  color: '#2563EB' },
          { label: '40–59',  color: '#F59E0B' },
          { label: '<40',    color: '#9CA3AF' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.ticker}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <MatrixCard
            entry={item}
            rank={index + 1}
            onPress={() => setSelected(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: H_PAD,
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
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  legend: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: H_PAD,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontSize: 11, color: Colors.textSecondary },

  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },

  // ── Card ──────────────────────────────────────────────────────────────────

  card: {
    width: CARD_W,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...CardShadow,
  },
  cardGold: {
    borderColor: '#C9A84C',
    backgroundColor: '#FDFAF0',
  },

  rankBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C9A84C',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.2,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  ticker: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  tickerGold: { color: '#92700A' },

  name: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 15,
  },

  sectorChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.chip,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: Spacing.sm,
  },
  sectorLabel: { fontSize: 10, fontWeight: '600' },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  barTrack: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreNum: {
    fontSize: 13,
    fontWeight: '700',
    width: 26,
    textAlign: 'right',
  },

  sigCount: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  topSignal: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 5,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});
