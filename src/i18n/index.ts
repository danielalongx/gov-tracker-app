import { TranslationKey, translations } from './translations';
import { REGION_LABEL_MAP, SECTOR_LABEL_MAP } from './labels';

export { TranslationKey };

/**
 * Look up a translation key, with optional {placeholder} interpolation.
 * Falls back to Chinese, then the raw key.
 */
export function t(
  key: TranslationKey,
  lang: string = 'zh',
  params?: Record<string, string | number>,
): string {
  let str = translations[lang]?.[key] ?? translations['zh']?.[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

/** Localized display name for a region stored as a Chinese label. */
export function getRegionLabel(zhLabel: string, lang: string): string {
  return REGION_LABEL_MAP[zhLabel]?.[lang] ?? REGION_LABEL_MAP[zhLabel]?.zh ?? zhLabel;
}

/** Localized display name for a sector stored as a Chinese label. */
export function getSectorLabel(zhLabel: string, lang: string): string {
  return SECTOR_LABEL_MAP[zhLabel]?.[lang] ?? SECTOR_LABEL_MAP[zhLabel]?.zh ?? zhLabel;
}

/** True for right-to-left scripts. */
export function isRTL(lang: string): boolean {
  return lang === 'ar';
}

/** Base text style for RTL languages. */
export function rtlStyle(lang: string): { writingDirection?: 'rtl' | 'ltr'; textAlign?: 'right' | 'left' } {
  return lang === 'ar'
    ? { writingDirection: 'rtl', textAlign: 'right' }
    : {};
}
