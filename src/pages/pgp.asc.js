// /pgp.asc — my PGP public key, the same one the contact page encrypts to.

import { PGP_PUBLIC_KEY } from "../data/profile.js";

export function GET() {
  return new Response(PGP_PUBLIC_KEY.trim() + "\n", {
    headers: { "Content-Type": "application/pgp-keys" },
  });
}
