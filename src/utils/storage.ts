import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';

const PREFS_KEY = 'signal_user_preferences';

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function loadPreferences(): Promise<UserPreferences | null> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  return raw ? (JSON.parse(raw) as UserPreferences) : null;
}

export async function clearPreferences(): Promise<void> {
  await AsyncStorage.removeItem(PREFS_KEY);
}

// ── Disclaimer acceptance ─────────────────────────────────────────────────────

const DISCLAIMER_KEY = 'disclaimerAccepted';

export async function saveDisclaimerAccepted(): Promise<void> {
  await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
}

export async function loadDisclaimerAccepted(): Promise<boolean> {
  const val = await AsyncStorage.getItem(DISCLAIMER_KEY);
  return val === 'true';
}
