import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, CardShadow } from '../theme';

function Bone({ w, h = 12, round = false }: { w: number | `${number}%`; h?: number; round?: boolean }) {
  return (
    <View
      style={[
        styles.bone,
        { width: w as any, height: h, borderRadius: round ? h / 2 : 4 },
      ]}
    />
  );
}

export default function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.9, duration: 780, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 780, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      {/* Source row */}
      <View style={styles.row}>
        <Bone w="42%" />
        <Bone w={62} h={22} round />
      </View>
      {/* Headline */}
      <View style={styles.col}>
        <Bone w="100%" h={14} />
        <Bone w="72%" h={14} />
      </View>
      {/* Companies */}
      <View style={styles.row}>
        <Bone w={76} h={24} />
        <Bone w={76} h={24} />
        <Bone w={60} h={24} />
      </View>
      {/* Footer */}
      <View style={styles.row}>
        <Bone w="28%" />
        <Bone w={54} h={26} round />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm + 2,
    ...CardShadow,
  },
  bone: {
    backgroundColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  col: {
    gap: 6,
  },
});
