import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPreferences } from '../types';
import { savePreferences } from '../utils/storage';
import { Colors, Spacing, Radius } from '../theme';
import { t } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import ProgressIndicator from '../components/ProgressIndicator';
import ExperienceStep from '../components/steps/ExperienceStep';
import RiskStep from '../components/steps/RiskStep';
import RegionsStep from '../components/steps/RegionsStep';
import SectorsStep from '../components/steps/SectorsStep';
import NotificationsStep from '../components/steps/NotificationsStep';
import LanguageStep from '../components/steps/LanguageStep';

const TOTAL_STEPS = 6;

const DEFAULT_PREFS: UserPreferences = {
  experienceLevel: 5,
  riskTolerance: 5,
  regions: [],
  sectors: [],
  notificationTimes: ['08:00', '20:00'],
  language: 'zh',
};

function isStepValid(step: number, prefs: UserPreferences): boolean {
  switch (step) {
    case 0: return true;
    case 1: return true;
    case 2: return prefs.regions.length > 0;
    case 3: return prefs.sectors.length >= 2;
    case 4: return prefs.notificationTimes.length > 0;
    case 5: return true; // language always has a default
    default: return false;
  }
}

// ── Completion screen ────────────────────────────────────────────────────────

function CompletionView({ onDone, lang }: { onDone: () => void; lang: string }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[compStyles.container, { opacity }]}>
      <Animated.View style={[compStyles.circle, { transform: [{ scale }] }]}>
        <Text style={compStyles.check}>✓</Text>
      </Animated.View>
      <Text style={compStyles.title}>{t('onboarding_complete_title',    lang)}</Text>
      <Text style={compStyles.sub}>{t('onboarding_complete_subtitle', lang)}</Text>
      <TouchableOpacity onPress={onDone} style={compStyles.btn} activeOpacity={0.8}>
        <Text style={compStyles.btnText}>{t('onboarding_complete_start', lang)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const compStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.bullish,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  check: {
    fontSize: 42,
    color: Colors.white,
    fontWeight: '300',
    lineHeight: 52,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  btn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 100,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});

// ── Main onboarding ──────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
  initialPrefs?: UserPreferences;
  initialStep?: number;
}

export default function OnboardingScreen({ onComplete, initialPrefs, initialStep = 0 }: Props) {
  const lang = useLanguage();
  const [step, setStep] = useState(initialStep);
  const [prefs, setPrefs] = useState<UserPreferences>(initialPrefs ?? DEFAULT_PREFS);

  const canAdvance = isStepValid(step, prefs);

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      await savePreferences(prefs);
      setStep(TOTAL_STEPS); // → show completion screen
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const update = (patch: Partial<UserPreferences>) =>
    setPrefs(p => ({ ...p, ...patch }));

  // Completion screen
  if (step === TOTAL_STEPS) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <CompletionView onDone={onComplete} lang={lang} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.progressWrap}>
          <ProgressIndicator current={step + 1} total={TOTAL_STEPS} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <ExperienceStep
              value={prefs.experienceLevel}
              onChange={v => update({ experienceLevel: v })}
              lang={lang}
            />
          )}
          {step === 1 && (
            <RiskStep
              value={prefs.riskTolerance}
              onChange={v => update({ riskTolerance: v })}
              lang={lang}
            />
          )}
          {step === 2 && (
            <RegionsStep
              value={prefs.regions}
              onChange={v => update({ regions: v })}
              lang={lang}
            />
          )}
          {step === 3 && (
            <SectorsStep
              value={prefs.sectors}
              onChange={v => update({ sectors: v })}
              lang={lang}
            />
          )}
          {step === 4 && (
            <NotificationsStep
              value={prefs.notificationTimes}
              onChange={v => update({ notificationTimes: v })}
              lang={lang}
            />
          )}
          {step === 5 && (
            <LanguageStep
              value={prefs.language ?? 'zh'}
              onChange={v => update({ language: v })}
              lang={lang}
            />
          )}
        </ScrollView>

        <View style={styles.navRow}>
          {step > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backText}>{t('onboarding_back', lang)}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={!canAdvance}
            style={[styles.nextBtn, !canAdvance && styles.nextBtnDisabled]}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextText, !canAdvance && styles.nextTextDisabled]}>
              {t(step === TOTAL_STEPS - 1 ? 'onboarding_finish' : 'onboarding_next', lang)}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  progressWrap: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  backPlaceholder: {
    width: 60,
  },
  nextBtn: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: Radius.button + 92, // pill
  },
  nextBtnDisabled: {
    backgroundColor: Colors.border,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  nextTextDisabled: {
    color: Colors.textSecondary,
  },
});
