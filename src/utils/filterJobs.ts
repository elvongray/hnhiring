import type { FilterState } from '../types/filters.ts';
import type { EmploymentType, Job, WorkMode } from '../types/job.ts';

const normalize = (value: string): string => value.trim().toLowerCase();

const containsTerm = (haystack: string, term: string): boolean =>
  haystack.includes(normalize(term));

const matchesQuery = (job: Job, query: string): boolean => {
  const terms = query
    .split(/\s+/)
    .map(normalize)
    .filter(Boolean);

  if (terms.length === 0) {
    return true;
  }

  const haystack = normalize(
    [
      job.company ?? '',
      job.role ?? '',
      job.locations.join(' '),
      job.techStack.join(' '),
      job.text,
    ].join(' ')
  );

  return terms.every((term) => haystack.includes(term));
};

const matchesLocations = (job: Job, locations: string[]): boolean => {
  if (locations.length === 0) {
    return true;
  }

  const jobLocations = job.locations.map(normalize);

  return locations.some((location) => {
    const target = normalize(location);
    return jobLocations.some((value) => value.includes(target));
  });
};

const matchesRemoteModes = (job: Job, remoteModes: WorkMode[]): boolean => {
  if (remoteModes.length === 0) {
    return true;
  }

  return remoteModes.includes(job.workMode);
};

const matchesRemoteOnly = (job: Job, remoteOnly: boolean): boolean =>
  !remoteOnly || job.remoteOnly;

const matchesExperience = (
  job: Job,
  experienceLevels: FilterState['experienceLevels']
): boolean => {
  if (experienceLevels.length === 0) {
    return true;
  }

  if (!job.experienceLevel) {
    return false;
  }

  return experienceLevels.includes(job.experienceLevel);
};

const matchesVisa = (job: Job, visa: FilterState['visa']): boolean => {
  if (visa === 'any') {
    return true;
  }

  if (visa === 'yes') {
    return job.visa === true;
  }

  return job.visa === false;
};

const matchesEmployment = (
  job: Job,
  employmentTypes: EmploymentType[]
): boolean => {
  if (employmentTypes.length === 0) {
    return true;
  }

  return job.employmentTypes.some((type) => employmentTypes.includes(type));
};

const matchesTech = (job: Job, techFilters: string[]): boolean => {
  if (techFilters.length === 0) {
    return true;
  }

  const techStack = job.techStack.map(normalize);

  return techFilters.every((tech) =>
    techStack.includes(normalize(tech))
  );
};

const matchesTimezone = (job: Job, timezone: string | null): boolean => {
  if (!timezone) {
    return true;
  }

  if (!job.timezone) {
    return false;
  }

  return containsTerm(normalize(job.timezone), timezone);
};

const matchesSalary = (
  job: Job,
  salaryMin: number | null,
  salaryMax: number | null
): boolean => {
  if (salaryMin === null && salaryMax === null) {
    return true;
  }

  if (!job.salary) {
    return false;
  }

  const min = job.salary.min ?? job.salary.max ?? null;
  const max = job.salary.max ?? job.salary.min ?? null;

  if (salaryMin !== null && (max === null || max < salaryMin)) {
    return false;
  }

  if (salaryMax !== null && (min === null || min > salaryMax)) {
    return false;
  }

  return true;
};

const matchesCompany = (job: Job, company: string | null): boolean => {
  if (!company) {
    return true;
  }

  const target = normalize(company);
  const candidate = normalize(job.company ?? '');

  return candidate.includes(target);
};

const sortBySalary = (
  jobs: Job[],
  direction: 'asc' | 'desc'
): Job[] => {
  return [...jobs].sort((a, b) => {
    const valueFor = (job: Job) => {
      if (!job.salary) {
        return null;
      }
      const min = job.salary.min ?? job.salary.max ?? 0;
      const max = job.salary.max ?? job.salary.min ?? 0;

      if (!min && !max) {
        return null;
      }

      return (min + max) / (min && max ? 2 : 1);
    };

    const aValue = valueFor(a);
    const bValue = valueFor(b);

    if (aValue === null && bValue === null) {
      return 0;
    }

    if (aValue === null) {
      return 1;
    }

    if (bValue === null) {
      return -1;
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });
};

const sortJobs = (jobs: Job[], sort: FilterState['sort']): Job[] => {
  switch (sort) {
    case 'newest':
      return [...jobs].sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
    case 'salary-asc':
      return sortBySalary(jobs, 'asc');
    case 'salary-desc':
      return sortBySalary(jobs, 'desc');
    case 'relevance':
    default:
      return jobs;
  }
};

export const filterJobs = (jobs: Job[], filters: FilterState): Job[] => {
  const filtered = jobs.filter((job) => {
    if (!matchesQuery(job, filters.query)) {
      return false;
    }

    if (!matchesCompany(job, filters.company)) {
      return false;
    }

    if (!matchesLocations(job, filters.locations)) {
      return false;
    }

    if (!matchesRemoteModes(job, filters.remoteModes)) {
      return false;
    }

    if (!matchesRemoteOnly(job, filters.remoteOnly)) {
      return false;
    }

    if (!matchesExperience(job, filters.experienceLevels)) {
      return false;
    }

    if (!matchesEmployment(job, filters.employmentTypes)) {
      return false;
    }

    if (!matchesVisa(job, filters.visa)) {
      return false;
    }

    if (!matchesTech(job, filters.tech)) {
      return false;
    }

    if (!matchesTimezone(job, filters.timezone)) {
      return false;
    }

    if (!matchesSalary(job, filters.salaryMin, filters.salaryMax)) {
      return false;
    }

    return true;
  });

  return sortJobs(filtered, filters.sort);
};
