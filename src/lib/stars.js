// Build-time star fetch. Pulls live stargazer counts for all of @Londopy's
// repos in a single GitHub API call and memoizes them for the build.
// Falls back silently (empty map) if the API is unreachable or rate-limited,
// so the build never breaks — cards then use the `stars` values in projects.json.

let cache = null;

// Cards that live under someone else's account (e.g. collaborations) — the
// user-repos call won't cover them, so fetch each one directly. "owner/name".
const EXTERNAL_REPOS = ["Skythe7/DiresQ"];

export async function getStarMap() {
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
      for (const r of repos) map[r.name.toLowerCase()] = r.stargazers_count ?? 0;
    }

    // External / collaborator repos, one call each.
    for (const full of EXTERNAL_REPOS) {
      try {
        const r = await fetch(`https://api.github.com/repos/${full}`, { headers });
        if (r.ok) {
          const j = await r.json();
          map[j.name.toLowerCase()] = j.stargazers_count ?? 0;
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

// Merge live stars into a project (live wins; JSON value is the fallback).
export function withStars(project, starMap) {
  const live = starMap[project.name.toLowerCase()];
  return { ...project, stars: live ?? project.stars ?? 0 };
}
