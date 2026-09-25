// Every file under /api/v1/ comes from this one route: the table in
// src/lib/api.js lists the endpoints, getStaticPaths expands the templated
// ones (one file per project, domain and badge), and GET renders each.

import { getSnapshot, v1Files, render } from "../../../lib/api.js";

export async function getStaticPaths() {
  const s = await getSnapshot();
  return v1Files(s).map((f) => ({
    params: { route: f.file },
    props: { route: f.route, value: f.value },
  }));
}

export async function GET({ props }) {
  const s = await getSnapshot();
  const { type, body } = render(s, props.route, props.value);
  return new Response(body, { headers: { "Content-Type": type } });
}
