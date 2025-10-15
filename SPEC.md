Here’s a **comprehensive, developer-ready specification** for your project **hnhiring** — the Hacker News job filtering and search web app hosted on GitHub Pages.
It consolidates everything we decided step-by-step and is structured for easy handoff to a developer.

---

# 🧭 Project Specification — _hnhiring_

## 1. Overview

**hnhiring** is a lightweight, single-page React web application that allows users to search, filter, and manage jobs from the monthly “Ask HN: Who is hiring?” threads on Hacker News.

- Hosted via **GitHub Pages** (static build).
- Fetches posts live at runtime using **Algolia’s Hacker News Search API**.
- Performs **all filtering client-side** with local persistence for user actions.
- Modern, polished UI with dark mode and real-time interactions.

---

## 2. Tech Stack

| Area             | Choice           | Notes                                               |
| ---------------- | ---------------- | --------------------------------------------------- |
| Framework        | **React (Vite)** | Fast build tool, ideal for GitHub Pages.            |
| Language         | **TypeScript**   | Type-safe front-end codebase.                       |
| Styling          | **Tailwind CSS** | Modern, utility-first styling.                      |
| State Management | **Zustand**      | Lightweight global store (filters, jobs, UI state). |
| Data Fetching    | **React Query**  | Handles API calls, caching, background refresh.     |
| Search Logic     | **Fuse.js**      | Client-side fuzzy + boolean (AND/OR) text search.   |
| Hosting          | **GitHub Pages** | Automated build/deploy from main branch.            |
| Analytics        | _(Optional)_     | Plausible or Umami (to be added later).             |

---

## 3. Data Flow

### 3.1 Fetching Data from Algolia

**Endpoints & Logic**

1. **Find latest thread**

   ```
   GET https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&query=Ask%20HN:%20Who%20is%20hiring?
   ```

   → Sort by `created_at_i desc`, pick first result.

2. **Fetch all comments** for that thread:

   ```
   GET https://hn.algolia.com/api/v1/search?tags=comment,story_{THREAD_ID}&hitsPerPage=1000
   ```

   Loop through pages if needed.

3. **Populate month selector** by fetching last ~60 “Who is hiring?” threads.

---

## 4. Data Model

| Field              | Type                                                          | Description                                        |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------- |
| `id`               | string                                                        | HN comment ID                                      |
| `company`          | string                                                        | Parsed company name                                |
| `role`             | string                                                        | Job title                                          |
| `locations`        | string[]                                                      | City or country names                              |
| `work_mode`        | enum                                                          | `onsite`, `hybrid`, `remote`                       |
| `remote_only`      | boolean                                                       | Whether role is fully remote                       |
| `timezone`         | string                                                        | e.g. `UTC-5 to UTC+1`                              |
| `visa`             | boolean                                                       | Visa sponsorship available                         |
| `employment_type`  | enum                                                          | `full-time`, `part-time`, `contract`, `internship` |
| `experience_level` | enum                                                          | `junior`, `mid`, `senior`, `lead`, `manager`       |
| `tech_stack`       | string[]                                                      | Extracted from dictionary + discovered tags        |
| `salary`           | {min?: number, max?: number, currency?: string, raw?: string} | Parsed or raw string                               |
| `text`             | string                                                        | Full job post                                      |
| `created_at`       | string                                                        | ISO date                                           |
| `url`              | string                                                        | HN comment URL                                     |
| `flags`            | {starred: boolean, applied: boolean, notes?: string}          | User metadata                                      |

---

## 5. Parsing Strategy

- **Rule-based regex parsing** for structured fields.
- **Static dictionary** of tech keywords (React, TS, Go, AWS, etc.).
- **Hybrid enhancement**: auto-suggest new recurring tech terms.
- **Manual correction UI** (user can retag or adjust data locally).

---

## 6. User Interface

### 6.1 Layout

- **Single-page layout**

  - **Left sidebar**: filters (scrolls independently).
  - **Top bar**: tabs for “All”, “⭐ Starred”, “✅ Applied”, “📝 Notes”.
  - **Main panel**: job list (paged, 50 per page default).

### 6.2 Design

- **Modern & polished** aesthetic (Linear/Vercel-inspired).
- Rounded cards, subtle shadows, smooth animations (Framer Motion optional).
- **Dark mode toggle** (system default).

### 6.3 Job Cards

- Always expanded to a **default preview height**, with “Show more / less” toggle.
- Inline icons:

  - ⭐ → Star/unstar
  - ✅ → Mark as applied
  - 📝 → Add notes

- “Show on HN” link opens in new tab.

---

## 7. Filtering & Search

### 7.1 Filters (Sidebar)

- Keyword
- Company
- Location
- Remote / Onsite / Hybrid toggles
- Timezone overlap
- Visa sponsorship
- Experience level
- Employment type
- Tech stack (multi-select)
- Salary range slider
- Applied / Starred / Notes status toggles

### 7.2 Smart Search Bar

- Parses queries into filters (e.g., “remote React Berlin senior”).
- Syncs with sidebar automatically.
- AND/OR logic supported; phrase matching optional in later versions.

---

## 8. State & Persistence

| Storage                           | Mechanism                 | Scope                              |
| --------------------------------- | ------------------------- | ---------------------------------- |
| Filters, pagination, last session | localStorage              | Persisted                          |
| Starred, applied, notes           | localStorage              | Persisted                          |
| Cached jobs                       | in-memory via React Query | Ephemeral (refetched on new visit) |

- On revisit → restore last session (month + filters + actions).
- All state encoded in URL query params for shareability.

---

## 9. Performance Plan

- **Hybrid loading**:

  - Fetch first 100 jobs immediately.
  - Fetch remaining jobs in the background.

- Client-side filtering/search only.
- Pagination (default 50 per page, user adjustable).
- Fuse.js used for efficient keyword filtering.

---

## 10. Error Handling

- If no “Who is hiring?” thread found → show friendly message + retry button.
- If Algolia call fails → display toast and retry option.
- Fallback: allow manual month selection.

---

## 11. Accessibility & Responsiveness

- **Fully responsive**: works across desktop, tablet, mobile.
- **Keyboard shortcuts**:

  - `/` → focus search
  - `s` → star/unstar
  - `a` → mark applied
  - `→/←` → navigate pages

- Semantic HTML + ARIA roles for screen readers.

---

## 12. Deployment

**GitHub Actions CI/CD**:

- Trigger: push to `main`.
- Steps:

  1. Install dependencies (`pnpm` or `npm ci`).
  2. Run build (`vite build`).
  3. Deploy `/dist` to `gh-pages` branch.

- Hosted at `https://<username>.github.io/hnhiring/`.

---

## 13. Future Enhancements (post-MVP)

- Add Plausible analytics.
- Support for “Who wants to be hired?” threads.
- Export/import of local data.
- Light NLP-based tag refinement.
- Bookmark syncing via GitHub Gists (optional).
- Advanced fuzzy search and sorting.

---

## 14. Example Directory Structure

```
src/
 ├── api/
 │   └── algolia.ts
 ├── components/
 │   ├── JobCard.tsx
 │   ├── Sidebar.tsx
 │   ├── SearchBar.tsx
 │   ├── Pagination.tsx
 │   └── TopTabs.tsx
 ├── hooks/
 │   └── useJobs.ts
 ├── store/
 │   └── useAppStore.ts
 ├── utils/
 │   ├── parseJob.ts
 │   └── techDictionary.ts
 ├── pages/
 │   └── App.tsx
 └── index.css
```

---

## 15. Developer Handoff Notes

- All components should be function-based with hooks.
- Use **TypeScript interfaces** for Job and Filter models.
- Favor **composition over prop-drilling** (Zustand handles shared state).
- Include minimal unit tests for data parsing (regex correctness).
- Build should stay under 300 KB compressed.

---

## 16 URL Handling & Routing

### 16.1 Overview

Because **hnhiring** is a single-page React app hosted on **GitHub Pages**, routing will use **hash-based URLs** (`/#/...`) instead of history API paths to avoid 404 errors on refresh. The app will never require server-side routes.

All **filter, search, and pagination states** will be reflected in the URL via **query parameters**, ensuring that users can share or bookmark a filtered view.

---

### 16.2 URL Structure

Example format:

```
https://<username>.github.io/hnhiring/#/?month=2025-10&query=react+remote&location=berlin&experience=senior&page=2
```

**Parameters:**

| Parameter    | Type      | Description                                         |
| ------------ | --------- | --------------------------------------------------- |
| `month`      | `YYYY-MM` | Selected “Who is hiring?” thread.                   |
| `query`      | string    | Text typed into the smart search bar.               |
| `location`   | string    | Comma-separated list of locations.                  |
| `remote`     | boolean   | Whether to show remote-only jobs.                   |
| `experience` | string    | Experience level (`junior`, `mid`, etc.).           |
| `tech`       | string[]  | Comma-separated list of tech stack filters.         |
| `page`       | number    | Current pagination index.                           |
| `view`       | string    | Optional (`starred`, `applied`, `notes`, or `all`). |

---

### 16.3 Behavior Rules

- **Initial Load**:
  On load, the app reads the hash query (`/#/?...`) and hydrates filters, pagination, and selected month accordingly.
- **State Changes**:
  Any change to filters, search text, or pagination immediately updates the URL query params using a debounced sync (e.g., 300 ms).
- **Sharing**:
  Copying the full URL preserves the exact view for others or for future visits.
- **Reset**:
  A “Reset Filters” button clears query params and reloads with default (latest month, no filters).
- **Back/Forward Navigation**:
  Browsing history is maintained — going back/forward updates the filters to match the corresponding URL.
- **Invalid Params**:
  If the user manually edits the URL with invalid filters, defaults will be restored gracefully.

---

### 16.4 Implementation Details

- Use React Router’s **`HashRouter`** for safe GitHub Pages routing.
- Sync state and URL using a custom `useUrlSync()` hook:

  - Parses query params → sets Zustand store on mount.
  - Subscribes to store changes → updates URL (debounced).

- Handle serialization with `URLSearchParams` (for clean encoding).
- Example:

  ```ts
  const params = new URLSearchParams(window.location.hash.slice(2));
  const month = params.get('month') ?? latestMonth;
  ```
