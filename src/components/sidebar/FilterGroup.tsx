import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

interface FilterGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const FilterGroup = ({ title, children, className }: FilterGroupProps) => (
  <section className={cn('space-y-3', className)}>
    <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
      {title}
    </h3>
    <div className="space-y-2 text-sm text-secondary">{children}</div>
  </section>
);

