#!/usr/bin/env python3
"""Generate public/og-image.png (1200x630) — terminal-window OG card.

Run from the repo root:  python3 scripts/make_og.py
Requires Pillow and the DejaVu fonts.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = "#0a0e13"
PANEL = "#0f141b"
TITLEBAR = "#151c25"
BORDER = "#2c3947"
GRID = "#141b24"
TEXT = "#cdd8e3"
DIM = "#8494a6"
FAINT = "#56677a"
GREEN = "#45d483"
AMBER = "#e8b444"
RED = "#e8564f"

MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# faint grid
for x in range(0, W, 40):
    d.line([(x, 0), (x, H)], fill=GRID, width=1)
for y in range(0, H, 40):
    d.line([(0, y), (W, y)], fill=GRID, width=1)

# terminal window
PX, PY, PW, PH = 80, 82, 1040, 466
d.rounded_rectangle([PX, PY, PX + PW, PY + PH], radius=12, fill=PANEL, outline=BORDER, width=2)
d.rounded_rectangle([PX + 2, PY + 2, PX + PW - 2, PY + 46], radius=10, fill=TITLEBAR)
d.rectangle([PX + 2, PY + 30, PX + PW - 2, PY + 46], fill=TITLEBAR)

for i, c in enumerate([RED, AMBER, GREEN]):
    cx = PX + 32 + i * 24
    d.ellipse([cx - 7, PY + 17, cx + 7, PY + 31], fill=c)

f_title = ImageFont.truetype(MONO, 16)
t = "londopy@github: ~/projects"
d.text((PX + PW / 2 - d.textlength(t, f_title) / 2, PY + 15), t, font=f_title, fill=FAINT)


def segments(x, y, parts, font):
    for text, color in parts:
        d.text((x, y), text, font=font, fill=color)
        x += d.textlength(text, font)


# prompt line
f_prompt = ImageFont.truetype(MONO, 24)
segments(130, 172, [
    ("londopy", GREEN), ("@", FAINT), ("github", TEXT), (":~$", FAINT),
    (" ls ./projects --group-by domain", DIM),
], f_prompt)

# name
f_name = ImageFont.truetype(MONO_B, 58)
d.text((126, 218), "London C.", font=f_name, fill=TEXT)

# tagline (two lines, colored domain words)
f_tag = ImageFont.truetype(SANS, 29)
segments(130, 312, [
    ("I build tools for ", DIM), ("climbing", GREEN), (", ", DIM),
    ("medicine", GREEN), (",", DIM),
], f_tag)
segments(130, 352, [
    ("Windows internals", GREEN), (", and ", DIM), ("myself", GREEN), (".", DIM),
], f_tag)

# language dots — two rows
f_lang = ImageFont.truetype(MONO, 19)
LANGS = [
    ("Rust", "#dea584"), ("Python", "#3572a5"), ("TypeScript", "#3178c6"), ("C++", "#f34b7d"),
    ("Bash", "#89e051"), ("JavaScript", "#f1e05a"), ("Astro", "#ff5a03"), ("x86 ASM", "#c9a227"),
]
for row, start in enumerate((0, 4)):
    y = 412 + row * 36
    x = 132
    for name, color in LANGS[start:start + 4]:
        d.ellipse([x, y + 3, x + 15, y + 18], fill=color)
        d.text((x + 24, y), name, font=f_lang, fill=TEXT)
        x += 24 + d.textlength(name, f_lang) + 34

segments(132, 496, [("20 projects · 9 domains ", FAINT), ("▌", GREEN)], f_lang)

# url
f_url = ImageFont.truetype(MONO, 22)
t = "londopy.github.io"
d.text((W / 2 - d.textlength(t, f_url) / 2, 582), t, font=f_url, fill=GREEN)

img.save("public/og-image.png", optimize=True)
print("wrote public/og-image.png")
