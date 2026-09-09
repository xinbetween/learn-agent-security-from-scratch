import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 16, attacks: '就假定它已经失守了' };
export const scripts = ['/assets/js/sims/zh/a23.js'];

const layers = svg(720, 300, `
${svgText(12, 18, '策略放在哪一层，决定了它算不算策略', 'd-ttl', 'start')}
${box(40, 46, 400, 34, '智能体里的一个函数', '智能体跑的任何代码都能绕过', 'd-attack')}
${box(40, 88, 400, 34, 'HTTP 客户端包装层', '换一个客户端就能绕过', 'd-attack')}
${box(40, 130, 400, 34, '出站代理', '守得住，除非智能体能绕开路由', 'd-def')}
${box(40, 172, 400, 34, 'pod 里的网络策略', '守得住', 'd-def')}
${box(40, 214, 400, 34, '防火墙 / 没有出网路由', '守得住', 'd-def')}
${svgText(470, 68, '智能体运行在', 'd-attack-t', 'start')}
${svgText(470, 84, '这一层', 'd-attack-t', 'start')}
${svgText(470, 180, '线以下的强制点', 'd-def-t', 'start')}
${svgText(470, 196, '智能体没法', 'd-def-t', 'start')}
${svgText(470, 212, '跟它讲道理', 'd-def-t', 'start')}
<line x1="30" y1="126" x2="690" y2="126" stroke="var(--border-strong)" stroke-dasharray="5 4"/>
${svgText(360, 282, '线以上的都是文档，线以下的才是控制。', 'd-def-t')}
`, { label: '从进程内到网络层的各个强制点' });

export const body = `
${p(`到目前为止，每一章都在试图预防点什么。这一章假定预防失败了：注入已经落地，模型已经敌对，剩下的
问题是影响范围有多大——而这是环境的性质，不是智能体的性质。`)}

${h2('一份真正写对的出站允许清单', 'egress')}

${p(`四道检查，按顺序来。每一道之所以存在，都是因为某个真实系统在那里出过错。`)}

${code(`def egress_ok(url: str, resolve) -> tuple:
    u = urlsplit(url)

    if u.scheme not in ("http", "https"):
        return False, f"scheme {u.scheme!r} not permitted"

    host = u.hostname or ""                    # 1. parse; never regex the string
    if not host:
        return False, "no host"

    if host not in ALLOWED_HOSTS:              # 2. equality, never substring
        return False, f"host {host!r} not on the allow-list"

    ip = resolve(host)                         # 3. resolve, then check the address
    if ip is not None:
        addr = ipaddress.ip_address(ip)
        for net in BLOCKED_NETS:               # 4. link-local, RFC1918, loopback
            if addr in net:
                return False, f"{host} resolves into blocked range {net}"

    return True, "ok"`, { lang: 'py', file: 'code/a23_sandbox.py', tag: 'safe', tagText: '已加固' })}

${sim({
  name: 'a23egress',
  title: '出站策略对上八个 URL',
  badge: '交互实验',
  controls: select('a23-impl', '实现方式', [
    ['substr', '在允许的主机名上做子串匹配'],
    ['regex', '对 URL 前缀做正则匹配'],
    ['parsed', '解析 URL，按相等比较 hostname'],
    ['full', '解析 + 检查 scheme + 解析出地址再检查'],
  ], 'substr'),
  body: out('a23-out'),
  note: `每一种实现都真的有人上过线。逐个走一遍，注意那些天真的版本会栽在什么样的输入上：攻击者只要
    拥有一个域名就能造出来，不需要任何特殊能力。`,
})}

${h2('在哪里强制，决定了它算不算一个控制', 'placement')}

${figure(layers, `<b>进程内的检查只是建议。</b>一个能跑代码的智能体（编码智能体、数据分析智能体，
任何带 shell 或解释器的东西）会自己开一个 socket，根本不会调用你的函数。虚线是智能体所在的层级；
强制点必须坐在它下面。`)}

${callout('warn', '最要紧的那道检查，恰恰是你没法用 Python 写的', `<p style="margin-bottom:0">如果
你的智能体会执行模型生成的代码，那么所有在同一个进程里实现的守卫都只是建议。攻击者跳不过去的是这些
版本：pod 里的网络策略、容器必须经过的出站代理，或者干脆没有通往互联网的路由。它们还顺带管住了
DNS，而一个 HTTP 客户端包装层管不了。</p>`)}

${h2('文件系统围堵', 'filesystem')}

${code(`def path_ok(path: str) -> tuple:
    real = os.path.normpath(os.path.join(WORKSPACE, path.lstrip("/")))
    if not real.startswith(WORKSPACE + os.sep) and real != WORKSPACE:
        return False, f"escapes the workspace: {real}"
    if any(p in real for p in DENY_PATTERNS):
        return False, "matches a deny pattern"
    return True, "ok"`, { lang: 'py', tag: 'safe', tagText: '已加固' })}

${p(`<em>先</em>归一化，再检查。直接检查原始字符串是那个经典的 bug：<code>sub/../../escape.txt</code>
没有 <code>..</code> 前缀，照样逃得出去。另外，只要拿得到，就优先用一条真正的边界（一个 bind mount，
或者一个只让工作区可见的容器），别用字符串比较，理由和上面一样。`)}

${h2('选择隔离级别', 'isolation')}

${table(
  ['级别', '边界', '搭建成本', '什么时候用'],
  [
    ['同进程', '没有', '几乎为零', '对不可信代码，永远不要。'],
    ['子进程 + 独立用户', '操作系统的用户隔离', '几分钟', '很弱。共享内核，也共享网络 namespace。'],
    ['容器', 'namespace + cgroups', '几分钟', '<b>默认选项。</b>丢掉 capability，rootfs 只读，不用宿主网络。'],
    ['gVisor / Kata', '系统调用拦截', '几小时', '当内核也在你的威胁模型里的时候。'],
    ['微虚拟机（Firecracker）', '硬件虚拟化', '几小时', '强隔离，启动约 125 ms，所以按任务开虚拟机是可行的。'],
    ['WASM', '设计上就是基于能力的', '几小时', '做工具非常合适；运行时和库的支持有限。'],
    ['独立机器', '物理隔离', '几天', '持有真实凭据的计算机操作型智能体。'],
  ]
)}

${p(`对一个计算机操作型智能体来说，沙箱不是众多控制中的一个，而是首要的那一个，因为它的动作空间
（<code>click</code>、<code>type</code>）根本不是策略的形状，这一点
<a href="/zh/chapters/a08/">A08</a> 已经讲过了。一个跑在一次性虚拟机里、用全新配置、没有任何环境
凭据的 CUA，和一个跑在你笔记本上的 CUA，属于两个风险类别，而这个差别就是全部的缓解措施。`)}

${h2('运行智能体代码的容器检查清单', 'checklist')}

${ul([
  `<b>不带任何环境凭据。</b>不挂载 <code>~/.aws</code>，不能访问实例元数据，不带任何这个任务用不上
   的、装着密钥的环境变量。`,
  `<b>屏蔽 link-local 网段。</b><code>169.254.169.254</code> 是云的元数据服务；碰到它就是凭据窃取，
   而不是数据外泄，值得给它一条单独的显式拒绝规则，好让这条告警一眼能读懂。`,
  `<b>根文件系统只读</b>，只留一个可写的工作区卷。`,
  `<b>丢掉全部 capability</b>，再按需要加回来，通常什么都不用加。`,
  `<b>不用宿主网络。</b>出站走一个强制执行允许清单的代理。`,
  `<b>给资源设上限</b>：CPU、内存、PID 数和磁盘，这同时也是你的
   <a href="/zh/chapters/a16/">A16</a> 控制。`,
  `<b>用完即弃。</b>每个任务销毁重建，让持久化攻击无处落脚。`,
])}

${h2('沙箱做不到什么', 'limits')}

${p(`它给一个被攻陷的智能体能够到的范围设了上界。它挡不住智能体产出一个错误的、或者被攻击者影响过的
<em>答案</em>，然后由人照着去做；如果任务本身的合法能力就是损害本身（一个被授权发邮件的智能体当然
能发邮件），它也帮不上忙；模型层面的任何问题它都不处理。围堵是地板，不是天花板。`)}

${h2('你现在应该能做到', 'checkpoint')}

${ul([
  `写一个能扛住后缀、userinfo、scheme 和 DNS 重绑定这几种花招的出站检查。`,
  `解释对一个会执行代码的智能体来说，进程内检查为什么只是建议。`,
  `为给定的智能体选一个隔离级别，并说清这份代价为什么值得。`,
  `列出沙箱防不住的东西。`,
])}
`;

export const quiz = [
  {
    q: `为什么 <code>https://api.internal.corp@evil.example/x</code> 能骗过子串检查？`,
    options: [
      `<code>@</code> 被 URL 编码了。`,
      `<code>@</code> 之前的一切都是 userinfo，真正的主机是 <code>evil.example</code>，但被允许的那串字符确实出现在 URL 里。`,
      `这个 URL 格式非法，解析器会拒绝它。`,
      `它用了一个非标准端口。`,
    ],
    answer: 1,
    explain: `子串匹配问的是"这段文本有没有出现在 URL 的某个地方"，而那不是要问的问题。RFC 3986 把
      凭据放在 <code>@</code> 之前，于是浏览器和 HTTP 客户端连的是 <code>evil.example</code>，你的
      检查却看到了被允许的主机名并放行。配套的花招是后缀形式，
      <code>api.internal.corp.evil.example</code>。两者任何拥有一个域名的人都能用，也都能靠解析
      URL、按相等比较 hostname 来堵上。`,
  },
  {
    q: `你的智能体能执行模型生成的 Python。你在自己的 HTTP 辅助函数里加了一道
        <code>egress_ok()</code> 检查。你得到了什么？`,
    options: [
      `一个能用的出站控制。`,
      `一份文档。生成的代码可以自己开 socket，或者 import 另一个 HTTP 库，压根不调用你的辅助函数。`,
      `除 DNS 之外一切都受保护。`,
      `一个只在模型不敌对时才管用的控制。`,
    ],
    answer: 1,
    explain: `进程内的检查只约束那些选择调用它的代码，而模型生成的代码不做这种承诺。这是智能体沙箱
      里最常见的一种虚假安全感。强制点必须坐在智能体运行的层级之下：pod 里的网络策略、容器被迫经过
      的代理，或者干脆没有路由。这些做法还顺带覆盖了 DNS 和裸 socket，而不只是你那个辅助函数的
      调用方。`,
  },
  {
    q: `<code>path_ok</code> 为什么先归一化路径再检查？`,
    options: [
      `为了处理 Windows 的路径分隔符。`,
      `因为 <code>sub/../../escape.txt</code> 没有开头的 <code>..</code>，却照样逃出了工作区；只有解析后的路径才暴露这一点。`,
      `为了提升性能。`,
      `因为符号链接需要归一化。`,
    ],
    answer: 1,
    explain: `检查原始字符串测的是输入长什么样，而不是它指向哪里。穿越序列可以埋在路径中间、可以做
      URL 编码，也可以由字符串拼接产生。先解析再测前缀才是正确的顺序。更好的做法（在你负担得起的
      时候）是一条真正的边界，比如一个 bind mount，或者一个压根看不见别的东西的容器，让这个问题
      根本轮不到字符串比较。符号链接是 <code>normpath</code> 单独解决不了的另一个真实问题。`,
  },
  {
    q: `<code>169.254.169.254</code> 并不在你的允许清单上，为什么还值得给它写一条显式拒绝规则？`,
    options: [
      `它是一个常见的笔误。`,
      `它是云实例的元数据服务，碰到它是凭据窃取而不是数据外泄，把它单独点名能让告警一眼读懂。`,
      `它会绕过 DNS 解析。`,
      `允许清单覆盖不了 IP 字面量。`,
    ],
    answer: 1,
    explain: `允许清单本来就已经拒绝它了，所以这条规则是为了清晰而不是为了覆盖：一条记成"拦截了对
      link-local 元数据的访问"的拒绝，告诉调查者的东西是笼统的"主机不被允许"给不了的。它还有另一层
      意义：DNS 重绑定可以把一个<em>被允许的</em>主机名指向那个地址，这正是解析后地址检查要作为
      hostname 检查之外的独立一步存在的原因。`,
  },
  {
    q: `对哪一类智能体来说，沙箱是<em>首要</em>控制，而不是众多层次中的一层？`,
    options: [
      `一个做 RAG 问答的智能体。`,
      `一个计算机操作型智能体，因为它的动作空间（click、type）不是策略的形状，能力策略很弱，剩下的就只有环境边界。`,
      `一个带五个类型化工具的工具调用智能体。`,
      `一个不带工具的摘要智能体。`,
    ],
    answer: 1,
    explain: `对工具调用智能体来说，动作空间是可枚举的，针对它写一份能力策略就是一个强控制（A22）。
      对 CUA 来说，动作空间是"一个坐在这台机器前的人能做的任何事"，而 <code>click(840, 210)</code>
      不带任何可供写策略的语义。剩下的只有这台机器的边界：一次性虚拟机、全新配置、没有环境凭据。
      这就是为什么 CUA 的部署决策，压倒性地取决于它跑在哪里。`,
  },
  {
    q: `一个智能体被完整地沙箱化了，还配了一份严格的出站允许清单。哪一类风险基本上没被触及？`,
    options: [
      `把本地密钥外泄到攻击者控制的主机。`,
      `智能体产出一个自信但错误、或者被攻击者影响过的答案，然后由人照着去做。`,
      `读取工作区之外的文件。`,
      `跑出无上限的算力开销。`,
    ],
    answer: 1,
    explain: `围堵限住的是能够到多远，不是对不对。一条注入指令改变的是智能体<em>说</em>了什么：一个
      错误的安全流程、一条看似合理实则虚假的结论、一句"建议你运行这条命令"，它通过人这个通道传出去，
      任何网络策略都看不见。算力开销由检查清单里的资源上限部分处理；人这个通道需要的是输出溯源，以及
      A24 里那套按可逆性设闸的做法。`,
  },
];

export const refs = [
  { authors: 'Yuhao Wu, Franziska Roesner, Tadayoshi Kohno, Ning Zhang, Umar Iqbal',
    title: 'SecGPT: An Execution Isolation Architecture for LLM-Based Systems', venue: 'NDSS, 2025',
    url: 'https://arxiv.org/abs/2403.04960' },
  { authors: 'Alexandru Agache, Marc Brooker, Alexandra Iordache, Anthony Liguori, Rolf Neugebauer, Phil Piwonka, Diana-Maria Popa',
    title: 'Firecracker: Lightweight Virtualization for Serverless Applications', venue: 'USENIX NSDI, 2020',
    url: 'https://www.usenix.org/conference/nsdi20/presentation/agache' },
  { authors: 'Authors of MCP-SandboxScan', title: 'MCP-SandboxScan: WASM-based Secure Execution and Runtime Analysis for MCP Tools',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.01241' },
  { authors: 'Tong Liu, Zizhuang Deng, Guozhu Meng, Yuekang Li, Kai Chen',
    title: 'Demystifying RCE Vulnerabilities in LLM-Integrated Apps', venue: 'ACM CCS, 2024',
    url: 'https://arxiv.org/abs/2309.02926' },
  { authors: 'JFrog Security Research', title: 'When Prompts Go Rogue: Analyzing a Prompt Injection Code Execution in Vanna.AI (CVE-2024-5565)',
    venue: 'JFrog, 2024',
    url: 'https://jfrog.com/blog/prompt-injection-attack-code-execution-in-vanna-ai-cve-2024-5565/' },
  { authors: 'Nicholas Tietz-Sokolsky', title: 'Impact of the remote-code execution vulnerability in LangChain',
    venue: 'ntietz.com, 2023', url: 'https://www.ntietz.com/blog/langchain-rce/' },
  { authors: 'Chuan Yan, Mark Huasong Meng, Liuhuo Wan, Tian Yang Ooi, Ruomai Ren, Guangdong Bai',
    title: 'ARTEMIS: Analyzing LLM Application Vulnerabilities in Practice', venue: 'ACM PACMPL, 2025',
    url: 'https://dl.acm.org/doi/10.1145/3720488' },
  { authors: 'Bytecode Alliance', title: 'WebAssembly System Interface: capability-based security',
    venue: 'WASI', url: 'https://wasi.dev/' },
  { authors: 'Google', title: 'gVisor: a container runtime sandbox', venue: 'Google', url: 'https://gvisor.dev/' },
  { authors: 'Manish Bhatt, Sahana Chennabasappa, Yue Li, Cyrus Nikolaidis, Daniel Song, Shengye Wan, Faizan Ahmad, Cornelius Aschermann, Yaohui Chen, Dhaval Kapil, David Molnar, Spencer Whitman, Joshua Saxe',
    title: 'CYBERSECEVAL 2: A Wide-Ranging Cybersecurity Evaluation Suite for Large Language Models',
    venue: 'Meta, arXiv 2024', url: 'https://arxiv.org/abs/2404.13161' },
];
