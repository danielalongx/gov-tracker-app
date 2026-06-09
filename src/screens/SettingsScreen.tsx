import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { LANGUAGES } from '../utils/languages';
import { t, getRegionLabel, getSectorLabel, TranslationKey } from '../i18n';
import { useLanguage } from '../hooks/useLanguage';
import { useLanguageCtx } from '../i18n/LanguageContext';
import { API_BASE_URL } from '../api/client';

// ── AsyncStorage keys ─────────────────────────────────────────────────────────

const ACCOUNT_KEY = 'signal_user';
const LAST_REFRESHED_KEY = 'signal_lastRefreshedAt';
const NOTIF_ALERTS_KEY = 'signal_notifications_alerts';
const NOTIF_DIGEST_KEY = 'signal_notifications_digest';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

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

function formatCooldown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatLastRefreshed(iso: string | null): string {
  if (!iso) return '从未更新';
  const d = new Date(iso);
  const elapsed = Date.now() - d.getTime();
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚更新';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChipDisplay({ values, getLabel }: { values: string[]; getLabel?: (v: string) => string }) {
  if (!values.length) return <Text style={styles.emptyValue}>—</Text>;
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

type EditTarget = 'experience' | 'risk' | 'regions' | 'sectors' | 'notifications' | null;

const MODAL_TITLE_KEYS: Record<NonNullable<EditTarget>, TranslationKey> = {
  experience:    'settings_experience',
  risk:          'settings_risk',
  regions:       'settings_regions',
  sectors:       'settings_sectors',
  notifications: 'settings_notifications',
};

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const lang = useLanguage();
  const { setLang } = useLanguageCtx();

  // ── Existing prefs state ──────────────────────────────────────────────────
  const [prefs, setPrefs]     = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [showSub, setShowSub] = useState(false);
  const [draft,   setDraft]   = useState<UserPreferences | null>(null);

  // ── Account ───────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<{ name: string; email: string } | null>(null);
  const [showLoginModal, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail]   = useState('');
  const [loginPass, setLoginPass]     = useState('');

  // ── Data refresh ──────────────────────────────────────────────────────────
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing]           = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // ── Notification toggles ──────────────────────────────────────────────────
  const [notifAlerts, setNotifAlerts] = useState(false);
  const [notifDigest, setNotifDigest] = useState(false);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast]     = useState<string | null>(null);
  const toastRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load all on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    loadPreferences().then(p => { setPrefs(p); setLoading(false); });

    AsyncStorage.getItem(ACCOUNT_KEY).then(raw => {
      if (raw) setUser(JSON.parse(raw));
    });

    AsyncStorage.getItem(LAST_REFRESHED_KEY).then(val => setLastRefreshedAt(val));

    AsyncStorage.multiGet([NOTIF_ALERTS_KEY, NOTIF_DIGEST_KEY]).then(pairs => {
      setNotifAlerts(pairs[0][1] === 'true');
      setNotifDigest(pairs[1][1] === 'true');
    });
  }, []);

  // ── Cooldown countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    const elapsed = lastRefreshedAt
      ? Date.now() - new Date(lastRefreshedAt).getTime()
      : TWO_HOURS_MS;
    const remaining = Math.max(0, Math.ceil((TWO_HOURS_MS - elapsed) / 1000));
    setCooldownSeconds(remaining);

    if (remaining > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldownSeconds(s => {
          if (s <= 1) {
            clearInterval(cooldownRef.current!);
            cooldownRef.current = null;
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [lastRefreshedAt]);

  // ── Toast auto-dismiss ────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
    return () => { if (toastRef.current) clearTimeout(toastRef.current); };
  }, [toast]);

  // ── Account handlers ──────────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    const u = { name: 'Wayne', email: 'user@signal.app' };
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(u));
    setUser(u);
    setShowLogin(false);
    setLoginEmail('');
    setLoginPass('');
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('退出登录', '确认退出登录？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(ACCOUNT_KEY);
          setUser(null);
        },
      },
    ]);
  }, []);

  // ── Language handler ──────────────────────────────────────────────────────
  const handleLanguageSelect = useCallback(async (code: string) => {
    setLang(code);
    if (!prefs) return;
    const updated = { ...prefs, language: code };
    await savePreferences(updated);
    setPrefs(updated);
  }, [prefs, setLang]);

  // ── Data refresh ──────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (cooldownSeconds > 0 || refreshing) return;
    setRefreshing(true);
    try {
      await fetch(`${API_BASE_URL}/signals?limit=50`, { signal: AbortSignal.timeout(10000) });
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_REFRESHED_KEY, now);
      setLastRefreshedAt(now);
      setToast('已更新 ✓');
    } catch {
      setToast('更新失败，请稍后再试');
    } finally {
      setRefreshing(false);
    }
  }, [cooldownSeconds, refreshing]);

  // ── Notification handlers ─────────────────────────────────────────────────
  const handleAlertsToggle = useCallback(async (val: boolean) => {
    setNotifAlerts(val);
    await AsyncStorage.setItem(NOTIF_ALERTS_KEY, val ? 'true' : 'false');
  }, []);

  const handleDigestToggle = useCallback(async (val: boolean) => {
    setNotifDigest(val);
    await AsyncStorage.setItem(NOTIF_DIGEST_KEY, val ? 'true' : 'false');
  }, []);

  // ── Investment pref handlers (existing) ───────────────────────────────────
  const openEdit = useCallback((target: EditTarget) => {
    if (!prefs) return;
    setDraft({ ...prefs });
    setEditing(target);
  }, [prefs]);

  const saveEdit = useCallback(async () => {
    if (!draft) return;
    await savePreferences(draft);
    setPrefs({ ...draft });
    setEditing(null);
  }, [draft]);

  const cancelEdit = () => { setEditing(null); setDraft(null); };

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

  // ── Loading / empty states ────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerWrap}>
          <ActivityIndicator color={Colors.accentBlue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!prefs) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>{t('loading', lang)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLang = prefs.language ?? 'zh';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{t('settings_title', lang)}</Text>

        {/* ── 账号 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>账号</Text>
        <View style={styles.card}>
          {user ? (
            <TouchableOpacity onPress={handleLogout} style={styles.accountRow} activeOpacity={0.7}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>{user.name[0]}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{user.name}</Text>
                <Text style={styles.accountEmail}>{user.email}</Text>
              </View>
              <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowLogin(true)} style={styles.loginRow} activeOpacity={0.7}>
              <View style={styles.accountAvatarEmpty}>
                <Text style={styles.accountAvatarEmptyText}>?</Text>
              </View>
              <Text style={styles.loginLabel}>登录 / Login</Text>
              <Text style={styles.loginStatus}>未登录</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 语言 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>语言</Text>
        <View style={styles.card}>
          {LANGUAGES.map((l, i) => (
            <React.Fragment key={l.code}>
              <TouchableOpacity
                onPress={() => handleLanguageSelect(l.code)}
                style={styles.langRow}
                activeOpacity={0.7}
              >
                <View style={styles.langRowLeft}>
                  <Text style={styles.langNative}>{l.nativeLabel}</Text>
                  {l.nativeLabel !== l.label && (
                    <Text style={styles.langChinese}>{l.label}</Text>
                  )}
                </View>
                {currentLang === l.code && (
                  <Text style={styles.langCheck}>✓</Text>
                )}
              </TouchableOpacity>
              {i < LANGUAGES.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

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

        {/* ── 数据刷新 ─────────────────────────────────── */}
        <Text style={styles.sectionHeader}>数据刷新</Text>
        <View style={styles.card}>
          <View style={styles.refreshRow}>
            <Text style={styles.refreshLabel}>上次更新</Text>
            <Text style={styles.refreshValue}>{formatLastRefreshed(lastRefreshedAt)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.refreshRow}>
            <Text style={styles.refreshLabel}>立即刷新</Text>
            {cooldownSeconds > 0 ? (
              <View style={styles.cooldownBadge}>
                <Text style={styles.cooldownText}>{formatCooldown(cooldownSeconds)} 后可刷新</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshBtn}
                activeOpacity={0.8}
                disabled={refreshing}
              >
                {refreshing
                  ? <ActivityIndicator size="small" color={Colors.white} />
                  : <Text style={styles.refreshBtnText}>刷新</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── 通知 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_notifications', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>信号推送</Text>
              <Text style={styles.toggleHint}>收到新信号时推送提醒</Text>
            </View>
            <Switch
              value={notifAlerts}
              onValueChange={handleAlertsToggle}
              trackColor={{ false: Colors.border, true: Colors.accentBlue + '80' }}
              thumbColor={notifAlerts ? Colors.accentBlue : Colors.textSecondary}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>每日摘要</Text>
              <Text style={styles.toggleHint}>每天推送一次信号摘要</Text>
            </View>
            <Switch
              value={notifDigest}
              onValueChange={handleDigestToggle}
              trackColor={{ false: Colors.border, true: Colors.accentBlue + '80' }}
              thumbColor={notifDigest ? Colors.accentBlue : Colors.textSecondary}
            />
          </View>
          <View style={styles.divider} />
          <PrefBlock label={t('settings_notifications', lang)} editLabel={t('settings_edit', lang)} onEdit={() => openEdit('notifications')}>
            <Text style={styles.valueText}>{formatPushTimes(prefs.notificationTimes)}</Text>
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

        {/* ── 订阅计划 ─────────────────────────────────── */}
        <Text style={styles.sectionHeader}>订阅计划</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.subRow} onPress={() => setShowSub(true)}>
            <View>
              <Text style={styles.subTierLabel}>当前：免费版</Text>
              <Text style={styles.subTierHint}>升级 Pro 解锁自定义权重和更多股票</Text>
            </View>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── 关于 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>关于</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>版本</Text>
            <Text style={styles.aboutValue}>Signal v0.1.0 (Beta)</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.aboutNavRow} activeOpacity={0.7}>
            <Text style={styles.aboutNavLabel}>隐私政策</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.aboutNavRow} activeOpacity={0.7}>
            <Text style={styles.aboutNavLabel}>使用条款</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimerText}>
          ⚠️ 仅供参考，非投资建议 / 数据来源：公开监管申报（SEC 13F）或 ARK 官方披露 / 投资有风险，入市需谨慎，本平台不承担任何投资损失
        </Text>

        {/* ── 其他 ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>{t('settings_section_other', lang)}</Text>
        <View style={styles.card}>
          <TouchableOpacity onPress={handleReset} style={styles.dangerRow} activeOpacity={0.7}>
            <Text style={styles.dangerText}>{t('settings_reset', lang)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Signal · Phase 1</Text>
      </ScrollView>

      {/* ── Toast overlay ───────────────────────────── */}
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* ── Login modal ──────────────────────────────── */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLogin(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLogin(false)} style={styles.modalAction}>
              <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>登录 / Login</Text>
            <View style={styles.modalAction} />
          </View>
          <View style={styles.loginForm}>
            <TextInput
              style={styles.loginInput}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="邮箱 / Email"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.loginInput}
              value={loginPass}
              onChangeText={setLoginPass}
              placeholder="密码 / Password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
            />
            <TouchableOpacity onPress={handleLogin} style={styles.loginSubmitBtn} activeOpacity={0.8}>
              <Text style={styles.loginSubmitText}>登录</Text>
            </TouchableOpacity>
            <Text style={styles.loginHint}>演示：任意输入即可登录</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Subscription modal ───────────────────────── */}
      <Modal
        visible={showSub}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSub(false)}
      >
        <SubscriptionScreen onBack={() => setShowSub(false)} />
      </Modal>

      {/* ── Investment prefs edit modal ───────────────── */}
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

  // Card container
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

  // Account section
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  accountAvatarEmpty: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarEmptyText: { fontSize: 16, color: Colors.textSecondary },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  accountEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  logoutText: { fontSize: 14, color: Colors.bearish },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  loginLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  loginStatus: { fontSize: 14, color: Colors.textSecondary },
  rowArrow: { fontSize: 20, color: Colors.textSecondary, marginLeft: 4 },

  // Language section
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  langRowLeft: { flex: 1, gap: 2 },
  langNative: { fontSize: 15, color: Colors.textPrimary },
  langChinese: { fontSize: 12, color: Colors.textSecondary },
  langCheck: { fontSize: 16, color: Colors.accentBlue, fontWeight: '600' },

  // Data refresh section
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  refreshLabel: { fontSize: 15, color: Colors.textPrimary },
  refreshValue: { fontSize: 14, color: Colors.textSecondary },
  cooldownBadge: {
    backgroundColor: Colors.border,
    borderRadius: Radius.button,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cooldownText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  refreshBtn: {
    backgroundColor: Colors.accentBlue,
    borderRadius: Radius.button,
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 56,
    alignItems: 'center',
  },
  refreshBtnText: { fontSize: 14, color: Colors.white, fontWeight: '600' },

  // Notification toggles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  toggleLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '400' },
  toggleHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // PrefBlock (investment prefs)
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
  editBtnText: { fontSize: 13, color: Colors.accentBlue, fontWeight: '500' },
  valueText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '400',
    lineHeight: 22,
  },
  emptyValue: { fontSize: 14, color: Colors.border },

  // ChipDisplay
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 2 },
  displayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  displayChipText: { fontSize: 13, color: Colors.textPrimary },

  // About section
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  aboutLabel: { fontSize: 15, color: Colors.textPrimary },
  aboutValue: { fontSize: 14, color: Colors.textSecondary },
  aboutNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  aboutNavLabel: { fontSize: 15, color: Colors.textPrimary },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 17,
    paddingHorizontal: 2,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },

  // Subscription row
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  subTierLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  subTierHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // Danger / reset
  dangerRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: { fontSize: 15, color: Colors.bearish },

  // Guru subtitle
  guruSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: 2,
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },

  // Footer
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.border,
    marginTop: Spacing.xl,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.bullish,
    borderRadius: Radius.button,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: { fontSize: 15, fontWeight: '600', color: Colors.white },

  // Loading / empty
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textSecondary },

  // Login modal
  loginForm: {
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  loginInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  loginSubmitBtn: {
    backgroundColor: Colors.accentBlue,
    borderRadius: Radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  loginSubmitText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  loginHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Shared modal chrome
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
  modalTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  modalAction: { padding: 4, minWidth: 48 },
  modalActionRight: { alignItems: 'flex-end' },
  modalCancelText: { fontSize: 15, color: Colors.textSecondary },
  modalSaveText:   { fontSize: 15, color: Colors.accentBlue, fontWeight: '600' },
  modalContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
});
