import { escapeRegExp } from './text.ts';

export type TechCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'data'
  | 'cloud'
  | 'devops'
  | 'database'
  | 'testing'
  | 'ai';

export interface TechKeywordEntry {
  label: string;
  category: TechCategory;
  aliases?: string[];
}

const RAW_TECH_KEYWORDS: readonly TechKeywordEntry[] = [
  { label: 'TypeScript', category: 'language', aliases: ['typescript', 'ts'] },
  {
    label: 'JavaScript',
    category: 'language',
    aliases: ['javascript', 'js', 'node.js', 'nodejs', 'node'],
  },
  { label: 'Python', category: 'language', aliases: ['python'] },
  { label: 'Go', category: 'language', aliases: ['go', 'golang'] },
  { label: 'Rust', category: 'language', aliases: ['rust'] },
  { label: 'Java', category: 'language', aliases: ['java'] },
  { label: 'Kotlin', category: 'language', aliases: ['kotlin'] },
  { label: 'Swift', category: 'mobile', aliases: ['swift', 'swiftui'] },
  { label: 'React', category: 'frontend', aliases: ['react', 'reactjs', 'react.js'] },
  {
    label: 'Next.js',
    category: 'frontend',
    aliases: ['next.js', 'nextjs', 'next js'],
  },
  { label: 'Vue', category: 'frontend', aliases: ['vue', 'vue.js', 'vuejs'] },
  {
    label: 'Angular',
    category: 'frontend',
    aliases: ['angular', 'angular.js', 'angularjs'],
  },
  { label: 'Svelte', category: 'frontend', aliases: ['svelte', 'sveltekit'] },
  { label: 'React Native', category: 'mobile', aliases: ['react native'] },
  { label: 'Flutter', category: 'mobile', aliases: ['flutter', 'dart'] },
  { label: 'AWS', category: 'cloud', aliases: ['aws', 'amazon web services'] },
  {
    label: 'GCP',
    category: 'cloud',
    aliases: ['google cloud', 'gcp', 'google cloud platform'],
  },
  { label: 'Azure', category: 'cloud', aliases: ['azure', 'microsoft azure'] },
  {
    label: 'PostgreSQL',
    category: 'database',
    aliases: ['postgresql', 'postgres'],
  },
  { label: 'MySQL', category: 'database', aliases: ['mysql'] },
  { label: 'MongoDB', category: 'database', aliases: ['mongodb', 'mongo'] },
  {
    label: 'Redis',
    category: 'database',
    aliases: ['redis'],
  },
  {
    label: 'GraphQL',
    category: 'backend',
    aliases: ['graphql'],
  },
  {
    label: 'REST',
    category: 'backend',
    aliases: ['rest', 'restful'],
  },
  { label: 'Docker', category: 'devops', aliases: ['docker'] },
  { label: 'Kubernetes', category: 'devops', aliases: ['k8s', 'kubernetes'] },
  { label: 'Terraform', category: 'devops', aliases: ['terraform'] },
  {
    label: 'CI/CD',
    category: 'devops',
    aliases: ['ci/cd', 'continuous integration', 'continuous deployment'],
  },
  { label: 'Linux', category: 'devops', aliases: ['linux'] },
  { label: 'Machine Learning', category: 'ai', aliases: ['machine learning', 'ml'] },
  { label: 'AI', category: 'ai', aliases: ['ai', 'artificial intelligence'] },
  {
    label: 'TensorFlow',
    category: 'ai',
    aliases: ['tensorflow'],
  },
  {
    label: 'PyTorch',
    category: 'ai',
    aliases: ['pytorch'],
  },
  {
    label: 'Elasticsearch',
    category: 'data',
    aliases: ['elasticsearch', 'elastic search', 'elastic'],
  },
  {
    label: 'Kafka',
    category: 'data',
    aliases: ['kafka', 'apache kafka'],
  },
  { label: 'Snowflake', category: 'data', aliases: ['snowflake'] },
  {
    label: 'Airflow',
    category: 'data',
    aliases: ['airflow', 'apache airflow'],
  },
  {
    label: 'C++',
    category: 'language',
    aliases: ['c++'],
  },
  {
    label: 'C#',
    category: 'language',
    aliases: ['c#', 'csharp', 'c-sharp'],
  },
  {
    label: 'PHP',
    category: 'language',
    aliases: ['php'],
  },
  {
    label: 'Laravel',
    category: 'backend',
    aliases: ['laravel'],
  },
  {
    label: 'Django',
    category: 'backend',
    aliases: ['django'],
  },
  {
    label: 'FastAPI',
    category: 'backend',
    aliases: ['fastapi', 'fast api'],
  },
  {
    label: 'Ruby on Rails',
    category: 'backend',
    aliases: ['rails', 'ruby on rails', 'ror'],
  },
  {
    label: 'Ruby',
    category: 'language',
    aliases: ['ruby'],
  },
  {
    label: 'SQL',
    category: 'data',
    aliases: ['sql'],
  },
  {
    label: 'Testing Library',
    category: 'testing',
    aliases: ['testing library', '@testing-library'],
  },
  {
    label: 'Jest',
    category: 'testing',
    aliases: ['jest'],
  },
] as const;

const ALIAS_LOOKUP = new Map<string, string>();
const REGEX_CACHE = new Map<string, RegExp>();

for (const entry of RAW_TECH_KEYWORDS) {
  const aliases = entry.aliases ?? [entry.label];
  for (const alias of aliases) {
    ALIAS_LOOKUP.set(alias.toLowerCase(), entry.label);
  }
}

const getAliasRegex = (alias: string): RegExp => {
  const normalized = alias.toLowerCase();
  if (!REGEX_CACHE.has(normalized)) {
    const boundary = alias.length <= 2 ? '\\b' : '\\b';
    REGEX_CACHE.set(
      normalized,
      new RegExp(`${boundary}${escapeRegExp(normalized)}${boundary}`, 'i'),
    );
  }
  return REGEX_CACHE.get(normalized)!;
};

export const TECH_KEYWORDS = RAW_TECH_KEYWORDS;

export const extractTechKeywords = (text: string): string[] => {
  if (!text) {
    return [];
  }

  const matches = new Set<string>();
  const lower = text.toLowerCase();

  for (const [alias, label] of ALIAS_LOOKUP.entries()) {
    const regex = getAliasRegex(alias);
    if (regex.test(lower)) {
      matches.add(label);
    }
  }

  return Array.from(matches).sort((a, b) => a.localeCompare(b));
};
