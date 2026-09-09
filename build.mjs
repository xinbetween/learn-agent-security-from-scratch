#!/usr/bin/env node
/* Static site builder. No dependencies — Node 18+ only.
   node build.mjs            → build into dist/
   node build.mjs --serve    → build, then serve dist/ on :8080 */

import { readFile, writeFile, mkdir, readdir, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');

const { page, SITE } = await import('./site/lib/layout.mjs');
const C = await import('./site/lib/components.mjs');
const cur = await import('./site/content/curriculum.mjs');

/* ------------------------------------------------------------------ utils */
async function emit(path, html) {
  const file = join(OUT, path.replace(/^\//, ''), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  return file;
}
const lineCount = async (p) => {
  try { return (await readFile(p, 'utf8')).split('\n').filter(l => l.trim()).length; }
  catch { return 0; }
};

/* -------------------------------------------------------- load chapters */
const loaded = new Map();
for (const ch of cur.CHAPTERS) {
  const f = join(ROOT, 'site/content/chapters', ch.id + '.mjs');
  if (!existsSync(f)) { console.warn(`  ! missing chapter module ${ch.id}`); continue; }
  loaded.set(ch.id, await import(pathToFileURL(f).href));
}
for (const ch of cur.CHAPTERS) {
  ch.lines = await lineCount(join(ROOT, 'code', ch.code || ''));
}
const TOTAL_LINES = cur.CHAPTERS.reduce((a, c) => a + (c.lines || 0), 0);
const TOTAL_REFS = new Set();
for (const [, m] of loaded) (m.refs || []).forEach(r => TOTAL_REFS.add(r.title));

/* ---------------------------------------------------------- ref rendering */
export function renderRefs(refs, note) {
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
<h2 id="references">References and credits</h2>
<p class="credit">${note || `Every source below is the work of the researchers named. This chapter is a
teaching summary of their findings; read the originals for the detail, the caveats and the
numbers. Links go to the authors' own pages wherever one exists.`}</p>
<ol class="reflist">${items}</ol></section>`;
}

/* ------------------------------------------------------------ chapter page */
function chapterPage(ch, mod) {
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
${C.h2('Check yourself', 'check-yourself')}
<p>Six questions. Answers explain the reasoning, not just the letter.</p>
<div class="quiz">
${mod.quiz.map((q, i) => `<div class="q"><div class="qn">Q${i + 1}</div><div class="qt">${q.q}</div>
${q.options.map((o, j) => `<button class="opt" data-correct="${j === q.answer ? 1 : 0}">${o}</button>`).join('')}
<div class="exp">${q.explain}</div></div>`).join('')}
<div class="quiz-score">0 of ${mod.quiz.length} answered</div>
</div></section>` : '';

  const body = `
<div class="wrap">
<header class="chap-head">
  <div class="chap-kicker">
    <span class="chap-id">${ch.id.toUpperCase()}</span>
    <span class="chap-part">Part ${part.id} · ${part.title}</span>
  </div>
  <h1>${ch.title}</h1>
  <p class="sub">${ch.sub}</p>
  <div class="chap-meta">
    <span><b>${meta.time || '15'} min</b> read</span>
    ${ch.lines ? `<span><b>code/${ch.code}</b> · ${ch.lines} lines</span>` : ''}
    <span><b>${(mod.refs || []).length}</b> references</span>
    ${meta.attacks ? `<span><b>${meta.attacks}</b></span>` : ''}
  </div>
</header>

<article class="prose">
${heads.length > 2 ? `<nav class="toc-inline"><h5>In this chapter</h5><ol>${
  heads.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol></nav>` : ''}
${mod.body}
</article>

${quizHtml}

<div class="prose-wide">
${renderRefs(mod.refs, mod.refsNote)}

<nav class="pager">
${prev ? `<a href="/chapters/${prev.id}/" class="prev"><span class="dir">← Previous</span><span class="nm">${prev.id.toUpperCase()} · ${prev.title}</span></a>`
       : `<a href="/curriculum/" class="prev"><span class="dir">←</span><span class="nm">The curriculum</span></a>`}
${next ? `<a href="/chapters/${next.id}/" class="next"><span class="dir">Next →</span><span class="nm">${next.id.toUpperCase()} · ${next.title}</span></a>`
       : `<a href="/capstone/" class="next"><span class="dir">Next →</span><span class="nm">The capstone</span></a>`}
</nav>
</div>
</div>`;

  return page({
    title: `${ch.id.toUpperCase()} · ${ch.title}`,
    description: ch.desc.replace(/\s+/g, ' ').trim(),
    path: `/chapters/${ch.id}/`,
    body,
    scripts: mod.scripts || [],
  });
}

/* ------------------------------------------------------------------ build */
async function build() {
  await mkdir(OUT, { recursive: true });

  // static assets
  await cp(join(ROOT, 'site/assets'), join(OUT, 'assets'), { recursive: true });
  if (existsSync(join(ROOT, 'site/public'))) {
    for (const f of await readdir(join(ROOT, 'site/public'))) {
      await cp(join(ROOT, 'site/public', f), join(OUT, f), { recursive: true });
    }
  }
  if (existsSync(join(ROOT, 'code'))) {
    await cp(join(ROOT, 'code'), join(OUT, 'code'), { recursive: true });
  }

  let n = 0;
  for (const ch of cur.CHAPTERS) {
    const mod = loaded.get(ch.id);
    if (!mod) continue;
    await emit(`/chapters/${ch.id}/`, chapterPage(ch, mod));
    n++;
  }

  // derived pages
  const pages = await import(pathToFileURL(join(ROOT, 'site/lib/pages.mjs')).href);
  const ctx = { cur, C, page, SITE, loaded, TOTAL_LINES, renderRefs };
  for (const [path, html] of Object.entries(await pages.buildAll(ctx))) {
    await emit(path, html);
  }

  await writeFile(join(OUT, 'CNAME'), 'agent-security.xinbetween.com\n');
  await writeFile(join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
  await writeFile(join(OUT, '.nojekyll'), '');

  // sitemap
  const urls = [
    '/', '/curriculum/', '/projects/', '/capstone/', '/threats/', '/defenses/',
    '/glossary/', '/timeline/', '/references/', '/sources/', '/setup/',
    ...cur.CHAPTERS.map(c => `/chapters/${c.id}/`),
    ...cur.PROJECTS.map(p => `/projects/${p.id}/`),
  ];
  await writeFile(join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${SITE.url}${u}</loc></url>`).join('\n') + `\n</urlset>\n`);

  console.log(`✓ ${n}/${cur.CHAPTERS.length} chapters · ${TOTAL_LINES} lines of course code · ${TOTAL_REFS.size} distinct references`);
}

await build();

if (process.argv.includes('--serve')) {
  const { createServer } = await import('node:http');
  const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.py': 'text/plain', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
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
