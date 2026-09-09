/* 简体中文语区的页面文案。

   site/lib/pages.mjs 是所有语言共用的一套模板：它持有 HTML 结构、各种 id、
   data- 属性和示意图，所有给人读的文字都从这个文案包里取。翻译就是把这个文件
   复制到 site/content/<code>/pagecopy.mjs 并保持同样的键。

   取值按它们出现的页面分组。需要填入数字、或链接地址随语区而变的取值是函数；
   URL 由外部按语区加好前缀后传进来，译者永远不用自己写路径。取值内部的换行
   就是渲染后的 HTML 今天所具有的换行。 */

export const COPY = {
  /* ============================================================= home ==== */
  home: {
    eyebrow: (n, lines, events) =>
      `${n} 章 · ${lines} 行可运行的 Python · ${events} 个节点的时间线 · 不需要 GPU，不需要 API key`,
    h1: `从零开始<br>学习智能体安全。`,
    lede1: `给语言模型装上工具，就把一个内容安全问题变成了一个系统安全问题。模型读一个网页时，
  分不清网页上的文字和你的指令，而它读的时候手里正握着你的凭据。本课程从这一个事实出发，一路
  向外推：由它衍生出的每一种攻击、针对它提出过的每一种防御，以及这些防御里哪些能在攻击者明知
  其存在的情况下依然站得住。`,
    lede2: `每一章都给你一张机制图、一个可以在浏览器里亲手攻破的实验、一个真刀真枪把攻击或防御
  跑一遍的自包含 Python 文件、六道评分题，以及这一章据以写成的那些论文，并署上写下它们的研究者
  的名字。`,
    btnStart: `从 A01 开始 →`,
    btnCurriculum: `查看课程大纲`,
    btnCapstone: `毕业项目`,

    heroFigT: `A01 · 一张图看完整门课。`,
    heroFigB: `第 2、3 部分的每一章攻击这四个编号点中的一个；第 4、5 部分的
   每一章防御其中一个。虚线是唯一真正重要的那条边界，而模型站在它错误的那一侧。`,

    claimsH2: `本课程要论证的三个判断`,
    claim1t: `提示注入不是一个 bug。`,
    claim1b: `它是一个没有权限隔离的系统被赋予权限之后的必然结果。没有补丁、没有过滤器、也没有哪个
  模型版本能把它关上。只有架构才能限定一次成功的注入能够触及多远。`,
    claim2t: `检测是缓解，不是控制。`,
    claim2b: `护栏挪动的是攻击者的成本。能力范围限定、信息流控制和出站策略挪动的是攻击者的天花板。
  你要清楚自己买的是哪一种。`,
    claim3t: `这里面大部分是普通的安全工程。`,
    claim3b: `最小权限、沙箱、供应链审查、出站控制、审计日志。AI 那部分很窄；系统那部分才是工作量，
  而它早就已经被研究透了。`,

    audienceH2: `这门课写给谁`,
    audienceP: `前置要求：你能读 Python，并且用过一次 AI 智能体。你不需要 GPU、不需要 API key、
不需要安全背景，也不需要任何机器学习理论。所有东西都跑在仓库自带的一个确定性桩模型上。`,
    aud1t: `你正要上线一个智能体`,
    aud1b: `第 1、4、5 部分给你一份威胁模型、一套你能向评审者交代得过去的防御栈，以及每一层诚实的
  边界。`,
    aud1link: `A20 · 设计模式 →`,
    aud2t: `你在保护别人的智能体`,
    aud2b: `第 2、3、6 部分是进攻方的课程，以及把它变成一份报告的那套评估框架。`,
    aud2link: `A25 · 红队演练 →`,
    aud3t: `你在读文献`,
    aud3b: `每一章都以一份完整的参考文献收尾，站内还按所应对的威胁索引了 180 余篇论文和报告。`,
    aud3link: `全部参考文献 →`,
    aud4t: `你靠拆东西来学`,
    aud4b: `二十七个浏览器内实验、五个项目和一个毕业项目。先自己把攻击打成功，再看着同一个攻击在
  修复面前失手。`,
    aud4link: `全部项目 →`,

    currH2: `课程大纲`,
    currP: `六个部分。第一遍请按顺序读。正是这个顺序，把一份攻击清单变成一种思考智能体架构的方式。
每个部分以一个项目收尾，六个部分则以一个用上全部内容的毕业项目收尾。`,
    part: (id) => `第 ${id} 部分`,
    chLines: (n) => `${n} 行`,
    finalProject: `毕业项目`,

    formatH2: `每一章都有`,
    fmt1t: `一张机制图`,
    fmt1b: `跟着字节走完整个系统，看清攻击者的文本从哪里进来，数据又从哪里出去。`,
    fmt2t: `一个页内实验`,
    fmt2b: `输入一段载荷，拖动一个阈值，看防御是守住还是失守。不用装东西，不用密钥，不用联网。`,
    fmt3t: `一个能跑的文件`,
    fmt3b: `自包含的 Python，只用标准库，对正文里给出的说法逐条做断言。两秒之内跑完。`,
    fmt4t: `署名的参考文献`,
    fmt4b: `六道评分题，然后是这一章完整的书目，每一位作者都列出名字。`,

    startH2: `从信任边界开始。`,
    startP: `A01 是四十行 Python，外加一个关于这四十行把你的凭据放在了什么位置的、不太舒服的观察。
其余的一切都由它推出来。`,
    startBtn: `A01 · 智能体循环 →`,
  },

  /* ======================================================= curriculum ==== */
  curriculum: {
    title: `课程大纲`,
    description: (n) =>
      `《从零开始学习智能体安全》的全部 ${n} 章，分为六个部分，含五个项目和一个毕业项目。`,
    kicker: `完整路径`,
    h1: `课程大纲`,
    sub: (n) => `${n} 章，六个部分，五个项目和一个毕业项目。
顺序是这样排的：每个部分制造出下一个部分要解决的问题。`,
    metaLines: `行课程代码`,
    metaLabs: `个浏览器内实验`,
    metaQuestions: `道评分题`,
    searchPlaceholder: `筛选章节。试试“注入”“记忆”“沙箱”“身份”……`,
    part: (id) => `第 ${id} 部分`,
    chLines: (n) => `${n} 行`,
    finalProject: `毕业项目`,
  },

  /* ========================================================= projects ==== */
  projects: {
    title: `项目`,
    description: `智能体安全课程的五个评分项目和一个毕业项目。`,
    kicker: `自己动手做`,
    h1: `项目`,
    sub: `读懂提示注入，和真的把一次注入打成功，是两种不同的能力。
课程的每个部分都以一次动手构建收尾，六次构建最后拼成毕业项目。`,
    afterPart: (id, title) => `第 ${id} 部分之后 · ${title}`,
    finalProject: `毕业项目`,
    flowH2: `这些项目如何拼在一起`,
    flowFigT: `一个智能体，六轮打磨。`,
    flowFigB: `项目 2 造出那个你在余下课程里一直沿用的脆弱智能体。P3 攻击它的
依赖，P4 把它重建在一套防御栈之后，P5 度量结果，毕业项目再把整套东西连同一个评估框架一起打包。`,
    prereq: `前置要求：`,
  },

  /* ========================================================= capstone ==== */
  capstone: {
    finalTag: `毕业`,
    usesEvery: `用上每一章`,
    prereq: `前置要求：`,
    and: `和`,
  },

  /* ========================================================== threats ==== */
  threats: {
    title: `威胁地图`,
    description: `LLM 智能体的六个威胁面和二十五类漏洞，每一类都链接到讲它的那一章。`,
    kicker: `参考资料`,
    h1: `威胁地图`,
    sub: `六个面，二十五类。这个结构沿用 Grimes 等人在卡内基梅隆大学
软件工程研究所所做的系统性综述，该综述在 173 份学术与业界资料中对威胁做了归类；每一类下的
注释和章节链接则是本课程自己的。`,
    searchPlaceholder: `按“注入”“记忆”“DoS”“后门”筛选威胁……`,
    cols: [`漏洞类别`, `攻击者做什么`, `章节`],
    bridge: (defenses) => `这里的每一个面，在<a href="${defenses}">防御地图</a>上都有一页与之相对。`,
  },

  /* ========================================================= defenses ==== */
  defenses: {
    title: `防御地图`,
    description: `一套覆盖设计、开发与运营三个阶段的三十三类智能体安全控制措施分类。`,
    kicker: `参考资料`,
    h1: `防御地图`,
    sub: `三十三类控制措施，分布在生命周期的三个阶段，沿用 SEI 系统性综述
里的最佳实践分类法。<b>强度</b>一列是本课程的判断：面对一个有动机的攻击者，每项控制实际上
能给你买到什么。`,
    searchPlaceholder: `按“沙箱”“身份”“日志”筛选控制措施……`,
    cols: [`控制措施`, `它做什么`, `强度`, `章节`],
    pillBound: `限定损害`,
    pillRaise: `抬高成本`,
    pillSupport: `起支撑作用`,
    calloutTitle: `如何读“强度”这一列`,
    calloutBody: `<b>限定损害</b>意味着攻击者即使拿下了模型，
也仍然够不到那份资产，因为这个性质是由构造保证的。<b>抬高成本</b>意味着攻击者需要一个更好的
载荷；天花板没有动。<b>起支撑作用</b>意味着这项控制自己拦不住任何东西，但让其他控制变得可用。
一摞“抬高成本”的控制替代不了一项“限定损害”的控制，而大多数生产环境事故，恰恰发生在相信可以
替代的团队身上。`,
  },

  /* ========================================================= glossary ==== */
  glossary: {
    title: `术语表`,
    description: `本课程中用到的智能体安全术语释义。`,
    kicker: `参考资料`,
    h1: `术语表`,
    sub: (n) => `${n} 条术语，每一条都链接到讲它的那一章。
凡是这个领域自己用法不一致的词，释义里都会讲明。`,
    searchPlaceholder: `筛选术语……`,
    cols: [`术语`, `释义`, `章`],
    groups: {
      core: `核心概念`,
      framework: `框架`,
      attack: `攻击`,
      defense: `防御`,
      eval: `评估`,
      ops: `运营`,
    },
  },

  /* ========================================================= timeline ==== */
  timeline: {
    title: `时间线`,
    description: `智能体安全的编年时间线：2022 至 2026 年的攻击、防御、事故、标准与基准测试。`,
    kicker: `参考资料`,
    h1: `时间线`,
    sub: (n) => `${n} 个节点，从 2022 到 2026 年。自上而下读一遍，有一个
规律格外扎眼：攻击先到，并且会泛化；防御后到，并且趋于专用；而从一项防御发表，到一次能击穿
它的自适应攻击出现，间隔是以月来计的。`,
    searchPlaceholder: `筛选事件……`,
    cols: [`日期`, `类型`, `事件`, `章`],
  },

  /* ======================================================= references ==== */
  references: {
    title: `参考文献`,
    description: `智能体安全课程的完整书目，逐一署名每一位作者。`,
    kicker: `致谢`,
    h1: `参考文献`,
    sub: (n, chapters) => `${chapters} 章中共引用了 ${n} 种不同的资料。
本课程是一次综合；工作是他们的。`,
    calloutTitle: `关于署名`,
    calloutP1: `本课程里的每一个论断，都能追溯到别人写下的一篇论文、一次
漏洞披露，或一份生产实践指南。每一章末尾都有自己的参考文献；本页是它们的并集，按第一作者排序。
若某篇论文有项目主页，链接就指向那里而不是 arXiv，因为该往上面放什么是作者自己选的。`,
    calloutP2: (sources) => `课程大纲尤其是从这四个合集里搭起来的；如果学完这门课之后你只再读
一样东西，就从它们里面挑：
<a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">Awesome-Agent-Security</a>（UCSB
MLSec：Zhun Wang, Kaijie Zhu, Yuzhou Nie, Tianneng Shi, Juhee Kim, Zeyi Liao, Ruizhe Jiang, Wenbo Guo）、
<a href="https://github.com/LLMSecurity/awesome-agent-skills-security">Awesome Agent Skills Security</a>、
<a href="https://github.com/VoltAgent/awesome-ai-agent-papers">Awesome AI Agent Papers</a>（VoltAgent），
以及 Grimes 等人所做的 SEI 系统化工作。详情见<a href="${sources}">来源页</a>。`,
    searchPlaceholder: (n) => `在 ${n} 条参考文献中按作者、标题或发表处搜索……`,
  },

  /* ========================================================== sources ==== */
  sources: {
    title: `来源合集`,
    description: `本课程据以搭建起来的精选清单与论文。`,
    kicker: `致谢`,
    h1: `来源合集`,
    sub: `这门课综合的是哪些东西，以及其中每一部分由谁在
维护。`,
    intro: `本课程不含原创的安全研究。它是一条穿过四组工作、以及它们各自指向的那些原始论文的教学
路径。凡是某一章给出一个数字（一个攻击成功率、一项市场研究、一个案例研究的数量），那个数字都
属于被引用的那篇论文，而且该章会说明是哪一篇。`,
    collectionsH2: `这四个合集`,

    ucsbH3: `Awesome-Agent-Security (UCSB MLSec)`,
    ucsbP1: `一份结构化的智能体安全研究分类，按智能体系统与基准测试、红队演练、蓝队防守来组织，
其中蓝队那一支又分为模型层的防御和系统层的运行时防御。它的结构是这个领域目前最接近一张共享
地图的东西，本课程第 2 到第 5 部分紧跟着它走，尤其是作用于模型的防御与作用于模型周边系统的
防御这一分野。`,
    ucsbP2: `由 Zhun Wang、Kaijie Zhu、Yuzhou Nie、Tianneng Shi、Juhee Kim、Zeyi Liao、Ruizhe Jiang
和 Wenbo Guo 维护。<a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">github.com/ucsb-mlsec/Awesome-Agent-Security</a>`,

    skillsH3: `Awesome Agent Skills Security (LLMSecurity)`,
    skillsP: `聚焦于本课程在 A11 和 A13 里覆盖的那一层：工具使用、智能体技能、市场，以及围绕它们
的供应链。它收录了威胁框架与标准那一节（OWASP ASI、MITRE ATLAS、NIST AI RMF、IETF 的智能体
身份认证草案），也收录了让 A13 这一章得以成立的那些市场实证研究。
<a href="https://github.com/LLMSecurity/awesome-agent-skills-security">github.com/LLMSecurity/awesome-agent-skills-security</a>`,

    voltH3: `Awesome AI Agent Papers (VoltAgent)`,
    voltP: `一个持续更新的智能体论文源，其中 AI Agent Security 一节有 82 条，覆盖 2026 年的工作：
智能体支付协议、GraphRAG 抽取、MCP 规范分析、技能市场研究，以及当前这一代运行时控制平面。
第 3 和第 5 部分里最新的材料就来自这里。
<a href="https://github.com/VoltAgent/awesome-ai-agent-papers">github.com/VoltAgent/awesome-ai-agent-papers</a>`,

    sokH3: `SoK: Bridging Research and Practice in LLM Agent Security`,
    sokP1: `Keltin Grimes、Julie Lawler、Robert C. Garrett、Emil Mathew、Marco Christiani、Sara Kingsley、
Zhiwei Steven Wu 和 Nathan VanHoudnos，卡内基梅隆大学软件工程研究所，2025 年 11 月。一项系统性
综述，覆盖 64 项学术研究、109 份业界资料和 36 个真实世界的案例研究，产出了一套六个面的威胁
分类、一套三十三类的最佳实践分类，以及一份关于已部署系统实际用了哪些实践的度量。`,
    sokP2: (threats, defenses) => `<a href="${threats}">威胁地图</a>和
<a href="${defenses}">防御地图</a>的骨架由这篇论文提供；而它发现案例研究只实现了推荐控制措施
中大约三分之一，正是第 6 部分存在的理由。
<a href="https://doi.org/10.1184/R1/30610928">doi:10.1184/R1/30610928</a>`,

    crowdstrikeH3: `Securing AI Where It Executes (CrowdStrike)`,
    crowdstrikeP: `一份业界白皮书，主张对桌面智能体和编码智能体来说，端点就是执行点，因为智能体
发起的进程执行、文件修改和网络活动实际上都发生在那里。A26 一章借用了它关于运行时遥测的框架，
以及如何把智能体的动作和人类操作者的动作区分开这个实际难题；文中与厂商产品相关的说法属于发布
方，本课程不把它们作为教学材料转述。`,

    primaryH2: `其余的一切`,
    primaryP: (n, references) => `各章中直接引用的一手资料大约有 ${n} 份：论文、CVE、厂商披露、
标准草案，还有发现这些漏洞的研究者写的博客。它们按作者排序，完整列在
<a href="${references}">参考文献页</a>上，并在用到它们的每一章末尾再列一次。`,

    correctionsTitle: `勘误`,
    correctionsBody: (issues) => `如果本课程错述了你的工作、把它张冠李戴，
或者引用了已被取代的版本，请<a href="${issues}">提一个 issue</a>。署名和准确正是这些参考文献
列表存在的意义；把它们弄错，和代码坏掉是同一级别的 bug。`,
  },

  /* ============================================================ setup ==== */
  setup: {
    title: `本地环境`,
    description: `如何在本地运行课程代码。Python 3.9+，只用标准库。`,
    kicker: `参考资料`,
    h1: `本地环境`,
    sub: `Python 3.9 或更新版本。不装包，不用 API key，不用 GPU，不联网。`,
    intro: `每一章在 <code>code/</code> 下都有一个自包含的文件。每个文件只靠标准库运行，两秒之内
跑完，并以断言收尾，验证这一章正文里给出的说法。文件跑干净了，就说明这一章的说法在你的机器上
成立。`,

    noModelH2: `为什么这里没有模型调用`,
    noModelP1: `课程在 <code>code/agentlib.py</code> 里自带一个确定性的桩模型：一个由规则驱动的
小函数，它在所有对安全重要的方面都表现得像一个会听指令的 LLM。它会照着自己能找到的最后一句
祈使句去做，而不管这句话来自上下文的哪一部分。`,
    noModelP2: `这当然是对真实模型的一幅漫画，而且是故意画成这样的。真实模型是随机的，一个二十次
里成功十九次的攻击会让课上得很糊涂；而让课程跑在付费 API 上，则意味着学习本身要花钱。这个桩
模型让课程里的每一次攻击都可复现、免费、离线。它同时也诚实地把核心论点摆了出来：这个漏洞是
架构性的，模型再怎么变强也消不掉它，因为它长在上下文的形状里，而不是推理的质量里。`,
    liveTitle: `对着真实模型运行`,
    liveBody: (a19) => `每个文件都接受一个可选的
<code>--live</code> 参数。设置 <code>ANTHROPIC_API_KEY</code> 或 <code>OPENAI_API_KEY</code>
并装上对应的 SDK，<code>agentlib.py</code> 就会改走它，而不再走桩模型。
预期是攻击成功得没那么稳定，而防御的表现照旧，这本身就是 <a href="${a19}">A19</a> 的教训。`,

    safetyH2: `安全须知`,
    safetyP1: `本仓库里的东西除了攻击它自己，不攻击任何别的东西。工具实现都是内存里的假货：
“网页抓取”从一个固定字典里读，“发邮件”往一个列表里追加，“shell”把命令记成一个字符串并拒绝
执行它。数据外泄那几章会搭一个把内容打到标准输出的接收端。你可以在办公笔记本上断网跑完每一
个文件。`,
    safetyP2: `项目会要求你构造攻击载荷。请对着你自己的实验智能体去构造。把它们打到一个你并不
拥有、也没有书面授权测试的系统上，在大多数司法辖区里是犯罪。而且这个练习里真正教给你东西的
部分，是你事后写的那个防御。`,

    siteH2: `构建站点`,
    siteP: `没有依赖，Node 18 或更新版本。各章以普通 ES 模块的形式放在
<code>site/content/chapters/*.mjs</code>，导出 <code>meta</code>、<code>body</code>、
<code>quiz</code> 和 <code>refs</code>。`,
  },

  /* 示意图标签。它们放在固定宽度的 SVG 框里，所以译文长度必须和英文差不多，
     否则会撑破框。 */
  diagrams: {
    hero: {
      aria: '一次智能体回合，以及其中四个被攻破的位置',
      title: '一次智能体回合，以及它出问题的四个地方',
      task: ['用户任务', '“帮我订机票”'],
      context: ['上下文', 'prompt + 历史'],
      model: ['模型', '规划下一步动作'],
      toolCall: ['工具调用', '真的会执行'],
      world: ['外部世界', '网页 · 文件 · API'],
      result: ['工具返回被追加进上下文', '不可信的字节，同一条 token 流'],
      loop: '循环',
      boundary: '信任边界',
      n1: ['① 攻击者文本从这里进入', '并被当成意图读取'],
      n2: ['② 模型无法', '把两者区分开'],
      n3: ['③ 工具带着你的', '凭据运行'],
      n4: ['④ 结果随一次出站', '调用离开'],
    },
    flow: {
      title: '同一个智能体，贯穿全部六个部分',
      p1: '威胁模型', p2: '注入实验', p3: '供应链',
      p4: '加固它', p5: '度量 + 运行',
      capstone: ['毕业项目', 'Sentinel'],
      s1: '哪里会出错', s2: '让它真的出错',
      s3: '拦住它，再证明', s4: '全部串起来',
    },
  },
};
