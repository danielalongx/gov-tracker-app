import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';

interface Props {
  current: number; // 1-indexed: 1 = first step active
  total: number;
}

export default function ProgressIndicator({ current, total }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => {
          const completed = i < current - 1;
          const active    = i === current - 1;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                completed && styles.dotCompleted,
                active    && styles.dotActive,
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.label}>{current} / {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotCompleted: {
    backgroundColor: Colors.accentGold,
    width: 14,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: Colors.accentBlue,
    width: 20,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
