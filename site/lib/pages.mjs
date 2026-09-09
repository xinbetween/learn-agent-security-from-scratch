import { TERMS } from '../content/glossary.mjs';
import { EVENTS } from '../content/timeline.mjs';

export async function buildAll(ctx) {
  const { cur, C, page, SITE, loaded, TOTAL_LINES, renderRefs } = ctx;
  const out = {};
  const nCh = cur.CHAPTERS.length;

  /* ============================================================ home ==== */
  const heroDiagram = C.svg(760, 340, `
  <text x="14" y="18" class="d-ttl">ONE AGENT TURN — AND THE FOUR PLACES IT BREAKS</text>
  ${C.box(14, 46, 120, 54, 'user task', '"book my flight"', 'd-sunk')}
  ${C.box(174, 46, 120, 54, 'context', 'prompt + history')}
  ${C.box(334, 46, 120, 54, 'model', 'plan next action')}
  ${C.box(494, 46, 120, 54, 'tool call', 'runs for real')}
  ${C.box(494, 176, 120, 54, 'world', 'web · files · APIs', 'd-sunk')}
  ${C.box(174, 176, 240, 54, 'tool result appended to context', 'untrusted bytes, same token stream', 'd-attack')}
  ${C.arrow(134, 73, 172, 73)}
  ${C.arrow(294, 73, 332, 73)}
  ${C.arrow(454, 73, 492, 73)}
  ${C.arrow(554, 100, 554, 174)}
  ${C.arrow(494, 203, 416, 203, '', 'd-attack-l')}
  <path d="M174 203 L120 203 L120 100" class="d-arrow" marker-end="url(#ah)" fill="none"/>
  <text x="96" y="150" text-anchor="end" class="d-sub">loop</text>
  <rect x="160" y="30" width="470" height="220" rx="8" class="d-bnd"/>
  ${C.svgText(636, 26, 'TRUST BOUNDARY', 'd-bnd-t', 'end')}
  <line x1="14" y1="274" x2="746" y2="274" stroke="var(--border)" stroke-width="1"/>
  ${C.svgText(14, 298, '① attacker text enters here', 'd-attack-t', 'start')}
  ${C.svgText(14, 316, 'and is read as intent', 'd-sub', 'start')}
  ${C.svgText(200, 298, '② the model cannot', 'd-attack-t', 'start')}
  ${C.svgText(200, 316, 'tell it apart', 'd-sub', 'start')}
  ${C.svgText(386, 298, '③ the tool runs with', 'd-attack-t', 'start')}
  ${C.svgText(386, 316, 'your credentials', 'd-sub', 'start')}
  ${C.svgText(572, 298, '④ the result leaves on', 'd-attack-t', 'start')}
  ${C.svgText(572, 316, 'an outbound call', 'd-sub', 'start')}
  `, { label: 'An agent turn with the four points of compromise marked' });

  const partCards = cur.PARTS.map(p => {
    const chs = cur.chaptersOfPart(p.id);
    const proj = p.project ? cur.PROJECTS.find(x => x.id === p.project) : null;
    return `<section class="part">
  <div class="part-head"><span class="part-num">Part ${p.id}</span><h3>${p.title}</h3>
    <span class="chap-part">${chs[0].id.toUpperCase()}–${chs[chs.length - 1].id.toUpperCase()}</span></div>
  <p class="part-blurb">${p.blurb}</p>
  <div class="chaplist">${chs.map(c => `
    <a class="chapcard" href="/chapters/${c.id}/">
      <span class="n">${c.id.toUpperCase()}${c.lines ? `<small>${c.lines} lines</small>` : ''}</span>
      <span><span class="ct">${c.title}</span><span class="cs">${c.sub}</span>
      <span class="cd">${c.desc}</span></span></a>`).join('')}</div>
  ${proj ? `<a class="projcard" href="/projects/${proj.id}/">
     <div class="pl">${proj.tag} · ${proj.hours}</div>
     <div class="pt">${proj.title}</div><div class="pd">${proj.desc}</div></a>` : ''}
  ${p.bridge ? `<p class="bridge">${p.bridge}</p>` : ''}
  </section>`;
  }).join('');

  out['/'] = page({
    title: SITE.title, path: '/',
    body: `
<div class="wrap">
<section class="hero">
  <div class="eyebrow">${nCh} chapters · ${TOTAL_LINES.toLocaleString()} lines of runnable Python · ${EVENTS.length}-point timeline · no GPU, no API key</div>
  <h1>Learn agent security<br>from scratch.</h1>
  <p class="lede">Giving a language model tools turns a content-safety problem into a systems-security
  problem. A model that reads a web page cannot tell the page's text from your instructions, and it is
  holding your credentials while it reads. This course starts from that one fact and works outward:
  every attack that follows from it, every defence that has been proposed against it, and which of
  those defences survive contact with an attacker who knows they are there.</p>
  <p class="lede">Each chapter gives you a mechanism diagram, a lab you can break in the browser, a
  self-contained Python file that runs the attack or the defence for real, six graded questions, and
  the papers it was built from — credited to the researchers who wrote them.</p>
  <div class="btnrow">
    <a class="btn" href="/chapters/a01/">Start with A01 →</a>
    <a class="btn ghost" href="/curriculum/">See the curriculum</a>
    <a class="btn ghost" href="/capstone/">The capstone</a>
  </div>
  <div class="termline"><span class="p">$</span> git clone ${SITE.repo}.git &amp;&amp; python3 code/a01_agent_loop.py</div>
</section>

<section class="prose-wide">${C.figure(heroDiagram,
  `<b>A01 · the whole course in one diagram.</b> Every chapter in Parts 2 and 3 attacks one of the four
   numbered points; every chapter in Parts 4 and 5 defends one of them. The dashed line is the only
   boundary that matters, and the model is on the wrong side of it.`)}</section>

<section class="prose-wide">
${C.h2('Three claims this course argues for', 'claims')}
<div class="grid3">
  <div class="card"><div class="eyebrow">01</div><p><b>Prompt injection is not a bug.</b>
  It is what happens when a system with no privilege separation is given privileges. There is no
  patch, no filter and no model version that closes it — only architectures that bound what a
  successful injection can reach.</p></div>
  <div class="card"><div class="eyebrow">02</div><p><b>Detection is a mitigation, not a control.</b>
  Guardrails move the attacker's cost. Capability scoping, information-flow control and egress
  policy move the attacker's ceiling. Know which one you are buying.</p></div>
  <div class="card"><div class="eyebrow">03</div><p><b>Most of this is ordinary security.</b>
  Least privilege, sandboxing, supply-chain review, egress control, audit logging. The AI part is
  narrow; the systems part is the work, and it is already well understood.</p></div>
</div>
</section>

<section class="prose-wide">
${C.h2('Who this is for', 'audience')}
<p class="part-blurb">Prerequisites: you can read Python and you have used an AI agent once. You do
not need a GPU, an API key, a security background, or any machine-learning theory. Everything runs
against a deterministic stub model included in the repository.</p>
<div class="grid2">
  <div class="card"><b>You are shipping an agent</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  Parts 1, 4 and 5 give you a threat model, a defence stack you can justify to a reviewer, and the
  honest limits of each layer. <a href="/chapters/a20/">A20 · design patterns →</a></p></div>
  <div class="card"><b>You are securing someone else's</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  Parts 2, 3 and 6 are the offensive curriculum and the evaluation harness that turns it into a
  report. <a href="/chapters/a25/">A25 · red-teaming →</a></p></div>
  <div class="card"><b>You are reading the literature</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  Every chapter ends in a full reference list, and the site indexes 180-odd papers and reports by
  the threat they address. <a href="/references/">All references →</a></p></div>
  <div class="card"><b>You learn by breaking things</b><p style="margin:.4rem 0 0;color:var(--fg-muted);font-size:.9rem">
  Twenty-seven in-browser labs, five projects and a capstone. Land the attack yourself, then watch the same
  attack fail against the fix. <a href="/projects/">The projects →</a></p></div>
</div>
</section>

<section class="prose-wide">
${C.h2('The curriculum', 'curriculum')}
<p class="part-blurb">Six parts. Read them in order the first time — the sequence is what turns a
list of attacks into a way of thinking about agent architecture. Each part ends with a project, and
the six parts end with a capstone that uses all of them.</p>
${partCards}
<a class="projcard" href="/capstone/" style="margin-top:1.5rem">
  <div class="pl">Final project · ${cur.CAPSTONE.hours}</div>
  <div class="pt">${cur.CAPSTONE.title}</div>
  <div class="pd">${cur.CAPSTONE.desc}</div></a>
</section>

<section class="prose-wide">
${C.h2('In every chapter', 'format')}
<div class="grid4">
  <div class="card"><b>A mechanism diagram</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  Follow the bytes through the system and see exactly where the attacker's text enters and where the
  data leaves.</p></div>
  <div class="card"><b>A lab in the page</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  Type a payload, move a threshold, watch the defence hold or fail. No install, no key, no network.</p></div>
  <div class="card"><b>A file you can run</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  Self-contained Python, standard library only, asserting the claims made in the text. Runs in
  under two seconds.</p></div>
  <div class="card"><b>Credited references</b><p style="margin:.35rem 0 0;color:var(--fg-muted);font-size:.85rem">
  Six graded questions, then the full bibliography for the chapter with every author named.</p></div>
</div>
</section>

<section class="prose" style="margin:4rem 0 2rem">
${C.h2('Start with the trust boundary.', 'start')}
<p>Chapter A01 is forty lines of Python and one uncomfortable observation about where those lines put
your credentials. Everything else follows from it.</p>
<div class="btnrow"><a class="btn" href="/chapters/a01/">A01 · The Agent Loop →</a></div>
</section>
</div>`});

  /* ====================================================== curriculum ==== */
  out['/curriculum/'] = page({
    title: 'Curriculum', path: '/curriculum/',
    description: `All ${nCh} chapters of Learn Agent Security From Scratch, organised into six parts with five projects and a capstone.`,
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">The full path</span></div>
<h1>Curriculum</h1><p class="sub">${nCh} chapters, six parts, five projects and a capstone.
Ordered so that each part creates the problem the next one solves.</p>
<div class="chap-meta"><span><b>${TOTAL_LINES.toLocaleString()}</b> lines of course code</span>
<span><b>${nCh}</b> in-browser labs</span><span><b>${nCh * 6}</b> graded questions</span></div>
</header>
<div class="prose-wide">
<input class="searchbox" data-filter="#curr" placeholder="Filter chapters — try “injection”, “memory”, “sandbox”, “identity”…">
<div id="curr">
${cur.PARTS.map(p => {
  const chs = cur.chaptersOfPart(p.id);
  const proj = p.project ? cur.PROJECTS.find(x => x.id === p.project) : null;
  return `<section class="part" data-group>
    <div class="part-head"><span class="part-num">Part ${p.id}</span><h3>${p.title}</h3></div>
    <p class="part-blurb">${p.blurb}</p>
    <div class="chaplist">${chs.map(c => `
      <a class="chapcard" href="/chapters/${c.id}/" data-search="${C.esc(c.id + ' ' + c.title + ' ' + c.sub + ' ' + c.desc)}">
        <span class="n">${c.id.toUpperCase()}${c.lines ? `<small>${c.lines} lines</small>` : ''}</span>
        <span><span class="ct">${c.title}</span><span class="cs">${c.sub}</span>
        <span class="cd">${c.desc}</span></span></a>`).join('')}</div>
    ${proj ? `<a class="projcard" href="/projects/${proj.id}/" data-search="${C.esc(proj.title + ' ' + proj.desc)}">
      <div class="pl">${proj.tag} · ${proj.hours}</div><div class="pt">${proj.title}</div>
      <div class="pd">${proj.desc}</div></a>` : ''}
    ${p.bridge ? `<p class="bridge">${p.bridge}</p>` : ''}</section>`;
}).join('')}
</div>
<a class="projcard" href="/capstone/"><div class="pl">Final project · ${cur.CAPSTONE.hours}</div>
<div class="pt">${cur.CAPSTONE.title}</div><div class="pd">${cur.CAPSTONE.desc}</div></a>
</div></div>`});

  /* ========================================================= projects ==== */
  const { PROJECT_BODIES } = await import('../content/projects/index.mjs');
  out['/projects/'] = page({
    title: 'Projects', path: '/projects/',
    description: 'Five graded projects and a capstone for the agent security course.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Build it yourself</span></div>
<h1>Projects</h1><p class="sub">Reading about prompt injection and landing one are different skills.
Each part of the course ends with a build, and the six builds compose into the capstone.</p></header>
<div class="prose-wide">
${cur.PROJECTS.map(p => {
  const part = cur.PARTS.find(x => x.id === p.after);
  return `<a class="chapcard" href="/projects/${p.id}/" style="margin-bottom:.7rem">
    <span class="n">${p.id.toUpperCase()}<small>${p.hours}</small></span>
    <span><span class="ct">${p.title}</span>
    <span class="cs">After Part ${p.after} · ${part.title}</span>
    <span class="cd">${p.desc}</span></span></a>`;
}).join('')}
<a class="projcard" href="/capstone/" style="margin-top:1.25rem">
  <div class="pl">Final project · ${cur.CAPSTONE.hours}</div>
  <div class="pt">${cur.CAPSTONE.title}</div><div class="pd">${cur.CAPSTONE.desc}</div></a>

${C.h2('How the projects fit together', 'flow')}
${C.figure(C.svg(760, 200, `
  ${C.box(10, 60, 108, 50, 'P1', 'threat model', 'd-sunk')}
  ${C.box(140, 60, 108, 50, 'P2', 'injection lab', 'd-attack')}
  ${C.box(270, 60, 108, 50, 'P3', 'supply chain', 'd-attack')}
  ${C.box(400, 60, 108, 50, 'P4', 'harden it', 'd-def')}
  ${C.box(530, 60, 108, 50, 'P5', 'measure + run', 'd-def')}
  ${C.box(660, 45, 90, 80, 'Capstone', 'Sentinel', 'd-trust')}
  ${C.arrow(120, 85, 138, 85)}${C.arrow(250, 85, 268, 85)}
  ${C.arrow(380, 85, 398, 85)}${C.arrow(510, 85, 528, 85)}${C.arrow(640, 85, 658, 85)}
  ${C.svgText(64, 140, 'what can go wrong', 'd-sub')}
  ${C.svgText(324, 140, 'make it go wrong', 'd-attack-t')}
  ${C.svgText(584, 140, 'stop it, then prove it', 'd-def-t')}
  ${C.svgText(705, 140, 'all of it', 'd-sub')}
  ${C.svgText(10, 30, 'THE SAME AGENT, CARRIED THROUGH ALL SIX', 'd-ttl', 'start')}
`), `<b>One agent, six passes.</b> Project 2 builds the vulnerable agent you keep for the rest of the
course. P3 attacks its dependencies, P4 rebuilds it behind a defence stack, P5 measures the result,
and the capstone packages the whole thing with an evaluation harness.`)}
</div></div>`});

  for (const p of cur.PROJECTS) {
    const b = PROJECT_BODIES[p.id];
    const part = cur.PARTS.find(x => x.id === p.after);
    out[`/projects/${p.id}/`] = page({
      title: p.title, path: `/projects/${p.id}/`, description: p.desc.replace(/\s+/g, ' ').trim(),
      body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker">
  <span class="chap-id">${p.tag}</span>
  <span class="chap-part">After Part ${p.after} · ${part.title}</span></div>
<h1>${p.title}</h1><p class="sub">${p.desc}</p>
<div class="chap-meta"><span><b>${p.hours}</b></span><span>Prerequisite: <b>${part.range}</b></span></div>
</header>
<article class="prose">${b.body}</article>
<div class="prose-wide">${renderRefs(b.refs, b.refsNote)}</div>
</div>`, scripts: b.scripts || [] });
  }

  /* ========================================================= capstone ==== */
  const { CAPSTONE_BODY } = await import('../content/projects/capstone.mjs');
  out['/capstone/'] = page({
    title: cur.CAPSTONE.title, path: '/capstone/',
    description: cur.CAPSTONE.desc.replace(/\s+/g, ' ').trim(),
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-id">FINAL</span>
<span class="chap-part">Uses every chapter</span></div>
<h1>${cur.CAPSTONE.title}</h1><p class="sub">${cur.CAPSTONE.sub}</p>
<div class="chap-meta"><span><b>${cur.CAPSTONE.hours}</b></span>
<span>Prerequisite: <b>A01–A27</b> and <b>P1–P5</b></span></div></header>
<article class="prose">${CAPSTONE_BODY.body}</article>
<div class="prose-wide">${renderRefs(CAPSTONE_BODY.refs, CAPSTONE_BODY.refsNote)}</div>
</div>`});

  /* ========================================================== threats ==== */
  const { SURFACES } = await import('../content/threatmap.mjs');
  out['/threats/'] = page({
    title: 'Threat map', path: '/threats/',
    description: 'Six threat surfaces and twenty-five vulnerability classes for LLM agents, each linked to the chapter that covers it.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Reference</span></div>
<h1>Threat map</h1><p class="sub">Six surfaces, twenty-five classes. The structure follows the
systematic review by Grimes et al. at Carnegie Mellon's Software Engineering Institute, which
categorised threats across 173 academic and industry sources; the per-class notes and chapter links
are this course's.</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#tmap" placeholder="Filter threats — “injection”, “memory”, “DoS”, “backdoor”…">
<div id="tmap">
${SURFACES.map(s => `<section class="part" data-group>
  <div class="part-head"><span class="part-num" style="color:var(--attack);border-color:var(--attack)">${s.n}</span>
  <h3>${s.title}</h3><span class="chap-part">${s.sources}</span></div>
  <p class="part-blurb">${s.blurb}</p>
  ${C.table(['Vulnerability class', 'What the attacker does', 'Chapter'], s.classes.map(c =>
    [`<span data-search="${C.esc(c[0] + ' ' + c[1])}">${c[0]}</span>`, c[1],
     c[2] ? `<a href="/chapters/${c[2]}/">${c[2].toUpperCase()}</a>` : '—']))}
</section>`).join('')}
</div>
<p class="bridge">Every surface here has a facing page in <a href="/defenses/">the defence map</a>.</p>
</div></div>`});

  /* ========================================================= defenses ==== */
  const { CONTROLS } = await import('../content/defensemap.mjs');
  out['/defenses/'] = page({
    title: 'Defence map', path: '/defenses/',
    description: 'A taxonomy of thirty-three agent security controls across design, development and operations.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Reference</span></div>
<h1>Defence map</h1><p class="sub">Thirty-three control categories across the three lifecycle stages,
following the best-practice taxonomy in the SEI systematic review. The <b>strength</b> column is this
course's judgement of what each control actually buys you against a motivated attacker.</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#dmap" placeholder="Filter controls — “sandbox”, “identity”, “logging”…">
<div id="dmap">
${CONTROLS.map(g => `<section class="part" data-group>
  <div class="part-head"><span class="part-num" style="color:var(--defense);border-color:var(--defense)">${g.stage}</span>
  <h3>${g.title}</h3></div>
  <p class="part-blurb">${g.blurb}</p>
  ${C.table(['Control', 'What it does', 'Strength', 'Chapter'], g.items.map(i =>
    [`<span data-search="${C.esc(i[0] + ' ' + i[1])}">${i[0]}</span>`, i[1],
     `<span class="pill ${i[2] === 'bound' ? 'defense' : i[2] === 'raise' ? 'warn' : 'neutral'}">${
       i[2] === 'bound' ? 'bounds damage' : i[2] === 'raise' ? 'raises cost' : 'supports'}</span>`,
     i[3] ? `<a href="/chapters/${i[3]}/">${i[3].toUpperCase()}</a>` : '—']))}
</section>`).join('')}
</div>
${C.callout('note', 'Reading the strength column', `<p><b>Bounds damage</b> means an attacker who wins
the model still cannot reach the asset — the property holds by construction. <b>Raises cost</b> means
the attacker needs a better payload; the ceiling is unchanged. <b>Supports</b> means the control does
not stop anything on its own but makes the others workable. A stack of "raises cost" controls is not
a substitute for one "bounds damage" control, and most production incidents happen to teams who
believed otherwise.</p>`)}
</div></div>`});

  /* ========================================================= glossary ==== */
  const groups = { core: 'Core concepts', framework: 'Frameworks', attack: 'Attacks',
                   defense: 'Defences', eval: 'Evaluation', ops: 'Operations' };
  out['/glossary/'] = page({
    title: 'Glossary', path: '/glossary/',
    description: 'Definitions of the agent security terms used across the course.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Reference</span></div>
<h1>Glossary</h1><p class="sub">${TERMS.length} terms, each linked to the chapter that teaches it.
Where the field uses a word inconsistently, the definition here says so.</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#gloss" placeholder="Filter terms…">
<div id="gloss">
${Object.entries(groups).map(([k, label]) => {
  const t = TERMS.filter(x => x[1] === k);
  if (!t.length) return '';
  return `<section class="part" data-group><div class="part-head"><h3>${label}</h3></div>
  ${C.table(['Term', 'Definition', 'Ch.'], t.map(([term, , def, ch]) =>
    [`<b data-search="${C.esc(term + ' ' + def)}">${term}</b>`, def,
     ch ? `<a href="/chapters/${ch}/">${ch.toUpperCase()}</a>` : '—']))}</section>`;
}).join('')}
</div></div></div>`});

  /* ========================================================= timeline ==== */
  const kindPill = { attack: 'attack', defense: 'defense', incident: 'warn', standard: 'trust', benchmark: 'boundary' };
  out['/timeline/'] = page({
    title: 'Timeline', path: '/timeline/',
    description: 'A dated timeline of agent security: attacks, defences, incidents, standards and benchmarks from 2022 to 2026.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Reference</span></div>
<h1>Timeline</h1><p class="sub">${EVENTS.length} landmarks, 2022 to 2026. Read top to bottom and one
pattern dominates: attacks arrive first and generalise, defences arrive second and specialise, and the
gap between a published defence and an adaptive attack that beats it is measured in months.</p></header>
<div class="prose-wide">
<input class="searchbox" data-filter="#tl" placeholder="Filter events…">
<div id="tl">
${C.table(['Date', 'Kind', 'Event', 'Ch.'], EVENTS.slice().sort((a, b) => a[0].localeCompare(b[0])).map(([d, k, t, desc, ch]) =>
  [`<span style="font-family:var(--font-mono);font-size:.8rem;white-space:nowrap">${d}</span>`,
   `<span class="pill ${kindPill[k]}">${k}</span>`,
   `<span data-search="${C.esc(d + ' ' + k + ' ' + t + ' ' + desc)}"><b>${t}</b><br><span style="color:var(--fg-muted)">${desc}</span></span>`,
   ch ? `<a href="/chapters/${ch}/">${ch.toUpperCase()}</a>` : '—']))}
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
    title: 'References', path: '/references/',
    description: 'The complete bibliography for the agent security course, credited to every author.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Credits</span></div>
<h1>References</h1><p class="sub">${sorted.length} distinct sources across ${byChapter.length} chapters.
This course is a synthesis; the work is theirs.</p></header>
<div class="prose-wide">
${C.callout('note', 'On credit', `<p>Every claim in this course traces to a paper, a disclosure or a
piece of production guidance written by someone else. Each chapter ends with its own reference list;
this page is the union of all of them, sorted by first author. Where a paper has a project page, the
link goes there rather than to arXiv, because the authors chose what to put on it.</p>
<p style="margin-bottom:0">The curriculum was assembled from four collections in particular, and if
you read only one thing after this course, make it one of these:
<a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">Awesome-Agent-Security</a> (UCSB
MLSec: Zhun Wang, Kaijie Zhu, Yuzhou Nie, Tianneng Shi, Juhee Kim, Zeyi Liao, Ruizhe Jiang, Wenbo Guo),
<a href="https://github.com/LLMSecurity/awesome-agent-skills-security">Awesome Agent Skills Security</a>,
<a href="https://github.com/VoltAgent/awesome-ai-agent-papers">Awesome AI Agent Papers</a> (VoltAgent),
and the SEI systematisation by Grimes and colleagues. Details on <a href="/sources/">the sources page</a>.</p>`)}
<input class="searchbox" data-filter="#refs" placeholder="Search ${sorted.length} references by author, title or venue…">
<div id="refs">
<ol class="reflist">
${sorted.map(r => `<li data-search="${C.esc((r.authors || '') + ' ' + r.title + ' ' + (r.venue || ''))}">
${r.authors ? `<span class="authors">${C.esc(r.authors)}</span>. ` : ''}
${r.url ? `<a href="${r.url}"><span class="ttl">${C.esc(r.title)}</span></a>` : `<span class="ttl">${C.esc(r.title)}</span>`}.
${r.venue ? `<span class="venue">${C.esc(r.venue)}</span>` : ''}
<span class="venue">· ${r.chapters.map(c => `<a href="/chapters/${c}/">${c.toUpperCase()}</a>`).join(' ')}</span>
</li>`).join('')}
</ol></div></div></div>`});

  /* ========================================================== sources ==== */
  out['/sources/'] = page({
    title: 'Source collections', path: '/sources/',
    description: 'The curated lists and papers this course was built from.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Credits</span></div>
<h1>Source collections</h1><p class="sub">What this course is a synthesis of, and who maintains each
piece of it.</p></header>
<article class="prose">
<p>This course does not contain original security research. It is a teaching path through four bodies
of work, plus the primary papers each of them points at. Where a chapter states a number — an attack
success rate, a marketplace study, a case-study count — that number belongs to the cited paper, and
the chapter says which one.</p>

${C.h2('The four collections', 'collections')}
${C.h3('Awesome-Agent-Security — UCSB MLSec', 'ucsb')}
<p>A structured taxonomy of agent security research organised as agentic systems and benchmarks,
red-teaming, and blue-teaming, with the blue-teaming branch subdivided into model-based defences and
system-level runtime defences. Its structure is the closest thing the field has to a shared map, and
Parts 2 through 5 of this course follow it closely — particularly the split between defences that act
on the model and defences that act on the system around it.</p>
<p>Maintained by Zhun Wang, Kaijie Zhu, Yuzhou Nie, Tianneng Shi, Juhee Kim, Zeyi Liao, Ruizhe Jiang
and Wenbo Guo. <a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">github.com/ucsb-mlsec/Awesome-Agent-Security</a></p>

${C.h3('Awesome Agent Skills Security — LLMSecurity', 'skills')}
<p>Focused on the layer this course covers in A11 and A13: tool use, agent skills, marketplaces and
the supply chain around them. It carries the threat frameworks and standards section (OWASP ASI,
MITRE ATLAS, NIST AI RMF, the IETF agent-authentication drafts) as well as the empirical
marketplace studies that make Chapter A13 possible.
<a href="https://github.com/LLMSecurity/awesome-agent-skills-security">github.com/LLMSecurity/awesome-agent-skills-security</a></p>

${C.h3('Awesome AI Agent Papers — VoltAgent', 'volt')}
<p>A continuously updated feed of agent papers with an 82-entry AI Agent Security section covering
2026 work: agentic payment protocols, GraphRAG extraction, MCP specification analysis, skill-marketplace
studies, and the current generation of runtime control planes. It is where the most recent material in
Parts 3 and 5 comes from.
<a href="https://github.com/VoltAgent/awesome-ai-agent-papers">github.com/VoltAgent/awesome-ai-agent-papers</a></p>

${C.h3('SoK: Bridging Research and Practice in LLM Agent Security', 'sok')}
<p>Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley,
Zhiwei Steven Wu and Nathan VanHoudnos, Carnegie Mellon University Software Engineering Institute,
November 2025. A systematic review of 64 academic studies, 109 industry sources and 36 real-world case
studies, producing a six-surface threat taxonomy, a thirty-three-category best-practice taxonomy, and
a measurement of which practices deployed systems actually use.</p>
<p>This paper supplies the skeleton of <a href="/threats/">the threat map</a> and
<a href="/defenses/">the defence map</a>, and its finding that case studies implement roughly a third
of recommended controls is the reason Part 6 exists.
<a href="https://doi.org/10.1184/R1/30610928">doi:10.1184/R1/30610928</a></p>

${C.h3('Securing AI Where It Executes — CrowdStrike', 'crowdstrike')}
<p>An industry white paper arguing that for desktop and coding agents the endpoint is the enforcement
point, because that is where agent-initiated process execution, file modification and network activity
actually happen. Chapter A26 uses its framing for runtime telemetry and the practical problem of
distinguishing an agent's actions from a human operator's; the vendor-specific product claims are the
publisher's and are not reproduced here as course material.</p>

${C.h2('Everything else', 'primary')}
<p>Roughly ${sorted.length} primary sources are cited directly across the chapters —
papers, CVEs, vendor disclosures, standards drafts and blog posts by the researchers who found the
bugs. They are listed in full, sorted by author, on <a href="/references/">the references page</a>,
and again at the foot of each chapter that uses them.</p>

${C.callout('warn', 'Corrections', `<p style="margin-bottom:0">If this course misstates your work,
misattributes it, or cites a superseded version, please
<a href="${SITE.repo}/issues">open an issue</a>. Credit and accuracy are the point of the reference
lists; getting them wrong is a bug of the same severity as broken code.</p>`)}
</article></div>`});

  /* ============================================================ setup ==== */
  out['/setup/'] = page({
    title: 'Local setup', path: '/setup/',
    description: 'How to run the course code locally. Python 3.9+, standard library only.',
    body: `<div class="wrap">
<header class="chap-head"><div class="chap-kicker"><span class="chap-part">Reference</span></div>
<h1>Local setup</h1><p class="sub">Python 3.9 or newer. No packages, no API key, no GPU, no network.</p></header>
<article class="prose">
<p>Every chapter has one self-contained file in <code>code/</code>. Each runs on the standard library
alone, finishes in under two seconds, and ends with assertions that verify the claims made in the
chapter text. If a file runs clean, the chapter's claims held on your machine.</p>

${C.code(`git clone ${SITE.repo}.git
cd learn-agent-security-from-scratch
python3 code/a01_agent_loop.py       # one chapter
python3 code/run_all.py              # every chapter, with a summary`, { lang: 'sh', file: 'terminal' })}

${C.h2('Why there is no model call', 'no-model')}
<p>The course ships a deterministic stub model in <code>code/agentlib.py</code>: a small,
rule-driven function that behaves like an instruction-following LLM in exactly the ways that matter
for security. It follows the most recent imperative sentence it can find, regardless of which part of
the context that sentence came from.</p>
<p>That is a caricature of a real model, and deliberately so. Real models are stochastic, so an attack
that works nineteen times in twenty makes for a confusing lesson; and running the course against a
paid API would make it cost money to learn. The stub makes every attack in the course reproducible,
free, and offline. It also makes the central point honestly: the vulnerability is architectural, and
survives any amount of model improvement, because it lives in the shape of the context rather than in
the quality of the reasoning.</p>

${C.callout('note', 'Running against a real model', `<p style="margin-bottom:0">Every file takes an
optional <code>--live</code> flag. Set <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code>
and install the matching SDK, and <code>agentlib.py</code> will route through it instead of the stub.
Expect the attacks to succeed less reliably and the defences to behave the same way — which is itself
the lesson of <a href="/chapters/a19/">A19</a>.</p>`)}

${C.h2('Safety', 'safety')}
<p>Nothing in this repository attacks anything but itself. Tool implementations are in-memory fakes:
the "web fetch" reads from a fixture dictionary, the "send email" appends to a list, the "shell"
records a string and refuses to execute it. The exfiltration chapters build a receiver that logs to
stdout. You can run every file on a work laptop without a network connection.</p>
<p>The projects ask you to build attack payloads. Build them against your own lab agent. Landing them
against a system you do not own or have written authorisation to test is a crime in most
jurisdictions, and the interesting part of the exercise — the part that teaches you something — is the
defence you write afterwards.</p>

${C.h2('Building the site', 'site')}
${C.code(`node build.mjs           # → dist/
node build.mjs --serve   # → dist/ and http://localhost:8080`, { lang: 'sh', file: 'terminal' })}
<p>No dependencies, Node 18 or newer. Chapters live in <code>site/content/chapters/*.mjs</code> as
plain ES modules exporting <code>meta</code>, <code>body</code>, <code>quiz</code> and
<code>refs</code>.</p>
</article></div>`});

  return out;
}
