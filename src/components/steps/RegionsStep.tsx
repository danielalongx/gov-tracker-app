import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChipSelect from '../ChipSelect';
import { Colors, Spacing } from '../../theme';
import { t, getRegionLabel } from '../../i18n';

const REGIONS = ['美国', '欧洲', '中国', '全部'];

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  lang: string;
}

export default function RegionsStep({ value, onChange, lang }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('step_regions_title',    lang)}</Text>
      <Text style={styles.subtitle}>{t('step_regions_subtitle', lang)}</Text>
      <View style={styles.chips}>
        <ChipSelect
          options={REGIONS}
          selected={value}
          onChange={onChange}
          getLabel={r => getRegionLabel(r, lang)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title:    { fontSize: 26, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  chips: { marginTop: Spacing.xl },
});
