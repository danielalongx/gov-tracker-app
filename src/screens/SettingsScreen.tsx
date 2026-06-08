import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPreferences } from '../types';
import { loadPreferences, savePreferences, clearPreferences } from '../utils/storage';
import { formatPushTimes } from '../utils/notifications';
import { ALL_GURU_LABELS } from '../utils/guruNames';
import { SubscriptionScreen } from './SubscriptionScreen';
import { Colors, Spacing, Radius, CardShadow } from '../theme';
import ChipSelect from '../components/ChipSelect';
import ExperienceStep from '../components/steps/ExperienceStep';
import RiskStep from '../components/steps/RiskStep';
import RegionsStep from '../components/steps/RegionsStep';
import SectorsStep from '../components/steps/SectorsStep';
import NotificationsStep from '../components/steps/NotificationsStep';
import LanguageStep from '../components/steps/LanguageStep';
import { LANGUAGES } from '../utils/languages';
import { t, getRegionLabel, getSectorLabel, TranslationKey } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { useLanguageCtx } from '../i18n/LanguageContext';

// ── Format helpers ────────────────────────────────────────────────────────────

type LabelPoint = [number, string];

function nearestLabel(value: number, points: LabelPoint[]): string {
  let best = points[0];
  let bestDist = Math.abs(value - points[0][0]);
  for (const p of points) {
    const d = Math.abs(value - p[0]);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best[1];
}

const EXP_LABELS: LabelPoint[] = [
  [1, '投资新手'], [3, '有一些经验'], [5, '定期投资者'],
  [7, '经验丰富'], [10, '专业投资人'],
];
const RISK_LABELS: LabelPoint[] = [
  [1, '极度保守'], [4, '稳健为主'], [7, '积极成长'], [10, '高风险高回报'],
];

const fmtExp  = (v: number) => `${v} · ${nearestLabel(v, EXP_LABELS)}`;
const fmtRisk = (v: number) => `${v} · ${nearestLabel(v, RISK_LABELS)}`;

// ── Sub-components ────────────────────────────────────────────────────────────

/** Read-only chip row for array preferences (regions, sectors). */
function ChipDisplay({ values, getLabel }: { values: string[]; getLabel?: (v: string) => string }) {
  if (!values.length) {
    return <Text style={styles.emptyValue}>—</Text>;
  }
  return (
    <View style={styles.chipWrap}>
      {values.map((v, i) => (
        <View key={i} style={styles.displayChip}>
          <Text style={styles.displayChipText}>{getLabel ? getLabel(v) : v}</Text>
        </View>
      ))}
    </View>
  );
}

/** A card row: label + borderless edit button on top, content below. */
function PrefBlock({
  label,
  editLabel,
  onEdit,
  children,
}: {
  label: string;
  editLabel: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.prefBlock}>
      <View style={styles.prefBlockHeader}>
        <Text style={styles.prefLabel}>{label}</Text>
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
        >
          <Text style={styles.editBtnText}>{editLabel}</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

// ── Edit modal types ──────────────────────────────────────────────────────────

type EditTarget = 'experience' | 'risk' | 'regions' | 'sectors' | 'notifications' | 'language' | null;

const MODAL_TITLE_KEYS: Record<NonNullable<EditTarget>, TranslationKey> = {
  experience:    'settings_experience',
  risk:          'settings_risk',
  regions:       'settings_regions',
  sectors:       'settings_sectors',
  notifications: 'settings_notifications',
  language:      'settings_language',
};

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const lang = useLanguage();
  const { setLang } = useLanguageCtx();
  const [prefs, setPrefs]     = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [showSub, setShowSub] = useState(false);
  const [draft,   setDraft]   = useState<UserPreferences | null>(null);

  useEffect(() => {
    loadPreferences().then(p => { setPrefs(p); setLoading(false); });
  }, []);

  const openEdit = useCallback((target: EditTarget) => {
    if (!prefs) return;
    setDraft({ ...prefs });
    setEditing(target);
  }, [prefs]);

  const saveEdit = useCallback(async () => {
    if (!draft) return;
    await savePreferences(draft);
    setPrefs({ ...draft });
    // Update language context immediately so UI reflects new language
    if (draft.language) setLang(draft.language);
    setEditing(null);
  }, [draft, setLang]);

  const cancelEdit = () => { setEditing(null); setDraft(null); };

  // Guru tracking — auto-saves on chip toggle (no modal needed)
  const updateGurus = useCallback(async (newLabels: string[]) => {
    if (!prefs) return;
    const updated = { ...prefs, followedGurus: newLabels };
    setPrefs(updated);
    await savePreferences(updated);
  }, [prefs]);

  const updateDraft = (patch: Partial<UserPreferences>) =>
    setDraft(d => (d ? { ...d, ...patch } : d));

  const handleReset = () =>
    Alert.alert(t('settings_reset', lang), t('settings_reset', lang) + '?', [
      { text: t('cancel', lang), style: 'cancel' },
      {
        text: t('done', lang), style: 'destructive',
        onPress: async () => { await clearPreferences(); setPrefs(null); },
      },
    ]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerWrap}>
          <ActivityIndicator color={Colors.accentBlue} />
        </View>
      </SafeAreaView>
    );
  }

  // No preferences (reset / fresh install edge case)
  if (!prefs) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>{t('loading', lang)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{t('settings_title', lang)}</Text>

        {/* ── 投资偏好 ─────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_prefs', lang)}</Text>
        <View style={styles.card}>
          <PrefBlock label={t('settings_experience', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('experience')}>
            <Text style={styles.valueText}>{fmtExp(prefs.experienceLevel)}</Text>
          </PrefBlock>
          <View style={styles.divider} />
          <PrefBlock label={t('settings_risk', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('risk')}>
            <Text style={styles.valueText}>{fmtRisk(prefs.riskTolerance)}</Text>
          </PrefBlock>
          <View style={styles.divider} />
          <PrefBlock label={t('settings_regions', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('regions')}>
            <ChipDisplay values={prefs.regions} getLabel={r => getRegionLabel(r, lang)} />
          </PrefBlock>
          <View style={styles.divider} />
          <PrefBlock label={t('settings_sectors', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('sectors')}>
            <ChipDisplay values={prefs.sectors} getLabel={s => getSectorLabel(s, lang)} />
          </PrefBlock>
        </View>

        {/* ── 通知 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_notifications', lang)}</Text>
        <View style={styles.card}>
          <PrefBlock label={t('settings_notifications', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('notifications')}>
            <Text style={styles.valueText}>{formatPushTimes(prefs.notificationTimes)}</Text>
          </PrefBlock>
        </View>

        {/* ── 摘要语言 ─────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_language_header', lang)}</Text>
        <View style={styles.card}>
          <PrefBlock label={t('settings_language_field', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('language')}>
            <Text style={styles.valueText}>
              {LANGUAGES.find(l => l.code === (prefs.language ?? 'zh'))?.nativeLabel ?? '中文'}
            </Text>
          </PrefBlock>
        </View>

        {/* ── 投资大佬追踪 ─────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_guru_header', lang)}</Text>
        <Text style={styles.guruSubtitle}>{t('settings_guru_subtitle', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.prefBlock}>
            <ChipSelect
              options={ALL_GURU_LABELS}
              selected={prefs.followedGurus ?? ALL_GURU_LABELS}
              onChange={updateGurus}
              minSelect={0}
            />
          </View>
        </View>

        {/* ── 其他 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_other', lang)}</Text>
        <View style={styles.card}>
          <TouchableOpacity onPress={handleReset} style={styles.dangerRow} activeOpacity={0.7}>
            <Text style={styles.dangerText}>{t('settings_reset', lang)}</Text>
          </TouchableOpacity>
        </View>

        {/* ── 订阅计划 ─────────────────────────────────── */}
        <Text style={styles.sectionHeader}>订阅计划</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.subRow} onPress={() => setShowSub(true)}>
            <View>
              <Text style={styles.subTierLabel}>当前：免费版</Text>
              <Text style={styles.subTierHint}>升级 Pro 解锁自定义权重和更多股票</Text>
            </View>
            <Text style={styles.subArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>{t('settings_version', lang)}</Text>
      </ScrollView>

      {/* ── Subscription modal ───────────────────────── */}
      <Modal
        visible={showSub}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSub(false)}
      >
        <SubscriptionScreen onBack={() => setShowSub(false)} />
      </Modal>

      {/* ── Edit modal ───────────────────────────────── */}
      <Modal
        visible={!!editing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={cancelEdit}
      >
        {editing && draft && (
          <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={cancelEdit} style={styles.modalAction}>
                <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t(MODAL_TITLE_KEYS[editing], lang)}</Text>
              <TouchableOpacity onPress={saveEdit} style={[styles.modalAction, styles.modalActionRight]}>
                <Text style={styles.modalSaveText}>{t('save', lang)}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {editing === 'experience' && (
                <ExperienceStep
                  value={draft.experienceLevel}
                  onChange={v => updateDraft({ experienceLevel: v })}
                  lang={lang}
                />
              )}
              {editing === 'risk' && (
                <RiskStep
                  value={draft.riskTolerance}
                  onChange={v => updateDraft({ riskTolerance: v })}
                  lang={lang}
                />
              )}
              {editing === 'regions' && (
                <RegionsStep
                  value={draft.regions}
                  onChange={v => updateDraft({ regions: v })}
                  lang={lang}
                />
              )}
              {editing === 'sectors' && (
                <SectorsStep
                  value={draft.sectors}
                  onChange={v => updateDraft({ sectors: v })}
                  lang={lang}
                />
              )}
              {editing === 'notifications' && (
                <NotificationsStep
                  value={draft.notificationTimes}
                  onChange={v => updateDraft({ notificationTimes: v })}
                  lang={lang}
                />
              )}
              {editing === 'language' && (
                <LanguageStep
                  value={draft.language ?? 'zh'}
                  onChange={v => updateDraft({ language: v })}
                  lang={lang}
                />
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...CardShadow,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // PrefBlock
  prefBlock: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    gap: 6,
  },
  prefBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  editBtnText: {
    fontSize: 13,
    color: Colors.accentBlue,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '400',
    lineHeight: 22,
  },
  emptyValue: {
    fontSize: 14,
    color: Colors.border,
  },

  // ChipDisplay
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 2,
  },
  displayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  displayChipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '400',
  },

  // Danger row
  dangerRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 15,
    color: Colors.bearish,
  },

  // Footer
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.border,
    marginTop: Spacing.xl,
  },

  subRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  subTierLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  subTierHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  subArrow: { fontSize: 20, color: Colors.textSecondary },
  guruSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: 2,
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },

  // Loading / empty
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: Colors.textSecondary },

  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalAction: {
    padding: 4,
    minWidth: 48,
  },
  modalActionRight: {
    alignItems: 'flex-end',
  },
  modalCancelText: { fontSize: 15, color: Colors.textSecondary },
  modalSaveText:   { fontSize: 15, color: Colors.accentBlue, fontWeight: '600' },
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
