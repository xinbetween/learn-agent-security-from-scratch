#!/usr/bin/env node
/* Static site builder. No dependencies — Node 18+ only.
   node build.mjs            → build into dist/
   node build.mjs --serve    → build, then serve dist/ on :8080

   Two locales. English is emitted at the origin root so that every URL the
   site published before it had a second language still resolves; Chinese is
   emitted under /zh/. A locale whose content tree is missing is skipped with a
   warning rather than failing the build, which keeps the site buildable while
   a translation is still in progress. */

import { readFile, writeFile, mkdir, readdir, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');

const { page, SITE } = await import('./site/lib/layout.mjs');
const { LOCALES, href, t, tightenCJK } = await import('./site/lib/i18n.mjs');
const C = await import('./site/lib/components.mjs');

/* ------------------------------------------------------------------ utils */
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

async function emit(path, html, locale) {
  const file = join(OUT, href(path, locale).replace(/^\//, ''), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, tightenCJK(html));
  return file;
}
const lineCount = async (p) => {
  try { return (await readFile(p, 'utf8')).split('\n').filter(l => l.trim()).length; }
  catch { return 0; }
};

/* Where each locale keeps its content. English is the original tree; every
   other locale mirrors it under site/content/<code>/. */
const contentDir = (code) => code === 'en' ? 'site/content' : `site/content/${code}`;

const REQUIRED = ['curriculum.mjs', 'glossary.mjs', 'threatmap.mjs', 'defensemap.mjs',
                 'timeline.mjs', 'projects/index.mjs', 'projects/capstone.mjs'];

async function loadLocale(code) {
  const d = contentDir(code);
  // A locale is either complete or absent. Half a translation would publish
  // pages that silently fall back to another language, so skip it instead.
  const missing = REQUIRED.filter(f => !existsSync(join(ROOT, d, f)));
  if (missing.length === REQUIRED.length) { console.warn(`  ! ${code}: no content tree, skipped`); return null; }
  if (missing.length) { console.warn(`  ! ${code}: incomplete content tree (no ${missing.join(', ')}), skipped`); return null; }
  const cur = await imp(`${d}/curriculum.mjs`);
  const loaded = new Map();
  const absent = [];
  for (const ch of cur.CHAPTERS) {
    const f = join(ROOT, d, 'chapters', ch.id + '.mjs');
    if (!existsSync(f)) { absent.push(ch.id); continue; }
    loaded.set(ch.id, await import(pathToFileURL(f).href));
  }
  if (absent.length) { console.warn(`  ! ${code}: missing ${absent.length} chapter module(s): ${absent.join(' ')}, skipped`); return null; }
  // Page prose lives in a per-locale copy bundle so that pages.mjs stays one
  // shared template rather than one file per language.
  const copyFile = join(ROOT, d, 'pagecopy.mjs');
  const COPY = existsSync(copyFile) ? (await import(pathToFileURL(copyFile).href)).COPY : null;
  return {
    code, L: t(code), cur, loaded, COPY,
    TERMS: (await imp(`${d}/glossary.mjs`)).TERMS,
    SURFACES: (await imp(`${d}/threatmap.mjs`)).SURFACES,
    CONTROLS: (await imp(`${d}/defensemap.mjs`)).CONTROLS,
    EVENTS: (await imp(`${d}/timeline.mjs`)).EVENTS,
    PROJECT_BODIES: (await imp(`${d}/projects/index.mjs`)).PROJECT_BODIES,
    CAPSTONE_BODY: (await imp(`${d}/projects/capstone.mjs`)).CAPSTONE_BODY,
  };
}

/* ---------------------------------------------------------- ref rendering */
export function renderRefs(refs, note, L = t('en')) {
  if (!refs || !refs.length) return '';
  const items = refs.map(r => {
    const authors = r.authors ? `<span class="authors">${C.esc(r.authors)}</span>. ` : '';
    const title = r.url
      ? `<a href="${r.url}"><span class="ttl">${C.esc(r.title)}</span></a>`
      : `<span class="ttl">${C.esc(r.title)}</span>`;
    const venue = r.venue ? ` <span class="venue">${C.esc(r.venue)}</span>` : '';
    const note2 = r.note ? ` — ${r.note}` : '';
    return `<li>${authors}${title}.${venue}${note2}</li>`;
  }).join('');
  return `<section class="refs prose-wide">
<h2 id="references">${L.refs.heading}</h2>
<p class="credit">${note || L.refs.note}</p>
<ol class="reflist">${items}</ol></section>`;
}

/* ------------------------------------------------------------ chapter page */
function chapterPage(ch, mod, ctx) {
  const { cur, L, code } = ctx;
  const idx = cur.chapterIndex(ch.id);
  const prev = cur.CHAPTERS[idx - 1], next = cur.CHAPTERS[idx + 1];
  const part = cur.partOf(ch);
  const meta = mod.meta || {};

  // build an inline table of contents from the h2s in the body
  const heads = [...(mod.body.matchAll(/<h2 id="([^"]+)">(.*?)(?:<\/h2>)/gs))]
    .map(m => [m[1], m[2].replace(/<[^>]+>/g, '')])
    .filter(([id]) => id !== 'references');

  const quizHtml = (mod.quiz && mod.quiz.length) ? `
<section class="prose">
${C.h2(L.chapter.quizTitle, 'check-yourself')}
<p>${L.chapter.quizIntro}</p>
<div class="quiz" data-quiz-answered="${C.esc(L.chapter.quizAnswered('{d}', '{t}'))}"
     data-quiz-score="${C.esc(L.chapter.quizScore('{d}', '{t}', '{r}'))}">
${mod.quiz.map((q, i) => `<div class="q"><div class="qn">Q${i + 1}</div><div class="qt">${q.q}</div>
${q.options.map((o, j) => `<button class="opt" data-correct="${j === q.answer ? 1 : 0}">${o}</button>`).join('')}
<div class="exp">${q.explain}</div></div>`).join('')}
<div class="quiz-score">${L.chapter.quizAnswered(0, mod.quiz.length)}</div>
</div></section>` : '';

  const body = `
<div class="wrap">
<header class="chap-head">
  <div class="chap-kicker">
    <span class="chap-id">${ch.id.toUpperCase()}</span>
    <span class="chap-part">${L.chapter.part(part.id, part.title)}</span>
  </div>
  <h1>${ch.title}</h1>
  <p class="sub">${ch.sub}</p>
  <div class="chap-meta">
    <span><b>${meta.time || '15'} ${L.chapter.minutes}</b> ${L.chapter.minRead}</span>
    ${ch.lines ? `<span><b>code/${ch.code}</b> · ${ch.lines} ${L.chapter.lines}</span>` : ''}
    <span><b>${(mod.refs || []).length}</b> ${L.chapter.references}</span>
    ${meta.attacks ? `<span><b>${meta.attacks}</b></span>` : ''}
  </div>
</header>

<article class="prose">
${heads.length > 2 ? `<nav class="toc-inline"><h5>${L.chapter.inThisChapter}</h5><ol>${
  heads.map(([id, t2]) => `<li><a href="#${id}">${t2}</a></li>`).join('')}</ol></nav>` : ''}
${mod.body}
</article>

${quizHtml}

<div class="prose-wide">
${renderRefs(mod.refs, mod.refsNote, L)}

<nav class="pager">
${prev ? `<a href="${href(`/chapters/${prev.id}/`, code)}" class="prev"><span class="dir">${L.chapter.prev}</span><span class="nm">${prev.id.toUpperCase()} · ${prev.title}</span></a>`
       : `<a href="${href('/curriculum/', code)}" class="prev"><span class="dir">←</span><span class="nm">${L.chapter.toCurriculum}</span></a>`}
${next ? `<a href="${href(`/chapters/${next.id}/`, code)}" class="next"><span class="dir">${L.chapter.next}</span><span class="nm">${next.id.toUpperCase()} · ${next.title}</span></a>`
       : `<a href="${href('/capstone/', code)}" class="next"><span class="dir">${L.chapter.next}</span><span class="nm">${L.chapter.toCapstone}</span></a>`}
</nav>
</div>
</div>`;

  return page({
    title: `${ch.id.toUpperCase()} · ${ch.title}`,
    description: ch.desc.replace(/\s+/g, ' ').trim(),
    path: `/chapters/${ch.id}/`,
    locale: code,
    body,
    scripts: mod.scripts || [],
  });
}

/* ------------------------------------------------------------------ build */
async function build() {
  await mkdir(OUT, { recursive: true });

  // static assets, shared by every locale
  await cp(join(ROOT, 'site/assets'), join(OUT, 'assets'), { recursive: true });
  if (existsSync(join(ROOT, 'site/public'))) {
    for (const f of await readdir(join(ROOT, 'site/public'))) {
      await cp(join(ROOT, 'site/public', f), join(OUT, f), { recursive: true });
    }
  }
  if (existsSync(join(ROOT, 'code'))) {
    await cp(join(ROOT, 'code'), join(OUT, 'code'), { recursive: true });
  }

  const pages = await imp('site/lib/pages.mjs');
  const { buildSearchIndex } = await imp('site/lib/search.mjs');
  const built = [];
  const allPaths = [];

  for (const loc of LOCALES) {
    const ctx0 = await loadLocale(loc.code);
    if (!ctx0) continue;   // loadLocale has already said why
    const { cur, loaded, L } = ctx0;

    for (const ch of cur.CHAPTERS) ch.lines = await lineCount(join(ROOT, 'code', ch.code || ''));
    const TOTAL_LINES = cur.CHAPTERS.reduce((a, c) => a + (c.lines || 0), 0);
    const TOTAL_REFS = new Set();
    for (const [, m] of loaded) (m.refs || []).forEach(r => TOTAL_REFS.add(r.title));

    let n = 0;
    for (const ch of cur.CHAPTERS) {
      const mod = loaded.get(ch.id);
      if (!mod) continue;
      await emit(`/chapters/${ch.id}/`, chapterPage(ch, mod, { ...ctx0, code: loc.code }), loc.code);
      n++;
    }

    const ctx = {
      ...ctx0, C, page, SITE, TOTAL_LINES,
      locale: loc.code, href: (p) => href(p, loc.code),
      renderRefs: (refs, note) => renderRefs(refs, note, L),
    };
    for (const [path, html] of Object.entries(await pages.buildAll(ctx))) {
      await emit(path, html, loc.code);
    }

    // one search index per locale, so a reader never lands in the other language
    const idx = buildSearchIndex({ ...ctx0, L, base: loc.base });
    const idxFile = join(OUT, href('/search-index.json', loc.code).replace(/^\//, ''));
    await mkdir(dirname(idxFile), { recursive: true });
    await writeFile(idxFile, JSON.stringify(idx));

    const paths = [
      '/', '/curriculum/', '/projects/', '/capstone/', '/threats/', '/defenses/',
      '/glossary/', '/timeline/', '/references/', '/sources/', '/setup/',
      ...cur.CHAPTERS.map(c => `/chapters/${c.id}/`),
      ...cur.PROJECTS.map(p => `/projects/${p.id}/`),
    ];
    allPaths.push(...paths.map(p => href(p, loc.code)));
    built.push({ code: loc.code, n, total: cur.CHAPTERS.length, TOTAL_LINES, refs: TOTAL_REFS.size, idx: idx.length });
  }

  await writeFile(join(OUT, 'CNAME'), 'agentsecurity.xinbetween.com\n');
  await writeFile(join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
  await writeFile(join(OUT, '.nojekyll'), '');

  // sitemap, with every locale of a page cross-linked as an alternate
  const known = new Set(built.map(b => b.code));
  const body = allPaths.map(u => {
    const bare = u.replace(/^\/(zh)(?=\/)/, '') || '/';
    const alts = LOCALES.filter(l => known.has(l.code)).map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${SITE.url}${href(bare, l.code)}"/>`).join('\n');
    return `  <url><loc>${SITE.url}${u}</loc>\n${alts}\n  </url>`;
  }).join('\n');
  await writeFile(join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`);

  for (const b of built) {
    console.log(`✓ ${b.code}: ${b.n}/${b.total} chapters · ${b.TOTAL_LINES} lines of course code · ${b.refs} distinct references · ${b.idx} search entries`);
  }
}

await build();

if (process.argv.includes('--serve')) {
  const { createServer } = await import('node:http');
  const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.py': 'text/plain; charset=utf-8', '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8' };
  createServer(async (req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let f = join(OUT, p);
    try {
      if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    } catch { f = join(OUT, p, 'index.html'); }
    try {
      const buf = await readFile(f);
      const ext = f.slice(f.lastIndexOf('.'));
      res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream' });
      res.end(buf);
    } catch { res.writeHead(404); res.end('not found'); }
  }).listen(8080, () => console.log('→ http://localhost:8080'));
}
