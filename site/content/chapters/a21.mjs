import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 18, attacks: 'the policy that never reads the payload' };
export const scripts = ['/assets/js/sims/a21.js'];

const flow = svg(740, 340, `
${svgText(12, 18, 'TAGS PROPAGATE THROUGH EVERY DERIVATION', 'd-ttl', 'start')}
${box(20, 50, 160, 54, 'http_get(url)', 'src: untrusted_web', 'd-attack')}
${box(20, 150, 160, 54, 'read_file(.env)', 'src: local_secret', 'd-attack')}
${box(250, 50, 170, 54, 'summary', 'src: untrusted_web')}
${box(250, 150, 170, 54, 'paraphrase', 'src: local_secret', 'd-attack')}
${box(250, 250, 170, 54, 'summary + secret', 'src: BOTH', 'd-attack')}
${arrow(180, 77, 248, 77)}
${arrow(180, 177, 248, 177)}
${arrow(180, 190, 248, 262)}
${arrow(420, 90, 500, 130)}
${box(500, 110, 220, 54, 'send_email(to, body)', 'the sink — policy runs here', 'd-def')}
${arrow(420, 177, 498, 150)}
${arrow(420, 264, 498, 165)}

${svgText(620, 200, 'readers(summary)      = public', 'd-sub')}
${svgText(620, 218, 'readers(paraphrase)   = user only', 'd-attack-t')}
${svgText(620, 236, 'readers(combined)     = intersection', 'd-attack-t')}
${svgText(620, 262, 'the check never reads the text', 'd-def-t')}
${svgText(620, 280, 'so the payload cannot be rewritten', 'd-def-t')}
${svgText(620, 298, 'to pass it', 'd-def-t')}
`, { label: 'Provenance tags propagating through derived values to a policy-checked sink' });

export const body = `
${p(`The pattern chapter ended at code-then-execute: control flow comes from the trusted query, data
flows through as values. This chapter adds the second half — every value carries where it came from,
and every sink checks that before acting. The result is a defence whose correctness does not depend on
anything the model believes.`)}

${h2('Tagged values', 'tagged')}

${code(`@dataclass
class Tagged:
    value: object
    sources: frozenset = frozenset()     # where the data came from
    readers: frozenset = frozenset()     # who is allowed to see it

    def derive(self, new_value, other=None):
        """Any derived value inherits the UNION of sources,
           the INTERSECTION of readers."""
        s = self.sources | (other.sources if other else frozenset())
        r = self.readers & (other.readers if other else self.readers)
        return Tagged(new_value, s, r)`,
  { lang: 'py', file: 'code/a21_ifc.py', tag: 'safe' })}

${p(`Union of sources, intersection of readers. Those two lines are the whole propagation rule, and they
are what makes laundering impossible: paraphrasing a secret produces a value derived from the secret,
and mixing a secret into a public summary narrows the audience of the result to the intersection.`)}

${figure(flow, `<b>Why the attacker cannot rewrite their way out.</b> Every derivation carries tags
forward. The policy at the sink is a function of those tags, never of the text, so no phrasing of the
payload changes the outcome — there is nothing to phrase <em>at</em>.`)}

${h2('The policy', 'policy')}

${code(`def check_send(data: Tagged, recipient: str):
    label = reader_label(recipient)            # user | internal | public
    if label not in data.readers:
        raise PolicyViolation(
            f"cannot send data derived from {sorted(data.sources)} to "
            f"{recipient!r} (audience {label!r})")`, { lang: 'py', tag: 'safe' })}

${sim({
  name: 'a21ifc',
  title: 'Information-flow control against a hijacked agent',
  controls: [
    select('a21-flow', 'What the agent does', [
      ['benign', 'Summarise a public page, email the team'],
      ['exfil', 'Hijacked: read .env, email an attacker'],
      ['launder', 'Hijacked: paraphrase the secret first'],
      ['mix', 'Hijacked: bury the secret in a legitimate summary'],
      ['encode', 'Hijacked: base64-encode the secret'],
    ], 'benign'),
    toggle('a21-ifc', 'Information-flow control enabled', true),
  ].join(''),
  body: out('a21-out'),
  note: `Turn the control off and every row succeeds. Turn it on and the last four fail identically,
    for the same reason and with the same message — because the check is a function of provenance, and
    all four are derived from the same tagged value.`,
})}

${h2('What was never consulted', 'never-consulted')}

${callout('defense', 'The list that makes this a bounding control', `
<ul style="margin-bottom:0">
<li><b>The model\'s judgement</b> — it was fully hijacked throughout every hostile run.</li>
<li><b>The text of the instruction</b> — never inspected, at any point.</li>
<li><b>A detection threshold</b> — there is not one.</li>
<li><b>The phrasing of the payload</b> — irrelevant, because nothing reads it.</li>
</ul>`)}

${p(`An attacker who writes a better payload changes nothing. That is the qualitative difference
between this chapter and all of Part 4, and it is why the answer to "what if the injection is
cleverer?" is, for the first time in the course, "it does not matter".`)}

${h2('CaMeL: the production-shaped version', 'camel')}

${p(`Debenedetti and colleagues put the two halves together. A privileged LLM converts the user's
trusted query into a program in a restricted Python subset. A quarantined LLM handles all untrusted
content and returns only values. A custom interpreter runs the program, tracking a capability tag on
every value, and enforces policies at every sink.`)}

${table(
  ['Component', 'Sees untrusted content?', 'Can act?'],
  [
    ['Privileged LLM (writes the program)', 'No — only the user\'s query', 'Indirectly, via the program'],
    ['Quarantined LLM (parses content)', 'Yes', 'No'],
    ['Interpreter', 'Yes, as opaque tagged values', 'Yes, subject to policy'],
    ['Policy engine', 'No — only tags', 'It is the decision point'],
  ]
)}

${p(`The 2026 follow-up, "CaMeLs Can Use Computers Too", extends single-shot planning to computer-use
agents — which is the harder case from <a href="/chapters/a08/">A08</a>, because a coordinate carries
no semantics to write policy against.`)}

${h2('The costs, stated plainly', 'costs')}

${ul([
  `<b>You must write the policy.</b> "Who may read data derived from source X" is a question your
   organisation has probably never answered explicitly. Writing it down is most of the work, and it is
   valuable independently of the agent.`,
  `<b>Some tasks cannot express their control flow ahead of time.</b> Genuinely exploratory work —
   where step seven depends on what step six discovered in an unpredictable way — does not fit. The
   honest answer for those is a different pattern or a narrower task.`,
  `<b>Over-tainting.</b> If everything ends up derived from something untrusted, the policy blocks
   everything and users route around it. Managing this needs declassification: explicit,
   audited points where a value's tags are reduced — for example after a human confirms it.`,
  `<b>An extra model call per step</b> in the CaMeL formulation, and an interpreter you maintain.`,
])}

${detail('Related approaches worth knowing', `
${kv([
  ['f-secure (Wu et al.)', `Information-flow control at the system level, formalising the security
    property indirect injection violates.`],
  ['FIDS', `Securing agents with information-flow control, with a focus on practical deployment
    within existing agent frameworks.`],
  ['RTBAS', `Combines IFC with dependency tracking to defend against both injection and privacy
    leakage, and addresses the over-tainting problem directly.`],
  ['AgentArmor', `Applies program analysis to agent <em>runtime traces</em> — recovering control and
    data dependencies after the fact, which is the retrofit path when you cannot rebuild.`],
  ['Permissive IFC', `Multi-execution-based tracking that reduces false blocking, trading compute for
    precision.`],
  ['MELON', `A provable defence for indirect injection in agents, via re-execution with masked
    tool outputs.`],
])}`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Implement tag propagation with the union/intersection rule and explain why both directions are needed.`,
  `Explain why paraphrasing, encoding and mixing all fail to launder a tag.`,
  `Describe CaMeL's four components and which of them ever reads untrusted text.`,
  `Name the over-tainting failure mode and the mechanism that addresses it.`,
])}
`;

export const quiz = [
  {
    q: `Why does the propagation rule take the <em>union</em> of sources but the <em>intersection</em>
        of readers?`,
    options: [
      `For computational efficiency.`,
      `A derived value is contaminated by every source it came from, and may only be seen by parties permitted to see <em>all</em> of them.`,
      `To keep the tag sets small.`,
      `Because sources are ordered and readers are not.`,
    ],
    answer: 1,
    explain: `Both directions are conservative in the safe direction. Combining a public summary with
      a secret produces something that is partly secret, so it inherits both sources; and its audience
      must be narrowed to those cleared for the most restricted input, which is the intersection.
      Reversing either — intersecting sources or unioning readers — would let an attacker launder a
      secret by mixing it with something public, which is exactly the "mix" case in the lab.`,
  },
  {
    q: `An attacker instructs the hijacked agent to base64-encode the secret before sending it. What
        happens under IFC?`,
    options: [
      `The encoding defeats the tag, since the value has changed.`,
      `The encoded value is derived from the secret, so it carries the same tags and is blocked identically.`,
      `The policy decodes it and then blocks.`,
      `It succeeds — IFC only checks literal values.`,
    ],
    answer: 1,
    explain: `Tags travel with derivation, not with byte equality. <code>b64(secret)</code> is
      produced <em>from</em> <code>secret</code>, so it inherits its sources and its narrowed reader
      set, and the sink refuses it with exactly the same message as the plaintext. Note that the policy
      never decodes anything — it never looks at the value at all, which is why the entire space of
      encodings collapses into one case.`,
  },
  {
    q: `In CaMeL, which component reads untrusted content <em>and</em> can take actions?`,
    options: [
      `The privileged LLM.`,
      `The quarantined LLM.`,
      `Neither — the privileged LLM acts but sees only the user query; the quarantined LLM reads untrusted content but has no ability to act.`,
      `Both, which is why the policy engine is needed.`,
    ],
    answer: 2,
    explain: `That separation is the entire construction. The component with authority never reads
      attacker-controlled text, and the component that reads attacker-controlled text has no
      authority. The interpreter handles tagged values and is not a language model, so it cannot be
      persuaded; the policy engine sees only tags. There is no single place where "reads the payload"
      and "can act on it" meet.`,
  },
  {
    q: `Your IFC deployment ends up blocking most legitimate work because nearly every value is derived
        from something untrusted. What is this, and what addresses it?`,
    options: [
      `A bug in tag propagation; fix the union rule.`,
      `Over-tainting — addressed by declassification: explicit, audited points where a value's tags are reduced, such as after human confirmation.`,
      `Insufficient model capability; use a larger model.`,
      `Policy misconfiguration; widen the reader sets.`,
    ],
    answer: 1,
    explain: `Over-tainting is the standard failure mode of information-flow systems and the reason
      several deployments quietly get switched off. The propagation rule is correct — the problem is
      that a real workflow legitimately mixes trust levels. Declassification makes the reduction
      explicit and auditable rather than implicit and invisible; RTBAS addresses it directly. Widening
      reader sets globally would just disable the control while leaving the machinery in place.`,
  },
  {
    q: `What makes IFC a "bounds damage" control rather than a "raises cost" control?`,
    options: [
      `It has a lower false-negative rate than a classifier.`,
      `Its decision is a function of data provenance rather than of language, so it holds identically no matter how the payload is written or how thoroughly the model is compromised.`,
      `It runs before the model.`,
      `It is deterministic and therefore faster.`,
    ],
    answer: 1,
    explain: `The check never reads the payload, so there is nothing for an attacker to optimise
      against — which is exactly what the adaptive-attack results in A19 exploit for every text-based
      defence. Determinism matters, but the deeper property is that the model's beliefs are not an
      input to the decision. In the code file the agent is fully hijacked in every hostile run and the
      outcome is unchanged.`,
  },
  {
    q: `Which task is a poor fit for CaMeL-style control-flow extraction?`,
    options: [
      `"Summarise these ten pages and email the summary to my team."`,
      `"Investigate this incident: follow whatever leads the logs suggest, wherever they go."`,
      `"Look up each customer in this list and flag overdue accounts."`,
      `"Read this PDF and extract the invoice total."`,
    ],
    answer: 1,
    explain: `Open-ended investigation is exactly the case where control flow cannot be fixed in
      advance: step seven genuinely depends on what step six found, in a way the trusted query cannot
      anticipate. The honest response is either a different pattern, a narrower task decomposition
      with approval between phases, or accepting that this workload runs with a human in the loop. The
      other three have control flow that is knowable from the request alone.`,
  },
];

export const refs = [
  { authors: 'Edoardo Debenedetti, Ilia Shumailov, Tianqi Fan, Jamie Hayes, Nicholas Carlini, Daniel Fabian, Christoph Kern, Chongyang Shi, Andreas Terzis, Florian Tramèr',
    title: 'Defeating Prompt Injections by Design (CaMeL)', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.18813' },
  { authors: 'Fangzhou Wu, Ethan Cecchetti, Chaowei Xiao',
    title: 'System-Level Defense against Indirect Prompt Injection Attacks: An Information Flow Control Perspective',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2409.19091' },
  { authors: 'Manuel Costa, Boris Köpf, Aashish Kolluri, Andrew Paverd, Mark Russinovich, Ahmed Salem, Shruti Tople, Lukas Wutschitz, Santiago Zanella-Béguelin',
    title: 'Securing AI Agents with Information-Flow Control (FIDS)', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2505.23643' },
  { authors: 'Peter Yong Zhong, Siyuan Chen, Ruiqi Wang, McKenna McCall, Ben L. Titzer, Heather Miller, Phillip B. Gibbons',
    title: 'RTBAS: Defending LLM Agents Against Prompt Injection and Privacy Leakage', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2502.08966' },
  { authors: 'Authors of AgentArmor', title: 'AgentArmor: Enforcing Program Analysis on Agent Runtime Trace to Defend Against Prompt Injection',
    venue: 'arXiv, 2025', url: 'https://www.arxiv.org/abs/2508.01249' },
  { authors: 'Kai Zhou, Xinyu Wang and colleagues', title: 'MELON: Provable Defense Against Indirect Prompt Injection Attacks in AI Agents',
    venue: 'ICML, 2025', url: 'https://arxiv.org/abs/2502.05174' },
  { authors: 'Shoumik Saha, Timothy Baldwin and colleagues', title: 'Permissive Information-Flow Analysis for Large Language Models',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2410.03055' },
  { authors: 'Juhee Kim, Woohyuk Choi, Byoungyoung Lee',
    title: 'Prompt Flow Integrity to Prevent Privilege Escalation in LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.15547' },
  { authors: 'Andrew C. Myers, Barbara Liskov', title: 'A Decentralized Model for Information Flow Control',
    venue: 'ACM SOSP, 1997', url: 'https://www.cs.cornell.edu/andru/papers/iflow-sosp97.pdf',
    note: 'the decentralised label model the reader/writer sets here are a simplification of' },
  { authors: 'Authors of "CaMeLs Can Use Computers Too"',
    title: 'CaMeLs Can Use Computers Too: System-level Security for Computer Use Agents', venue: 'arXiv, 2026',
    url: 'https://arxiv.org/pdf/2601.09923' },
];
