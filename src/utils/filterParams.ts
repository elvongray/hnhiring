import type { FilterState, SortOrder, ViewMode } from '../types/filters.ts';
import type {
  EmploymentType,
  ExperienceLevel,
  WorkMode,
} from '../types/job.ts';

const WORK_MODES: WorkMode[] = ['onsite', 'hybrid', 'remote'];
const EMPLOYMENT_TYPES: EmploymentType[] = [
  'full-time',
  'part-time',
  'contract',
  'internship',
];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'junior',
  'mid',
  'senior',
  'lead',
  'manager',
];
const SORT_ORDERS: SortOrder[] = [
  'relevance',
  'newest',
  'salary-desc',
  'salary-asc',
];

const FILTER_PARAM_KEYS = new Set([
  'query',
  'company',
  'locations',
  'modes',
  'remoteOnly',
  'timezone',
  'visa',
  'employment',
  'experience',
  'tech',
  'salaryMin',
  'salaryMax',
  'sort',
]);

const parseList = (value: string | null): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const parseWorkModes = (value: string | null): WorkMode[] =>
  parseList(value)
    .map((item) => item.toLowerCase())
    .filter((item): item is WorkMode => WORK_MODES.includes(item as WorkMode));

const parseEmploymentTypes = (value: string | null): EmploymentType[] =>
  parseList(value)
    .map((item) => item.toLowerCase())
    .filter((item): item is EmploymentType =>
      EMPLOYMENT_TYPES.includes(item as EmploymentType)
    );

const parseExperienceLevels = (value: string | null): ExperienceLevel[] =>
  parseList(value)
    .map((item) => item.toLowerCase())
    .filter((item): item is ExperienceLevel =>
      EXPERIENCE_LEVELS.includes(item as ExperienceLevel)
    );

const parseNumber = (value: string | null): number | null => {
  if (value === null || value.trim() === '') {
    return null;
  }

  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return numeric;
};

const normalizeArray = (values: string[]): string[] =>
  [...values].sort((a, b) => a.localeCompare(b));

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  const normalizedA = normalizeArray(a);
  const normalizedB = normalizeArray(b);

  return normalizedA.every((value, index) => value === normalizedB[index]);
};

export const areFiltersEqual = (a: FilterState, b: FilterState): boolean =>
  a.query === b.query &&
  a.company === b.company &&
  arraysEqual(a.locations, b.locations) &&
  arraysEqual(a.remoteModes, b.remoteModes) &&
  a.remoteOnly === b.remoteOnly &&
  a.timezone === b.timezone &&
  a.visa === b.visa &&
  arraysEqual(a.employmentTypes, b.employmentTypes) &&
  arraysEqual(a.experienceLevels, b.experienceLevels) &&
  arraysEqual(a.tech, b.tech) &&
  a.salaryMin === b.salaryMin &&
  a.salaryMax === b.salaryMax &&
  a.sort === b.sort;

export const hasFilterSearchParams = (
  params: URLSearchParams
): boolean => Array.from(params.keys()).some((key) => FILTER_PARAM_KEYS.has(key));

export const applyFilterParams = (
  params: URLSearchParams,
  current: FilterState
): FilterState => {
  const next: FilterState = { ...current };

  if (params.has('query')) {
    next.query = params.get('query') ?? '';
  }

  if (params.has('company')) {
    const company = params.get('company') ?? '';
    next.company = company ? company : null;
  }

  if (params.has('locations')) {
    next.locations = parseList(params.get('locations'));
  }

  if (params.has('modes')) {
    next.remoteModes = parseWorkModes(params.get('modes'));
  }

  if (params.has('remoteOnly')) {
    const value = params.get('remoteOnly');
    next.remoteOnly =
      value === '1' || value?.toLowerCase() === 'true';
  }

  if (params.has('timezone')) {
    const timezone = params.get('timezone') ?? '';
    next.timezone = timezone ? timezone : null;
  }

  if (params.has('visa')) {
    const visa = params.get('visa');
    if (visa === 'yes' || visa === 'no') {
      next.visa = visa;
    } else {
      next.visa = 'any';
    }
  }

  if (params.has('employment')) {
    next.employmentTypes = parseEmploymentTypes(params.get('employment'));
  }

  if (params.has('experience')) {
    next.experienceLevels = parseExperienceLevels(params.get('experience'));
  }

  if (params.has('tech')) {
    next.tech = parseList(params.get('tech'));
  }

  if (params.has('salaryMin')) {
    next.salaryMin = parseNumber(params.get('salaryMin'));
  }

  if (params.has('salaryMax')) {
    next.salaryMax = parseNumber(params.get('salaryMax'));
  }

  if (params.has('sort')) {
    const sort = params.get('sort') ?? '';
    if (SORT_ORDERS.includes(sort as SortOrder)) {
      next.sort = sort as SortOrder;
    } else {
      next.sort = 'relevance';
    }
  }

  return next;
};

export const buildSearchParams = (
  filters: FilterState,
  {
    month,
    view,
  }: {
    month?: string | null;
    view?: ViewMode;
  } = {}
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.query.trim()) {
    params.set('query', filters.query.trim());
  }

  if (filters.company) {
    params.set('company', filters.company);
  }

  if (filters.locations.length > 0) {
    params.set('locations', filters.locations.join(','));
  }

  if (filters.remoteModes.length > 0) {
    params.set('modes', filters.remoteModes.join(','));
  }

  if (filters.remoteOnly) {
    params.set('remoteOnly', '1');
  }

  if (filters.timezone) {
    params.set('timezone', filters.timezone);
  }

  if (filters.visa !== 'any') {
    params.set('visa', filters.visa);
  }

  if (filters.employmentTypes.length > 0) {
    params.set('employment', filters.employmentTypes.join(','));
  }

  if (filters.experienceLevels.length > 0) {
    params.set('experience', filters.experienceLevels.join(','));
  }

  if (filters.tech.length > 0) {
    params.set('tech', filters.tech.join(','));
  }

  if (filters.salaryMin !== null) {
    params.set('salaryMin', String(filters.salaryMin));
  }

  if (filters.salaryMax !== null) {
    params.set('salaryMax', String(filters.salaryMax));
  }

  if (filters.sort !== 'relevance') {
    params.set('sort', filters.sort);
  }

  if (month) {
    params.set('month', month);
  }

  if (view && view !== 'all') {
    params.set('view', view);
  }

  return params;
};

export const isViewMode = (value: string | null): value is ViewMode =>
  value !== null &&
  (value === 'all' ||
    value === 'starred' ||
    value === 'applied' ||
    value === 'notes');
