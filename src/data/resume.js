// The /resume page: the parts only I can write. Everything else on it (live
// star counts, the open-source numbers, the award, the certifications) comes
// from the same data as the rest of the site, so it stays current on its own.
// Keep it to one printed page: after an edit, check with "print / save as PDF".

export const resume = {
  headline: "Engineering student · security & systems",
  summary:
    "First-year engineering student at Cal Poly, heading into OT / XIoT security. I build low-level Windows tools, ship libraries on PyPI, and wrote my own programming language, then a TLS 1.3 client in it.",

  education: [
    {
      school: "Cal Poly, San Luis Obispo",
      degree: "B.S. General Engineering",
      details: [
        "Field Engineering focus, specializing in XIoT / OT security",
        "Intended minor in Asian Studies",
        "Planned side focus: marine engineering work and research at the Cal Poly Pier",
      ],
      when: "2026 – present",
    },
  ],

  // `when` is optional; leave it empty to show no dates
  experience: [
    {
      role: "Tech support",
      org: "Real-estate agency",
      when: "",
      points: ["Handled the agency's website server, email and tech setup."],
    },
    {
      role: "Web development & security",
      org: "Tutoring center",
      when: "",
      points: ["Developed and secured the center's website and handled its setup."],
    },
  ],

  // names must match projects.json (the build fails on a typo)
  projects: [
    {
      name: "nexium",
      what: "Programming language",
      stack: "Nexium, C",
      points: [
        "Compiles to native code through C, with automatic reference counting and a machine-checked effect system that tracks whether a function allocates, blocks or can panic.",
        "Self-hosting compiler; every example, spec case and tutorial runs in CI on three platforms under sanitizers and a fuzzer. One source tree ships as a C library, Python wheel, Rust crate or CLI.",
      ],
    },
    {
      name: "nxtls",
      what: "Cryptography and a TLS 1.3 client",
      stack: "Nexium",
      points: [
        "SHA-2 through X.509 path validation and a TLS 1.3 client, with no C and no unsafe code.",
        "Checked against the RFC test vectors, Python's cryptography and OpenSSL 3 in twelve configurations; replays 35 recorded handshakes byte for byte.",
      ],
    },
    {
      name: "capture-bypass",
      what: "Windows capture-protection research",
      stack: "Rust",
      points: [
        "Clears WDA_EXCLUDEFROMCAPTURE by DLL injection so protected windows show up in screen captures again; multi-crate Cargo workspace, egui GUI, Inno Setup installer.",
      ],
    },
    {
      name: "DiresQ",
      what: "Disaster-response accountability app",
      stack: "Python, Flask",
      points: [
        "Wrote the Flask and SQLite backend (a teammate built the frontend): timed check-ins and an accountability board that flags any responder who goes dark. 600+ tests.",
      ],
    },
    {
      name: "deadpoint",
      what: "Purple-team PRNG analysis",
      stack: "Python, Rust, Z3",
      points: [
        "Finds predictable randomness, then proves it: recovers MT19937, LCG and xorshift state with a Z3 constraint solve, predicts past and future outputs, and recommends the CSPRNG fix.",
      ],
    },
    {
      name: "ropesim",
      what: "Climbing-rope physics engine",
      stack: "Rust, Python",
      points: [
        "UIAA / EN 892 impact-force modeling: a damped-spring RK4 integrator in Rust, bound to Python through PyO3 and Maturin, with a CLI and a PySide6 3D GUI.",
      ],
    },
  ],

  skills: [
    ["Languages", "Rust, Python, C, TypeScript / JavaScript, Nexium, Zig, C++, Bash"],
    ["Security", "Win32 internals and DLL injection, TLS 1.3 and X.509, applied cryptography, PRNG state recovery with Z3, PGP"],
    ["Build & ship", "PyO3 / Maturin, Cargo workspaces, GitHub Actions, PyPI, Inno Setup, Scoop, Tauri, Flask, SQLite, Astro"],
    ["Also", "VFX and motion graphics: Houdini, Nuke, After Effects"],
  ],
};
