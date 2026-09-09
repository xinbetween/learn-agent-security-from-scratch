import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 15, attacks: 'what you can see afterwards' };
export const scripts = ['/assets/js/sims/a26.js'];

export const body = `
${p(`Every control in Part 5 can be circumvented, misconfigured, or simply absent from the path an
attacker found. Monitoring is what tells you that happened and, more often, what lets you reconstruct
what happened six weeks later when someone asks.`)}

${h2('The trajectory record', 'trajectory')}

${code(`{"run":"r1","step":2,"kind":"tool_call","tool":"http_get",
 "args":{"url":"https://c.example/g"},
 "caused_by":"user_request",     "provenance":"trusted",
 "prev":"0000000000000000",      "hash":"3f9ac1b2e4d78a05"}

{"run":"r1","step":4,"kind":"tool_call","tool":"read_file",
 "args":{"path":".env"},
 "caused_by":"tool_result#3",    "provenance":"untrusted_web",
 "prev":"3f9ac1b2e4d78a05",      "hash":"b17c4e29d0f3a866"}`,
  { lang: 'json', file: 'code/a26_monitoring.py' })}

${p(`Four fields carry almost all the value, and most production agents log none of them:`)}

${kv([
  ['<code>caused_by</code>', `Which earlier record produced this one. If you built
    <a href="/chapters/a21/">A21</a> you have it already. Without it your log says <em>what</em>
    happened; with it, <em>why</em>.`],
  ['<code>provenance</code>', `The trust level of the causing data. It is what turns a log into a
    detector. "A tool call whose cause was untrusted" is a query.`],
  ['<code>prev</code> / <code>hash</code>', `Chained hashes, so an edit to any record invalidates
    every subsequent one. Tamper-evidence for a few bytes per entry.`],
  ['<code>policy_decision</code>', `Log the <b>denials</b>, not just the successful calls. A denial is
    your highest-signal event and the one most systems throw away.`],
])}

${sim({
  name: 'a26trace',
  title: 'Trajectory analysis',
  controls: [
    select('a26-view', 'View', [
      ['trace', 'The trajectory'],
      ['tamper', 'Tamper detection'],
      ['drift', 'Task drift'],
      ['aggregate', 'Aggregate across sessions'],
    ], 'trace'),
  ].join(''),
  body: out('a26-out'),
  note: `The aggregate view is the one that catches what per-request inspection cannot — the slow
    exfiltration channel from A09, where no single message is anomalous and the pattern only exists
    across sessions.`,
})}

${h2('Task drift', 'drift')}

${p(`Two ways to detect that an agent has stopped doing what it was asked.`)}

${ul([
  `<b>Structural</b>, and nearly free: flag any action whose causal ancestry is untrusted and whose
   tool is not implied by the user's request. Requires provenance, no model, no threshold. This is what
   the code file implements.`,
  `<b>Activation-based</b>, and stronger: Abdelnabi and colleagues detect drift from the delta between
   the model's internal state before and after untrusted content enters the context. It does not depend
   on parsing text at all, which makes it robust to phrasing, but it needs white-box access to the
   model.`,
])}

${h2('Aggregate analysis', 'aggregate')}

${p(`Some attacks are invisible per-request by construction. The A09 slow channel sends twelve bytes to
a CDN per session, which is unremarkable in isolation and unmistakable across forty sessions. Signals
worth computing over time rather than per-message:`)}

${ul([
  `Repeated contact with the same rare destination across otherwise unrelated runs.`,
  `Uniform, small outbound payloads (a distribution that does not occur naturally).`,
  `Cost per request rising with no change in task mix (this is your <a href="/chapters/a16/">A16</a> detector).`,
  `The same tool-call sequence appearing across unrelated users, the signature of a poisoned shared
   corpus (<a href="/chapters/a12/">A12</a>).`,
  `A spike in policy denials from one identity.`,
])}

${h2('The endpoint as an enforcement point', 'endpoint')}

${p(`For desktop and coding agents there is a layer beneath everything discussed so far. Claude Code,
Cowork-style desktop agents and open frameworks execute terminal commands, modify files and open network
connections directly on a workstation. The observable security events are therefore ordinary endpoint
telemetry: process creation, file modification, network activity.`)}

${p(`CrowdStrike's white paper on securing AI where it executes makes the structural argument: the
attack surface has moved from the application layer to the execution layer, so the enforcement point
has to move with it. Two consequences worth taking regardless of vendor:`)}

${ul([
  `<b>Agent activity is indistinguishable from human activity at the syscall level.</b> An agent
   running <code>curl</code> and a developer running <code>curl</code> produce the same event. Telling
   them apart requires attributing process lineage to an agent, the practical form of the
   agent-identity problem from <a href="/chapters/a22/">A22</a>.`,
  `<b>Discovery comes first.</b> Most organisations cannot enumerate which AI agents are running on
   their endpoints, with what permissions. You cannot monitor an inventory you do not have, and this
   is usually the honest first finding of an agent security programme.`,
])}

${callout('warn', 'On vendor material', `<p style="margin-bottom:0">The framing above — execution layer,
endpoint telemetry, agent discovery — is useful and is reproduced here on its merits. The product
capability claims in any vendor white paper are marketing and are not reproduced as course material.
Treat the argument and the advertisement separately, which is a habit worth keeping for every industry
source in this field.</p>`)}

${h2('The privacy tension, stated honestly', 'privacy')}

${p(`The SEI review found this contradiction sitting unresolved in its own corpus. Some sources
recommend logging as much as possible to support audit and incident response, while others recommend
minimising retention to limit privacy exposure. Both are correct, and agent traces are unusually
sensitive because they contain the user's documents, messages and credentials as they flowed through the
context.`)}

${p(`What works is structured rather than binary. Log metadata and hashes at full fidelity
and long retention; log content at reduced fidelity with a short TTL; redact before storage rather than
at query time; and make retention a documented decision rather than a default nobody chose.`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Name the four fields that turn a log into an investigable trajectory.`,
  `Implement hash chaining and explain what it does and does not prevent.`,
  `Detect task drift structurally, without a model.`,
  `Name three signals that exist only in aggregate.`,
])}
`;

export const quiz = [
  {
    q: `Which field turns an agent log from "what happened" into "why it happened"?`,
    options: [
      `A precise timestamp.`,
      `<code>caused_by</code>, the earlier record that produced this one.`,
      `The model version.`,
      `The user ID.`,
    ],
    answer: 1,
    explain: `Causality is the question an incident actually asks. A list of tool calls tells you the
      agent read <code>.env</code>; <code>caused_by: tool_result#3</code> tells you it did so because
      of content that arrived from a fetched page, which is the finding. Timestamps let you guess at
      ordering, and the user ID is the field A10 showed to be identical for legitimate and hijacked
      actions. If you built the provenance tracking in A21, this field is free.`,
  },
  {
    q: `What does hash-chaining a trajectory log prevent, and what does it not?`,
    options: [
      `It prevents an attacker reading the log; it does not prevent writes.`,
      `It makes a silent edit impossible, since any modification invalidates every subsequent hash, but it does not prevent an attacker with write access from truncating or discarding the log.`,
      `It prevents log injection attacks.`,
      `It encrypts the log at rest.`,
    ],
    answer: 1,
    explain: `Chaining gives tamper-<em>evidence</em>, not tamper-resistance. An attacker who edits
      record four breaks the chain visibly from that point on, so the damage becomes detectable rather
      than invisible. Truncation and wholesale deletion remain possible, which is why you also ship
      records off-host promptly. Confidentiality and log injection are separate concerns needing
      separate controls.`,
  },
  {
    q: `How can you detect task drift without any model or threshold?`,
    options: [
      `Compare output length to the request length.`,
      `Flag any action whose causal ancestry is untrusted and whose tool is not implied by the user's request.`,
      `Measure latency per step.`,
      `Count the number of tool calls.`,
    ],
    answer: 1,
    explain: `This is a structural query over fields you already have if you record provenance and
      causality. "The user asked for a summary of a URL; this <code>send_email</code> call was caused
      by content from that URL" is a complete finding requiring no inference. The activation-delta
      approach is stronger and more robust to phrasing, but it needs white-box model access. The
      structural version costs a database query.`,
  },
  {
    q: `Forty sessions each send twelve bytes to the same CDN. No individual request is anomalous. What
        catches this?`,
    options: [
      `A per-request DLP scan.`,
      `Aggregate analysis across sessions — one destination, many sessions, uniformly tiny payloads is a pattern that does not occur naturally.`,
      `An injection classifier on tool results.`,
      `Rate limiting per request.`,
    ],
    answer: 1,
    explain: `The slow channel is designed against per-message thresholds, so no message-level control
      can see it. The signal exists only in the joint distribution: a rare destination contacted
      repeatedly with unnaturally uniform small payloads. Worth noting the honest ordering though. An
      egress allow-list would have prevented it outright, and prevention beats detection here.
      Aggregate monitoring is what you need when prevention was incomplete.`,
  },
  {
    q: `Why is agent activity hard to distinguish from human activity in endpoint telemetry?`,
    options: [
      `Agents deliberately mimic human timing.`,
      `At the syscall level an agent running <code>curl</code> and a developer running <code>curl</code> produce identical events, and distinguishing them requires attributing process lineage to an agent identity.`,
      `Endpoint agents cannot see subprocess activity.`,
      `Agents run as root.`,
    ],
    answer: 1,
    explain: `The execution layer has no notion of intent or authorship; it sees a process and a
      syscall. Attribution requires knowing that this process tree descends from an agent runtime and
      which task it belongs to. That is the practical form of A22's agent-identity problem. This is also why
      discovery is the first step: an organisation that cannot enumerate the agents running on its
      endpoints has no basis on which to attribute anything.`,
  },
  {
    q: `The literature contains contradictory advice: log everything, versus minimise retention. What
        is the workable resolution?`,
    options: [
      `Follow whichever your regulator requires.`,
      `Separate metadata from content — full-fidelity metadata and hashes with long retention, reduced-fidelity content with a short TTL, redacted before storage.`,
      `Log everything but encrypt it.`,
      `Log nothing and rely on prevention.`,
    ],
    answer: 1,
    explain: `The tension is real and the SEI review found it unresolved in its own corpus, because
      both recommendations are correct about different risks. The resolution is structural rather than
      a choice: the fields that make a trajectory investigable (causality, provenance, tool names,
      hashes) are cheap and not especially sensitive, while the content that makes traces a privacy
      liability is what you retain briefly and redact on the way in. What matters most is that
      retention becomes a documented decision rather than a default.`,
  },
];

export const refs = [
  { authors: 'Sahar Abdelnabi, Aideen Fay, Giovanni Cherubin, Ahmed Salem, Mario Fritz, Andrew Paverd',
    title: 'Get My Drift? Catching LLM Task Drift with Activation Deltas', venue: 'IEEE SaTML, 2025',
    url: 'https://arxiv.org/abs/2406.00799' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Authors of SentinelAgent', title: 'SentinelAgent: Graph-based Anomaly Detection in LLM-based Multi-Agent Systems',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2505.24201' },
  { authors: 'Authors of Trajectory Guard', title: 'Trajectory Guard: A Lightweight, Sequence-Aware Model for Real-Time Anomaly Detection in Agentic AI',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.00516' },
  { authors: 'Authors of "Structural Representations for Cross-Attack Generalization"',
    title: 'Structural Representations for Cross-Attack Generalization in AI Agent Threat Detection',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.01723' },
  { authors: 'Authors of "Disclosure Audits for LLM Agents"', title: 'Disclosure Audits for LLM Agents',
    venue: 'arXiv, 2025', url: 'https://www.arxiv.org/pdf/2506.10171' },
  { authors: 'Silen Naihin, David Atkinson, Marc Green, Merwane Hamadi, Craig Swift, Douglas Schonholtz, Adam Tauman Kalai, David Bau',
    title: 'Testing Language Model Agents Safely in the Wild', venue: 'NeurIPS Workshop, 2023',
    url: 'https://arxiv.org/abs/2311.10538' },
  { authors: 'CrowdStrike', title: 'Securing AI Where It Executes: The Endpoint Is the New Control Point for AI Agent Security',
    venue: 'CrowdStrike white paper, 2026',
    note: 'the execution-layer framing and the agent-discovery argument; product claims not reproduced' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'logging recommended by 18 sources; the logging/privacy contradiction in the corpus' },
];
