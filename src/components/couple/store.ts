// "Your people" — kept ONLY in this browser's localStorage. Nothing is sent to a server.
export type CoupleRelation = 'partners' | 'dating' | 'friends' | 'family';
export const RELATIONS: readonly [CoupleRelation, string][] = [['partners', 'Partners'], ['dating', 'Dating'], ['friends', 'Friends'], ['family', 'Family']];

export type CouplePerson = { name: string; date: string; time: string };
export type SavedPerson = CouplePerson & { id: string; relation: CoupleRelation };
export type CoupleSaved = { me: CouplePerson | null; people: SavedPerson[] };

const KEY = 'st-couple-people-v1';
const empty: CoupleSaved = { me: null, people: [] };

export function loadSaved(): CoupleSaved {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as Partial<CoupleSaved>;
    return { me: data.me ?? null, people: Array.isArray(data.people) ? data.people : [] };
  } catch {
    return empty;
  }
}

function write(data: CoupleSaved) {
  try {
    if (!data.me && !data.people.length) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* storage blocked — the reading still works, it just isn't remembered */ }
}

export function savePair(me: CouplePerson, them: CouplePerson, relation: CoupleRelation, id?: string): CoupleSaved {
  const current = loadSaved();
  const personId = id ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const person: SavedPerson = { ...them, id: personId, relation };
  const people = [person, ...current.people.filter(p => p.id !== personId)].slice(0, 12);
  const next = { me, people };
  write(next);
  return next;
}

export function removePerson(id: string): CoupleSaved {
  const current = loadSaved();
  const next = { ...current, people: current.people.filter(p => p.id !== id) };
  write(next);
  return next;
}

export function forgetAll(): CoupleSaved {
  write(empty);
  return empty;
}

export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= '1900-01-01' && date <= today();
