// Five elements from the calendar (no AI): the heavenly stem of a day, and how two elements relate.


export type ElementName = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const STEM_ELEMENT: ElementName[] = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
export const ELEMENT_HANJA: Record<ElementName, string> = { Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' };
export const ELEMENT_COLOR: Record<ElementName, string> = { Wood: '#7acc8c', Fire: '#f5845a', Earth: '#e0b86b', Metal: '#dcdce9', Water: '#7a9efa' };
const GENERATES: Record<ElementName, ElementName> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CONTROLS: Record<ElementName, ElementName> = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };

const julianDay = (y: number, m: number, d: number) => {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
};

/** Heavenly stem of a (Gregorian) calendar day. The day cycle is continuous: 2000-01-01 was 戊午. */
export function dayStem(y: number, m: number, d: number) {
  const index = ((julianDay(y, m, d) + 49) % 60) % 10;
  return { stem: STEMS[index], element: STEM_ELEMENT[index], yang: index % 2 === 0 };
}

export type Relation = 'same' | 'feedsToday' | 'todayFeeds' | 'youShape' | 'todayPresses';
export function relationOf(you: ElementName, today: ElementName): Relation {
  if (you === today) return 'same';
  if (GENERATES[you] === today) return 'feedsToday';
  if (GENERATES[today] === you) return 'todayFeeds';
  if (CONTROLS[you] === today) return 'youShape';
  return 'todayPresses';
}
