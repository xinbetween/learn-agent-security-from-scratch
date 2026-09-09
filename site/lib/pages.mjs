/* The non-chapter pages, as one template shared by every locale.

   Nothing here imports content: the collections (glossary, timeline, threat
   and defence maps, project bodies) and the prose bundle both arrive on ctx,
   because each locale has its own copy of them. Every internal link goes
   through ctx.href so it lands in the reader's language, and `path:` stays
   locale-independent — layout.mjs adds the prefix. */

export async function buildAll(ctx) {
  const { cur, C, page, SITE, loaded, TOTAL_LINES, renderRefs, locale, href, COPY,
          TERMS, SURFACES, CONTROLS, EVENTS, PROJECT_BODIES, CAPSTONE_BODY } = ctx;
  const out = {};
  const nCh = cur.CHAPTERS.length;

  /* ============================================================ home ==== */
  const heroDiagram = C.svg(760, 340, `
  <text x="14" y="18" class="d-ttl">${COPY.diagrams.hero.title}</text>
  ${C.box(14, 46, 120, 54, ...COPY.diagrams.hero.task, 'd-sunk')}
  ${C.box(174, 46, 120, 54, ...COPY.diagrams.hero.context)}
  ${C.box(334, 46, 120, 54, ...COPY.diagrams.hero.model)}
  ${C.box(494, 46, 120, 54, ...COPY.diagrams.hero.toolCall)}
  ${C.box(494, 176, 120, 54, ...COPY.diagrams.hero.world, 'd-sunk')}
  ${C.box(174, 176, 240, 54, ...COPY.diagrams.hero.result, 'd-attack')}
  ${C.arrow(134, 73, 172, 73)}
  ${C.arrow(294, 73, 332, 73)}
  ${C.arrow(454, 73, 492, 73)}
  ${C.arrow(554, 100, 554, 174)}
  ${C.arrow(494, 203, 416, 203, '', 'd-attack-l')}
  <path d="M174 203 L120 203 L120 100" class="d-arrow" marker-end="url(#ah)" fill="none"/>
  <text x="96" y="150" text-anchor="end" class="d-sub">${COPY.diagrams.hero.loop}</text>
  <rect x="160" y="30" width="470" height="220" rx="8" class="d-bnd"/>
  ${C.svgText(636, 26, COPY.diagrams.hero.boundary, 'd-bnd-t', 'end')}
  <line x1="14" y1="274" x2="746" y2="274" stroke="var(--border)" stroke-width="1"/>
  ${C.svgText(14, 298, COPY.diagrams.hero.n1[0], 'd-attack-t', 'start')}
  ${C.svgText(14, 316, COPY.diagrams.hero.n1[1], 'd-sub', 'start')}
  ${C.svgText(200, 298, COPY.diagrams.hero.n2[0], 'd-attack-t', 'start')}
  ${C.svgText(200, 316, COPY.diagrams.hero.n2[1], 'd-sub', 'start')}
  ${C.svgText(386, 298, COPY.diagrams.hero.n3[0], 'd-attack-t', 'start')}
  ${C.svgText(386, 316, COPY.diagrams.hero.n3[1], 'd-sub', 'start')}
  ${C.svgText(572, 298, COPY.diagrams.hero.n4[0], 'd-attack-t', 'start')}
  ${C.svgText(572, 316, COPY.diagrams.hero.n4[1], 'd-sub', 'start')}
  `, { label: COPY.diagrams.hero.aria });

  const partCards = cur.PARTS.map(p => {
    const chs = cur.chaptersOfPart(p.id);
    const proj = p.project ? cur.PROJECTS.find(x => x.id === p.project) : null;
    return `<section class="part">
  <div class="part-head"><span class="part-num">${COPY.home.part(p.id)}</span><h3>${p.title}</h3>
    <span class="chap-part">${chs[0].id.toUpperCase()}–${chs[chs.length - 1].id.toUpperCase()}</span></div>
  <p class="part-blurb">${p.blurb}</p>
  <div class="chaplist">${chs.map(c => `
    <a class="chapcard" href="${href(`/chapters/${c.id}/`)}">
      <span class="n">${c.id.toUpperCase()}${c.lines ? `<small>${COPY.home.chLines(c.lines)}</small>` : ''}</span>
      <span><span class="ct">${c.title}</span><span class="cs">${c.sub}</span>
      <span class="cd">${c.desc}</span></span></a>`).join('')}</div>
  ${proj ? `<a class="projcard" href="${href(`/projects/${proj.id}/`)}">
     <div class="pl">${proj.tag} · ${proj.hours}</div>
     <div class="pt">${proj.title}</div><div class="pd">${proj.desc}</div></a>` : ''}
  ${p.bridge ? `<p class="bridge">${p.bridge}</p>` : ''}
  </section>`;
  }).join('');

  out['/'] = page({
    title: SITE.title, path: '/', locale,
    body: `
<div class="wrap">
<section class="hero">
  <div class="eyebrow">${COPY.home.eyebrow(nCh, TOTAL_LINES.toLocaleString(), EVENTS.length)}</div>
  <h1>${COPY.home.h1}</h1>
  <p class="lede">${COPY.home.lede1}</p>
  <p class="lede">${COPY.home.lede2}</p>
  <div class="btnrow">
    <a class="btn" href="${href('/chapters/a01/')}">${COPY.home.btnStart}</a>
    <a class="btn ghost" href="${href('/curriculum/')}">${COPY.home.btnCurriculum}</a>
    <a class="btn ghost" href="${href('/capstone/')}">${COPY.home.btnCapstone}</a>
  </div>
  <div class="termline"><span class="p">$</span> git clone ${SITE.repo}.git &amp;&amp; python3 code/a01_agent_loop.py</div>
</section>

<section class="prose-wide">${C.figure(heroDiagram,
  `<b>${COPY.home.heroFigT}</b> ${COPY.home.heroFigB}`)}</section>

<section class="prose-wide">
${C.h2(COPY.home.claimsH2, 'claims')}
<div class="grid3">
  <div class="card"><div class="eyebrow">01</div><p><b>${COPY.home.claim1t}</b>
  ${COPY.home.claim1b}</p></div>
  <div class="card"><div class="eyebrow">02</div><p><b>${COPY.home.claim2t}</b>
  ${COPY.home.claim2b}</p></div>
  <div class="card"><div class="eyebrow">03</div><p><b>${COPY.home.claim3t}</b>
  ${COPY.home.claim3b}</p></div>
</div>
</section>

<section class="prose-wide">
${C.h2(COPY.home.audienceH2, 'audience')}
<p class="part-blurb">${COPY.home.audienceP}</p>
<div class="grid2">
  <div class="card"><b>${COPY.home.aud1t}</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  ${COPY.home.aud1b} <a href="${href('/chapters/a20/')}">${COPY.home.aud1link}</a></p></div>
  <div class="card"><b>${COPY.home.aud2t}</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  ${COPY.home.aud2b} <a href="${href('/chapters/a25/')}">${COPY.home.aud2link}</a></p></div>
  <div class="card"><b>${COPY.home.aud3t}</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  ${COPY.home.aud3b} <a href="${href('/references/')}">${COPY.home.aud3link}</a></p></div>
  <div class="card"><b>${COPY.home.aud4t}</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  ${COPY.home.aud4b} <a href="${href('/projects/')}">${COPY.home.aud4link}</a></p></div>
</div>
</section>

<section class="prose-wide">
${C.h2(COPY.home.currH2, 'curriculum')}
<p class="part-blurb">${COPY.home.currP}</p>
${partCards}
<a class="projcard" href="${href('/capstone/')}" style="margin-top:1.5rem">
  <div class="pl">${COPY.home.finalProject} · ${cur.CAPSTONE.hours}</div>
  <div class="pt">${cur.CAPSTONE.title}</div>
  <div class="pd">${cur.CAPSTONE.desc}</div></a>
</section>

<section class="prose-wide">
${C.h2(COPY.home.formatH2, 'format')}
<div class="grid4">
  <div class="card"><b>${COPY.home.fmt1t}</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  ${COPY.home.fmt1b}</p></div>
  <div class="card"><b>${COPY.home.fmt2t}</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  ${COPY.home.fmt2b}</p></div>
  <div class="card"><b>${COPY.home.fmt3t}</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  ${COPY.home.fmt3b}</p></div>
  <div class="card"><b>${COPY.home.fmt4t}</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  ${COPY.home.fmt4b}</p></div>
</div>
</section>

<section class="prose" style="margin:4rem 0 2rem">
${C.h2(COPY.home.startH2, 'start')}
<p>${COPY.home.startP}</p>
<div class="btnrow"><a class="btn" href="${href('/chapters/a01/')}">${COPY.home.startBtn}</a></div>
</section>
</div>`});

  /* ====================================================== curriculum ==== */
  out['/curriculum/'] = page({
    title: COPY.curriculum.title, path: '/curriculum/', locale,
    description: COPY.curriculum.description(nCh),
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.curriculum.kicker}</span></div>
<h1>${COPY.curriculum.h1}</h1><p class="sub">${COPY.curriculum.sub(nCh)}</p>
<div class="chap-meta"><span><b>${TOTAL_LINES.toLocaleString()}</b> ${COPY.curriculum.metaLines}</span>
<span><b>${nCh}</b> ${COPY.curriculum.metaLabs}</span><span><b>${nCh * 6}</b> ${COPY.curriculum.metaQuestions}</span></div>
</header>
<div class="prose-wide">
<input class="searchbox" data-filter="#curr" placeholder="${COPY.curriculum.searchPlaceholder}">
<div id="curr">
${cur.PARTS.map(p => {
  const chs = cur.chaptersOfPart(p.id);
  const proj = p.project ? cur.PROJECTS.find(x => x.id === p.project) : null;
  return `<section class="part" data-group>
    <div class="part-head"><span class="part-num">${COPY.curriculum.part(p.id)}</span><h3>${p.title}</h3></div>
    <p class="part-blurb">${p.blurb}</p>
    <div class="chaplist">${chs.map(c => `
      <a class="chapcard" href="${href(`/chapters/${c.id}/`)}" data-search="${C.esc(c.id + ' ' + c.title + ' ' + c.sub + ' ' + c.desc)}">
        <span class="n">${c.id.toUpperCase()}${c.lines ? `<small>${COPY.curriculum.chLines(c.lines)}</small>` : ''}</span>
        <span><span class="ct">${c.title}</span><span class="cs">${c.sub}</span>
        <span class="cd">${c.desc}</span></span></a>`).join('')}</div>
    ${proj ? `<a class="projcard" href="${href(`/projects/${proj.id}/`)}" data-search="${C.esc(proj.title + ' ' + proj.desc)}">
      <div class="pl">${proj.tag} · ${proj.hours}</div><div class="pt">${proj.title}</div>
      <div class="pd">${proj.desc}</div></a>` : ''}
    ${p.bridge ? `<p class="bridge">${p.bridge}</p>` : ''}</section>`;
}).join('')}
</div>
<a class="projcard" href="${href('/capstone/')}"><div class="pl">${COPY.curriculum.finalProject} · ${cur.CAPSTONE.hours}</div>
<div class="pt">${cur.CAPSTONE.title}</div><div class="pd">${cur.CAPSTONE.desc}</div></a>
</div></div>`});

  /* ========================================================= projects ==== */
  out['/projects/'] = page({
    title: COPY.projects.title, path: '/projects/', locale,
    description: COPY.projects.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.projects.kicker}</span></div>
<h1>${COPY.projects.h1}</h1><p class="sub">${COPY.projects.sub}</p></header>
<div class="prose-wide">
${cur.PROJECTS.map(p => {
  const part = cur.PARTS.find(x => x.id === p.after);
  return `<a class="chapcard" href="${href(`/projects/${p.id}/`)}" style="margin-bottom:.7rem">
    <span class="n">${p.id.toUpperCase()}<small>${p.hours}</small></span>
    <span><span class="ct">${p.title}</span>
    <span class="cs">${COPY.projects.afterPart(p.after, part.title)}</span>
    <span class="cd">${p.desc}</span></span></a>`;
}).join('')}
<a class="projcard" href="${href('/capstone/')}" style="margin-top:1.25rem">
  <div class="pl">${COPY.projects.finalProject} · ${cur.CAPSTONE.hours}</div>
  <div class="pt">${cur.CAPSTONE.title}</div><div class="pd">${cur.CAPSTONE.desc}</div></a>

${C.h2(COPY.projects.flowH2, 'flow')}
${C.figure(C.svg(760, 200, `
  ${C.box(10, 60, 108, 50, 'P1', COPY.diagrams.flow.p1, 'd-sunk')}
  ${C.box(140, 60, 108, 50, 'P2', COPY.diagrams.flow.p2, 'd-attack')}
  ${C.box(270, 60, 108, 50, 'P3', COPY.diagrams.flow.p3, 'd-attack')}
  ${C.box(400, 60, 108, 50, 'P4', COPY.diagrams.flow.p4, 'd-def')}
  ${C.box(530, 60, 108, 50, 'P5', COPY.diagrams.flow.p5, 'd-def')}
  ${C.box(660, 45, 90, 80, ...COPY.diagrams.flow.capstone, 'd-trust')}
  ${C.arrow(120, 85, 138, 85)}${C.arrow(250, 85, 268, 85)}
  ${C.arrow(380, 85, 398, 85)}${C.arrow(510, 85, 528, 85)}${C.arrow(640, 85, 658, 85)}
  ${C.svgText(64, 140, COPY.diagrams.flow.s1, 'd-sub')}
  ${C.svgText(324, 140, COPY.diagrams.flow.s2, 'd-attack-t')}
  ${C.svgText(584, 140, COPY.diagrams.flow.s3, 'd-def-t')}
  ${C.svgText(705, 140, COPY.diagrams.flow.s4, 'd-sub')}
  ${C.svgText(10, 30, COPY.diagrams.flow.title, 'd-ttl', 'start')}
`), `<b>${COPY.projects.flowFigT}</b> ${COPY.projects.flowFigB}`)}
</div></div>`});

  for (const p of cur.PROJECTS) {
    const b = PROJECT_BODIES[p.id];
    const part = cur.PARTS.find(x => x.id === p.after);
    out[`/projects/${p.id}/`] = page({
      title: p.title, path: `/projects/${p.id}/`, locale, description: p.desc.replace(/\s+/g, ' ').trim(),
      body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker">
  <span class="chap-id">${p.tag}</span>
  <span class="chap-part">${COPY.projects.afterPart(p.after, part.title)}</span></div>
<h1>${p.title}</h1><p class="sub">${p.desc}</p>
<div class="chap-meta"><span><b>${p.hours}</b></span><span>${COPY.projects.prereq} <b>${part.range}</b></span></div>
</header>
<article class="prose">${b.body}</article>
<div class="prose-wide">${renderRefs(b.refs, b.refsNote)}</div>
</div>`, scripts: b.scripts || [] });
  }

  /* ========================================================= capstone ==== */
  out['/capstone/'] = page({
    title: cur.CAPSTONE.title, path: '/capstone/', locale,
    description: cur.CAPSTONE.desc.replace(/\s+/g, ' ').trim(),
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-id">${COPY.capstone.finalTag}</span>
<span class="chap-part">${COPY.capstone.usesEvery}</span></div>
<h1>${cur.CAPSTONE.title}</h1><p class="sub">${cur.CAPSTONE.sub}</p>
<div class="chap-meta"><span><b>${cur.CAPSTONE.hours}</b></span>
<span>${COPY.capstone.prereq} <b>A01–A27</b> ${COPY.capstone.and} <b>P1–P5</b></span></div></header>
<article class="prose">${CAPSTONE_BODY.body}</article>
<div class="prose-wide">${renderRefs(CAPSTONE_BODY.refs, CAPSTONE_BODY.refsNote)}</div>
</div>`});

  /* ========================================================== threats ==== */
  out['/threats/'] = page({
    title: COPY.threats.title, path: '/threats/', locale,
    description: COPY.threats.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.threats.kicker}</span></div>
<h1>${COPY.threats.h1}</h1><p class="sub">${COPY.threats.sub}</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#tmap" placeholder="${COPY.threats.searchPlaceholder}">
<div id="tmap">
${SURFACES.map(s => `<section class="part" data-group id="${C.slug(s.n + ' ' + s.title)}">
  <div class="part-head"><span class="part-num" style="color:var(--attack);border-color:var(--attack)">${s.n}</span>
  <h3>${s.title}</h3><span class="chap-part">${s.sources}</span></div>
  <p class="part-blurb">${s.blurb}</p>
  ${C.table(COPY.threats.cols, s.classes.map(c =>
    [`<span id="${C.slug(c[0])}" data-search="${C.esc(c[0] + ' ' + c[1])}">${c[0]}</span>`, c[1],
     c[2] ? `<a href="${href(`/chapters/${c[2]}/`)}">${c[2].toUpperCase()}</a>` : '—']))}
</section>`).join('')}
</div>
<p class="bridge">${COPY.threats.bridge(href('/defenses/'))}</p>
</div></div>`});

  /* ========================================================= defenses ==== */
  out['/defenses/'] = page({
    title: COPY.defenses.title, path: '/defenses/', locale,
    description: COPY.defenses.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.defenses.kicker}</span></div>
<h1>${COPY.defenses.h1}</h1><p class="sub">${COPY.defenses.sub}</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#dmap" placeholder="${COPY.defenses.searchPlaceholder}">
<div id="dmap">
${CONTROLS.map(g => `<section class="part" data-group id="${C.slug(g.stage + ' ' + g.title)}">
  <div class="part-head"><span class="part-num" style="color:var(--defense);border-color:var(--defense)">${g.stage}</span>
  <h3>${g.title}</h3></div>
  <p class="part-blurb">${g.blurb}</p>
  ${C.table(COPY.defenses.cols, g.items.map(i =>
    [`<span id="${C.slug(i[0])}" data-search="${C.esc(i[0] + ' ' + i[1])}">${i[0]}</span>`, i[1],
     `<span class="pill ${i[2] === 'bound' ? 'defense' : i[2] === 'raise' ? 'warn' : 'neutral'}">${
       i[2] === 'bound' ? COPY.defenses.pillBound : i[2] === 'raise' ? COPY.defenses.pillRaise : COPY.defenses.pillSupport}</span>`,
     i[3] ? `<a href="${href(`/chapters/${i[3]}/`)}">${i[3].toUpperCase()}</a>` : '—']))}
</section>`).join('')}
</div>
${C.callout('note', COPY.defenses.calloutTitle, `<p>${COPY.defenses.calloutBody}</p>`)}
</div></div>`});

  /* ========================================================= glossary ==== */
  const groups = COPY.glossary.groups;
  out['/glossary/'] = page({
    title: COPY.glossary.title, path: '/glossary/', locale,
    description: COPY.glossary.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.glossary.kicker}</span></div>
<h1>${COPY.glossary.h1}</h1><p class="sub">${COPY.glossary.sub(TERMS.length)}</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#gloss" placeholder="${COPY.glossary.searchPlaceholder}">
<div id="gloss">
${Object.entries(groups).map(([k, label]) => {
  const t = TERMS.filter(x => x[1] === k);
  if (!t.length) return '';
  return `<section class="part" data-group><div class="part-head"><h3>${label}</h3></div>
  ${C.table(COPY.glossary.cols, t.map(([term, , def, ch]) =>
    [`<b id="term-${C.slug(term)}" data-search="${C.esc(term + ' ' + def)}">${term}</b>`, def,
     ch ? `<a href="${href(`/chapters/${ch}/`)}">${ch.toUpperCase()}</a>` : '—']))}</section>`;
}).join('')}
</div></div></div>`});

  /* ========================================================= timeline ==== */
  const kindPill = { attack: 'attack', defense: 'defense', incident: 'warn', standard: 'trust', benchmark: 'boundary' };
  out['/timeline/'] = page({
    title: COPY.timeline.title, path: '/timeline/', locale,
    description: COPY.timeline.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.timeline.kicker}</span></div>
<h1>${COPY.timeline.h1}</h1><p class="sub">${COPY.timeline.sub(EVENTS.length)}</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#tl" placeholder="${COPY.timeline.searchPlaceholder}">
<div id="tl">
${C.table(COPY.timeline.cols, EVENTS.slice().sort((a, b) => a[0].localeCompare(b[0])).map(([d, k, t, desc, ch]) =>
  [`<span style="font-family:var(--font-mono);font-size:.8rem;white-space:nowrap">${d}</span>`,
   `<span class="pill ${kindPill[k]}">${k}</span>`,
   `<span id="${C.slug(d + ' ' + t)}" data-search="${C.esc(d + ' ' + k + ' ' + t + ' ' + desc)}"><b>${t}</b><br><span style="color:var(--fg-muted)">${desc}</span></span>`,
   ch ? `<a href="${href(`/chapters/${ch}/`)}">${ch.toUpperCase()}</a>` : '—']))}
</div></div></div>`});

  /* ======================================================= references ==== */
  const byChapter = cur.CHAPTERS.map(c => ({ ch: c, refs: (loaded.get(c.id)?.refs) || [] }))
    .filter(x => x.refs.length);
  const all = new Map();
  for (const { ch, refs } of byChapter) {
    for (const r of refs) {
      const k = r.title.toLowerCase();
      if (!all.has(k)) all.set(k, { ...r, chapters: [] });
      all.get(k).chapters.push(ch.id);
    }
  }
  const sorted = [...all.values()].sort((a, b) =>
    (a.authors || 'zz').localeCompare(b.authors || 'zz'));

  out['/references/'] = page({
    title: COPY.references.title, path: '/references/', locale,
    description: COPY.references.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.references.kicker}</span></div>
<h1>${COPY.references.h1}</h1><p class="sub">${COPY.references.sub(sorted.length, byChapter.length)}</p></header>
<div class="prose-wide">
${C.callout('note', COPY.references.calloutTitle, `<p>${COPY.references.calloutP1}</p>
<p style="margin-bottom:0">${COPY.references.calloutP2(href('/sources/'))}</p>`)}
<input class="searchbox" data-filter="#refs" placeholder="${COPY.references.searchPlaceholder(sorted.length)}">
<div id="refs">
<ol class="reflist">
${sorted.map(r => `<li data-search="${C.esc((r.authors || '') + ' ' + r.title + ' ' + (r.venue || ''))}">
${r.authors ? `<span class="authors">${C.esc(r.authors)}</span>. ` : ''}
${r.url ? `<a href="${r.url}"><span class="ttl">${C.esc(r.title)}</span></a>` : `<span class="ttl">${C.esc(r.title)}</span>`}.
${r.venue ? `<span class="venue">${C.esc(r.venue)}</span>` : ''}
<span class="venue">· ${r.chapters.map(c => `<a href="${href(`/chapters/${c}/`)}">${c.toUpperCase()}</a>`).join(' ')}</span>
</li>`).join('')}
</ol></div></div></div>`});

  /* ========================================================== sources ==== */
  out['/sources/'] = page({
    title: COPY.sources.title, path: '/sources/', locale,
    description: COPY.sources.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.sources.kicker}</span></div>
<h1>${COPY.sources.h1}</h1><p class="sub">${COPY.sources.sub}</p></header>
<article class="prose">
<p>${COPY.sources.intro}</p>

${C.h2(COPY.sources.collectionsH2, 'collections')}
${C.h3(COPY.sources.ucsbH3, 'ucsb')}
<p>${COPY.sources.ucsbP1}</p>
<p>${COPY.sources.ucsbP2}</p>

${C.h3(COPY.sources.skillsH3, 'skills')}
<p>${COPY.sources.skillsP}</p>

${C.h3(COPY.sources.voltH3, 'volt')}
<p>${COPY.sources.voltP}</p>

${C.h3(COPY.sources.sokH3, 'sok')}
<p>${COPY.sources.sokP1}</p>
<p>${COPY.sources.sokP2(href('/threats/'), href('/defenses/'))}</p>

${C.h3(COPY.sources.crowdstrikeH3, 'crowdstrike')}
<p>${COPY.sources.crowdstrikeP}</p>

${C.h2(COPY.sources.primaryH2, 'primary')}
<p>${COPY.sources.primaryP(sorted.length, href('/references/'))}</p>

${C.callout('warn', COPY.sources.correctionsTitle, `<p style="margin-bottom:0">${COPY.sources.correctionsBody(`${SITE.repo}/issues`)}</p>`)}
</article></div>`});

  /* ============================================================ setup ==== */
  out['/setup/'] = page({
    title: COPY.setup.title, path: '/setup/', locale,
    description: COPY.setup.description,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">${COPY.setup.kicker}</span></div>
<h1>${COPY.setup.h1}</h1><p class="sub">${COPY.setup.sub}</p></header>
<article class="prose">
<p>${COPY.setup.intro}</p>

${C.code(`git clone ${SITE.repo}.git
cd learn-agent-security-from-scratch
python3 code/a01_agent_loop.py       # one chapter
python3 code/run_all.py              # every chapter, with a summary`, { lang: 'sh', file: 'terminal' })}

${C.h2(COPY.setup.noModelH2, 'no-model')}
<p>${COPY.setup.noModelP1}</p>
<p>${COPY.setup.noModelP2}</p>

${C.callout('note', COPY.setup.liveTitle, `<p style="margin-bottom:0">${COPY.setup.liveBody(href('/chapters/a19/'))}</p>`)}

${C.h2(COPY.setup.safetyH2, 'safety')}
<p>${COPY.setup.safetyP1}</p>
<p>${COPY.setup.safetyP2}</p>

${C.h2(COPY.setup.siteH2, 'site')}
${C.code(`node build.mjs           # → dist/
node build.mjs --serve   # → dist/ and http://localhost:8080`, { lang: 'sh', file: 'terminal' })}
<p>${COPY.setup.siteP}</p>
</article></div>`});

  return out;
}
