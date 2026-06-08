import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Signal, Sentiment, Direction } from '../types';
import { Colors, Spacing, Radius, CardShadow } from '../theme';
import { timeAgo } from '../utils/time';
import { isGuruSource, guruDisplayName } from '../utils/guruNames';
import { t, rtlStyle } from '../i18n';

// SENTIMENT_CONFIG is built inside the component (depends on lang).

const SENTIMENT_BORDER: Record<Sentiment, string> = {
  bullish: Colors.bullish,
  bearish: Colors.bearish,
  mixed:   Colors.neutral,
  neutral: Colors.border,
};

const DIRECTION_ARROW: Record<Direction, string> = {
  up:      '↑',
  down:    '↓',
  neutral: '→',
};

const REGION_FLAGS: Record<string, string> = {
  '美国': '🇺🇸',
  '欧洲': '🇪🇺',
  '中国': '🇨🇳',
  '丹麦': '🇩🇰',
  '全部': '🌍',
};

function regionFlag(regions: string[]): string {
  for (const r of regions) {
    if (REGION_FLAGS[r]) return REGION_FLAGS[r];
  }
  return '';
}

interface Props {
  signal: Signal;
  lang?: string;
  personalScore?: number | null;
}

export default function SignalCard({ signal, lang = 'zh', personalScore }: Props) {
  const isGuru = isGuruSource(signal.source);
  const rtl = rtlStyle(lang);
  const SENTIMENT_CONFIG: Record<Sentiment, { emoji: string; label: string; color: string }> = {
    bullish: { emoji: '📈', label: t('sentiment_bullish', lang), color: Colors.bullish },
    bearish: { emoji: '📉', label: t('sentiment_bearish', lang), color: Colors.bearish },
    mixed:   { emoji: '↕️',  label: t('sentiment_mixed',   lang), color: Colors.neutral },
    neutral: { emoji: '➡️',  label: t('sentiment_neutral', lang), color: Colors.neutral },
  };
  const sentiment = SENTIMENT_CONFIG[signal.sentiment];
  const flag = isGuru ? '' : regionFlag(signal.regions);
  const leftBorderColor = isGuru
    ? Colors.accentGold
    : SENTIMENT_BORDER[signal.sentiment];

  const openArticle = () => {
    if (signal.articleUrl) {
      Linking.openURL(signal.articleUrl).catch(() => null);
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: leftBorderColor }]}>

      {/* ── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.meta} numberOfLines={1}>
          {isGuru
            ? <Text style={styles.guruIcon}>{'👤 '}</Text>
            : (flag ? <Text>{flag}{' '}</Text> : null)
          }
          <Text style={[styles.source, isGuru && styles.sourceGuru]}>
            {isGuru ? guruDisplayName(signal.source) : signal.source}
          </Text>
          <Text style={styles.separator}> · </Text>
          <Text>{timeAgo(signal.publishedAt)}</Text>
        </Text>

        {isGuru ? (
          <View style={[styles.badge, styles.guruBadge]}>
            <Text style={styles.guruBadgeText}>{t('card_guru_badge', lang)}</Text>
          </View>
        ) : (
          <View style={[styles.badge, { borderColor: sentiment.color }]}>
            <Text style={styles.badgeEmoji}>{sentiment.emoji}</Text>
            <Text style={[styles.badgeText, { color: sentiment.color }]}>
              {sentiment.label}
            </Text>
          </View>
        )}
      </View>

      {/* ── Headline ────────────────────────────────────── */}
      <Text style={styles.headline} numberOfLines={3}>
        {signal.headline}
      </Text>

      {/* ── Affected companies ──────────────────────────── */}
      {signal.affectedCompanies.length > 0 && (
        <View style={styles.companiesSection}>
          <Text style={[styles.sectionLabel, rtl]}>{t('card_companies', lang)}</Text>
          <View style={styles.companiesRow}>
            {signal.affectedCompanies.map((c, i) => (
              <View key={i} style={styles.companyChip}>
                <Text style={styles.companyName}>{c.name}</Text>
                {c.ticker ? (
                  <Text style={styles.companyTicker}> ({c.ticker})</Text>
                ) : null}
                <Text style={styles.arrow}> {DIRECTION_ARROW[c.direction]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.scoreCol}>
          <Text style={styles.relevance}>
            {t('card_relevance', lang)}{' '}
            <Text style={styles.relevanceValue}>{signal.relevance}</Text>
            <Text style={styles.relevanceMax}>/10</Text>
          </Text>
          {personalScore != null && (
            <Text style={styles.personalScore}>
              {t('card_personal_relevance', lang)}{' '}
              <Text style={styles.personalScoreValue}>{personalScore}</Text>
              <Text style={styles.personalScoreMax}>/10</Text>
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={openArticle}
          style={styles.linkBtn}
          activeOpacity={0.6}
          disabled={!signal.articleUrl}
        >
          <Text style={styles.linkText}>{t('card_source_link', lang)}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Guru disclaimer ─────────────────────────────── */}
      {isGuru && (
        <Text style={[styles.disclaimer, rtl]}>
          {signal.disclaimer ?? t('card_disclaimer', lang)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: Spacing.md,
    gap: Spacing.sm + 2,
    ...CardShadow,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  guruIcon: {
    fontSize: 13,
  },
  source: {
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  sourceGuru: {
    color: Colors.accentGold,
    fontWeight: '600',
  },
  separator: {
    color: Colors.textSecondary,
  },

  // Badges
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
    marginLeft: Spacing.sm,
  },
  badgeEmoji: { fontSize: 11 },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guruBadge: {
    borderColor: Colors.accentGold,
  },
  guruBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentGold,
  },

  // Headline
  headline: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  // Companies
  companiesSection: { gap: 4 },
  sectionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  companiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  companyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  companyTicker: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  arrow: { fontSize: 11 },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  scoreCol: { gap: 2 },
  relevance: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  relevanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  relevanceMax: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  personalScore: {
    fontSize: 12,
    color: Colors.accentBlue,
  },
  personalScoreValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accentBlue,
  },
  personalScoreMax: {
    fontSize: 11,
    color: Colors.accentBlue,
  },
  linkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    fontSize: 13,
    color: Colors.accentBlue,
    fontWeight: '500',
  },

  // Disclaimer
  disclaimer: {
    fontSize: 10,
    color: '#999999',
    fontStyle: 'italic',
    lineHeight: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
});
