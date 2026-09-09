import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 16, attacks: 'from taxonomy to decision' };
export const scripts = ['/assets/js/sims/a27.js'];

export const body = `
${p(`The last chapter. You have a threat map, a defence stack, and an evaluation. This one is about the
process that keeps them connected to each other, and about the uncomfortable finding that most deployed
systems do not have it.`)}

${h2('A risk assessment you can repeat', 'assessment')}

${p(`The SEI review demonstrates a four-step process, and its value is not the plan it produces — it is
the gap it exposes.`)}

${steps([
  ['Pick a threat from the taxonomy', `Not from your imagination. Walking the list is what surfaces
    the categories you would not have thought of (<a href="/chapters/a04/">A04</a>).`],
  ['Identify the vulnerable components', `Trace it onto your reference architecture. Which parts of
    your system does this threat touch?`],
  ['Map components to control categories', `Look up which best-practice categories apply to those
    components (<a href="/defenses/">the defence map</a>).`],
  ['Read the gap', `Which of those categories are thinly covered in the literature? Those are the
    mitigations you will have to design yourself, and the ones your peers have probably also skipped.`],
])}

${sim({
  name: 'a27risk',
  title: 'Two worked risk assessments',
  controls: select('a27-threat', 'Threat', [
    ['kb', 'Knowledge-base attack (memory / RAG poisoning)'],
    ['dos', 'Denial of service / denial of wallet'],
  ], 'kb'),
  body: out('a27-out'),
  note: `The GAP line is the point of the exercise. For memory poisoning it says that memory and
    privacy controls were among the least-cited categories in the literature despite being a heavily
    cited vulnerability. There is no off-the-shelf guidance, so you are designing it yourself.`,
})}

${h2('Phased deployment with real gates', 'phases')}

${table(
  ['Phase', 'Scope', 'Exit criteria', 'Rollback'],
  [
    ['<b>0 · shadow</b>', 'Real inputs; all actions blocked and logged',
     '100% of proposed actions reviewed; no unexplained denials over two weeks', 'Turn it off; nothing happened'],
    ['<b>1 · pilot</b>', 'Five volunteers; reversible actions only',
     'ASR &lt; 5% on the internal suite; no irreversible action reached production; cost within 2× of estimate',
     'Revoke the agent token; revert writes from snapshots'],
    ['<b>2 · limited</b>', 'One team; irreversible actions gated by a human',
     'Approval override rate &lt; 10%; median approval latency &lt; 60s; no incident in 30 days',
     'Disable the offending tool; token revocation in under a minute'],
    ['<b>3 · general</b>', 'All users; pre-authorised scopes',
     'Continual auditing green for 60 days; adaptive red-team re-run passed',
     'Feature flag off, org-wide, without a deploy'],
  ]
)}

${callout('warn', 'The line to argue about in review', `<p style="margin-bottom:0">"Feature flag off,
org-wide, without a deploy." That is a requirement on your <em>architecture</em>, not a paragraph in a
runbook. If you cannot say it today, phase 3 is not available to you yet, and discovering that during
an incident is considerably more expensive than discovering it now.</p>`)}

${h2('Incident response for agent-specific failures', 'incident')}

${p(`Most of a conventional playbook transfers. The starred steps below do not appear in one, and they
are where agent incidents differ:`)}

${table(
  ['Phase', 'Step', ''],
  [
    ['DETECT', 'Policy denial spike, cost anomaly, user report, drift alert', ''],
    ['CONTAIN', 'Revoke the <b>agent\'s</b> tokens, not the user\'s', '★'],
    ['CONTAIN', 'Disable the specific tool; keep the agent running if that is safe', '★'],
    ['ASSESS', 'Replay the trajectory: what was in context when it turned?', '★'],
    ['ASSESS', '<b>Identify the poisoned source, not just the affected run</b>', '★'],
    ['ERADICATE', 'Purge derived memory entries by provenance', '★'],
    ['ERADICATE', 'Clean the corpus; notify the source owner if external', '★'],
    ['ERADICATE', 'Re-check every <em>other</em> run that retrieved the same document', '★'],
    ['RECOVER', 'Restore from snapshots; re-run affected tasks under the fix', ''],
    ['LEARN', 'Add the payload to the regression suite', '★'],
    ['LEARN', 'Ask which control class would have <b>bounded</b> it, not detected it', '★'],
  ]
)}

${p(`Two of those deserve emphasis. <b>Identify the poisoned source</b>, because a corpus attack has
already fired for every other user who retrieved that document, and your incident is one of N. And
<b>purge derived memory by provenance</b>. That is only possible if you recorded provenance before
the incident. Incident response is a design-time decision.`)}

${h2('The adoption gap', 'adoption')}

${p(`The SEI review categorised the controls described in 36 real-world agent case studies against its
33-category taxonomy. That distribution is worth sitting with.`)}

${table(
  ['Well represented', 'Barely represented', 'Absent'],
  [
    ['Access controls (17/36)', 'Prompt engineering (2)', 'Legal considerations (0)'],
    ['Monitoring (10), guardrails (10)', 'Adversarial training (1)', 'Multi-agent design (0)'],
    ['Human-in-the-loop (10), sandboxing (10)', 'Defence in depth (2)', 'Training data management (0)'],
    ['Encryption (10)', 'Rate limiting (2)', ''],
  ]
)}

${p(`Over 60% of the case studies described fewer than five of the 33 categories. There are two honest
readings and both are true. Organisations disclose less than they do, because the AI components are
intellectual property and secrecy is rational, which the review names as its eighth takeaway. And the
distribution is itself informative: the widely-implemented controls are the ones that are ordinary
software security, while the agent-specific ones are thin on the ground.`)}

${callout('boundary', 'The uncomfortable conclusion', `<p style="margin-bottom:0">If you implement the
full defence stack from Part 5, you will be doing more than most of the systems in that survey. That
should worry you more than it reassures you. It means the current baseline is low, and that "industry
standard" is not a useful target.</p>`)}

${h2('The three recommendations the review closes on', 'recommendations')}

${kv([
  ['Increase academia–industry collaboration', `The two literatures have complementary blind spots
    (<a href="/chapters/a04/">A04</a>). Threat-intelligence sharing is aimed at organisations and
    largely excludes researchers; anonymised real-world usage data would close a gap that neither side
    can close alone.`],
  ['Develop agent-specific controls', `Much of the current taxonomy is inherited from LLM security or
    from ordinary software security. Only two sources in the review cited the control-flow techniques
    that offer actual guarantees against injection — the CaMeL line from
    <a href="/chapters/a21/">A21</a>. That is where the leverage is.`],
  ['Expand and systematise risk assessment', `Repeatable processes, not one-off exercises. The
    framework in this chapter is a first step and is deliberately simple enough to run in an afternoon.`],
])}

${h2('Where to go next', 'next')}

${ul([
  `<a href="/capstone/">The capstone</a>, where you build the whole thing, attack it, defend it and
   measure it.`,
  `<a href="/references/">The references</a>, 180-odd primary sources sorted by author.`,
  `<a href="/threats/">The threat map</a> and <a href="/defenses/">the defence map</a> as working
   checklists rather than reading.`,
  `And then the field itself: this course will be out of date, and the
   <a href="/sources/">source collections</a> are maintained.`,
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Run a repeatable risk assessment from taxonomy to mitigation plan, and read the gap.`,
  `Write phase gates with exit criteria and rollback paths you could actually execute.`,
  `Name the agent-specific steps in an incident playbook and what each one presupposes.`,
  `Explain why "industry standard" is a low bar in this field, with the numbers.`,
])}
`;

export const quiz = [
  {
    q: `In the four-step risk assessment, which step produces the most valuable output?`,
    options: [
      `Identifying the vulnerable components.`,
      `Reading the gap: which control categories are thinly covered in the literature, and therefore which mitigations you must design yourself.`,
      `Picking the threat.`,
      `Mapping components to controls.`,
    ],
    answer: 1,
    explain: `The first three steps produce a mitigation plan, which is useful and largely
      mechanical. Reading the gap tells you something you could not have learned any other way: that for
      memory poisoning, for instance, the memory-controls and privacy-controls categories are among
      the least-cited in the literature <em>despite</em> the vulnerability being heavily cited. That
      mismatch means no off-the-shelf guidance exists, so budget for design work. Your peers have
      probably skipped it too.`,
  },
  {
    q: `Why is "feature flag off, org-wide, without a deploy" described as an architectural requirement
        rather than a runbook line?`,
    options: [
      `Because runbooks are not maintained.`,
      `Because the ability to disable an agent everywhere in under a minute has to be built in advance; you cannot add it during an incident.`,
      `Because feature flags require a specific vendor.`,
      `Because deploys are slow.`,
    ],
    answer: 1,
    explain: `A kill switch that requires a deploy is a kill switch measured in hours, and incidents
      are measured in minutes. Being able to make the claim depends on decisions made long before —
      a runtime flag, a revocable credential, a proxy you can flip. Phase 3 of the rollout should be
      gated on it precisely because discovering the gap during an incident is the expensive way to
      learn it.`,
  },
  {
    q: `An agent incident is traced to a poisoned document in a shared corpus. Which containment step
        is most commonly missed?`,
    options: [
      `Revoking the user's credentials.`,
      `Re-checking every <em>other</em> run that retrieved the same document, since your incident is one firing of a standing attack.`,
      `Restarting the agent service.`,
      `Rotating the model API key.`,
    ],
    answer: 1,
    explain: `A corpus attack fires on every retrieval, so by the time you notice one incident it has
      probably run for other users. Treating it as a single-run incident closes the ticket while the
      attack is still live. Note also the first option is actively wrong: you revoke the <em>agent's</em>
      token, not the user's. The user did nothing, and disabling them is both unhelpful and a good way
      to lose their cooperation.`,
  },
  {
    q: `Why is purging poisoned memory entries by provenance a design-time decision rather than an
        incident-time one?`,
    options: [
      `Because purging requires database downtime.`,
      `Because you can only filter by provenance if you recorded provenance on every write, before the incident happened.`,
      `Because memory stores are immutable.`,
      `Because legal approval is needed first.`,
    ],
    answer: 1,
    explain: `At incident time you have whatever fields you recorded. Without a provenance field the
      choices are to purge everything (destroying legitimate user preferences and eroding trust in
      the system) or to review entries by hand, which does not scale. A12's four-line provenance
      filter is what makes targeted remediation possible, and the same field powers A21's policy and
      A26's drift detection.`,
  },
  {
    q: `Over 60% of surveyed case studies described fewer than five of 33 control categories. What are
        the two honest readings?`,
    options: [
      `The survey methodology was flawed, and the sample was small.`,
      `Organisations disclose less than they implement because AI components are intellectual property; <em>and</em> the distribution shows agent-specific controls are genuinely thin on the ground.`,
      `Most organisations are negligent.`,
      `The taxonomy is too granular to be applied.`,
    ],
    answer: 1,
    explain: `Both are true and the review says so. The secrecy reading is supported by which
      categories are missing — prompt engineering, multi-agent design, training data — precisely the
      ones that are competitively sensitive. The substantive reading is supported by which are present:
      access control, encryption, sandboxing, logging, all of them ordinary software security. In
      practice that means "industry standard" is not a useful target here.`,
  },
  {
    q: `The review notes that only two sources cited control-flow techniques offering guarantees
        against injection. Why does that matter for where to invest?`,
    options: [
      `It means those techniques do not work.`,
      `It means the approaches with the strongest properties are the least represented in current practice, so that is where the leverage is.`,
      `It means the review's search was incomplete.`,
      `It means the techniques are too new to evaluate.`,
    ],
    answer: 1,
    explain: `The CaMeL line and related information-flow work are the only approaches in the
      literature that bound injection damage by construction rather than reducing its probability, and
      almost nobody is citing or implementing them. That is an unusual position: a well-understood
      technique with a strong property and near-zero adoption. For a team choosing where to spend
      effort it is the highest-leverage item on the map, and it is why A20 and A21 sit at the centre of
      this course.`,
  },
];

export const refs = [
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, November 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'the risk-assessment process, the case-study adoption analysis, and the three closing recommendations' },
  { authors: 'Yonadav Shavit, Sandhini Agarwal, Miles Brundage, Steven Adler, Cullen O\'Keefe, Rosie Campbell, Teddy Lee, Pamela Mishkin, Tyna Eloundou, Alan Hickey, Katarina Slama, Lama Ahmad, Paul McMillan, Alex Beutel, Alexandre Passos, David G. Robinson',
    title: 'Practices for Governing Agentic AI Systems', venue: 'OpenAI, 2023',
    url: 'https://openai.com/index/practices-for-governing-agentic-ai-systems/' },
  { authors: 'National Institute of Standards and Technology', title: 'AI Risk Management Framework (AI RMF 1.0)',
    venue: 'NIST, 2023', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { authors: 'Anthropic', title: 'Anthropic\'s Responsible Scaling Policy', venue: 'Anthropic',
    url: 'https://www.anthropic.com/news/anthropics-responsible-scaling-policy' },
  { authors: 'Shishir G. Patil, Tianjun Zhang, Vivian Fang, Roy Huang, Aaron Hao, Martin Casado, Joseph E. Gonzalez, Raluca Ada Popa, Ion Stoica',
    title: 'GoEX: Perspectives and Designs Towards a Runtime for Autonomous LLM Applications',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2404.06921' },
  { authors: 'Lewis Hammond, Alan Chan, Jesse Clifton, Jason Hoelscher-Obermaier, Akbir Khan, Euan McLean and colleagues',
    title: 'Multi-Agent Risks from Advanced AI', venue: 'Cooperative AI Foundation, 2025',
    url: 'https://arxiv.org/abs/2502.14143' },
  { authors: 'European Union', title: 'EU Artificial Intelligence Act', venue: 'Regulation (EU) 2024/1689',
    url: 'https://artificialintelligenceact.eu/' },
  { authors: 'Authors of "Delegation Without Living Governance"', title: 'Delegation Without Living Governance',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.21226' },
  { authors: 'Authors of "Toward Safe and Responsible AI Agents"',
    title: 'Toward Safe and Responsible AI Agents: A Three-Pillar Model for Transparency, Accountability, and Trustworthiness',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.06223' },
];
