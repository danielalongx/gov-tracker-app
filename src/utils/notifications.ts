/**
 * Given a list of push times like ['08:00', '20:00'], returns a human-readable
 * string for the next scheduled push — e.g. "今日 20:00" or "明日 08:00".
 */
export function getNextPushTime(
  times: string[],
  todayLabel = '今日',
  tomorrowLabel = '明日',
): string | null {
  if (!times.length) return null;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const sorted = [...times]
    .map(t => {
      const [hStr, mStr] = t.split(':');
      return { label: t, minutes: Number(hStr) * 60 + Number(mStr) };
    })
    .sort((a, b) => a.minutes - b.minutes);

  const next = sorted.find(({ minutes }) => minutes > nowMin);
  return next ? `${todayLabel} ${next.label}` : `${tomorrowLabel} ${sorted[0].label}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Sort push times chronologically and join with ' · '. */
export function formatPushTimes(times: string[]): string {
  if (!times.length) return '未设置';
  return [...times]
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
    .join(' · ');
}
