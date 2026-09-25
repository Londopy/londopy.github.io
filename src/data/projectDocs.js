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

  DiresQ: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>DiresQ</strong> is a disaster-response app with an unusual premise: every other tool maps where the disaster is — DiresQ tracks <em>the people going into it</em>. Built at <strong>Katy Youth Hacks 2026</strong> (theme: Tech for Humanity), and it later took <strong>Bronze — 3rd place in the Software Development track at Reverie Hacks 2026</strong>. I did the backend; my teammate built the frontend.</p>

<h2><span class="hash">##</span> The idea</h2>
<p>When a civilian volunteer self-deploys into a flood or storm, nobody logs that they went, nobody knows where they are, and nobody knows when to start worrying. And because everyone converges on whatever address is loudest online, six responders pile onto one street while the next one over has nobody. DiresQ fixes both: you join a report, check in on a timer, and check out — and every report shows how many people are already on it, so help spreads out instead of piling up.</p>

<h2><span class="hash">##</span> The accountability board</h2>
<p>The core is the board — everyone who's out, what they're doing, and how long since anyone heard from them. Miss a check-in and your row turns red on its own. There's no background job to forget to start and no timer process that can silently die: "overdue" is computed the moment the board is read. Nobody has to notice you went dark — the board does, and now someone knows where to start looking.</p>

<h2><span class="hash">##</span> How it's built</h2>
<ul>
<li><strong>Flask</strong> backend, server-rendered Jinja pages, a JSON API under <code>/api</code>, and SQLite — with 600+ tests across every route, permission rule, and the overdue math.</li>
<li>Free-text ETAs like "30 min" are parsed through <a href="https://github.com/Londopy/timefuzz">timefuzz</a> behind a confidence floor — a safety timer set from a bad guess is worse than no timer at all.</li>
<li>Severity can be set by running <strong>START triage</strong> through <a href="https://pypi.org/project/vitalscore/">vitalscore</a> instead of a guess.</li>
<li>Staffing is derived from responder votes, with the most cautious signal winning — an optimistic report can never suppress a call for help.</li>
</ul>
<p>Two of the pieces it leans on — timefuzz and vitalscore — are my own libraries, which is half the reason it came together in a weekend.</p>
`,

  nexium: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>nexium</strong> is a programming language of my own. It compiles to native code <em>through C</em>, uses automatic reference counting instead of a tracing garbage collector, and carries a machine-checked <strong>effect system</strong> that says whether a function allocates, blocks, or can panic. One source tree can be shipped as a C library, a Python wheel, a Rust crate, or a command-line tool.</p>

<h2><span class="hash">##</span> Why build a language</h2>
<p>The pitch I kept wanting was "complete enough to build everything in, but also the best thing to reach for when you only need <em>one piece</em> of something else." Most languages make you pick: a big runtime that's great alone and painful to embed, or a low-level language that embeds well but fights you everywhere else. Nexium is an attempt to get both — native performance, no heavyweight runtime, and a compiler that hands you whatever artifact the host project actually consumes.</p>

<h2><span class="hash">##</span> How it works</h2>
<ul>
<li><strong>Native through C</strong> — the backend lowers to C and hands off to a C compiler, so Nexium inherits a mature optimiser and runs anywhere C does.</li>
<li><strong>ARC, not GC</strong> — automatic reference counting means deterministic cleanup and no stop-the-world pauses.</li>
<li><strong>Effect system</strong> — allocation, blocking, and panic are tracked in the type system and checked at compile time, so a function's signature tells you what it's allowed to do.</li>
<li><strong>One tree, every target</strong> — declare <code>artifact cabi</code>, <code>artifact python</code>, and the rest, then <code>nx ship</code> emits a DLL + header, a Python wheel, a Rust crate, or a CLI in one pass.</li>
</ul>

<h2><span class="hash">##</span> A taste</h2>
<p>A single <code>.nx</code> file, exported to C and Python at once:</p>
<pre><code>fn checksum(data: []u8) -&gt; u32 export(c) { ... }
artifact cabi   { name = "hasher" }
artifact python { name = "hasher" }</code></pre>
<p>Then <code>nx ship hasher.nx</code> produces the <code>.dll</code>, <code>.lib</code>, <code>.h</code>, and a <code>.whl</code> you can <code>import</code> straight into Python. The full language reference and roadmap live in the <a href="https://github.com/Londopy/nexium">repo</a>.</p>
`,

  "gesture-synth": `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>Gesture Synth</strong> is a chord instrument you play with your hands in front of a camera. Your left hand picks the chord — scale degree from which fingers are up, major or minor from the palm tilt. Your right hand shapes it — inversion, sevenths, octave with the thumb, filter with tilt, volume with height. A loop pedal records gesture performances into four tracks against a metronome, and everything you play is drawn back at you as a harmony-aware scene.</p>

<h2><span class="hash">##</span> The idea</h2>
<p>I wanted an instrument where the theory <em>is</em> the interface: four fingers and a tilted palm is a IV major, add three fingers on the right hand and it's a IV maj7. The visuals aren't decoration — the ring walks with the chord root, the note constellation is the actual voicing, and the circle of fifths shows where you are in the key. You learn harmony by moving your hands and watching what lights up.</p>

<h2><span class="hash">##</span> How it's built</h2>
<p>It runs from one codebase as two things: a <strong>Tauri desktop app</strong> (native audio thread, MIDI out, ffmpeg export) and a <strong>web app / installable PWA</strong> at the same URLs, offline after first load. Sessions are byte-identical across both, so a loop made in the browser opens on desktop and back again. Under the hood it spans an unusual stack:</p>
<ul>
<li><strong>Rust compiled to WASM</strong> for the hot path,</li>
<li><strong>Svelte + Three.js</strong> for the reactive 3D scene,</li>
<li>a <strong>Zig</strong> DSP kernel,</li>
<li>a <strong>Gleam</strong> service, and</li>
<li><strong>MediaPipe</strong> hand-tracking feeding the whole thing.</li>
</ul>
<p>The desktop build opens in <em>Stage</em> — a game shell with song select on the circle of fifths and rated sets; the website opens in <em>Studio</em>, the workstation layout. One switch in Settings moves between them.</p>

<h2><span class="hash">##</span> Try it</h2>
<p>There's a live web build — <a href="https://gesture-synth.onrender.com/">gesture-synth.onrender.com</a> — that runs in the browser with your camera. Give it a hand and start with a IV maj7.</p>
`,

  whumpf: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>WHUMPF</strong> projects an avalanche bulletin onto the actual mountain in 3D. A <em>whumpf</em> is the sound a weak snow layer makes when it collapses under you — the most unambiguous signal in avalanche safety. This is an attempt to give you that signal <em>before</em> you're standing on the slope.</p>

<h2><span class="hash">##</span> The problem it solves</h2>
<p>A published bulletin reads like "Persistent slab. N through NE aspects. Above 2400 m. 30–45 degrees. Danger: CONSIDERABLE (3)." That's accurate, and it's not an answer to the question you're actually asking: <strong>is the slope in front of me one of those slopes?</strong> WHUMPF filters the terrain by the bulletin's own parameters and lights up every slope that matches — rotate the mountain, see which bowls are loaded, see whether your skin track crosses one.</p>

<h2><span class="hash">##</span> How it works</h2>
<p>Almost everything is static files; the backend is deliberately thin. A DEM (3DEP / LINZ) feeds two paths: quantized-mesh terrain through Cesium ion, and a slope / aspect / elevation computation packed into <strong>RGBA XYZ tiles</strong>. A GLSL shader reads those channels and repaints the whole range live as you drag the danger sliders — no server round-trip per frame. Two bulletin adapters sit behind a cache, plus one route-analysis endpoint. No database.</p>

<h2><span class="hash">##</span> Where it's at</h2>
<p>Early, but no longer scaffolding: the Cesium client runs, the bulletin API answers, and a full mapping client has been ported in — GPX / GeoJSON / KML, route analysis, offline tiles, Garmin export, ski runs and lifts. Still ahead: wiring the attribute-tile pipeline to real DEM output rather than a synthetic test tile. The repo's <code>PORTING-STATUS.md</code> tracks exactly what's proven and what isn't.</p>

<h2><span class="hash">##</span> A note on safety</h2>
<p>WHUMPF <em>displays</em> official bulletins published by regional forecast centres — it doesn't generate, interpolate, or supplement any forecast. The overlay is a visualisation of a published product, not a recommendation, and no substitute for avalanche education, current observations, or your own judgement. Always consult the source bulletin; terrain data contains errors.</p>
`,

  filekind: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>filekind</strong> turns one declarative spec file into a real, recognised file type on Windows, Linux, and macOS. You describe the format once; it generates every artifact the three operating systems need to treat your extension as a first-class type — icons, MIME registration, and the scripts that install and remove it all.</p>

<h2><span class="hash">##</span> Why I built it</h2>
<p>Registering a custom file type today means hand-writing four unrelated artifacts in four dialects: a Windows <code>.reg</code> tree, a freedesktop shared-mime-info XML plus a <code>.desktop</code> entry, a macOS <code>Info.plist</code> UTI block, and a libmagic pattern. Each is separately and poorly documented, and getting any one subtly wrong means your icon silently doesn't show up. I wanted to write the format down <em>once</em>.</p>

<h2><span class="hash">##</span> What it generates</h2>
<p>From a single <code>.filekind</code> TOML spec — name, extension, magic bytes, MIME type, icon, handler — <code>filekind build</code> emits the whole set:</p>
<ul>
<li><strong>Windows:</strong> register / unregister <code>.reg</code>, Inno and NSIS installer snippets, and an <code>.ico</code>.</li>
<li><strong>Linux:</strong> shared-mime-info XML, a <code>.desktop</code> entry, hicolor icons at every size, install / uninstall scripts, and packaging fragments.</li>
<li><strong>macOS:</strong> an <code>Info.plist</code> UTI fragment and an <code>.icns</code>.</li>
<li>A <code>magic.txt</code> libmagic pattern and a README explaining what to run.</li>
</ul>
<p>Nothing is installed for you — it writes the files and points you at the generated README, so the system-changing step stays in your hands. Rust core, with a Tauri desktop app and a CLI.</p>
`,

  beam: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>Beam</strong> sends files and text between your devices, browser to browser, by scanning a QR code. No accounts, no uploads, no server of your own — just open the page on one device, scan the code with another, and drop files in either direction.</p>

<h2><span class="hash">##</span> How it works</h2>
<p>Data travels over a <strong>direct WebRTC connection</strong> between the two browsers. A tiny signalling server is used only to introduce the two peers to each other; once they're connected, the bytes go peer-to-peer and never touch a third machine. The whole thing is a handful of static files with no build step, served from GitHub Pages.</p>

<h2><span class="hash">##</span> Why it's built this way</h2>
<p>Most "send it to my other device" tools route your file through someone's cloud, tie it to a login, or keep a copy. Beam keeps the transfer between the only two machines that should ever see it. It's the quickest way to get a file from a phone to a laptop when you don't want to email it to yourself.</p>

<h2><span class="hash">##</span> Try it</h2>
<p>Open <a href="https://londopy.github.io/beam/">londopy.github.io/beam</a> on two devices and scan.</p>
`,

  "agent-skills": `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>agent-skills</strong> is the whole rollcall family in one install — <a href="https://github.com/Londopy/skill-rollcall">skill-rollcall</a>, <a href="https://github.com/Londopy/mcp-rollcall">mcp-rollcall</a>, <a href="https://github.com/Londopy/settings-effective">settings-effective</a>, and <a href="https://github.com/Londopy/git-attribution">git-attribution</a>. Each one makes a step that a coding agent does silently legible again — and each reads the files of whichever agent you're in: Claude Code, Codex, Cursor, Gemini CLI, Copilot, VS Code, Windsurf, OpenCode.</p>

<h2><span class="hash">##</span> The through-line</h2>
<p>Every coding agent registers skills, starts MCP servers, merges settings files, and signs commits — and tells you nothing about any of it until something's missing. Each also keeps those things somewhere different (<code>~/.claude</code>, <code>~/.codex</code>, <code>~/.agents</code>, <code>~/.cursor</code>, <code>~/.gemini</code>). Each tool here rebuilds one of those silent steps <em>from disk, with the reasons attached</em>, then repairs or reports:</p>
<ul>
<li><strong>skill-rollcall</strong> — which skills registered for which host, which are new, which will never show up and why, and whether a skill folder passes the Agent Skills spec.</li>
<li><strong>mcp-rollcall</strong> — which MCP servers will fail to connect and exactly why, and what each costs in tools and context, read from every host's own config shape.</li>
<li><strong>settings-effective</strong> — every Claude Code setting actually in effect, which file decided it, and why the value you set isn't applying (runs from any host).</li>
<li><strong>git-attribution</strong> — whether AI co-author trailers are landing in your history, where each agent's switch lives (Codex's is a workspace policy with nothing local to flip), which commits carry them, and how to scrub and block them.</li>
</ul>

<h2><span class="hash">##</span> How it's built</h2>
<p>Every tool is a single <strong>stdlib-only Python script</strong> that also runs as a plain CLI — read-only unless you pass <code>--apply</code>, with <code>--json</code> and <code>--strict</code> for tooling and CI. This repo is the family in one install; each skill also lives in its own repo, which is the source of truth. The copies here are synced from upstream, pinned in a lock file, and CI fails if they drift. The layout is the <a href="https://agentskills.io">Agent Skills</a> standard, so one <code>npx skills add Londopy/agent-skills</code> installs into any of 79 agents.</p>
`,

  statusmith: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>statusmith</strong> is a tray app for writing your own Discord <strong>Rich Presence</strong> — the "Playing…" card with details, state, images, timers, party size and buttons — and flipping between saved presets without leaving the system tray. Windows, macOS and Linux.</p>

<h2><span class="hash">##</span> Why it exists</h2>
<p>Rich Presence is something games get for free and people don't, because it's an API rather than a setting. Every tool that offers it either wants your account token — which is a password to your whole Discord account — or makes you write a script and keep it running. I wanted the good version: a real app, no token, no babysitting a terminal.</p>

<h2><span class="hash">##</span> How it works</h2>
<p>It talks to the Discord client already running on your machine over its <strong>local Rich Presence pipe</strong>, exactly the way a game does. That's the important part: the handshake is with the desktop client on localhost, so <em>statusmith never sees your account token</em> and there's no credential to leak. If Discord isn't running, there's simply nothing to talk to.</p>
<ul>
<li><strong>Applications as headlines</strong> — each Discord application you register becomes one headline ("Playing <em>life</em>", "Listening to <em>lofi</em>"), and you pick which one is active.</li>
<li><strong>Presets</strong> with details, state, large/small images, hover text, party size and up to two link buttons. Edits save as you type.</li>
<li><strong>Live variables and rotation</strong> — presence that changes on its own instead of sitting static.</li>
<li><strong>A Nexium SDK</strong>, so programs written in <a href="/projects/nexium/">my own language</a> can drive the presence directly.</li>
</ul>

<h2><span class="hash">##</span> How it's built</h2>
<p>A <strong>Tauri 2</strong> desktop app — web front end, Rust core — with the IPC work done against Discord's pipe by hand rather than through a heavyweight SDK. The SDK layer is written in <a href="/projects/nexium/">Nexium</a>, my own language, which makes statusmith the first thing I've shipped that runs Nexium in production rather than in its own test suite. Python handles the build side, and cross-platform builds and auto-update ship with it.</p>
<p><sub>GitHub reports those <code>.nx</code> files as Zig, because Nexium isn't in Linguist yet — the repo pins <code>linguist-language=Zig</code> as the closest grammar until it is.</sub></p>
`,

  "point-of-origin": `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>Point of Origin</strong> is a side-scrolling platformer where the puzzle <em>is</em> the ground. Built for the Cal Poly Game Development Club's <strong>World's First Game Jam</strong> (September 2026, theme <strong>ORIGIN</strong>). It's playable in the browser — no download needed.</p>

<h2><span class="hash">##</span> The idea</h2>
<p>You're shown how something ended, and asked to find where it began. You wake in the dark among the ruins of a structure that <em>grew</em> there, and your lantern only reveals the ghost of it in a small circle around you — so you have to run and jump through the ruins to piece together the full shape from memory. Then you find the single cell it grew from, stand there, plant a seed, get clear, and press Grow.</p>
<p>The living cells rise as solid ground: <strong>gold where they match the outline, red where they don't</strong>. Get it exact and the door opens — and the growth you just created is the bridge that carries you to it. The puzzle and the platforming are the same object, which is the part I'm happiest with.</p>

<h2><span class="hash">##</span> Why it's a hard puzzle</h2>
<p>It's a <strong>reverse cellular automaton</strong>. Running a growth law forward is trivial; asking which starting cell produces a given final pattern is the interesting direction, because the forward rule loses information. You're not solving a maze, you're inverting a simulation by reading its output.</p>
<p>And it can go wrong in ways that matter: living growth overgrows whoever is standing inside it, so you have to move away from your own seed before you grow it, or run.</p>

<h2><span class="hash">##</span> How it's built</h2>
<ul>
<li><strong>Odin</strong> — the cellular-automaton simulation, compiled to a native DLL so the grid steps fast enough to be a real-time mechanic rather than a turn.</li>
<li><strong>Nexium</strong> — <a href="/projects/nexium/">my own language</a> drives the build, the binding generation and the level pipeline.</li>
<li><strong>Unity 6</strong> — the game itself, calling into the Odin simulation through generated bindings.</li>
<li><strong>Houdini and Blender</strong> for the assets.</li>
</ul>
<p>Four languages, a native interop boundary and a custom level format, put together under jam deadline. The Nexium tooling is the part that makes it more than a jam entry to me — it's a second production user of a language I wrote.</p>

<h2><span class="hash">##</span> Play it</h2>
<p>It runs in the browser or downloads from <a href="https://londopy.itch.io/point-of-origin">itch.io</a>. Takes about a minute to see the core idea.</p>
`,

  HideDesktopApps: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>HideDesktopApps</strong> is a small Windows tray utility that makes your desktop disappear — and come back — on a hotkey. Desktop icons, the taskbar, and every open window, each on its own shortcut. <code>Ctrl+Alt+H</code> clears the icons, <code>Ctrl+Alt+T</code> hides the taskbar, press again to restore.</p>

<h2><span class="hash">##</span> Why I built it</h2>
<p>Three situations kept producing the same annoyance: a Wallpaper Engine wallpaper buried under a grid of icons, a screen share about to expose a desktop full of files, and wanting a clean frame for a screenshot. Windows gives you a right-click toggle for icons buried in a context menu and nothing at all for a one-shot "clean slate." So this is the missing keyboard shortcut.</p>

<h2><span class="hash">##</span> How it works</h2>
<p>It's a native tray app in <strong>Rust</strong> — no Electron, no runtime, a few MB resident. It talks to the Win32 shell directly: toggling the visibility of the desktop's icon container, the taskbar's app bar, and the windows themselves, with global hotkeys registered at the OS level so it works no matter what has focus. Everything it hides is restored exactly as it was, because the windows are only hidden, never closed or moved.</p>

<h2><span class="hash">##</span> Getting it</h2>
<p>Builds are on the <a href="https://github.com/Londopy/HideDesktopApps/releases">releases page</a>, and the repo carries a <strong>Scoop</strong> manifest so it installs and updates as a managed package rather than a zip you have to remember to re-download:</p>
<pre><code>scoop install https://raw.githubusercontent.com/Londopy/HideDesktopApps/main/scoop/HideDesktopApps.json</code></pre>
`,

  nxtls: `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>nxtls</strong> is cryptography and a TLS 1.3 client written entirely in <a href="/projects/nexium/">Nexium</a>, my own language — no C libraries, no <code>@cImport</code>, and not one <code>unsafe</code> block, so a reviewer can read it end to end. It exists so Nexium programs can verify signatures and speak HTTPS without handing their security to a C library. Its first real user is a Discord helper I wrote for an amateur-radio club, which checks the Ed25519 signature on every request with it and talks to Discord through its TLS client.</p>

<h2><span class="hash">##</span> What's in it</h2>
<ul>
<li><strong>Primitives</strong> — SHA-256, SHA-384 and SHA-512, HMAC with a constant-time <code>verify</code>, HKDF with TLS 1.3's <code>expand_label</code>, and X25519 and ChaCha20-Poly1305 in constant time.</li>
<li><strong>Signature verification</strong> — Ed25519 (strict in the ways libsodium is), ECDSA on P-256 and P-384, and RSA PKCS #1 v1.5 and PSS, on top of a strict DER reader and a small Montgomery bignum.</li>
<li><strong>X.509</strong> — path building across cross-signed CAs, validity periods, CA constraints and path lengths, key usage, and host names with wildcards.</li>
<li><strong>TLS 1.3</strong> — a client with ChaCha20-Poly1305 and X25519 that handles HelloRetryRequest, KeyUpdate, and servers that ask for a client certificate. The protocol core is bytes in, bytes out; a separate type runs it over TCP.</li>
</ul>

<h2><span class="hash">##</span> How it's tested</h2>
<p>Every module is checked against its published vectors — FIPS 180-4 and RFCs 4231, 5869, 7748, 8032, 8439 and 8448 — and against Python's <code>cryptography</code> package, which a generator script uses as an oracle while it re-derives every constant table from its definition. The X.509 code is judged on 68 chains and 13 malformed certificates by <code>cryptography</code>'s own path validation. The TLS client replays 35 recorded exchanges byte for byte, runs against OpenSSL 3's <code>s_server</code> in twelve configurations — including the ones it must refuse: the wrong host, an expired certificate, TLS 1.2 — and connects live to Discord, GitHub, Google and Cloudflare. CI runs all of it on Linux, Windows and macOS, and fails any module that grows an <code>unsafe</code> block, a mutable global, or a foreign call.</p>

<h2><span class="hash">##</span> The honest part</h2>
<p>It's new, and nobody who knows TLS has reviewed it yet — the README says so up front, and that review is the next item on the plan. It also won't fall back to a weaker source of randomness: on Windows, where it has no <code>/dev/urandom</code>, <code>tls.connect</code> says so and stops. Until that review happens, treat it as a careful reading of the RFCs, not something to trust with anything that matters.</p>
`,

  "the-long-fork": `
<h2><span class="hash">##</span> What it is</h2>
<p><strong>the-long-fork</strong> is a repo whose only purpose is to be forked — one link at a time, as deep as it'll go. You fork the <em>current tip</em> (never the root), append one line to <code>CHAIN.txt</code>, and pass it on. The goal is the deepest fork-of-a-fork chain on GitHub. The code does nothing; the chain is the project.</p>

<h2><span class="hash">##</span> How a link works</h2>
<p>Each line reads <code>depth | username | date | prev-hash | cell | note</code>. The hash is the first 12 hex characters of the SHA-256 of the line above, so every link is pinned to the one before it, and the cell lets each link set one character of a shared 64×32 ASCII canvas that fills in as the chain grows. A <a href="https://londopy.github.io/the-long-fork/link/">link helper</a> reads your parent's chain and writes the exact line for you, and a self-check workflow in your fork says whether the link is right before anyone else looks at it.</p>

<h2><span class="hash">##</span> The tracker</h2>
<p>Twice a day a GitHub Action walks the whole fork network and rebuilds the picture. Two people forking the same tip is allowed — the chain becomes a tree. The <strong>main chain</strong> is the longest path from the root (on a tie, the earlier fork wins), and a side branch that grows longer takes over. If nothing lands for seven days the page says <strong>CHAIN STALLED</strong>, which is the cue to jump in. The tracker publishes <code>STATUS.txt</code>, a live depth badge, and the <a href="https://londopy.github.io/the-long-fork/">site</a>, which always knows where the tip is.</p>

<h2><span class="hash">##</span> Join it</h2>
<p><a href="https://londopy.github.io/the-long-fork/tip/">Fork the tip</a>, add your line, and commit it as <code>link &lt;depth&gt;: &lt;your-username&gt;</code>. There's no pull request — your fork <em>is</em> your link. One link per human, and don't delete your fork afterwards.</p>
`,
};
