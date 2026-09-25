// /api/openapi.json — the API described in OpenAPI 3.1, generated from the
// same route table and schemas that write the files (src/lib/api.js).

import { getSnapshot, openapi } from "../../lib/api.js";

export async function GET() {
  const s = await getSnapshot();
  return new Response(JSON.stringify(openapi(s), null, 2) + "\n", {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
