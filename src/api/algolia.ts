import type {
  AlgoliaCommentHit,
  AlgoliaSearchResponse,
  AlgoliaStoryHit,
} from '../types/algolia.ts';

const ALGOLIA_BASE_URL = 'https://hn.algolia.com/api/v1';
const WHO_IS_HIRING_QUERY = 'Ask HN: Who is hiring?';
const COMMENT_TAG_PREFIX = 'story_';

type RequestParams = Record<string, string | number | boolean | undefined>;

const buildUrl = (path: string, params: RequestParams): string => {
  const url = new URL(`${ALGOLIA_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    url.searchParams.append(key, String(value));
  });

  return url.toString();
};

const fetchJson = async <T>(path: string, params: RequestParams): Promise<T> => {
  const response = await fetch(buildUrl(path, params), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = `Algolia request failed (${response.status})`;
    throw new Error(message);
  }

  return (await response.json()) as T;
};

export interface HiringStorySummary {
  id: number;
  title: string;
  createdAt: string;
  createdAtEpoch: number;
  monthKey: string;
  url: string | null;
  author: string;
  commentCount: number;
}

export interface HiringCommentPage {
  storyId: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  hits: AlgoliaCommentHit[];
}

const mapStoryHit = (hit: AlgoliaStoryHit): HiringStorySummary => {
  const createdAt = hit.created_at;
  const monthKey = new Date(createdAt).toISOString().slice(0, 7);

  return {
    id: hit.id,
    title: hit.title,
    createdAt,
    createdAtEpoch: hit.created_at_i,
    monthKey,
    url: hit.url,
    author: hit.author,
    commentCount: hit.num_comments,
  };
};

export const fetchHiringStories = async (
  limit = 24,
): Promise<HiringStorySummary[]> => {
  const data = await fetchJson<AlgoliaSearchResponse<AlgoliaStoryHit>>(
    '/search_by_date',
    {
      tags: 'story,author_whoishiring',
      query: WHO_IS_HIRING_QUERY,
      hitsPerPage: Math.min(limit, 1000),
      page: 0,
      numericFilters: undefined,
    },
  );

  const stories = data.hits
    .filter((hit) => {
      const title = hit.title ?? '';
      return title.toLowerCase().includes('who is hiring');
    })
    .map(mapStoryHit)
    .sort((a, b) => b.createdAtEpoch - a.createdAtEpoch);

  return stories.slice(0, limit);
};

export const fetchLatestHiringStory = async (): Promise<HiringStorySummary> => {
  const [latest] = await fetchHiringStories(1);
  if (!latest) {
    throw new Error('No hiring threads found.');
  }

  return latest;
};

export const fetchHiringMonthHistory = async (
  months = 24,
): Promise<HiringStorySummary[]> => fetchHiringStories(months);

export const fetchHiringCommentsPage = async (
  storyId: number,
  page = 0,
  hitsPerPage = 200,
): Promise<HiringCommentPage> => {
  const data = await fetchJson<AlgoliaSearchResponse<AlgoliaCommentHit>>(
    '/search',
    {
      tags: `comment,${COMMENT_TAG_PREFIX}${storyId}`,
      page,
      hitsPerPage: Math.min(hitsPerPage, 1000),
    },
  );

  return {
    storyId,
    page: data.page,
    nbPages: data.nbPages,
    hitsPerPage: data.hitsPerPage,
    hits: data.hits,
  };
};

export const fetchAllHiringComments = async (
  storyId: number,
  hitsPerPage = 200,
): Promise<AlgoliaCommentHit[]> => {
  const allHits: AlgoliaCommentHit[] = [];
  let page = 0;
  let nbPages = 1;

  do {
    const data = await fetchHiringCommentsPage(storyId, page, hitsPerPage);
    allHits.push(...data.hits);
    nbPages = data.nbPages;
    page += 1;
  } while (page < nbPages);

  return allHits;
};
