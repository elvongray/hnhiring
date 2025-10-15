const App = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-950 px-6 py-16 text-slate-200">
    <div className="space-y-2 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">
        hnhiring
      </p>
      <h1 className="text-balance text-4xl font-semibold md:text-5xl">
        Hacker News hiring tracker scaffolding ready to build.
      </h1>
      <p className="mx-auto max-w-2xl text-balance text-base text-slate-400 md:text-lg">
        Tooling is in place—React, Tailwind, TanStack Query, Zustand, and Vitest.
        We&apos;ll layer in data fetching, filtering, and persistence next.
      </p>
    </div>
    <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400 shadow-lg shadow-emerald-500/5 backdrop-blur">
      Start iterating on the data layer and UI components in the next steps.
    </div>
  </div>
);

export default App;
