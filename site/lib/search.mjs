/* Build-time search index. One JSON file, fetched lazily by the palette in
   app.js the first time a reader opens it. Every entry is
     { t: type, u: url, h: heading, k: kicker, x: text }
   with type one of chapter | section | glossary | page. Text is stripped of
   markup and capped, so the whole course indexes to a few hundred kilobytes. */

import { slug } from './components.mjs';

const TEXT_CAP = 1600;

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export const strip = (html = '') => decode(String(html)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')          // code is on the chapter page; not worth indexing
  .replace(/<\/(?:td|th|li|dt|dd|summary)>/gi, ' · ')  // keep cells and items from running together
  .replace(/<\/(?:p|h[1-6]|div|blockquote)>/gi, ' ')
  .replace(/<[^>]+>/g, ' '))
  .replace(/(?:\s*·\s*)+(?=\s*(?:·|$))/g, '')          // collapse trailing / doubled separators
  .replace(/\s+/g, ' ').trim();

const cap = (s) => s.length > TEXT_CAP ? s.slice(0, TEXT_CAP).replace(/\s\S*$/, '') + '…' : s;

/** Split an HTML body on its <h2 id> headings → [{id, heading, text}] */
export function sections(html = '') {
  const parts = html.split(/(?=<h2 id="[^"]+">)/);
  const out = [];
  for (const part of parts) {
    const m = part.match(/^<h2 id="([^"]+)">([\s\S]*?)<\/h2>([\s\S]*)$/);
    if (!m) continue;                        // the intro before the first h2 is covered by the page entry
    const [, id, headHtml, rest] = m;
    const heading = strip(headHtml);
    const text = strip(rest);
    if (!heading || id === 'references' || id === 'check-yourself') continue;
    out.push({ id, heading, text });
  }
  return out;
}

export function buildSearchIndex({ cur, loaded, TERMS, SURFACES, CONTROLS, EVENTS, PROJECT_BODIES, CAPSTONE_BODY }) {
  const idx = [];
  const add = (t, u, h, k, x = '') => idx.push({ t, u, h, k, x: cap(strip(x)) });

  // chapters and their sections
  for (const ch of cur.CHAPTERS) {
    const mod = loaded.get(ch.id);
    const part = cur.partOf(ch);
    const kicker = `${ch.id.toUpperCase()} · Part ${part.id}`;
    add('chapter', `/chapters/${ch.id}/`, ch.title, kicker, `${ch.sub}. ${ch.desc}`);
    if (!mod) continue;
    for (const s of sections(mod.body)) {
      add('section', `/chapters/${ch.id}/#${s.id}`, s.heading, `${ch.id.toUpperCase()} · ${ch.title}`, s.text);
    }
  }

  // glossary
  for (const [term, , def, ch] of TERMS) {
    add('glossary', `/glossary/#term-${slug(term)}`, term, ch ? `Glossary · taught in ${ch.toUpperCase()}` : 'Glossary', def);
  }

  // projects and the capstone
  for (const p of cur.PROJECTS) {
    add('page', `/projects/${p.id}/`, p.title, `${p.tag} · ${p.hours}`, p.desc);
    const b = PROJECT_BODIES[p.id];
    if (b) for (const s of sections(b.body)) add('page', `/projects/${p.id}/#${s.id}`, s.heading, `${p.tag} · ${p.title}`, s.text);
  }
  add('page', '/capstone/', cur.CAPSTONE.title, `Capstone · ${cur.CAPSTONE.hours}`, `${cur.CAPSTONE.sub}. ${cur.CAPSTONE.desc}`);
  for (const s of sections(CAPSTONE_BODY.body)) add('page', `/capstone/#${s.id}`, s.heading, 'Capstone', s.text);

  // threat map, defence map, timeline
  for (const s of SURFACES) {
    add('page', `/threats/#${slug(s.n + ' ' + s.title)}`, s.title, `Threat map · ${s.n}`, s.blurb);
    for (const [name, what, ch] of s.classes) {
      add('page', `/threats/#${slug(name)}`, name, `Threat map · ${s.n} ${s.title}${ch ? ' · ' + ch.toUpperCase() : ''}`, what);
    }
  }
  for (const g of CONTROLS) {
    add('page', `/defenses/#${slug(g.stage + ' ' + g.title)}`, g.title, `Defence map · ${g.stage}`, g.blurb);
    for (const [name, what, strength, ch] of g.items) {
      add('page', `/defenses/#${slug(name)}`, name, `Defence map · ${g.stage} · ${strength}${ch ? ' · ' + ch.toUpperCase() : ''}`, what);
    }
  }
  for (const [date, kind, title, desc, ch] of EVENTS) {
    add('page', `/timeline/#${slug(date + ' ' + title)}`, title, `Timeline · ${date} · ${kind}${ch ? ' · ' + ch.toUpperCase() : ''}`, desc);
  }

  // the remaining reference pages
  add('page', '/curriculum/', 'Curriculum', 'All chapters, six parts, the projects and the capstone',
      cur.PARTS.map(p => `Part ${p.id} ${p.title}. ${p.blurb}`).join(' '));
  add('page', '/projects/', 'Projects', 'Five graded builds and a capstone', cur.PROJECTS.map(p => p.title).join(', '));
  add('page', '/threats/', 'Threat map', 'Six surfaces, twenty-five vulnerability classes', SURFACES.map(s => s.title).join(', '));
  add('page', '/defenses/', 'Defence map', 'Thirty-three controls across design, development and operations', CONTROLS.map(c => c.title).join(', '));
  add('page', '/glossary/', 'Glossary', `${TERMS.length} terms`, TERMS.map(t => t[0]).join(', '));
  add('page', '/timeline/', 'Timeline', `${EVENTS.length} landmarks, 2022 to 2026`, EVENTS.map(e => e[2]).join(', '));
  add('page', '/references/', 'References', 'Every paper and post the course was built from', 'bibliography credits sources authors papers');
  add('page', '/sources/', 'Source lists', 'The awesome-lists and surveys behind the reference pages', 'Awesome-Agent-Security, Awesome Agent Skills Security, Awesome AI Agent Papers, SoK');
  add('page', '/setup/', 'Local setup', 'Run the code and the site on your machine', 'python uv ruff node build install clone quickstart no dependencies no API key');

  return idx;
}
