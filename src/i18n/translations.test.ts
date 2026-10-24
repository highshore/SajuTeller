import { describe, expect, it } from 'vitest';
import { productTranslations } from './product-translations';

describe('UI translations', () => {
  it('[AC-02a] every phrase has non-empty ko, zh, ja and es text', () => {
    const missing: string[] = [];
    for (const language of ['ko', 'zh', 'ja', 'es']) {
      for (const [key, value] of Object.entries(productTranslations[language])) {
        if (typeof value !== 'string' || !value.trim()) missing.push(`${language}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
    expect(Object.keys(productTranslations.ko).length).toBeGreaterThan(500);
  });
  it('[AC-02a] keeps placeholders like {name} in every translation', () => {
    const broken: string[] = [];
    for (const key of Object.keys(productTranslations.en)) {
      const placeholders = key.match(/\{[a-z]+\}/gi) ?? [];
      for (const language of ['ko', 'zh', 'ja', 'es']) {
        for (const p of placeholders) if (!productTranslations[language][key]?.includes(p)) broken.push(`${language}: ${key} lacks ${p}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
