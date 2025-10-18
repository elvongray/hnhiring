import { Moon, Sun } from 'lucide-react';
import { Button } from './Button.tsx';
import { useTheme } from '../../hooks/useTheme.ts';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const Icon = theme === 'dark' ? Sun : Moon;
  const label =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button
      variant="ghost"
      className="h-12 w-12 cursor-pointer rounded-full p-0 text-secondary hover:text-[color:var(--text-primary)]"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon className="h-6 w-6" strokeWidth={1.6} />
    </Button>
  );
};
