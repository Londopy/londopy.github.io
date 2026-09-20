// Build-time GitHub PR fetch. Refreshes the open/merged state of the curated
// pull-request list in src/data/pulls.json against the live GitHub search API,
// and appends any new PRs that aren't baked in yet. Falls back silently to the
// baked data if the API is unreachable or rate-limited, so the build never
// breaks. Repo star counts stay baked (they barely move and aren't worth a
// call each per build); newly discovered repos simply show no star chip.

import baked from "../data/pulls.json";

let cache = null;

function stateOf(item) {
  if (item.pull_request && item.pull_request.merged_at) return "merged";
  return item.state === "closed" ? "closed" : "open";
}

function sortPulls(pulls) {
  // Lead with real work — merged PRs and flagged substantive ones — not with
  // whichever famous repo a one-line fix happened to touch. Everything else
  // falls to the tail, newest first. (Deliberately NOT sorted by repo stars.)
  const lead = (p) => (p.highlight || p.state === "merged" ? 0 : 1);
  const mergedRank = (p) => (p.state === "merged" ? 0 : 1);
  pulls.sort(
    (a, b) =>
      lead(a) - lead(b) ||
      mergedRank(a) - mergedRank(b) ||
      (b.date || "").localeCompare(a.date || "")
  );
  return pulls;
}

export async function getPulls() {
  if (cache) return cache;
  const pulls = baked.pulls.map((p) => ({ ...p }));

  try {
    const headers = {
      "User-Agent": "londopy.github.io",
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(
      "https://api.github.com/search/issues?q=type:pr+author:Londopy&per_page=100&sort=created&order=desc",
      { headers }
    );
    if (res.ok) {
      const json = await res.json();
      const live = new Map();
      for (const it of json.items || []) {
        live.set(it.html_url, {
          state: stateOf(it),
          title: it.title,
          date: (it.created_at || "").slice(0, 10),
        });
      }
      // refresh the state of everything we already track
      for (const p of pulls) {
        const l = live.get(p.url);
        if (l) p.state = l.state;
      }
      // append PRs that showed up after the list was last baked
      const known = new Set(pulls.map((p) => p.url));
      for (const [url, l] of live) {
        if (known.has(url)) continue;
        const m = url.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
        pulls.push({
          repo: m ? m[1] : url,
          number: m ? Number(m[2]) : 0,
          title: l.title,
          state: l.state,
          url,
          date: l.date,
          repoStars: 0,
        });
      }
    }
  } catch {
    /* offline / rate-limited — fall back to the baked list */
  }

  cache = sortPulls(pulls);
  return cache;
}

// Derive the headline stats from whatever the final list turned out to be, so
// the counts always match the rows on the page.
export function pullStats(pulls) {
  const repoStars = new Map();
  for (const p of pulls) {
    if (!repoStars.has(p.repo)) repoStars.set(p.repo, p.repoStars || 0);
  }
  const reach = [...repoStars.values()].reduce((s, n) => s + n, 0);
  return {
    count: pulls.length,
    repos: repoStars.size,
    merged: pulls.filter((p) => p.state === "merged").length,
    reach,
  };
}
