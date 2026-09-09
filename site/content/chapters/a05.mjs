import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, range, select, toggle, button, out, pill } from '../../lib/components.mjs';

export const meta = { time: 15, attacks: 'five lenses, one system' };
export const scripts = ['/assets/js/sims/a05.js'];

const maestro = svg(700, 340, `
${svgText(12, 18, 'MAESTRO — SEVEN LAYERS, AND WHO OWNS EACH', 'd-ttl', 'start')}
${box(30, 40, 470, 34, 'L7  Agent ecosystem', 'marketplaces, agent-to-agent, other people\'s agents', 'd-attack')}
${box(30, 82, 470, 34, 'L6  Security and compliance', 'guardrails, policy, audit', 'd-def')}
${box(30, 124, 470, 34, 'L5  Evaluation and observability', 'benchmarks, tracing, drift', 'd-def')}
${box(30, 166, 470, 34, 'L4  Deployment and infrastructure', 'containers, secrets, network', 'd-box')}
${box(30, 208, 470, 34, 'L3  Agent frameworks', 'orchestration, tool calling, parsing', 'd-box')}
${box(30, 250, 470, 34, 'L2  Data operations', 'RAG, memory, vector stores', 'd-attack')}
${box(30, 292, 470, 34, 'L1  Foundation model', 'weights, alignment, training data', 'd-sunk')}
${svgText(520, 60, 'you inherit', 'd-sub', 'start')}
${svgText(520, 100, 'you build', 'd-def-t', 'start')}
${svgText(520, 186, 'you build', 'd-sub', 'start')}
${svgText(520, 270, 'you build', 'd-attack-t', 'start')}
${svgText(520, 312, 'you inherit', 'd-sub', 'start')}
<line x1="510" y1="46" x2="510" y2="320" stroke="var(--border-strong)" stroke-dasharray="3 3"/>
${svgText(628, 160, 'Cross-layer threats', 'd-attack-t')}
${svgText(628, 176, 'are the ones', 'd-attack-t')}
${svgText(628, 192, 'nobody owns.', 'd-attack-t')}
`, { label: 'The seven MAESTRO layers with ownership marked' });

export const body = `
${p(`Five frameworks, all reasonable, all in use. The question is not which one is best — it is which
one you should run on a Tuesday afternoon when you have ninety minutes and an agent going to
production on Friday. This chapter runs all five against the same system so you can see what each one
finds that the others do not.`)}

${h2('The target', 'target')}

${code(`TARGET: "Scout" — a research agent for a consultancy.

  tools     web_search, web_fetch, read_drive (the user's Google Drive),
            write_doc (creates a Drive doc), send_slack (posts to a channel)
  identity  runs as the requesting user via OAuth; tokens cached 30 days
  model     hosted API, no fine-tuning
  memory    per-user vector store of past research, written automatically
  deploy    a Slack bot; any employee can @mention it`, { lang: 'txt', file: 'the system under review' })}

${p(`This is a deliberately ordinary system. Nothing about it is negligent, and versions of it are
running inside a great many companies today.`)}

${h2('Run the five', 'lab')}

${sim({
  name: 'a05frameworks',
  title: 'Five frameworks against one agent',
  controls: select('a05-fw', 'Framework', [
    ['stride', 'STRIDE — general software, 1999'],
    ['owasp', 'OWASP Top 10 for LLM Applications'],
    ['maestro', 'MAESTRO — agent-specific, 7 layers'],
    ['atlas', 'MITRE ATLAS — adversary techniques'],
    ['nist', 'NIST AI RMF — organisational'],
    ['unique', 'What each one found alone'],
  ], 'stride'),
  body: out('a05-out'),
  note: `Switch to the last view once you have read the others. The interesting output of a
    multi-framework exercise is the set difference, not the union.`,
})}

${h2('What each one is for', 'purposes')}

${table(
  ['Framework', 'Asks', 'Best at', 'Weak at'],
  [
    ['<b>STRIDE</b>', 'What properties of this system can an attacker violate?',
     'Fast, systems-level, catches repudiation and spoofing that AI frameworks omit entirely.',
     'Says nothing about model-specific failure. You will not find "backdoor" with STRIDE.'],
    ['<b>OWASP LLM Top 10</b>', 'Which of the known LLM failure modes apply?',
     'The best checklist to hand a developer. Concrete, well-documented, widely understood.',
     'A list, not a method. It will not find a threat that is not on the list.'],
    ['<b>MAESTRO</b>', 'What goes wrong at each of seven agent layers, and across them?',
     'The only one that asks about the agent ecosystem layer, where undeclared agent-to-agent edges live.',
     'Newest and least battle-tested; the layers can encourage siloed thinking if you stop at the rows.'],
    ['<b>MITRE ATLAS</b>', 'What would a real adversary do, in shared vocabulary?',
     'Naming things so other teams can search for them and so detections can be mapped to techniques.',
     'Descriptive, not generative. Better for organising findings than for producing them.'],
    ['<b>NIST AI RMF</b>', 'Does the organisation around this system function?',
     'The questions that matter at 3am: who signs off, who can turn it off, how fast.',
     'Not a threat model. Produces no technical findings on its own.'],
  ]
)}

${figure(maestro, `<b>MAESTRO's layers, and the ownership line.</b> You inherit L1 and much of L7 and
can only manage the risk; you build L2 through L6 and can fix it. The threats that hurt most are the
ones that cross the line — a hosted model's jailbreak (L1) reached through your unvalidated RAG (L2)
and executed by your tool layer (L3) — because no single team owns the path.`)}

${h2('The finding that only one framework produced', 'unique-findings')}

${p(`Running all five on Scout, each framework contributed at least one finding no other did:`)}

${kv([
  ['STRIDE → repudiation', `No immutable trace links a Drive write to the request that caused it. No
    AI-specific framework asks this, because "could you reconstruct who caused what" is a
    forty-year-old software question and the AI frameworks assume you already answered it. You have
    not.`],
  ['OWASP → LLM08 vector weaknesses', `The embedding store is an access-control object, not just a
    data store. Scout's per-user vector store is queryable across projects because nobody scoped it.`],
  ['MAESTRO → L7 ecosystem', `Scout posts to Slack. Another bot in that workspace reads Slack. Nobody
    drew that edge on any diagram, and it is a complete trifecta assembled from two components that
    each pass the test alone.`],
  ['ATLAS → adversarial data crafted against your classifier', `Not "an attacker sends a bad prompt"
    but "an attacker optimises a page against the specific guardrail you deployed". The adaptive
    setting of <a href="/chapters/a19/">A19</a>, which the other frameworks describe as a generic
    threat rather than a distinct technique.`],
  ['NIST → who can turn it off, and how fast', `Not a threat. A control question, and the one that
    determines whether an incident is an hour or a week.`],
])}

${h2('A recommendation, since you asked', 'recommendation')}

${steps([
  ['Run STRIDE first, and run it on the system, not the AI',
   `Thirty minutes. It is old, fast, and catches the boring findings that cause most real damage:
    unauthenticated callers, missing audit trail, credentials with the wrong lifetime. Doing this
    first also stops the AI-specific work from absorbing all the attention.`],
  ['Then MAESTRO for the layers STRIDE has no vocabulary for',
   `Another hour. Walk the seven layers, and spend most of it on L2 (data operations) and L7
    (ecosystem), which are where agent-specific novelty actually lives.`],
  ['Name the findings in ATLAS vocabulary',
   `Fifteen minutes, and it pays off later: detections map to technique IDs, other teams can search
    for what you found, and a year from now you can tell whether the same thing recurred.`],
  ['Hand the developer the OWASP list',
   `It is the artefact most likely to be read. Keep it as the pre-merge checklist rather than the
    threat model.`],
  ['Use NIST when someone is going to audit you',
   `And notice that its questions are the ones you cannot answer under pressure if you have not
    written them down beforehand.`],
])}

${callout('warn', 'The failure mode of framework enthusiasm', `<p style="margin-bottom:0">Running all
five badly is worse than running one properly. A threat model's value is in the findings you act on,
and five parallel documents with overlapping findings and no owner produce nothing. Pick one primary
lens, run it thoroughly, use the others to spot-check for the categories you know that lens is blind
to — the "weak at" column above is the list of what to spot-check.</p>`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Run STRIDE against an agent in thirty minutes and produce findings you would act on.`,
  `Name the seven MAESTRO layers and say which two you do not control.`,
  `Explain what each framework is blind to, and why.`,
  `Choose a lens for a given situation and defend the choice, including the choice not to run the others.`,
])}
`;

export const quiz = [
  {
    q: `Which finding is STRIDE most likely to produce that none of the AI-specific frameworks will?`,
    options: [
      `Prompt injection via retrieved web content.`,
      `Repudiation — the absence of an audit trail linking an action to the request that caused it.`,
      `Excessive agency in the tool permission set.`,
      `Vector store access control weaknesses.`,
    ],
    answer: 1,
    explain: `Repudiation is a STRIDE category with no counterpart in the LLM-focused frameworks,
      which tend to assume you have already solved ordinary software concerns. You almost certainly
      have not: most agent deployments cannot answer "which request caused this file to be written"
      six weeks later, and that gap turns a two-hour incident investigation into a two-week one.
      Injection, excessive agency and vector-store scoping all appear in OWASP or MAESTRO; the boring
      forensic question does not.`,
  },
  {
    q: `Scout posts summaries to a Slack channel. A separate scheduling bot reads that channel and can
        create calendar events. Which framework's structure is most likely to surface this?`,
    options: [
      `OWASP LLM Top 10, under LLM06 excessive agency.`,
      `MAESTRO, at layer 7 (agent ecosystem).`,
      `STRIDE, under elevation of privilege.`,
      `NIST AI RMF, under MAP.`,
    ],
    answer: 1,
    explain: `MAESTRO is the only one of the five with an explicit layer for the agent ecosystem —
      other agents, marketplaces, and the edges between systems that no single team drew. That edge is
      also a complete trifecta assembled from two components that individually pass the test, which is
      the A03 composition failure. NIST's MAP function would ask for an inventory and might catch it
      indirectly, but only if whoever built the inventory happened to think of the other bot.`,
  },
  {
    q: `A team runs all five frameworks in parallel across five documents with no single owner. What
        is the most likely outcome?`,
    options: [
      `Comprehensive coverage, since the frameworks complement each other.`,
      `Overlapping, unprioritised findings that nobody acts on.`,
      `Findings that contradict each other and must be reconciled.`,
      `A model that is too granular for engineers to use.`,
    ],
    answer: 1,
    explain: `The frameworks mostly agree, so five parallel passes produce five overlapping documents
      and one under-resourced remediation backlog. A threat model is worth exactly the findings that
      get fixed. One lens run properly, with an owner and a ranked register, beats five run
      superficially — use the others as a spot-check against the specific blind spots you know your
      primary lens has.`,
  },
  {
    q: `Which MAESTRO layers can you not fix for a hosted model, and what follows from that?`,
    options: [
      `L1 foundation model and much of L7 ecosystem; the risk must be managed by controls at other layers rather than eliminated.`,
      `L3 agent frameworks and L4 infrastructure; you must self-host.`,
      `L5 evaluation and L6 security; these are the vendor's responsibility.`,
      `None; every layer is under your control.`,
    ],
    answer: 0,
    explain: `You inherit the hosted model's alignment, its jailbreaks and its training data (L1),
      and you inherit the behaviour of other people's agents and marketplaces (L7). Neither can be
      patched by you. What follows is that your controls at L2 through L6 must be designed on the
      assumption that L1 will fail — which is the same conclusion A02 reached from a different
      direction, and the reason "bounds damage" controls matter more than "raises cost" ones.`,
  },
  {
    q: `What is MITRE ATLAS best used for in this workflow?`,
    options: [
      `Generating the initial list of threats, because it is the most complete.`,
      `Naming findings in shared vocabulary so detections can be mapped and recurrence can be tracked.`,
      `Assessing organisational readiness.`,
      `Providing a developer-facing checklist.`,
    ],
    answer: 1,
    explain: `ATLAS is descriptive — a catalogue of observed adversary techniques with IDs — rather
      than generative. It is not the tool that makes you think of a threat, but it is the tool that
      makes your threat legible to a detection engineer, comparable to what another team found, and
      searchable in a year. Generation is STRIDE's and MAESTRO's job; the checklist is OWASP's;
      readiness is NIST's.`,
  },
  {
    q: `Scout caches OAuth tokens for 30 days. Under STRIDE, which category does this fall under, and
        why does it matter more for an agent than for a normal application?`,
    options: [
      `Information disclosure; tokens might be logged.`,
      `Elevation of privilege; the agent's authority outlives the user's session, so a compromise at any point in 30 days acts as a currently-absent user.`,
      `Tampering; the token could be modified.`,
      `Denial of service; expired tokens cause failures.`,
    ],
    answer: 1,
    explain: `A long-lived cached token means the agent can act as the user at a time when the user
      is not present, has not consented to anything, and would not notice. In a normal application a
      session token is bounded by a person sitting at a screen; in an agent it is a standing authority
      that an injected instruction can exercise at 3am on a Sunday. This is why A22 argues for
      short-lived, per-task, scope-attenuated credentials rather than reusing the user's session
      token at all.`,
  },
];

export const refs = [
  { authors: 'Loren Kohnfelder, Praerit Garg', title: 'The threats to our products (STRIDE)',
    venue: 'Microsoft, 1999', url: 'https://adam.shostack.org/microsoft/The-Threats-To-Our-Products.docx',
    note: 'the original memo; still the fastest useful threat model in existence' },
  { authors: 'Adam Shostack', title: 'Threat Modeling: Designing for Security', venue: 'Wiley, 2014',
    url: 'https://shostack.org/books/threat-modeling-book' },
  { authors: 'Ken Huang and the Cloud Security Alliance AI Safety Initiative',
    title: 'Agentic AI Threat Modeling Framework: MAESTRO', venue: 'Cloud Security Alliance, 2025',
    url: 'https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro' },
  { authors: 'OWASP Top 10 for LLM Applications team (Steve Wilson, Ads Dawson and contributors)',
    title: 'OWASP Top 10 for Large Language Model Applications', venue: 'OWASP, 2025',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
  { authors: 'OWASP Agentic Security Initiative', title: 'Agentic AI — Threats and Mitigations',
    venue: 'OWASP GenAI Security Project, 2025',
    url: 'https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/' },
  { authors: 'MITRE ATLAS team', title: 'MITRE ATLAS: Adversarial Threat Landscape for Artificial-Intelligence Systems',
    venue: 'MITRE', url: 'https://atlas.mitre.org/' },
  { authors: 'National Institute of Standards and Technology',
    title: 'AI Risk Management Framework (AI RMF 1.0)', venue: 'NIST, 2023',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { authors: 'National Institute of Standards and Technology',
    title: 'SP 800-218A: Secure Software Development Practices for Generative AI and Dual-Use Foundation Models',
    venue: 'NIST, 2024', url: 'https://csrc.nist.gov/pubs/sp/800/218/a/final' },
  { authors: 'Vineeth Sai Narajala and colleagues',
    title: 'Securing Agentic AI: A Comprehensive Threat Model and Mitigation Framework for Generative AI Agents',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2504.19956' },
];
