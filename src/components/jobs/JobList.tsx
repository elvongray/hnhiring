import { useEffect, useMemo, useRef } from 'react';
import { ChevronDown, RefreshCcw, Search } from 'lucide-react';
import { JobCard } from './JobCard.tsx';
import { Button } from '../ui/Button.tsx';
import { useAppStore } from '../../store/useAppStore.ts';
import { useHiringComments, useHiringMonthHistory } from '../../api/hooks.ts';
import { parseJobFromComment } from '../../utils/parseJob.ts';
import type { HiringStorySummary } from '../../api/algolia.ts';
import { cn } from '../../lib/cn.ts';

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
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, monthPart - 1, 1)));
};

export const JobList = () => {
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const availableMonths = useAppStore((state) => state.availableMonths);
  const setSelectedMonth = useAppStore((state) => state.setSelectedMonth);
  const setAvailableMonths = useAppStore((state) => state.setAvailableMonths);

  const {
    data: monthStories,
    isLoading: isLoadingMonths,
    isError: isMonthError,
    error: monthError,
    refetch: refetchMonths,
  } = useHiringMonthHistory(24);

  const storyMonths = useMemo(() => {
    if (!monthStories || monthStories.length === 0) {
      return [] as string[];
    }

    return Array.from(new Set(monthStories.map((story) => story.monthKey)));
  }, [monthStories]);

  const fallbackMonths = useMemo(() => generateFallbackMonths(24), []);

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
    if (monthOptions.length > 0) {
      setAvailableMonths(monthOptions);
    }
  }, [monthOptions, setAvailableMonths]);

  useEffect(() => {
    if (!selectedMonth && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [selectedMonth, monthOptions, setSelectedMonth]);

  const activeMonth = selectedMonth ?? monthOptions[0] ?? '';

  const activeStory: HiringStorySummary | undefined = useMemo(() => {
    if (!monthStories || monthStories.length === 0) {
      return undefined;
    }

    return (
      monthStories.find((story) => story.monthKey === activeMonth) ??
      monthStories[0]
    );
  }, [activeMonth, monthStories]);

  const {
    data: commentPages,
    isLoading: isLoadingComments,
    isError: isCommentsError,
    error: commentsError,
    refetch: refetchComments,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingComments,
    isFetchingNextPage,
  } = useHiringComments(activeStory?.storyId ?? null, {
    enabled: Boolean(activeStory),
    hitsPerPage: 50,
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = listRef.current;
    if (root) {
      root.scrollTo({ top: 0 });
    }
  }, [activeStory?.storyId]);

  useEffect(() => {
    const root = listRef.current;
    const target = loadMoreRef.current;
    if (!root || !target || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, activeStory?.storyId]);

  const commentHits = useMemo(
    () => commentPages?.pages.flatMap((page) => page.hits) ?? [],
    [commentPages]
  );

  const jobs = useMemo(
    () => commentHits.map((hit) => parseJobFromComment(hit)),
    [commentHits]
  );

  const isInitialLoading =
    isLoadingMonths || (!commentPages && isLoadingComments);
  const totalJobs = jobs.length;

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-default px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">
            {activeStory ? activeStory.title : 'Who is hiring?'}
          </h2>
          <p className="text-sm text-secondary">
            {isMonthError
              ? monthError?.message ?? 'Unable to load thread history.'
              : `Showing ${totalJobs} parsed postings from ${
                  activeMonth ? formatMonth(activeMonth) : 'recent months'
                }.`}
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
              onClick={() => refetchComments()}
              disabled={!activeStory || isFetchingComments}
            >
              <RefreshCcw
                className={cn(
                  'h-4 w-4 transition',
                  isFetchingComments ? 'animate-spin' : undefined
                )}
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {isInitialLoading ? (
          <SkeletonList />
        ) : isMonthError ? (
          <ErrorState
            message={monthError?.message ?? 'Failed to load hiring threads.'}
            onRetry={() => refetchMonths()}
          />
        ) : isCommentsError ? (
          <ErrorState
            message={commentsError?.message ?? 'Failed to load job comments.'}
            onRetry={() => refetchComments()}
          />
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job}
              title={job.role ?? 'Role TBD'}
              company={job.company ?? 'Company confidential'}
              locations={
                job.locations.length > 0 ? job.locations : ['Location TBD']
              }
              workMode={[job.workMode, job.remoteOnly ? 'Remote only' : null]
                .filter(Boolean)
                .join(' · ')}
              snippet={createSnippet(job.text)}
              tags={job.tags.slice(0, 6)}
              salary={
                job.salary?.raw ??
                formatSalary(
                  job.salary?.min,
                  job.salary?.max,
                  job.salary?.currency
                )
              }
              posted={formatDate(job.createdAt)}
              href={job.url}
            />
          ))
        )}
        <div ref={loadMoreRef} className="h-10" />
        {hasNextPage && isFetchingNextPage && (
          <p className="pb-6 text-center text-sm text-secondary">
            Loading more roles…
          </p>
        )}
      </div>
    </>
  );
};

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

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-default bg-surface/40 px-8 py-16 text-center">
    <p className="text-base font-semibold">No jobs parsed yet</p>
    <p className="mt-2 max-w-md text-sm text-secondary">
      Once the latest “Ask HN: Who is hiring?” thread loads, parsed job posts
      will appear here. Try refreshing the thread or selecting a different
      month.
    </p>
  </div>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/5 px-8 py-12 text-center text-secondary">
    <p className="text-sm">{message}</p>
    <Button variant="secondary" onClick={onRetry} className="px-5">
      Try again
    </Button>
  </div>
);

const createSnippet = (text: string, length = 240): string => {
  if (!text) {
    return 'No description provided.';
  }

  const condensed = text.replace(/\s+/g, ' ').trim();
  if (condensed.length <= length) {
    return condensed;
  }
  return `${condensed.slice(0, length).trim()}…`;
};

const formatSalary = (
  min?: number,
  max?: number,
  currency?: string
): string | undefined => {
  if (!min && !max) {
    return undefined;
  }

  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  });

  if (min && max && min !== max) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }

  const value = max ?? min ?? 0;
  return formatter.format(value);
};

const formatDate = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};
