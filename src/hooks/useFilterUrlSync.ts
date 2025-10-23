import { useEffect, useRef } from 'react';
import { useAppStore, createDefaultFilters } from '../store/useAppStore.ts';
import {
  applyFilterParams,
  areFiltersEqual,
  buildSearchParams,
  hasFilterSearchParams,
  isViewMode,
} from '../utils/filterParams.ts';

export const useFilterUrlSync = () => {
  const filters = useAppStore((state) => state.filters);
  const updateFilters = useAppStore((state) => state.updateFilters);
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const setSelectedMonth = useAppStore((state) => state.setSelectedMonth);
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      initializedRef.current = true;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const hasFilterParams = hasFilterSearchParams(params);

    if (hasFilterParams) {
      const baseFilters = createDefaultFilters();
      const nextFilters = applyFilterParams(params, baseFilters);

      if (!areFiltersEqual(nextFilters, filters)) {
        updateFilters(() => nextFilters);
      }
    }

    const monthParam = params.get('month');
    if (monthParam !== null && monthParam !== selectedMonth) {
      setSelectedMonth(monthParam === '' ? null : monthParam);
    }

    const viewParam = params.get('view');
    if (isViewMode(viewParam) && viewParam !== view) {
      setView(viewParam);
    }

    initializedRef.current = true;
  }, [
    filters,
    selectedMonth,
    setSelectedMonth,
    setView,
    updateFilters,
    view,
  ]);

  useEffect(() => {
    if (!initializedRef.current || typeof window === 'undefined') {
      return;
    }

    const params = buildSearchParams(filters, {
      month: selectedMonth,
      view,
    });

    const queryString = params.toString();
    const pathname = window.location.pathname;
    const hash = window.location.hash ?? '';
    const nextUrl =
      queryString.length > 0
        ? `${pathname}?${queryString}${hash}`
        : `${pathname}${hash}`;
    const currentUrl = `${pathname}${window.location.search}${hash}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [filters, selectedMonth, view]);
};
