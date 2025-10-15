import { describe, expect, it } from 'vitest';
import { extractTechKeywords, TECH_KEYWORDS } from '../techDictionary.ts';

describe('techDictionary', () => {
  it('returns known labels for matching aliases', () => {
    const text =
      'We use TypeScript, React, AWS, PostgreSQL, and Kubernetes to build our platform.';

    expect(extractTechKeywords(text)).toEqual([
      'AWS',
      'Kubernetes',
      'PostgreSQL',
      'React',
      'TypeScript',
    ]);
  });

  it('deduplicates repeated keywords and ignores missing text', () => {
    const text = 'React react React! We also love React Native and React.';
    expect(extractTechKeywords(text)).toEqual(['React', 'React Native']);
    expect(extractTechKeywords('')).toEqual([]);
  });

  it('lists a non-empty dictionary for future enrichment', () => {
    expect(TECH_KEYWORDS.length).toBeGreaterThan(10);
  });
});

