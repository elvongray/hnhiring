import { Filter, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle.tsx';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/cn.ts';
import { Badge } from '../../components/ui/Badge.tsx';

export interface AppHeaderProps {
  className?: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const AppHeader = ({
  className,
  onToggleSidebar,
  sidebarOpen,
}: AppHeaderProps) => {
  const filterLabel = sidebarOpen ? 'Hide filters' : 'Show filters';

  return (
    <header
      className={cn(
        'flex flex-col gap-4 rounded-3xl border border-default bg-surface px-6 py-5 shadow-soft ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-secondary">
          hnhiring
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Hacker News hiring tracker
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-secondary sm:text-base">
          Discover and curate roles from monthly “Ask HN: Who is hiring?”
          threads, with filters, saved lists, and shareable views.
        </p>
        <Badge tone="accent" className="hidden md:inline-flex mt-4">
          Beta
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          className="inline-flex items-center gap-2"
          onClick={onToggleSidebar}
        >
          <Filter className="h-4 w-4" />
          {filterLabel}
        </Button>
        <a
          href="https://github.com/elvongray/hnhiring"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm text-secondary transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          View GitHub
          <ExternalLink className="h-4 w-4" />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
};
