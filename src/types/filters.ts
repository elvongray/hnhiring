import type {
  EmploymentType,
  ExperienceLevel,
  WorkMode,
} from './job.ts';

export type ViewMode = 'all' | 'starred' | 'applied' | 'notes';

export type VisaPreference = 'any' | 'yes' | 'no';

export type SortOrder = 'relevance' | 'newest' | 'salary-desc' | 'salary-asc';

export interface FilterState {
  query: string;
  company: string | null;
  locations: string[];
  remoteModes: WorkMode[];
  remoteOnly: boolean;
  timezone: string | null;
  visa: VisaPreference;
  employmentTypes: EmploymentType[];
  experienceLevels: ExperienceLevel[];
  tech: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  sort: SortOrder;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface FilterQueryParams {
  month?: string;
  query?: string;
  location?: string;
  remote?: 'true' | 'false';
  experience?: ExperienceLevel;
  tech?: string;
  page?: string;
  view?: ViewMode;
  sort?: SortOrder;
  visa?: Exclude<VisaPreference, 'any'>;
}

