import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, CardShadow } from '../theme';

// Same deterministic hash as WatchlistScreen
function getMockForce(ticker: string): { bullish: number; bearish: number } {
  const code = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return { bullish: (code % 4) + 2, bearish: code % 3 };
}

const DRIVERS = [
  '宏观触发: 利率预期',
  '资金面: 机构买入',
  '消息面: 财报超预期',
  '技术面: 趋势突破',
  '政策面: 行业利好',
  '资金面: 大额流入',
  '宏观触发: 美元走弱',
  '消息面: 产品发布',
];

function getMockDriver(ticker: string): string {
  const code = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DRIVERS[code % DRIVERS.length];
}

interface TickerInfo {
  ticker: string;
  name: string;
}

const SIMULATION_STOCKS: TickerInfo[] = [
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'META', name: 'Meta' },
  { ticker: 'JPM', name: 'JPMorgan Chase' },
  { ticker: 'TSM', name: 'TSMC' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway B' },
  { ticker: 'BABA', name: 'Alibaba' },
  { ticker: 'TCEHY', name: 'Tencent' },
  { ticker: 'ASML', name: 'ASML' },
  { ticker: 'LVMH', name: 'LVMH' },
  { ticker: 'SONY', name: 'Sony' },
  { ticker: 'NFLX', name: 'Netflix' },
  { ticker: 'V', name: 'Visa' },
  { ticker: 'WMT', name: 'Walmart' },
  { ticker: 'UNH', name: 'UnitedHealth' },
  { ticker: 'AMD', name: 'AMD' },
];

const MAX_PICKS = 10;

export default function SimulationScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<TickerInfo[] | null>(null);

  const toggleTicker = (ticker: string) => {
    if (results) setResults(null);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else if (next.size < MAX_PICKS) {
        next.add(ticker);
      }
      return next;
    });
  };

  const runSimulation = () => {
    setResults(SIMULATION_STOCKS.filter(s => selected.has(s.ticker)));
  };

  const resetSimulation = () => {
    setSelected(new Set());
    setResults(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>信号模拟</Text>
        <Text style={styles.subtitle}>选择最多10支股票，查看信号力预测</Text>

        {/* Company Picker */}
        <Text style={styles.sectionLabel}>
          {results ? '已选股票' : `选择股票${selected.size > 0 ? `  ${selected.size}/10` : ''}`}
        </Text>
        <View style={styles.chipsGrid}>
          {SIMULATION_STOCKS.map(stock => {
            const isSelected = selected.has(stock.ticker);
            const isDisabled = !isSelected && selected.size >= MAX_PICKS;
            return (
              <TouchableOpacity
                key={stock.ticker}
                onPress={() => !isDisabled && toggleTicker(stock.ticker)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  isDisabled && styles.chipDisabled,
                ]}
              >
                <Text style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  isDisabled && styles.chipTextDisabled,
                ]}>
                  {stock.ticker}
                </Text>
                {isSelected && <Text style={styles.chipCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Run button */}
        {!results && (
          <TouchableOpacity
            onPress={runSimulation}
            style={[styles.runBtn, selected.size === 0 && styles.runBtnDisabled]}
            disabled={selected.size === 0}
            activeOpacity={0.8}
          >
            <Text style={[styles.runBtnText, selected.size === 0 && styles.runBtnTextDisabled]}>
              运行模拟
            </Text>
          </TouchableOpacity>
        )}

        {/* Results */}
        {results && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>模拟结果</Text>
            {results.map(stock => {
              const force = getMockForce(stock.ticker);
              const isBullish = force.bullish >= force.bearish;
              const driver = getMockDriver(stock.ticker);
              return (
                <View key={stock.ticker} style={[styles.resultCard, CardShadow]}>
                  <View style={styles.resultTop}>
                    <View style={styles.resultLeft}>
                      <Text style={styles.resultTicker}>{stock.ticker}</Text>
                      <Text style={styles.resultName}>{stock.name}</Text>
                    </View>
                    <View style={[styles.directionBadge, isBullish ? styles.bullBadge : styles.bearBadge]}>
                      <Text style={[styles.directionText, isBullish ? styles.bullText : styles.bearText]}>
                        {isBullish ? '看多' : '看空'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.forceLabel}>信号力</Text>
                  <View style={styles.forceBarTrack}>
                    <View style={[styles.forceBarBull, { flex: force.bullish }]} />
                    {force.bearish > 0 && (
                      <View style={[styles.forceBarBear, { flex: force.bearish }]} />
                    )}
                  </View>
                  <View style={styles.forceFooter}>
                    <Text style={styles.forceBullText}>+{force.bullish} 看多</Text>
                    {force.bearish > 0 && (
                      <Text style={styles.forceBearText}>-{force.bearish} 看空</Text>
                    )}
                  </View>

                  <View style={styles.driverRow}>
                    <Text style={styles.driverLabel}>主要驱动</Text>
                    <Text style={styles.driverValue}>{driver}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity onPress={resetSimulation} style={styles.resetBtn} activeOpacity={0.8}>
              <Text style={styles.resetBtnText}>重新模拟</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.disclaimer}>⚠️ 模拟数据仅供演示，非实际信号分析结果</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  // Chips
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.accentBlue,
    backgroundColor: Colors.accentBlue + '18',
  },
  chipDisabled: { opacity: 0.35 },
  chipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  chipTextSelected: { color: Colors.accentBlue },
  chipTextDisabled: { color: Colors.textSecondary },
  chipCheck: { fontSize: 11, color: Colors.accentBlue },

  // Buttons
  runBtn: {
    backgroundColor: Colors.accentBlue,
    borderRadius: Radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  runBtnDisabled: { backgroundColor: Colors.border },
  runBtnText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  runBtnTextDisabled: { color: Colors.textSecondary },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    borderRadius: Radius.button,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.accentBlue },

  // Result cards
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  resultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultLeft: { flex: 1, gap: 2 },
  resultTicker: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  resultName: { fontSize: 13, color: Colors.textSecondary },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bullBadge: { backgroundColor: '#DCFCE7' },
  bearBadge: { backgroundColor: '#FEE2E2' },
  directionText: { fontSize: 13, fontWeight: '600' },
  bullText: { color: Colors.bullish },
  bearText: { color: Colors.bearish },
  forceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  forceBarTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  forceBarBull: { backgroundColor: '#16A34A' },
  forceBarBear: { backgroundColor: '#DC2626' },
  forceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forceBullText: { fontSize: 11, color: Colors.bullish, fontWeight: '500' },
  forceBearText: { fontSize: 11, color: Colors.bearish, fontWeight: '500' },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  driverLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  driverValue: { fontSize: 13, color: Colors.textPrimary },

  disclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 16,
  },
});
