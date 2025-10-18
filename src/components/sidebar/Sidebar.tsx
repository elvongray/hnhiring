import { Badge } from '../ui/Badge.tsx';
import { FilterGroup } from './FilterGroup.tsx';
import { Button } from '../ui/Button.tsx';
import type { ChangeEvent } from 'react';
import { useAppStore } from '../../store/useAppStore.ts';
import { cn } from '../../lib/cn.ts';
import type { ExperienceLevel, WorkMode } from '../../types/job.ts';

const remoteModeOptions: WorkMode[] = ['remote', 'hybrid', 'onsite'];
const experienceOptions: ExperienceLevel[] = [
  'junior',
  'mid',
  'senior',
  'lead',
  'manager',
];

const Input = (props: JSX.IntrinsicElements['input']) => (
  <input
    className="w-full rounded-2xl border border-default bg-surface-muted px-4 py-2 text-sm text-[color:var(--text-primary)] placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    {...props}
  />
);

const CheckboxRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-transparent px-3 py-2 transition hover:border-default">
    <span>{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-default bg-surface-muted text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
    />
  </label>
);

export const Sidebar = () => {
  const filters = useAppStore((state) => state.filters);
  const updateFilters = useAppStore((state) => state.updateFilters);
  const resetFilters = useAppStore((state) => state.resetFilters);
  const hasSalaryRange = filters.salaryMin !== null || filters.salaryMax !== null;

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Badge tone="outline">Experimental</Badge>
      </div>

      <FilterGroup title="Keyword">
        <Input
          placeholder="Search job title or tech"
          value={filters.query}
          onChange={(event) => updateFilters({ query: event.target.value })}
        />
      </FilterGroup>

      <FilterGroup title="Location & Mode">
        <Input
          placeholder="e.g. Berlin, Remote"
          value={filters.locations.join(', ')}
          onChange={(event) =>
            updateFilters({
              locations: event.target.value
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean),
            })
          }
        />
        <div className="space-y-2">
          {remoteModeOptions.map((mode) => (
            <CheckboxRow
              key={mode}
              label={mode.toUpperCase()}
              checked={filters.remoteModes.includes(mode)}
              onChange={(event) => {
                const checked = event.target.checked;
                updateFilters((previous) => {
                  const nextModes = new Set<WorkMode>(previous.remoteModes);
                  if (checked) {
                    nextModes.add(mode);
                  } else {
                    nextModes.delete(mode);
                  }
                  return { ...previous, remoteModes: Array.from(nextModes) };
                });
              }}
            />
          ))}
          <CheckboxRow
            label="Remote only"
            checked={filters.remoteOnly}
            onChange={(event) => updateFilters({ remoteOnly: event.target.checked })}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Experience">
        <div className="flex flex-wrap gap-2">
          {experienceOptions.map((level) => {
            const isActive = filters.experienceLevels.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  updateFilters((previous) => {
                    const next = new Set<ExperienceLevel>(previous.experienceLevels);
                    if (next.has(level)) {
                      next.delete(level);
                    } else {
                      next.add(level);
                    }
                    return { ...previous, experienceLevels: Array.from(next) };
                  })
                }
                className={cn(
                  'rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition',
                  isActive
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--accent)]'
                    : 'border-default text-secondary hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]',
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Meta">
        <CheckboxRow
          label="Visa available"
          checked={filters.visa === 'yes'}
          onChange={() => updateFilters({ visa: filters.visa === 'yes' ? 'any' : 'yes' })}
        />
        <CheckboxRow
          label="Only with salary data"
          checked={hasSalaryRange}
          onChange={(event) =>
            updateFilters({
              salaryMin: event.target.checked ? filters.salaryMin ?? 50_000 : null,
              salaryMax: event.target.checked ? filters.salaryMax ?? null : null,
            })
          }
        />
      </FilterGroup>

      <Button variant="ghost" className="mt-auto self-start" onClick={resetFilters}>
        Reset filters
      </Button>
    </div>
  );
};
