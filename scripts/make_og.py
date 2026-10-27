#!/usr/bin/env python3
"""Generate Open Graph cards (1200x630) — terminal-window style, amber theme.

Writes:
  public/og-image.png            — the site-wide card (home / about / fallback)
  public/og/<name>.png           — one card per project in src/data/projects.json

Run from the repo root:  python scripts/make_og.py
Requires Pillow. Fonts are resolved from a portable candidate list (JetBrains
Mono / DejaVu on Windows or Linux), so it runs on either.
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = "#0a0e13"
PANEL = "#0f141b"
TITLEBAR = "#151c25"
BORDER = "#2c3947"
GRID = "#131a23"
TEXT = "#cdd8e3"
DIM = "#8494a6"
FAINT = "#56677a"
ACCENT = "#e9a13a"          # amber theme accent
AMBER = "#e8b444"           # star gold
RED = "#e8564f"
NEUTRAL = "#3a4a5a"
MEDAL = {"gold": "#e8b444", "silver": "#b8c4d0", "bronze": "#d08a4e"}

LANG = {
    "Rust": "#dea584", "Python": "#3572a5", "TypeScript": "#3178c6",
    "C++": "#f34b7d", "Bash": "#89e051", "JavaScript": "#f1e05a",
    "x86 ASM": "#c9a227", "Astro": "#ff5a03", "Zig": "#f7a41d",
    "Nexium": "#4fd1c5", "Svelte": "#ff3e00", "Gleam": "#ffaff3", "C": "#8b949e",
    "C#": "#178600", "Odin": "#60affe",
}

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def find_font(candidates):
    for p in candidates:
        if os.path.exists(p):
            return p
    raise SystemExit("no font found among:\n  " + "\n  ".join(candidates))


MONO = find_font([
    "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf",
    "C:/Windows/Fonts/JetBrainsMonoNerdFont-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/DejaVuSansMono.ttf",
])
MONO_B = find_font([
    "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf",
    "C:/Windows/Fonts/JetBrainsMonoNerdFont-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "C:/Windows/Fonts/DejaVuSansMono-Bold.ttf",
])
SANS = find_font([
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "C:/Windows/Fonts/DejaVuSans.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
])
# JetBrains Mono has no U+2605 (★), so the star badge would render as tofu;
# draw it with a mono font that carries the glyph
SYMBOL = find_font([
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/seguisym.ttf",
])

PX, PY, PW, PH = 80, 82, 1040, 466


def base_card():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=GRID, width=1)
    d.rounded_rectangle([PX, PY, PX + PW, PY + PH], radius=12,
                        fill=PANEL, outline=BORDER, width=2)
    d.rounded_rectangle([PX + 2, PY + 2, PX + PW - 2, PY + 46], radius=10, fill=TITLEBAR)
    d.rectangle([PX + 2, PY + 30, PX + PW - 2, PY + 46], fill=TITLEBAR)
    for i, c in enumerate([RED, AMBER, NEUTRAL]):
        cx = PX + 32 + i * 24
        d.ellipse([cx - 7, PY + 17, cx + 7, PY + 31], fill=c)
    return img, d


def titlebar(d, text):
    f = ImageFont.truetype(MONO, 16)
    d.text((PX + PW / 2 - d.textlength(text, f) / 2, PY + 15), text, font=f, fill=FAINT)


def segments(d, x, y, parts, font):
    for text, color in parts:
        d.text((x, y), text, font=font, fill=color)
        x += d.textlength(text, font)


def wrap(d, text, font, max_w, max_lines):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
            if len(lines) >= max_lines:
                break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    # if the wrapped lines dropped content, ellipsize the last line
    if len(" ".join(lines)) < len(text):
        last = lines[-1] if lines else ""
        while last and d.textlength(last + " …", font) > max_w:
            last = last.rsplit(" ", 1)[0] if " " in last else last[:-1]
        lines[-1] = last + " …"
    return lines[:max_lines]


def lang_dots(d, x, y, langs, font):
    for name in langs:
        color = LANG.get(name, FAINT)
        d.ellipse([x, y + 4, x + 15, y + 19], fill=color)
        d.text((x + 24, y), name, font=font, fill=TEXT)
        x += 24 + d.textlength(name, font) + 34


def project_card(p, out):
    name = p["name"]
    img, d = base_card()
    titlebar(d, f"londopy@github: ~/projects/{name}")

    # prompt
    fp = ImageFont.truetype(MONO, 22)
    segments(d, 130, 168, [
        ("londopy", ACCENT), ("@", FAINT), ("github", TEXT), (":~$", FAINT),
        (f"  cat {name}", DIM),
    ], fp)

    # name (shrink to fit the panel width)
    size = 54
    while size > 30:
        fn = ImageFont.truetype(MONO_B, size)
        if d.textlength(name, fn) <= PW - 230:
            break
        size -= 2
    d.text((130, 212), name, font=fn, fill=TEXT)

    # award (hackathon placing), right-aligned on the prompt line
    award = p.get("award")
    if award:
        fa = ImageFont.truetype(MONO, 20)
        color = MEDAL.get(award.get("medal"), AMBER)
        text = f"{award['place']} · {award['event']}"
        x = PX + PW - 40 - d.textlength(text, fa)
        d.text((x, 171), text, font=fa, fill=color)
        cx, cy = x - 20, 187                       # a small medal: ribbon + disc
        d.polygon([(cx - 8, cy - 17), (cx - 3, cy - 17), (cx + 1, cy - 6), (cx - 4, cy - 6)], fill=DIM)
        d.polygon([(cx + 3, cy - 17), (cx + 8, cy - 17), (cx + 4, cy - 6), (cx - 1, cy - 6)], fill=FAINT)
        d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=color)
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], outline=PANEL, width=2)

    # star badge, top-right of the panel
    stars = p.get("stars") or 0
    if stars >= 2:
        fs = ImageFont.truetype(SYMBOL, 24)
        s = f"\u2605 {stars}"
        d.text((PX + PW - 40 - d.textlength(s, fs), 214), s, font=fs, fill=AMBER)

    # tagline
    ft = ImageFont.truetype(SANS, 26)
    for i, line in enumerate(wrap(d, p["tagline"], ft, PW - 120, 3)):
        d.text((132, 300 + i * 40), line, font=ft, fill=DIM)

    # languages
    langs = [x.strip() for x in p["language"].split(" + ") if x.strip()]
    lang_dots(d, 132, 452, langs, ImageFont.truetype(MONO, 20))

    # url footer
    fu = ImageFont.truetype(MONO, 22)
    u = f"londopy.github.io/projects/{name}"
    d.text((W / 2 - d.textlength(u, fu) / 2, 582), u, font=fu, fill=ACCENT)

    img.save(out, optimize=True)


def main_card(data, out):
    n_proj = len(data["projects"])
    n_dom = len(data["clusters"])
    img, d = base_card()
    titlebar(d, "londopy@github: ~/projects")

    fp = ImageFont.truetype(MONO, 24)
    segments(d, 130, 172, [
        ("londopy", ACCENT), ("@", FAINT), ("github", TEXT), (":~$", FAINT),
        (" ls ./projects --group-by domain", DIM),
    ], fp)

    d.text((126, 218), "London C.", font=ImageFont.truetype(MONO_B, 58), fill=TEXT)

    ftag = ImageFont.truetype(SANS, 29)
    segments(d, 130, 312, [
        ("I build tools for ", DIM), ("climbing", ACCENT), (", ", DIM),
        ("medicine", ACCENT), (",", DIM),
    ], ftag)
    segments(d, 130, 352, [
        ("Windows internals", ACCENT), (", and ", DIM), ("myself", ACCENT), (".", DIM),
    ], ftag)

    flang = ImageFont.truetype(MONO, 19)
    rows = [["Rust", "Python", "TypeScript", "Nexium"],
            ["Zig", "Gleam", "Svelte", "C"]]
    for r, row in enumerate(rows):
        lang_dots(d, 132, 410 + r * 36, row, flang)

    segments(d, 132, 496, [
        (f"{n_proj} projects \u00b7 {n_dom} domains ", FAINT), ("\u258c", ACCENT),
    ], flang)

    fu = ImageFont.truetype(MONO, 22)
    t = "londopy.github.io"
    d.text((W / 2 - d.textlength(t, fu) / 2, 582), t, font=fu, fill=ACCENT)
    img.save(out, optimize=True)


def run():
    data = json.load(open(os.path.join(ROOT, "src/data/projects.json"), encoding="utf-8"))
    os.makedirs(os.path.join(ROOT, "public/og"), exist_ok=True)
    main_card(data, os.path.join(ROOT, "public/og-image.png"))
    print("wrote public/og-image.png")
    for p in data["projects"]:
        out = os.path.join(ROOT, "public/og", p["name"] + ".png")
        project_card(p, out)
    print(f"wrote {len(data['projects'])} cards into public/og/")


if __name__ == "__main__":
    run()
