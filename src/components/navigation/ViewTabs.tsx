import { useAppStore } from '../../store/useAppStore.ts';
import { cn } from '../../lib/cn.ts';
import type { ViewMode } from '../../types/filters.ts';

const tabs: Array<{ id: ViewMode; label: string; emoji: string }> = [
  { id: 'all', label: 'All', emoji: '🌐' },
  { id: 'starred', label: 'Starred', emoji: '⭐' },
  { id: 'applied', label: 'Applied', emoji: '✅' },
  { id: 'notes', label: 'Notes', emoji: '📝' },
];

export const ViewTabs = () => {
  const view = useAppStore((state) => state.view);
  const setView = useAppStore((state) => state.setView);

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = view === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={cn(
              'group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isActive
                ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--accent)]'
                : 'border-default text-secondary hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]',
            )}
            onClick={() => setView(tab.id)}
          >
            <span className="text-base">{tab.emoji}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

