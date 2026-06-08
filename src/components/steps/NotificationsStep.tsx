import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';
import { t } from '../../i18n';

const TIME_SLOTS: string[] = Array.from({ length: 18 }, (_, i) =>
  `${String(i + 6).padStart(2, '0')}:00`,
);

const MAX_SELECTIONS = 3;

interface Props {
  value: string[];
  onChange: (times: string[]) => void;
  lang: string;
}

export default function NotificationsStep({ value, onChange, lang }: Props) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const toggleSlot = (slot: string) => {
    if (value.includes(slot)) {
      onChange(value.filter(t => t !== slot));
    } else if (value.length >= MAX_SELECTIONS) {
      triggerShake();
    } else {
      onChange([...value, slot].sort());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('step_notifications_title',    lang)}</Text>
      <Text style={styles.subtitle}>{t('step_notifications_subtitle', lang)}</Text>

      <Animated.View
        style={[styles.grid, { transform: [{ translateX: shakeAnim }] }]}
      >
        {TIME_SLOTS.map(slot => {
          const selected = value.includes(slot);
          return (
            <TouchableOpacity
              key={slot}
              onPress={() => toggleSlot(slot)}
              activeOpacity={0.7}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      <Text style={styles.hint}>
        {t('step_notifications_hint', lang, { selected: value.length, max: MAX_SELECTIONS })}
        {value.length === 0 ? `  · ${t('step_notifications_min', lang)}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title:    { fontSize: 26, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  grid: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  hint: { fontSize: 12, color: Colors.textSecondary, marginTop: Spacing.sm },
});
