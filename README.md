# londopy.github.io

Curated showcase of [@Londopy](https://github.com/Londopy)'s open-source projects, grouped by domain. Built with [Astro](https://astro.build) — zero client-side JavaScript.

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # static build → dist/
```

## Add / edit a project

Everything on the page comes from **`src/data/projects.json`** — no component changes needed:

- `projects[]` — one entry per card. Fields: `cluster` (id from `clusters[]`), `name`, `tagline`, `language` (use `"Rust + Python"` for multi-language dots), `tags[]`, `repo`, `demo?`, `page?`, `featured?`, `stars?`. Buttons are omitted when their link is `null`.
- `clusters[]` — section order, emoji, title, blurb. Empty clusters are hidden automatically.
- `inProgress[]` — the 🚧 teaser strip for reserved repo names.

Set `"featured": true` to also pin a card to the top section.

## Deploy

Pushes to `main` deploy via GitHub Actions (`.github/workflows/deploy.yml`).
One-time setup: **Settings → Pages → Source: GitHub Actions**.

## Regenerate the OG image

`scripts/make_og.py` (requires Pillow + DejaVu fonts, run from repo root):

```sh
python3 scripts/make_og.py
```
