import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 15, attacks: '一把更小的钥匙' };
export const scripts = ['/assets/js/sims/zh/a22.js'];

export const body = `
${p(`A10 章诊断出了混淆代理：智能体拿着你的凭据，所以每一次被劫持的动作都是完美通过认证的。这一章是
治疗方案。给智能体一个自己的名字，交给它一把开得更少的钥匙，并且让这把钥匙在会议结束之前就过期。`)}

${h2('削权', 'attenuation')}

${p(`核心操作是单向的。你只能把一份授权收窄，没有任何代码路径能把它放宽。`)}

${code(`def attenuate(self, scopes=None, resources=None, ttl=None, actor=None) -> "Token":
    """You can only ever narrow. There is no widen()."""
    s = frozenset(scopes) & self.scopes if scopes else self.scopes
    r = frozenset(resources) & self.resources if resources else self.resources
    e = min(self.expires, time.time() + ttl) if ttl else self.expires
    return Token(self.subject, actor or self.actor, s, r, e,
                 self.chain + (self.actor,))`,
  { lang: 'py', file: 'code/a22_identity.py', tag: 'safe', tagText: '已加固' })}

${p(`取交集，不是取并集；取最小值，不是取最大值。一个智能体在父 token 并不带 <code>repo.admin</code>
的情况下索要它，拿到的是一个 scope 为空的 token，而不是一个带着 <code>repo.admin</code> 的 token。`)}

${sim({
  name: 'a22token',
  title: '同一个被劫持的智能体，两种凭据',
  badge: '交互实验',
  controls: [
    select('a22-tok', '正在使用的凭据', [
      ['user', '用户本人的 token（30 天，全部 scope，全部资源）'],
      ['task', '一个任务 token（10 分钟，一个 scope，一个资源）'],
      ['sub', '一个子智能体 token（2 分钟，经过委派）'],
    ], 'user'),
    toggle('a22-expired', '模拟 15 分钟之后', false),
  ].join(''),
  body: out('a22-out'),
  note: `每一列里的尝试都是相同的。这是同一个被攻陷的智能体，在试同样的四件事。变的是这份凭据究竟
    能把请求集合表达出多少来。`,
})}

${h2('委派链', 'chain')}

${p(`削权几乎是免费地给了你第二样东西：一份可审计的、谁导致了什么的记录。每个 token 都带着它一路
传下来的路径。`)}

${code(`alice → research-agent → summariser-subagent

chain:  ('alice', 'research-agent')
actor:  'summariser-subagent'
ttl:    119s   (never longer than the parent)`, { lang: 'txt', file: '整条链路' })}

${p(`这就是 A10 说你的认证栈里没有的那个字段。每一次下游调用都带着这条路径，于是审计日志能写
"alice，经由 research-agent，经由 summariser-subagent"，而不是只写 "alice"。事故调查随后就能回答
"是哪个智能体、跑的哪个任务、造成了这次写入"，不必再靠手工对时间戳。`)}

${h2('生产中该用什么', 'standards')}

${table(
  ['标准', '它给你什么'],
  [
    ['<b>OAuth 2.0 Token Exchange</b>（RFC 8693）', '上面用到的 <code>act</code> / <code>sub</code> 区分是一套真实存在的 claim（actor 与 subject），不是我编出来的。对多数团队来说，这是最可能走的一条路。'],
    ['<b>Macaroons / Biscuits</b>', '基于 caveat 的削权：任何持有 token 的人都能离线把它收窄，放宽则在密码学上不可能。'],
    ['<b>SPIFFE / SPIRE</b>', '工作负载身份，于是智能体成为一等的主体，拥有自己可验证的身份文档，而不是借用一个用户会话。'],
    ['<b>W3C DID</b>', '去中心化标识符，用于没有共享 IdP 的跨组织智能体互信。'],
    ['<b>OIDC + on-behalf-of</b>', '企业路线。不够优雅，但已经部署好了，而且能接上你本来就在跑的权限复核流程。'],
    ['<b>IETF 的 agent-auth 草案</b>', '专门针对 AI 智能体交互的认证与授权的新兴工作，涵盖委派链和可削权的 token。'],
  ]
)}

${h2('每个任务要回答的三个问题', 'three-questions')}

${steps([
  ['最小的 scope 集合是什么？',
   `不是"这个智能体是干什么的"，而是<em>这一次运行</em>要干什么。一个研究任务需要的是
    <code>drive.read</code>，不是 <code>drive</code>。多数团队从没问过这个问题，因为授权页面
    从来没给过这个选项。`],
  ['最小的资源集合是什么？',
   `只收窄 scope 而不收窄资源，控制只做了一半。<code>drive.read</code> 覆盖整个账号，照样能读到
    工资表；把 <code>drive.read</code> 限定在 <code>drive://projects/q3-research</code> 上就不行。`],
  ['能用的最短有效期是多久？',
   `一个活得比任务还久的 token 就是一份常驻权限，注入可以在凌晨三点把它用起来。以分钟计，不是以天
    计。在运行开始时把它铸出来，让过期和任务结束刚好重合。`],
])}

${callout('defense', '真正重要的那次转变', `<p style="margin-bottom:0">从<em>"这个用户可以做
什么"</em>转到<em>"这一次运行需要什么"</em>。会话级权限是为坐在屏幕前的人设计的，那个人的在场本身
就给权限划了界。智能体把这条界限拿掉了，所以权限模型必须自己补上一条。按任务而不是按会话，就是这一
章的全部内容，它同时也是 A10 里工具误用那一档的答案，而那种情况下根本没有攻击者。</p>`)}

${h2('token 之外的智能体身份', 'identity')}

${p(`两个在文献里被分开处理、你实际上会一起碰到的相邻问题：`)}

${ul([
  `<b>可见性。</b>Chan 和同事们主张把智能体标识符、实时监控和活动日志当作基础设施来建，这样一个
   智能体做了什么事的时候，它能被归因到一个智能体，而不是一个人。这是
   <a href="/zh/chapters/a26/">A26</a> 里一切内容的前提。`,
  `<b>跨组织信任。</b>当你的智能体和别人的智能体对话时，你需要一种不假定双方共用同一个身份提供方
   的身份机制。DID 和 Agent Network Protocol 的身份层就活在这里，A2A 协议的安全工作也适用于此。`,
])}

${h2('你现在应该能做到', 'checkpoint')}

${ul([
  `实现单向削权，并解释为什么取交集是唯一正确的操作。`,
  `为一个真实的集成铸造一份任务级凭据，并说出它的三重收窄。`,
  `解释委派链能给事故调查带来什么，是一个用户 ID 给不了的。`,
  `说出你实际会采用的那个生产标准，以及为什么。`,
])}
`;

export const quiz = [
  {
    q: `一个持有任务 token 的智能体，请求把它削权成包含 <code>repo.admin</code>，而这个 token 本身
        并不带这个 scope。它会拿到什么？`,
    options: [
      `一个加上了 <code>repo.admin</code> 的 token。`,
      `一个 scope 为空或者原样不变的 token，因为削权是取交集，索要一个不存在的 scope 什么也加不上。`,
      `一个让智能体停下来的报错。`,
      `一个带着待审批的 <code>repo.admin</code> 的 token。`,
    ],
    answer: 1,
    explain: `这个操作是 <code>请求的 ∩ 持有的</code>，所以父 token 没有的 scope 不可能出现在子
      token 里。正是这条性质，让这个控制在智能体被攻陷时依然成立。没有任何代码路径能放宽一份授权，
      于是一条"去申请管理员权限"的注入指令，产出的是一个能力严格更弱的 token，而不是更强的。让它
      直接报错也是一个你可能会做的设计选择，但安全性质来自交集本身。`,
  },
  {
    q: `为什么只收窄 scope 而不收窄资源是不够的？`,
    options: [
      `各家提供方的 scope 没有统一标准。`,
      `<code>drive.read</code> 覆盖整个账号，照样够得到工资表；只有点名具体资源，才能给一个被劫持的智能体能读到的东西划界。`,
      `OAuth 要求必须做资源收窄。`,
      `scope 会过期而资源不会。`,
    ],
    answer: 1,
    explain: `scope 回答的是"什么类型的操作"，资源回答的是"对什么做"。把一个编码智能体从
      <code>drive</code> 降到 <code>drive.read</code>，挡住的是删除，账号里的每一份文档仍然可读，
      而那就是整个数据外泄面。两种收窄都需要，而资源收窄恰恰是授权页面很少提供的那一种，所以它通常
      意味着你得自己铸 token。`,
  },
  {
    q: `委派链能提供什么，是审计日志里的一个用户 ID 提供不了的？`,
    options: [
      `更强的密码学保证。`,
      `那条因果路径：哪个智能体、跑的哪个任务、代表谁，于是调查能回答"什么导致了这件事"，而不只是"谁通过了认证"。`,
      `更快的日志查询。`,
      `符合 GDPR。`,
    ],
    answer: 1,
    explain: `A10 的核心抱怨就是认证栈记录的是签名者，而不是导致者。合法的写入和被劫持的写入，
      日志里都一样写着 "alice"；而 "alice，经由 research-agent，经由 summariser-subagent" 能把调查
      收窄到一次具体的运行、一段你可以重放的具体上下文。它是身份层的溯源，与 A21 在数据层建的那一半
      对应。`,
  },
  {
    q: `为什么一个缓存 30 天的 token，对智能体来说在性质上比对交互式应用更糟？`,
    options: [
      `智能体发的请求更多。`,
      `在交互式应用里，token 的使用被屏幕前的那个人限住了；智能体把它变成一份常驻权限，任何时刻、无人在场都能行使。`,
      `智能体存 token 时更不安全。`,
      `token 刷新在智能体里不可靠。`,
    ],
    answer: 1,
    explain: `人的在场是一种隐式控制，而智能体把它拿掉了。一个被劫持的智能体拿着长期 token，可以在
      周日凌晨三点、在后台任务里、按定时计划动作，没有任何人会注意到异常。在一次运行开始时铸一个
      任务级 token，让它随运行一起过期，就把这条界限还了回来。它同时也给你一个天然的位置，去挂上
      本章其余部分需要的 scope、资源和链路信息。`,
  },
  {
    q: `哪个标准提供离线削权，也就是持有者不联系签发方就能把 token 收窄，却无法把它放宽？`,
    options: [
      `OAuth 2.0 Token Exchange（RFC 8693）。`,
      `Macaroons / Biscuits。`,
      `SPIFFE / SPIRE。`,
      `OpenID Connect。`,
    ],
    answer: 1,
    explain: `Macaroons 用链式 HMAC 挂上 caveat，于是任何持有 token 的人都能追加一条限制，谁也没法
      去掉一条。收窄是本地的、离线的；放宽在密码学上不可能。RFC 8693 靠与签发方的一次交换来实现削权，
      多了一个来回，但那是多数企业技术栈本来就支持的。SPIFFE 处理的是工作负载身份而不是委派；
      OIDC 处理的是认证。`,
  },
  {
    q: `智能体的最小权限被描述为从"这个用户可以做什么"转向"这一次运行需要什么"。这个框架为什么
        对非对抗性的失败也有帮助？`,
    options: [
      `没有帮助；它纯粹是一个安全控制。`,
      `因为一份很窄的凭据同样给一个只是搞错了的智能体划了界（也就是 A10 里的工具误用那一档，其中根本没有攻击者）。`,
      `因为它降低了延迟。`,
      `因为它逼你把 prompt 写得更好。`,
    ],
    answer: 1,
    explain: `一份只读凭据挡住一次误解析出来的 <code>DELETE</code>，和挡住一次恶意的 <code>DELETE</code>
      一样有效，而误解析的删除要常见得多。当你要向一个还不相信注入是自己问题的团队论证这项工作时，
      这个重叠值得先摆出来：同一个控制，处理的是他们已经亲身经历过的那个失效模式。`,
  },
];

export const refs = [
  { authors: 'Jerome H. Saltzer, Michael D. Schroeder', title: 'The Protection of Information in Computer Systems',
    venue: 'Proceedings of the IEEE, 1975', url: 'https://www.cs.virginia.edu/~evans/cs551/saltzer/',
    note: '最小权限，一次就说对了' },
  { authors: 'Michael B. Jones, Anthony Nadalin, Brian Campbell, John Bradley, Chuck Mortimore',
    title: 'RFC 8693: OAuth 2.0 Token Exchange', venue: 'IETF, 2020',
    url: 'https://datatracker.ietf.org/doc/html/rfc8693' },
  { authors: 'Arnar Birgisson, Joe Gibbs Politz, Úlfar Erlingsson, Ankur Taly, Michael Vrable, Mark Lentczner',
    title: 'Macaroons: Cookies with Contextual Caveats for Decentralized Authorization in the Cloud',
    venue: 'NDSS, 2014', url: 'https://research.google/pubs/pub41892/' },
  { authors: 'Tobin South, Samuele Marro, Thomas Hardjono, Robert Mahari, Cedric Deslandes Whitney, Dazza Greenwood, Alan Chan, Alex Pentland',
    title: 'Authenticated Delegation and Authorized AI Agents', venue: 'ICML, 2025',
    url: 'https://arxiv.org/abs/2501.09674' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Alan Chan, Noam Kolt, Peter Wills, Usman Anwar, Christian Schroeder de Witt, Nitarshan Rajkumar, Lewis Hammond, David Krueger, Lennart Heim, Markus Anderljung',
    title: 'IDs for AI Systems', venue: 'NeurIPS Workshop, 2024', url: 'https://arxiv.org/abs/2406.12137' },
  { authors: 'Alan Chan, Kevin Wei, Sihao Huang, Nitarshan Rajkumar, Elija Perrier, Seth Lazar, Gillian K. Hadfield, Markus Anderljung',
    title: 'Infrastructure for AI Agents', venue: 'TMLR, 2025', url: 'https://arxiv.org/abs/2501.10114' },
  { authors: 'Tianneng Shi, Jingxuan He, Zhun Wang, Linyu Wu, Hongwei Li, Wenbo Guo, Dawn Song',
    title: 'Progent: Programmable Privilege Control for LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2504.11703' },
  { authors: 'Pieter Kasselman and colleagues', title: 'draft-klrc-aiagent-auth: AI Agent Authentication and Authorization',
    venue: 'IETF Internet-Draft, 2026', url: 'https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/' },
  { authors: 'SPIFFE community', title: 'SPIFFE: Secure Production Identity Framework for Everyone',
    venue: 'CNCF', url: 'https://spiffe.io/' },
  { authors: 'W3C', title: 'Decentralized Identifiers (DIDs) v1.1', venue: 'W3C', url: 'https://www.w3.org/TR/did-1.1/' },
];
