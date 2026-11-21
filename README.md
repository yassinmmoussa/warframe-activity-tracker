# Tenno Ledger

Tenno Ledger is a browser-based Warframe activity tracker for organizing farming goals, equipment progression, relics, mods, and recurring in-game tasks. It combines a searchable item journal with checklists and a bundled item catalog to make adding and maintaining entries faster.

## Features

- **Dashboard:** See active farms, mastery fodder, mods, relics, and reset progress at a glance.
- **Daily and weekly resets:** Track recurring tasks against UTC reset times, add custom reminders, and hide tasks from the default checklist.
- **Arsenal and equipment tracking:** Organize Warframes, weapons, and mastery fodder by status and category.
- **Mods and relics:** Track mod rank, relic era and refinement, and relic quantities.
- **Quick Add and catalog suggestions:** Find existing entries and search a bundled Warframe.market catalog while adding items.
- **Journal:** Search entries and filter by category, status, and tags. Edit card details and manage checklist steps.
- **Completed tasks:** Keep completed entries out of the default views, search and filter them separately, and restore them to the active list.
- **JSON backups:** Export and import ledger data.

## Getting started

### Requirements

- Node.js 18 or later
- npm

### Install and run

```bash
git clone https://github.com/yassinmmoussa/warframe-activity-tracker.git
cd warframe-activity-tracker
npm install
npm run dev
```

Vite prints a local URL after the development server starts. Open that URL in a browser.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm test` | Run the Vitest test suite. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. Run `npm run build` first. |
| `npm run catalog:generate` | Refresh the bundled Warframe item catalog. |

The catalog generation command requires an internet connection. It fetches item data from the Warframe.market public API and writes the app-specific catalog to `src/data/warframeCatalog.json`. The app uses that bundled file at runtime and does not fetch the catalog from the API in the browser.

## Data and privacy

Ledger data is stored in the browser's local storage. No account or application backend is required. Data is specific to the browser and device where it was entered; it does not automatically sync between devices or browsers. Use **Export JSON** to create a backup before clearing browser data or moving to another device.

## Project structure

```text
src/
  components/       Shared UI components
  constants/        View identifiers and shared UI styles
  data/             App options, templates, sample data, and item catalog
  features/         Dashboard, resets, arsenal, mods/relics, and journal views
  hooks/            Ledger and filtered-journal state
  selectors/        Derived data and filtering logic
  storage/          Local persistence and reset-time calculations
scripts/
  generate-warframe-catalog.mjs
```

## Technology

- React
- Vite
- Tailwind CSS
- Lucide React
- Vitest

## Attribution

The bundled item catalog is generated from the [Warframe.market public API](https://docs.warframe.market/docs/api/overview).

Warframe and related game names and marks are the property of their respective owners. Tenno Ledger is an independent fan project and is not affiliated with or endorsed by Digital Extremes or Warframe.market.
