import { Bookmark, CheckCircle2, ExternalLink, StickyNote } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Badge } from '../ui/Badge.tsx';
import { cn } from '../../lib/cn.ts';

export interface JobCardProps {
  title: string;
  company: string;
  locations: string[];
  workMode: string;
  snippet: string;
  tags?: string[];
  salary?: string;
  posted?: string;
  actions?: ReactNode;
  href?: string;
}

export const JobCard = ({
  title,
  company,
  locations,
  workMode,
  snippet,
  tags,
  salary,
  posted,
  actions,
  href,
}: JobCardProps) => (
  <article className="group flex flex-col gap-5 rounded-3xl border border-default bg-surface px-6 py-5 transition hover:border-[color:var(--accent)]/40 hover:shadow-soft">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-base font-semibold sm:text-lg">
          {title} <span className="text-secondary">· {company}</span>
        </h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-secondary">
          <span>{locations.join(' · ') || 'Location TBD'}</span>
          <span aria-hidden>•</span>
          <span>{workMode}</span>
          {salary ? (
            <>
              <span aria-hidden>•</span>
              <span>{salary}</span>
            </>
          ) : null}
          {posted ? (
            <>
              <span aria-hidden>•</span>
              <span>{posted}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton icon={Bookmark} label="Bookmark job" />
        <ActionButton icon={CheckCircle2} label="Mark applied" />
        <ActionButton icon={StickyNote} label="Add notes" />
      </div>
    </header>

    <p className="text-sm leading-relaxed text-secondary sm:text-base">
      {snippet}
    </p>

    {tags && tags.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} tone="outline" className="lowercase">
            {tag}
          </Badge>
        ))}
      </div>
    ) : null}

    <footer className="flex items-center justify-between">
      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-secondary">
        <Badge tone="accent">HN Source</Badge>
        <Badge tone="default">Parsing heuristics beta</Badge>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm text-secondary transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          View on HN
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
      {actions}
    </footer>
  </article>
);

interface ActionButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const ActionButton = ({ icon: Icon, label }: ActionButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-surface-muted text-secondary transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
  </button>
);
