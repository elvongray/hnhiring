import { CheckCircle2, ExternalLink, StickyNote, Star } from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '../ui/Badge.tsx';
import type { JobFlags } from '../../types/job.ts';
import { cn } from '../../lib/cn.ts';

export interface JobCardProps {
  title: string;
  company: string;
  locations: string[];
  workMode: string;
  snippet: string;
  tags?: string[];
  posted?: string;
  href?: string;
  flags: JobFlags;
  onToggleStar?: () => void;
  onToggleApplied?: () => void;
  onEditNotes?: () => void;
}

export const JobCard = ({
  title,
  company,
  locations,
  workMode,
  snippet,
  tags,
  posted,
  href,
  flags,
  onToggleStar,
  onToggleApplied,
  onEditNotes,
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
          {posted ? (
            <>
              <span aria-hidden>•</span>
              <span>{posted}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton
          icon={Star}
          label={flags.starred ? 'Unstar job' : 'Star job'}
          active={flags.starred}
          onClick={onToggleStar}
        />
        <ActionButton
          icon={CheckCircle2}
          label={flags.applied ? 'Mark not applied' : 'Mark applied'}
          active={flags.applied}
          onClick={onToggleApplied}
        />
        <ActionButton
          icon={StickyNote}
          label={flags.notes ? 'Edit notes' : 'Add notes'}
          active={Boolean(flags.notes)}
          onClick={onEditNotes}
        />
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
    </footer>

    {flags.notes ? (
      <div className="rounded-2xl border border-[color:var(--accent)]/40 bg-surface-muted px-4 py-3 text-sm text-secondary">
        {flags.notes}
      </div>
    ) : null}
  </article>
);

interface ActionButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const ActionButton = ({
  icon: Icon,
  label,
  active,
  onClick,
}: ActionButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={Boolean(active)}
    onClick={() => onClick?.()}
    className={cn(
      'flex h-9 w-9 items-center justify-center rounded-full border border-transparent',
      'bg-surface-muted text-secondary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      active
        ? 'border-[color:var(--accent)]/40! text-[color:var(--accent)]!'
        : 'hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]'
    )}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
  </button>
);
