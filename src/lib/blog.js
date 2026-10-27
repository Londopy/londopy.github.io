// Build-time read of the blog's RSS feed (Londopy/blog, a separate Hugo site
// served at /blog/), so the API can list posts next to the projects. Hugo only
// puts published posts in the feed, so scheduled ones appear on the first
// build after they go live. Never breaks the build: if the feed can't be
// reached, the list is empty and `ok` is false (the API says so in its meta).

import { decodeEntities } from "./text.js";

export const FEED_URL = "https://londopy.github.io/blog/index.xml";

let cache = null;

function field(chunk, name) {
  const m = chunk.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  if (!m) return "";
  const cdata = m[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return (cdata ? cdata[1] : m[1]).trim();
}

// Hugo double-escapes some text (&amp;#39; → &#39; → '), so decode twice.
const text = (s) => decodeEntities(decodeEntities(s)).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export function parseFeed(xml) {
  return xml
    .split("<item>")
    .slice(1)
    .map((chunk) => {
      const date = field(chunk, "pubDate");
      const t = date ? Date.parse(date) : NaN;
      return {
        title: text(field(chunk, "title")),
        url: decodeEntities(field(chunk, "link")),
        published: Number.isNaN(t) ? null : new Date(t).toISOString(),
        summary: text(field(chunk, "description")),
      };
    })
    .filter((p) => p.title && p.url)
    .sort((a, b) => (b.published || "").localeCompare(a.published || ""));
}

export async function getPosts() {
  if (cache) return cache;
  let result = { ok: false, items: [] };
  try {
    const res = await fetch(FEED_URL, { headers: { "User-Agent": "londopy.github.io" } });
    if (res.ok) result = { ok: true, items: parseFeed(await res.text()) };
  } catch {
    /* offline — no posts this build */
  }
  cache = result;
  return result;
}
