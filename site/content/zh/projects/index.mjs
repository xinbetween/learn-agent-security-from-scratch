import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, sim, out, pill } from '../../../lib/components.mjs';

const deliverable = (items) => callout('defense', '交付物', `<ul style="margin-bottom:0">${items.map(i => `<li>${i}</li>`).join('')}</ul>`);
const check = (items) => `<h3 id="done">达成以下几点，你就做完了</h3>${ul(items)}`;

/* ============================================================ P1 ======== */
const P1 = {
  body: `
${p(`本课程里的每一项防御都从威胁模型出发，而不是你自己动手建的威胁模型，你不会真的相信它。
本项目要为一个你真正在用的智能体产出一份威胁模型，不是玩具；除了第一部分的阅读材料，你什么都不需要。`)}

${h2('选定目标', 'target')}
${p(`挑一个你有权限访问的真实智能体：编码助手、浏览或研究智能体、收件箱或日历助手、客服机器人、
数据分析智能体都行。它不一定得是你自己造的，但它的工具和数据必须是你能如实枚举出来的。`)}
${callout('note', '如果手头没有合适的对象', `<p style="margin-bottom:0">那就用你将在项目 2 里搭建的
实验智能体，只写规格、先不实现：一个带网页工具、文件工具和邮件工具，以你的凭据运行的研究智能体。
练习的内容完全一样。</p>`)}

${h2('第 1 步：画出架构', 'architecture')}
${p(`照着 <a href="/zh/chapters/a04/">A04</a> 的参考架构，在一页纸上画出：LLM 引擎、编排循环、
每一个工具、每一个数据源、每一个会接手工作的其他智能体或人类，以及每个组件是以什么身份行动的。
画不出来，就守不住；图上的空白本身就是发现。`)}
${deliverable(['一页架构图，标出每个组件、每个数据源和每一条信任边界。'])}

${h2('第 2 步：四个问题', 'four-questions')}
${p(`来自 <a href="/zh/chapters/a01/">A01</a>，针对你的目标逐条给出具体答案：`)}
${steps([
  ['哪些内容会进入上下文，而陌生人可以往里写？', `把每一个会返回字节的工具都列出来，并写清这些字节
    由谁控制。这就是你的注入面。`],
  ['智能体能做什么，用谁的权限做？', `每一个工具、它使用的凭据，以及它最糟糕的那次调用会造成多大的
    影响范围。这就是你的行动面。`],
  ['什么东西能出去，走的是哪条路？', `每一条数据外泄通道，包括那些不属于网络访问的：渲染出来的图片、
    链接、被同步的文件、同伴智能体（<a href="/zh/chapters/a09/">A09</a>）。`],
  ['哪些操作不可逆？', `按可逆性给行动面排个序（<a href="/zh/chapters/a24/">A24</a>）。`],
])}

${h2('第 3 步：给三元组打分', 'trifecta')}
${p(`套用 <a href="/zh/chapters/a03/">A03</a> 的判据，而且要沿着路径来套，不能只看单个智能体
（<a href="/zh/chapters/a15/">A15</a>）。你的系统作为一个整体，是不是三条腿都占齐了？如果是，
砍掉哪一条最便宜，砍掉之后又要损失多少能力？`)}

${h2('第 4 步：把分类体系走一遍', 'taxonomy')}
${p(`把<a href="/zh/threats/">威胁地图</a>上全部 25 类漏洞过一遍。每一类都写下“适用”或
“不适用，因为……”。交付物是“因为”那一列。你自圆不了的假设，就是在那里冒出来的。`)}
${deliverable(['一张 25 行的表，每一类标注适用与否，每个“不适用”都配一句理由。'])}

${h2('第 5 步：排序并给出建议', 'rank')}
${p(`产出一份排好序的风险清单：把适用的威胁按（影响范围 × 发生可能性）排序，每一条映射到
<a href="/zh/defenses/">防御地图</a>上的一个控制类别，并标注它是“限制损害”还是“抬高成本”。
前三名各配一条具体的首步缓解措施。`)}
${deliverable(['一份排序后的风险清单（威胁 → 组件 → 控制 → 类别），前三名各带一个具体的下一步。'])}

${check([
  '你能凭记忆说出自己这个智能体的注入面、行动面和数据外泄面。',
  '每一个被你排除的威胁类别，都有一句“不适用，因为……”。',
  '前三大风险各自对应一项具体控制，并被正确归类为限制损害还是抬高成本。',
  '没见过你这个智能体的人，读完这份文档也能看懂它的风险状况。',
])}`,
  refs: [
    { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
      title: 'SoK: Bridging Research and Practice in LLM Agent Security', venue: 'CMU SEI, 2025',
      url: 'https://doi.org/10.1184/R1/30610928', note: '参考架构，以及那套可重复的评估方法' },
    { authors: 'Ken Huang, Vineeth Sai Narajala and the CSA AI Safety Initiative', title: 'Agentic AI Threat Modeling Framework: MAESTRO',
      venue: 'Cloud Security Alliance, 2025', url: 'https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro' },
    { authors: 'Simon Willison', title: 'The lethal trifecta for AI agents', venue: 'simonwillison.net, 2025',
      url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/' },
  ],
};

/* ============================================================ P2 ======== */
const P2 = {
  body: `
${p(`现在轮到你亲手把攻击打进去。本项目要搭一个故意留着漏洞的智能体，并把第二部分那四种端到端攻击
全部在它身上打通。你在这里搭的智能体，项目 3、4、5 还要接着用，所以要按能长期用的标准来搭。`)}

${callout('warn', '交战规则', `<p style="margin-bottom:0">这里的一切都跑在你自己的实验智能体上，
离线运行，用的是 <code>agentlib.py</code> 里那套内存态的假工具。不要把这些攻击指向任何你并不拥有、
也没有书面授权测试的系统。反正真正有意思的部分，是你在项目 4 里造出来的防御。</p>`)}

${h2('第 1 步：把这个有漏洞的智能体搭出来', 'build')}
${p(`从课程库开始。一个最小的靶子需要一个网页工具、一个邮件工具和一个文件工具，全部以同一个身份运行，
不加任何限制：`)}
${code(`import agentlib as A
from agentlib import Agent, make_tools

agent = Agent(tools=make_tools("http_get", "send_email", "read_file", "write_file"))
answer, ctx = agent.run("Summarise https://blog.example/post")`, { lang: 'py', file: 'lab.py' })}
${deliverable(['一个跑得起来的实验智能体，至少带网页、邮件、文件三个工具，外加一份由你控制的“网页”固定内容。'])}

${h2('第 2 步：把四种攻击都打通', 'attacks')}
${p(`每种攻击各写一个能用的利用脚本，每个脚本自己断言自己成功了：`)}
${steps([
  ['直接覆盖（<a href="/zh/chapters/a06/">A06</a>）', `先把系统 prompt 抽出来，再把原任务覆盖掉。
    然后证明：你加的那个关键词过滤器，换个说法就绕过去了。`],
  ['间接注入（<a href="/zh/chapters/a07/">A07</a>）', `在固定网页里埋下载荷，让智能体去读一个秘密，
    再把它用邮件发出去。用户可只要了一份摘要。`],
  ['环境注入（<a href="/zh/chapters/a08/">A08</a>）', `把载荷投放到人类审查者看不见的地方：
    HTML 注释、白底白字，或者图片的 alt 文本。`],
  ['数据外泄（<a href="/zh/chapters/a09/">A09</a>）', `用两条不同的通道把秘密弄出去，其中至少一条
    不是直接调用 <code>send_email</code>。可以用 markdown 图片 URL，或者一个形如 DNS 查询的主机名。`],
])}
${deliverable(['四个脚本，一种攻击一个，每个都以“攻击已成功”的断言收尾。'])}

${h2('第 3 步：做变体并度量', 'measure')}
${p(`针对间接注入，写五个载荷变体（注释、伪系统消息、白底白字、善意包装，再加一个你自己想的），
记录哪些成功了。你在这里攒的正是项目 5 里用来评估防御的那套攻击集，所以要用结构化的形式存下来。`)}

${h2('第 4 步：写成报告', 'writeup')}
${p(`一份简短报告：对每种攻击写清载荷、投递向量、通道，以及唯一那个能限制住它的控制类别。
这就是你项目 4 的规格说明。`)}

${check([
  '四种攻击都在你的实验智能体上端到端打通，每一个都有断言验证。',
  '你已经证明了输入关键词过滤器换个说法就会失效。',
  '你用过的数据外泄通道里，至少有一条不是直接的工具调用。',
  '你的报告为每一种攻击都点名了能限制住它的控制类别。',
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
${p(`第三部分攻击的是智能体所依赖的那些组件。本项目要在你的实验智能体上复现这些攻击，然后做更难的
那一半：把本可以逮住每一种攻击的扫描器或控制造出来。`)}

${h2('第 1 步：一个恶意的 MCP 式工具', 'tool')}
${p(`写一个工具，让它的<em>描述</em>里带上抢跑（line jumping）载荷（<a href="/zh/chapters/a11/">A11</a>）。
打开 <code>agentlib.SCAN_SYSTEM</code>，让描述能进到模型里，然后展示：工具还一次都没被调用，
智能体就已经照着描述行动了。接着把本可以标记出它的清单扫描器和哈希锁定检查写出来。`)}
${deliverable(['一个在列举工具时就触发的投毒工具，外加一个扫描器和一项指纹检查，两者都能逮住它。'])}

${h2('第 2 步：一次持久化的记忆攻击', 'memory')}
${p(`给一个小的 RAG 语料投毒，让一篇精心构造的文档在排序上压过真正的答案
（<a href="/zh/chapters/a12/">A12</a>），并展示它在多个模拟用户会话中反复触发。然后造出溯源过滤器，
挡住一条源自工具返回的记忆条目变成用户偏好。`)}
${deliverable(['一个能跨会话触发的语料投毒演示，外加一个能让它失效的溯源过滤器。'])}

${h2('第 3 步：一个被投毒的技能', 'skill')}
${p(`写一份技能清单，把一条数据外泄指令伪装成再普通不过的业务需求（<a href="/zh/chapters/a13/">A13</a>）。
把它丢进你在第三部分写的扫描器。然后去找那种即使扫描器漏掉也照样成立的控制：对技能声明的工具做
能力范围限定，让载荷在工具层就失败。`)}

${h2('第 4 步：在两个智能体之间传播', 'multi')}
${p(`把两个实验智能体连起来，打通一个 prompt 感染载荷：它指示第一个智能体把自己转发给第二个
（<a href="/zh/chapters/a15/">A15</a>）。加上智能体之间的消息隔离，展示传播停在零号病人。`)}
${deliverable(['一个双智能体传播演示，外加一项能把传播摁住的隔离控制。'])}

${h2('第 5 步：资源攻击', 'resource')}
${p(`可选，但建议做：把 <a href="/zh/chapters/a16/">A16</a> 里的递归循环攻击或 MCP 放大攻击造出来，
连同能刹住它的预算强制器，并报告每一级预算作用域触发得有多晚。`)}

${check([
  '你已经复现了工具投毒、记忆投毒、被投毒的技能，以及多智能体传播。',
  '对每一种攻击，你都造出了能逮住它或限制住它的控制。',
  '对每一项控制，你都说得出它是抬高成本还是限制损害。',
  '你的记忆控制和隔离控制由代码强制执行，而不是靠拜托模型配合。',
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
${p(`这是最要紧的一个项目。你要把在项目 2 和项目 3 里逢攻必破的那个实验智能体，重建到一套防御栈后面，
再把每一种攻击重跑一遍，并为每一个结果给出交代。目标不是“攻击成功率 0%”，而是造出一个你
<em>说得出为什么</em>每种攻击都会失败的系统，而且每条理由都是一个性质，不是一个概率。`)}

${h2('这套防御栈', 'stack')}
${p(`五层，从 <a href="/zh/chapters/a18/">A18</a> 一直到 <a href="/zh/chapters/a24/">A24</a>。
按这个顺序造，因为每一层都能让你减少对前一层的依赖：`)}
${steps([
  ['聚光标记（<a href="/zh/chapters/a18/">A18</a>）', `给每一段不可信内容打上数据标记，哨兵串按请求
    随机生成。便宜，而且能把伪造围栏那类攻击消掉。在报告里注明：这是一个抬高成本的层。`],
  ['带能力标签的数据层（<a href="/zh/chapters/a21/">A21</a>）', `给每一个值打上溯源标签，在每一个
    数据汇点强制执行读取策略。正是这一层让注入<em>不再重要</em>。把那一章的 <code>Tagged</code>
    类移植过来。`],
  ['范围受限的凭据（<a href="/zh/chapters/a22/">A22</a>）', `签发一个任务 token，用最小的权限范围、
    最小的资源集合，以及能跑通的最短 TTL。做摘要这个任务的能力集合里，压根就不该有邮件工具。`],
  ['出站允许清单（<a href="/zh/chapters/a23/">A23</a>）', `正确地执行它（那一章的四项检查），
    并且放在智能体下面，而不是智能体里面。它负责关掉能力层没关掉的那些数据外泄通道。`],
  ['按可逆性分级的审批门（<a href="/zh/chapters/a24/">A24</a>）', `对剩下的那些不可逆操作，弹出一个
    确认框，展示数据、收件人和溯源信息，并给出“终止整个任务”这个选项。`],
])}
${deliverable(['一个五层齐备的加固实验智能体，每一层都能单独开关，好让你度量它各自的贡献。'])}

${h2('把一切重跑一遍', 'rerun')}
${p(`项目 2 和项目 3 里的每一种攻击，都对着加固后的智能体再打一次。每一次都记录：模型有没有被攻陷？
攻击有没有真的达成什么？是哪一层拦下来的？攻陷和损害要<em>分开</em>报告。被限制住的攻陷仍然值得知道
（<a href="/zh/chapters/a07/">A07</a>）。`)}
${deliverable(['一张结果表：攻击 ×（是否攻陷？有无损害？被哪一层拦下），覆盖你造过的每一种攻击。'])}

${h2('做消融', 'ablate')}
${p(`逐层关掉，然后重跑。这会告诉你每一项防御实际上是靠哪一层扛住的，结果会让你意外。有些攻击被三层
同时挡住，有些恰好只被一层挡住。要担心的是那些只有单点防线的。`)}

${h2('说实话的那一节', 'honesty')}
${p(`把你这套防御栈<em>挡不住</em>的东西写下来：人这条通道、模型层面的威胁、任务本身的合法能力所能
促成的一切，以及任何你还没想到要造出来的攻击。有没有这一节，是一份防御评审真不真诚的标志。`)}

${check([
  '项目 2 和项目 3 的每一种攻击，在加固后的智能体上都失败了。',
  '对每一种攻击，你都点得出是哪一层拦下的，以及那一层是限制损害还是仅仅抬高成本。',
  '你的消融实验找出了防御栈里所有存在单点防线的攻击。',
  '你已经如实写下了这套防御栈保护不了的东西。',
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
${p(`你已经有了一个加固过的智能体。本项目要产出它确实管用的证据：一套评测框架、一次冲着你自己防御去的
自适应红队演练、运行时遥测，以及它终究还是失手时用的应急手册。`)}

${h2('第 1 步：评测框架', 'harness')}
${p(`在你的实验智能体上搭一套 AgentDojo 形态的用例集（<a href="/zh/chapters/a25/">A25</a>）：
每个用例都带一项效用检查和一项攻击检查，每次运行都同时报告攻击成功率<em>和</em>效用留存率。
至少放进一个会被过度偏执的策略搞坏的良性任务，好让你的效用数字有变动的余地。`)}
${deliverable(['一套一条命令就能跑完的评测框架，在一份写明了的用例清单上报告这对配对指标。'])}

${h2('第 2 步：自适应红队演练', 'adaptive')}
${p(`这是难的部分（<a href="/zh/chapters/a19/">A19</a>）。给自己对自家防御的白盒访问权（反正就是你
写的），再给自己一个固定预算。然后迭代：看结果、改载荷、再跑一遍。把攻击成功率记录成投入的函数，
报告数字时把预算一起写上。`)}
${callout('warn', '你该预期到的结论', `<p style="margin-bottom:0">你的聚光标记层和任何分类器层，
都会栽在自适应载荷手里。而你的能力层、出站层和可逆性层不该栽，因为它们根本不读载荷。如果某个自适应
攻击打穿了这三层里的任何一层，那你就找到了一个真正的 bug，把它写下来，这是整个项目最有价值的产出。</p>`)}

${h2('第 3 步：运行时遥测', 'telemetry')}
${p(`把轨迹日志上线，带上 <a href="/zh/chapters/a26/">A26</a> 里的四个字段：因果关系、溯源、哈希链，
以及策略拒绝记录。再加一个结构性漂移检测器和一个聚合信号（一个罕见目的地计数器就能把慢速通道关掉）。
展示日志逮住了一次静态用例集漏掉的攻击。`)}
${deliverable(['一条记录完整、带哈希链的轨迹日志，配上一个能用的漂移检测器和一个聚合信号。'])}

${h2('第 4 步：应急手册', 'runbook')}
${p(`把 <a href="/zh/chapters/a27/">A27</a> 里的事件响应预案落到你自己的智能体上：检测信号、遏制步骤
（要撤销的是智能体的 token，不是用户的）、按溯源清除记忆的步骤，以及“定位被投毒的源头”那一步。
然后拿你用例集里的一次真实攻击，实地演练一遍。`)}

${h2('第 5 步：报告', 'report')}
${p(`把这些串到一起：配对指标、带预算的自适应结果、项目 4 的消融矩阵，以及那份如实写下的“未覆盖”。
这是一份你可以直接递给决定要不要上线这个智能体的人的文档，而这正是第六部分的全部意义。`)}

${check([
  '你的评测框架在同一次运行里同时报告攻击成功率和效用留存率。',
  '你有一份带明确攻击者预算的自适应结果。',
  '你的遥测至少逮到了一次静态用例集逮不到的攻击。',
  '你已经把应急手册端到端演练过一次，而且它奏效了。',
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
