import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import type { Job } from '../types/job.ts';

export type JobSearchIndex = Fuse<Job>;

export const jobSearchOptions: IFuseOptions<Job> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.32,
  keys: [
    { name: 'company', weight: 0.3 },
    { name: 'role', weight: 0.3 },
    { name: 'techStack', weight: 0.18 },
    { name: 'locations', weight: 0.12 },
    { name: 'text', weight: 0.1 },
  ],
};

export const createJobSearchIndex = (jobs: Job[]): JobSearchIndex =>
  new Fuse(jobs, jobSearchOptions);
