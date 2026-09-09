#!/usr/bin/env node
/* Post-build verification. Balanced tags, no template leakage, no dead
   internal links, a resolvable search index per locale, and parity between
   the locales. Runs in CI; exits non-zero on any finding. */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES, href } from '../site/lib/i18n.mjs';

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

/* Which locales actually made it into the build. A locale with no content
   tree is skipped by build.mjs, and skipping it here too keeps the check
   usable while a translation is still in progress. */
const built = LOCALES.filter(l => existsSync(join(OUT, l.base.replace(/^\//, ''), 'index.html')));
const localeOfPath = (p) =>
  LOCALES.filter(l => l.base && p.startsWith(l.base + '/'))[0] || LOCALES.find(l => !l.base);

for (const f of pages) {
  const rel = f.slice(OUT.length);
  const h = readFileSync(f, 'utf8');
  const loc = localeOfPath(rel);

  for (const [name, open, close] of PAIRS) {
    const a = (h.match(open) || []).length, b = (h.match(close) || []).length;
    if (a !== b) problems.push(`${rel}: unbalanced <${name}> ${a} open / ${b} close`);
  }
  if (!/<title>[^<]{5,}<\/title>/.test(h)) problems.push(`${rel}: missing or empty <title>`);
  if (h.includes('[object Object]')) problems.push(`${rel}: unrendered object in output`);
  if (/\$\{/.test(h)) problems.push(`${rel}: unevaluated template literal`);

  // the page must declare the language it is actually written in
  if (!new RegExp(`<html lang="${loc.lang}"`).test(h)) {
    problems.push(`${rel}: expected <html lang="${loc.lang}">`);
  }
  // and offer every built locale as an alternate
  for (const l of built) {
    if (!h.includes(`hreflang="${l.lang}"`)) problems.push(`${rel}: missing hreflang alternate for ${l.code}`);
  }

  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
    const t = m[1];
    if (t.startsWith('/assets') || t.startsWith('/code') || /\.[a-z0-9]{2,4}$/i.test(t)) continue;
    if (!targets.has(t)) problems.push(`${rel}: dead internal link → ${t}`);
  }
}

/* ---- locale parity: every page exists in every built locale ------------- */
const bare = (p) => {
  const l = localeOfPath(p);
  return l.base ? p.slice(l.base.length) || '/' : p;
};
if (built.length > 1) {
  const byLocale = new Map(built.map(l => [l.code, new Set()]));
  for (const t of targets) byLocale.get(localeOfPath(t).code)?.add(bare(t));
  const [first, ...rest] = built;
  for (const l of rest) {
    for (const p of byLocale.get(first.code)) {
      if (!byLocale.get(l.code).has(p)) problems.push(`locale ${l.code}: missing page ${p}`);
    }
    for (const p of byLocale.get(l.code)) {
      if (!byLocale.get(first.code).has(p)) problems.push(`locale ${first.code}: missing page ${p}`);
    }
  }
}

/* ---- search index, one per locale -------------------------------------- */
const anchors = new Map();
for (const l of built) {
  const idxPath = join(OUT, href('/search-index.json', l.code).replace(/^\//, ''));
  if (!existsSync(idxPath)) { problems.push(`${l.code}: search-index.json missing`); continue; }
  let idx = [];
  try { idx = JSON.parse(readFileSync(idxPath, 'utf8')); }
  catch (e) { problems.push(`${l.code}: search-index.json: ${e.message}`); continue; }
  if (idx.length < 100) problems.push(`${l.code}: search-index.json has only ${idx.length} entries`);

  for (const e of idx) {
    if (!e.u || !e.h || !e.t) { problems.push(`${l.code}: malformed entry ${JSON.stringify(e).slice(0, 80)}`); continue; }
    if (l.base && !e.u.startsWith(l.base + '/')) { problems.push(`${l.code}: entry escapes its locale → ${e.u}`); continue; }
    const [path, hash] = e.u.split('#');
    if (!targets.has(path)) { problems.push(`${l.code}: dead target → ${e.u}`); continue; }
    if (hash) {
      if (!anchors.has(path)) {
        const h = readFileSync(join(OUT, path.slice(1), 'index.html'), 'utf8');
        anchors.set(path, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
      }
      if (!anchors.get(path).has(hash)) problems.push(`${l.code}: dead anchor → ${e.u}`);
    }
  }
}

/* ---- a translated page should actually be translated -------------------- */
const zh = built.find(l => l.code === 'zh');
if (zh) {
  for (const f of pages.filter(p => p.slice(OUT.length).startsWith('/zh/chapters/'))) {
    const text = readFileSync(f, 'utf8')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')          // code samples stay English by design
      .replace(/<ol class="reflist">[\s\S]*?<\/ol>/gi, ' ')  // so do citations
      .replace(/<[^>]+>/g, ' ');
    const cjk = (text.match(/[㐀-鿿]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    const share = cjk / (cjk + latin || 1);
    if (share < 0.25) {
      problems.push(`${f.slice(OUT.length)}: looks untranslated (${(share * 100).toFixed(0)}% CJK)`);
    }
  }
}

if (problems.length) {
  console.error(problems.slice(0, 60).join('\n'));
  if (problems.length > 60) console.error(`… and ${problems.length - 60} more`);
  console.error(`\n${problems.length} problem(s) across ${pages.length} pages`);
  process.exit(1);
}
console.log(`✓ ${pages.length} pages in ${built.length} locale(s): tags balanced, no dead internal links, ` +
            `no template leakage, locales at parity, search indexes resolve`);
