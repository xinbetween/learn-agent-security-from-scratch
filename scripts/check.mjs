#!/usr/bin/env node
/* Post-build verification. Balanced tags, no template leakage, no dead
   internal links. Runs in CI; exits non-zero on any finding. */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist';
if (!existsSync(OUT)) { console.error('dist/ not found — run `node build.mjs` first'); process.exit(1); }

const walk = (d, out = []) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.html')) out.push(p);
  }
  return out;
};

const pages = walk(OUT);
const targets = new Set(pages.map(f => '/' + f.slice(OUT.length + 1).replace(/index\.html$/, '')));
const problems = [];

const PAIRS = [
  ['div', /<div[\s>]/g, /<\/div>/g], ['section', /<section[\s>]/g, /<\/section>/g],
  ['p', /<p[\s>]/g, /<\/p>/g], ['li', /<li[\s>]/g, /<\/li>/g],
  ['td', /<td[\s>]/g, /<\/td>/g], ['ul', /<ul[\s>]/g, /<\/ul>/g],
  ['ol', /<ol[\s>]/g, /<\/ol>/g], ['table', /<table[\s>]/g, /<\/table>/g],
];

for (const f of pages) {
  const rel = f.slice(OUT.length);
  const h = readFileSync(f, 'utf8');

  for (const [name, open, close] of PAIRS) {
    const a = (h.match(open) || []).length, b = (h.match(close) || []).length;
    if (a !== b) problems.push(`${rel}: unbalanced <${name}> ${a} open / ${b} close`);
  }
  if (!/<title>[^<]{5,}<\/title>/.test(h)) problems.push(`${rel}: missing or empty <title>`);
  if (h.includes('[object Object]')) problems.push(`${rel}: unrendered object in output`);
  if (/\$\{/.test(h)) problems.push(`${rel}: unevaluated template literal`);

  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
    const t = m[1];
    if (t.startsWith('/assets') || t.startsWith('/code') || /\.[a-z0-9]{2,4}$/i.test(t)) continue;
    if (!targets.has(t)) problems.push(`${rel}: dead internal link → ${t}`);
  }
}

// search index: present, parseable, and every entry points at a real page
const idxFile = join(OUT, 'search-index.json');
if (!existsSync(idxFile)) problems.push('search-index.json missing');
else {
  let idx = [];
  try { idx = JSON.parse(readFileSync(idxFile, 'utf8')); }
  catch (e) { problems.push(`search-index.json: ${e.message}`); }
  if (idx.length < 100) problems.push(`search-index.json: only ${idx.length} entries`);
  const anchors = new Map();
  for (const e of idx) {
    if (!e.u || !e.h || !e.t) { problems.push(`search-index.json: malformed entry ${JSON.stringify(e).slice(0, 80)}`); continue; }
    const [path, hash] = e.u.split('#');
    if (!targets.has(path)) { problems.push(`search-index.json: dead target → ${e.u}`); continue; }
    if (hash) {
      if (!anchors.has(path)) {
        const h = readFileSync(join(OUT, path.slice(1), 'index.html'), 'utf8');
        anchors.set(path, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
      }
      if (!anchors.get(path).has(hash)) problems.push(`search-index.json: dead anchor → ${e.u}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} problem(s) across ${pages.length} pages`);
  process.exit(1);
}
console.log(`✓ ${pages.length} pages: tags balanced, no dead internal links, no template leakage, search index resolves`);
