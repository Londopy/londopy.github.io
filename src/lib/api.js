// The public API: every file under /api/v1/, the OpenAPI spec at
// /api/openapi.json and the docs page at /api/ are generated from the one
// route table below, so the files, the spec and the docs can't drift apart.
//
// It's all computed at build time from the same sources as the pages
// (projects.json with live stars, the PR feed, the writeups, the blog's RSS)
// and written out as static files. GitHub Pages serves them with
// `Access-Control-Allow-Origin: *`, so any site or script can read them.
// scripts/check_api.mjs validates every file against the spec after a build.

import data from "../data/projects.json";
import { projectDocs } from "../data/projectDocs.js";
import {
  profile,
  OPEN_TO_WORK,
  OPEN_TO_WORK_TEXT,
  PGP_PUBLIC_KEY,
  PGP_FINGERPRINT,
} from "../data/profile.js";
import { getMetaMap, withMeta } from "./stars.js";
import { getPulls, pullStats } from "./pulls.js";
import { getPosts, FEED_URL } from "./blog.js";
import { htmlToText } from "./text.js";

export const SITE = "https://londopy.github.io";
export const VERSION = "1.0.0";
export const BASE = "/api/v1";
export const abs = (path) => SITE + path;

export const DESCRIPTION =
  "Everything on londopy.github.io as JSON: the projects and their writeups, the domains they're grouped by, " +
  "languages and tags, awards, pull requests to other people's projects, blog posts, and the numbers. " +
  "Static files, rebuilt with the site on every push and every night; read-only, no key, CORS-open.";

// hex per language — mirrors the --lang-* tokens in global.css
export const LANG_COLORS = {
  Rust: "#dea584", Python: "#3572a5", TypeScript: "#3178c6", "C++": "#f34b7d",
  Bash: "#89e051", JavaScript: "#f1e05a", "x86 ASM": "#c9a227", Astro: "#ff5a03",
  Zig: "#f7a41d", Nexium: "#4fd1c5", Svelte: "#ff3e00", Gleam: "#ffaff3",
  C: "#8b949e", "C#": "#178600", Odin: "#60affe",
};

/* ------------------------------------------------------------------------ */
/* the data, gathered once per build                                         */
/* ------------------------------------------------------------------------ */

let snapshot = null;

export async function getSnapshot() {
  if (snapshot) return snapshot;
  const metaMap = await getMetaMap();
  const projects = data.projects.map((p) => withMeta(p, metaMap));
  const pulls = await getPulls();
  const posts = await getPosts();
  snapshot = {
    generated: new Date().toISOString(),
    projects,
    clusters: data.clusters.filter((c) => projects.some((p) => p.cluster === c.id)),
    inProgress: data.inProgress ?? [],
    pulls,
    prStats: pullStats(pulls),
    posts: posts.items,
    postsOk: posts.ok,
  };
  return snapshot;
}

/* ------------------------------------------------------------------------ */
/* shapes                                                                    */
/* ------------------------------------------------------------------------ */

const clusterRef = (id) => ({ id, title: data.clusters.find((c) => c.id === id)?.title ?? id });

export const languagesOf = (p) =>
  p.language.split(" + ").map((s) => s.trim()).filter(Boolean);

const pipOf = (p) =>
  p.demo && p.demo.includes("pypi.org")
    ? p.demo.split("/project/")[1]?.replace(/\/+$/, "") || null
    : null;

const awardOf = (p) =>
  p.award
    ? {
        place: p.award.place,
        medal: p.award.medal,
        event: p.award.event,
        track: p.award.track ?? null,
        url: p.award.url ?? null,
      }
    : null;

export function projectSummary(p) {
  return {
    name: p.name,
    tagline: p.tagline,
    cluster: clusterRef(p.cluster),
    languages: languagesOf(p),
    tags: p.tags ?? [],
    featured: !!p.featured,
    stars: p.stars ?? 0,
    pushed_at: p.pushed ?? null,
    award: awardOf(p),
    urls: {
      page: abs(`/projects/${p.name}/`),
      repo: p.repo,
      demo: p.demo ?? null,
      docs: p.docsUrl ?? null,
      og_image: abs(`/og/${p.name}.png`),
      api: abs(`${BASE}/projects/${p.name}.json`),
    },
    links: (p.links ?? []).map((l) => ({ label: l.label, url: l.url })),
  };
}

function projectDetail(p, all) {
  // writeups link within the site ("/projects/nexium/"); make those absolute
  const html = projectDocs[p.name]?.trim().replace(/(href|src)="\//g, `$1="${SITE}/`);
  const pip = pipOf(p);
  return {
    ...projectSummary(p),
    install: pip ? `pip install ${pip}` : null,
    writeup: html ? { html, text: htmlToText(html) } : null,
    related: all.filter((q) => q.cluster === p.cluster && q.name !== p.name).map((q) => q.name),
  };
}

function clusterSummary(c, projects) {
  const members = projects.filter((p) => p.cluster === c.id);
  return {
    id: c.id,
    emoji: c.emoji,
    title: c.title,
    blurb: c.blurb,
    count: members.length,
    projects: members.map((p) => p.name),
    urls: { page: abs(`/#${c.id}`), api: abs(`${BASE}/clusters/${c.id}.json`) },
  };
}

function clusterDetail(c, projects) {
  return {
    ...clusterSummary(c, projects),
    projects: projects.filter((p) => p.cluster === c.id).map(projectSummary),
  };
}

function indexBy(projects, keysOf) {
  const map = new Map();
  for (const p of projects) {
    for (const k of keysOf(p)) {
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p.name);
    }
  }
  return [...map].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

const languageIndex = (projects) =>
  indexBy(projects, languagesOf).map(([name, names]) => ({
    name,
    color: LANG_COLORS[name] ?? null,
    count: names.length,
    projects: names,
  }));

const tagIndex = (projects) =>
  indexBy(projects, (p) => p.tags ?? []).map(([tag, names]) => ({
    tag,
    count: names.length,
    projects: names,
  }));

const awardList = (projects) =>
  projects
    .filter((p) => p.award)
    .map((p) => ({ project: p.name, ...awardOf(p), project_url: abs(`/projects/${p.name}/`) }));

const pullOut = (p) => ({
  repo: p.repo,
  number: p.number,
  title: p.title,
  state: p.state,
  url: p.url,
  created: p.date || null,
  repo_stars: p.repoStars ?? 0,
});

function statsDoc(s) {
  const byStars = s.projects
    .map((p) => ({ name: p.name, stars: p.stars ?? 0 }))
    .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
  const latest = s.projects
    .filter((p) => p.pushed)
    .sort((a, b) => b.pushed.localeCompare(a.pushed))[0];
  return {
    projects: s.projects.length,
    domains: s.clusters.length,
    featured: s.projects.filter((p) => p.featured).length,
    languages: languageIndex(s.projects).length,
    tags: tagIndex(s.projects).length,
    stars: { total: byStars.reduce((n, x) => n + x.stars, 0), top: byStars.slice(0, 5) },
    pull_requests: {
      count: s.prStats.count,
      repos: s.prStats.repos,
      merged: s.prStats.merged,
      reach: s.prStats.reach,
    },
    posts: s.posts.length,
    awards: awardList(s.projects).length,
    in_progress: s.inProgress.length,
    last_push: latest ? { project: latest.name, at: latest.pushed } : null,
  };
}

function profileDoc() {
  return {
    name: profile.name,
    handle: profile.handle,
    headline: profile.headline,
    summary: profile.summary,
    focus: profile.focus,
    certifications: profile.certifications,
    open_to_work: { open: OPEN_TO_WORK, text: OPEN_TO_WORK ? OPEN_TO_WORK_TEXT : null },
    links: { site: abs("/"), blog: abs("/blog/"), api: abs("/api/"), ...profile.links },
    contact: { form: abs("/contact/"), ...profile.contact },
    pgp: PGP_PUBLIC_KEY
      ? { fingerprint: PGP_FINGERPRINT, key_url: abs("/pgp.asc"), armored: PGP_PUBLIC_KEY.trim() }
      : null,
  };
}

// shields.io endpoint badges (https://shields.io/badges/endpoint-badge)
const starTotal = (s) => s.projects.reduce((n, p) => n + (p.stars ?? 0), 0);
export const BADGES = {
  catalog: { about: "projects and domains in one badge, like the profile README's", make: (s) => ({ label: `${s.projects.length} projects`, message: `${s.clusters.length} domains`, color: "d97706" }) },
  projects: { about: "project count", make: (s) => ({ label: "projects", message: String(s.projects.length), color: "d97706" }) },
  domains: { about: "domain count", make: (s) => ({ label: "domains", message: String(s.clusters.length), color: "7a5c3a" }) },
  stars: { about: "stars across every project", make: (s) => ({ label: "stars", message: String(starTotal(s)), color: "e8b444" }) },
  pulls: { about: "pull requests to other projects", make: (s) => ({ label: "pull requests", message: String(s.prStats.count), color: "7a5c3a" }) },
  merged: { about: "…and how many were merged", make: (s) => ({ label: "merged PRs", message: String(s.prStats.merged), color: "4a7b3e" }) },
  posts: { about: "blog posts", make: (s) => ({ label: "blog posts", message: String(s.posts.length), color: "d97706" }) },
};

// a business card for terminals: `curl -s londopy.github.io/api/v1/card.ansi`
export function card(s, { ansi = false } = {}) {
  const ACCENT = "38;2;233;161;58";
  const TEXT = "38;2;205;216;227";
  const DIM = "38;2;132;148;166";
  const FAINT = "38;2;86;103;122";
  const paint = (code, t) => (ansi && t ? `\x1b[${code}m${t}\x1b[0m` : t);
  const field = (k, v) => [[k.padEnd(9), DIM], [v, TEXT]];
  const rows = [
    [],
    [[profile.name, `1;${ACCENT}`], [`  ·  ${profile.handle}`, DIM]],
    [[profile.headline, TEXT]],
    [],
    field("site", abs("/")),
    field("blog", abs("/blog/")),
    field("github", profile.links.github),
    field("api", abs("/api/")),
    field("contact", abs("/contact/")),
    field("irc", `${profile.contact.irc.how} on ${profile.contact.irc.network}`),
    field("discord", profile.contact.discord),
    ...(PGP_FINGERPRINT ? [field("pgp", PGP_FINGERPRINT)] : []),
    [],
    [[`${s.projects.length} projects · ${s.clusters.length} domains · ${s.prStats.merged} PRs merged upstream`, DIM]],
    ...(OPEN_TO_WORK ? [[[OPEN_TO_WORK_TEXT, ACCENT]]] : []),
    [],
  ];
  const len = (row) => [...row.map(([t]) => t).join("")].length;
  const width = Math.max(...rows.map(len));
  const edge = (l, r) => paint(FAINT, l + "─".repeat(width + 6) + r);
  const line = (row) =>
    paint(FAINT, "│") + "   " + row.map(([t, c]) => paint(c, t)).join("") +
    " ".repeat(width - len(row) + 3) + paint(FAINT, "│");
  return [edge("╭", "╮"), ...rows.map(line), edge("╰", "╯")].join("\n") + "\n";
}

/* ------------------------------------------------------------------------ */
/* JSON Schema for every shape above (becomes components.schemas)            */
/* ------------------------------------------------------------------------ */

const P = (name) => ({ $ref: `#/components/schemas/${name}` });
const str = { type: "string" };
const int = { type: "integer", minimum: 0 };
const bool = { type: "boolean" };
const uri = { type: "string", format: "uri" };
const dateTime = { type: "string", format: "date-time" };
const nullable = (schema) => ({ anyOf: [schema, { type: "null" }] });
const arr = (items) => ({ type: "array", items });
const obj = (properties, required = Object.keys(properties), description) => ({
  type: "object",
  ...(description ? { description } : {}),
  required,
  properties,
});
const medal = { type: "string", enum: ["gold", "silver", "bronze"] };

const PROJECT_FIELDS = {
  name: { ...str, description: "The repo's name, and the id used in URLs (case-sensitive)" },
  tagline: str,
  cluster: P("ClusterRef"),
  languages: arr(str),
  tags: arr(str),
  featured: bool,
  stars: int,
  pushed_at: nullable({ ...dateTime, description: "Last push to the repo" }),
  award: nullable(P("Award")),
  urls: P("ProjectUrls"),
  links: arr(P("Link")),
};

const CLUSTER_FIELDS = {
  id: str,
  emoji: str,
  title: str,
  blurb: str,
  count: int,
  projects: arr(str),
  urls: obj({ page: uri, api: uri }),
};

export const SCHEMAS = {
  Meta: obj(
    {
      api: str,
      version: str,
      generated: { ...dateTime, description: "When the build that wrote this file ran" },
      self: uri,
      docs: uri,
      count: { ...int, description: "Number of items, on list endpoints" },
      source: { ...uri, description: "Where the data came from, when it isn't this site" },
      note: { ...str, description: "Anything unusual about this build of the file" },
    },
    ["api", "version", "generated", "self", "docs"]
  ),
  Link: obj({ label: str, url: uri }),
  Award: obj({ place: str, medal, event: str, track: nullable(str), url: nullable(uri) }),
  AwardEntry: obj({ project: str, place: str, medal, event: str, track: nullable(str), url: nullable(uri), project_url: uri }),
  ClusterRef: obj({ id: str, title: str }),
  ProjectUrls: obj({ page: uri, repo: uri, demo: nullable(uri), docs: nullable(uri), og_image: uri, api: uri }),
  ProjectSummary: obj(PROJECT_FIELDS),
  ProjectDetail: obj({
    ...PROJECT_FIELDS,
    install: nullable({ ...str, description: "Install command, for packages on PyPI" }),
    writeup: nullable(obj({ html: str, text: str })),
    related: { ...arr(str), description: "Other projects in the same domain" },
  }),
  Cluster: obj(CLUSTER_FIELDS),
  ClusterDetail: obj({ ...CLUSTER_FIELDS, projects: arr(P("ProjectSummary")) }),
  Language: obj({ name: str, color: nullable(str), count: int, projects: arr(str) }),
  Tag: obj({ tag: str, count: int, projects: arr(str) }),
  InProgressItem: obj({ name: str, hint: str }),
  Pull: obj({
    repo: str,
    number: int,
    title: str,
    state: { type: "string", enum: ["open", "closed", "merged"] },
    url: uri,
    created: nullable({ type: "string", format: "date" }),
    repo_stars: int,
  }),
  Post: obj({ title: str, url: uri, published: nullable(dateTime), summary: str }),
  Profile: obj({
    name: str,
    handle: str,
    headline: str,
    summary: str,
    focus: str,
    certifications: arr(str),
    open_to_work: obj({ open: bool, text: nullable(str) }),
    links: obj({ site: uri, blog: uri, api: uri, github: uri, itch: uri }),
    contact: obj({
      form: uri,
      discord: str,
      irc: obj({ network: str, nick: str, how: str, web_client: uri }),
    }),
    pgp: nullable(obj({ fingerprint: str, key_url: uri, armored: str })),
  }),
  Stats: obj({
    projects: int,
    domains: int,
    featured: int,
    languages: int,
    tags: int,
    stars: obj({ total: int, top: arr(obj({ name: str, stars: int })) }),
    pull_requests: obj({ count: int, repos: int, merged: int, reach: { ...int, description: "Stars summed across the repos I've sent PRs to" } }),
    posts: int,
    awards: int,
    in_progress: int,
    last_push: nullable(obj({ project: str, at: dateTime })),
  }),
  Badge: obj(
    { schemaVersion: { type: "integer", enum: [1] }, label: str, message: str, color: str },
    undefined,
    "A shields.io endpoint badge: https://shields.io/badges/endpoint-badge"
  ),
  IndexEndpoint: obj(
    {
      path: str,
      url: { ...uri, description: "A URL template when `params` is present" },
      summary: str,
      group: str,
      type: str,
      params: { type: "object", description: "Every valid value of each path parameter", additionalProperties: arr(str) },
    },
    ["path", "url", "summary", "group", "type"]
  ),
  Index: obj({ name: str, description: str, version: str, docs: uri, openapi: uri, endpoints: arr(P("IndexEndpoint")) }),
};

/* ------------------------------------------------------------------------ */
/* the routes                                                                */
/* ------------------------------------------------------------------------ */

export const GROUPS = [
  { name: "Discovery", description: "Where everything is." },
  { name: "Profile", description: "Who I am and how to reach me." },
  { name: "Projects", description: "The index, one file per project." },
  { name: "Taxonomy", description: "Domains, languages and tags." },
  { name: "Activity", description: "Pull requests, blog posts and the numbers." },
  { name: "Badges", description: "For READMEs." },
  { name: "Terminal", description: "Plain text, for curl." },
];

const list = (name) => arr(P(name));
const JSON_TYPE = "application/json";

// path: absolute URL path. build(s, value) returns the payload (wrapped in the
// meta/data envelope unless `raw`); routes without `build` are served by
// their own page file (openapi.json.js, pgp.asc.js) and listed here for docs.
export const ROUTES = [
  {
    id: "getIndex", group: "Discovery", path: `${BASE}/index.json`,
    summary: "Every endpoint, with its URL",
    description: "Machine-readable table of contents; templated paths list every valid value.",
    schema: P("Index"),
    build: (s) => ({
      name: "Londopy API",
      description: DESCRIPTION,
      version: VERSION,
      docs: abs("/api/"),
      openapi: abs("/api/openapi.json"),
      endpoints: ROUTES.map((r) => ({
        path: r.path,
        url: abs(r.path),
        summary: r.summary,
        group: r.group,
        type: r.type ?? JSON_TYPE,
        ...(r.param ? { params: { [r.param.name]: r.param.values(s) } } : {}),
      })),
    }),
  },
  {
    id: "getOpenApi", group: "Discovery", path: "/api/openapi.json",
    summary: "This API, described in OpenAPI 3.1",
    description: "Drop it into Swagger UI, Postman or an SDK generator.",
    schema: { type: "object" }, raw: true,
  },
  {
    id: "getProfile", group: "Profile", path: `${BASE}/profile.json`,
    summary: "Name, links, contact methods and PGP key",
    schema: P("Profile"),
    build: () => profileDoc(),
  },
  {
    id: "getPgpKey", group: "Profile", path: "/pgp.asc",
    summary: "My PGP public key, ASCII-armored",
    description: "Encrypt to it with `curl -s https://londopy.github.io/pgp.asc | gpg --import`.",
    type: "application/pgp-keys",
  },
  {
    id: "listProjects", group: "Projects", path: `${BASE}/projects.json`,
    summary: "Every project",
    description: "Live star counts and last-push times, as of the last build.",
    schema: list("ProjectSummary"),
    build: (s) => s.projects.map(projectSummary),
  },
  {
    id: "getProject", group: "Projects", path: `${BASE}/projects/{name}.json`,
    summary: "One project, with its full writeup",
    description: "Adds the writeup (HTML and plain text), an install command for PyPI packages, and related projects.",
    param: { name: "name", description: "Project name, exactly as the repo spells it", values: (s) => s.projects.map((p) => p.name) },
    schema: P("ProjectDetail"),
    build: (s, name) => projectDetail(s.projects.find((p) => p.name === name), s.projects),
  },
  {
    id: "listFeatured", group: "Projects", path: `${BASE}/featured.json`,
    summary: "The featured projects",
    schema: list("ProjectSummary"),
    build: (s) => s.projects.filter((p) => p.featured).map(projectSummary),
  },
  {
    id: "listAwards", group: "Projects", path: `${BASE}/awards.json`,
    summary: "Hackathon placings and other awards",
    schema: list("AwardEntry"),
    build: (s) => awardList(s.projects),
  },
  {
    id: "listInProgress", group: "Projects", path: `${BASE}/in-progress.json`,
    summary: "Names reserved, code brewing",
    schema: list("InProgressItem"),
    build: (s) => s.inProgress.map(({ name, hint }) => ({ name, hint })),
  },
  {
    id: "listClusters", group: "Taxonomy", path: `${BASE}/clusters.json`,
    summary: "The domains projects are grouped by",
    schema: list("Cluster"),
    build: (s) => s.clusters.map((c) => clusterSummary(c, s.projects)),
  },
  {
    id: "getCluster", group: "Taxonomy", path: `${BASE}/clusters/{id}.json`,
    summary: "One domain, with its projects in full",
    param: { name: "id", description: "Domain id", values: (s) => s.clusters.map((c) => c.id) },
    schema: P("ClusterDetail"),
    build: (s, id) => clusterDetail(s.clusters.find((c) => c.id === id), s.projects),
  },
  {
    id: "listLanguages", group: "Taxonomy", path: `${BASE}/languages.json`,
    summary: "Languages, their colours, and the projects using each",
    schema: list("Language"),
    build: (s) => languageIndex(s.projects),
  },
  {
    id: "listTags", group: "Taxonomy", path: `${BASE}/tags.json`,
    summary: "Tags, and the projects carrying each",
    schema: list("Tag"),
    build: (s) => tagIndex(s.projects),
  },
  {
    id: "listPulls", group: "Activity", path: `${BASE}/pulls.json`,
    summary: "Pull requests to other people's projects",
    description: "Merged first, then newest. States refresh from GitHub on every build.",
    schema: list("Pull"),
    build: (s) => s.pulls.map(pullOut),
  },
  {
    id: "listPosts", group: "Activity", path: `${BASE}/posts.json`,
    summary: "Blog posts, newest first",
    description: "Read from the blog's RSS feed at build time.",
    schema: list("Post"),
    build: (s) => s.posts,
    meta: (s) => ({
      source: FEED_URL,
      ...(s.postsOk ? {} : { note: "the blog feed couldn't be read at build time; posts return on the next build" }),
    }),
  },
  {
    id: "getStats", group: "Activity", path: `${BASE}/stats.json`,
    summary: "The numbers, all in one place",
    schema: P("Stats"),
    build: (s) => statsDoc(s),
  },
  {
    id: "getBadge", group: "Badges", path: `${BASE}/badges/{metric}.json`,
    summary: "A shields.io endpoint badge",
    description: "Use with https://img.shields.io/endpoint?url=… — the badge follows the site.",
    param: { name: "metric", description: "Which number", values: () => Object.keys(BADGES) },
    schema: P("Badge"), raw: true,
    build: (s, metric) => ({ schemaVersion: 1, ...BADGES[metric].make(s) }),
  },
  {
    id: "getCardText", group: "Terminal", path: `${BASE}/card.txt`,
    summary: "A business card for your terminal",
    type: "text/plain",
    build: (s) => card(s),
  },
  {
    id: "getCardAnsi", group: "Terminal", path: `${BASE}/card.ansi`,
    summary: "The same card, in colour (24-bit ANSI)",
    description: "`curl -s https://londopy.github.io/api/v1/card.ansi`",
    type: "application/octet-stream",
    build: (s) => card(s, { ansi: true }),
  },
];

/* ------------------------------------------------------------------------ */
/* rendering                                                                 */
/* ------------------------------------------------------------------------ */

const fill = (r, value) => (r.param ? r.path.replace(`{${r.param.name}}`, value) : r.path);

// every concrete file under /api/v1/ — templated routes expanded per value
export function v1Files(s) {
  return ROUTES.filter((r) => r.build).flatMap((r) =>
    (r.param ? r.param.values(s) : [null]).map((value) => ({
      route: r.path,
      value,
      file: fill(r, value).slice(BASE.length + 1),
    }))
  );
}

export function render(s, route, value) {
  const r = ROUTES.find((x) => x.path === route);
  const path = fill(r, value);
  const out = r.build(s, value);
  if (r.type && r.type !== JSON_TYPE) return { type: r.type, body: out };
  const payload = r.raw
    ? out
    : {
        meta: {
          api: "londopy",
          version: VERSION,
          generated: s.generated,
          self: abs(path),
          docs: abs("/api/"),
          ...(Array.isArray(out) ? { count: out.length } : {}),
          ...(r.meta ? r.meta(s) : {}),
        },
        data: out,
      };
  return { type: `${JSON_TYPE}; charset=utf-8`, body: JSON.stringify(payload, null, 2) + "\n" };
}

export function openapi(s) {
  const paths = {};
  for (const r of ROUTES) {
    const type = r.type ?? JSON_TYPE;
    const schema =
      type !== JSON_TYPE ? { type: "string" } : r.raw ? r.schema : obj({ meta: P("Meta"), data: r.schema });
    paths[r.path] = {
      get: {
        operationId: r.id,
        summary: r.summary,
        ...(r.description ? { description: r.description } : {}),
        tags: [r.group],
        ...(r.param
          ? {
              parameters: [
                {
                  name: r.param.name,
                  in: "path",
                  required: true,
                  description: r.param.description,
                  schema: { type: "string", enum: r.param.values(s) },
                },
              ],
            }
          : {}),
        responses: {
          200: { description: "OK", content: { [type]: { schema } } },
          ...(r.param ? { 404: { description: `No such ${r.param.name} (GitHub Pages' HTML 404 page)` } } : {}),
        },
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "Londopy API",
      version: VERSION,
      summary: "London C.'s projects, writeups, pull requests and posts, as JSON.",
      description: DESCRIPTION,
      contact: { name: profile.name, url: abs("/contact/") },
    },
    servers: [{ url: SITE, description: "GitHub Pages" }],
    externalDocs: { description: "Docs, with a live console", url: abs("/api/") },
    tags: GROUPS,
    paths,
    components: { schemas: SCHEMAS },
  };
}
