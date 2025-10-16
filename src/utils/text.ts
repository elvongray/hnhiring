export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const entityMap: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export const decodeHtmlEntities = (value: string): string =>
  value.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith('#x')) {
      return String.fromCodePoint(parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith('#')) {
      return String.fromCodePoint(parseInt(entity.slice(1), 10));
    }

    return entityMap[entity.toLowerCase()] ?? match;
  });
