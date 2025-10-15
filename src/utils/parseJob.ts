import type { AlgoliaCommentHit } from '../types/algolia.ts';
import type {
  EmploymentType,
  ExperienceLevel,
  Job,
  SalaryRange,
  WorkMode,
} from '../types/job.ts';
import { extractTechKeywords } from './techDictionary.ts';
import {
  decodeHtmlEntities,
  normalizeWhitespace,
} from './text.ts';

const HEADER_DELIMITER = /[\u2013\u2014\u2012\u2010\-|•·]+/;
const LOCATION_DELIMITER = /[,/|•·]|(?:\s+or\s+)|(?:\s+and\s+)/i;
const TIMEZONE_PATTERN =
  /\b(?:UTC[+-]\d{1,2}(?::?\d{2})?|GMT|CET|CEST|EST|EDT|PST|PDT|CST|CDT|IST|AEST|AEDT)\b/gi;
const VISA_POSITIVE = /\bvisa (sponsorship|support|available|provided)\b/i;
const VISA_NEGATIVE =
  /\b(no (visa|sponsorship)|cannot sponsor|unable to sponsor|no sponsorship)\b/i;
const REMOTE_ONLY_PATTERNS = [
  /\bremote[-\s]?only\b/i,
  /\bfully remote\b/i,
  /\b100% remote\b/i,
  /\bremote-first\b/i,
];
const WORK_MODE_KEYWORDS: Record<WorkMode, RegExp> = {
  remote: /\bremote\b/i,
  hybrid: /\bhybrid\b/i,
  onsite: /\b(on[-\s]?site|in[-\s]?office)\b/i,
};

const EMPLOYMENT_TYPE_KEYWORDS: Record<EmploymentType, RegExp> = {
  'full-time': /\bfull[-\s]?time\b/i,
  'part-time': /\bpart[-\s]?time\b/i,
  contract: /\b(contract|freelance|consultant)\b/i,
  internship: /\b(intern(ship)?|co[-\s]?op)\b/i,
};

const EXPERIENCE_PATTERNS: Array<{
  level: ExperienceLevel;
  expressions: RegExp[];
}> = [
  { level: 'lead', expressions: [/\blead\b/i, /\bprincipal\b/i, /\bstaff\b/i] },
  {
    level: 'manager',
    expressions: [/\bmanager\b/i, /\bhead of\b/i, /\bdirector\b/i],
  },
  {
    level: 'senior',
    expressions: [/\bsenior\b/i, /\bSr\.?\b/i],
  },
  {
    level: 'mid',
    expressions: [/\bmid\b/i, /\bmid[-\s]?level\b/i],
  },
  {
    level: 'junior',
    expressions: [/\bjunior\b/i, /\bnew grad\b/i, /\bentry[-\s]?level\b/i],
  },
];

const SALARY_PATTERN =
  /(?:(USD|EUR|GBP|CAD|AUD|CHF|SEK|NOK|DKK|JPY|INR|SGD|HKD)\s*)?([$€£])?\s?(\d{2,3}(?:[.,]\d{3})?)(?:[.,](\d+))?\s?(k|K|m|M)?/gi;

const CURRENCY_FROM_SYMBOL: Record<string, string> = {
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
};

const sanitizeLine = (line: string): string =>
  normalizeWhitespace(line.replace(/^[•\-\*\u2022]+\s*/, '').replace(/\s+[:|-]\s*$/, ''));

export const htmlToPlainText = (html: string): string => {
  if (!html) {
    return '';
  }

  const withBreaks = html
    .replace(/<\/(p|div|li|ul|ol|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/h\d>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<p>/gi, '\n');

  const withoutTags = withBreaks.replace(/<[^>]+>/g, '');
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded
    .split('\n')
    .map((segment) => sanitizeLine(segment))
    .filter((segment) => segment.length > 0)
    .join('\n');
};

const parseHeader = (firstLine: string) => {
  const cleaned = sanitizeLine(firstLine);
  if (!cleaned) {
    return {};
  }

  const parts = cleaned
    .split(HEADER_DELIMITER)
    .map((part) => sanitizeLine(part))
    .filter(Boolean);

  if (parts.length === 0) {
    return {};
  }

  const [company, role, ...locationParts] = parts;
  return {
    company,
    role,
    locationParts,
  };
};

const splitLocations = (value: string): string[] =>
  value
    .split(LOCATION_DELIMITER)
    .map((part) => sanitizeLine(part))
    .filter(Boolean);

const extractLocations = (
  lines: string[],
  initial: string[],
): string[] => {
  const results: string[] = [];
  const seen = new Set<string>();

  const push = (location: string) => {
    const normalized = sanitizeLine(location);
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push(normalized);
    }
  };

  for (const part of initial) {
    for (const location of splitLocations(part)) {
      push(location);
    }
  }

  for (const line of lines) {
    const match = line.match(/^locations?:\s*(.+)$/i);
    if (match) {
      for (const location of splitLocations(match[1])) {
        push(location);
      }
    }
  }

  if (results.length === 0) {
    for (const line of lines.slice(1, 3)) {
      if (/\b(remote|onsite|hybrid|usa|europe|asia|canada)\b/i.test(line)) {
        for (const location of splitLocations(line)) {
          push(location);
        }
      }
    }
  }

  return results;
};

const inferWorkMode = (text: string, locations: string[]): {
  mode: WorkMode;
  remoteOnly: boolean;
} => {
  const remoteMatch = WORK_MODE_KEYWORDS.remote.test(text);
  const hybridMatch = WORK_MODE_KEYWORDS.hybrid.test(text);
  const onsiteMatch = WORK_MODE_KEYWORDS.onsite.test(text);

  if (remoteMatch && hybridMatch) {
    return { mode: 'hybrid', remoteOnly: false };
  }

  if (remoteMatch && onsiteMatch) {
    return { mode: 'hybrid', remoteOnly: false };
  }

  if (remoteMatch) {
    const remoteOnly =
      REMOTE_ONLY_PATTERNS.some((pattern) => pattern.test(text)) ||
      locations.every((location) => /remote/i.test(location));
    return { mode: 'remote', remoteOnly };
  }

  if (hybridMatch) {
    return { mode: 'hybrid', remoteOnly: false };
  }

  return { mode: onsiteMatch ? 'onsite' : 'onsite', remoteOnly: false };
};

const inferEmploymentTypes = (text: string): EmploymentType[] => {
  const matches = Object.entries(EMPLOYMENT_TYPE_KEYWORDS)
    .filter(([, pattern]) => pattern.test(text))
    .map(([type]) => type as EmploymentType);

  if (matches.length === 0) {
    return ['full-time'];
  }

  return matches;
};

const inferExperienceLevel = (text: string): ExperienceLevel | undefined => {
  for (const { level, expressions } of EXPERIENCE_PATTERNS) {
    if (expressions.some((pattern) => pattern.test(text))) {
      return level;
    }
  }

  return undefined;
};

const inferTimezone = (text: string): string | undefined => {
  const match = text.match(TIMEZONE_PATTERN);
  if (!match) {
    return undefined;
  }

  const [timezone] = match;
  return timezone.toUpperCase();
};

const inferVisa = (text: string): boolean | undefined => {
  if (VISA_NEGATIVE.test(text)) {
    return false;
  }

  if (VISA_POSITIVE.test(text)) {
    return true;
  }

  return undefined;
};

const parseSalaryValue = (value: string): number | undefined => {
  const cleaned = value.replace(/[^0-9.,kKmM]/g, '');
  if (!cleaned) {
    return undefined;
  }

  const suffix = cleaned.slice(-1).toLowerCase();
  const hasSuffix = suffix === 'k' || suffix === 'm';
  const numericPart = hasSuffix ? cleaned.slice(0, -1) : cleaned;
  const numeric = Number.parseFloat(numericPart.replace(/,/g, ''));

  if (Number.isNaN(numeric)) {
    return undefined;
  }

  if (suffix === 'k') {
    return Math.round(numeric * 1_000);
  }

  if (suffix === 'm') {
    return Math.round(numeric * 1_000_000);
  }

  if (cleaned.includes(',')) {
    return Math.round(Number.parseFloat(cleaned.replace(/,/g, '')));
  }

  return Math.round(numeric);
};

const parseSalary = (text: string): SalaryRange | undefined => {
  const matches = Array.from(text.matchAll(SALARY_PATTERN));
  if (matches.length === 0) {
    return undefined;
  }

  const [first, second] = matches;

  const toCurrency = (match: RegExpMatchArray): string | undefined => {
    const [_, currencyCode, symbol] = match;
    if (currencyCode) {
      return currencyCode.toUpperCase();
    }
    if (symbol) {
      return CURRENCY_FROM_SYMBOL[symbol] ?? symbol;
    }
    return undefined;
  };

  const currency = toCurrency(first);
  const min = parseSalaryValue(first[0]);
  const max = second ? parseSalaryValue(second[0]) : undefined;

  const rawValues = matches.map((match) => match[0].trim()).join(' - ');

  return {
    min: min ?? undefined,
    max: max ?? min,
    currency,
    raw: rawValues,
  };
};

const buildTags = (
  techStack: string[],
  workMode: WorkMode,
  remoteOnly: boolean,
  employmentTypes: EmploymentType[],
  experience?: ExperienceLevel,
  timezone?: string,
  visa?: boolean,
): string[] => {
  const tags = new Set<string>();

  for (const tech of techStack) {
    tags.add(tech);
  }

  tags.add(workMode);

  if (remoteOnly) {
    tags.add('remote-only');
  }

  for (const type of employmentTypes) {
    tags.add(type);
  }

  if (experience) {
    tags.add(experience);
  }

  if (timezone) {
    tags.add(timezone);
  }

  if (visa === true) {
    tags.add('visa');
  } else if (visa === false) {
    tags.add('no-visa');
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

const DEFAULT_FLAGS = { starred: false, applied: false } as const;

export const parseJobFromComment = (hit: AlgoliaCommentHit): Job => {
  const html = hit.comment_text ?? hit.text ?? '';
  const plainText = htmlToPlainText(html);
  const lines = plainText.split('\n').map((line) => line.trim()).filter(Boolean);

  const { company, role, locationParts = [] } = parseHeader(lines[0] ?? '');
  const locations = extractLocations(lines, locationParts);

  const normalizedText = plainText.toLowerCase();

  const { mode: workMode, remoteOnly } = inferWorkMode(normalizedText, locations);
  const employmentTypes = inferEmploymentTypes(normalizedText);
  const experienceLevel = inferExperienceLevel(normalizedText);
  const timezone = inferTimezone(plainText);
  const visa = inferVisa(normalizedText);
  const salary = parseSalary(plainText);
  const techStack = extractTechKeywords(plainText);

  const url =
    hit.url ??
    (hit.id ? `https://news.ycombinator.com/item?id=${hit.id}` : undefined) ??
    '';

  const tags = buildTags(
    techStack,
    workMode,
    remoteOnly,
    employmentTypes,
    experienceLevel,
    timezone,
    visa,
  );

  return {
    id: hit.id,
    company: company || undefined,
    role: role || undefined,
    locations,
    workMode,
    remoteOnly,
    timezone,
    visa,
    employmentTypes,
    experienceLevel,
    techStack,
    salary,
    text: plainText,
    html: html || undefined,
    createdAt: hit.created_at,
    url,
    source: {
      commentId: hit.id,
      storyId: hit.story_id,
      storyTitle: hit.story_title ?? undefined,
      storyUrl: hit.story_url ?? undefined,
      author: hit.author,
      parentId: hit.parent_id ?? undefined,
    },
    tags,
    flags: {
      ...DEFAULT_FLAGS,
      notes: undefined,
    },
  };
};

