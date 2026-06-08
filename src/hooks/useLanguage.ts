import { useLanguageCtx } from '../i18n/LanguageContext';

/** Returns the current UI language code (e.g. 'zh', 'en'). Reactive: updates when the user changes language in Settings. */
export function useLanguage(): string {
  return useLanguageCtx().lang;
}
