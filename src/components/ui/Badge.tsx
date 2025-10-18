import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.ts';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'accent' | 'outline';
}

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'bg-surface-muted text-secondary',
  accent:
    'bg-[color:var(--accent)]/10 text-[color:var(--accent)] ring-1 ring-[color:var(--accent)]/40',
  outline: 'bg-transparent text-secondary ring-1 ring-[color:var(--border)]',
};

export const Badge = ({ tone = 'default', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
      toneStyles[tone],
      className,
    )}
    {...props}
  />
);

