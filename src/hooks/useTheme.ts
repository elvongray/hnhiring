import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hnhiring-theme';
const DEFAULT_THEME: Theme = 'dark';

export type Theme = 'light' | 'dark';

const readStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
};

const systemPrefersDark = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return DEFAULT_THEME === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = readStoredTheme();
    if (stored) {
      return stored;
    }
    return systemPrefersDark() ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggleTheme };
};

