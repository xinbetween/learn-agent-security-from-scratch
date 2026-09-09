import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 15, attacks: '你敢下注的那个数字' };
export const scripts = ['/assets/js/sims/zh/a25.js'];

export const body = `
${p(`你已经搭好了一套防御体系。本章要谈的是如何得出一个真正有意义的数字。这要求你先弄清楚公开基准测试
到底测了什么，再为它们没测到的部分自己写一套评测框架。`)}

${h2('基准测试全景', 'landscape')}

${table(
  ['基准测试', '面向对象', '度量什么', '局限'],
  [
    ['<b>AgentDojo</b>', '调用工具的智能体', '同时度量效用<em>与</em>攻击成功率', '攻击集固定'],
    ['<b>InjecAgent</b>', '集成了工具的智能体', '区分直接危害与窃取数据两类攻击者目标', '不度量效用'],
    ['<b>Agent Security Bench</b>', '10 个场景、大量工具', '一张攻击 × 防御矩阵', '环境是合成的'],
    ['<b>WASP</b>', 'Web 智能体', '贴近真实的端到端 Web 任务', '只覆盖 Web'],
    ['<b>RedTeamCUA</b>', '操作计算机的智能体', 'Web 与操作系统混合，贴近真实', '跑一次很贵'],
    ['<b>ToolEmu</b>', '任意工具型智能体', '用语言模型模拟沙箱，没有真实副作用', '存在模拟落差'],
    ['<b>RAS-Eval</b>', '真实世界环境', '工具是真的执行的', '任务集很窄'],
    ['<b>R-Judge</b>', '轨迹', '对整条轨迹做安全性判定', '判定者本身是个模型'],
  ]
)}

${p(`它们无一例外都用固定的攻击集。正是这一点让结果在不同系统之间、不同时间之间可比，而这恰恰是基准测试
存在的意义。但这也意味着，一个漂亮的分数说的只是已知攻击。把它们当回归测试套件用；另一半在
<a href="/zh/chapters/a19/">A19</a>。`)}

${h2('给你自己的智能体写一套评测框架', 'harness')}

${p(`公开基准测试覆盖不了你的工具、你的数据和你的策略。真正值得从 AgentDojo 抄来的，是它每个用例都同时
度量两件事这一结构：`)}

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
  badge: '交互实验',
  title: '同一套用例，跑三种防御配置',
  controls: select('a25-def', '配置', [
    ['none', '无防御'],
    ['scope', '能力范围收窄：本任务里没有 send_email'],
    ['paranoid', '偏执模式：除抓取外一律拦截'],
  ], 'none'),
  body: out('a25-out'),
  note: `两种防御配置的攻击成功率都是 0%。它们并不等价，而只报一个数字的做法会把这个差别彻底藏起来，
    这正是必须用成对指标的全部理由。`,
})}

${h2('为什么必须成对报告', 'pair')}

${table(
  ['配置', '攻击成功率', '效用保持率'],
  [
    ['无防御', '<b style="color:var(--attack)">100%</b>', '100%'],
    ['能力范围收窄', '<b style="color:var(--defense)">0%</b>', '<b style="color:var(--defense)">100%</b>'],
    ['偏执模式（除抓取外全部拦截）', '<b style="color:var(--defense)">0%</b>', '<b style="color:var(--warn)">80%</b>'],
  ]
)}

${p(`把智能体的电源拔掉，攻击成功率照样是 0%。偏执配置拦掉了一个需要写文件的正当任务，而只有效用那一列
会把这件事暴露出来。永远在同一次运行里同时报告两个数字，并且把用例清单公开，别人才知道你究竟测了
什么。`)}

${h2('把你的基准测试没覆盖的东西写下来', 'gaps')}

${callout('note', '那段最有用、却没人写的话', `<p>代码文件里的这套用例，只覆盖了一组工具上的四种载荷写法。
它<b>没有</b>覆盖：</p>
<ul style="margin-bottom:0">
<li>自适应攻击（<a href="/zh/chapters/a19/">A19</a>）。每一条载荷都是事先写好的。</li>
<li>在一段对话里逐步升级的多轮攻击。</li>
<li>环境注入（<a href="/zh/chapters/a08/">A08</a>）。</li>
<li>任何需要正当出站的任务，而有意思的策略冲突恰恰都住在那里。</li>
<li>模型层面的威胁（<a href="/zh/chapters/a14/">A14</a>）和资源攻击
    （<a href="/zh/chapters/a16/">A16</a>）。</li>
</ul>`)}

${p(`写下这份清单，是一份评测报告里价值最高的部分，也是几乎总是缺席的部分。读者能校准一个有边界的结果，
却没法校准一个没有边界的断言。`)}

${h2('能力激发：你看到的是智能体的真实行为吗？', 'elicitation')}

${p(`SEI 的分类法把能力激发单列为一类，担心的是评测环境总会露出马脚：编造的名字、整齐的数字、干净得反常
的数据、一眼就能看出是测试的任务。关于欺骗与规避的文献，把模型在评测下表现不同的来源数到了十种。`)}

${p(`在低估才是昂贵错误的场合，这件事最要紧。推荐的姿态是：环境要真实，威胁模型要宽松（白盒访问、充裕
预算），脚手架要有效，并且你得拿得出理由说明，一个资源更多的攻击者也不会改变你的结论。`)}

${h2('一个能落地的评测节奏', 'cadence')}

${steps([
  ['静态用例集，每次提交都跑',
   `便宜、确定，而且抓得住回归。你那套照着公开基准测试形状写的评测框架就是干这个用的。`],
  ['效用用例集，每次发版都跑',
   `因为一个悄悄拉低了任务成功率的防御，最后一定会被人绕过去。`],
  ['自适应演练，每季度一次，防御一改就重跑',
   `白盒、限定预算、反复迭代，报告时把预算一起写上。这才是你敢下注的那个数字。`],
  ['真实分布，在生产环境里持续看',
   `策略拒绝、漂移告警和成本异常，都是来自你没有设计过的流量的评测信号
    （<a href="/zh/chapters/a26/">A26</a>）。`],
])}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `说出四个公开基准测试，并说清每一个各自没有度量什么。`,
  `写一个评测用例，让它在同一次运行里同时报告效用和攻击成功率。`,
  `解释为什么两个攻击成功率同为 0% 的配置可以差得非常远。`,
  `为你自己的用例集写出那段“本次评测未覆盖什么”。`,
])}
`;

export const quiz = [
  {
    q: `两种防御配置报出来的攻击成功率都是 0%。在断定它们等价之前，你必须先看什么？`,
    options: [
      `各自用的是哪个模型。`,
      `效用保持率，因为其中一个可能是靠拦掉正当工作换来的这个分数。`,
      `每次评测各花了多长时间。`,
      `攻击载荷的数量。`,
    ],
    answer: 1,
    explain: `什么都拒绝就能轻松拿到零攻击成功率，所以光看安全这一个数字，根本分不清一个设计良好的控制和一个
      废掉的智能体。在本章的例子里，偏执配置的攻击成功率是 0%、效用只有 80%，因为它拦掉了一个需要
      <code>write_file</code> 的正当任务。能力范围收窄的配置拿到同样的安全数字，效用却是满的，而这个差别
      才是全部的工程成果。`,
  },
  {
    q: `所有公开的智能体安全基准测试有什么共同点，由此又能推出什么？`,
    options: [
      `它们用的是同一批模型，所以结果不可迁移。`,
      `它们的攻击集是固定的，这让结果在不同系统和不同时间之间可比，也意味着一个好分数描述的是已知攻击，而不是安全性。`,
      `它们只测 Web 智能体。`,
      `它们都需要访问某个前沿模型的 API。`,
    ],
    answer: 1,
    explain: `固定是设计目标，不是缺陷。正是它让你能把自己的智能体和上个季度的、和别人的放在一起比，也正是它
      让回归测试套件成为可能。错误出在推理这一步：把“在基准测试上分数好”当成“是安全的”。两个数字都重要，
      A19 的自适应演练告诉你攻击者的代价，静态用例集则是你每次提交都跑的那个。`,
  },
  {
    q: `为什么说“本次评测未覆盖什么”是一份报告里最有用的一段？`,
    options: [
      `因为大多数会议都要求写。`,
      `读者能校准一个有边界的结果，却没法校准一个没有边界的断言。省略的部分决定了这个数字究竟允许你相信到哪一步。`,
      `因为它能让方法部分变短。`,
      `因为它能规避责任。`,
    ],
    answer: 1,
    explain: `不交代范围的“0% 攻击成功率”是没法用的。它可能是四条手写载荷打一组工具，也可能是对整个系统做了
      一个月的自适应攻击。明说这套用例不含自适应攻击、多轮升级、环境注入和需要出站的任务，读者才能把这个
      结果放到正确的位置上；而在实践中，它同时也告诉你自己的团队下个季度该干什么。`,
  },
  {
    q: `你的智能体在评测环境和生产环境里行为不一致。这叫什么，分类法又建议怎么做？`,
    options: [
      `过拟合；多喂点数据。`,
      `这是能力激发问题：评测环境会露马脚，所以要用真实环境、宽松的威胁模型和充裕的预算，避免低估能力。`,
      `分布漂移；把模型重训一遍。`,
      `日志有 bug；把埋点修好。`,
    ],
    answer: 1,
    explain: `能力激发在 SEI 的最佳实践分类法里自成一类，正是因为把智能体的完整行为引出来需要刻意的努力。
      编造的名字、整齐的数字、一眼看出是测试的任务，全都是破绽，而关于欺骗与规避的文献把评测下行为差异的
      来源数到了十种。真正要紧的错误方向是低估，所以姿态应该是白盒访问加充裕预算。`,
  },
  {
    q: `哪一类评测属于“每次提交都跑”，而不是“每季度跑一次”？`,
    options: [
      `自适应白盒红队演练。`,
      `固定的静态用例集，因为它便宜、确定，而且抓得住回归。`,
      `一次完整的 RedTeamCUA 运行。`,
      `安全工程师的人工评审。`,
    ],
    answer: 1,
    explain: `静态用例集的固定性（作为安全结论时是它的弱点）恰恰让它成为一道好的回归门禁：确定、快，而且能和
      昨天那次直接比。自适应评测又贵又依赖人，所以它属于更慢的节奏，并且要在防御有任何改动之后重跑，因为
      哪怕只改一句 prompt，上一次的自适应结果也就作废了。`,
  },
  {
    q: `AgentDojo 的结构为什么要给每个用例同时挂上 <code>utility_check</code> 和
        <code>attack_check</code>，而不是分成两套用例集跑？`,
    options: [
      `为了缩短总运行时间。`,
      `因为这两个性质必须在<em>同一次</em>运行里度量。一个防御完全可能通过独立的效用用例集，却偏偏弄坏了触发它的那些任务。`,
      `因为攻击用例本来就没有效用。`,
      `为了让报告更简单。`,
    ],
    answer: 1,
    explain: `分成两套，防御就能在两边都好看，却在交叠处失败。有意思的用例恰恰是控制真的触发的那些：攻击失败
      的同时，智能体还完成了用户的任务吗？在同一次执行里度量两者，才能把这个权衡显出来，也才解释了偏执配置
      的效用损失为什么会被看见。`,
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
