import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, range, select, toggle, button, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 14, attacks: '25 类漏洞' };
export const scripts = ['/assets/js/sims/zh/a04.js'];

const arch = svg(760, 400, `
${svgText(12, 18, '参考架构，叠加六个威胁面', 'd-ttl', 'start')}

${box(24, 52, 118, 46, '用户', '主体', 'd-sunk')}
${svgText(83, 118, 'S1 直接', 'd-attack-t')}

${box(300, 44, 160, 62, 'LLM 引擎', '感知 · 规划')}
${svgText(380, 126, 'S3 内部', 'd-attack-t')}

${box(300, 176, 160, 46, '编排层', '智能体循环')}

${box(70, 250, 130, 46, '工具', 'API · shell · 浏览器', 'd-attack')}
${box(230, 250, 130, 46, '知识库', 'RAG · 记忆', 'd-attack')}
${box(390, 250, 130, 46, '其他智能体', '任务委派', 'd-attack')}
${box(550, 250, 130, 46, '身份 / IAM', 'token · 作用域', 'd-trust')}
${svgText(300, 316, 'S2 间接：一切喂进上下文的东西', 'd-attack-t')}

${box(560, 44, 176, 46, '人工监督', '审批 · 复核')}
${svgText(648, 118, 'S5 监督', 'd-attack-t')}

<rect x="18" y="336" width="722" height="46" rx="6" class="d-sunk"/>
${svgText(379, 358, '基础设施：主机、容器、网络、依赖包、模型权重', 'd-lbl')}
${svgText(379, 374, 'S4 资源', 'd-attack-t')}

${arrow(142, 75, 298, 75)}
${arrow(460, 75, 558, 75)}
${arrow(380, 106, 380, 174)}
${arrow(380, 222, 380, 248)}
${arrow(200, 248, 340, 224)}
${arrow(520, 248, 420, 224)}
${svgText(700, 200, 'S6 复合：', 'd-attack-t', 'end')}
${svgText(700, 216, '循环本身', 'd-attack-t', 'end')}
<path d="M470 199 C 540 199 540 150 470 150" class="d-attack-l" marker-end="url(#ah)" fill="none"/>
`, { label: '标出六个威胁面的智能体参考架构' });

export const body = `
${p(`你已经有了定义、有了边界，也有了一套分诊测试。接下来你需要的是一份枚举：真正会出问题的那些
东西的清单，好让你的威胁模型长成一个你守得住的形状，而不是你那天恰好想到的形状。`)}

${p(`下面这套分类法出自卡内基梅隆大学软件工程研究所（SEI）Grimes 等人的系统化综述。他们读了 64 项
学术研究、109 份业界资料和 36 个真实案例，把结果归一化成六个威胁面和 25 类漏洞。这是这个领域目前
最完整的一张地图。评注和章节链接是本课程加的。`)}

${figure(arch, `<b>每个面挂在哪里。</b>S1 是用户那条通道。S2 是一切不经人敲键盘就写进上下文的东西。
S3 是模型自己。S4 是底下那台机器。S5 是本该抓住其余各面的那道审查。S6 之所以存在，是因为循环会跑
很多次，也因为智能体之间会互相说话。`)}

${h2('六个威胁面', 'surfaces')}

${table(
  ['威胁面', '资料数', '一句话说清', '章节'],
  [
    ['<b>S1 直接</b>', '60', '用户就是对手，或者正在被冒充。', '<a href="/zh/chapters/a06/">A06</a>'],
    ['<b>S2 间接</b>', '55', '有东西没经人敲键盘就写进了上下文。', '<a href="/zh/chapters/a07/">A07</a>–<a href="/zh/chapters/a13/">A13</a>'],
    ['<b>S3 内部</b>', '62', '模型出错、被下了后门，或者推理跑偏。', '<a href="/zh/chapters/a14/">A14</a>'],
    ['<b>S4 资源</b>', '29', '针对智能体所在那台机器的经典攻击。', '<a href="/zh/chapters/a16/">A16</a>、<a href="/zh/chapters/a23/">A23</a>'],
    ['<b>S5 监督</b>', '19', '本该抓住上面这一切的人工审查，没抓住。', '<a href="/zh/chapters/a24/">A24</a>'],
    ['<b>S6 复合</b>', '24', '循环和拓扑会以任何单个组件都不会的方式失效。', '<a href="/zh/chapters/a15/">A15</a>'],
  ]
)}

${p(`注意资料数最高的是 S3。对 LLM 智能体来说，被引用得最多的那个威胁不是提示注入，而是基础模型
本身就是错的。失准、幻觉和纯粹的不准确出现在 34 份被审阅的资料里，多于任何其他单一类别。一个智能体
因为读错了一份 diff 就信心十足地删掉了错误的分支，这已经是一起安全事件了，而里面根本没有对手。`)}

${h2('把这张图走一遍', 'lab')}

${sim({
  name: 'a04map',
  title: '威胁分类法 · 学术界 vs 业界',
  badge: '交互实验',
  controls: select('a04-view', '视角', [
    ['count', '按资料数'],
    ['split', '按学术界／业界之分'],
    ['chapter', '按本课程在哪里讲'],
  ], 'count'),
  body: out('a04-out'),
  note: `这些计数是 173 份被审阅资料里提到该类别的资料份数。它们量的是关注度，不是真实世界里的
    发生频率（那个数字没人有），所以要把它们读成“这个领域在担心什么”。这本身就是有用的信息：它
    告诉你，只读一种文献，你的威胁模型会在哪一侧超配。`,
})}

${h2('这个分裂应该改变你的阅读方式', 'split')}

${p(`对实践者来说，这份综述最有用的发现不是任何一个具体数字，而是学术界和业界各自盯着哪里看，存在
系统性的差异。`)}

${callout('boundary', '两套文献，两个盲区', `
<p><b>学术界侧重内部威胁。</b>基础模型失效、后门、数据投毒、推理失效、欺骗与图谋。新颖、以模型为
中心、能发论文。</p>
<p><b>业界侧重间接威胁。</b>IAM 失效、工具攻击、间接注入、供应链。偏运营、系统层面、从事故里学
来的。</p>
<p style="margin-bottom:0">两边都没错，它们本来就是被资助去看不同的东西。但只用其中一边拼出来的
威胁模型，会有一个可以预判的窟窿。只读论文，你会低估身份和供应链，而真实事故大多数恰恰出在这两类
上。只读厂商指南，你会低估后门和评测作弊，而这两类在真正要紧起来之前没人会注意到。</p>`)}

${h2('没有哪一份资料握着整张图', 'coverage')}

${p(`这份综述还量了每一份资料覆盖了它自己那套分类法的多少。173 份文档里，没有任何一份覆盖了全部
25 个威胁类别，也没有任何一份覆盖了全部 33 个最佳实践类别。在它并排比较的那几份学术综述里，覆盖面
最宽的一份触到了 16 个最佳实践类别，多数不到十个。`)}

${p(`由此带来的后果是流程层面的。一份靠读这个领域最好的那篇论文搭起来的威胁模型必然缺类别，而且
——这才是难受的地方——你不会知道缺的是哪些，因为论文不会列出它没写什么。把分类法当成一份对着你的
系统跑的检查清单，而不是一份从头读到尾的书单。`)}

${code(`# The check that catches the categories you would not have thought of.
for surface in TAXONOMY:
    for vuln_class in surface.classes:
        print(f"{vuln_class}: applicable to our system? [y/n/why not]")

# Twenty-five lines of output. The value is entirely in the "why not" column,
# because that is where you discover you assumed something you cannot justify.`,
  { lang: 'py', file: 'code/a04_threat_taxonomy.py' })}

${h2('两个值得跟它较劲的结论', 'takeaways')}

${steps([
  ['真正在长的那块是传统网络安全威胁',
   `综述发现，拒绝服务、中间人和代码注入（也就是普通的网络安全）在智能体文献里反复出现，而在更早
    的、只谈单体 LLM 的文献里并没有。智能体要接系统，而接了系统的系统，四十年来一直有那些毛病。
    如果你的智能体安全工作和你的应用安全工作没有任何交集，那两边一定有一边漏了东西。`],
  ['威胁建模需要的是标准化，而不是继续往外扩',
   `对已有分类法的引用稀疏而零散，术语差异之大，逼得这份综述不得不把一长串指向同一件事的不同叫法
    归一化。这是一个领域层面的问题，但你可以在本地帮上忙：选一套词汇，MAESTRO、ATLAS 或者 OWASP
    都行，然后在你自己的威胁模型里始终如一地用它，让你的发现在不同系统之间、不同年份之间可以比较。`],
])}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `说出六个威胁面，并在每一个面里各举一个漏洞类别。`,
  `解释为什么“模型就是错了”是被引用最多的那个威胁，以及这对测试意味着什么。`,
  `只看一份威胁模型作者的背景，就预判出它会漏掉哪些类别。`,
  `把分类法当作检查清单对着一个系统跑一遍，并为每一条“不适用”给出理由。`,
])}
`;

export const quiz = [
  {
    q: `在 SEI 的综述里，哪个威胁面的资料数最高？其中被引用最多的单一类别又是什么？`,
    options: [
      `直接威胁；直接提示注入。`,
      `内部威胁；基础模型漏洞，比如失准和幻觉。`,
      `间接威胁；间接提示注入。`,
      `复合威胁；级联失效。`,
    ],
    answer: 1,
    explain: `内部威胁以 62 份资料领先，基础模型漏洞以 34 份成为被引用最多的单一类别。这会让抱着
      “提示注入总该排第一”的期待走进来的人吃一惊。直接提示注入排第二，52 份，落在一个总共 60 份
      资料的面里。它的实践含义很直接：相当大一部分智能体事故里根本没有对手。是智能体判断错了，
      照着错的判断动了手，而那个动作不可逆。这种失效模式要靠可逆性分级和评测来处理，注入防御在
      这里帮不上忙。`,
  },
  {
    q: `你的威胁模型完全是照着学术综述写出来的。你最可能低估了哪些类别？`,
    options: [
      `模型后门与数据投毒。`,
      `推理失效与欺骗。`,
      `IAM 失效、工具攻击和供应链威胁。`,
      `幻觉与失准。`,
    ],
    answer: 2,
    explain: `综述发现了一个稳定的分裂：学术界过度倾斜到以模型为中心的、新兴的威胁上，业界则倾斜到
      系统集成类的威胁上。你会漏掉的这三类（身份与访问管理、针对工具以及经由工具的攻击、供应链），
      恰好是产出最多已披露事故的运营类类别，而它们在学术资料里代表性不足，因为它们既不新颖也不好
      发论文。反过来同样成立：只照着厂商指南搭出来的模型，会低估后门和评测作弊。`,
  },
  {
    q: `综述里没有任何单独一份资料覆盖全部 25 个威胁类别，这意味着什么？`,
    options: [
      `这套分类法切得太细，没法用。`,
      `从任何单独一份资料推出来的威胁模型都会有你看不见的缺口，所以分类法应该当检查清单跑，而不是当摘要读。`,
      `综述的方法论前后不一致。`,
      `多数资料质量不高。`,
    ],
    answer: 1,
    explain: `没有任何一份资料覆盖全部 25 个威胁类别，33 个最佳实践类别那边也一样。这不是在批评任何
      一份资料，综述本来就有范围，但它改变了你该怎么用它们。读完最好的那篇论文，你手里是一个不完整
      的模型，<em>而且没有一份缺失清单</em>。把整套分类法逐类走一遍，并把每一类为什么不适用写下来，
      恰恰能翻出那些你自己都不知道自己做过的假设。`,
  },
  {
    q: `一个智能体被检索到的文档里的注入指令劫持，于是用攻击者指定的参数调用了一个工具，调用失败了，
        于是它在八步之内不断重试并一步步抬高权限。这里涉及哪些面？`,
    options: [
      `只有 S2 间接。`,
      `S2 间接和 S3 内部。`,
      `S2 间接（注入）、S3 内部（工具误用），以及 S6 复合（不断升级的重试循环）。`,
      `六个面全都涉及。`,
    ],
    answer: 2,
    explain: `真实事故是跨面的，这正是单面威胁模型总会低估它们的原因。注入是 S2。用有害参数去调用
      一个合法工具是 S3 的工具误用。而那个不断升级的重试循环，第三步的一个错误被后面每一个信任它
      的步骤放大，是 S6 的级联失效，也是绝大多数团队压根没有任何控制的那一部分。如果重试耗光了
      预算，或者有人挥挥手放行了那次提权，S4 和 S5 也会加进来。`,
  },
  {
    q: `综述为什么认为，传统网络安全威胁对智能体比对单体 LLM 更要紧？`,
    options: [
      `因为智能体用的模型更大，要保护的参数更多。`,
      `因为智能体要和外部系统集成，于是继承了联网软件一直以来就有的拒绝服务、中间人和代码注入攻击面。`,
      `因为智能体框架是用内存不安全的语言写的。`,
      `因为智能体更可能部署在自建机房里。`,
    ],
    answer: 1,
    explain: `一个聊天机器人的威胁模型基本上只关心它说了什么。而一个智能体会开 socket、拉起进程、
      写文件、向 API 认证，于是它在自己那些 AI 专属问题之上，还完整继承了普通联网软件的攻击面。
      综述的发现是，智能体文献确实反映了这一点：经典威胁反复出现，而更早的 LLM 文献几乎不提它们。
      它在组织层面的含义是，你的智能体安全工作应该和你已有的应用安全工作明显地连在一起，而不是
      另起一套带着自己一套词汇的平行项目。`,
  },
  {
    q: `综述给直接提示注入报了一个 <code>n=52</code>。这个数字量的是什么？`,
    options: [
      `真实世界中记录在案的直接注入攻击成功次数。`,
      `被审阅的资料里，把直接提示注入当作一种威胁提到的资料份数。`,
      `对它有漏洞的智能体所占的百分比。`,
      `已被编目的注入技术种类数。`,
    ],
    answer: 1,
    explain: `这些是 173 份被审阅文档上的关注度计数，不是发生率。智能体攻击在真实世界里的频率，
      没有人手上有可靠数据，你向相关方展示一套分类法时，值得把这一点讲清楚。这些数字告诉你的是
      这个领域在担心什么，这对发现你自己的盲区确实有用，但它们不能当成风险来读。把关注度换算成
      风险，需要你自己那套系统的暴露面，而那正是项目 1 要你产出的东西。`,
  },
];

export const refs = [
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, November 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '六个威胁面的分类法、资料计数，以及学术界与业界的分裂分析' },
  { authors: 'Zehang Deng, Yongjian Guo, Changzhou Han, Wanlun Ma, Junwu Xiong, Sheng Wen, Yang Xiang',
    title: 'AI Agents Under Threat: A Survey of Key Security Challenges and Future Pathways',
    venue: 'ACM Computing Surveys, 2025', url: 'https://dl.acm.org/doi/10.1145/3716628' },
  { authors: 'Shaina Raza, Ranjan Sapkota, Manoj Karkee, Christos Emmanouilidis',
    title: 'TRiSM for Agentic AI: Trust, Risk and Security Management in LLM-Based Agentic Multi-Agent Systems',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.04133' },
  { authors: 'Mohamed Amine Ferrag, Norbert Tihanyi, Djallel Hamouda, Leandros Maglaras, Merouane Debbah',
    title: 'From Prompt Injections to Protocol Exploits: Threats in LLM-Powered AI Agent Workflows',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.23260' },
  { authors: 'Erik Miehling, Karthikeyan Natesan Ramamurthy, Kush R. Varshney and colleagues (IBM Research)',
    title: 'Agentic AI Needs a Systems Theory', venue: 'IBM Research, arXiv 2025',
    url: 'https://arxiv.org/abs/2503.00237' },
  { authors: 'Lilian Weng', title: 'LLM-Powered Autonomous Agents', venue: 'lilianweng.github.io, 2023',
    url: 'https://lilianweng.github.io/posts/2023-06-23-agent/',
    note: '参考架构所依据的那套组件拆分' },
  { authors: 'Ken Huang and the Cloud Security Alliance AI Safety Initiative',
    title: 'Agentic AI Threat Modeling Framework: MAESTRO', venue: 'Cloud Security Alliance, 2025',
    url: 'https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro' },
];
