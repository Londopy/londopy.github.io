// /.well-known/security.txt (RFC 9116): how to report a security problem in
// anything of mine. Written at build time so `Expires` rolls forward with the
// nightly rebuild instead of lapsing; the RFC wants it under a year out.

import { PGP_PUBLIC_KEY } from "../../data/profile.js";

const SITE = "https://londopy.github.io";
const DAYS = 180;

export function GET() {
  const expires = new Date(Date.now() + DAYS * 864e5);
  expires.setUTCHours(0, 0, 0, 0);
  const lines = [
    "# Found a security problem in one of my projects or on this site?",
    "# Tell me through the contact form; tick \"encrypt my message\" and it's",
    "# PGP-encrypted in your browser before it leaves.",
    "",
    `Contact: ${SITE}/contact/`,
    `Expires: ${expires.toISOString()}`,
    ...(PGP_PUBLIC_KEY ? [`Encryption: ${SITE}/pgp.asc`] : []),
    "Preferred-Languages: en",
    `Canonical: ${SITE}/.well-known/security.txt`,
  ];
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
