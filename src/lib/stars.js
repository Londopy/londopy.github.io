// Build-time star fetch. Pulls live stargazer counts for all of @Londopy's
// repos in a single GitHub API call and memoizes them for the build.
// Falls back silently (empty map) if the API is unreachable or rate-limited,
// so the build never breaks — cards then use the `stars` values in projects.json.

let cache = null;

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
