// Build-time GitHub metadata fetch. Pulls live star counts and last-push dates
// for all of @Londopy's repos (plus any external/collaborator repos) in as few
// calls as possible, and memoizes them for the build. Falls back silently if
// the API is unreachable or rate-limited, so the build never breaks — cards
// then use the values baked into projects.json.

let cache = null;

// Cards that live under someone else's account (e.g. collaborations) — the
// user-repos call won't cover them, so fetch each one directly. "owner/name".
const EXTERNAL_REPOS = ["Skythe7/DiresQ"];

export async function getMetaMap() {
  if (cache) return cache;
  const map = {};
  try {
    const headers = { "User-Agent": "londopy.github.io", Accept: "application/vnd.github+json" };
    // Optional: set GITHUB_TOKEN in CI for a higher rate limit (not required).
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(
      "https://api.github.com/users/Londopy/repos?per_page=100&type=owner",
      { headers }
    );
    if (res.ok) {
      const repos = await res.json();
      for (const r of repos) {
        map[r.name.toLowerCase()] = {
          stars: r.stargazers_count ?? 0,
          pushed: r.pushed_at ?? null,
        };
      }
    }

    // External / collaborator repos, one call each.
    for (const full of EXTERNAL_REPOS) {
      try {
        const r = await fetch(`https://api.github.com/repos/${full}`, { headers });
        if (r.ok) {
          const j = await r.json();
          map[j.name.toLowerCase()] = {
            stars: j.stargazers_count ?? 0,
            pushed: j.pushed_at ?? null,
          };
        }
      } catch {
        /* skip this one */
      }
    }
  } catch {
    /* offline / rate-limited — fall back to manual values */
  }
  cache = map;
  return map;
}

// Merge live star + pushed data into a project (live wins; JSON values are the
// fallback). `pushed` is an ISO date string or null.
export function withMeta(project, metaMap) {
  const m = metaMap[project.name.toLowerCase()] || {};
  return {
    ...project,
    stars: m.stars ?? project.stars ?? 0,
    pushed: m.pushed ?? project.pushed ?? null,
  };
}
