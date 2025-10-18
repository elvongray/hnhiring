import { useEffect, useMemo } from 'react';
import { ChevronDown, RefreshCcw, Search } from 'lucide-react';
import { JobCard } from './JobCard.tsx';
import { Button } from '../ui/Button.tsx';
import { useAppStore } from '../../store/useAppStore.ts';
import type { HiringStorySummary } from '../../api/algolia.ts';

const generateFallbackMonths = (count: number): string[] => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - index);
    return date.toISOString().slice(0, 7);
  });
};

const formatMonth = (month: string): string => {
  const [year, monthPart] = month.split('-').map(Number);
  if (!year || !monthPart) {
    return month;
  }
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, monthPart - 1, 1)),
  );
};

export interface JobListProps {
  stories?: HiringStorySummary[];
  isLoading?: boolean;
}

export const JobList = ({ stories, isLoading }: JobListProps) => {
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const availableMonths = useAppStore((state) => state.availableMonths);
  const setSelectedMonth = useAppStore((state) => state.setSelectedMonth);
  const setAvailableMonths = useAppStore((state) => state.setAvailableMonths);

  const storyMonths = useMemo(() => {
    if (!stories || stories.length === 0) {
      return [] as string[];
    }

    return Array.from(new Set(stories.map((story) => story.monthKey)));
  }, [stories]);

  const fallbackMonths = useMemo(() => generateFallbackMonths(12), []);

  const monthOptions = useMemo(() => {
    if (storyMonths.length > 0) {
      return storyMonths;
    }
    if (availableMonths.length > 0) {
      return availableMonths;
    }
    return fallbackMonths;
  }, [availableMonths, fallbackMonths, storyMonths]);

  useEffect(() => {
    if (storyMonths.length > 0) {
      setAvailableMonths(storyMonths);
    }
  }, [setAvailableMonths, storyMonths]);

  useEffect(() => {
    if (!selectedMonth && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [selectedMonth, monthOptions, setSelectedMonth]);

  const activeMonth = selectedMonth ?? monthOptions[0] ?? '';

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-default px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Open roles</h2>
          <p className="text-sm text-secondary">
            Filtered roles from the latest whoishiring threads. Parsing in motion.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search within results"
              className="w-full rounded-full border border-default bg-surface-muted py-2 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={activeMonth}
                onChange={(event) => {
                  const next = event.target.value;
                  setSelectedMonth(next);
                }}
                className="w-full appearance-none rounded-full border border-default bg-surface-muted py-2 pl-4 pr-10 text-sm text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
                aria-hidden="true"
              />
            </div>
            <Button
              variant="ghost"
              className="h-10 rounded-full px-3"
              aria-label="Refresh jobs from Algolia"
              title="Refresh jobs from Algolia"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <SkeletonList />
        ) : (
          placeholderJobs.map((job) => <JobCard key={job.title} {...job} />)
        )}
      </div>
    </>
  );
};

const placeholderJobs = [
  {
    title: 'Senior React Engineer',
    company: 'Acme Systems',
    locations: ['Berlin', 'Remote EU'],
    workMode: 'Remote · Hybrid',
    snippet:
      'We are building the next generation of observability tooling for data-intensive teams. Work closely with product, design, and platform to deliver thoughtful experiences.',
    tags: ['TypeScript', 'React', 'Tailwind', 'AWS'],
    salary: '$140k – $170k + equity',
    posted: '3 days ago',
    href: 'https://news.ycombinator.com/item?id=12345',
  },
  {
    title: 'Rust Backend Engineer',
    company: 'Signal Forge',
    locations: ['Toronto', 'Remote NA'],
    workMode: 'Remote',
    snippet:
      'Join a small team designing privacy-first messaging infrastructure securing millions of conversations. You will own high-impact projects end-to-end.',
    tags: ['Rust', 'PostgreSQL', 'Kubernetes', 'Grafana'],
    salary: 'CA$160k – CA$190k',
    posted: '5 days ago',
    href: 'https://news.ycombinator.com/item?id=12346',
  },
  {
    title: 'Product Designer',
    company: 'Linear Labs',
    locations: ['New York'],
    workMode: 'Onsite',
    snippet:
      'We obsess over details to deliver a world-class issue tracking experience. Looking for a product-minded designer excited about systems thinking and prototyping.',
    tags: ['Figma', 'Design systems'],
    salary: '$120k – $150k',
    posted: '1 week ago',
    href: 'https://news.ycombinator.com/item?id=12347',
  },
];

const SkeletonList = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-3xl border border-default bg-surface px-6 py-5"
      >
        <div className="h-4 w-1/3 rounded-full bg-surface-muted" />
        <div className="mt-4 h-4 w-2/3 rounded-full bg-surface-muted" />
        <div className="mt-2 h-4 w-1/2 rounded-full bg-surface-muted" />
        <div className="mt-6 flex gap-3">
          <div className="h-6 w-20 rounded-full bg-surface-muted" />
          <div className="h-6 w-24 rounded-full bg-surface-muted" />
        </div>
      </div>
    ))}
  </div>
);
