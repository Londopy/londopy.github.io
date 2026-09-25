#!/usr/bin/env node
// Checks the built API in dist/ against its own OpenAPI spec:
//   - every path in the spec (templated ones expanded) was built and parses,
//   - every JSON response matches its schema, with no undocumented fields,
//   - every file under dist/api/v1/ is described by the spec,
//   - index.json lists exactly the spec's paths,
//   - project URLs point at pages and images that were actually built.
// Runs after `astro build` (see package.json). A failure fails the deploy,
// which leaves the previous version of the site live.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const SITE = "https://londopy.github.io";
const errors = [];
const fail = (msg) => errors.push(msg);

const read = (p) => readFileSync(join(DIST, p), "utf8");
const spec = JSON.parse(read("api/openapi.json"));
const resolveRef = (ref) => ref.replace(/^#\//, "").split("/").reduce((o, k) => o?.[k], spec);

function typeOk(t, v) {
  switch (t) {
    case "null": return v === null;
    case "array": return Array.isArray(v);
    case "object": return v !== null && typeof v === "object" && !Array.isArray(v);
    case "integer": return Number.isInteger(v);
    case "number": return typeof v === "number";
    case "string": return typeof v === "string";
    case "boolean": return typeof v === "boolean";
    default: return false;
  }
}

const kind = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

// the subset of JSON Schema the spec uses: $ref, anyOf, type, enum, minimum,
// format, required, properties, additionalProperties, items
function validate(schema, v, at, errs) {
  if (schema.$ref) return validate(resolveRef(schema.$ref), v, at, errs);
  if (schema.anyOf) {
    const tries = schema.anyOf.map((s) => {
      const e = [];
      validate(s, v, at, e);
      return e;
    });
    if (!tries.some((e) => e.length === 0)) errs.push(...tries.sort((a, b) => a.length - b.length)[0]);
    return;
  }
  const types = schema.type === undefined ? [] : [].concat(schema.type);
  if (types.length && !types.some((t) => typeOk(t, v))) {
    errs.push(`${at}: expected ${types.join("|")}, got ${kind(v)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(v)) errs.push(`${at}: ${JSON.stringify(v)} isn't one of ${JSON.stringify(schema.enum)}`);
  if (typeof v === "number" && schema.minimum !== undefined && v < schema.minimum) errs.push(`${at}: ${v} < ${schema.minimum}`);
  if (typeof v === "string") {
    if (schema.format === "date-time" && !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/.test(v)) errs.push(`${at}: not an ISO 8601 UTC date-time: ${v}`);
    if (schema.format === "date" && !/^\d{4}-\d\d-\d\d$/.test(v)) errs.push(`${at}: not a YYYY-MM-DD date: ${v}`);
    if (schema.format === "uri" && !/^https?:\/\/\S+$/.test(v)) errs.push(`${at}: not an http(s) URL: ${v}`);
  }
  if (typeOk("object", v)) {
    for (const k of schema.required ?? []) if (!(k in v)) errs.push(`${at}: missing "${k}"`);
    for (const [k, val] of Object.entries(v)) {
      if (schema.properties?.[k]) validate(schema.properties[k], val, `${at}.${k}`, errs);
      else if (typeof schema.additionalProperties === "object") validate(schema.additionalProperties, val, `${at}.${k}`, errs);
      else if (schema.properties) errs.push(`${at}: "${k}" isn't in the spec`);
    }
  }
  if (Array.isArray(v) && schema.items) v.forEach((x, i) => validate(schema.items, x, `${at}[${i}]`, errs));
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// 1. every documented file exists and matches its schema
const covered = new Set();
let files = 0;
for (const [path, item] of Object.entries(spec.paths)) {
  const op = item.get;
  const param = op.parameters?.[0];
  const concrete = param ? param.schema.enum.map((v) => path.replace(`{${param.name}}`, v)) : [path];
  const [type, media] = Object.entries(op.responses["200"].content)[0];
  for (const p of concrete) {
    const file = normalize(join(DIST, p));
    covered.add(file);
    if (!existsSync(file)) {
      fail(`${p}: in the spec but not built`);
      continue;
    }
    files++;
    const body = readFileSync(file, "utf8");
    if (!type.startsWith("application/json")) {
      if (!body.trim()) fail(`${p}: empty`);
      continue;
    }
    let json;
    try {
      json = JSON.parse(body);
    } catch (e) {
      fail(`${p}: invalid JSON (${e.message})`);
      continue;
    }
    const errs = [];
    validate(media.schema, json, p, errs);
    errs.slice(0, 5).forEach(fail);
    if (errs.length > 5) fail(`${p}: …and ${errs.length - 5} more`);
    if (json.meta?.self && json.meta.self !== SITE + p) fail(`${p}: meta.self says ${json.meta.self}`);
    if (Array.isArray(json.data) && json.meta?.count !== json.data.length) fail(`${p}: meta.count ${json.meta?.count} ≠ ${json.data.length} items`);
  }
}

// 2. nothing under /api/v1 is undocumented (redirect stubs from astro.config
//    `redirects` aren't API files — they only point people at the docs)
const isRedirectStub = (f) => f.endsWith(".html") && /http-equiv="refresh"/.test(readFileSync(f, "utf8"));
for (const f of walk(join(DIST, "api/v1"))) {
  if (!covered.has(normalize(f)) && !isRedirectStub(f)) fail(`${f.slice(DIST.length).replace(/\\/g, "/")}: built but not in the spec`);
}

// 3. the discovery document agrees with the spec
const listed = new Set(JSON.parse(read("api/v1/index.json")).data.endpoints.map((e) => e.path));
for (const p of Object.keys(spec.paths)) if (!listed.has(p)) fail(`index.json doesn't list ${p}`);
for (const p of listed) if (!spec.paths[p]) fail(`index.json lists ${p}, which isn't in the spec`);

// 4. project links resolve to things that were built
for (const p of JSON.parse(read("api/v1/projects.json")).data) {
  for (const key of ["page", "og_image", "api"]) {
    const local = p.urls[key].replace(SITE, "").replace(/\/$/, "/index.html");
    if (!existsSync(join(DIST, local))) fail(`${p.name}: urls.${key} (${p.urls[key]}) wasn't built`);
  }
}

// 5. the text endpoints
if (!read("pgp.asc").startsWith("-----BEGIN PGP PUBLIC KEY BLOCK-----")) fail("pgp.asc isn't an armored public key");
const widths = new Set(read("api/v1/card.txt").trimEnd().split("\n").map((l) => [...l].length));
if (widths.size !== 1) fail(`card.txt: the box is ragged (line widths ${[...widths].join(", ")})`);

if (errors.length) {
  console.error(`api check: ${errors.length} problem(s)\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`api check: ${files} files match openapi.json (${Object.keys(spec.paths).length} paths)`);
