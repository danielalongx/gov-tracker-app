import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing } from '../theme';

interface LabelPoint {
  value: number;
  label: string;
}

interface Props {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  labelPoints: LabelPoint[];
}

function nearestLabel(value: number, points: LabelPoint[]): string {
  let best = points[0];
  let bestDist = Math.abs(value - points[0].value);
  for (const p of points) {
    const d = Math.abs(value - p.value);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best.label;
}

export default function LabeledSlider({ min, max, step, value, onChange, labelPoints }: Props) {
  const range = max - min;

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <Text style={styles.valueNumber}>{value}</Text>
        <Text style={styles.valueLabel}>{nearestLabel(value, labelPoints)}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.accentBlue}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.accentBlue}
      />

      <View style={styles.tickRow}>
        {labelPoints.map(p => (
          <View
            key={p.value}
            style={[
              styles.tick,
              { left: `${((p.value - min) / range) * 100}%` as any },
            ]}
          >
            <View style={styles.tickMark} />
            <Text style={styles.tickLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  valueNumber: {
    fontSize: 40,
    fontWeight: '200',
    color: Colors.accentBlue,
    lineHeight: 44,
  },
  valueLabel: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  tickRow: {
    position: 'relative',
    height: 36,
    marginTop: 4,
  },
  tick: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -1 }],
  },
  tickMark: {
    width: 1,
    height: 6,
    backgroundColor: Colors.border,
    marginBottom: 3,
  },
  tickLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    width: 52,
    transform: [{ translateX: -24 }],
  },
});
