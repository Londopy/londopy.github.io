// Who I am and how to reach me — the one place this lives. The contact page
// reads it, and so does the public API (/api/v1/profile.json, /pgp.asc and
// the curl card), so the two can never disagree.

// "Open to work" note on the contact page and in the API. Flip to false to hide it.
export const OPEN_TO_WORK = true;
export const OPEN_TO_WORK_TEXT = "open to internships — security & systems";

// End-to-end PGP encryption. The ASCII-armored *public* key offers senders an
// "encrypt" toggle on the contact page (the message is encrypted in their
// browser, so only my private key can read it), and is published at /pgp.asc.
// Empty = the encryption option is hidden and /pgp.asc is empty.
export const PGP_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEaq+KNhYJKwYBBAHaRw8BAQdAgecubJTOMQrZl8Jmq7NpA9oCDW3IL1TF71bU
X8vtic20H0xvbmRvIDxsb25kb24ud29ya0BweGRtYWlsLmNvbT6IlgQTFgoAPhYh
BPAQU7hv59YKCh+3kLEeAvES+vSXBQJqr4o2AhsDBQkDwmcABQsJCAcCBhUKCQgL
AgQWAgMBAh4BAheAAAoJELEeAvES+vSXaDoBAKM6kDhMUuqSp6QzmOVtmgFkhNsA
W8g943cziwmKIBNEAP9i0SAFkQ1G2nPjkyviBdgy6HmJ8LzaTglVI7UfXaWXBLg4
BGqvijYSCisGAQQBl1UBBQEBB0AWw9pWQHQWSUq2Tyui+nHvC81brHkKXiERnp9T
1BtiPwMBCAeIeAQYFgoAIBYhBPAQU7hv59YKCh+3kLEeAvES+vSXBQJqr4o2AhsM
AAoJELEeAvES+vSXLN0BANC7h72/FHLHzcKUJUxl5kuGADAJpuW5b31tF1PtMjq3
AP0XnX7kHqSy+00jF0Qu1FQPglyQaO8S8b98z1IsYxDwAg==
=gw7L
-----END PGP PUBLIC KEY BLOCK-----`;
export const PGP_FINGERPRINT = "F010 53B8 6FE7 D60A 0A1F B790 B11E 02F1 12FA F497";

export const profile = {
  name: "London C.",
  handle: "Londopy",
  headline: "I build tools for climbing, medicine, Windows internals, and myself.",
  summary:
    "Builder across pre-hospital medicine, Windows internals, climbing physics, and security. Rust and Python, mostly.",
  focus: "OT / XIoT security",
  certifications: [
    "SPRAT Level 1 rope access",
    "Wilderness First Responder (WFR)",
    "NCTSN Psychological First Aid",
  ],
  links: {
    github: "https://github.com/Londopy",
    itch: "https://londopy.itch.io",
  },
  contact: {
    discord: "_londo.",
    irc: {
      network: "irc.libera.chat",
      nick: "Londopy",
      how: "/msg Londopy",
      web_client: "https://web.libera.chat",
    },
  },
};
