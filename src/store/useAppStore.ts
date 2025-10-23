import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FilterState, ViewMode } from '../types/filters.ts';

export interface AppStoreState {
  selectedMonth: string | null;
  availableMonths: string[];
  view: ViewMode;
  filters: FilterState;
  setSelectedMonth: (month: string | null) => void;
  setAvailableMonths: (months: string[]) => void;
  setView: (view: ViewMode) => void;
  updateFilters: (
    updater: Partial<FilterState> | ((filters: FilterState) => FilterState)
  ) => void;
  resetFilters: () => void;
}

type PersistedAppState = Pick<
  AppStoreState,
  'selectedMonth' | 'filters' | 'view'
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

const createAppStore: StateCreator<
  AppStoreState,
  [['zustand/persist', unknown]],
  []
> = (set) => ({
  selectedMonth: null,
  availableMonths: [],
  view: 'all',
  filters: createDefaultFilters(),
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
    }),
    storage: persistedStorage,
  })
);
