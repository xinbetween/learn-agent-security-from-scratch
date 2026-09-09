import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, range, select, toggle, button, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 15, attacks: '五种视角，同一个系统' };
export const scripts = ['/assets/js/sims/zh/a05.js'];

const maestro = svg(700, 340, `
${svgText(12, 18, 'MAESTRO 七层，以及各层归谁', 'd-ttl', 'start')}
${box(30, 40, 470, 34, 'L7  智能体生态', '市场、智能体互联、别人的智能体', 'd-attack')}
${box(30, 82, 470, 34, 'L6  安全与合规', '护栏、策略、审计', 'd-def')}
${box(30, 124, 470, 34, 'L5  评估与可观测', '基准测试、追踪、漂移', 'd-def')}
${box(30, 166, 470, 34, 'L4  部署与基础设施', '容器、密钥、网络', 'd-box')}
${box(30, 208, 470, 34, 'L3  智能体框架', '编排、工具调用、解析', 'd-box')}
${box(30, 250, 470, 34, 'L2  数据运营', 'RAG、记忆、向量库', 'd-attack')}
${box(30, 292, 470, 34, 'L1  基础模型', '权重、对齐、训练数据', 'd-sunk')}
${svgText(520, 60, '你继承', 'd-sub', 'start')}
${svgText(520, 100, '你构建', 'd-def-t', 'start')}
${svgText(520, 186, '你构建', 'd-sub', 'start')}
${svgText(520, 270, '你构建', 'd-attack-t', 'start')}
${svgText(520, 312, '你继承', 'd-sub', 'start')}
<line x1="510" y1="46" x2="510" y2="320" stroke="var(--border-strong)" stroke-dasharray="3 3"/>
${svgText(628, 160, '跨层威胁', 'd-attack-t')}
${svgText(628, 176, '往往', 'd-attack-t')}
${svgText(628, 192, '无人负责。', 'd-attack-t')}
`, { label: 'MAESTRO 的七层及其归属标记' });

export const body = `
${p(`五个框架，都讲得通，也都有人在用。问题不是哪个最好，而是当你只剩九十分钟、而一个智能体周五
就要上生产时，周二下午该跑哪一个。本章把五个框架对着同一个系统全跑一遍，让你看清每个框架能找出
别人找不出的东西。`)}

${h2('审视对象', 'target')}

${code(`TARGET: "Scout" — a research agent for a consultancy.

  tools     web_search, web_fetch, read_drive (the user's Google Drive),
            write_doc (creates a Drive doc), send_slack (posts to a channel)
  identity  runs as the requesting user via OAuth; tokens cached 30 days
  model     hosted API, no fine-tuning
  memory    per-user vector store of past research, written automatically
  deploy    a Slack bot; any employee can @mention it`, { lang: 'txt', file: '受审视的系统' })}

${p(`这是一个刻意设计得很普通的系统。它没有任何一处称得上失职，而它的各种变体今天正跑在大量公司
内部。`)}

${h2('把五个框架都跑一遍', 'lab')}

${sim({
  name: 'a05frameworks',
  title: '五个框架，一个智能体',
  badge: '交互实验',
  controls: select('a05-fw', '框架', [
    ['stride', 'STRIDE：通用软件，1999'],
    ['owasp', 'OWASP LLM 应用十大风险'],
    ['maestro', 'MAESTRO：智能体专用，七层'],
    ['atlas', 'MITRE ATLAS：对手技术库'],
    ['nist', 'NIST AI RMF：组织层面'],
    ['unique', '各自独有的发现'],
  ], 'stride'),
  body: out('a05-out'),
  note: `读完前面几项之后再切到最后一项。多框架演练真正有价值的产出是差集，不是并集。`,
})}

${h2('每个框架各自为何而生', 'purposes')}

${table(
  ['框架', '它问什么', '擅长', '短板'],
  [
    ['<b>STRIDE</b>', '攻击者能破坏这个系统的哪些属性？',
     '快，站在系统层面，能抓到 AI 框架完全略过的抵赖与假冒问题。',
     '对模型特有的失效只字不提。用 STRIDE 你找不出“后门”。'],
    ['<b>OWASP LLM Top 10</b>', '已知的 LLM 失效模式里，哪些适用于我？',
     '交给开发者的最佳清单。具体、文档完善、人人看得懂。',
     '它是一份清单，不是一套方法。清单上没有的威胁，它找不出来。'],
    ['<b>MAESTRO</b>', '智能体的七个层各自会出什么问题，跨层又会出什么问题？',
     '唯一会追问智能体生态层的框架，而未申明的智能体之间的连边就藏在那一层。',
     '最年轻、经受的实战检验最少；如果你只停留在逐行填表，分层反而会助长各扫门前雪的思维。'],
    ['<b>MITRE ATLAS</b>', '换成一个真实对手，他会怎么做？用什么共同词汇描述？',
     '给事物命名，让别的团队检索得到，也让检测规则能对应到具体技术。',
     '它是描述性的，不是生成性的。用来归类发现比用来产生发现更合适。'],
    ['<b>NIST AI RMF</b>', '围绕这个系统的组织运转得起来吗？',
     '凌晨三点真正管用的那几个问题：谁批准，谁能把它关掉，多快能关掉。',
     '它不是威胁模型。单靠它产生不出任何技术性发现。'],
  ]
)}

${figure(maestro, `<b>MAESTRO 的分层，以及那条归属线。</b> L1 和 L7 的大部分是你继承来的，你只能
管理风险；L2 到 L6 是你自己建的，你能修。真正伤到你的威胁都跨过那条线。托管模型的越狱（L1），
经由你未做校验的 RAG（L2）进入，再由你的工具层（L3）执行——它之所以致命，恰恰是因为整条路径
没有任何一个团队负责。`)}

${h2('只有一个框架能给出的那条发现', 'unique-findings')}

${p(`把五个框架都对 Scout 跑一遍，每一个都至少贡献了一条别人没给出的发现：`)}

${kv([
  ['STRIDE → 抵赖', `没有任何不可篡改的记录能把一次 Drive 写入和引发它的那个请求关联起来。没有
    哪个 AI 专用框架会问这件事，因为“你能不能还原出谁导致了什么”是个四十年前的软件问题，AI 框架
    默认你早就解决了。你并没有。`],
  ['OWASP → LLM08 向量库弱点', `嵌入库是一个访问控制对象，不只是一个数据存储。Scout 那个按用户
    划分的向量库可以跨项目检索，因为根本没人给它划过范围。`],
  ['MAESTRO → L7 生态层', `Scout 往 Slack 发消息。同一个工作区里的另一个机器人在读 Slack。没有
    任何一张图上画过这条边，而它是一个完整的致命三元组，由两个单独看都能过关的组件拼出来。`],
  ['ATLAS → 针对你的分类器定制的对抗数据', `不是“攻击者发来一个坏 prompt”，而是“攻击者针对你
    部署的那个特定护栏去优化一个页面”。这就是 <a href="/zh/chapters/a19/">A19</a> 里的自适应
    设定，其他框架只把它当成一种笼统威胁，而不是一项独立技术。`],
  ['NIST → 谁能把它关掉，多快能关掉', `这不是威胁，而是一个控制措施问题，也正是它决定了一次事件
    是持续一小时还是一周。`],
])}

${h2('既然你问了，这是我的建议', 'recommendation')}

${steps([
  ['先跑 STRIDE，而且是对着系统跑，不是对着 AI 跑',
   `三十分钟。它老、它快，能抓到那些真正造成大部分实际损失的无聊发现：未认证的调用方、缺失的
    审计记录、生命周期设错的凭据。先做这一步还有个好处：不让 AI 专属的工作把注意力全吸走。`],
  ['再用 MAESTRO 补上 STRIDE 没有词汇描述的那几层',
   `再花一小时。把七层走一遍，其中大部分时间花在 L2（数据运营）和 L7（生态）上，智能体真正新增
    的东西就在这两层。`],
  ['用 ATLAS 的词汇给发现命名',
   `十五分钟，而且后面会回本：检测规则可以对应到技术编号，别的团队能检索到你发现的东西，一年
    之后你还能判断同一件事是不是又发生了。`],
  ['把 OWASP 清单交给开发者',
   `这是最有可能真被读一遍的产物。把它当成合并前的检查清单，而不是威胁模型。`],
  ['等有人要来审计你的时候再用 NIST',
   `顺便留意：它问的那些问题，如果你事先没写下来，在压力之下你一个也答不上来。`],
])}

${callout('warn', '框架热情的失效模式', `<p style="margin-bottom:0">把五个框架都跑得很糟，比认真
跑好一个更糟。威胁模型的价值在于你真正着手处理的那些发现，而五份互相重叠、没人负责的平行文档
什么也产不出来。选一个主视角，彻底跑完，再用其余几个去抽查那些你已知这个视角看不见的类别。上面
那张表的“短板”一列，就是该抽查什么的清单。</p>`)}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `在三十分钟内对一个智能体跑完 STRIDE，并给出你真会动手去处理的发现。`,
  `说出 MAESTRO 的七层，并指出其中哪两层不在你的控制之内。`,
  `解释每个框架各自看不见什么，以及为什么。`,
  `针对给定情境选定一个视角并为这个选择辩护，包括为什么不跑其余几个。`,
])}
`;

export const quiz = [
  {
    q: `哪一类发现最可能由 STRIDE 给出，而所有 AI 专用框架都给不出？`,
    options: [
      `通过检索到的网页内容实施的提示注入。`,
      `抵赖：缺少把一次行动与引发它的请求关联起来的审计记录。`,
      `工具权限集合里的过度授权。`,
      `向量库的访问控制弱点。`,
    ],
    answer: 1,
    explain: `抵赖是 STRIDE 的一个类别，在以 LLM 为中心的框架里没有对应项，因为那些框架倾向于
      假定你早已解决了普通的软件问题。你几乎肯定没有：大多数智能体部署在六周之后都答不出“是哪个
      请求导致这个文件被写入的”，而这个缺口会把两小时的事件调查拖成两周。注入、过度授权和向量库
      范围限定都出现在 OWASP 或 MAESTRO 里；那个无聊的取证问题没有。`,
  },
  {
    q: `Scout 会把摘要发到一个 Slack 频道。另一个独立的日程机器人在读这个频道，并且能创建日历
        事件。哪个框架的结构最可能把这件事暴露出来？`,
    options: [
      `OWASP LLM Top 10，归在 LLM06 过度授权下。`,
      `MAESTRO，在第 7 层（智能体生态）。`,
      `STRIDE，归在权限提升下。`,
      `NIST AI RMF，归在 MAP 下。`,
    ],
    answer: 1,
    explain: `五个框架里只有 MAESTRO 为智能体生态设了明确的一层：其他智能体、各类市场，以及那些
      没有任何一个团队画过的系统间连边。这条边同时还是一个完整的致命三元组，由两个单独看都能过关
      的组件拼成，也就是 A03 里的组合失效。NIST 的 MAP 职能会要求你做一份清单，可能间接抓到它，
      但前提是编清单的人恰好想起了另一个机器人。`,
  },
  {
    q: `一个团队把五个框架并行跑成五份文档，没有单一负责人。最可能的结果是什么？`,
    options: [
      `覆盖全面，因为这些框架互为补充。`,
      `彼此重叠、没有优先级、谁也不去处理的一堆发现。`,
      `互相矛盾、必须逐条调和的发现。`,
      `颗粒度太细、工程师用不起来的模型。`,
    ],
    answer: 1,
    explain: `这些框架大体上是彼此认同的，所以并行跑五遍只会产出五份互相重叠的文档，外加一份资源
      严重不足的整改积压清单。威胁模型的价值恰好等于被修掉的那些发现。一个视角认真跑完，配上
      负责人和一份排好序的问题登记表，胜过五个视角浮皮潦草地跑一遍。其余几个框架应当用来针对你
      已知主视角存在的盲区做抽查。`,
  },
  {
    q: `对一个托管模型来说，MAESTRO 的哪些层是你修不了的，由此又能推出什么？`,
    options: [
      `L1 基础模型和 L7 生态的大部分；风险只能靠其他层的控制措施来管理，无法消除。`,
      `L3 智能体框架和 L4 基础设施；你必须自建部署。`,
      `L5 评估和 L6 安全；这些是供应商的责任。`,
      `没有；每一层都在你的掌控之内。`,
    ],
    answer: 0,
    explain: `托管模型的对齐、它的越狱和它的训练数据（L1）你只能继承，别人的智能体和各类市场的
      行为（L7）你同样只能继承。这两者你都打不了补丁。由此推出的结论是：你在 L2 到 L6 的控制措施
      必须按照“L1 一定会失守”来设计。A02 从另一个方向得出了同样的结论，这也是“限制损害”类控制
      比“抬高成本”类控制更要紧的原因。`,
  },
  {
    q: `在这套工作流里，MITRE ATLAS 最适合用来做什么？`,
    options: [
      `生成最初的威胁清单，因为它最完整。`,
      `用共同词汇给发现命名，好让检测规则能对应上，也好追踪问题是否重现。`,
      `评估组织的准备度。`,
      `提供一份面向开发者的检查清单。`,
    ],
    answer: 1,
    explain: `ATLAS 是描述性的（一份带编号的、已观测到的对手技术目录），而不是生成性的。它不是
      那个让你想到某个威胁的工具，但它是那个让你的威胁能被检测工程师读懂、能和别的团队的发现做
      比较、一年后还能检索到的工具。生成是 STRIDE 和 MAESTRO 的活，检查清单是 OWASP 的，准备度
      是 NIST 的。`,
  },
  {
    q: `Scout 把 OAuth token 缓存 30 天。在 STRIDE 里这属于哪一类，为什么它对智能体的影响比对
        普通应用更大？`,
    options: [
      `信息泄露；token 可能被写进日志。`,
      `权限提升；智能体的权限比用户的会话活得更久，因此这 30 天里任意一点上的失陷，都等于以一个当下并不在场的用户身份行动。`,
      `篡改；token 可能被修改。`,
      `拒绝服务；过期 token 会导致失败。`,
    ],
    answer: 1,
    explain: `一个长期缓存的 token 意味着智能体可以在用户不在场、没有对任何事表示同意、也不会
      察觉的时刻以该用户的身份行动。在普通应用里，会话 token 的边界是一个坐在屏幕前的人；在
      智能体里，它是一份常驻权限，一条注入进来的指令可以在周日凌晨三点把它用掉。这正是 A22 主张
      使用短生命周期、按任务发放、范围经过削减的凭据，而根本不复用用户会话 token 的原因。`,
  },
];

export const refs = [
  { authors: 'Loren Kohnfelder, Praerit Garg', title: 'The threats to our products (STRIDE)',
    venue: 'Microsoft, 1999', url: 'https://adam.shostack.org/microsoft/The-Threats-To-Our-Products.docx',
    note: '最初的那份备忘录；至今仍是现存最快的有效威胁模型' },
  { authors: 'Adam Shostack', title: 'Threat Modeling: Designing for Security', venue: 'Wiley, 2014',
    url: 'https://shostack.org/books/threat-modeling-book' },
  { authors: 'Ken Huang and the Cloud Security Alliance AI Safety Initiative',
    title: 'Agentic AI Threat Modeling Framework: MAESTRO', venue: 'Cloud Security Alliance, 2025',
    url: 'https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro' },
  { authors: 'OWASP Top 10 for LLM Applications team (Steve Wilson, Ads Dawson and contributors)',
    title: 'OWASP Top 10 for Large Language Model Applications', venue: 'OWASP, 2025',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
  { authors: 'OWASP Agentic Security Initiative', title: 'Agentic AI — Threats and Mitigations',
    venue: 'OWASP GenAI Security Project, 2025',
    url: 'https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/' },
  { authors: 'MITRE ATLAS team', title: 'MITRE ATLAS: Adversarial Threat Landscape for Artificial-Intelligence Systems',
    venue: 'MITRE', url: 'https://atlas.mitre.org/' },
  { authors: 'National Institute of Standards and Technology',
    title: 'AI Risk Management Framework (AI RMF 1.0)', venue: 'NIST, 2023',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { authors: 'National Institute of Standards and Technology',
    title: 'SP 800-218A: Secure Software Development Practices for Generative AI and Dual-Use Foundation Models',
    venue: 'NIST, 2024', url: 'https://csrc.nist.gov/pubs/sp/800/218/a/final' },
  { authors: 'Vineeth Sai Narajala and colleagues',
    title: 'Securing Agentic AI: A Comprehensive Threat Model and Mitigation Framework for Generative AI Agents',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2504.19956' },
];
