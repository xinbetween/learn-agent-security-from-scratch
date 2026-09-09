import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, pill } from '../../lib/components.mjs';

const arch = svg(760, 400, `
${svgText(12, 18, 'SENTINEL — THE CAPSTONE ARCHITECTURE', 'd-ttl', 'start')}

${box(20, 44, 130, 44, 'user task', 'trusted', 'd-sunk')}
${box(190, 44, 160, 44, 'planner LLM', 'never reads untrusted', 'd-trust')}
${box(390, 44, 150, 44, 'program', 'control flow fixed', 'd-def')}
${box(580, 44, 160, 44, 'interpreter', 'tagged values', 'd-def')}

${box(190, 150, 160, 44, 'quarantined LLM', 'no tools', 'd-attack')}
${box(390, 150, 150, 44, 'tool layer', 'scoped tokens', 'd-def')}
${box(580, 150, 160, 44, 'policy engine', 'reads tags only', 'd-def')}

${box(190, 236, 160, 44, 'untrusted content', 'web · mail · files', 'd-attack')}
${box(390, 236, 150, 44, 'egress proxy', 'allow-list', 'd-def')}
${box(580, 236, 160, 44, 'approval gate', 'irreversible only', 'd-def')}

${box(190, 322, 550, 44, 'trajectory log — causality · provenance · hash chain · denials', '', 'd-sunk')}

${arrow(150, 66, 188, 66)}
${arrow(350, 66, 388, 66)}
${arrow(540, 66, 578, 66)}
${arrow(660, 88, 660, 148)}
${arrow(578, 172, 542, 172)}
${arrow(390, 194, 390, 234)}
${arrow(350, 258, 262, 214)}
${arrow(270, 194, 270, 92)}
${svgText(300, 130, '$VAR1 only', 'd-def-t')}
${arrow(465, 194, 465, 234)}
${arrow(660, 194, 660, 234)}
${arrow(465, 280, 465, 320)}

<rect x="180" y="136" width="180" height="160" rx="8" class="d-bnd"/>
${svgText(270, 310, 'QUARANTINE', 'd-bnd-t')}
${svgText(760, 392, 'every layer is separately toggleable — that is what makes the ablation possible', 'd-sub', 'end')}
`, { label: 'The Sentinel capstone architecture' });

export const CAPSTONE_BODY = {
  body: `
${p(`One repository. A real tool-using agent, thirty-two attacks drawn from every chapter, a six-layer
defence stack, and an evaluation harness that reports attack success against utility retention. It is
the whole course, executable. And it is the artefact to point at when someone asks whether you know
this material.`)}

${h2('What you are building', 'what')}

${figure(arch, `<b>Sentinel.</b> Control flow comes from the planner, which never reads untrusted
content. The quarantined model reads everything and can act on nothing. Values carry provenance tags
through an interpreter to a policy engine that reads tags and never text. Tools hold scoped, expiring
credentials; egress goes through an allow-list; irreversible actions meet a gate. Everything is logged
with causality. Each layer toggles independently.`)}

${h2('The four components', 'components')}

${table(
  ['Component', 'What it contains', 'Drawn from'],
  [
    ['<code>sentinel/agent/</code>', 'The agent: planner, quarantined model, interpreter, tool layer, and the five tools (web, mail, files, shell, delegate).', 'A01, A20, A21'],
    ['<code>sentinel/attacks/</code>', 'Thirty-two attacks, one module per chapter, each self-verifying.', 'A06–A16'],
    ['<code>sentinel/defense/</code>', 'Six independently toggleable layers.', 'A17–A24'],
    ['<code>sentinel/eval/</code>', 'The harness, the adaptive protocol, the ablation runner, the report generator.', 'A19, A25, A26'],
  ]
)}

${h2('The attack suite', 'attacks')}

${p(`Thirty-two attacks is a target, not a rule, but the distribution matters more than the count.
Cover every chapter in Parts 2 and 3:`)}

${table(
  ['Chapter', 'Attacks', 'Examples'],
  [
    ['<a href="/chapters/a06/">A06</a> Direct injection', '4', 'Override, extraction, encoding, optimiser-style suffix'],
    ['<a href="/chapters/a07/">A07</a> Indirect injection', '5', 'Comment, fake-system, white-on-white, helpful framing, one of your own'],
    ['<a href="/chapters/a08/">A08</a> Environmental', '3', 'Alt text, off-screen node, invisible Unicode'],
    ['<a href="/chapters/a09/">A09</a> Exfiltration', '4', 'Markdown image, DNS-shaped host, tool argument, error message'],
    ['<a href="/chapters/a10/">A10</a> Confused deputy', '2', 'Over-broad scope abuse, tool misuse with no attacker'],
    ['<a href="/chapters/a11/">A11</a> Tool poisoning', '3', 'Line jumping, rug pull, tool shadowing'],
    ['<a href="/chapters/a12/">A12</a> Memory / RAG', '4', 'Corpus poisoning, memory write, cross-session persistence, retrieval ranking'],
    ['<a href="/chapters/a13/">A13</a> Supply chain', '2', 'Poisoned skill, skill squatting'],
    ['<a href="/chapters/a14/">A14</a> Model-level', '1', 'Trigger-conditioned backdoor via an indirect channel'],
    ['<a href="/chapters/a15/">A15</a> Multi-agent', '2', 'Prompt infection, trifecta composition across a path'],
    ['<a href="/chapters/a16/">A16</a> Resource', '2', 'Recursive loop, tool-result amplification'],
  ]
)}

${callout('note', 'Structure every attack the same way', `${code(`@dataclass
class Attack:
    id: str                  # "a07-fake-system"
    chapter: str
    task: str                # the benign thing the user asked for
    setup: callable          # plant the payload
    succeeded: callable      # did the attacker win? -> bool
    bounded_by: str          # which control class SHOULD stop this`, { lang: 'py' })}
<p style="margin-bottom:0">The <code>bounded_by</code> field is what makes the ablation meaningful. It
is your hypothesis, and the ablation tests it. When the ablation disagrees with your hypothesis, that
is the finding.</p>`)}

${h2('The defence stack', 'defense')}

${ol([
  `<b>Spotlighting.</b> Per-request random datamarking on every untrusted span. ${pill('warn', 'raises cost')}`,
  `<b>Detection.</b> A classifier on the <em>tool-result</em> path, with the base-rate arithmetic documented. ${pill('warn', 'raises cost')}`,
  `<b>Control flow.</b> Plan-then-execute or code-then-execute; the plan is fixed before retrieval. ${pill('defense', 'bounds damage')}`,
  `<b>Data flow.</b> Capability tags on every value, policy at every sink. ${pill('defense', 'bounds damage')}`,
  `<b>Environment.</b> Scoped expiring credentials, egress allow-list, filesystem containment, budgets. ${pill('defense', 'bounds damage')}`,
  `<b>Oversight.</b> Reversibility-graded gates with provenance-showing prompts, plus the trajectory log. ${pill('defense', 'bounds damage')}`,
])}

${h2('The evaluation', 'evaluation')}

${steps([
  ['The paired metric', `Attack success rate and utility retention, from the same run, over a
    documented case list that includes benign tasks a paranoid policy would break.`],
  ['The ablation', `Every layer off in turn, plus all-off. This produces the matrix that tells you
    which layer actually carries each attack, and finds the attacks with a single point of failure.`],
  ['The adaptive run', `White-box, budgeted, iterative, against your own stack. Report the budget with
    the number. Expect layers 1 and 2 to fall and layers 3 to 6 to hold; if one of the latter falls,
    that is your most valuable finding.`],
  ['The report', `Generated from the runs, not written by hand. Include the "does not cover" section.`],
])}

${code(`$ python -m sentinel.eval --all

  attack success rate    0/32   (0%)      utility retention  19/20  (95%)

  ablation
    all layers on           0/32
    − spotlighting          0/32     (no attack depended on it alone)
    − detection             0/32
    − control flow          3/32     ← a07-fake-system, a11-line-jump, a15-infection
    − data flow             7/32     ← the exfiltration family
    − environment          11/32     ← everything that needed to reach the network
    − oversight             2/32     ← the irreversible pair
    all layers off         29/32

  adaptive (4h white-box, 500 queries)
    spotlighting only       24/32
    full stack               1/32    ← a16-amplification: budget set too high. FIXED.

  not covered: model backdoors beyond the single trigger case; multi-turn
  escalation; any task requiring legitimate egress to an unknown host.`,
  { lang: 'txt', file: 'the output to aim for' })}

${h2('The two numbers that mean you understood the course', 'numbers')}

${p(`Not "0% attack success". That is the easy half, and Project 5 showed you can get it by
unplugging the agent. The two that matter:`)}

${kv([
  ['Utility retention above 90%', `A stack that stops everything and breaks nothing is the actual
    engineering result. Anyone can build the first half.`],
  ['An ablation that surprised you', `If every attack is stopped by three layers, your suite is too
    easy. If several are stopped by exactly one, you have found your real risk. Either way, the
    surprise is the learning.`],
])}

${h2('Extensions, if you want to go further', 'extensions')}

${ul([
  `<b>Run it live.</b> Point <code>agentlib</code> at a real model with <code>--live</code> and see
   which attacks become unreliable. The architectural defences should not move; the prompt-level ones
   will.`,
  `<b>Add a computer-use surface.</b> The hardest case (<a href="/chapters/a08/">A08</a>): a coordinate
   action space that resists policy, where containment is the primary control.`,
  `<b>Port your harness to AgentDojo</b> so your numbers are comparable with published ones.`,
  `<b>Write up one novel attack.</b> If your adaptive run found something your <code>bounded_by</code>
   hypothesis did not predict, that is worth a blog post; if it breaks one of the bounding layers,
   it is worth telling the authors of the paper it came from.`,
])}

${callout('defense', 'When you are done', `<p style="margin-bottom:0">You will have a repository that
demonstrates, executably, that you can threat-model an agent, break it in a dozen ways, rebuild it so
the breaks stop working, and produce an honest number for how well that worked. That is the entire
skill this course exists to teach, and there is not a great deal of it about. The SEI case-study
survey found that most deployed systems implement fewer than five of thirty-three control categories.
You will be past that on the first afternoon of Project 4.</p>`)}
`,
  refsNote: `The capstone draws on every chapter, so its bibliography is the site's. Listed below are
the sources that most directly shape its architecture; the full list is on
<a href="/references/">the references page</a>.`,
  refs: [
    { authors: 'Edoardo Debenedetti, Ilia Shumailov, Tianqi Fan, Jamie Hayes, Nicholas Carlini, Daniel Fabian, Christoph Kern, Chongyang Shi, Andreas Terzis, Florian Tramèr',
      title: 'Defeating Prompt Injections by Design (CaMeL)', venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2503.18813' },
    { authors: 'Luca Beurer-Kellner, Beat Buesser, Ana-Maria Creţu, Edoardo Debenedetti, Daniel Dobos, Daniel Fabian, Marc Fischer, David Froelicher, Kathrin Grosse, Daniel Naeff, Ezinwanne Ozoani, Andrew Paverd, Florian Tramèr, Václav Volhejn',
      title: 'Design Patterns for Securing LLM Agents against Prompt Injections', venue: 'arXiv, 2025',
      url: 'https://arxiv.org/abs/2506.08837' },
    { authors: 'Edoardo Debenedetti, Jie Zhang, Mislav Balunović, Luca Beurer-Kellner, Marc Fischer, Florian Tramèr',
      title: 'AgentDojo: A Dynamic Environment to Evaluate Attacks and Defenses for LLM Agents',
      venue: 'NeurIPS Datasets and Benchmarks, 2024', url: 'https://arxiv.org/abs/2406.13352' },
    { authors: 'Qiusi Zhan, Richard Fang, Henil Shalin Panchal, Daniel Kang',
      title: 'Adaptive Attacks Break Defenses Against Indirect Prompt Injection Attacks on LLM Agents',
      venue: 'NAACL Findings, 2025', url: 'https://arxiv.org/abs/2503.00061' },
    { authors: 'Simon Willison', title: 'The Dual LLM pattern for building AI assistants that can resist prompt injection',
      venue: 'simonwillison.net, 2023', url: 'https://simonwillison.net/2023/Apr/25/dual-llm-pattern/' },
    { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
      title: 'SoK: Bridging Research and Practice in LLM Agent Security', venue: 'CMU SEI, 2025',
      url: 'https://doi.org/10.1184/R1/30610928' },
    { authors: 'Tobin South, Samuele Marro, Thomas Hardjono, Robert Mahari, Cedric Deslandes Whitney, Dazza Greenwood, Alan Chan, Alex Pentland',
      title: 'Authenticated Delegation and Authorized AI Agents', venue: 'ICML, 2025', url: 'https://arxiv.org/abs/2501.09674' },
  ],
};
