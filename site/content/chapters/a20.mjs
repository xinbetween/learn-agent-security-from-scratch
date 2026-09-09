import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 17, attacks: 'six architectures' };
export const scripts = ['/assets/js/sims/a20.js'];

const dual = svg(740, 300, `
${svgText(12, 18, 'THE DUAL LLM PATTERN', 'd-ttl', 'start')}
${box(30, 56, 150, 56, 'privileged LLM', 'has tools', 'd-trust')}
${box(30, 176, 150, 56, 'quarantined LLM', 'no tools', 'd-attack')}
${box(300, 56, 150, 56, 'tools', 'act for real', 'd-def')}
${box(300, 176, 170, 56, 'untrusted content', 'the fetched page', 'd-attack')}
${box(560, 110, 150, 56, 'variable store', '$VAR1 = "…"', 'd-sunk')}

${arrow(180, 84, 298, 84, 'calls')}
${arrow(300, 204, 202, 204, 'reads', 'd-attack-l')}
${arrow(180, 190, 558, 140, '', 'd-arrow')}
${svgText(400, 168, 'writes value', 'd-sub')}
${arrow(558, 124, 182, 90, '', 'd-arrow')}
${svgText(380, 108, 'returns only the REFERENCE $VAR1', 'd-def-t')}

<rect x="20" y="164" width="470" height="80" rx="8" class="d-bnd"/>
${svgText(495, 258, 'the privileged model never reads anything in this box', 'd-bnd-t', 'end')}
${svgText(370, 288, 'It can pass $VAR1 to a tool. It cannot be persuaded by its contents, because it never sees them.', 'd-def-t')}
`, { label: 'The dual LLM pattern with a quarantined model and variable references' });

export const body = `
${p(`Everything up to here has been about making the model less likely to be wrong. Part 5 is about
making its wrongness not matter. This chapter is the architectural catalogue: six patterns from
Beurer-Kellner and colleagues, each trading a specific capability for a property you can state out
loud and defend in a review.`)}

${h2('The catalogue', 'catalogue')}

${sim({
  name: 'a20patterns',
  title: 'The same poisoned page against seven architectures',
  controls: select('a20-pat', 'Architecture', [
    ['naive', 'Naive agent (baseline)'],
    ['selector', 'Action-selector'],
    ['plan', 'Plan-then-execute'],
    ['dual', 'Dual LLM'],
    ['code', 'Code-then-execute'],
    ['context', 'Context minimisation'],
    ['mapreduce', 'Map-reduce'],
  ], 'naive'),
  body: out('a20-out'),
  note: `Every pattern below the first one holds against this payload, and every one of them paid for
    it in capability. The engineering question is never "which is most secure" — it is "what is the
    least capability I can give up to get a property I can state".`,
})}

${table(
  ['Pattern', 'The property', 'What you give up'],
  [
    ['<b>Action-selector</b>', 'No feedback loop at all. The agent never sees tool output, so there is no injection path.', 'Cannot use tool results. Suits fixed menus of operations.'],
    ['<b>Plan-then-execute</b>', 'Control-flow integrity: the plan is fixed before untrusted content arrives, so injection can alter arguments but not add steps.', 'No adaptive replanning. The agent cannot react to what it finds.'],
    ['<b>Dual LLM</b>', 'The privileged model never reads untrusted content; it manipulates opaque references.', 'Only opaque values cross the boundary. Reasoning about content is confined to the quarantined side.'],
    ['<b>Code-then-execute</b>', 'Control flow is a program derived from the trusted query; untrusted data flows through it as values.', 'The task must be expressible as code. This is the road to CaMeL (<a href="/chapters/a21/">A21</a>).'],
    ['<b>Context minimisation</b>', 'Untrusted text is removed from context before the action decision, leaving only an extracted fact.', 'The extraction step is itself attackable, so this is the weakest of the six.'],
    ['<b>Map-reduce</b>', 'Each untrusted item is processed by an isolated, tool-less agent; a trusted reducer combines results.', 'No cross-item reasoning. Good for triage, poor for synthesis.'],
  ]
)}

${figure(dual, `<b>Dual LLM, in detail.</b> The quarantined model reads the poisoned page and can be
completely hijacked — it has no tools, so hijacking it achieves nothing. It writes its output to a
variable store and returns only the <em>name</em> <code>$VAR1</code>. The privileged model schedules
work on <code>$VAR1</code> without ever reading its contents, so no phrasing of the payload can reach
it. Willison proposed this in 2023; CaMeL is the version with a policy engine attached.`)}

${h2('Choosing', 'choosing')}

${kv([
  ['The task is fully known up front', `<b>Plan-then-execute.</b> The most broadly applicable pattern, and usually the cheapest to retrofit.`],
  ['The task is a fixed menu of operations', `<b>Action-selector.</b> Strongest property available; only works when it works.`],
  ['The agent must read data but not act on its content', `<b>Dual LLM.</b> Summarisation, triage, classification over untrusted input.`],
  ['The task is expressible as a program', `<b>Code-then-execute</b>, and then <a href="/chapters/a21/">CaMeL</a> for the policy layer.`],
  ['Many independent untrusted items', `<b>Map-reduce.</b> Inbox triage, review queues, log analysis.`],
  ['Only a fact is needed from the text', `<b>Context minimisation</b>, with the extraction step treated as attack surface.`],
])}

${h2('The honest caveat from the paper', 'caveat')}

${callout('warn', 'These bound one thing, not everything', `<p>The patterns bound damage for the class
of attacks that route through the agent's <em>control flow</em>. Three things they do not do:</p>
<ul style="margin-bottom:0">
<li>They do not make the agent's <b>output</b> trustworthy. A summariser under
plan-then-execute can still produce an attacker-influenced summary, which a human then acts on.</li>
<li>They do not help if the task genuinely requires <b>open-ended action on untrusted content</b>;
"read my email and do whatever it says" has no secure architecture, and the right answer is to not
build it.</li>
<li>They do not address model-level threats (<a href="/chapters/a14/">A14</a>) or resource attacks
(<a href="/chapters/a16/">A16</a>), which route around control flow entirely.</li>
</ul>`)}

${h2('Retrofitting', 'retrofit')}

${p(`Most readers arrive with a naive agent already in production. In rough order of effort per unit of
risk removed:`)}

${steps([
  ['Fix the plan before the first untrusted fetch',
   `Even a partial version helps: commit the tool sequence for the common path, and treat any deviation
    as an event requiring approval. This is often a day's work and removes the "injection adds a step"
    class outright.`],
  ['Quarantine the summarisation step',
   `If the agent reads documents and then acts, split it: one call that reads and summarises with no
    tools, one that acts on the summary with tools but never sees the source. Half of dual-LLM's
    benefit for a fraction of the work.`],
  ['Move the fixed parts into code',
   `Every branch you can express as a Python <code>if</code> rather than as a model decision is a
    branch an injection cannot take.`],
  ['Then add the policy layer',
   `Once control flow is code, values can carry tags and sinks can enforce policy. That is
    <a href="/chapters/a21/">A21</a>.`],
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Name the six patterns and state the property each one guarantees.`,
  `Choose a pattern for a given task and defend the capability you gave up.`,
  `Explain why the dual LLM pattern works even when the quarantined model is fully hijacked.`,
  `Say what these patterns do not protect against, without hedging.`,
])}
`;

export const quiz = [
  {
    q: `In the dual LLM pattern, the quarantined model is completely hijacked by an injected page. Why
        does this not compromise the system?`,
    options: [
      `The quarantined model is smaller and less capable.`,
      `It has no tools, and it returns only an opaque variable reference; the privileged model never reads the content, so no phrasing can persuade it.`,
      `The privileged model validates the quarantined model's output.`,
      `The quarantined model runs in a sandbox.`,
    ],
    answer: 1,
    explain: `Two properties combine. The quarantined model cannot act, so hijacking it achieves
      nothing directly. And the privileged model — which can act — never receives the untrusted text,
      only a reference like <code>$VAR1</code>, so there is no channel through which the payload's
      language can reach the component with authority. Note that validation is explicitly <em>not</em>
      the mechanism: validation would require reading the content, which is what the pattern
      forbids.`,
  },
  {
    q: `Which pattern would you choose for an agent that triages 200 unread emails and flags urgent
        ones?`,
    options: [
      `Plan-then-execute, since the plan is known.`,
      `Map-reduce: each email is processed by an isolated tool-less agent, and a trusted reducer combines the flags.`,
      `Action-selector, since flagging is a fixed operation.`,
      `Context minimisation, extracting urgency from each message.`,
    ],
    answer: 1,
    explain: `Map-reduce fits the shape exactly: many independent untrusted items, no cross-item
      reasoning required, and a per-item worker that needs no tools. An injection in email 47
      compromises the worker handling email 47 and nothing else, because that worker cannot act and
      its output is a structured flag rather than free text. Plan-then-execute would also help but
      leaves all 200 messages in one context; action-selector cannot read the content at all.`,
  },
  {
    q: `A team applies plan-then-execute and reports that injection is now impossible. What did they
        overstate?`,
    options: [
      `Nothing; the plan is fixed.`,
      `Injected content can still influence tool <em>arguments</em> and the agent's <em>output</em>. It just cannot add steps to the plan.`,
      `Plan-then-execute only works for single-step tasks.`,
      `The plan can be regenerated mid-run.`,
    ],
    answer: 1,
    explain: `Control-flow integrity is a real and valuable property, and it is narrower than
      "injection is impossible". If the plan includes <code>send_email(recipient, body)</code>, the
      injected content may still steer who the recipient is or what the body says, depending on how
      those arguments are derived. And the summary the agent produces is attacker-influenced
      regardless. Data-flow control (A21) is what closes the argument channel.`,
  },
  {
    q: `Why is context minimisation described as the weakest of the six patterns?`,
    options: [
      `It is the most expensive to implement.`,
      `The extraction step that pulls a fact out of the untrusted text is itself performed by a model reading untrusted text, so it inherits the original problem.`,
      `It only works on short documents.`,
      `It requires white-box model access.`,
    ],
    answer: 1,
    explain: `You have moved the vulnerable step rather than removed it. Some component still reads
      the attacker's text and makes a judgement about it, and that judgement determines what enters
      the trusted context. It does help, since a single extracted fact is a much narrower channel than
      a 3,000-token page, but the guarantee is qualitatively weaker than dual LLM, where the
      privileged side reads nothing at all.`,
  },
  {
    q: `Which task has no secure architecture among these six patterns?`,
    options: [
      `"Summarise these ten web pages into a report."`,
      `"Read my email and do whatever it says."`,
      `"Triage these support tickets by urgency."`,
      `"Look up this postcode and fill in the form."`,
    ],
    answer: 1,
    explain: `The task specification <em>is</em> the vulnerability: it asks the agent to take
      open-ended action determined by untrusted content, which is precisely what every pattern here
      prevents. No amount of architecture rescues it, because any architecture that permitted it would
      by definition permit the attack. The correct engineering response is to refuse the requirement
      and negotiate a narrower one — a fixed set of actions the email may trigger, with confirmation.`,
  },
  {
    q: `You have a naive agent in production and one week of engineering time. What gives the most risk
        reduction?`,
    options: [
      `Add an injection classifier to the input path.`,
      `Fix the tool sequence for the common path before the first untrusted fetch, treating deviations as approval events.`,
      `Switch to a larger model.`,
      `Add datamarking to retrieved content.`,
    ],
    answer: 1,
    explain: `Partial plan-then-execute removes an entire class ("the injection adds a step the user
      never asked for") and is usually achievable in days, because most agents have a small number of
      common paths. Datamarking is worth doing and takes an hour, but it is a cost-raising control; the
      input classifier is in the wrong place for indirect injection (A17); and a larger model changes
      the rate without changing the ceiling.`,
  },
];

export const refs = [
  { authors: 'Luca Beurer-Kellner, Beat Buesser, Ana-Maria Creţu, Edoardo Debenedetti, Daniel Dobos, Daniel Fabian, Marc Fischer, David Froelicher, Kathrin Grosse, Daniel Naeff, Ezinwanne Ozoani, Andrew Paverd, Florian Tramèr, Václav Volhejn',
    title: 'Design Patterns for Securing LLM Agents against Prompt Injections', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2506.08837',
    note: 'the six-pattern catalogue this chapter is organised around' },
  { authors: 'Simon Willison', title: 'The Dual LLM pattern for building AI assistants that can resist prompt injection',
    venue: 'simonwillison.net, 2023', url: 'https://simonwillison.net/2023/Apr/25/dual-llm-pattern/' },
  { authors: 'Edoardo Debenedetti, Ilia Shumailov, Tianqi Fan, Jamie Hayes, Nicholas Carlini, Daniel Fabian, Christoph Kern, Chongyang Shi, Andreas Terzis, Florian Tramèr',
    title: 'Defeating Prompt Injections by Design (CaMeL)', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.18813' },
  { authors: 'Authors of "CaMeLs Can Use Computers Too"',
    title: 'CaMeLs Can Use Computers Too: System-level Security for Computer Use Agents', venue: 'arXiv, 2026',
    url: 'https://arxiv.org/pdf/2601.09923' },
  { authors: 'Google Security Team', title: 'An Introduction to Google\'s Approach to AI Agent Security',
    venue: 'Google Research, 2025',
    url: 'https://research.google/pubs/an-introduction-to-googles-approach-for-secure-ai-agents/' },
  { authors: 'Google GenAI Security Team', title: 'Mitigating prompt injection attacks with a layered defense strategy',
    venue: 'Google Security Blog, 2025',
    url: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
  { authors: 'Fangzhou Wu, Ethan Cecchetti, Chaowei Xiao',
    title: 'System-Level Defense against Indirect Prompt Injection Attacks: An Information Flow Control Perspective',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2409.19091' },
  { authors: 'Yuhao Wu, Franziska Roesner, Tadayoshi Kohno, Ning Zhang, Umar Iqbal',
    title: 'SecGPT: An Execution Isolation Architecture for LLM-Based Systems', venue: 'NDSS, 2025',
    url: 'https://arxiv.org/abs/2403.04960' },
  { authors: 'Eugene Bagdasaryan, Ren Yi, Sahra Ghalebikesabi, Peter Kairouz, Marco Gruteser, Sewoong Oh, Borja Balle, Daniel Ramage',
    title: 'AirGapAgent: Protecting Privacy-Conscious Conversational Agents', venue: 'ACM CCS, 2024',
    url: 'https://dl.acm.org/doi/10.1145/3658644.3690350' },
];
