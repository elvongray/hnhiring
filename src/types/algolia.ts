export interface AlgoliaHighlightResult {
  [key: string]: unknown;
}

export interface AlgoliaStoryHit {
  id: number;
  created_at: string;
  created_at_i: number;
  title: string;
  url: string | null;
  author: string;
  points: number;
  num_comments: number;
  _tags: string[];
}

export interface AlgoliaCommentHit {
  id: string;
  parent_id: number | null;
  story_id: number;
  story_title: string | null;
  story_url: string | null;
  created_at: string;
  created_at_i: number;
  author: string;
  url: string | null;
  comment_text: string | null;
  text?: string | null;
  _tags: string[];
  _highlightResult?: AlgoliaHighlightResult;
}

export interface AlgoliaSearchResponse<T> {
  hits: T[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  query: string;
  params: string;
  processingTimeMS: number;
}

