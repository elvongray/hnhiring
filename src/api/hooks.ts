import {
  type QueryKey,
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { AlgoliaCommentHit } from '../types/algolia.ts';
import type { HiringCommentPage, HiringStorySummary } from './algolia.ts';
import {
  fetchAllHiringComments,
  fetchHiringCommentsPage,
  fetchHiringMonthHistory,
  fetchLatestHiringStory,
} from './algolia.ts';

const DEFAULT_STALE_TIME = 1000 * 60 * 30; // 30 minutes
const DEFAULT_GC_TIME = DEFAULT_STALE_TIME * 2;

const monthsKey = (limit: number): QueryKey => ['hiring', 'months', limit];
const latestKey: QueryKey = ['hiring', 'latest'];
const commentsKey = (storyId: number, hitsPerPage: number): QueryKey => [
  'hiring',
  'comments',
  storyId,
  hitsPerPage,
];

export const useLatestHiringStory = (
  options?: UseQueryOptions<HiringStorySummary, Error, HiringStorySummary>
): UseQueryResult<HiringStorySummary, Error> =>
  useQuery<HiringStorySummary, Error, HiringStorySummary>({
    queryKey: latestKey,
    queryFn: fetchLatestHiringStory,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: 1,
    ...options,
  });

export const useHiringMonthHistory = (
  limit = 24,
  options?: UseQueryOptions<HiringStorySummary[], Error, HiringStorySummary[]>
): UseQueryResult<HiringStorySummary[], Error> =>
  useQuery<HiringStorySummary[], Error>({
    queryKey: monthsKey(limit),
    queryFn: () => fetchHiringMonthHistory(limit),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: 1,
    ...options,
  });

export interface UseHiringCommentsOptions
  extends Omit<
    UseInfiniteQueryOptions<HiringCommentPage, Error>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  > {
  hitsPerPage?: number;
  enabled?: boolean;
}

export const useHiringComments = (
  storyId: number | null | undefined,
  {
    hitsPerPage = 200,
    enabled = true,
    ...options
  }: UseHiringCommentsOptions = {}
): UseInfiniteQueryResult<HiringCommentPage, Error> =>
  useInfiniteQuery({
    queryKey: storyId
      ? commentsKey(storyId, hitsPerPage)
      : ['hiring', 'comments', 'disabled'],
    enabled: Boolean(storyId) && enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      if (!storyId) {
        throw new Error('Story id is required to load comments.');
      }
      return fetchHiringCommentsPage(storyId, pageParam, hitsPerPage);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page + 1 < lastPage.nbPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: 1,
    ...options,
  });

export const useAllHiringComments = (
  storyId: number | null | undefined,
  {
    enabled = true,
    hitsPerPage = 200,
    ...options
  }: { enabled?: boolean; hitsPerPage?: number } & Omit<
    UseQueryOptions<AlgoliaCommentHit[], Error>,
    'queryKey' | 'queryFn'
  > = {}
): UseQueryResult<AlgoliaCommentHit[], Error> =>
  useQuery<AlgoliaCommentHit[], Error>({
    queryKey: storyId
      ? ['hiring', 'comments', 'all', storyId, hitsPerPage]
      : ['hiring', 'comments', 'all', 'disabled'],
    enabled: Boolean(storyId) && enabled,
    queryFn: () => {
      if (!storyId) {
        throw new Error('Story id is required to load comments.');
      }
      return fetchAllHiringComments(storyId, hitsPerPage);
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: 1,
    ...options,
  });
