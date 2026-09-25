// A tiny inline markup for hand-written blurbs (the /now page): [text](url),
// **bold**, *italic* and `code` — rendered to HTML for pages, or to plain
// text for the API.

import { escapeHtml } from "./ansi.js";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function inlineToHtml(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(LINK, (_, text, url) => `<a href="${url}">${text}</a>`);
}

export function inlineToText(s) {
  return s
    .replace(LINK, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

// every [text](url) in a string, with site-relative URLs made absolute
export function inlineLinks(s, site) {
  return [...s.matchAll(LINK)].map(([, text, url]) => ({
    label: text.replace(/\*+/g, ""),
    url: url.startsWith("/") ? site + url : url,
  }));
}
