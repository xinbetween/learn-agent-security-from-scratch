import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 16, attacks: '从分类法到决策' };
export const scripts = ['/assets/js/sims/zh/a27.js'];

export const body = `
${p(`最后一章。你已经有了威胁地图、防御体系和一套评测。这一章讲的是把它们持续串在一起的流程，以及一个让人
不太舒服的发现：大多数已上线的系统并没有这样的流程。`)}

${h2('一套可以反复跑的风险评估', 'assessment')}

${p(`SEI 的综述演示了一个四步流程，而它的价值不在于最后产出的那份计划，在于它暴露出来的缺口。`)}

${steps([
  ['从分类法里挑一个威胁', `不要从你的想象里挑。把清单从头走一遍，才会浮现出你自己想不到的那些类别
    （<a href="/zh/chapters/a04/">A04</a>）。`],
  ['找出受影响的组件', `把它落到你的参考架构上。这个威胁碰到了你系统的哪些部分？`],
  ['把组件映射到控制类别', `查一查哪些最佳实践类别适用于这些组件（<a href="/zh/defenses/">防御地图</a>）。`],
  ['读出缺口', `这些类别里，哪些在文献中覆盖得很薄？那些就是你得自己设计的缓解措施，也很可能是你的同行
    同样跳过了的部分。`],
])}

${sim({
  name: 'a27risk',
  badge: '交互实验',
  title: '两个做完的风险评估',
  controls: select('a27-threat', '威胁', [
    ['kb', '知识库攻击（记忆 / RAG 投毒）'],
    ['dos', '拒绝服务 / 耗尽钱包'],
  ], 'kb'),
  body: out('a27-out'),
  note: `GAP 那一行才是这个练习的意义所在。对记忆投毒来说，它告诉你：尽管这是一个被大量引用的脆弱点，
    记忆控制和隐私控制却属于文献里被引用得最少的类别。现成的指导并不存在，所以只能你自己设计。`,
})}

${h2('分阶段上线，配上真正的门禁', 'phases')}

${table(
  ['阶段', '范围', '通过标准', '回滚方式'],
  [
    ['<b>0 · 影子</b>', '真实输入；所有动作一律拦截并记录',
     '100% 的拟执行动作都被人看过；连续两周没有解释不清的拒绝', '关掉即可；什么也没发生'],
    ['<b>1 · 试点</b>', '五名志愿者；只允许可逆动作',
     '内部用例集上攻击成功率 &lt; 5%；没有不可逆动作进入生产；成本不超过预估的 2 倍',
     '吊销智能体的 token；用快照回滚写入'],
    ['<b>2 · 有限放开</b>', '一个团队；不可逆动作需要人工确认',
     '审批被推翻的比例 &lt; 10%；审批时延中位数 &lt; 60 秒；30 天内无事件',
     '停用出问题的那个工具；一分钟内完成 token 吊销'],
    ['<b>3 · 全量</b>', '所有用户；预先授权的范围',
     '持续审计连续 60 天为绿；自适应红队重跑通过',
     '不发版就能全组织关掉特性开关'],
  ]
)}

${callout('warn', '评审时该争论的那一行', `<p style="margin-bottom:0">“不发版就能全组织关掉特性开关。”这是对你
<em>架构</em>的一条要求，不是处置手册里的一段文字。如果你今天说不出这句话，阶段 3 对你就还不开放；而在事件
发生时才发现这一点，比现在发现要贵得多。</p>`)}

${h2('针对智能体特有故障的事件响应', 'incident')}

${p(`常规处置手册里的大部分内容都可以照搬。下面打星号的步骤在常规手册里是没有的，智能体事件的不同之处
就在那里：`)}

${table(
  ['阶段', '步骤', ''],
  [
    ['检测', '策略拒绝激增、成本异常、用户报告、漂移告警', ''],
    ['遏制', '吊销<b>智能体的</b> token，不是用户的', '★'],
    ['遏制', '停用那个具体的工具；如果安全，就让智能体继续跑', '★'],
    ['研判', '重放轨迹：它拐弯的时候，上下文里有什么？', '★'],
    ['研判', '<b>找出被投毒的源头，而不只是受影响的那次运行</b>', '★'],
    ['清除', '按溯源把派生出来的记忆条目清掉', '★'],
    ['清除', '清理语料；如果是外部来源，通知源头的负责人', '★'],
    ['清除', '把检索过同一份文档的<em>其他每一次</em>运行重新检查一遍', '★'],
    ['恢复', '从快照恢复；在修复之后重跑受影响的任务', ''],
    ['复盘', '把这条载荷加进回归用例集', '★'],
    ['复盘', '问一句：哪一类控制本可以<b>限住</b>它，而不是检测到它', '★'],
  ]
)}

${p(`其中两条值得强调。<b>找出被投毒的源头</b>，因为一次语料攻击对每一个检索过那份文档的用户都已经打响了，
你的事件只是 N 分之一。还有<b>按溯源清除派生记忆</b>。这件事只有在事件发生之前你就记录了溯源信息时才做得到。
事件响应是一个设计期的决定。`)}

${h2('落地缺口', 'adoption')}

${p(`SEI 的综述把 36 个真实世界智能体案例研究里描述过的控制，对着它那套 33 类的分类法归了类。那个分布值得
你坐下来好好看看。`)}

${table(
  ['覆盖充分', '覆盖很薄', '完全没有'],
  [
    ['访问控制（17/36）', '提示工程（2）', '法律考量（0）'],
    ['监控（10）、护栏（10）', '对抗训练（1）', '多智能体设计（0）'],
    ['人工确认（10）、沙箱（10）', '纵深防御（2）', '训练数据管理（0）'],
    ['加密（10）', '限流（2）', ''],
  ]
)}

${p(`超过 60% 的案例研究，描述到的类别不足 33 类中的五类。有两种诚实的读法，而且两种都成立。一是组织披露的
比它们实际做的少，因为 AI 组件是知识产权，保密是理性的选择，综述把这条列为它的第八条结论。二是这个分布本身
就有信息量：被广泛落实的那些控制，恰恰是普通的软件安全，而智能体特有的那些则寥寥无几。`)}

${callout('boundary', '让人不舒服的结论', `<p style="margin-bottom:0">如果你把第 5 部分的整套防御做下来，你做的
就已经比那份调研里的大多数系统都多了。这件事该让你担心，而不是让你安心。它说明当前的基线很低，说明“行业标准”
不是一个有用的目标。</p>`)}

${h2('综述最后给出的三条建议', 'recommendations')}

${kv([
  ['加强学术界与产业界的协作', `这两套文献的盲区正好互补（<a href="/zh/chapters/a04/">A04</a>）。威胁情报共享
    面向的是组织，基本把研究者排除在外；匿名化的真实使用数据能补上一个哪一方单独都补不上的缺口。`],
  ['开发智能体特有的控制', `当前分类法里有很大一部分是从 LLM 安全或普通软件安全继承来的。综述里只有两份资料
    引用了那些真正能对注入给出保证的控制流技术，也就是
    <a href="/zh/chapters/a21/">A21</a> 里 CaMeL 那条线。杠杆就在那儿。`],
  ['把风险评估扩大并系统化', `要的是可重复的流程，不是一次性的活动。本章的这个框架是第一步，而且刻意做得
    足够简单，一个下午就能跑完。`],
])}

${h2('接下来去哪儿', 'next')}

${ul([
  `<a href="/zh/capstone/">毕业项目</a>，在那里你把整套东西建出来、攻击它、防御它，并把它量出来。`,
  `<a href="/zh/references/">参考文献</a>，一百八十来篇一手资料，按作者排序。`,
  `<a href="/zh/threats/">威胁地图</a>和<a href="/zh/defenses/">防御地图</a>，把它们当工作清单用，
   而不是拿来读。`,
  `然后就是这个领域本身：这门课会过时，而<a href="/zh/sources/">资料合集</a>是持续维护的。`,
])}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `跑一次可重复的风险评估，从分类法一路走到缓解计划，并读出缺口。`,
  `写出带有通过标准和回滚路径的阶段门禁，而且是你真能执行的那种。`,
  `说出事件处置手册里智能体特有的那几步，以及每一步各自的前提是什么。`,
  `用数字解释为什么“行业标准”在这个领域是个很低的门槛。`,
])}
`;

export const quiz = [
  {
    q: `在这套四步风险评估里，哪一步产出的东西最有价值？`,
    options: [
      `找出受影响的组件。`,
      `读出缺口：哪些控制类别在文献里覆盖得很薄，因而哪些缓解措施必须由你自己设计。`,
      `挑那个威胁。`,
      `把组件映射到控制。`,
    ],
    answer: 1,
    explain: `前三步产出的是一份缓解计划，有用，而且基本是机械的。读出缺口告诉你的，是别的途径学不到的东西：
      比如对记忆投毒来说，<em>尽管</em>这个脆弱点被大量引用，记忆控制和隐私控制却属于文献里被引用得最少的
      类别。这种错位意味着现成的指导并不存在，所以要为设计工作留预算。你的同行多半也跳过了它。`,
  },
  {
    q: `为什么说“不发版就能全组织关掉特性开关”是一条架构要求，而不是处置手册里的一行字？`,
    options: [
      `因为处置手册没人维护。`,
      `因为“一分钟内在所有地方停掉一个智能体”这个能力必须提前建好，你没法在事件发生时临时加上。`,
      `因为特性开关需要用某个特定厂商的产品。`,
      `因为发版很慢。`,
    ],
    answer: 1,
    explain: `一个需要发版才能生效的熔断开关，是以小时计的熔断开关，而事件是以分钟计的。你能不能说出这句话，
      取决于很久以前做的那些决定：一个运行时开关、一份可吊销的凭据、一个你能一把切换的代理。上线的阶段 3
      之所以要用它当门禁，正是因为在事件当中才发现这个缺口，是学会它最贵的方式。`,
  },
  {
    q: `一次智能体事件被追溯到共享语料中的一份被投毒的文档。哪一个遏制步骤最常被漏掉？`,
    options: [
      `吊销用户的凭据。`,
      `把检索过同一份文档的<em>其他每一次</em>运行重新检查一遍，因为你的事件只是一次一直在生效的攻击的其中一次触发。`,
      `重启智能体服务。`,
      `轮换模型的 API key。`,
    ],
    answer: 1,
    explain: `语料攻击在每一次检索时都会触发，所以等你注意到某一起事件时，它很可能已经在其他用户身上跑过了。
      把它当成单次运行的事件处理，等于在攻击仍然活着的时候关掉了工单。另外注意第一个选项是明确错误的：你要
      吊销的是<em>智能体的</em> token，不是用户的。用户什么也没做，停掉他既没用，也是丢掉他配合意愿的好办法。`,
  },
  {
    q: `为什么“按溯源清除被投毒的记忆条目”是设计期的决定，而不是事件期的决定？`,
    options: [
      `因为清除需要数据库停机。`,
      `因为只有当你在事件发生之前就为每一次写入记录了溯源，才可能按溯源来过滤。`,
      `因为记忆存储是不可变的。`,
      `因为得先拿到法务批准。`,
    ],
    answer: 1,
    explain: `事发时你手上有的，就只有你当初记下来的那些字段。没有溯源字段，选择就只剩下全部清空（毁掉用户
      正当的偏好设置，也侵蚀他们对系统的信任）或者人工逐条审阅，而后者根本扩展不了。A12 里那个四行的溯源
      过滤器，才是精准清除得以可能的原因，而同一个字段也支撑着 A21 的策略和 A26 的漂移检测。`,
  },
  {
    q: `被调研的案例研究里，超过 60% 描述到的控制类别不足 33 类中的五类。两种诚实的读法是什么？`,
    options: [
      `调研方法有问题，样本也太小。`,
      `组织披露的比它们实际落实的少，因为 AI 组件属于知识产权；<em>同时</em>这个分布也说明智能体特有的控制在实践中确实寥寥无几。`,
      `大多数组织都不负责任。`,
      `分类法太细，没法落地使用。`,
    ],
    answer: 1,
    explain: `两种都成立，综述自己也是这么说的。保密这一读法有证据：缺席的恰恰是提示工程、多智能体设计、训练
      数据这些竞争上敏感的类别。实质这一读法也有证据：在场的是访问控制、加密、沙箱、日志，全都是普通的软件
      安全。落到实践上，这意味着“行业标准”在这里不是一个有用的目标。`,
  },
  {
    q: `综述指出，只有两份资料引用了那些能对注入给出保证的控制流技术。这对“该往哪儿投入”意味着什么？`,
    options: [
      `意味着那些技术不管用。`,
      `意味着性质最强的那些方法在当前实践里最少被采用，所以杠杆就在那儿。`,
      `意味着综述的检索做得不完整。`,
      `意味着这些技术太新，还没法评估。`,
    ],
    answer: 1,
    explain: `CaMeL 那条线以及相关的信息流控制工作，是文献里仅有的、靠构造而不是靠降低概率来限住注入损害的
      方法，而几乎没人引用、也几乎没人落地。这是个不寻常的位置：一项性质很强、也已经被理解清楚的技术，采用率
      却接近于零。对一个要决定把力气花在哪里的团队来说，它是这张地图上杠杆率最高的一项，这也是 A20 和 A21
      坐在这门课正中间的原因。`,
  },
];

export const refs = [
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, November 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '风险评估流程、案例研究的落地分析，以及收尾的三条建议' },
  { authors: 'Yonadav Shavit, Sandhini Agarwal, Miles Brundage, Steven Adler, Cullen O\'Keefe, Rosie Campbell, Teddy Lee, Pamela Mishkin, Tyna Eloundou, Alan Hickey, Katarina Slama, Lama Ahmad, Paul McMillan, Alex Beutel, Alexandre Passos, David G. Robinson',
    title: 'Practices for Governing Agentic AI Systems', venue: 'OpenAI, 2023',
    url: 'https://openai.com/index/practices-for-governing-agentic-ai-systems/' },
  { authors: 'National Institute of Standards and Technology', title: 'AI Risk Management Framework (AI RMF 1.0)',
    venue: 'NIST, 2023', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { authors: 'Anthropic', title: 'Anthropic\'s Responsible Scaling Policy', venue: 'Anthropic',
    url: 'https://www.anthropic.com/news/anthropics-responsible-scaling-policy' },
  { authors: 'Shishir G. Patil, Tianjun Zhang, Vivian Fang, Roy Huang, Aaron Hao, Martin Casado, Joseph E. Gonzalez, Raluca Ada Popa, Ion Stoica',
    title: 'GoEX: Perspectives and Designs Towards a Runtime for Autonomous LLM Applications',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2404.06921' },
  { authors: 'Lewis Hammond, Alan Chan, Jesse Clifton, Jason Hoelscher-Obermaier, Akbir Khan, Euan McLean and colleagues',
    title: 'Multi-Agent Risks from Advanced AI', venue: 'Cooperative AI Foundation, 2025',
    url: 'https://arxiv.org/abs/2502.14143' },
  { authors: 'European Union', title: 'EU Artificial Intelligence Act', venue: 'Regulation (EU) 2024/1689',
    url: 'https://artificialintelligenceact.eu/' },
  { authors: 'Authors of "Delegation Without Living Governance"', title: 'Delegation Without Living Governance',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.21226' },
  { authors: 'Authors of "Toward Safe and Responsible AI Agents"',
    title: 'Toward Safe and Responsible AI Agents: A Three-Pillar Model for Transparency, Accountability, and Trustworthiness',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.06223' },
];
