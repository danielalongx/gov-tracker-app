import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LabeledSlider from '../LabeledSlider';
import { Colors, Spacing } from '../../theme';
import { t } from '../../i18n';

interface Props {
  value: number;
  onChange: (v: number) => void;
  lang: string;
}

export default function ExperienceStep({ value, onChange, lang }: Props) {
  const labelPoints = [
    { value: 1,  label: t('step_experience_label_1',  lang) },
    { value: 3,  label: t('step_experience_label_3',  lang) },
    { value: 5,  label: t('step_experience_label_5',  lang) },
    { value: 7,  label: t('step_experience_label_7',  lang) },
    { value: 10, label: t('step_experience_label_10', lang) },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('step_experience_title',    lang)}</Text>
      <Text style={styles.subtitle}>{t('step_experience_subtitle', lang)}</Text>
      <View style={styles.sliderWrap}>
        <LabeledSlider
          min={1} max={10} step={1}
          value={value}
          onChange={onChange}
          labelPoints={labelPoints}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title:    { fontSize: 26, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  sliderWrap: { marginTop: Spacing.xl },
});
