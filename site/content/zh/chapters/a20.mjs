import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 17, attacks: '六种架构' };
export const scripts = ['/assets/js/sims/zh/a20.js'];

const dual = svg(740, 300, `
${svgText(12, 18, '双模型模式', 'd-ttl', 'start')}
${box(30, 56, 150, 56, '特权模型', '有工具', 'd-trust')}
${box(30, 176, 150, 56, '隔离模型', '无工具', 'd-attack')}
${box(300, 56, 150, 56, '工具', '真实执行', 'd-def')}
${box(300, 176, 170, 56, '不可信内容', '抓回来的页面', 'd-attack')}
${box(560, 110, 150, 56, '变量存储', '$VAR1 = "…"', 'd-sunk')}

${arrow(180, 84, 298, 84, '调用')}
${arrow(300, 204, 202, 204, '读取', 'd-attack-l')}
${arrow(180, 190, 558, 140, '', 'd-arrow')}
${svgText(400, 168, '写入值', 'd-sub')}
${arrow(558, 124, 182, 90, '', 'd-arrow')}
${svgText(380, 108, '只返回引用 $VAR1', 'd-def-t')}

<rect x="20" y="164" width="470" height="80" rx="8" class="d-bnd"/>
${svgText(495, 258, '特权模型从不读这个框里的任何东西', 'd-bnd-t', 'end')}
${svgText(370, 288, '它可以把 $VAR1 传给工具，却无法被其内容说服，因为它从未看到过。', 'd-def-t')}
`, { label: '双模型模式：隔离模型加变量引用' });

export const body = `
${p(`到这里为止的一切，都是在让模型不那么容易犯错。第 5 部分要做的，是让它犯的错不再要紧。本章
是那份架构目录：来自 Beurer-Kellner 等人的六种模式，每一种都用一项具体的能力，换来一条你能当众
说出口、并且在评审里站得住的性质。`)}

${h2('目录', 'catalogue')}

${sim({
  name: 'a20patterns',
  title: '同一个被投毒的页面对上七种架构',
  badge: '交互实验',
  controls: select('a20-pat', '架构', [
    ['naive', '朴素智能体（基线）'],
    ['selector', '动作选择器'],
    ['plan', '先规划后执行'],
    ['dual', '双模型'],
    ['code', '先生成代码后执行'],
    ['context', '上下文最小化'],
    ['mapreduce', 'Map-reduce'],
  ], 'naive'),
  body: out('a20-out'),
  note: `除第一种之外，下面每一种模式都挡住了这个 payload，而每一种都为此付出了能力上的代价。
    工程上要问的从来不是“哪个最安全”，而是“我最少要放弃多少能力，才能换到一条我说得清楚的
    性质”。`,
})}

${table(
  ['模式', '性质', '放弃了什么'],
  [
    ['<b>动作选择器</b>', '根本没有反馈回路。智能体从不看到工具返回，因此不存在注入路径。', '用不了工具返回。适合固定的操作菜单。'],
    ['<b>先规划后执行</b>', '控制流完整性：计划在不可信内容到达之前就已定死，注入能改参数，但加不了步骤。', '没有自适应重规划。智能体无法对它发现的东西作出反应。'],
    ['<b>双模型</b>', '特权模型从不读取不可信内容，它操作的是不透明的引用。', '只有不透明的值能跨过边界。对内容的推理被关在隔离的那一侧。'],
    ['<b>先生成代码后执行</b>', '控制流是一段由可信查询推导出的程序，不可信数据以值的形式流经它。', '任务必须能表达成代码。这条路通向 CaMeL（<a href="/zh/chapters/a21/">A21</a>）。'],
    ['<b>上下文最小化</b>', '在作出动作决策之前，不可信文本已从上下文中移除，只留下抽取出来的一个事实。', '抽取那一步本身就可被攻击，所以它是六种里最弱的。'],
    ['<b>Map-reduce</b>', '每一条不可信条目都由一个隔离的、无工具的智能体处理，再由一个可信的归约器合并结果。', '没有跨条目的推理。适合分诊，不适合综合。'],
  ]
)}

${figure(dual, `<b>双模型的细节。</b>隔离模型读取被投毒的页面，可能被彻底劫持——它没有工具，所以
劫持它什么也换不来。它把输出写进变量存储，只返回那个<em>名字</em> <code>$VAR1</code>。特权模型
在 <code>$VAR1</code> 上调度工作，却从不读它的内容，因此 payload 无论怎么措辞都够不着它。
Willison 在 2023 年提出了这个模式；CaMeL 是给它接上策略引擎的版本。`)}

${h2('怎么选', 'choosing')}

${kv([
  ['任务在一开始就完全已知', `<b>先规划后执行。</b>适用面最广的一种模式，通常也是改造成本最低的。`],
  ['任务是一份固定的操作菜单', `<b>动作选择器。</b>能拿到的最强性质；但它只在它适用的时候适用。`],
  ['智能体必须读数据，但不能按内容行动', `<b>双模型。</b>对不可信输入做摘要、分诊、分类。`],
  ['任务可以表达成一段程序', `<b>先生成代码后执行</b>，再用 <a href="/zh/chapters/a21/">CaMeL</a> 加上策略层。`],
  ['大量互相独立的不可信条目', `<b>Map-reduce。</b>收件箱分诊、审核队列、日志分析。`],
  ['只需要从文本里拿到一个事实', `<b>上下文最小化</b>，并且把抽取那一步当作攻击面来对待。`],
])}

${h2('论文里那句诚实的告诫', 'caveat')}

${callout('warn', '它们圈住的是一样东西，不是所有东西', `<p>这些模式为经由智能体<em>控制流</em>
的那一类攻击划定了损害上界。它们做不到的有三件事：</p>
<ul style="margin-bottom:0">
<li>它们不能让智能体的<b>输出</b>变得可信。先规划后执行下的摘要器照样可能产出受攻击者影响的
摘要，然后由人照着它去行动。</li>
<li>如果任务本身就要求<b>对不可信内容作开放式的行动</b>，它们帮不上忙。“读我的邮件，它说什么就
做什么”没有安全的架构，正确答案是不要造这个东西。</li>
<li>它们不处理模型层的威胁（<a href="/zh/chapters/a14/">A14</a>）和资源型攻击
（<a href="/zh/chapters/a16/">A16</a>），这两类完全绕开了控制流。</li>
</ul>`)}

${h2('改造既有系统', 'retrofit')}

${p(`多数读者手上已经有一个朴素智能体在生产环境里跑着。按每削减一单位风险所需的工作量，大致
排序如下：`)}

${steps([
  ['在第一次抓取不可信内容之前把计划定死',
   `哪怕只做一部分也有用：把常见路径上的工具序列固定下来，任何偏离都当作需要审批的事件。这通常
    是一天的工作量，并且直接消掉“注入加了一步”这一整类问题。`],
  ['把摘要那一步隔离出去',
   `如果智能体先读文档再行动，就把它拆开：一次调用负责读和摘要，不带任何工具；另一次调用带着
    工具按摘要行动，但从不看到原文。用一小部分工作量拿到双模型一半的好处。`],
  ['把固定的部分挪进代码',
   `每一个你能用 Python <code>if</code> 而不是模型决策来表达的分支，都是一个注入走不了的分支。`],
  ['然后再加策略层',
   `一旦控制流变成了代码，值就能带上标签，汇点也就能执行策略。那就是
    <a href="/zh/chapters/a21/">A21</a>。`],
])}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `说出这六种模式，以及每一种保证的性质。`,
  `为一个给定任务选一种模式，并为你放弃的那项能力辩护。`,
  `解释为什么隔离模型被完全劫持时，双模型模式依然成立。`,
  `不打折扣地说出这些模式防不住什么。`,
])}
`;

export const quiz = [
  {
    q: `在双模型模式里，隔离模型被一个注入的页面彻底劫持了。为什么这不会危及整个系统？`,
    options: [
      `隔离模型更小、能力更弱。`,
      `它没有工具，而且只返回一个不透明的变量引用；特权模型从不读那些内容，所以任何措辞都说服不了它。`,
      `特权模型会校验隔离模型的输出。`,
      `隔离模型跑在沙箱里。`,
    ],
    answer: 1,
    explain: `两条性质叠在一起。隔离模型不能行动，所以劫持它本身换不来任何东西。而能行动的那个
      特权模型，收到的从来不是不可信文本，只是 <code>$VAR1</code> 这样的引用，因此不存在任何一条
      信道，能让 payload 的语言到达那个有权限的组件。请注意，校验明确<em>不是</em>这里的机制：
      校验意味着要去读那些内容，而那正是这个模式所禁止的。`,
  },
  {
    q: `一个智能体要对 200 封未读邮件做分诊并标出紧急的那些，你会选哪种模式？`,
    options: [
      `先规划后执行，因为计划是已知的。`,
      `Map-reduce：每封邮件由一个隔离的、无工具的智能体处理，再由一个可信的归约器合并这些标记。`,
      `动作选择器，因为打标记是一个固定操作。`,
      `上下文最小化，从每封邮件里抽取紧急程度。`,
    ],
    answer: 1,
    explain: `Map-reduce 和这个任务的形状严丝合缝：大量互相独立的不可信条目、不需要跨条目推理、
      每条一个不需要工具的工作单元。第 47 封邮件里的注入只能攻陷处理第 47 封的那个工作单元，别的
      什么都拿不到，因为那个工作单元不能行动，输出的也只是一个结构化标记而不是自由文本。先规划后
      执行也有帮助，但它把 200 封邮件全留在同一个上下文里；动作选择器则根本读不了内容。`,
  },
  {
    q: `一个团队用了先规划后执行，然后宣称注入现在已经不可能了。他们夸大了什么？`,
    options: [
      `没有夸大；计划已经定死了。`,
      `被注入的内容仍然能影响工具<em>参数</em>和智能体的<em>输出</em>。它只是没法往计划里加步骤。`,
      `先规划后执行只对单步任务有效。`,
      `计划可以在运行中重新生成。`,
    ],
    answer: 1,
    explain: `控制流完整性是一条真实而有价值的性质，但它比“注入不可能”窄得多。如果计划里有
      <code>send_email(recipient, body)</code>，那么根据这些参数是怎么推导出来的，被注入的内容
      仍然可能左右收件人是谁、正文写什么。而智能体产出的那份摘要，无论如何都受攻击者影响。把参数
      这条信道关上的，是数据流控制（A21）。`,
  },
  {
    q: `为什么上下文最小化被称为六种模式里最弱的一种？`,
    options: [
      `它实现起来最贵。`,
      `那个从不可信文本里抽出事实的步骤，本身也是一个模型在读不可信文本，因此它继承了原来的问题。`,
      `它只对短文档有效。`,
      `它需要白盒的模型访问权限。`,
    ],
    answer: 1,
    explain: `你挪走了那个脆弱的步骤，而不是移除了它。总还有某个组件在读攻击者的文本并对它作出
      判断，而这个判断决定了什么会进入可信上下文。它确实有帮助，因为一个抽取出来的事实比一份
      3,000 token 的页面是窄得多的信道，但这个保证在性质上比双模型弱，后者的特权那一侧什么都
      不读。`,
  },
  {
    q: `在这六种模式里，哪一个任务根本没有安全的架构？`,
    options: [
      `“把这十个网页总结成一份报告。”`,
      `“读我的邮件，它说什么就做什么。”`,
      `“按紧急程度给这些工单分诊。”`,
      `“查一下这个邮编，然后把表单填好。”`,
    ],
    answer: 1,
    explain: `任务描述本身<em>就是</em>那个漏洞：它要求智能体按不可信内容去作开放式的行动，而这
      恰恰是这里每一种模式都在阻止的事。再多的架构也救不了它，因为任何允许它的架构，按定义也就
      允许了这次攻击。正确的工程反应是拒绝这条需求，换一条更窄的：一组固定的、邮件可以触发的动作，
      外加确认。`,
  },
  {
    q: `你手上有一个跑在生产环境里的朴素智能体，还有一周的工程时间。做什么削减的风险最多？`,
    options: [
      `在输入路径上加一个注入分类器。`,
      `在第一次抓取不可信内容之前，把常见路径上的工具序列固定下来，任何偏离都当作审批事件。`,
      `换一个更大的模型。`,
      `给检索回来的内容加上数据标记。`,
    ],
    answer: 1,
    explain: `部分实现的先规划后执行消掉了一整类问题（“注入加了一步用户从没要求过的动作”），而且
      通常几天就能做完，因为多数智能体的常见路径就那么几条。数据标记值得做，也只要一个小时，但它
      属于抬高成本的控制；输入分类器对间接注入来说放错了地方（A17）；而更大的模型只改变发生率，
      不改变上限。`,
  },
];

export const refs = [
  { authors: 'Luca Beurer-Kellner, Beat Buesser, Ana-Maria Creţu, Edoardo Debenedetti, Daniel Dobos, Daniel Fabian, Marc Fischer, David Froelicher, Kathrin Grosse, Daniel Naeff, Ezinwanne Ozoani, Andrew Paverd, Florian Tramèr, Václav Volhejn',
    title: 'Design Patterns for Securing LLM Agents against Prompt Injections', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2506.08837',
    note: '本章所依据的那份六模式目录' },
  { authors: 'Simon Willison', title: 'The Dual LLM pattern for building AI assistants that can resist prompt injection',
    venue: 'simonwillison.net, 2023', url: 'https://simonwillison.net/2023/Apr/25/dual-llm-pattern/' },
  { authors: 'Edoardo Debenedetti, Ilia Shumailov, Tianqi Fan, Jamie Hayes, Nicholas Carlini, Daniel Fabian, Christoph Kern, Chongyang Shi, Andreas Terzis, Florian Tramèr',
    title: 'Defeating Prompt Injections by Design (CaMeL)', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.18813' },
  { authors: 'Authors of "CaMeLs Can Use Computers Too"',
    title: 'CaMeLs Can Use Computers Too: System-level Security for Computer Use Agents', venue: 'arXiv, 2026',
    url: 'https://arxiv.org/pdf/2601.09923' },
  { authors: 'Google Security Team', title: 'An Introduction to Google\'s Approach to AI Agent Security',
    venue: 'Google Research, 2025',
    url: 'https://research.google/pubs/an-introduction-to-googles-approach-for-secure-ai-agents/' },
  { authors: 'Google GenAI Security Team', title: 'Mitigating prompt injection attacks with a layered defense strategy',
    venue: 'Google Security Blog, 2025',
    url: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
  { authors: 'Fangzhou Wu, Ethan Cecchetti, Chaowei Xiao',
    title: 'System-Level Defense against Indirect Prompt Injection Attacks: An Information Flow Control Perspective',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2409.19091' },
  { authors: 'Yuhao Wu, Franziska Roesner, Tadayoshi Kohno, Ning Zhang, Umar Iqbal',
    title: 'SecGPT: An Execution Isolation Architecture for LLM-Based Systems', venue: 'NDSS, 2025',
    url: 'https://arxiv.org/abs/2403.04960' },
  { authors: 'Eugene Bagdasaryan, Ren Yi, Sahra Ghalebikesabi, Peter Kairouz, Marco Gruteser, Sewoong Oh, Borja Balle, Daniel Ramage',
    title: 'AirGapAgent: Protecting Privacy-Conscious Conversational Agents', venue: 'ACM CCS, 2024',
    url: 'https://dl.acm.org/doi/10.1145/3658644.3690350' },
];
