import { describe, expect, it } from 'vitest';
import type { AlgoliaCommentHit } from '../../types/algolia.ts';
import { htmlToPlainText, parseJobFromComment } from '../parseJob.ts';

const baseHit: AlgoliaCommentHit = {
  objectID: '12345',
  parent_id: 999,
  story_id: 888,
  story_title: 'Ask HN: Who is hiring? (March 2025)',
  story_url: 'https://news.ycombinator.com/item?id=888',
  created_at: '2025-03-01T12:00:00.000Z',
  created_at_i: 1_720_000_000,
  author: 'acme_corp',
  url: null,
  comment_text: null,
  text: null,
  _tags: ['comment'],
  _highlightResult: {},
};

describe('htmlToPlainText', () => {
  it('converts simple HTML into readable plaintext', () => {
    const html =
      '<p>Acme Corp – Senior React Engineer – Berlin / Remote</p><p>We build SaaS &amp; handle 100% remote teams.<br/>Compensation: $140k – $170k.</p>';
    expect(htmlToPlainText(html)).toBe(
      'Acme Corp – Senior React Engineer – Berlin / Remote\n' +
        'We build SaaS & handle 100% remote teams.\n' +
        'Compensation: $140k – $170k.'
    );
  });
});

describe('parseJobFromComment', () => {
  it('extracts structured data from an Algolia hit', () => {
    const hit: AlgoliaCommentHit = {
      ...baseHit,
      comment_text:
        '<p>Acme Corp – Senior React Engineer – Berlin / Remote</p>' +
        '<p>Full-time, Visa sponsorship available. We use TypeScript, React, AWS.</p>' +
        '<p>Compensation: $140k – $170k plus equity.</p>',
    };

    const job = parseJobFromComment(hit);

    expect(job.company).toBe('Acme Corp');
    expect(job.role).toBe('Senior React Engineer');
    expect(job.locations).toEqual(['Berlin', 'Remote']);
    expect(job.workMode).toBe('remote');
    expect(job.remoteOnly).toBe(false);
    expect(job.employmentTypes).toContain('full-time');
    expect(job.experienceLevel).toBe('senior');
    expect(job.techStack).toEqual(['AWS', 'React', 'TypeScript']);
    expect(job.salary?.min).toBe(140_000);
    expect(job.salary?.max).toBe(170_000);
    expect(job.salary?.currency).toBe('USD');
    expect(job.visa).toBe(true);
    expect(job.text).toContain('We use TypeScript');
    expect(job.html).toContain('Acme Corp');
    expect(job.url).toBe('https://news.ycombinator.com/item?id=12345');
    expect(job.source.storyId).toBe(888);
    expect(job.flags.starred).toBe(false);
    expect(job.tags).toContain('remote');
    expect(job.tags).toContain('full-time');
  });

  it('handles minimal content and returns sensible defaults', () => {
    const hit: AlgoliaCommentHit = {
      ...baseHit,
      objectID: '99999',
      comment_text: '<p>ExampleCo - Data Scientist</p><p>Location: Remote</p>',
    };

    const job = parseJobFromComment(hit);
    expect(job.company).toBe('ExampleCo');
    expect(job.role).toBe('Data Scientist');
    expect(job.locations).toEqual(['Remote']);
    expect(job.workMode).toBe('remote');
    expect(job.remoteOnly).toBe(true);
    expect(job.employmentTypes).toEqual(['full-time']);
    expect(job.techStack).toEqual([]);
    expect(job.tags).toContain('remote-only');
    expect(job.url).toBe('https://news.ycombinator.com/item?id=99999');
  });
});
