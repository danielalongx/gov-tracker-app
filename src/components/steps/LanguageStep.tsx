import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LANGUAGES } from '../../utils/languages';
import { Colors, Spacing, Radius } from '../../theme';
import { t } from '../../i18n';

interface Props {
  value: string;
  onChange: (code: string) => void;
  lang: string;
}

export default function LanguageStep({ value, onChange, lang }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('step_language_title',    lang)}</Text>
      <Text style={styles.subtitle}>{t('step_language_subtitle', lang)}</Text>

      <View style={styles.grid}>
        {LANGUAGES.map(l => {
          const selected = value === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              onPress={() => onChange(l.code)}
              activeOpacity={0.7}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.native, selected && styles.nativeSelected]}>
                {l.nativeLabel}
              </Text>
              {l.code !== 'zh' && (
                <Text style={[styles.chinese, selected && styles.chineseSelected]}>
                  {l.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title:   { fontSize: 26, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle:{ fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  grid: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    gap: 2,
  },
  chipSelected: {
    borderColor: Colors.accentBlue,
    backgroundColor: Colors.accentBlue,
  },
  native: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  nativeSelected: { color: Colors.white },
  chinese: { fontSize: 11, color: Colors.textSecondary },
  chineseSelected: { color: 'rgba(255,255,255,0.75)' },
});
