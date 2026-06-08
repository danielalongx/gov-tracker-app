import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChipSelect from '../ChipSelect';
import { Colors, Spacing } from '../../theme';
import { t, getSectorLabel } from '../../i18n';

export const ALL_SECTORS = [
  '科技', '半导体', 'AI', '能源', '新能源',
  '金融', '银行', '医疗', '消费品', '零售',
  '工业', '航空', '房地产', '大宗商品', '加密货币',
];

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  lang: string;
}

export default function SectorsStep({ value, onChange, lang }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('step_sectors_title',    lang)}</Text>
      <Text style={styles.subtitle}>{t('step_sectors_subtitle', lang)}</Text>
      <View style={styles.chips}>
        <ChipSelect
          options={ALL_SECTORS}
          selected={value}
          onChange={onChange}
          minSelect={0}
          getLabel={s => getSectorLabel(s, lang)}
        />
      </View>
      {value.length === 1 && (
        <Text style={styles.hint}>{t('step_sectors_min', lang)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title:    { fontSize: 26, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  chips: { marginTop: Spacing.xl },
  hint: { fontSize: 13, color: Colors.bearish, marginTop: Spacing.sm },
});
