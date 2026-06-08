import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveDisclaimerAccepted } from '../utils/storage';
import { Colors, Spacing, Radius } from '../theme';
import { t, rtlStyle } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';

interface Props {
  onAccept: () => void;
}

export default function DisclaimerScreen({ onAccept }: Props) {
  const lang = useLanguage();
  const [checked, setChecked] = useState(false);
  const rtl = rtlStyle(lang);

  const handleStart = async () => {
    await saveDisclaimerAccepted();
    onAccept();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App header */}
        <View style={styles.appHeader}>
          <Text style={styles.appName}>{t('app_name', lang)}</Text>
          <Text style={styles.appSubtitle}>{t('disclaimer_subtitle', lang)}</Text>
        </View>

        {/* Gold divider */}
        <View style={styles.goldDivider} />

        {/* Disclaimer text */}
        <View style={styles.disclaimerBlock}>
          <Text style={[styles.disclaimerHeading, rtl]}>
            {t('disclaimer_title', lang)}
          </Text>
          <Text style={[styles.disclaimerBody, rtl]}>
            {t('disclaimer_body', lang)}
          </Text>
        </View>
      </ScrollView>

      {/* Fixed footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setChecked(v => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkboxLabel, rtl]}>
            {t('disclaimer_checkbox', lang)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStart}
          disabled={!checked}
          activeOpacity={0.8}
          style={[styles.button, !checked && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, !checked && styles.buttonTextDisabled]}>
            {t('disclaimer_button', lang)}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.copyright, rtl]}>
          {t('disclaimer_footer', lang)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  appHeader: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  appName: {
    fontSize: 52,
    fontWeight: '200',
    color: Colors.textPrimary,
    letterSpacing: 6,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  goldDivider: {
    height: 1,
    backgroundColor: Colors.accentGold,
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  disclaimerBlock: { gap: Spacing.md },
  disclaimerHeading: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  disclaimerBody: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  checkmark: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.accentBlue,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: Colors.border },
  buttonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  buttonTextDisabled: { color: Colors.textSecondary },
  copyright: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textSecondary,
    paddingBottom: Spacing.xs,
  },
});
