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
  it('[AC-03a] returns everything with no filters, and nothing for an impossible budget', () => {
    expect(slugs('')).toHaveLength(4);
    expect(slugs('budget=1000')).toEqual([]);
  });
});
