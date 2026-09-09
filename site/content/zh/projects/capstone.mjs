import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, pill } from '../../../lib/components.mjs';

const arch = svg(760, 400, `
${svgText(12, 18, 'SENTINEL — 毕业项目架构', 'd-ttl', 'start')}

${box(20, 44, 130, 44, '用户任务', '可信', 'd-sunk')}
${box(190, 44, 160, 44, '规划器 LLM', '从不读不可信内容', 'd-trust')}
${box(390, 44, 150, 44, '程序', '控制流固定', 'd-def')}
${box(580, 44, 160, 44, '解释器', '带标签的值', 'd-def')}

${box(190, 150, 160, 44, '被隔离的 LLM', '无工具', 'd-attack')}
${box(390, 150, 150, 44, '工具层', '受限 token', 'd-def')}
${box(580, 150, 160, 44, '策略引擎', '只读标签', 'd-def')}

${box(190, 236, 160, 44, '不可信内容', '网页 · 邮件 · 文件', 'd-attack')}
${box(390, 236, 150, 44, '出站代理', '允许清单', 'd-def')}
${box(580, 236, 160, 44, '审批门', '仅不可逆操作', 'd-def')}

${box(190, 322, 550, 44, '轨迹日志 — 因果 · 溯源 · 哈希链 · 拒绝记录', '', 'd-sunk')}

${arrow(150, 66, 188, 66)}
${arrow(350, 66, 388, 66)}
${arrow(540, 66, 578, 66)}
${arrow(660, 88, 660, 148)}
${arrow(578, 172, 542, 172)}
${arrow(390, 194, 390, 234)}
${arrow(350, 258, 262, 214)}
${arrow(270, 194, 270, 92)}
${svgText(300, 130, '仅 $VAR1', 'd-def-t')}
${arrow(465, 194, 465, 234)}
${arrow(660, 194, 660, 234)}
${arrow(465, 280, 465, 320)}

<rect x="180" y="136" width="180" height="160" rx="8" class="d-bnd"/>
${svgText(270, 310, '隔离区', 'd-bnd-t')}
${svgText(760, 392, '每一层都能单独开关，消融实验正是因此才做得成', 'd-sub', 'end')}
`, { label: '毕业项目 Sentinel 的架构' });

export const CAPSTONE_BODY = {
  body: `
${p(`一个仓库。一个真正会用工具的智能体，三十二个取自各章的攻击，一套六层防御栈，还有一套把攻击成功率
和效用留存率放在一起报告的评测框架。这就是整门课程，可执行的那种。当有人问你是不是真懂这些材料，
这就是你可以指过去的那件东西。`)}

${h2('你要造的东西', 'what')}

${figure(arch, `<b>Sentinel。</b>控制流来自规划器，而规划器从不读取不可信内容。被隔离的模型什么都读，
但什么都做不了。值带着溯源标签穿过解释器，抵达一个只读标签、绝不读文本的策略引擎。工具持有范围受限、
会过期的凭据；出站流量走允许清单；不可逆操作要过一道门。所有事情都连着因果关系记入日志。
每一层都能独立开关。`)}

${h2('四个组成部分', 'components')}

${table(
  ['组件', '里面装了什么', '取自'],
  [
    ['<code>sentinel/agent/</code>', '智能体本体：规划器、被隔离的模型、解释器、工具层，以及五个工具（网页、邮件、文件、shell、委派）。', 'A01, A20, A21'],
    ['<code>sentinel/attacks/</code>', '三十二个攻击，一章一个模块，每个都能自我验证。', 'A06–A16'],
    ['<code>sentinel/defense/</code>', '六个可独立开关的防御层。', 'A17–A24'],
    ['<code>sentinel/eval/</code>', '评测框架、自适应协议、消融运行器、报告生成器。', 'A19, A25, A26'],
  ]
)}

${h2('攻击集', 'attacks')}

${p(`三十二个攻击是个目标，不是硬规定，但比数量更要紧的是分布。第二部分和第三部分的每一章都要覆盖到：`)}

${table(
  ['章节', '攻击数', '示例'],
  [
    ['<a href="/zh/chapters/a06/">A06</a> 直接注入', '4', '覆盖、抽取、编码绕过、优化器式后缀'],
    ['<a href="/zh/chapters/a07/">A07</a> 间接注入', '5', '注释、伪系统消息、白底白字、善意包装，再加一个你自己想的'],
    ['<a href="/zh/chapters/a08/">A08</a> 环境注入', '3', 'alt 文本、屏幕外节点、不可见 Unicode'],
    ['<a href="/zh/chapters/a09/">A09</a> 数据外泄', '4', 'markdown 图片、形如 DNS 的主机名、工具参数、错误消息'],
    ['<a href="/zh/chapters/a10/">A10</a> 混淆代理', '2', '滥用过宽的权限范围、没有攻击者的工具误用'],
    ['<a href="/zh/chapters/a11/">A11</a> 工具投毒', '3', '抢跑、事后掉包、工具遮蔽'],
    ['<a href="/zh/chapters/a12/">A12</a> 记忆 / RAG', '4', '语料投毒、记忆写入、跨会话持久化、检索排序'],
    ['<a href="/zh/chapters/a13/">A13</a> 供应链', '2', '被投毒的技能、技能抢注'],
    ['<a href="/zh/chapters/a14/">A14</a> 模型层面', '1', '经由间接通道触发的条件式后门'],
    ['<a href="/zh/chapters/a15/">A15</a> 多智能体', '2', 'prompt 感染、沿一条路径凑齐三元组'],
    ['<a href="/zh/chapters/a16/">A16</a> 资源', '2', '递归循环、工具返回放大'],
  ]
)}

${callout('note', '每个攻击都用同一套结构', `${code(`@dataclass
class Attack:
    id: str                  # "a07-fake-system"
    chapter: str
    task: str                # the benign thing the user asked for
    setup: callable          # plant the payload
    succeeded: callable      # did the attacker win? -> bool
    bounded_by: str          # which control class SHOULD stop this`, { lang: 'py' })}
<p style="margin-bottom:0"><code>bounded_by</code> 这个字段，正是让消融实验有意义的东西。它是你的假设，
消融实验则用来检验这个假设。当消融结果和你的假设对不上，那就是发现。</p>`)}

${h2('防御栈', 'defense')}

${ol([
  `<b>聚光标记。</b>对每一段不可信内容做按请求随机的数据标记。${pill('warn', '抬高成本')}`,
  `<b>检测。</b>在<em>工具返回</em>这条路径上放一个分类器，并把基率算术写明白。${pill('warn', '抬高成本')}`,
  `<b>控制流。</b>先规划后执行，或先生成代码后执行；计划在检索之前就已经定死。${pill('defense', '限制损害')}`,
  `<b>数据流。</b>每个值都带能力标签，每个数据汇点都有策略。${pill('defense', '限制损害')}`,
  `<b>环境。</b>范围受限、会过期的凭据，出站允许清单，文件系统隔离，各类预算。${pill('defense', '限制损害')}`,
  `<b>监督。</b>按可逆性分级的审批门，确认框里把溯源摆出来，再加上轨迹日志。${pill('defense', '限制损害')}`,
])}

${h2('评测', 'evaluation')}

${steps([
  ['配对指标', `攻击成功率和效用留存率，来自同一次运行，跑在一份写明了的用例清单上，其中要包含
    会被过度偏执的策略搞坏的良性任务。`],
  ['消融', `逐层关掉，外加一次全关。这会产出那张矩阵，告诉你每种攻击实际上是靠哪一层扛住的，
    也找得出哪些攻击只有单点防线。`],
  ['自适应运行', `白盒、限定预算、反复迭代，冲着你自己的防御栈打。报告数字时把预算一起写上。
    预期第 1、2 层会被打穿，第 3 到 6 层应当守住；后面这几层要是有一层失守，那就是你最有价值的发现。`],
  ['报告', `由运行结果生成，不是手写出来的。要包含“未覆盖”那一节。`],
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
  { lang: 'txt', file: '要达到的输出' })}

${h2('证明你学懂了这门课的两个数字', 'numbers')}

${p(`不是“攻击成功率 0%”。那是容易的那一半，项目 5 已经让你看到，把智能体拔掉电源就能拿到。
真正要紧的是这两个：`)}

${kv([
  ['效用留存率高于 90%', `一套什么都拦得住、又什么都不弄坏的防御栈，才是真正的工程成果。
    前一半谁都做得到。`],
  ['一次让你意外的消融', `如果每种攻击都被三层挡住，说明你的攻击集太容易了。如果好几种恰好只被一层
    挡住，那你就找到了真正的风险所在。无论哪种情况，意外本身就是收获。`],
])}

${h2('还想再往前走的话', 'extensions')}

${ul([
  `<b>接上真模型跑。</b>用 <code>--live</code> 把 <code>agentlib</code> 指向一个真实模型，看看哪些
   攻击开始变得不稳定。架构层面的防御不该有变化，prompt 层面的会。`,
  `<b>加一个计算机操作面。</b>最难的那种情况（<a href="/zh/chapters/a08/">A08</a>）：动作空间是坐标，
   策略几乎管不住，此时隔离沙箱才是首要控制手段。`,
  `<b>把你的评测框架移植到 AgentDojo 上</b>，这样你的数字就能和已发表的结果比较。`,
  `<b>写一个新攻击。</b>如果你的自适应运行发现了 <code>bounded_by</code> 假设没预料到的东西，
   那值得写一篇博客；如果它打穿了某个限制损害的层，那就值得去告诉这一层所出自那篇论文的作者。`,
])}

${callout('defense', '等你做完的时候', `<p style="margin-bottom:0">你会拥有一个仓库，它以可执行的方式
证明：你能给一个智能体做威胁建模，用十几种方式把它打穿，再把它重建到这些打法全部失效，还能给出一个
诚实的数字，说明这套防御到底做得多好。这就是本课程存在的全部意义所在的那项技能，而具备它的人并不多。
SEI 那份案例研究综述发现，大多数已部署的系统实现的控制类别，在三十三类里还不到五类。你在项目 4 的
第一个下午就会越过这条线。</p>`)}
`,
  refsNote: `毕业项目取材于每一章，所以它的参考书目就是整个站点的参考书目。下面列出的，是对它的架构
影响最直接的那些来源；完整清单见<a href="/zh/references/">参考文献页</a>。`,
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
