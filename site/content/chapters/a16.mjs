import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, range, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 12, attacks: 'the attack that steals nothing' };
export const scripts = ['/assets/js/sims/a16.js'];

export const body = `
${p(`Every other chapter in this part is about an attacker taking something. This one is about an
attacker taking nothing and costing you a great deal anyway, by making the agent think for a very
long time, call tools in a loop, or occupy a queue that real users need.`)}

${h2('Amplification: a small input, a large bill', 'amplification')}

${table(
  ['Scenario', 'Calls', 'Tokens', 'Cost'],
  [
    ['Normal request', '1', '1,200', '$0.004'],
    ['"Summarise in detail, then critique your summary, twenty times"', '1', '340,000', '$1.02'],
    ['Recursive tool loop — each call re-reads a growing context', '40', '1,230,000', '$3.69'],
    ['Fan-out: "research each of these 500 items"', '500', '1,000,000', '$3.00'],
  ]
)}

${p(`The numbers are per request. An attacker with a script and no rate limit runs them continuously,
and the interesting property is that none of this requires a vulnerability. Every one of those is the
agent working exactly as designed, on a request it was built to accept.`)}

${callout('attack', 'The stealthy version', `<p style="margin-bottom:0">"Beyond Max Tokens" (2026)
describes a modified MCP tool server that returns slightly-expanded results each round, inflating the
agent's context every iteration. Reported cost inflation up to <b>658×</b>, and it is stealthy because
each individual response looks reasonable. Only the trajectory shows the growth. Your
<code>max_tokens</code> cap does not help, because the attack is in the number of rounds and the
growth per round, not in any single response.</p>`)}

${h2('Budgets, and where each one has to live', 'budgets')}

${sim({
  name: 'a16budget',
  title: 'A runaway loop against a budget enforcer',
  controls: [
    select('a16-atk', 'Attack', [
      ['recursive', 'Recursive loop — context grows each round'],
      ['mcp', 'MCP amplifier — tool inflates its own results'],
      ['fanout', 'Fan-out — 500 sub-tasks'],
      ['normal', 'A normal request (control)'],
    ], 'recursive'),
    range('a16-steps', 'Max steps', 2, 40, 8, 1),
    range('a16-cost', 'Max spend', 5, 500, 50, 5, '¢'),
    toggle('a16-size', 'Cap tool result size at 4 KB', false),
  ].join(''),
  body: out('a16-out'),
  note: `Notice which cap fires first for each attack, and that the result-size cap is the only one
    that stops the MCP amplifier <em>early</em> rather than after it has already run up most of the
    bill. Budgets are cheap; choosing the right ones requires knowing the attack.`,
})}

${code(`class Budget:
    def __init__(self, max_steps=8, max_tokens=50_000,
                 max_cost=0.50, max_tool_calls=12):
        ...

    def charge(self, tokens=0, tool_call=False):
        self.steps += 1
        self.tokens += tokens
        self.tool_calls += 1 if tool_call else 0
        for name, cur, cap in [("steps", self.steps, self.max_steps),
                               ("tokens", self.tokens, self.max_tokens),
                               ("cost", cost(self.tokens), self.max_cost),
                               ("tool_calls", self.tool_calls, self.max_tool_calls)]:
            if cur > cap:
                return f"BUDGET EXCEEDED: {name} {cur:.2f} > {cap}"
        return None`, { lang: 'py', file: 'code/a16_resource_attacks.py', tag: 'safe' })}

${h2('The four scopes a budget can have', 'scopes')}

${kv([
  ['Per run', `Steps, wall-clock, tokens, tool calls, spend. Stops one runaway task. This is the one
    most teams have, and on its own it means an attacker just starts a thousand runs.`],
  ['Per identity', `Requests per minute, concurrent runs, daily spend. This is the one that actually
    closes denial-of-wallet, and it is ten lines of code.`],
  ['Per tool', `Call count and, importantly, <b>result-size cap</b>. The size cap is what kills the
    MCP amplifier, because it bounds the growth per round rather than the total.`],
  ['Per tenant', `Shared-queue admission control, so one customer's runaway task cannot deny service
    to the others. The failure mode people forget until it happens.`],
])}

${h2('Reasoning-loop exhaustion and guardrail DoS', 'loops')}

${p(`Two variants worth naming because they defeat naive budgets:`)}

${ul([
  `<b>Overthinking attacks.</b> CODE (2026) constructs contradiction-laden poisoning samples for RAG
   systems with reasoning models, causing excessive reasoning-token consumption <em>without degrading
   task accuracy</em>. The output is correct, so quality monitoring sees nothing; only the token
   meter moves.`,
  `<b>Guardrail denial of service.</b> If your safety layer is itself a model, an attacker can target
   the guardrail rather than the agent. Inputs that push the classifier into long reasoning loops
   exhaust the defence and, depending on your failure mode, either block legitimate traffic or fail
   open. Decide which, explicitly, before it happens.`,
])}

${callout('warn', 'Fail open or fail closed?', `<p style="margin-bottom:0">When the guardrail times
out, does the request proceed or get rejected? Both answers are defensible and the wrong one is
whichever you did not choose deliberately. Failing open under load turns a resource attack into an
injection window; failing closed turns it into an outage. Write it down, test it, and make sure the
behaviour under load matches what you wrote.</p>`)}

${h2('Why this chapter exists', 'why')}

${p(`Denial of wallet is the attack teams forget because it steals nothing. It shows up as a surprising
invoice, or as a queue that has been slow for a week, and it is often diagnosed as a capacity problem
rather than as an attack. The controls are among the cheapest in the whole course (a per-identity
spend cap is a few lines), and they are frequently absent entirely because nobody assigned the risk to
anyone.`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Name four budget scopes and say which attack each one closes.`,
  `Explain why a <code>max_tokens</code> cap does not stop the MCP amplification attack.`,
  `Describe an attack that increases cost without degrading output quality.`,
  `State your system's guardrail failure mode under load, deliberately.`,
])}
`;

export const quiz = [
  {
    q: `Why does a <code>max_tokens</code> limit fail to stop the MCP amplification attack?`,
    options: [
      `The attack bypasses the token counter.`,
      `The cap bounds each individual response, while the attack works through the number of rounds and the growth per round.`,
      `MCP servers are exempt from token limits.`,
      `The limit applies only to input tokens.`,
    ],
    answer: 1,
    explain: `Each response stays comfortably under the cap and looks reasonable in isolation, which
      is what makes the attack stealthy. The cost accumulates across iterations as the tool returns
      slightly more each time and the growing context is re-read on every round. Two controls match
      the attack: a per-run token or spend budget over the whole trajectory, and a per-tool
      result-size cap that bounds the growth rather than the total.`,
  },
  {
    q: `A team has a per-run step limit of 8 and no other budget. What attack remains open?`,
    options: [
      `Recursive loops within a single run.`,
      `Launching a thousand concurrent runs — nothing bounds the attacker's aggregate consumption.`,
      `Prompt injection.`,
      `Tool poisoning.`,
    ],
    answer: 1,
    explain: `A per-run cap bounds one task and says nothing about how many tasks an identity may
      start. This is the most common gap. The obvious limit is per-run because that is where the loop
      lives, and the attack simply parallelises. A per-identity budget covering requests per minute,
      concurrent runs and daily spend is what closes denial of wallet, and it is a handful of lines
      sitting in front of the agent rather than inside it.`,
  },
  {
    q: `An attack increases reasoning-token consumption without changing output quality. Why is this
        particularly hard to notice?`,
    options: [
      `It only happens at night.`,
      `Quality monitoring and correctness tests see nothing wrong, so the only signal is on the cost meter, which is usually watched by a different team.`,
      `The tokens are not billed.`,
      `It requires an insider.`,
    ],
    answer: 1,
    explain: `This is the CODE overthinking attack's key property: task accuracy is preserved. Every
      evaluation you run reports healthy, whether that is correctness, latency SLOs or user
      satisfaction. The only
      indicator is spend per request, which typically lives in a finance dashboard rather than a
      security one. It is a good argument for putting cost-per-request in the same monitoring surface
      as your other agent telemetry (A26).`,
  },
  {
    q: `Your guardrail model times out under load. Should the request proceed?`,
    options: [
      `Always proceed, because availability matters more.`,
      `Always reject, because security matters more.`,
      `Either is defensible, but the wrong answer is whichever you did not choose deliberately and test.`,
      `Retry indefinitely until the guardrail responds.`,
    ],
    answer: 2,
    explain: `Failing open under load turns a resource attack into an injection window; failing
      closed turns it into an outage that an attacker can trigger at will. Which trade-off is correct
      depends on what your agent does. A coding assistant and a payments agent should choose
      differently. What is never correct is discovering the behaviour during an incident, and
      retrying indefinitely is just failing closed with extra cost.`,
  },
  {
    q: `Which budget scope closes the shared-queue starvation case, where one tenant's runaway task
        denies service to others?`,
    options: [
      `Per run.`,
      `Per identity.`,
      `Per tenant admission control on the shared queue.`,
      `Per tool.`,
    ],
    answer: 2,
    explain: `Per-run and per-identity budgets bound consumption but not queue occupancy. A tenant
      within their spend limit can still fill the queue and starve everyone else. Admission control at
      the tenant level, whether reserved capacity or fair queuing, is what preserves service for the
      other customers. This is the scope teams add last, usually after the first incident where a paying
      customer's agent was slow for a week because of somebody else.`,
  },
  {
    q: `Why is denial of wallet frequently misdiagnosed?`,
    options: [
      `It produces no logs.`,
      `It steals nothing, so it surfaces as a surprising invoice or a slow queue and gets attributed to capacity rather than to an attack.`,
      `It only affects small deployments.`,
      `The attack traffic is encrypted.`,
    ],
    answer: 1,
    explain: `There is no breach, no exfiltration and no obvious victim — just cost. The symptoms
      look exactly like organic growth or a performance regression, so the investigation goes to the
      infrastructure team and stops when someone adds capacity. Making the diagnosis possible means
      having per-identity cost attribution in your telemetry, which is the same instrumentation the
      budgets need anyway.`,
  },
];

export const refs = [
  { authors: 'Authors of "Beyond Max Tokens"', title: 'Beyond Max Tokens: Stealthy Resource Amplification via Tool Calling Chains in LLM Agents',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.10955',
    note: 'up to 658× cost inflation through an MCP-compatible tool server' },
  { authors: 'Authors of CODE', title: 'CODE: A Contradiction-Based Deliberation Extension Framework for Overthinking Attacks on Retrieval-Augmented Generation',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.13112' },
  { authors: 'Authors of DRAINCODE', title: 'DRAINCODE: Stealthy Energy Consumption Attacks on Retrieval-Augmented Code Generation via Context Poisoning',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.20615' },
  { authors: 'Authors of SHIELD', title: 'SHIELD: An Auto-Healing Agentic Defense Framework for LLM Resource Exhaustion Attacks',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.19174' },
  { authors: 'OWASP Top 10 for LLM Applications team', title: 'LLM10:2025 Unbounded Consumption',
    venue: 'OWASP, 2025', url: 'https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'compute misuse at 13 sources; rate limiting recommended by 9' },
];
