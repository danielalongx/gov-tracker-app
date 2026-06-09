import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { WatchlistItem, DimensionWeights, Signal } from '../types'
import { loadWeights } from '../utils/watchlist'
import DimensionWeightModal from '../components/DimensionWeightModal'
import { MOCK_SIGNALS } from '../data/mockSignals'
import SignalCard from '../components/SignalCard'
import { useLanguage } from '../hooks/useLanguage'
import { getStockSnapshot, getTickerSignals, StockSnapshot } from '../api/client'

interface Props {
  item: WatchlistItem
  onBack: () => void
}

function formatMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(0)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

const DEFAULT_WEIGHTS: DimensionWeights = {
  news: 7, financial: 6, regulatory: 5,
  pipeline: 5, capitalFlows: 6, technical: 3,
}

interface CausalStep {
  label: string;
  text: string;
  color: string;
}

const CAUSAL_CHAINS: Record<string, CausalStep[]> = {
  NVDA: [
    { label: '宏观触发', text: '美联储维持高利率', color: '#2563EB' },
    { label: '传导机制', text: 'AI算力需求不受利率压制', color: '#0D9488' },
    { label: '行业影响', text: '半导体/AI硬件 +强烈正向', color: '#D97706' },
    { label: '公司特征', text: 'NVDA 数据中心收入占比82%，直接受益', color: '#16A34A' },
  ],
  AAPL: [
    { label: '宏观触发', text: '美联储暗示降息时间表', color: '#2563EB' },
    { label: '传导机制', text: '消费信贷条件改善，终端需求回暖', color: '#0D9488' },
    { label: '行业影响', text: '消费电子/科技硬件 +温和正向', color: '#D97706' },
    { label: '公司特征', text: 'AAPL iPhone占收入54%，服务业务高毛利护城河', color: '#16A34A' },
  ],
  TSLA: [
    { label: '宏观触发', text: '欧洲能源政策转型加速', color: '#2563EB' },
    { label: '传导机制', text: 'EV补贴延续，充电基础设施投入增加', color: '#0D9488' },
    { label: '行业影响', text: '新能源汽车板块 +中性偏正', color: '#D97706' },
    { label: '公司特征', text: 'TSLA 欧洲市场份额竞争加剧，利润率承压', color: '#D97706' },
  ],
};

const DEFAULT_CAUSAL: CausalStep[] = [
  { label: '宏观触发', text: '全球利率政策趋于稳定', color: '#2563EB' },
  { label: '传导机制', text: '资本成本改善，风险资产估值修复', color: '#0D9488' },
  { label: '行业影响', text: '科技板块整体受益于流动性改善', color: '#D97706' },
  { label: '公司特征', text: '基本面稳健，与宏观趋势正相关', color: '#16A34A' },
];

function CausalChain({ ticker }: { ticker: string }) {
  const steps = CAUSAL_CHAINS[ticker] ?? DEFAULT_CAUSAL;
  return (
    <View>
      {steps.map((step, i) => (
        <View key={i} style={chainStyles.step}>
          <View style={chainStyles.left}>
            <View style={[chainStyles.dot, { backgroundColor: step.color }]} />
            {i < steps.length - 1 && <View style={chainStyles.line} />}
          </View>
          <View style={chainStyles.content}>
            <Text style={[chainStyles.stepLabel, { color: step.color }]}>{step.label}</Text>
            <Text style={chainStyles.stepText}>{step.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const chainStyles = StyleSheet.create({
  step: { flexDirection: 'row', minHeight: 52 },
  left: { width: 24, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  line: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginVertical: 2 },
  content: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  stepLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, marginBottom: 2 },
  stepText: { fontSize: 13, color: '#374151', lineHeight: 18 },
});

const DIM_LABELS: Record<keyof DimensionWeights, string> = {
  news: '消息面',
  financial: '财务面',
  regulatory: '政策面',
  pipeline: 'Pipeline',
  capitalFlows: '资金面',
  technical: '技术面',
}

function WeightBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.weightRow}>
      <Text style={styles.weightLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${value * 10}%` }]} />
      </View>
      <Text style={styles.weightValue}>{value}/10</Text>
    </View>
  )
}

export function StockDetailScreen({ item, onBack }: Props) {
  const lang = useLanguage()
  const [weights, setWeights] = useState<DimensionWeights>(DEFAULT_WEIGHTS)
  const [showModal, setShowModal] = useState(false)
  const [liveSnapshot, setLiveSnapshot] = useState<StockSnapshot | null>(null)
  const [liveSignals, setLiveSignals] = useState<Signal[] | null>(null)

  useEffect(() => {
    loadWeights(item.ticker).then(w => { if (w) setWeights(w) })
  }, [item.ticker])

  useEffect(() => {
    Promise.all([
      getStockSnapshot(item.ticker),
      getTickerSignals(item.ticker),
    ]).then(([snap, sigs]) => {
      setLiveSnapshot(snap)
      setLiveSignals(sigs.length > 0 ? sigs : null)
    }).catch(() => {})
  }, [item.ticker])

  const relatedSignals: Signal[] = liveSignals ?? MOCK_SIGNALS.filter(s =>
    s.companies?.some(c => c.ticker === item.ticker) ||
    s.tickers?.includes(item.ticker)
  ).slice(0, 5)

  // Use live price if available, fallback to mock
  const displayPrice = liveSnapshot?.price ?? item.mockPrice ?? 0
  const displayPE = liveSnapshot?.pe_ratio ?? item.mockPE ?? 0
  const displayMktCap = liveSnapshot?.market_cap
    ? formatMarketCap(liveSnapshot.market_cap)
    : (item.mockMarketCap ?? '--')
  const isLive = !!liveSnapshot?.price

  const isUp = (item.mockChange ?? 0) >= 0

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTicker}>{item.ticker}</Text>
          <Text style={styles.headerName} numberOfLines={1}>{item.name}</Text>
        </View>
        <View style={[styles.sectorBadge]}>
          <Text style={styles.sectorText}>{item.sector}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow2}>
            <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
            {isLive && <View style={styles.liveDot}><Text style={styles.liveText}>实时</Text></View>}
          </View>
          <View style={[styles.changePill, { backgroundColor: isUp ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.changeText, { color: isUp ? theme.colors.bullish : theme.colors.bearish }]}>
              {isUp ? '+' : ''}{(item.mockChange ?? 0).toFixed(2)}%
            </Text>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>P/E</Text>
              <Text style={styles.metricValue}>{displayPE.toFixed(1)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>市值</Text>
              <Text style={styles.metricValue}>{displayMktCap}</Text>
            </View>
            {liveSnapshot?.week52_high && (
              <>
                <View style={styles.metricDivider} />
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>52W高</Text>
                  <Text style={styles.metricValue}>${liveSnapshot.week52_high.toFixed(0)}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Dimension weights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>维度权重</Text>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text style={styles.editBtn}>编辑</Text>
            </TouchableOpacity>
          </View>
          {(Object.keys(DIM_LABELS) as (keyof DimensionWeights)[]).map(k => (
            <WeightBar key={k} label={DIM_LABELS[k]} value={weights[k]} />
          ))}
        </View>

        {/* Causal Chain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>传导链</Text>
          <CausalChain ticker={item.ticker} />
        </View>

        {/* Related signals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>相关信号</Text>
          {relatedSignals.length === 0 ? (
            <View style={styles.emptySignals}>
              <Text style={styles.emptySignalsText}>暂无相关信号</Text>
            </View>
          ) : (
            relatedSignals.map(s => (
              <SignalCard key={s.id} signal={s} lang={lang} />
            ))
          )}
        </View>
      </ScrollView>

      {showModal && (
        <DimensionWeightModal
          item={item}
          onClose={() => {
            setShowModal(false)
            loadWeights(item.ticker).then(w => { if (w) setWeights(w) })
          }}
          lang={lang}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backArrow: { fontSize: 20, color: theme.colors.textSecondary, marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTicker: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
  headerName: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  sectorBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  sectorText: { fontSize: 11, color: theme.colors.accentBlue },
  content: { padding: 16, gap: 16 },
  priceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: theme.colors.border,
    alignItems: 'flex-start', gap: 12,
  },
  priceRow2: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 32, fontWeight: '300', color: theme.colors.textPrimary },
  liveDot: {
    backgroundColor: '#DCFCE7', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  liveText: { fontSize: 10, color: '#16A34A', fontWeight: '600' },
  changePill: {
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  changeText: { fontSize: 13, fontWeight: '500' },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  metric: { alignItems: 'center', paddingHorizontal: 16 },
  metricLabel: { fontSize: 11, color: theme.colors.textSecondary },
  metricValue: { fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary, marginTop: 2 },
  metricDivider: { width: 1, height: 28, backgroundColor: theme.colors.border },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: theme.colors.border, gap: 12,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
  editBtn: { fontSize: 13, color: theme.colors.accentBlue },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weightLabel: { width: 62, fontSize: 12, color: theme.colors.textSecondary },
  barTrack: {
    flex: 1, height: 6, backgroundColor: theme.colors.border,
    borderRadius: 3, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: theme.colors.accentBlue, borderRadius: 3 },
  weightValue: { width: 32, fontSize: 12, color: theme.colors.textSecondary, textAlign: 'right' },
  emptySignals: { paddingVertical: 20, alignItems: 'center' },
  emptySignalsText: { fontSize: 13, color: theme.colors.textSecondary },
})
