import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 15, attacks: '事后你还能看见什么' };
export const scripts = ['/assets/js/sims/zh/a26.js'];

export const body = `
${p(`第 5 部分里的每一项控制都可能被绕过、被配错，或者干脆就不在攻击者找到的那条路径上。监控的作用，是
告诉你这件事发生了；而更常见的作用，是让你在六周后有人来问的时候，还能把当时发生了什么重建出来。`)}

${h2('轨迹记录', 'trajectory')}

${code(`{"run":"r1","step":2,"kind":"tool_call","tool":"http_get",
 "args":{"url":"https://c.example/g"},
 "caused_by":"user_request",     "provenance":"trusted",
 "prev":"0000000000000000",      "hash":"3f9ac1b2e4d78a05"}

{"run":"r1","step":4,"kind":"tool_call","tool":"read_file",
 "args":{"path":".env"},
 "caused_by":"tool_result#3",    "provenance":"untrusted_web",
 "prev":"3f9ac1b2e4d78a05",      "hash":"b17c4e29d0f3a866"}`,
  { lang: 'json', file: 'code/a26_monitoring.py' })}

${p(`几乎全部价值都压在四个字段上，而大多数生产环境里的智能体一个都没记：`)}

${kv([
  ['<code>caused_by</code>', `是哪一条更早的记录产生了这一条。如果你做了
    <a href="/zh/chapters/a21/">A21</a>，这个字段你已经有了。没有它，日志说的是<em>发生了什么</em>；
    有了它，说的是<em>为什么</em>。`],
  ['<code>provenance</code>', `触发数据的信任级别。正是它把一条日志变成一个检测器。“一次由不可信数据
    引发的工具调用”是一句可以直接写出来的查询。`],
  ['<code>prev</code> / <code>hash</code>', `哈希链，改动任何一条记录都会让后面每一条失效。每条记录
    只多花几个字节，就换来防篡改可检测。`],
  ['<code>policy_decision</code>', `要记<b>拒绝</b>，不要只记成功的调用。一次拒绝是你信号最强的事件，
    也是最多系统随手扔掉的那个。`],
])}

${sim({
  name: 'a26trace',
  badge: '交互实验',
  title: '轨迹分析',
  controls: [
    select('a26-view', '视图', [
      ['trace', '轨迹'],
      ['tamper', '篡改检测'],
      ['drift', '任务漂移'],
      ['aggregate', '跨会话汇总'],
    ], 'trace'),
  ].join(''),
  body: out('a26-out'),
  note: `汇总视图抓的正是逐请求检查抓不到的东西：A09 里那条慢速外泄通道，单看任何一条消息都不异常，
    模式只存在于跨会话的层面。`,
})}

${h2('任务漂移', 'drift')}

${p(`有两种办法可以判断智能体已经不在做它被要求做的事了。`)}

${ul([
  `<b>结构化</b>，而且几乎不花钱：凡是因果祖先不可信、且所用工具并非用户请求所蕴含的动作，一律标记。
   只需要溯源信息，不需要模型，也不需要阈值。代码文件里实现的就是这一种。`,
  `<b>基于激活值</b>，更强：Abdelnabi 等人通过对比不可信内容进入上下文前后模型内部状态的差值来检测
   漂移。它完全不依赖对文本的解析，因此对措辞的变化很鲁棒，但它需要对模型的白盒访问。`,
])}

${h2('汇总分析', 'aggregate')}

${p(`有些攻击在构造上就注定了逐请求看不见。A09 那条慢速通道每个会话往 CDN 发十二个字节，孤立地看毫无
异常，放到四十个会话上看则一目了然。值得按时间维度而不是按单条消息去算的信号：`)}

${ul([
  `在本来毫不相干的多次运行里，反复联系同一个罕见目的地。`,
  `均匀而细小的出站载荷（这种分布在自然情况下不会出现）。`,
  `任务构成没变，每次请求的成本却在上涨（这就是你的 <a href="/zh/chapters/a16/">A16</a> 检测器）。`,
  `同一串工具调用序列出现在互不相关的用户身上，这是共享语料被投毒的特征
   （<a href="/zh/chapters/a12/">A12</a>）。`,
  `来自同一个身份的策略拒绝数突然飙升。`,
])}

${h2('把端点当作执行点', 'endpoint')}

${p(`对桌面智能体和写代码的智能体来说，前面讨论的一切之下还有一层。Claude Code、Cowork 那类桌面智能体
以及各种开源框架，都是直接在一台工作站上执行终端命令、修改文件、发起网络连接的。因此，可观测的安全事件
就是普通的端点遥测：进程创建、文件修改、网络活动。`)}

${p(`CrowdStrike 那份关于“在 AI 执行的地方保护 AI”的白皮书给出了一个结构性论证：攻击面已经从应用层移到
了执行层，所以执行点也得跟着移。有两个结论无论你用哪家产品都值得记住：`)}

${ul([
  `<b>在系统调用这一层，智能体的活动和人的活动没有区别。</b>智能体跑 <code>curl</code> 和开发者跑
   <code>curl</code> 产生的是同一个事件。要把它们分开，就得把进程血缘归属到某个智能体，这正是
   <a href="/zh/chapters/a22/">A22</a> 里智能体身份问题的落地形态。`,
  `<b>发现要排在第一位。</b>大多数组织根本列不出自己端点上跑着哪些 AI 智能体、各自有什么权限。你无法
   监控一份你没有的清单，而这通常是一个智能体安全项目最诚实的第一个发现。`,
])}

${callout('warn', '关于厂商材料', `<p style="margin-bottom:0">上面那套框架，执行层、端点遥测、智能体发现，
是有用的，写在这里是因为它本身站得住。任何厂商白皮书里的产品能力宣称都属于营销，不作为课程材料复述。把论证
和广告分开看，这个习惯值得用在这个领域的每一份业界资料上。</p>`)}

${h2('把隐私上的张力老实说清楚', 'privacy')}

${p(`SEI 的综述发现，这个矛盾就悬在它自己的语料里没解决。一部分资料建议尽可能多地记日志，以支撑审计和
事件响应；另一部分建议尽量少留存，以限制隐私暴露。两边都是对的，而智能体的轨迹格外敏感，因为它们把用户的
文档、消息和凭据流经上下文的样子原样装了进去。`)}

${p(`行得通的做法是分层，而不是二选一。元数据和哈希按完整精度记录、长期留存；内容按降低的精度记录、给一个
很短的 TTL；在写入前就脱敏，而不是查询时才脱敏；并且让留存期成为一个被记录下来的决定，而不是没人选过的
默认值。`)}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `说出把日志变成可调查轨迹的那四个字段。`,
  `实现哈希链，并说清它防住了什么、没防住什么。`,
  `不用模型，结构化地检测任务漂移。`,
  `说出三个只在汇总层面才存在的信号。`,
])}
`;

export const quiz = [
  {
    q: `哪个字段能把智能体日志从“发生了什么”变成“为什么会发生”？`,
    options: [
      `精确的时间戳。`,
      `<code>caused_by</code>，也就是产生了这条记录的那条更早的记录。`,
      `模型版本。`,
      `用户 ID。`,
    ],
    answer: 1,
    explain: `因果关系才是事件调查真正要问的问题。一串工具调用只告诉你智能体读了 <code>.env</code>；
      <code>caused_by: tool_result#3</code> 才告诉你它这么做是因为抓回来的页面里的内容，而这才是结论。
      时间戳只能让你猜个先后，用户 ID 则是 A10 已经证明过的、在正当行为和被劫持行为里完全一样的那个字段。
      如果你在 A21 里做过溯源追踪，这个字段是白送的。`,
  },
  {
    q: `给轨迹日志做哈希链能防住什么，防不住什么？`,
    options: [
      `它能阻止攻击者读日志，但阻止不了写。`,
      `它让悄无声息的改动变得不可能，因为任何修改都会让后续每一个哈希失效；但它挡不住有写权限的攻击者截断或丢弃日志。`,
      `它能阻止日志注入攻击。`,
      `它对静态日志做了加密。`,
    ],
    answer: 1,
    explain: `链式哈希给的是防篡改<em>可检测</em>，不是防篡改。攻击者改了第四条记录，从那一条起链就明显断了，
      于是损害从看不见变成了看得见。截断和整体删除依然做得到，所以你还要及时把记录送出本机。机密性和日志
      注入是另外两回事，需要另外的控制。`,
  },
  {
    q: `不用任何模型、不设任何阈值，怎么检测任务漂移？`,
    options: [
      `把输出长度和请求长度作比较。`,
      `凡是因果祖先不可信、且所用工具并非用户请求所蕴含的动作，一律标记。`,
      `测量每一步的时延。`,
      `数工具调用的次数。`,
    ],
    answer: 1,
    explain: `只要你记录了溯源和因果，这就是一句对现成字段的结构化查询。“用户要的是某个 URL 的摘要；这次
      <code>send_email</code> 调用是由那个 URL 的内容引发的”本身就是一个完整的结论，不需要任何推断。
      激活值差值的做法更强、对措辞更鲁棒，但它需要对模型的白盒访问。结构化那一版的成本只是一次数据库查询。`,
  },
  {
    q: `四十个会话各往同一个 CDN 发了十二个字节。没有哪一次请求是异常的。什么能抓到它？`,
    options: [
      `逐请求的 DLP 扫描。`,
      `跨会话的汇总分析：一个目的地、很多会话、载荷小得整齐划一，这种模式在自然情况下不会出现。`,
      `对工具结果做注入分类。`,
      `按请求做限流。`,
    ],
    answer: 1,
    explain: `慢速通道就是冲着逐消息阈值设计的，所以任何消息级的控制都看不见它。信号只存在于联合分布里：
      一个罕见目的地被反复联系，载荷小得反常地均匀。不过顺序上要说句老实话：出站允许清单本来可以直接
      把它挡掉，在这里预防胜过检测。汇总监控是你在预防不完整时才需要的东西。`,
  },
  {
    q: `为什么在端点遥测里很难把智能体的活动和人的活动区分开？`,
    options: [
      `智能体会刻意模仿人的操作节奏。`,
      `在系统调用这一层，智能体跑 <code>curl</code> 和开发者跑 <code>curl</code> 产生的事件完全一样，要区分就得把进程血缘归属到某个智能体身份。`,
      `端点上的探针看不到子进程活动。`,
      `智能体都是以 root 身份运行的。`,
    ],
    answer: 1,
    explain: `执行层没有意图和作者的概念，它只看到一个进程和一次系统调用。归属要求你知道这棵进程树源自某个
      智能体运行时，以及它属于哪个任务，这正是 A22 里智能体身份问题的落地形态。这也是为什么发现要排在
      第一步：一个连自己端点上跑着哪些智能体都列不出来的组织，根本没有归属的基础。`,
  },
  {
    q: `文献里有两条互相矛盾的建议：什么都记，和尽量少留存。可行的解法是什么？`,
    options: [
      `按你所在的监管机构的要求来。`,
      `把元数据和内容分开处理：元数据和哈希按完整精度长期留存，内容按降低的精度留存并配短 TTL，写入前先脱敏。`,
      `什么都记，但加密起来。`,
      `什么都不记，只靠预防。`,
    ],
    answer: 1,
    explain: `这个张力是真实的，SEI 的综述发现它在自己的语料里都没解决，因为两条建议各自针对的风险都成立。
      解法是结构上的分层，而不是二选一：让轨迹可调查的那些字段（因果、溯源、工具名、哈希）便宜且并不特别
      敏感，而让轨迹成为隐私负担的那部分内容，则短暂留存并在入库时脱敏。最要紧的是，留存期要变成一个被
      写下来的决定，而不是一个默认值。`,
  },
];

export const refs = [
  { authors: 'Sahar Abdelnabi, Aideen Fay, Giovanni Cherubin, Ahmed Salem, Mario Fritz, Andrew Paverd',
    title: 'Get My Drift? Catching LLM Task Drift with Activation Deltas', venue: 'IEEE SaTML, 2025',
    url: 'https://arxiv.org/abs/2406.00799' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Authors of SentinelAgent', title: 'SentinelAgent: Graph-based Anomaly Detection in LLM-based Multi-Agent Systems',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2505.24201' },
  { authors: 'Authors of Trajectory Guard', title: 'Trajectory Guard: A Lightweight, Sequence-Aware Model for Real-Time Anomaly Detection in Agentic AI',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.00516' },
  { authors: 'Authors of "Structural Representations for Cross-Attack Generalization"',
    title: 'Structural Representations for Cross-Attack Generalization in AI Agent Threat Detection',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.01723' },
  { authors: 'Authors of "Disclosure Audits for LLM Agents"', title: 'Disclosure Audits for LLM Agents',
    venue: 'arXiv, 2025', url: 'https://www.arxiv.org/pdf/2506.10171' },
  { authors: 'Silen Naihin, David Atkinson, Marc Green, Merwane Hamadi, Craig Swift, Douglas Schonholtz, Adam Tauman Kalai, David Bau',
    title: 'Testing Language Model Agents Safely in the Wild', venue: 'NeurIPS Workshop, 2023',
    url: 'https://arxiv.org/abs/2311.10538' },
  { authors: 'CrowdStrike', title: 'Securing AI Where It Executes: The Endpoint Is the New Control Point for AI Agent Security',
    venue: 'CrowdStrike white paper, 2026',
    note: '执行层的框架与智能体发现的论证；产品能力宣称未予复述' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '18 份资料推荐记录日志；语料中日志与隐私之间的矛盾' },
];
