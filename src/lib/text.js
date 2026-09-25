// Small text helpers shared by the API and the blog-feed reader.

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…",
  mdash: "—", ndash: "–", times: "×", middot: "·", rarr: "→", larr: "←",
};

// Decode HTML/XML character references (&amp; &#39; &#x2014; &rsquo; …).
// Unknown named entities are left as they are.
export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
    }
    return NAMED[e] ?? m;
  });
}

// A writeup's HTML as readable plain text: headings keep their "##", list
// items become "- " lines, paragraphs are separated by a blank line.
export function htmlToText(html) {
  return decodeEntities(
    String(html)
      .replace(/<\/(p|h2|h3|li|pre|ul|ol)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
