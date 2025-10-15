export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'manager';

export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
  raw?: string;
}

export interface JobFlags {
  starred: boolean;
  applied: boolean;
  notes?: string;
}

export interface JobSourceMetadata {
  commentId: string;
  storyId: number;
  storyTitle?: string | null;
  storyUrl?: string | null;
  author: string;
  parentId?: number | null;
}

export interface Job {
  id: string;
  company?: string;
  role?: string;
  locations: string[];
  workMode: WorkMode;
  remoteOnly: boolean;
  timezone?: string;
  visa?: boolean;
  employmentTypes: EmploymentType[];
  experienceLevel?: ExperienceLevel;
  techStack: string[];
  salary?: SalaryRange;
  text: string;
  html?: string;
  createdAt: string;
  url: string;
  source: JobSourceMetadata;
  tags: string[];
  flags: JobFlags;
}
