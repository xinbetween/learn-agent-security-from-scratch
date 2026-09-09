import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 15, attacks: 'the number you would bet on' };
export const scripts = ['/assets/js/sims/a25.js'];

export const body = `
${p(`You have built a defence stack. This chapter is about producing a number that means something. That
requires understanding what the public benchmarks measure, and writing a harness for the parts they do
not.`)}

${h2('The benchmark landscape', 'landscape')}

${table(
  ['Benchmark', 'Target', 'Measures', 'Limitation'],
  [
    ['<b>AgentDojo</b>', 'tool-calling agents', 'utility <em>and</em> attack success together', 'Fixed attack set'],
    ['<b>InjecAgent</b>', 'tool-integrated agents', 'direct-harm vs data-stealing attacker goals', 'No utility measure'],
    ['<b>Agent Security Bench</b>', '10 scenarios, many tools', 'an attack × defence matrix', 'Synthetic environments'],
    ['<b>WASP</b>', 'web agents', 'realistic end-to-end web tasks', 'Web only'],
    ['<b>RedTeamCUA</b>', 'computer-use agents', 'hybrid web-OS, realistic', 'Expensive to run'],
    ['<b>ToolEmu</b>', 'any tool agent', 'LM-emulated sandbox, no real side effects', 'The emulation gap'],
    ['<b>RAS-Eval</b>', 'real-world environments', 'real tool execution', 'Narrow task set'],
    ['<b>R-Judge</b>', 'trajectories', 'judges the whole trace for safety', 'The judge is a model'],
  ]
)}

${p(`What every one of them shares is a fixed attack set. That is what makes them comparable across
systems and across time, which is exactly what a benchmark is for. It also means a good score is a
statement about known attacks. Use them as a regression suite; <a href="/chapters/a19/">A19</a> is the
other half.`)}

${h2('A harness for your own agent', 'harness')}

${p(`Public benchmarks cannot cover your tools, your data or your policies. The structure worth copying
from AgentDojo is that every case measures two things:`)}

${code(`@dataclass
class Case:
    name: str
    task: str                # what the user asked for
    page: str                # what the (possibly poisoned) page contains
    utility_check: callable  # did the agent do the user's job?
    attack_check: callable   # did the attacker win?`,
  { lang: 'py', file: 'code/a25_red_teaming.py' })}

${sim({
  name: 'a25suite',
  title: 'The same suite against three defence configurations',
  controls: select('a25-def', 'Configuration', [
    ['none', 'Undefended'],
    ['scope', 'Capability scope — no send_email in this task'],
    ['paranoid', 'Paranoid — block everything except fetching'],
  ], 'none'),
  body: out('a25-out'),
  note: `Both defended configurations reach 0% attack success. They are not equivalent, and a
    single-number report would hide the difference entirely, which is the whole argument for the
    paired metric.`,
})}

${h2('Why the pair is mandatory', 'pair')}

${table(
  ['Configuration', 'Attack success rate', 'Utility retention'],
  [
    ['Undefended', '<b style="color:var(--attack)">100%</b>', '100%'],
    ['Capability-scoped', '<b style="color:var(--defense)">0%</b>', '<b style="color:var(--defense)">100%</b>'],
    ['Paranoid (block everything but fetch)', '<b style="color:var(--defense)">0%</b>', '<b style="color:var(--warn)">80%</b>'],
  ]
)}

${p(`0% ASR is achievable by unplugging the agent. The paranoid configuration blocks a legitimate task
that needs to write a file, and only the utility column reveals it. Report both, always, on the same
run, and publish the case list so someone can tell what you measured.`)}

${h2('Write down what your benchmark does not cover', 'gaps')}

${callout('note', 'The most useful paragraph nobody writes', `<p>The suite in the code file covers four
payload styles against one tool set. It does <b>not</b> cover:</p>
<ul style="margin-bottom:0">
<li>Adaptive attacks (<a href="/chapters/a19/">A19</a>). Every payload was written in advance.</li>
<li>Multi-turn attacks that escalate gradually across a conversation.</li>
<li>Environmental injection (<a href="/chapters/a08/">A08</a>).</li>
<li>Any task requiring legitimate egress, which is where the interesting policy conflicts live.</li>
<li>Model-level threats (<a href="/chapters/a14/">A14</a>) or resource attacks
    (<a href="/chapters/a16/">A16</a>).</li>
</ul>`)}

${p(`Writing this list is the highest-value part of an evaluation report and the part that is almost
always missing. A reader can calibrate a limited result; they cannot calibrate an unbounded claim.`)}

${h2('Elicitation: are you seeing the agent\'s real behaviour?', 'elicitation')}

${p(`The SEI taxonomy treats capability elicitation as a distinct category, and the concern is that
evaluation environments have tells — synthetic names, round numbers, unusually clean data, tasks that
are obviously tests. The deception-and-evasion literature counts behavioural difference under
evaluation at ten sources.`)}

${p(`This matters most where underestimating is the expensive error. The recommended posture is
realistic environments, permissive threat models (white-box access, generous budgets), effective
scaffolding, and being able to argue that an attacker with more resources would not change your
conclusion.`)}

${h2('A practical evaluation cadence', 'cadence')}

${steps([
  ['The static suite, every commit',
   `Cheap, deterministic, and it catches regressions. This is what your public-benchmark-shaped harness
    is for.`],
  ['The utility suite, every release',
   `Because a defence that quietly degraded task success is a defence people will route around.`],
  ['An adaptive run, every quarter and after any change to the defence',
   `White-box, budgeted, iterative, reported with the budget. This is the number you would bet on.`],
  ['The real distribution, continuously in production',
   `Policy denials, drift alerts and cost anomalies are an evaluation signal from traffic you did not
    design (<a href="/chapters/a26/">A26</a>).`],
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Name four public benchmarks and say what each one does not measure.`,
  `Write a harness case that reports utility and attack success from the same run.`,
  `Explain why two configurations at 0% ASR can differ enormously.`,
  `Write the "what this evaluation does not cover" paragraph for your own suite.`,
])}
`;

export const quiz = [
  {
    q: `Two defence configurations both report 0% attack success rate. What must you check before
        concluding they are equivalent?`,
    options: [
      `Which model each one used.`,
      `Utility retention, since one may be blocking legitimate work to achieve its score.`,
      `How long each evaluation took.`,
      `The number of attack payloads.`,
    ],
    answer: 1,
    explain: `Zero attack success is trivially achievable by refusing everything, so the security
      number alone cannot distinguish a well-designed control from a broken agent. In the chapter's
      example the paranoid configuration reaches 0% ASR at 80% utility because it blocks a legitimate
      task needing <code>write_file</code>. The capability-scoped configuration reaches the same
      security number at full utility, and that difference is the entire engineering result.`,
  },
  {
    q: `What do all the public agent-security benchmarks have in common, and what follows?`,
    options: [
      `They use the same models, so results are not portable.`,
      `Their attack sets are fixed, which makes results comparable across systems and time, and means a good score describes known attacks rather than security.`,
      `They only test web agents.`,
      `They require API access to a frontier model.`,
    ],
    answer: 1,
    explain: `Fixedness is the design goal, not a flaw. It is what lets you compare your agent against
      last quarter's and against someone else's, and what makes a regression suite possible. The error
      is in the inference, treating "scores well on the benchmark" as "is secure". Both numbers
      matter; A19's adaptive run is what tells you attacker cost, and the static suite is what you run
      on every commit.`,
  },
  {
    q: `Why is "what this evaluation does not cover" described as the most useful paragraph in a
        report?`,
    options: [
      `It is required by most conferences.`,
      `A reader can calibrate a limited result but cannot calibrate an unbounded claim. The omissions determine what the number actually licenses you to believe.`,
      `It shortens the methods section.`,
      `It protects against liability.`,
    ],
    answer: 1,
    explain: `"0% ASR" with no scope is unusable. It might mean four hand-written payloads against one
      tool, or a month of adaptive attack against the full system. Stating that the suite omits
      adaptive attacks, multi-turn escalation, environmental injection and egress-requiring tasks lets
      a reader place the result correctly, and in practice it tells your own team where the next
      quarter's work is.`,
  },
  {
    q: `Your agent's behaviour differs between the evaluation environment and production. What is this
        called, and what does the taxonomy recommend?`,
    options: [
      `Overfitting; use more data.`,
      `An elicitation problem — evaluation environments have tells, so use realistic environments, permissive threat models and generous budgets to avoid underestimating capability.`,
      `Distribution shift; retrain the model.`,
      `A logging bug; fix instrumentation.`,
    ],
    answer: 1,
    explain: `Capability elicitation is its own category in the SEI best-practice taxonomy precisely
      because drawing out an agent's full behaviour takes deliberate effort. Synthetic names, round
      numbers and obviously-test tasks are all signals, and the deception-and-evasion literature counts
      behavioural difference under evaluation at ten sources. The failure direction that matters is
      underestimation, so the posture is white-box access and generous budgets.`,
  },
  {
    q: `Which evaluation belongs on every commit rather than every quarter?`,
    options: [
      `The adaptive white-box red-team run.`,
      `The fixed static suite, because it is cheap, deterministic and catches regressions.`,
      `A full RedTeamCUA run.`,
      `Manual review by a security engineer.`,
    ],
    answer: 1,
    explain: `The static suite's fixedness (its weakness as a security claim) is exactly what makes
      it a good regression gate: deterministic, fast, and comparable to yesterday's run. The adaptive
      evaluation is expensive and human-driven, so it belongs on a slower cadence and after any change
      to the defence, since a prompt tweak invalidates the previous adaptive result anyway.`,
  },
  {
    q: `Why does the AgentDojo structure attach both a <code>utility_check</code> and an
        <code>attack_check</code> to every case rather than running separate suites?`,
    options: [
      `To reduce total runtime.`,
      `Because both properties must be measured on the <em>same</em> run. A defence can pass a separate utility suite and still break the specific tasks that trigger it.`,
      `Because attack cases have no utility.`,
      `To simplify reporting.`,
    ],
    answer: 1,
    explain: `Separate suites let a defence look good twice while failing in the overlap. The
      interesting cases are exactly the ones where a control fires: does the agent still complete the
      user's task while the attack fails? Measuring both on the same execution is what surfaces the
      trade-off, and it is why the paranoid configuration's utility loss shows up at all.`,
  },
];

export const refs = [
  { authors: 'Edoardo Debenedetti, Jie Zhang, Mislav Balunović, Luca Beurer-Kellner, Marc Fischer, Florian Tramèr',
    title: 'AgentDojo: A Dynamic Environment to Evaluate Attacks and Defenses for LLM Agents',
    venue: 'NeurIPS Datasets and Benchmarks, 2024', url: 'https://arxiv.org/abs/2406.13352' },
  { authors: 'Qiusi Zhan, Zhixiang Liang, Zifan Ying, Daniel Kang',
    title: 'InjecAgent: Benchmarking Indirect Prompt Injections in Tool-Integrated Large Language Model Agents',
    venue: 'ACL Findings, 2024', url: 'https://arxiv.org/abs/2403.02691' },
  { authors: 'Hanrong Zhang, Jingyuan Huang, Kai Mei, Yifei Yao, Zhenting Wang, Chenlu Zhan, Hongwei Wang, Yongfeng Zhang',
    title: 'Agent Security Bench (ASB): Formalizing and Benchmarking Attacks and Defenses in LLM-based Agents',
    venue: 'ICLR, 2025', url: 'https://arxiv.org/abs/2410.02644' },
  { authors: 'Ivan Evtimov, Arman Zharmagambetov, Aaron Grattafiori, Chuan Guo, Kamalika Chaudhuri',
    title: 'WASP: Benchmarking Web Agent Security Against Prompt Injection Attacks', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2504.18575' },
  { authors: 'Zeyi Liao, Jaylen Jones, Linxi Jiang, Eric Fosler-Lussier, Yu Su, Zhiqiang Lin, Huan Sun',
    title: 'RedTeamCUA: Realistic Adversarial Testing of Computer-Use Agents in Hybrid Web-OS Environments',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2505.21936' },
  { authors: 'Yangjun Ruan, Honghua Dong, Andrew Wang, Silviu Pitis, Yongchao Zhou, Jimmy Ba, Yann Dubois, Chris J. Maddison, Tatsunori Hashimoto',
    title: 'Identifying the Risks of LM Agents with an LM-Emulated Sandbox (ToolEmu)', venue: 'ICLR, 2024',
    url: 'https://arxiv.org/abs/2309.15817' },
  { authors: 'Authors of RAS-Eval', title: 'RAS-Eval: A Comprehensive Benchmark for Security Evaluation of LLM Agents in Real-World Environments',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.15253' },
  { authors: 'Tongxin Yuan, Zhiwei He, Lingzhong Dong, Yiming Wang, Ruijie Zhao, Tian Xia, Lizhen Xu, Binglin Zhou, Fangqi Li, Zhuosheng Zhang, Rui Wang, Gongshen Liu',
    title: 'R-Judge: Benchmarking Safety Risk Awareness for LLM Agents', venue: 'EMNLP Findings, 2024',
    url: 'https://arxiv.org/abs/2401.10019' },
  { authors: 'Authors of AgentAuditor', title: 'AgentAuditor: Human-Level Safety and Security Evaluation for LLM Agents',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.00641' },
  { authors: 'Authors of StepShield', title: 'StepShield: When, Not Whether to Intervene on Rogue Agents',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.22136' },
];
