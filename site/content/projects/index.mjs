import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, sim, out, pill } from '../../lib/components.mjs';

const deliverable = (items) => callout('defense', 'Deliverable', `<ul style="margin-bottom:0">${items.map(i => `<li>${i}</li>`).join('')}</ul>`);
const check = (items) => `<h3 id="done">You are done when</h3>${ul(items)}`;

/* ============================================================ P1 ======== */
const P1 = {
  body: `
${p(`Every defence in this course starts from a threat model, and a threat model you did not build
yourself is a threat model you do not believe. This project produces one — for an agent you actually
use, not a toy — using nothing but the reading from Part 1.`)}

${h2('Pick a target', 'target')}
${p(`Choose a real agent you have access to: a coding assistant, a browsing or research agent, an
inbox or calendar assistant, a customer-support bot, a data-analysis agent. It does not have to be one
you built. It does have to be one whose tools and data you can enumerate honestly.`)}
${callout('note', 'If you have nothing suitable', `<p style="margin-bottom:0">Use the lab agent you
will build in Project 2, specified rather than built: a research agent with a web tool, a file tool and
an email tool, running under your credentials. The exercise is the same.</p>`)}

${h2('Step 1 — draw the architecture', 'architecture')}
${p(`On one page, following the reference architecture from <a href="/chapters/a04/">A04</a>: the LLM
engine, the orchestration loop, every tool, every data source, every other agent or human it hands off
to, and the identity each component acts under. If you cannot draw it, you cannot secure it, and the
gaps in your drawing are findings.`)}
${deliverable(['A one-page architecture diagram with every component, data source, and trust boundary marked.'])}

${h2('Step 2 — the four questions', 'four-questions')}
${p(`From <a href="/chapters/a01/">A01</a>, answered concretely for your target:`)}
${steps([
  ['What enters the context that a stranger can write?', `Enumerate every tool that returns bytes and
    name who controls those bytes. This is your injection surface.`],
  ['What can the agent do, and with whose authority?', `Every tool, its credential, and the blast
    radius of its worst call. This is your action surface.`],
  ['What can leave, and by what route?', `Every exfiltration channel, including the ones that are not
    network access — rendered images, links, synced files, peer agents (<a href="/chapters/a09/">A09</a>).`],
  ['What is irreversible?', `Sort the action surface by reversibility (<a href="/chapters/a24/">A24</a>).`],
])}

${h2('Step 3 — score the trifecta', 'trifecta')}
${p(`Apply the <a href="/chapters/a03/">A03</a> test — and apply it over paths, not just the single
agent (<a href="/chapters/a15/">A15</a>). Does your system, taken as a whole, hold all three legs? If
so, which leg is cheapest to cut, and what would cutting it cost in capability?`)}

${h2('Step 4 — walk the taxonomy', 'taxonomy')}
${p(`Go through all 25 vulnerability classes on <a href="/threats/">the threat map</a>. For each,
write "applicable" or "not applicable — because…". The "because" column is the deliverable: it is where
you discover the assumptions you cannot justify.`)}
${deliverable(['A 25-row table, each class marked applicable or not, with a one-line justification for every "not".'])}

${h2('Step 5 — rank and recommend', 'rank')}
${p(`Produce a ranked risk register: the applicable threats, ordered by (blast radius × likelihood),
each mapped to a control category from <a href="/defenses/">the defence map</a> and labelled as
"bounds damage" or "raises cost". Top three get a concrete first mitigation.`)}
${deliverable(['A ranked risk register (threat → components → control → class), top three with a concrete next step.'])}

${check([
  'You can state your agent\'s injection, action and exfiltration surfaces from memory.',
  'You have a "not applicable because…" line for every threat class you excluded.',
  'Your top three risks each map to a specific control, correctly classified as bounding or cost-raising.',
  'Someone who has not seen your agent could read the document and understand its risk posture.',
])}`,
  refs: [
    { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
      title: 'SoK: Bridging Research and Practice in LLM Agent Security', venue: 'CMU SEI, 2025',
      url: 'https://doi.org/10.1184/R1/30610928', note: 'the reference architecture and the repeatable-assessment method' },
    { authors: 'Ken Huang, Vineeth Sai Narajala and the CSA AI Safety Initiative', title: 'Agentic AI Threat Modeling Framework: MAESTRO',
      venue: 'Cloud Security Alliance, 2025', url: 'https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro' },
    { authors: 'Simon Willison', title: 'The lethal trifecta for AI agents', venue: 'simonwillison.net, 2025',
      url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/' },
  ],
};

/* ============================================================ P2 ======== */
const P2 = {
  body: `
${p(`Now you land the attacks yourself. This project builds a deliberately vulnerable agent and lands
four end-to-end exploits against it — the four from Part 2. The agent you build here is the one you
keep for Projects 3, 4 and 5, so build it to last.`)}

${callout('warn', 'Rules of engagement', `<p style="margin-bottom:0">Everything here runs against your
own lab agent, offline, using the in-memory fake tools from <code>agentlib.py</code>. Do not point
these attacks at any system you do not own or have written authorisation to test. The interesting part
is the defence you build in Project 4 anyway.</p>`)}

${h2('Step 1 — build the vulnerable agent', 'build')}
${p(`Start from the course library. A minimal target needs a web tool, an email tool and a file tool,
running under one identity with no restrictions:`)}
${code(`import agentlib as A
from agentlib import Agent, make_tools

agent = Agent(tools=make_tools("http_get", "send_email", "read_file", "write_file"))
answer, ctx = agent.run("Summarise https://blog.example/post")`, { lang: 'py', file: 'lab.py' })}
${deliverable(['A runnable lab agent with at least a web, email and file tool, and a fixture "web" you control.'])}

${h2('Step 2 — land the four attacks', 'attacks')}
${p(`One working exploit for each, each a script that asserts its own success:`)}
${steps([
  ['Direct override (<a href="/chapters/a06/">A06</a>)', `Extract the system prompt, then override the
    task. Show that a keyword filter you add is defeated by rephrasing.`],
  ['Indirect injection (<a href="/chapters/a07/">A07</a>)', `Plant a payload in the fixture page and
    make the agent read a secret and email it — with the user asking only for a summary.`],
  ['Environmental injection (<a href="/chapters/a08/">A08</a>)', `Deliver the payload where a human
    reviewer would not see it: an HTML comment, white-on-white text, or an image\'s alt text.`],
  ['Exfiltration (<a href="/chapters/a09/">A09</a>)', `Get the secret out by two different channels,
    at least one of which is not a direct <code>send_email</code> — a markdown image URL, or a
    DNS-shaped hostname.`],
])}
${deliverable(['Four scripts, one per attack, each ending in an assertion that the attack succeeded.'])}

${h2('Step 3 — vary and measure', 'measure')}
${p(`For the indirect injection, write five payload variants (comment, fake-system, white-on-white,
helpful-framing, and one of your own) and record which succeed. You are building the attack set you
will evaluate defences against in Project 5, so keep it in a structured form.`)}

${h2('Step 4 — write it up', 'writeup')}
${p(`A short report: for each attack, the payload, the delivery vector, the channel, and the single
control class that would bound it. This is your specification for Project 4.`)}

${check([
  'Four attacks land end-to-end against your lab agent, each verified by an assertion.',
  'You have demonstrated that an input keyword filter is defeated by rephrasing.',
  'At least one exfiltration channel you used is not a direct tool call.',
  'Your write-up names, for each attack, the control class that would bound it.',
])}`,
  refs: [
    { authors: 'Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz, Mario Fritz',
      title: 'Not What You\'ve Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection',
      venue: 'ACM AISec, 2023', url: 'https://arxiv.org/abs/2302.12173' },
    { authors: 'Edoardo Debenedetti, Jie Zhang, Mislav Balunović, Luca Beurer-Kellner, Marc Fischer, Florian Tramèr',
      title: 'AgentDojo', venue: 'NeurIPS, 2024', url: 'https://arxiv.org/abs/2406.13352' },
    { authors: 'Johann Rehberger', title: 'ChatGPT Operator: Prompt Injection Exploits and Defenses', venue: 'Embrace The Red, 2025',
      url: 'https://embracethered.com/blog/posts/2025/chatgpt-operator-prompt-injection-exploits/' },
  ],
};

/* ============================================================ P3 ======== */
const P3 = {
  body: `
${p(`Part 3 attacked the components an agent depends on. This project reproduces those attacks against
your lab agent and — the harder half — builds the scanner or control that would have caught each
one.`)}

${h2('Step 1 — a malicious MCP-style tool', 'tool')}
${p(`Write a tool whose <em>description</em> carries a line-jumping payload (<a href="/chapters/a11/">A11</a>).
Turn on <code>agentlib.SCAN_SYSTEM</code> so descriptions reach the model, and show the agent acting on
the description before the tool is ever called. Then write the manifest scanner and the hash-pin check
that would have flagged it.`)}
${deliverable(['A poisoned tool that fires at listing time, plus a scanner and a fingerprint check that catch it.'])}

${h2('Step 2 — a persistent memory attack', 'memory')}
${p(`Poison a small RAG corpus so a crafted document outranks the real answer
(<a href="/chapters/a12/">A12</a>), and show it firing across multiple simulated user sessions. Then
implement the provenance filter that stops a tool-derived memory entry from becoming a preference.`)}
${deliverable(['A corpus-poisoning demo that fires across sessions, plus a provenance filter that neutralises it.'])}

${h2('Step 3 — a poisoned skill', 'skill')}
${p(`Write a skill manifest with an exfiltration instruction phrased as an ordinary business
requirement (<a href="/chapters/a13/">A13</a>). Run it through your Part 3 scanner. Then demonstrate the
control that holds even when the scanner misses: scope the skill's declared tools so the payload fails
at the tool layer.`)}

${h2('Step 4 — propagate across two agents', 'multi')}
${p(`Wire two lab agents together and land a prompt-infection payload that instructs the first to
forward itself to the second (<a href="/chapters/a15/">A15</a>). Then implement inter-agent message
quarantine and show propagation stopping at patient zero.`)}
${deliverable(['A two-agent propagation demo, plus a quarantine control that halts it.'])}

${h2('Step 5 — the resource attack', 'resource')}
${p(`Optional but recommended: build the recursive-loop or MCP-amplification attack from
<a href="/chapters/a16/">A16</a> and the budget enforcer that stops it, reporting how late each budget
scope fires.`)}

${check([
  'You have reproduced tool poisoning, memory poisoning, a poisoned skill, and multi-agent propagation.',
  'For each attack, you have built the control that catches or bounds it.',
  'You can state, for each control, whether it raises cost or bounds damage.',
  'Your memory and quarantine controls are enforced by code, not by asking the model.',
])}`,
  refs: [
    { authors: 'Invariant Labs', title: 'MCP Security Notification: Tool Poisoning Attacks', venue: 'Invariant Labs, 2025',
      url: 'https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks' },
    { authors: 'Wei Zou, Runpeng Geng, Binghui Wang, Jinyuan Jia', title: 'PoisonedRAG', venue: 'USENIX Security, 2025',
      url: 'https://arxiv.org/abs/2402.07867' },
    { authors: 'Donghyun Lee, Mo Tiwari', title: 'Prompt Infection: LLM-to-LLM Prompt Injection within Multi-Agent Systems',
      venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2410.07283' },
    { authors: 'Authors of "Agent Skills in the Wild"', title: 'Agent Skills in the Wild: An Empirical Study of Security Vulnerabilities at Scale',
      venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.10338' },
  ],
};

/* ============================================================ P4 ======== */
const P4 = {
  body: `
${p(`This is the project that matters most. You take the lab agent that lost to every attack in
Projects 2 and 3, rebuild it behind a defence stack, and re-run every attack — accounting for each
outcome. The goal is not "0% attack success". The goal is a system where you can <em>say why</em> each
attack fails, and each reason is a property rather than a probability.`)}

${h2('The stack', 'stack')}
${p(`Five layers, from <a href="/chapters/a18/">A18</a> through <a href="/chapters/a24/">A24</a>. Build
them in this order, because each one lets you weaken your reliance on the one before:`)}
${steps([
  ['Spotlighting (<a href="/chapters/a18/">A18</a>)', `Datamark every untrusted span with a per-request
    random sentinel. Cheap, and it removes the fence-forging attacks. Note in your report that this is a
    cost-raising layer.`],
  ['A capability-tagged data layer (<a href="/chapters/a21/">A21</a>)', `Tag every value with its
    provenance; enforce a reader policy at every sink. This is the layer that makes the injection
    <em>not matter</em>. Port the <code>Tagged</code> class from the chapter.`],
  ['Scoped credentials (<a href="/chapters/a22/">A22</a>)', `Mint a task token with the minimum scope,
    the minimum resource set and the shortest workable TTL. The email tool is not in the summarisation
    task\'s capability set at all.`],
  ['An egress allow-list (<a href="/chapters/a23/">A23</a>)', `Enforce it correctly — the four checks
    from the chapter — and below the agent, not inside it. This closes the exfiltration channels the
    capability layer did not.`],
  ['A reversibility-graded approval gate (<a href="/chapters/a24/">A24</a>)', `For whatever
    irreversible actions remain, a prompt that shows the data, the recipient and the provenance — and
    offers "stop the task".`],
])}
${deliverable(['A hardened lab agent with all five layers, each toggleable so you can measure its individual contribution.'])}

${h2('Re-run everything', 'rerun')}
${p(`Every attack from Projects 2 and 3, against the hardened agent. For each, record: did the model
get compromised? Did the attack achieve anything? Which layer stopped it? Report compromise and damage
<em>separately</em> — a bounded compromise is still worth knowing about (<a href="/chapters/a07/">A07</a>).`)}
${deliverable(['A results table: attack × (compromised? damage? stopped-by), for every attack you have built.'])}

${h2('Ablate', 'ablate')}
${p(`Turn each layer off in turn and re-run. This tells you which layer is actually carrying each
defence, and it will surprise you — some attacks are stopped by three layers and some by exactly one.
The single-point-of-failure attacks are the ones to worry about.`)}

${h2('The honesty section', 'honesty')}
${p(`Write down what your stack does <em>not</em> stop: the human channel, model-level threats,
anything the task\'s legitimate capabilities themselves enable, and any attack you have not thought to
build. This section is the mark of a real defence review.`)}

${check([
  'Every Project 2 and 3 attack fails against the hardened agent.',
  'For each attack you can name the layer that stops it and whether it bounds or merely raises cost.',
  'Your ablation identifies every attack that has a single point of failure in your stack.',
  'You have written an honest list of what the stack does not protect against.',
])}`,
  refs: [
    { authors: 'Luca Beurer-Kellner, Marc Fischer, Florian Tramèr and colleagues', title: 'Design Patterns for Securing LLM Agents against Prompt Injections',
      venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.08837' },
    { authors: 'Edoardo Debenedetti, Ilia Shumailov, Nicholas Carlini, Florian Tramèr and colleagues', title: 'Defeating Prompt Injections by Design (CaMeL)',
      venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2503.18813' },
    { authors: 'Google GenAI Security Team', title: 'Mitigating prompt injection attacks with a layered defense strategy',
      venue: 'Google Security Blog, 2025', url: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
  ],
};

/* ============================================================ P5 ======== */
const P5 = {
  body: `
${p(`You have a hardened agent. This project produces the evidence that it works — a harness, an
adaptive red-team against your own defences, runtime telemetry, and the runbook for when it fails
anyway.`)}

${h2('Step 1 — the harness', 'harness')}
${p(`An AgentDojo-shaped suite over your lab agent (<a href="/chapters/a25/">A25</a>): every case
carries a utility check and an attack check, and every run reports attack success rate <em>and</em>
utility retention. Include at least one benign task that a paranoid policy would break, so your utility
number can move.`)}
${deliverable(['A harness that reports the paired metric over a documented case list, runnable on one command.'])}

${h2('Step 2 — the adaptive red-team', 'adaptive')}
${p(`The hard part (<a href="/chapters/a19/">A19</a>). Give yourself white-box access to your own
defence — you wrote it — and a fixed budget. Iterate: read the result, revise the payload, re-run.
Record the attack success rate as a function of effort, and report it with the budget attached.`)}
${callout('warn', 'The finding to expect', `<p style="margin-bottom:0">Your spotlighting and any
classifier layer will fall to adaptive payloads. Your capability, egress and reversibility layers
should not, because they do not read the payload. If an adaptive attack beats one of those, you have
found a real bug — write it up; it is the most valuable output of the project.</p>`)}

${h2('Step 3 — runtime telemetry', 'telemetry')}
${p(`Ship trajectory logging with the four fields from <a href="/chapters/a26/">A26</a>: causality,
provenance, hash-chaining, and policy denials. Add a structural drift detector and one aggregate signal
(a rare-destination counter closes the slow channel). Show the log catching an attack the static suite
missed.`)}
${deliverable(['A logged, hash-chained trajectory with a working drift detector and one aggregate signal.'])}

${h2('Step 4 — the runbook', 'runbook')}
${p(`The incident-response playbook from <a href="/chapters/a27/">A27</a>, specialised to your agent:
the detection signals, the containment steps (revoke the agent token, not the user\'s), the
memory-purge-by-provenance step, and the "identify the poisoned source" step. Then rehearse it once
against a real attack from your suite.`)}

${h2('Step 5 — the report', 'report')}
${p(`Pull it together: the paired metric, the adaptive result with its budget, the ablation from
Project 4, and the honest "does not cover" section. This is a document you could hand to someone
deciding whether to deploy the agent — which is the whole point of Part 6.`)}

${check([
  'Your harness reports attack success and utility retention on the same run.',
  'You have an adaptive result reported with an explicit attacker budget.',
  'Your telemetry catches at least one attack the static suite does not.',
  'You have rehearsed the runbook once, end to end, and it worked.',
])}`,
  refs: [
    { authors: 'Qiusi Zhan, Richard Fang, Henil Shalin Panchal, Daniel Kang', title: 'Adaptive Attacks Break Defenses Against Indirect Prompt Injection Attacks on LLM Agents',
      venue: 'NAACL, 2025', url: 'https://arxiv.org/abs/2503.00061' },
    { authors: 'Sahar Abdelnabi and colleagues', title: 'Get My Drift? Catching LLM Task Drift with Activation Deltas', venue: 'IEEE SaTML, 2025',
      url: 'https://arxiv.org/abs/2406.00799' },
    { authors: 'Nicholas Carlini and colleagues', title: 'On Evaluating Adversarial Robustness', venue: 'arXiv, 2019',
      url: 'https://arxiv.org/abs/1902.06705' },
  ],
};

export const PROJECT_BODIES = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 };
