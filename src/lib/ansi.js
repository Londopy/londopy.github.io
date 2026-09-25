// ANSI SGR (bold + 24-bit colour, which is all the terminal card uses) to
// HTML, so the API page can show card.ansi the way a terminal would.

export const escapeHtml = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function ansiToHtml(text) {
  let html = "";
  let open = false;
  String(text)
    .split(/\x1b\[([\d;]*)m/)
    .forEach((part, i) => {
      if (i % 2 === 0) {
        html += escapeHtml(part);
        return;
      }
      if (open) {
        html += "</span>";
        open = false;
      }
      const codes = part.split(";").map(Number);
      let style = "";
      for (let j = 0; j < codes.length; j++) {
        if (codes[j] === 1) style += "font-weight:700;";
        else if (codes[j] === 38 && codes[j + 1] === 2) {
          style += `color:rgb(${codes[j + 2]},${codes[j + 3]},${codes[j + 4]});`;
          j += 4;
        }
      }
      if (style) {
        html += `<span style="${style}">`;
        open = true;
      }
    });
  return html + (open ? "</span>" : "");
}
