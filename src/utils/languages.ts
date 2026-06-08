export interface Language {
  code: string;
  label: string;       // Chinese name
  nativeLabel: string; // Name in its own script
}

export const LANGUAGES: Language[] = [
  { code: 'zh', label: '中文',    nativeLabel: '中文' },
  { code: 'en', label: '英文',    nativeLabel: 'English' },
  { code: 'ja', label: '日文',    nativeLabel: '日本語' },
  { code: 'ko', label: '韩文',    nativeLabel: '한국어' },
  { code: 'es', label: '西班牙文', nativeLabel: 'Español' },
  { code: 'fr', label: '法文',    nativeLabel: 'Français' },
  { code: 'de', label: '德文',    nativeLabel: 'Deutsch' },
  { code: 'pt', label: '葡萄牙文', nativeLabel: 'Português' },
  { code: 'ru', label: '俄文',    nativeLabel: 'Русский' },
  { code: 'ar', label: '阿拉伯文', nativeLabel: 'العربية' },
];
