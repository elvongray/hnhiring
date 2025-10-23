import { useEffect, useMemo, useRef } from 'react';
import { ChevronDown, RefreshCcw, Search } from 'lucide-react';
import { JobCard } from './JobCard.tsx';
import { Button } from '../ui/Button.tsx';
import { useAppStore } from '../../store/useAppStore.ts';
import { useHiringComments, useHiringMonthHistory } from '../../api/hooks.ts';
import { parseJobFromComment } from '../../utils/parseJob.ts';
import { filterJobs } from '../../utils/filterJobs.ts';
import type { HiringStorySummary } from '../../api/algolia.ts';
import type { Job } from '../../types/job.ts';
import type { ViewMode } from '../../types/filters.ts';
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
  const filters = useAppStore((state) => state.filters);
  const view = useAppStore((state) => state.view);
  const jobFlags = useAppStore((state) => state.jobFlags);
  const savedJobs = useAppStore((state) => state.savedJobs);
  const updateJobFlags = useAppStore((state) => state.updateJobFlags);

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

  useEffect(() => {
    const root = listRef.current;
    if (root) {
      root.scrollTo({ top: 0 });
    }
  }, [activeStory?.storyId]);

  const handleLoadMore = () => {
    if (!isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const commentHits = useMemo(() => {
    const allHits = commentPages?.pages.flatMap((page) => page.hits) ?? [];
    if (!activeStory) {
      return allHits;
    }

    return allHits.filter((hit) => hit.parent_id === activeStory.storyId);
  }, [commentPages, activeStory]);

  const jobs = useMemo(
    () => commentHits.map((hit) => parseJobFromComment(hit)),
    [commentHits]
  );

  const jobsWithFlags = useMemo(() => {
    if (
      (!savedJobs || Object.keys(savedJobs).length === 0) &&
      (!jobFlags || Object.keys(jobFlags).length === 0)
    ) {
      return jobs;
    }

    return jobs.map((job) => {
      const flags =
        jobFlags[job.objectId] ??
        savedJobs[job.objectId]?.flags ??
        job.flags;

      if (flags === job.flags) {
        return job;
      }

      return {
        ...job,
        flags,
      };
    });
  }, [jobs, jobFlags, savedJobs]);

  const savedJobValues = useMemo(() => Object.values(savedJobs), [savedJobs]);

  const allJobs = useMemo(() => {
    if (savedJobValues.length === 0) {
      return jobsWithFlags;
    }

    const existingIds = new Set(jobsWithFlags.map((job) => job.objectId));

    const extras = savedJobValues.filter(
      (savedJob) => !existingIds.has(savedJob.objectId)
    );

    return [...jobsWithFlags, ...extras];
  }, [jobsWithFlags, savedJobValues]);

  const filteredJobs = useMemo(
    () => filterJobs(allJobs, filters),
    [allJobs, filters]
  );

  const displayJobs = useMemo(
    () =>
      applyViewFilter(
        filteredJobs,
        view,
        activeStory?.storyId ?? null
      ),
    [filteredJobs, view, activeStory?.storyId]
  );

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.query ||
        filters.company ||
        filters.locations.length > 0 ||
        filters.remoteModes.length > 0 ||
        filters.remoteOnly ||
        filters.timezone ||
        filters.visa !== 'any' ||
        filters.employmentTypes.length > 0 ||
        filters.experienceLevels.length > 0 ||
        filters.tech.length > 0 ||
        filters.salaryMin !== null ||
        filters.salaryMax !== null ||
        filters.sort !== 'relevance'
    );
  }, [filters]);

  const hasViewFilter = view !== 'all';

  const isInitialLoading =
    isLoadingMonths || (!commentPages && isLoadingComments);
  const totalJobs = displayJobs.length;
  const filteredCount = filteredJobs.length;
  const monthLabel = activeMonth ? formatMonth(activeMonth) : 'recent months';
  const filteredFragment =
    (hasActiveFilters || hasViewFilter) && filteredCount !== totalJobs
      ? ` of ${filteredCount}`
      : '';
  const headerText =
    view === 'all'
      ? `Showing ${totalJobs}${filteredFragment} parsed postings from ${monthLabel}.`
      : `Showing ${totalJobs}${filteredFragment} ${describeViewForHeader(view)}${
          hasActiveFilters ? ' matching your filters' : ''
        }.`;

  const handleToggleStar = (job: Job) => {
    updateJobFlags(job, { starred: !job.flags.starred });
  };

  const handleToggleApplied = (job: Job) => {
    updateJobFlags(job, { applied: !job.flags.applied });
  };

  const handleEditNotes = (job: Job) => {
    if (typeof window === 'undefined') {
      return;
    }

    const current = job.flags.notes ?? '';
    const next = window.prompt('Add notes for this job', current);
    if (next === null || next === current) {
      return;
    }

    updateJobFlags(job, { notes: next });
  };

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
              : headerText}
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
        ) : displayJobs.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            hasViewFilter={hasViewFilter}
            view={view}
          />
        ) : (
          displayJobs.map((job) => (
            <JobCard
              key={job.objectId}
              title={job.role ?? 'Role TBD'}
              company={job.company ?? 'Company confidential'}
              locations={
                job.locations.length > 0 ? job.locations : ['Location TBD']
              }
              workMode={[job.workMode, job.remoteOnly ? 'Remote only' : null]
                .filter(Boolean)
                .join(' · ')}
              snippet={job.text}
              tags={job.tags.slice(0, 6)}
              posted={formatDate(job.createdAt)}
              href={job.url}
              flags={job.flags}
              onToggleStar={() => handleToggleStar(job)}
              onToggleApplied={() => handleToggleApplied(job)}
              onEditNotes={() => handleEditNotes(job)}
            />
          ))
        )}
        {view === 'all' && hasNextPage ? (
          <div className="pb-6 pt-2 text-center">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              className="px-5"
            >
              {isFetchingNextPage ? 'Loading more…' : 'Load more jobs'}
            </Button>
          </div>
        ) : (
          !isInitialLoading &&
          view === 'all' &&
          displayJobs.length > 0 && (
            <p className="pb-6 text-center text-xs uppercase tracking-[0.3em] text-secondary">
              End of thread
            </p>
          )
        )}
      </div>
    </>
  );
};

const applyViewFilter = (
  jobs: Job[],
  view: ViewMode,
  activeStoryId: number | null
): Job[] => {
  switch (view) {
    case 'starred':
      return jobs.filter((job) => job.flags.starred);
    case 'applied':
      return jobs.filter((job) => job.flags.applied);
    case 'notes':
      return jobs.filter(
        (job) => Boolean(job.flags.notes && job.flags.notes.trim().length > 0)
      );
    case 'all':
    default:
      if (activeStoryId === null) {
        return jobs;
      }
      return jobs.filter((job) => job.source.storyId === activeStoryId);
  }
};

const describeViewForHeader = (view: ViewMode): string => {
  switch (view) {
    case 'starred':
      return 'starred postings';
    case 'applied':
      return 'tracked applications';
    case 'notes':
      return 'jobs with notes';
    case 'all':
    default:
      return 'parsed postings';
  }
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

const EmptyState = ({
  hasActiveFilters,
  hasViewFilter,
  view,
}: {
  hasActiveFilters: boolean;
  hasViewFilter: boolean;
  view: ViewMode;
}) => {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-default bg-surface/40 px-8 py-16 text-center">
        <p className="text-base font-semibold">No matches found</p>
        <p className="mt-2 max-w-md text-sm text-secondary">
          Try adjusting or clearing filters to broaden your search.
        </p>
      </div>
    );
  }

  if (hasViewFilter) {
    const messages: Record<ViewMode, { title: string; description: string }> = {
      all: {
        title: 'No jobs parsed yet',
        description:
          'Once the latest “Ask HN: Who is hiring?” thread loads, parsed job posts will appear here. Try refreshing the thread or selecting a different month.',
      },
      starred: {
        title: 'No starred jobs yet',
        description:
          'Use the star action to bookmark interesting roles. They will stay saved locally so you can revisit them anytime.',
      },
      applied: {
        title: 'No applications tracked',
        description:
          'Mark jobs as applied to keep track of your outreach. Saved applications stay in sync locally.',
      },
      notes: {
        title: 'No notes added',
        description:
          'Add notes to any job to keep follow-ups or reminders. Jobs with notes show up here for quick reference.',
      },
    };

    const { title, description } = messages[view] ?? messages.all;

    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-default bg-surface/40 px-8 py-16 text-center">
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-default bg-surface/40 px-8 py-16 text-center">
      <p className="text-base font-semibold">No jobs parsed yet</p>
      <p className="mt-2 max-w-md text-sm text-secondary">
        Once the latest “Ask HN: Who is hiring?” thread loads, parsed job posts
        will appear here. Try refreshing the thread or selecting a different
        month.
      </p>
    </div>
  );
};

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
