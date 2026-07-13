// Long-form docs bodies for the projects that warrant a full writeup.
// Keyed by project `name`. Rendered as HTML inside the ProjectDoc prose area.
// Projects without an entry get an auto-generated page that points at the README.

export const projectDocs = {
  "capture-bypass": `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>capture-bypass</strong> is a Windows utility that defeats the screen-capture protection some applications apply to their windows — the flag that makes a window render as a black rectangle in screenshots and recordings. It ships as a multi-crate Rust workspace with a native <code>egui</code> GUI and an Inno Setup installer, and it's the most-starred project in the account.</p>

<h2><span class="hash">##</span> Why I built it</h2>
<p>Capture protection is a per-window rendering flag, not real security — but it quietly breaks legitimate things like recording a tutorial, filing a bug report, or archiving your own session. I wanted to understand exactly how the protection is enforced at the window-manager level, and the cleanest way to understand a mechanism is to build the thing that flips it back.</p>

<h2><span class="hash">##</span> How it works</h2>
<p>The tool injects a small payload into the target process and clears the window's display-affinity flag (<code>WDA_EXCLUDEFROMCAPTURE</code>) so the compositor no longer excludes it from capture. The workspace splits cleanly along those lines:</p>
<ul>
<li>a shared injection library and a CLI,</li>
<li>one-shot and persistent payload DLLs,</li>
<li>a thin <code>egui</code> front end with a live process list, tray mode, watch-list, global hotkey, and update checker,</li>
<li>plus a 32-bit fallback for x86 targets and a stress tester.</li>
</ul>
<p>Everything is Rust end to end, which keeps the injection path small, fast, and free of a heavyweight runtime.</p>

<h2><span class="hash">##</span> A note on intent</h2>
<p>This is a tool for capturing windows you're entitled to capture — your own sessions, software you're testing, content you have the right to record. It isn't a DRM circumvention tool and shouldn't be used to capture protected content you don't own.</p>
`,

  ropesim: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>ropesim</strong> simulates the dynamics of a climbing lead fall. A dynamic rope is essentially a long, heavily damped spring, and ropesim models it as one — integrating the motion numerically to reproduce peak impact forces, rope stretch, and how energy dissipates through the system during a fall, to UIAA 101 / EN 892.</p>

<h2><span class="hash">##</span> Why I built it</h2>
<p>Climbers talk about "soft" and "hard" catches, fall factors, and impact forces, but the numbers behind those words are rarely visible. I wanted a tool that let me actually watch fall factor, belayer behaviour, and rope properties change the peak force on the system — starting from the physics rather than rules of thumb. Built because I wanted to know what really happens during a factor-2 fall.</p>

<h2><span class="hash">##</span> How it works</h2>
<p>The core is written in <strong>Rust</strong>: a damped-spring model advanced with an <strong>RK4</strong> integrator for stable, accurate time-stepping. That core is exposed to <strong>Python</strong> through <code>PyO3</code> / <code>Maturin</code>, so the heavy numerical loop runs at native speed while everything on top stays in Python. Several ways to drive it sit on top of the library:</p>
<ul>
<li>a full <strong>Python API</strong> for scripting and analysis,</li>
<li>a 20-plus command <strong>CLI</strong>,</li>
<li>a <strong>PySide6</strong> desktop GUI with a 3D Vispy viewport,</li>
<li>optional <strong>Rapier3D</strong> capsule-chain rope simulation, parallel batch sweeps via Rayon, a 25-rope database, and guide-mode belay-device math.</li>
</ul>

<h2><span class="hash">##</span> Try it</h2>
<p>ropesim is on PyPI, so the fastest way in is <code>pip install ropesim</code>. From there you can call the Python API directly, run the CLI, or launch the GUI — the README walks through all three.</p>
`,

  drugdose: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>drugdose</strong> is a Python library for pre-hospital and clinical drug-dosing math. Give it a patient weight and a drug and it returns the correct weight-based dose, backed by a 49-drug database and a set of interaction rules — so the arithmetic and the lookups happen in one place instead of in your head under pressure.</p>

<h2><span class="hash">##</span> Why I built it</h2>
<p>In the field, dosing errors come from exactly the conditions you're working in: time pressure, mental math, and juggling reference cards. A small, fast, well-tested library that does the weight-based calculation and flags interactions removes a whole class of avoidable mistakes. This one comes straight out of the EMS side of what I do.</p>

<h2><span class="hash">##</span> What's inside</h2>
<ul>
<li><strong>Weight-based dosing</strong> — mg/kg, mcg/kg, or flat, with pediatric caps.</li>
<li><strong>IV drip-rate math</strong> — any rate unit to mL/hr pump rate plus bag duration.</li>
<li><strong>39 interaction rules</strong> with severity and management guidance, allergy and cross-reactivity matching, and contraindication flags.</li>
<li><strong>49-drug database</strong> spanning EMS, cardiac, anesthesia, ICU, antibiotics, and toxicology. Pure Python — only <code>rich</code> and <code>click</code>.</li>
</ul>

<h2><span class="hash">##</span> Try it</h2>
<p>drugdose is on PyPI — <code>pip install drugdose</code> and import it into your own project. The README covers the API and the drug database.</p>

<h2><span class="hash">##</span> A note on use</h2>
<p>drugdose is a calculation aid, not a substitute for clinical judgment, protocol, or medical direction. Always confirm doses against your local protocols before administration.</p>
`,

  timefuzz: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>timefuzz</strong> resolves human phrases like <em>"sometime next week"</em>, <em>"the Tuesday after my birthday"</em>, or <em>"end of Q3"</em> into concrete datetimes or ranges — each with a <strong>confidence score</strong>, so your app knows when to ask the user to confirm. Rust core, thin Python API, shipped as compiled wheels (<code>pip install timefuzz</code>, no Rust toolchain required).</p>

<h2><span class="hash">##</span> Why another date parser</h2>
<p>Existing parsers like <code>dateparser</code> handle "in 3 days" and "next Friday" but fall over on the interesting cases:</p>
<ul>
<li><strong>Ranges and vagueness</strong> — "sometime next week" is a span, not an instant.</li>
<li><strong>Anchored relatives</strong> — "the Tuesday after my birthday" needs a user-supplied anchor date.</li>
<li><strong>Business calendars</strong> — "end of Q3", "next business day", "the 2nd Monday of March", "10 business days after the invoice date".</li>
<li><strong>Honest ambiguity</strong> — "next weekend" said on a Wednesday has two defensible readings; timefuzz returns both instead of silently guessing.</li>
</ul>

<h2><span class="hash">##</span> What it returns</h2>
<p>Every parse yields an <code>Instant</code>, an inclusive <code>Range</code>, or an <code>Ambiguous</code> set of candidates — each carrying a deterministic confidence score and the interpretation the parser chose, so schedulers, reminder apps, and chat bots can decide when to double-check. If nothing matches, <code>ParseError</code> is raised with the reason.</p>

<h2><span class="hash">##</span> Try it</h2>
<p>timefuzz is on PyPI — <code>pip install timefuzz</code>. Point it at a phrase with an optional reference <code>now</code> plus anchor dates, then match on the result shape. The README carries the full grammar reference and a cookbook.</p>
`,
};
