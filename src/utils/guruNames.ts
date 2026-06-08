export const GURU_NAMES: Record<string, string> = {
  guru_buffett:       '巴菲特',
  guru_burry:         'Michael Burry',
  guru_dalio:         'Ray Dalio',
  guru_ackman:        'Bill Ackman',
  guru_druckenmiller: 'Druckenmiller',
  arkk_trade:         'ARK ARKK',
  arkw_trade:         'ARK ARKW',
};

export function isGuruSource(source: string): boolean {
  return source.startsWith('guru_') || source.toLowerCase().includes('ark');
}

export function guruDisplayName(source: string): string {
  return GURU_NAMES[source] ?? source.replace(/^guru_/, '').replace(/_/g, ' ');
}

// ── Settings list ─────────────────────────────────────────────────────────────

export const ALL_GURU_OPTIONS: { label: string; id: string }[] = [
  { label: '巴菲特',        id: 'guru_buffett' },
  { label: 'Michael Burry', id: 'guru_burry' },
  { label: 'Ray Dalio',     id: 'guru_dalio' },
  { label: 'Bill Ackman',   id: 'guru_ackman' },
  { label: 'ARK Invest',    id: 'ark' },
  { label: 'Druckenmiller', id: 'guru_druckenmiller' },
];

export const ALL_GURU_LABELS: string[] = ALL_GURU_OPTIONS.map(g => g.label);
