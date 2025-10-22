export interface AlgoliaHighlightResult {
  [key: string]: unknown;
}

export interface AlgoliaStoryHit {
  story_id: number;
  objectId: string;
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
  story_id: number;
  objectID: string;
  parent_id: number | null;
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
