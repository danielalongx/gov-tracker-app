import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';

interface Props {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  minSelect?: number;
  /** Optional display transform — raw value stays unchanged in state. */
  getLabel?: (option: string) => string;
}

export default function ChipSelect({
  options,
  selected,
  onChange,
  multiSelect = true,
  minSelect = 0,
  getLabel,
}: Props) {
  const toggle = (option: string) => {
    if (multiSelect) {
      if (selected.includes(option)) {
        if (selected.length > minSelect) {
          onChange(selected.filter(o => o !== option));
        }
      } else {
        onChange([...selected, option]);
      }
    } else {
      onChange([option]);
    }
  };

  return (
    <View style={styles.wrap}>
      {options.map(option => {
        const isSelected = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            onPress={() => toggle(option)}
            activeOpacity={0.7}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {getLabel ? getLabel(option) : option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    borderColor: Colors.accentBlue,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  labelSelected: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
