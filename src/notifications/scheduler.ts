import { loadPreferences } from '../utils/storage';

/**
 * Returns the notification push times the user configured during onboarding.
 * Phase 2: send these times to the backend so signals are only fetched/pushed
 * at the scheduled hours (e.g. POST /api/preferences { notification_times: [...] }).
 */
export async function getScheduledTimes(): Promise<string[]> {
  const prefs = await loadPreferences();
  return prefs?.notificationTimes ?? [];
}
