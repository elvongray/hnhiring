# hnhiring

This project is an opinionated React (Vite) application that pulls monthly job postings through Algolia’s Hacker News Search API and turns them into a shareable, filterable job board. It is designed for GitHub Pages hosting and ships with a parsing pipeline, state management, and testing harness ready for feature work.

## Features

- **Live Algolia ingestion** – finds the latest “Who is hiring?” thread and loads all comments client-side.
- **Structured job parsing** – converts unstructured comments into typed job objects (company, locations, salary, tech stack, visa status, etc.).
- **Rich filtering & search (WIP)** – smart search bar, sidebar filters, and URL-synced state using Zustand + Fuse.js.
- **Local persistence** – keeps filters, flags (starred/applied), and notes in localStorage so users can revisit their workflow.
- **Modern UI foundations** – Tailwind CSS theming with dark mode, ready for polished components and responsive layouts.
- **Testing-first tooling** – Vitest and Testing Library cover the parsing utilities and provide a baseline for future UI tests.

## Architecture

| Layer         | Technology / Notes                                       |
| ------------- | -------------------------------------------------------- |
| Build/runtime | Vite + React 19 (TypeScript)                             |
| State         | Zustand for app filters + TanStack Query for remote data |
| Search        | Fuse.js for client-side fuzzy matches                    |
| Styling       | Tailwind CSS (utility-first, dark-mode ready)            |
| Testing       | Vitest, @testing-library/react                           |
| Hosting       | GitHub Pages (static bundle pushed to `gh-pages`)        |

```
src/
 ├─ api/            # (planned) Algolia fetch helpers
 ├─ components/     # (planned) UI building blocks
 ├─ lib/            # Query client, search index helpers
 ├─ store/          # Zustand stores
 ├─ types/          # Shared TypeScript models
 ├─ utils/          # Parsing, text transforms, tech dictionary
 └─ utils/__tests__ # Unit tests for parser/dictionary
```

## Getting Started

### Prerequisites

- Node.js ≥ 18 (earlier versions cannot run Vite/Vitest)
- bun ≥ 1.2.18

### Installation

```bash
bun install
```

bun Development

```bash
bun run dev        # Start Vite dev server with HMR
```

The app will open at <http://localhost:5173/> by default. Tailwind, React Query Devtools, and HMR are enabled during development.

### Testing & Quality

```bash
bun run lint       # ESLint (type-aware)
bun test           # Vitest in CI mode
bun run test:watch # Vitest watch mode
bun run test:coverage
```

Unit tests currently focus on the parsing utilities and tech keyword extraction. Add more coverage as you implement parsing heuristics or complex UI logic.

### Build & Preview

```bash
bun run build      # Type-check + Vite production build
bun run preview    # Serve the production bundle locally
```

## Deployment

The project targets GitHub Pages. Publish the `dist/` directory to the `gh-pages` branch (e.g., with `peaceiris/actions-gh-pages` or a custom workflow). The Vite config sets the production `base` to `/hnhiring/`; override with `VITE_PUBLIC_BASE` if you deploy elsewhere.

## Data Model & Parsing

Structured job objects contain:

- Company, role, locations, employment types, and experience level
- Work mode (onsite/hybrid/remote) + remote-only flag
- Tech stack (via curated dictionary and alias matching)
- Salary range, currency, and raw text
- Visa availability, timezone hints, free-form tags
- Source metadata (HN IDs, author, story title/url)

Parsing heuristics live in `src/utils/parseJob.ts` and are covered by Vitest specs. The dictionary used for stack detection (`src/utils/techDictionary.ts`) is easily extendable.

## Contributing

Contributions are welcome! Please:

1. Fork the repository and create a feature branch.
2. Run `bun run lint` and `bun test`.
3. Open a pull request describing the change, test coverage, and any UI screenshots if applicable.

## License

MIT © contributors. Use it, modify it, and share improvements.
