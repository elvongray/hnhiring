import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FilterState, ViewMode } from '../types/filters.ts';
import type { Job, JobFlags } from '../types/job.ts';

export interface AppStoreState {
  selectedMonth: string | null;
  availableMonths: string[];
  view: ViewMode;
  filters: FilterState;
  jobFlags: Record<string, JobFlags>;
  savedJobs: Record<string, Job>;
  setSelectedMonth: (month: string | null) => void;
  setAvailableMonths: (months: string[]) => void;
  setView: (view: ViewMode) => void;
  updateFilters: (
    updater: Partial<FilterState> | ((filters: FilterState) => FilterState)
  ) => void;
  resetFilters: () => void;
  updateJobFlags: (job: Job, updates: Partial<JobFlags>) => Job;
}

type PersistedAppState = Pick<
  AppStoreState,
  'selectedMonth' | 'filters' | 'view' | 'savedJobs' | 'jobFlags'
>;

export const createDefaultFilters = (): FilterState => ({
  query: '',
  company: null,
  locations: [],
  remoteModes: [],
  remoteOnly: false,
  timezone: null,
  visa: 'any',
  employmentTypes: [],
  experienceLevels: [],
  tech: [],
  salaryMin: null,
  salaryMax: null,
  sort: 'relevance',
});

const sanitizeNotes = (notes: string | undefined): string | undefined => {
  if (notes === undefined) {
    return undefined;
  }

  const trimmed = notes.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const DEFAULT_FLAGS: JobFlags = {
  starred: false,
  applied: false,
};

const shouldPersistJob = (flags: JobFlags): boolean =>
  Boolean(
    flags.starred ||
      flags.applied ||
      (flags.notes && flags.notes.trim().length > 0)
  );

const createAppStore: StateCreator<
  AppStoreState,
  [['zustand/persist', unknown]],
  []
> = (set) => ({
  selectedMonth: null,
  availableMonths: [],
  view: 'all',
  filters: createDefaultFilters(),
  jobFlags: {},
  savedJobs: {},
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setAvailableMonths: (availableMonths) => set({ availableMonths }),
  setView: (view) => set({ view }),
  updateFilters: (updater) =>
    set((state) => {
      const nextFilters: FilterState =
        typeof updater === 'function'
          ? updater(state.filters)
          : { ...state.filters, ...updater };

      return { filters: nextFilters };
    }),
  resetFilters: () => set({ filters: createDefaultFilters() }),
  updateJobFlags: (job, updates) => {
    let nextJob: Job = job;

    set((state) => {
      const existingFlags =
        state.jobFlags[job.objectId] ?? job.flags ?? DEFAULT_FLAGS;
      const existing = state.savedJobs[job.objectId];
      const baseJob = existing ?? job;
      const nextFlags: JobFlags = {
        ...existingFlags,
        ...updates,
      };
      const normalizedFlags: JobFlags = {
        ...nextFlags,
        notes: sanitizeNotes(nextFlags.notes),
      };

      nextJob = {
        ...baseJob,
        ...job,
        flags: normalizedFlags,
      };

      const savedJobs = { ...state.savedJobs };
      const jobFlags = { ...state.jobFlags };

      if (shouldPersistJob(normalizedFlags)) {
        savedJobs[nextJob.objectId] = nextJob;
        jobFlags[nextJob.objectId] = normalizedFlags;
      } else {
        delete savedJobs[nextJob.objectId];
        delete jobFlags[nextJob.objectId];
      }

      return { savedJobs, jobFlags };
    });

    return nextJob;
  },
});

const persistedStorage =
  typeof window === 'undefined'
    ? undefined
    : createJSONStorage<PersistedAppState>(() => window.localStorage);

export const useAppStore = create<AppStoreState>()(
  persist<AppStoreState, [], [], PersistedAppState>(createAppStore, {
    name: 'hnhiring',
    partialize: (state): PersistedAppState => ({
      selectedMonth: state.selectedMonth,
      filters: state.filters,
      view: state.view,
      savedJobs: state.savedJobs,
      jobFlags: state.jobFlags,
    }),
    storage: persistedStorage,
  })
);
