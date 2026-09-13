import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 16, attacks: 'from taxonomy to decision' };
export const scripts = ['/assets/js/sims/a27.js'];

export const body = `
${p(`A threat map, defence stack, and evaluation need an operating process that keeps them current and
connected. This chapter covers that process and the gaps identified in deployed systems.`)}

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

/* Exercises. Hands-on tasks for after the chapter; model answers live on
   /answers/ and are matched to these by position. */
export const exercises = [
  {
    q: `Make the phase gates in <code>code/a27_governance.py</code> executable. Write a
        <code>gate(phase, metrics)</code> function that returns two lists — the exit criteria your
        measured numbers fail, and the criteria nothing in your system currently measures — and run it
        over all four phases with the attack-success and utility numbers from your
        <a href="/chapters/a25/">A25</a> suite. You are done when you can name, for every unmeasured
        criterion, the instrument that would produce it.`,
    a: `The unmeasured list is longer than the failed list, and that is the finding. "ASR &lt; 5%",
        "cost within 2x" and "override rate &lt; 10%" all map to a number you can produce today; "100%
        of proposed actions reviewed", "0 unexplained policy denials over 2 weeks" and "continual
        auditing green for 60 days" map to nothing at all unless you built A26's denial log and are
        running the suite on a schedule. Roughly half the criteria in the table are unmeasurable on day
        one, which means a gate review would be conducted on assertion rather than evidence. The fix is
        not to soften the criteria — it is to notice that a phase gate is a specification for
        instrumentation, and that the instrumentation has a lead time. Do the same pass on the rollback
        column: "token revocation in under 60s" is a claim you can test with a stopwatch this afternoon,
        and most teams discover it is false.`,
    code: `# add to code/a27_governance.py
def gate(phase, metrics):
    checks = {
        "ASR < 5% on the internal suite":      lambda m: m["asr"] < 0.05,
        "cost per task within 2x of estimate": lambda m: m["cost_ratio"] <= 2.0,
        "approval override rate < 10%":        lambda m: m["override_rate"] < 0.10,
        "median approval latency < 60s":       lambda m: m["latency_s"] < 60,
        "no incident in 30 days":              lambda m: m["days_clean"] >= 30,
    }
    unmet, unmeasured = [], []
    for c in phase.exit_criteria:
        check = checks.get(c)
        if check is None:
            unmeasured.append(c)
        elif not check(metrics):
            unmet.append(c)
    return unmet, unmeasured

MEASURED = {"asr": 0.25, "cost_ratio": 1.4, "override_rate": 0.18,
            "latency_s": 45, "days_clean": 12}
for p in PHASES:
    unmet, unmeasured = gate(p, MEASURED)
    print("PHASE %-11s failed=%d  no instrument=%d" % (p.name, len(unmet), len(unmeasured)))
    for c in unmeasured:
        print("     cannot evaluate:", c)`,
  },
  {
    q: `Write the one-page deployment decision memo that would move the toy agent from phase 1 to phase
        2, and a severity rubric of four levels defined by what the agent can reach rather than by how
        loud the alert was. You are done when every severity level names an irreversible action or data
        class and a maximum time to containment, and when a colleague who was not involved can read the
        memo and state what would block promotion.`,
    a: `The memo is short and has five parts: the attack-success and utility pair on the same run with
        the case list attached, the paragraph saying what the evaluation does not cover, the phase-2
        exit criteria with the instrument for each, the rollback line with the name of the person who
        can execute it and the measured time it takes, and the residual risks you are accepting with the
        reason. Anything longer is not read. For the rubric, anchoring on reach rather than on alert
        volume is what makes it usable at three in the morning: S1 is an irreversible external action or
        credential exposure, contain in fifteen minutes; S2 is an unauthorised read of regulated data or
        a write to a shared corpus, one hour; S3 is a policy denial spike or drift alert with no
        completed action, one working day; S4 is a single anomalous run, next sprint. Note what the
        rubric quietly requires — you cannot classify by reach unless you know which tools were bound to
        the run and which of them are irreversible, so the rubric is another consumer of
        <a href="/chapters/a22/">A22</a>'s identity work. Write the residual-risk section last and do
        not sand it down; a memo with no accepted risks is a memo nobody believes.`,
  },
  {
    q: `Run a 45-minute tabletop on a poisoned shared corpus using the playbook in
        <code>code/a27_governance.py</code>, keeping a written timeline with wall-clock times. Mark each
        of the eleven steps "we could do this today" or "we could not", and for every "could not" name
        the design-time decision that would fix it. You are done when you have answered, with a query
        rather than a guess, which other runs retrieved the poisoned document.`,
    a: `Most teams stall at the same three steps. Revoking the agent's token rather than the user's
        needs a separate agent credential, which many deployments do not have. Purging derived memory by
        provenance needs a provenance field written at ingestion time, months earlier. And the blast
        radius query needs a document identifier and a timestamp on every retrieval, plus a corpus
        version history to say when the poison landed — without the second half you can list who
        retrieved the document but not who retrieved the poisoned version, so the honest answer is a
        superset and the notification is louder than it needs to be. Write the timeline in wall-clock
        minutes, not as a checklist, because that is what exposes the serial dependencies: you cannot
        purge memory until you have identified the source, and you cannot identify the source until
        someone has replayed a trajectory. The output that matters is the "could not" list with a
        design-time fix beside each item; that list is next quarter's backlog, and it is cheaper to
        produce in a meeting room than at three in the morning.`,
    code: `# the blast-radius query the tabletop needs. If this cannot be written
# against your real logs, the incident has no known bound.
RETRIEVALS = [
    {"run": "r1", "user": "alice", "doc": "kb/caching.md", "ts": 1740000010},
    {"run": "r2", "user": "bob",   "doc": "kb/caching.md", "ts": 1740000920},
    {"run": "r3", "user": "carol", "doc": "kb/etags.md",   "ts": 1740001400},
    {"run": "r4", "user": "bob",   "doc": "kb/caching.md", "ts": 1740002200},
]

def blast_radius(doc, poisoned_since, retrievals=RETRIEVALS):
    hits = [r for r in retrievals if r["doc"] == doc and r["ts"] >= poisoned_since]
    return sorted({r["run"] for r in hits}), sorted({r["user"] for r in hits})

runs, users = blast_radius("kb/caching.md", 1740000500)
print("affected runs ", runs)      # ['r2', 'r4']
print("notify users  ", users)     # ['bob']`,
  },
];
