import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { Tier, getTiers, createCheckout } from '../api/client'
import { useLanguage } from '../hooks/useLanguage'

const FEATURE_LABELS: Record<string, string> = {
  max_stocks_3: '追踪最多 3 只股票',
  max_stocks_20: '追踪最多 20 只股票',
  max_stocks_unlimited: '无限股票追踪',
  fixed_weights: '固定维度权重',
  custom_weights: '自定义维度权重',
  digest_1: '每日 1 次推送',
  digest_3: '每日 3 次推送',
  delay_4hr: '延迟 4 小时',
  realtime: '近实时推送',
  api_no: '无 API 访问',
  api_yes: 'API 访问 + 数据导出',
  disclaimer: '仅供参考，非投资建议',
}

function TierCard({
  tier,
  current,
  onUpgrade,
}: {
  tier: Tier
  current: boolean
  onUpgrade: (t: Tier) => void
}) {
  const isPro = tier.id === 'pro'
  const isAnalyst = tier.id === 'analyst'
  const isFree = tier.id === 'free'

  const features: string[] = []
  if (tier.max_stocks === null) features.push(FEATURE_LABELS.max_stocks_unlimited)
  else if (tier.max_stocks === 20) features.push(FEATURE_LABELS.max_stocks_20)
  else features.push(FEATURE_LABELS.max_stocks_3)

  features.push(tier.custom_weights ? FEATURE_LABELS.custom_weights : FEATURE_LABELS.fixed_weights)
  features.push(tier.digest_count >= 3 ? FEATURE_LABELS.digest_3 : FEATURE_LABELS.digest_1)
  features.push(isFree ? FEATURE_LABELS.delay_4hr : FEATURE_LABELS.realtime)
  features.push(tier.api_access ? FEATURE_LABELS.api_yes : FEATURE_LABELS.api_no)
  features.push(FEATURE_LABELS.disclaimer)

  return (
    <View style={[
      styles.card,
      isPro && styles.cardPro,
      current && styles.cardCurrent,
    ]}>
      {isPro && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>最受欢迎</Text>
        </View>
      )}
      <View style={styles.cardHeader}>
        <Text style={styles.tierName}>{tier.name}</Text>
        {current && <View style={styles.activePill}><Text style={styles.activeText}>当前</Text></View>}
      </View>

      <View style={styles.priceRow}>
        {tier.price_monthly === 0 ? (
          <Text style={styles.priceText}>免费</Text>
        ) : (
          <>
            <Text style={styles.priceCurrency}>$</Text>
            <Text style={styles.priceText}>{tier.price_monthly.toFixed(2)}</Text>
            <Text style={styles.pricePeriod}>/月</Text>
          </>
        )}
      </View>

      <View style={styles.featureList}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={[
              styles.featureDot,
              f.includes('无') || f.includes('延迟') || f.includes('固定') ? styles.dotGrey : styles.dotBlue,
            ]}>•</Text>
            <Text style={[
              styles.featureText,
              (f.includes('无') || f.includes('延迟') || f.includes('固定')) && styles.featureTextDim,
            ]}>{f}</Text>
          </View>
        ))}
      </View>

      {!current && !isFree && (
        <TouchableOpacity
          style={[styles.upgradeBtn, isPro && styles.upgradeBtnPrimary]}
          onPress={() => onUpgrade(tier)}
        >
          <Text style={[styles.upgradeBtnText, isPro && styles.upgradeBtnTextPrimary]}>
            升级到 {tier.name}
          </Text>
        </TouchableOpacity>
      )}

      {isFree && !current && (
        <Text style={styles.freeNote}>当前使用免费版</Text>
      )}
    </View>
  )
}

export function SubscriptionScreen({ onBack }: { onBack?: () => void }) {
  const lang = useLanguage()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const currentTier = 'free' // TODO: load from user profile

  useEffect(() => {
    getTiers()
      .then(t => setTiers(t.length ? t : FALLBACK_TIERS))
      .finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async (tier: Tier) => {
    setUpgrading(tier.id)
    try {
      const url = await createCheckout(
        1, // user_id — TODO: load from profile
        tier.id,
        'signal://payment/success',
        'signal://payment/cancel',
      )
      if (url) {
        await Linking.openURL(url)
      } else {
        // Stripe not configured — show a message
        alert('支付功能即将开放，敬请期待。')
      }
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>订阅计划</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          选择适合你的计划，随时可以升级或降级
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.colors.accentBlue} style={{ marginTop: 40 }} />
        ) : (
          tiers.map(t => (
            <TierCard
              key={t.id}
              tier={t}
              current={t.id === currentTier}
              onUpgrade={handleUpgrade}
            />
          ))
        )}

        <Text style={styles.legalNote}>
          ⚠️ 本平台所有内容仅供参考，不构成投资建议。
          升级订阅不改变此声明。投资有风险，入市需谨慎。
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

// Fallback if API is unreachable
const FALLBACK_TIERS: Tier[] = [
  { id: 'free', name: '免费版', price_monthly: 0, max_stocks: 3, custom_weights: false, digest_count: 1, api_access: false },
  { id: 'pro', name: 'Pro', price_monthly: 9.99, max_stocks: 20, custom_weights: true, digest_count: 3, api_access: false },
  { id: 'analyst', name: 'Analyst', price_monthly: 29.99, max_stocks: null, custom_weights: true, digest_count: 3, api_access: true },
]

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  back: { fontSize: 20, color: theme.colors.textSecondary },
  title: { fontSize: 17, fontWeight: '600', color: theme.colors.textPrimary },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: theme.colors.border,
    gap: 16, position: 'relative', overflow: 'hidden',
  },
  cardPro: { borderColor: theme.colors.accentBlue, borderWidth: 1.5 },
  cardCurrent: { backgroundColor: '#FAFEF7' },
  popularBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: theme.colors.accentBlue,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  popularText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tierName: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary },
  activePill: {
    backgroundColor: '#DCFCE7', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  activeText: { fontSize: 11, color: '#16A34A', fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  priceCurrency: { fontSize: 16, color: theme.colors.textPrimary, marginBottom: 4 },
  priceText: { fontSize: 32, fontWeight: '300', color: theme.colors.textPrimary },
  pricePeriod: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 6 },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  featureDot: { fontSize: 14, lineHeight: 20 },
  dotBlue: { color: theme.colors.accentBlue },
  dotGrey: { color: theme.colors.textSecondary },
  featureText: { fontSize: 13, color: theme.colors.textPrimary, flex: 1, lineHeight: 20 },
  featureTextDim: { color: theme.colors.textSecondary },
  upgradeBtn: {
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.accentBlue,
  },
  upgradeBtnPrimary: {
    backgroundColor: theme.colors.accentBlue, borderColor: theme.colors.accentBlue,
  },
  upgradeBtnText: { fontSize: 15, fontWeight: '600', color: theme.colors.accentBlue },
  upgradeBtnTextPrimary: { color: '#fff' },
  freeNote: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' },
  legalNote: {
    fontSize: 11, color: theme.colors.textSecondary,
    textAlign: 'center', lineHeight: 16,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
})
