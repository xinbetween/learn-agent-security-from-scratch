import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 14, attacks: '已认证，但未获授权' };
export const scripts = ['/assets/js/sims/zh/a10.js'];

const deputy = svg(740, 300, `
${svgText(12, 18, '混淆代理：1988 与 2026', 'd-ttl', 'start')}

${svgText(180, 46, 'HARDY，1988', 'd-lbl')}
${box(30, 60, 110, 44, '用户', '没有权限', 'd-sunk')}
${box(180, 60, 130, 44, '编译器', '可写计费文件', 'd-trust')}
${box(180, 140, 130, 44, '计费文件', '', 'd-attack')}
${arrow(140, 82, 178, 82, '请求')}
${arrow(245, 104, 245, 138, '写入', 'd-attack-l')}
${svgText(180, 214, '没有东西被攻破。', 'd-sub')}
${svgText(180, 230, '编译器本来就有权限。', 'd-sub')}

<line x1="370" y1="40" x2="370" y2="270" stroke="var(--border-strong)" stroke-dasharray="4 4"/>

${svgText(560, 46, '你的智能体，2026', 'd-lbl')}
${box(400, 60, 120, 44, '网页', '谁都能写', 'd-attack')}
${box(560, 60, 140, 44, '智能体', '持有你的 token', 'd-trust')}
${box(560, 140, 140, 44, '你的邮箱', '', 'd-attack')}
${arrow(520, 82, 558, 82, '说')}
${arrow(630, 104, 630, 138, '发送', 'd-attack-l')}
${svgText(560, 214, '没有东西被攻破。', 'd-sub')}
${svgText(560, 230, '智能体本来就有权限。', 'd-sub')}
${svgText(560, 254, '每个请求都以你的身份完美签名。', 'd-attack-t')}
`, { label: '1988 年和今天的智能体身上同一个混淆代理问题' });

export const body = `
${p(`攻击者从来不需要偷走凭据，他们只需要把一个已经持有凭据的组件调过头来用。被劫持的智能体发出的每
一个请求都签名正确，能通过每一道身份认证检查，在你的审计日志里则显示为某个真实用户的合法活动。你的
身份体系里没有任何一环会报警，所以这类事故通常都是别人先发现的。`)}

${h2('1988 年那个问题，换个说法', 'hardy')}

${p(`Norm Hardy 的论文描述了一台共享大型机上的编译器，它有权限写自己的计费文件。一个用户请求编译器把
输出写到计费文件的路径上。编译器有这个权限，用户没有。编译器照办了。`)}

${figure(deputy, `<b>相隔三十八年，形状一模一样。</b>把“编译器”换成“智能体”，把“计费文件”换成
“你的邮箱”，把“一个用户请求”换成“一个网页说”。2026 年的新鲜之处不在于这个漏洞类别本身，而在于这
个代理如今会接受任何能把文本塞进它上下文的人用英文下达的指令。`)}

${h2('你的认证体系里没有的那个字段', 'provenance')}

${p(`下面是每个系统都实现了的那个检查，和几乎没人实现的那个检查：`)}

${code(`@dataclass
class Request:
    action: str
    args: dict
    authenticated_as: str    # whose credential signed it
    requested_by: str        # who actually CAUSED it   <-- this field does not exist

def authn_only(r):
    return True, f"signed by {r.authenticated_as}"

def authz_with_provenance(r):
    if r.requested_by != r.authenticated_as:
        return False, (f"caused by '{r.requested_by}' but signed as "
                       f"'{r.authenticated_as}' — provenance mismatch")
    return True, "causer and signer agree"`,
  { lang: 'py', file: 'code/a10_confused_deputy.py' })}

${sim({
  name: 'a10deputy',
  title: '同一批请求，两种检查',
  badge: '交互实验',
  controls: select('a10-check', '授权检查', [
    ['authn', '只做身份认证（你现在的做法）'],
    ['prov', '身份认证 + 因果溯源'],
    ['prov_scope', '溯源 + 按任务限定的能力范围'],
  ], 'authn'),
  body: out('a10-out'),
  note: `这份清单里的每个请求都经过了完美的身份认证。你的 IAM 日志会显示同一个用户在同一次会话里、
    相隔几秒钟做完了全部这些事。唯一能把合法请求区分出来的，是谁引发了它。而这不是任何标准认证栈
    携带的字段，所以 A21 必须把它构造出来，A22 必须把它传播下去。`,
})}

${h2('过度授权：量一量这个落差', 'excessive')}

${p(`OWASP 把它叫作 LLM06。它的成因不是粗心，而是摩擦。下面每一次授权当初都有它的理由：`)}

${table(
  ['集成对象', '任务真正需要的', 'token 实际授予的', '白送给注入的能力'],
  [
    ['Google Drive', '<code>drive.file</code>', '<code>drive</code>', '读取并删除账号里的每一个文件'],
    ['GitHub', '<code>repo:status</code>、<code>public_repo</code>', '<code>repo</code>、<code>workflow</code>、<code>admin:org</code>、<code>delete_repo</code>', '推送私有仓库、改 CI、删仓库'],
    ['Slack', '<code>channels:read</code>', '<code>channels:write</code>、<code>files:write</code>、<code>admin</code>', '以用户身份在任何频道发言、上传文件'],
    ['数据库', '<code>SELECT</code>', '<code>INSERT</code>、<code>UPDATE</code>、<code>DELETE</code>、<code>DROP</code>', '修改或摧毁生产数据'],
  ]
)}

${callout('note', '为什么认真的团队也会栽在这里', `<p style="margin-bottom:0">OAuth 授权页只给了一个
粗粒度的 scope，更细的根本不存在。某个 scope 在开发阶段用过一次，之后没人去掉。要收窄它就得给平台
团队提工单，而那个队列要排两周。过度授权是摩擦的产物，不是判断力的失误，所以修复它有一半是组织问题：
把窄路变成好走的路，并且按固定周期审计授权，而不是等到评审时才看。</p>`)}

${h2('没有攻击者的工具误用', 'no-attacker')}

${p(`这件事值得和注入分开谈，因为它需要另一套控制。SEI 的综述在内部威胁项下统计到 17 个来源提到了
工具误用：智能体因为误解了任务，用错误的、过宽的或者破坏性的参数调用了一个完全合法的工具。全程没有
对手参与。`)}

${ul([
  `<code>DELETE FROM users</code>，而 <code>WHERE</code> 子句被模型写错了。`,
  `因为分支名解析错了，对 <code>main</code> 执行了 <code>git push --force</code>。`,
  `一封发给邮件组的邮件，因为“团队”被解析成了错误的别名。`,
  `一次文件写入，路径展开的结果和预期不一样。`,
])}

${p(`注入防御在这里毫无用武之地。真正管用的，正是链条第 4 环上对付注入的那些东西：窄范围、带类型且
经过校验的参数、破坏性操作先试运行再确认，以及可逆性分级。这挺方便的，因为能约束攻击者的控制同样能
约束一次失误，而失误远比攻击常见。`)}

${h2('四条出路，按各自能买到什么排序', 'mitigations')}

${steps([
  ['收窄 scope', `用 <code>drive.file</code> 而不是 <code>drive</code>。能力本身没了，也就无从被
    误用。${pill('defense', '限制影响范围')}`],
  ['按任务做衰减授权', `从一个更宽的父授权派生出一个只能写某个文件夹、只活十分钟的凭据。影响范围
    就等于这次衰减的结果。${pill('defense', '限制影响范围')}（<a href="/zh/chapters/a22/">A22</a>）`],
  ['携带溯源信息', `记录每个请求是谁引发的，当引发者是不可信内容时拒绝执行。
    ${pill('defense', '限制影响范围')}，前提是它在运行时被强制执行（<a href="/zh/chapters/a21/">A21</a>）`],
  ['给不可逆操作设关卡', `剩下的部分交给人来确认。给他看收件人和数据，而不是工具名。
    ${pill('warn', '抬高成本')}，而且它会在疲劳下失效（<a href="/zh/chapters/a24/">A24</a>）`],
])}

${h2('你现在应该能做到', 'checkpoint')}

${ul([
  `解释为什么被劫持的智能体发出的请求能通过每一道身份认证检查。`,
  `说出标准认证栈缺的那个字段，并描述它必须携带什么。`,
  `拿一次 OAuth 授权和任务真正需要的权限做对照审计，并量化其中的多余部分。`,
  `把工具误用和注入区分开，并说出一个同时应对两者的控制。`,
])}
`;

export const quiz = [
  {
    q: `一个被劫持的智能体用用户的 OAuth token 给攻击者发了一封邮件。哪个安全控制能检测到它？`,
    options: [
      `身份认证：这个请求没有被正确签名。`,
      `授权：token 缺少所需的 scope。`,
      `标准控制一个都不行；这个请求认证正确，而且在授权范围之内。`,
      `限流：这个量是异常的。`,
    ],
    answer: 2,
    explain: `这正是混淆代理这个框架要说的事。token 有效，scope 里包含 <code>mail.send</code>，请求
      也就是一封邮件。身份认证会通过，因为签名是真的；授权会通过，因为发邮件正是这个 token 的用途；
      限流看到的是一条消息。唯一能把它区分开的事实，也就是这条指令来自一个网页而不是来自用户，在
      请求里的任何地方都没有被表示出来。`,
  },
  {
    q: `<code>requested_by</code> 这个字段要有用的话必须携带什么？为什么它很难做到？`,
    options: [
      `用户的 IP 地址；难在有 NAT。`,
      `指令的因果来源（它派生自哪一条上下文消息），并且要在每一个中间步骤上传播下去；难在整个技术栈里没有任何一层在追踪它。`,
      `时间戳；难在时钟偏移。`,
      `模型版本；难在厂商会改动它。`,
    ],
    answer: 1,
    explain: `这个字段必须回答“是哪一段上下文引发了这次调用”，而且要能扛住各种变换：模型读了一个
      网页、做了摘要、基于摘要做了规划，然后发出一次调用。溯源信息必须穿过这一整串流程，也就意味着
      要给值打标签并把标签传播下去。那是信息流控制，A21 会把它搭起来。它难恰恰是因为现有的每一层都
      不做这件事：HTTP 没有这样的头，OAuth 没有这样的 claim，而模型本身不能被信任如实汇报。`,
  },
  {
    q: `一个团队给智能体授予了完整的 GitHub <code>repo</code> scope，因为细粒度的那条路要向平台
        团队提工单。这件事该怎么定性？`,
    options: [
      `一次判断失误，应该在代码评审里解决。`,
      `一个摩擦导致的结果：过度授权通常源于窄路更难走，所以修复它有一半是组织层面的事。`,
      `一个可以接受的取舍，因为这个智能体是可信的。`,
      `一个许可证问题。`,
    ],
    answer: 1,
    explain: `把它当成粗心来处理，会导向更多评审和更多培训，那是错误的补救方向，而且它还会再犯。在
      那位工程师面对的约束下，这次授权是理性的。真正持久的修复是结构性的：让窄授权可以自助完成、
      提供一个能从父授权衰减出子凭据的签发服务，并且按固定周期审计授权，好让六个月前那个“临时”的
      宽 scope 被一套流程发现，而不是被一次事故发现。`,
  },
  {
    q: `一个智能体执行了 <code>DELETE FROM users</code>，<code>WHERE</code> 子句写坏了。没有攻击者
        参与。哪个控制本可以帮上忙？`,
    options: [
      `输入路径上的注入分类器。`,
      `对检索内容做聚光标记。`,
      `一个只读的数据库凭据，或者对破坏性语句先试运行再确认。`,
      `一个对齐得更好的模型。`,
    ],
    answer: 2,
    explain: `注入防御在这里完全不相干，因为根本没有注入。这是工具误用，SEI 的综述把它作为内部威胁
      统计到 17 个来源。管用的正是链条第 4 环上那些约束攻击者的控制：一个删不了东西的凭据，或者一个
      在执行前先显示受影响行数的关卡。这种重叠在你为这些工作做论证时非常有用，因为失误的发生频率远
      高于攻击。`,
  },
  {
    q: `针对过度授权的缓解手段中，哪一个在模型被完全攻陷时<em>站不住</em>？`,
    options: [
      `收窄 OAuth scope，让那个能力根本不存在。`,
      `签发一个只在十分钟内有效、按任务限定范围的凭据。`,
      `对不可逆操作做人工确认。`,
      `运行时的溯源检查，拒绝由不可信内容引发的调用。`,
    ],
    answer: 2,
    explain: `人工关卡是唯一一个效果取决于压力之下人的判断的手段，而 A24 讲的正是这种判断退化得有多
      快：看到第四十个一模一样的弹窗之后，人就变成了一个带延迟成本的橡皮图章。另外三个由系统强制
      执行，无论模型相信什么它们都成立：scope 直接拿掉了能力，衰减授权限定了窗口，溯源检查就是代码。
      人工关卡要留着，但要放在最后，而且要省着用。`,
  },
  {
    q: `为什么一个缓存 30 天的 OAuth token 对智能体的意义比对普通应用更大？`,
    options: [
      `智能体请求更多，所以 token 暴露得更频繁。`,
      `智能体可以在用户不在场、也不会察觉的时候以用户身份行动，于是这份权限从会话内的变成了常驻的。`,
      `缓存的 token 存储得更不安全。`,
      `token 刷新在智能体里不可靠。`,
    ],
    answer: 1,
    explain: `在交互式应用里，会话 token 隐含地被屏幕前的那个人限定了边界。智能体把它变成一份常驻
      权限：一条注入进来的指令可以在周日凌晨三点、在一个后台任务里、在没人盯着的时候把它用掉。缓解
      办法是在一次运行开始时签发、随运行结束而过期的短生命周期任务级凭据。顺带一提，它还给你一个
      天然的位置，用来挂上前面几道题说的溯源和范围信息。`,
  },
];

export const refs = [
  { authors: 'Norm Hardy', title: 'The Confused Deputy (or why capabilities might have been invented)',
    venue: 'ACM SIGOPS Operating Systems Review, 1988',
    url: 'https://cap-lore.com/CapTheory/ConfusedDeputy.html',
    note: '这个问题最初的提法，以及用能力机制给出的答案' },
  { authors: 'Jerome H. Saltzer, Michael D. Schroeder', title: 'The Protection of Information in Computer Systems',
    venue: 'Proceedings of the IEEE, 1975', url: 'https://www.cs.virginia.edu/~evans/cs551/saltzer/' },
  { authors: 'OWASP Top 10 for LLM Applications team', title: 'LLM06:2025 Excessive Agency',
    venue: 'OWASP, 2025', url: 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/' },
  { authors: 'Tobin South, Samuele Marro, Thomas Hardjono, Robert Mahari, Cedric Deslandes Whitney, Dazza Greenwood, Alan Chan, Alex Pentland',
    title: 'Authenticated Delegation and Authorized AI Agents', venue: 'ICML, 2025',
    url: 'https://arxiv.org/abs/2501.09674' },
  { authors: 'Tianneng Shi, Jingxuan He, Zhun Wang, Linyu Wu, Hongwei Li, Wenbo Guo, Dawn Song',
    title: 'Progent: Programmable Privilege Control for LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2504.11703' },
  { authors: 'Juhee Kim, Woohyuk Choi, Byoungyoung Lee',
    title: 'Prompt Flow Integrity to Prevent Privilege Escalation in LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.15547' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '工具误用在内部威胁项下被统计到 17 个来源' },
];
