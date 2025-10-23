import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell.tsx';
import { AppHeader } from './components/layout/AppHeader.tsx';
import { Sidebar } from './components/sidebar/Sidebar.tsx';
import { ViewTabs } from './components/navigation/ViewTabs.tsx';
import { JobList } from './components/jobs/JobList.tsx';
import { useAppStore } from './store/useAppStore.ts';
import { useFilterUrlSync } from './hooks/useFilterUrlSync.ts';

const viewDescriptions: Record<string, string> = {
  all: 'Aggregated jobs curated from recent HN “Who is hiring?” threads.',
  starred: 'Your saved opportunities stored locally to keep tabs on.',
  applied: 'Roles you marked as applied to track follow-ups.',
  notes: 'Posts where you left notes or reminders.',
};

const App = () => {
  const view = useAppStore((state) => state.view);
  useFilterUrlSync();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncSidebar = (event: MediaQueryList | MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
    };

    syncSidebar(mediaQuery);
    mediaQuery.addEventListener('change', syncSidebar);
    return () => mediaQuery.removeEventListener('change', syncSidebar);
  }, []);

  return (
    <AppShell
      header={
        <AppHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />
      }
      sidebar={<Sidebar />}
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
    >
      <section className="flex h-full flex-col">
        <div className="border-b border-default px-6 py-5">
          <div className="flex items-center justify-between">
            <ViewTabs />
          </div>
          <p className="mt-4 text-sm text-secondary md:text-base">
            {viewDescriptions[view] ?? viewDescriptions.all}
          </p>
        </div>
        <JobList />
      </section>
    </AppShell>
  );
};

export default App;
