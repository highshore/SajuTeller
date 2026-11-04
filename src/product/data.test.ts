import { describe, expect, it, vi } from 'vitest';
vi.mock('../supabase', () => ({ supabase: {} }));
import { filterStudios, type Studio } from './data';

const studio = (over: Partial<Studio>): Studio => ({
  id: over.slug ?? 'x', slug: 'x', name: 'Studio', name_ko: '스튜디오', latitude: 37.5, longitude: 127, tagline: '', description: '', neighborhood: 'Insadong', district: 'Jongno-gu',
  city: 'Seoul', address_line1: '', phone: null, email: null, website: null, nearest_station: '', station_walk_minutes: 5, base_price: 50000, min_duration_minutes: 30, max_guests: 1,
  min_age: 0, specialties: ['general'], modalities: ['saju'], ai_interpretation_available: true, wheelchair_accessible: false, average_rating: 0, review_count: 0, is_mock: true,
  demo_chat_enabled: true, verified: false, is_featured: false, studio_images: [], studio_languages: [{ language_code: 'en', support_type: 'interpreter' }], ...over,
} as Studio);

const all = [
  studio({ slug: 'love-hongdae-cheap', neighborhood: 'Hongdae', specialties: ['love'], base_price: 30000, studio_languages: [{ language_code: 'ja', support_type: 'native' }] }),
  studio({ slug: 'love-hongdae-dear', neighborhood: 'Hongdae', specialties: ['love'], base_price: 120000, studio_languages: [{ language_code: 'ja', support_type: 'native' }] }),
  studio({ slug: 'career-insadong', specialties: ['career'], base_price: 30000 }),
  studio({ slug: 'tarot', modalities: ['tarot'], specialties: ['love'], neighborhood: 'Hongdae', base_price: 25000 }),
];
const slugs = (q: string) => filterStudios(all, new URLSearchParams(q)).map(s => s.slug);

describe('filterStudios', () => {
  it('[AC-03a] returns only studios matching every chosen filter', () => {
    expect(slugs('topic=love&area=Hongdae&language=ja&budget=50000')).toEqual(['love-hongdae-cheap']);
    expect(slugs('topic=career')).toEqual(['career-insadong']);
    expect(slugs('topic=tarot')).toEqual(['tarot']);
  });
  // Decision table: one studio (love · Hongdae · Japanese · ₩30,000) against every combination of
  // four filters, each set to a matching (Y) or non-matching (N) value. Shown only when all four match.
  const target = studio({ slug: 'target', neighborhood: 'Hongdae', specialties: ['love'], base_price: 30000, studio_languages: [{ language_code: 'ja', support_type: 'native' }] });
  const rules = Array.from({ length: 16 }, (_, i) => [8, 4, 2, 1].map(bit => (i & bit ? 'Y' : 'N')) as ['Y' | 'N', 'Y' | 'N', 'Y' | 'N', 'Y' | 'N']);
  it.each(rules)('[AC-03a] topic %s · area %s · language %s · budget %s', (topic, area, language, budget) => {
    const q = new URLSearchParams({ topic: topic === 'Y' ? 'love' : 'career', area: area === 'Y' ? 'Hongdae' : 'Insadong', language: language === 'Y' ? 'ja' : 'es', budget: budget === 'Y' ? '50000' : '20000' });
    const shown = filterStudios([target], q).length === 1;
    expect(shown).toBe([topic, area, language, budget].every(c => c === 'Y'));
  });
  // Boundary value analysis on the budget: a studio priced exactly at the budget is included.
  it.each([['29999', false], ['30000', true], ['30001', true]] as const)('[AC-03a] budget ₩%s shows a ₩30,000 studio: %s', (budget, shown) => {
    expect(filterStudios([target], new URLSearchParams({ budget })).length === 1).toBe(shown);
  });
  // Equivalence partition: a missing or non-numeric budget means "any price".
  it.each(['', 'abc'])('[AC-03a] budget %j is ignored', budget => {
    expect(filterStudios([target], new URLSearchParams({ budget }))).toHaveLength(1);
  });
  it('[AC-03a] returns everything with no filters, and nothing for an impossible budget', () => {
    expect(slugs('')).toHaveLength(4);
    expect(slugs('budget=1000')).toEqual([]);
  });
});
