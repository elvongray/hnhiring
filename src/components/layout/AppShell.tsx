import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

export interface AppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  className?: string;
}

export const AppShell = ({
  header,
  sidebar,
  children,
  sidebarOpen,
  onSidebarClose,
  className,
}: AppShellProps) => (
  <div
    className={cn(
      'min-h-screen bg-[color:var(--app-bg)] text-[color:var(--text-primary)]',
      className
    )}
  >
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      {header}
      <div className="relative flex flex-1">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 lg:hidden"
            onClick={onSidebarClose}
            aria-label="Close filters"
          />
        )}
        <div
          className={cn(
            'relative flex w-full flex-col gap-6',
            sidebarOpen
              ? 'lg:grid lg:grid-cols-[320px,minmax(0,1fr)] lg:gap-8 xl:grid-cols-[340px,minmax(0,1fr)]'
              : 'lg:grid lg:grid-cols-[minmax(0,1fr)] lg:gap-0'
          )}
        >
          <aside
            className={cn(
              'z-40 rounded-3xl border border-default bg-surface shadow-soft ring-1 ring-black/5 transition-all duration-300',
              sidebarOpen
                ? 'fixed inset-x-4 top-6 max-h-[calc(100vh-3rem)] overflow-y-auto lg:sticky lg:inset-auto lg:top-6 lg:block lg:h-[calc(100vh-6rem)] lg:w-[320px] lg:overflow-y-auto xl:w-[340px]'
                : 'hidden lg:hidden'
            )}
          >
            {sidebar}
          </aside>
          <main
            className={cn(
              'flex min-h-[60vh] flex-col gap-6 rounded-3xl border border-default bg-surface shadow-soft ring-1 ring-black/5',
              sidebarOpen ? 'lg:col-start-2' : 'lg:col-start-1'
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  </div>
);
