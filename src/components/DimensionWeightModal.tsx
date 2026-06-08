import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WatchlistItem, DimensionWeights } from '../types';
import { loadWeights, saveWeights } from '../utils/watchlist';
import { Colors, Spacing, Radius, CardShadow } from '../theme';
import { t, TranslationKey } from '../i18n';

const DEFAULT_WEIGHTS: DimensionWeights = {
  news: 7, financial: 6, regulatory: 5,
  pipeline: 5, capitalFlows: 6, technical: 3,
};

type DimKey = keyof DimensionWeights;

const DIMS: { key: DimKey; tKey: TranslationKey; sub: string }[] = [
  { key: 'news',        tKey: 'dim_news',       sub: 'News' },
  { key: 'financial',   tKey: 'dim_financial',   sub: 'Financials' },
  { key: 'regulatory',  tKey: 'dim_regulatory',  sub: 'Regulatory' },
  { key: 'pipeline',    tKey: 'dim_pipeline',    sub: 'Pipeline' },
  { key: 'capitalFlows',tKey: 'dim_capital',     sub: 'Capital Flows' },
  { key: 'technical',   tKey: 'dim_technical',   sub: 'Technical' },
];

interface Props {
  item: WatchlistItem;
  onClose: () => void;
  lang?: string;
}

export default function DimensionWeightModal({ item, onClose, lang = 'zh' }: Props) {
  const [weights, setWeights] = useState<DimensionWeights>(DEFAULT_WEIGHTS);

  useEffect(() => {
    loadWeights(item.ticker).then(setWeights);
  }, [item.ticker]);

  const handleSave = async () => {
    await saveWeights(item.ticker, weights);
    onClose();
  };

  const setW = (key: DimKey, v: number) =>
    setWeights(prev => ({ ...prev, [key]: v }));

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const formulaTerms = [
    `消息×${weights.news}`,
    `财务×${weights.financial}`,
    `政策×${weights.regulatory}`,
    `Pipeline×${weights.pipeline}`,
    `资金×${weights.capitalFlows}`,
    `技术×${weights.technical}`,
  ].join(' + ');

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelTxt}>{t('cancel', lang)}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {item.name} · {t('dim_title', lang)}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
            <Text style={styles.saveTxt}>{t('save', lang)}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>{t('dim_subtitle', lang)}</Text>

          {/* Sliders */}
          {DIMS.map(dim => (
            <View key={dim.key} style={styles.dimBlock}>
              <View style={styles.dimLabelRow}>
                <Text style={styles.dimName}>{t(dim.tKey, lang)}</Text>
                <View style={styles.dimValueBadge}>
                  <Text style={styles.dimValueTxt}>{weights[dim.key]}</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={weights[dim.key]}
                onValueChange={v => setW(dim.key, v)}
                minimumTrackTintColor={Colors.accentBlue}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.accentBlue}
              />
              <View style={styles.sliderTicks}>
                <Text style={styles.tickLabel}>0</Text>
                <Text style={styles.tickLabel}>5</Text>
                <Text style={styles.tickLabel}>10</Text>
              </View>
            </View>
          ))}

          {/* Formula preview */}
          <View style={[styles.formulaCard, CardShadow]}>
            <Text style={styles.formulaTitle}>{t('dim_formula_title', lang)}</Text>
            <Text style={styles.formula}>
              综合信号 = ({formulaTerms}) ÷ {total}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: { minWidth: 52 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.sm,
  },
  cancelTxt: { fontSize: 15, color: Colors.textSecondary },
  saveTxt:   { fontSize: 15, color: Colors.accentBlue, fontWeight: '600', textAlign: 'right' },

  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  dimBlock: { gap: 4 },
  dimLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  dimValueBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimValueTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  slider: { height: 36, marginHorizontal: -4 },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  tickLabel: { fontSize: 10, color: Colors.textSecondary },

  formulaCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  formula: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontFamily: 'monospace' as const,
  },
});
