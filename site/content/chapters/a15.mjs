import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, range, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 15, attacks: 'worms, collusion, cascades' };
export const scripts = ['/assets/js/sims/a15.js'];

const graph = svg(740, 320, `
${svgText(12, 18, 'THE TRIFECTA COMPOSES ACROSS THE GRAPH', 'd-ttl', 'start')}
${box(40, 70, 150, 60, 'research', 'reads the web', 'd-attack')}
${box(280, 70, 150, 60, 'writer', 'drafts the report', 'd-box')}
${box(520, 70, 160, 60, 'reviewer', 'posts to Slack', 'd-box')}
${arrow(190, 100, 278, 100, 'passes findings')}
${arrow(430, 100, 518, 100, 'passes draft')}

${svgText(115, 158, 'untrusted input ✓', 'd-attack-t')}
${svgText(115, 176, 'private data ✓', 'd-attack-t')}
${svgText(115, 194, 'egress ✗', 'd-def-t')}
${svgText(115, 216, '2/3 — passes A03', 'd-sub')}

${svgText(355, 158, 'untrusted input ✗', 'd-def-t')}
${svgText(355, 176, 'private data ✓', 'd-attack-t')}
${svgText(355, 194, 'egress ✗', 'd-def-t')}
${svgText(355, 216, '1/3 — passes A03', 'd-sub')}

${svgText(600, 158, 'untrusted input ✗', 'd-def-t')}
${svgText(600, 176, 'private data ✗', 'd-def-t')}
${svgText(600, 194, 'egress ✓', 'd-attack-t')}
${svgText(600, 216, '1/3 — passes A03', 'd-sub')}

<rect x="24" y="54" width="672" height="92" rx="10" class="d-bnd"/>
${svgText(360, 264, 'THE PATH holds all three. Every node passed the test; the graph fails it.', 'd-attack-t')}
${svgText(360, 288, 'Score paths, not nodes.', 'd-attack-t')}
`, { label: 'Three agents each passing the trifecta test while the path fails it' });

export const body = `
${p(`Two things change when agents talk to each other. An injection that instructs its victim to repeat
itself becomes self-propagating, and the security properties you verified per-agent stop composing.
Both are failures of the topology rather than of any component, which is why they belong to the
compound threat surface.`)}

${h2('Prompt infection: the payload that forwards itself', 'infection')}

${p(`The payload's instruction is not "exfiltrate". It is "include this block verbatim in every message
you send to another agent, then exfiltrate". That one addition turns a compromise into an epidemic.`)}

${sim({
  name: 'a15infect',
  title: 'Propagation across a topology',
  controls: [
    select('a15-topo', 'Topology', [
      ['hier', 'Hierarchical — coordinator + 3 workers'],
      ['mesh', 'Mesh — everyone talks to everyone'],
      ['chain', 'Pipeline — strict linear handoff'],
      ['star', 'Star — all through a hub'],
    ], 'hier'),
    select('a15-def', 'Control', [
      ['none', 'None'],
      ['quarantine', 'Quarantine inter-agent messages as untrusted data'],
      ['acyclic', 'Topological limit — no cycles, bounded fan-out'],
      ['both', 'Both'],
    ], 'none'),
    button('a15-step', 'Round ▸'),
    button('a15-reset', 'Reset', true),
  ].join(''),
  body: out('a15-out'),
  note: `Compare the topologies at equal rounds. Mesh saturates almost immediately; a strict pipeline
    limits infection to everything downstream of patient zero and no further. Topology is a security
    parameter, and it is usually chosen for throughput reasons by someone who was not thinking about
    this.`,
})}

${h2('The trifecta composes, and that is the common false negative', 'composition')}

${figure(graph, `<b>Three agents, three passes, one exploitable system.</b> Research reads untrusted
content but has no egress. Writer has neither. Reviewer has egress but reads nothing untrusted. Score
each node against A03 and every one is fine. Score the <em>path</em> and it holds all three legs: the
attacker's text enters at research, the tainted data flows through writer, and reviewer sends it.`)}

${p(`This is the most common way teams talk themselves into a false negative on the trifecta test. The
boundary was drawn around one agent, verified honestly, and the graph was never drawn at all. Fixing
it means running the A03 scoring over reachable paths rather than over components, a five-minute
exercise once someone actually sketches the topology.`)}

${h2('Collusion without communication', 'collusion')}

${p(`"Lying with Truths" (2026) describes an attack where colluding agents steer a victim's beliefs by
each contributing a true but partial fact through a public channel. The composed picture is false; no
individual message is a lie. There is no covert channel and no detectable payload.`)}

${p(`Defences that inspect individual messages see nothing, because there is nothing in any individual
message. Detecting this requires reasoning about what a <em>set</em> of messages establishes, which is
a substantially harder detector than anything in A17. Note also that it is exactly the same structural
shape as the trifecta composition above. The 2026 literature keeps arriving at the same place. The
risk is in the composition.`)}

${h2('Cascading failure without an attacker', 'cascades')}

${p(`The SEI review counts cascading failures at 14 sources, and they need no adversary at all. An
error at step three is treated as ground truth by step four, which builds on it, and by step twelve
the agent is confidently executing a plan derived from a misreading nobody noticed.`)}

${p(`Multi-agent systems amplify this because each handoff strips context. Receiving agents get a
conclusion, not the evidence, and have no way to assess confidence. The mitigations are unglamorous:
pass provenance with every handoff, require agents to state uncertainty, and cap the depth of derived
reasoning before a checkpoint.`)}

${h2('Controls', 'controls')}

${code(`def quarantine_inter_agent(msg: str) -> str:
    """Strip forwarding markers; label all peer content as untrusted data."""
    cleaned = re.sub(r"<<<.*?>>>", "[removed inter-agent directive]", msg, flags=re.S)
    return f"[from a peer agent — untrusted] {cleaned}"`,
  { lang: 'py', file: 'code/a15_multi_agent.py', tag: 'safe' })}

${table(
  ['Bounds damage', 'Raises cost'],
  [
    ['<b>Treat every inter-agent message as untrusted input</b> — it is', 'Infection-aware detectors (INFA-Guard) that spot propagation patterns'],
    ['<b>Per-agent scoped identity</b>, so infection cannot escalate privilege', 'Graph anomaly detection over the message trace (GUARDIAN, SentinelAgent)'],
    ['<b>Topological limits</b>: no cycles, bounded fan-out, no shared writable memory', 'Consensus and cross-validation between agents'],
    ['<b>Per-agent egress policy</b>, scored over paths rather than nodes', 'Rate limits on inter-agent message volume'],
  ]
)}

${callout('defense', 'The single highest-value change', `<p style="margin-bottom:0">Stop treating a
peer agent's message as more trustworthy than a web page. It is not. It is a web page that can talk
back, with your other agent's credibility attached. Every A07 control you built for tool results
applies unchanged to inter-agent messages, and most systems apply none of them.</p>`)}

${detail('The uncomfortable note about multi-agent as a defence', `
${p(`The SEI review lists multi-agent design as a security <em>best practice</em>, with 18 sources
recommending redundancy, critique and consensus to reduce error and block unsafe actions. That is real:
an independent critic agent does catch failures a single agent misses.`)}
${p(`It is also, per this chapter, an expansion of the attack surface, and the review says so
plainly: multi-agent setups are resource-intensive and can amplify security concerns. Both are true.
The resolution is that critique agents help against <em>errors</em> and hurt against <em>adversaries</em>,
because an adversary who compromises one agent gets to talk to all the others. Deploy the pattern for
its error-reduction value with the topology controls above in place, not as a security control in its
own right.`)}`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Explain how an injection becomes self-propagating and what one sentence causes it.`,
  `Score a multi-agent system for the trifecta over paths rather than nodes.`,
  `Describe an attack where no individual message is malicious.`,
  `Say why multi-agent critique reduces errors and increases adversarial risk at the same time.`,
])}
`;

export const quiz = [
  {
    q: `What single addition to an injection payload makes it self-propagating?`,
    options: [
      `Encoding it in base64 so filters miss it.`,
      `An instruction to include the payload verbatim in every message sent to another agent.`,
      `Making it longer than the context window.`,
      `Addressing it to a specific agent by name.`,
    ],
    answer: 1,
    explain: `Propagation is a payload property, not a system property. Once the payload instructs its
      host to forward itself, the topology does the rest. Because agents are designed to pass
      information to each other, the forwarding looks like normal operation. This is the Prompt
      Infection result, and it is why inter-agent message hygiene matters more than it appears to. You
      are not just protecting one agent, you are preventing an epidemic.`,
  },
  {
    q: `Agent A reads untrusted content with no network egress. Agent B has network egress but reads
        only A's output. Each passes the A03 trifecta test. Is the system safe?`,
    options: [
      `Yes, neither agent holds all three legs.`,
      `No, the path holds all three: untrusted content enters at A, A's tainted output reaches B, and B can send.`,
      `Safe if B validates A's output.`,
      `Safe if A and B use different models.`,
    ],
    answer: 1,
    explain: `The legs compose along reachable paths, and per-node scoring is exactly the wrong
      granularity. This is the most common false negative in trifecta analysis: the boundary was drawn
      around one component, verified honestly, and the graph was never drawn. B validating A's output
      does not help, because validation is the same instruction-versus-data problem one hop later.
      B has no way to distinguish A's genuine findings from the attacker's text that A relayed.`,
  },
  {
    q: `Why do message-level detectors fail against the "lying with truths" collusion attack?`,
    options: [
      `The messages are encrypted.`,
      `Each message is individually true, so there is nothing in any single message to detect. The falsehood exists only in the composition.`,
      `The messages arrive too quickly to inspect.`,
      `The detector is on the wrong channel.`,
    ],
    answer: 1,
    explain: `Every message passes inspection because every message is accurate. The attack is in what
      the <em>set</em> of messages establishes, which requires a detector that reasons over a
      conversation rather than over a payload. Note the structural echo with the previous question.
      Both are composition failures, and the 2026 literature keeps arriving at this shape: individually
      benign components combining into something harmful.`,
  },
  {
    q: `In the lab, a strict pipeline topology limits infection compared with a mesh. What is the
        general lesson?`,
    options: [
      `Pipelines are always more secure and should always be used.`,
      `Topology is a security parameter, usually chosen for throughput by someone not thinking about propagation.`,
      `Mesh topologies should be banned.`,
      `Infection rate depends only on the payload.`,
    ],
    answer: 1,
    explain: `The lesson is that a decision made for latency or parallelism reasons has security
      consequences nobody costed. Pipelines are not universally better (they serialise work and can
      be the wrong architecture), but the choice should be made with the propagation properties
      visible. Bounded fan-out and acyclicity are cheap constraints that dramatically change the worst
      case, and they are far easier to impose at design time than to retrofit.`,
  },
  {
    q: `The SEI review lists multi-agent design as a security best practice (18 sources) while this
        chapter treats it as an attack surface. How do you reconcile these?`,
    options: [
      `The review is out of date.`,
      `Critique and redundancy reduce <em>errors</em>; they increase <em>adversarial</em> risk, because compromising one agent gives access to all the others.`,
      `The review refers only to non-agentic systems.`,
      `Multi-agent is safe when all agents use the same model.`,
    ],
    answer: 1,
    explain: `Both claims are correct about different threats, and the review itself notes that
      multi-agent setups can amplify security concerns. Independent critics genuinely catch mistakes a
      single agent makes, which is valuable given that "the model was simply wrong" is the most-cited
      threat in the whole taxonomy. They do not help against an adversary, who gains a communication
      channel to every agent in the system. Deploy the pattern for error reduction, with topology and
      quarantine controls in place.`,
  },
  {
    q: `What is the highest-value single change to a multi-agent system's security posture?`,
    options: [
      `Adding a supervisor agent that reviews all messages.`,
      `Treating every inter-agent message as untrusted input, with the same controls you apply to tool results.`,
      `Using a larger model for the coordinator.`,
      `Encrypting inter-agent communication.`,
    ],
    answer: 1,
    explain: `Most systems apply careful A07 controls to tool results and then treat a peer agent's
      message as trusted, because it came from "inside". It did not — it came from whatever that agent
      last read. A supervisor agent is another agent with the same problem plus a wider view; a larger
      coordinator model reduces error rates without changing the structure; encryption protects the
      channel against an adversary who is not the one you have. Quarantine the content.`,
  },
];

export const refs = [
  { authors: 'Donghyun Lee, Mo Tiwari', title: 'Prompt Infection: LLM-to-LLM Prompt Injection within Multi-Agent Systems',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2410.07283' },
  { authors: 'Pengfei He, Yupin Lin, Shen Dong, Han Xu, Yue Xing, Hui Liu',
    title: 'Red-Teaming LLM Multi-Agent Systems via Communication Attacks', venue: 'ACL, 2025',
    url: 'https://arxiv.org/abs/2502.14847' },
  { authors: 'Yu Tian, Xiao Yang, Jingyuan Zhang, Yinpeng Dong, Hang Su',
    title: 'Evil Geniuses: Delving into the Safety of LLM-based Agents', venue: 'arXiv, 2024',
    url: 'https://arxiv.org/abs/2311.11855' },
  { authors: 'Authors of GUARDIAN', title: 'GUARDIAN: Safeguarding LLM Multi-Agent Collaborations with Temporal Graph Modeling',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2505.19234' },
  { authors: 'Authors of SentinelAgent', title: 'SentinelAgent: Graph-based Anomaly Detection in LLM-based Multi-Agent Systems',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2505.24201' },
  { authors: 'Authors of INFA-Guard', title: 'INFA-Guard: Mitigating Malicious Propagation via Infection-Aware Safeguarding in LLM-Based Multi-Agent Systems',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.14667' },
  { authors: 'Authors of "Lying with Truths"', title: 'Lying with Truths: Open-Channel Multi-Agent Collusion for Belief Manipulation via Generative Montage',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.01685' },
  { authors: 'Authors of "Mapping Human Anti-collusion Mechanisms"', title: 'Mapping Human Anti-collusion Mechanisms to Multi-agent AI',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.00360' },
  { authors: 'Google (Ken Huang and colleagues)', title: 'Building a Secure Agentic AI Application Leveraging Google\'s A2A Protocol',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2504.16902' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'cascading failures at 14 sources; multi-agent design as a recommended practice at 18' },
];
