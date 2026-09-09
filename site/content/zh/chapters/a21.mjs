import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 18, attacks: '一条从不读取载荷的策略' };
export const scripts = ['/assets/js/sims/zh/a21.js'];

const flow = svg(740, 340, `
${svgText(12, 18, '标签沿每一次派生传播', 'd-ttl', 'start')}
${box(20, 50, 160, 54, 'http_get(url)', 'src: untrusted_web', 'd-attack')}
${box(20, 150, 160, 54, 'read_file(.env)', 'src: local_secret', 'd-attack')}
${box(250, 50, 170, 54, '摘要', 'src: untrusted_web')}
${box(250, 150, 170, 54, '改写', 'src: local_secret', 'd-attack')}
${box(250, 250, 170, 54, '摘要 + 密钥', 'src: 两者', 'd-attack')}
${arrow(180, 77, 248, 77)}
${arrow(180, 177, 248, 177)}
${arrow(180, 190, 248, 262)}
${arrow(420, 90, 500, 130)}
${box(500, 110, 220, 54, 'send_email(to, body)', '汇点：策略在这里运行', 'd-def')}
${arrow(420, 177, 498, 150)}
${arrow(420, 264, 498, 165)}

${svgText(620, 200, 'readers(summary)      = public', 'd-sub')}
${svgText(620, 218, 'readers(paraphrase)   = user only', 'd-attack-t')}
${svgText(620, 236, 'readers(combined)     = intersection', 'd-attack-t')}
${svgText(620, 262, '检查从不读取文本', 'd-def-t')}
${svgText(620, 280, '所以怎么改写载荷', 'd-def-t')}
${svgText(620, 298, '都过不去', 'd-def-t')}
`, { label: '溯源标签沿派生值一路传播到受策略检查的汇点' });

export const body = `
${p(`讲模式的那一章停在了先生成代码再执行：控制流来自可信的查询，数据只作为值流过。这一章补上另一半。
每个值都带着自己的来源，每个汇点在动作之前先检查这个来源。由此得到的防御，其正确性不依赖模型相信
任何东西。`)}

${h2('带标签的值', 'tagged')}

${code(`@dataclass
class Tagged:
    value: object
    sources: frozenset = frozenset()     # where the data came from
    readers: frozenset = frozenset()     # who is allowed to see it

    def derive(self, new_value, other=None):
        """Any derived value inherits the UNION of sources,
           the INTERSECTION of readers."""
        s = self.sources | (other.sources if other else frozenset())
        r = self.readers & (other.readers if other else self.readers)
        return Tagged(new_value, s, r)`,
  { lang: 'py', file: 'code/a21_ifc.py', tag: 'safe', tagText: '已加固' })}

${p(`来源取并集，读者取交集。这两行就是全部的传播规则，也正是它让"洗白"变得不可能。把一个密钥改写
一遍，得到的仍然是从密钥派生出来的值；把密钥混进一份公开摘要，结果的受众会被收窄到两者的交集。`)}

${figure(flow, `<b>攻击者为什么改写不出去。</b>每一次派生都把标签带下去。汇点上的策略是标签的函数，
从来不是文本的函数，所以载荷怎么措辞都不会改变结果——根本没有可供<em>措辞</em>的对象。`)}

${h2('策略', 'policy')}

${code(`def check_send(data: Tagged, recipient: str):
    label = reader_label(recipient)            # user | internal | public
    if label not in data.readers:
        raise PolicyViolation(
            f"cannot send data derived from {sorted(data.sources)} to "
            f"{recipient!r} (audience {label!r})")`, { lang: 'py', tag: 'safe', tagText: '已加固' })}

${sim({
  name: 'a21ifc',
  title: '信息流控制对上一个被劫持的智能体',
  badge: '交互实验',
  controls: [
    select('a21-flow', '智能体做的事', [
      ['benign', '给一个公开页面做摘要，邮件发给团队'],
      ['exfil', '被劫持：读取 .env，邮件发给攻击者'],
      ['launder', '被劫持：先把密钥改写一遍'],
      ['mix', '被劫持：把密钥埋进一份正常摘要里'],
      ['encode', '被劫持：把密钥做 base64 编码'],
    ], 'benign'),
    toggle('a21-ifc', '启用信息流控制', true),
  ].join(''),
  body: out('a21-out'),
  note: `把控制关掉，每一行都会成功。打开它，后四行会以一模一样的方式失败：同样的理由，同样的报错，
    因为这个检查是溯源的函数，而这四种做法派生自同一个带标签的值。`,
})}

${h2('哪些东西从未被查阅', 'never-consulted')}

${callout('defense', '正是这份清单让它成为一种给损害设上界的控制', `
<ul style="margin-bottom:0">
<li><b>模型的判断。</b>在每一次敌对运行中，它自始至终都被彻底劫持。</li>
<li><b>指令的文本。</b>任何环节都没有检查过。</li>
<li><b>某个检测阈值。</b>根本不存在这种东西。</li>
<li><b>载荷的措辞。</b>无关紧要，因为没有任何东西会去读它。</li>
</ul>`)}

${p(`攻击者写出更高明的载荷，什么也改变不了。这就是本章与第四部分全部内容之间的本质区别，也是为什么
面对"要是注入更聪明呢？"这个问题，本课程第一次可以回答"那不重要"。`)}

${h2('CaMeL：接近生产形态的版本', 'camel')}

${p(`Debenedetti 和同事们把两半拼到了一起。一个特权 LLM 把用户可信的查询转成受限 Python 子集里的
一段程序。一个隔离 LLM 处理所有不可信内容，只返回值。一个自定义解释器运行这段程序，为每个值追踪一个
能力标签，并在每个汇点强制执行策略。`)}

${table(
  ['组件', '看得到不可信内容吗？', '能动作吗？'],
  [
    ['特权 LLM（负责写程序）', '看不到，只看用户的查询', '间接可以，通过那段程序'],
    ['隔离 LLM（负责解析内容）', '看得到', '不能'],
    ['解释器', '看得到，但只是不透明的带标签值', '能，受策略约束'],
    ['策略引擎', '看不到，只看标签', '它本身就是决策点'],
  ]
)}

${p(`2026 年的后续工作《CaMeLs Can Use Computers Too》把单次规划扩展到了计算机操作型智能体。那是
<a href="/zh/chapters/a08/">A08</a> 里更难的一种情况，因为一个坐标本身不带任何语义，你无从针对它
写策略。`)}

${h2('把代价直说', 'costs')}

${ul([
  `<b>策略得你自己写。</b>"从来源 X 派生的数据可以给谁看"，这个问题你所在的组织多半从来没有明确
   回答过。把它写下来是这件事的大部分工作量，而且这份成果脱离智能体本身也有价值。`,
  `<b>有些任务的控制流没法提前写出来。</b>真正探索性的工作（第七步取决于第六步以不可预料的方式
   发现了什么）套不进这个框架。对这类任务，诚实的回答是换一种模式，或者把任务收窄。`,
  `<b>过度污染。</b>如果最后什么值都派生自某个不可信的东西，策略就会把一切都挡掉，用户则会绕开它。
   管住这一点需要降密：在明确的、可审计的点上降低一个值的标签，比如在人工确认之后。`,
  `<b>在 CaMeL 那种形态下，每一步都多一次模型调用</b>，外加一个需要你自己维护的解释器。`,
])}

${detail('值得了解的相关工作', `
${kv([
  ['f-secure (Wu et al.)', `在系统层面做信息流控制，并把间接注入所违反的那条安全性质形式化了出来。`],
  ['FIDS', `用信息流控制加固智能体，重点放在如何在现有的智能体框架内落地部署。`],
  ['RTBAS', `把 IFC 与依赖追踪结合起来，同时防注入和隐私泄露，并且直接处理了过度污染的问题。`],
  ['AgentArmor', `把程序分析用在智能体的<em>运行时轨迹</em>上，事后恢复控制依赖和数据依赖。当你没法
    把系统重建一遍时，这是那条改造式的路。`],
  ['Permissive IFC', `基于多重执行的追踪，减少误拦截，用算力换精度。`],
  ['MELON', `针对智能体中间接注入的一种可证明防御，做法是用被掩码的工具返回重新执行一遍。`],
])}`)}

${h2('你现在应该能做到', 'checkpoint')}

${ul([
  `按并集／交集规则实现标签传播，并解释为什么两个方向都必要。`,
  `解释为什么改写、编码和混合都洗不掉一个标签。`,
  `说清 CaMeL 的四个组件，以及其中哪些会读到不可信文本。`,
  `点出过度污染这个失效模式，以及应对它的机制。`,
])}
`;

export const quiz = [
  {
    q: `传播规则为什么对来源取<em>并集</em>，却对读者取<em>交集</em>？`,
    options: [
      `为了计算效率。`,
      `派生出来的值被它的每一个来源污染，因此只能给有权看到<em>全部</em>来源的人看。`,
      `为了让标签集合保持得小。`,
      `因为来源是有序的，读者不是。`,
    ],
    answer: 1,
    explain: `两个方向都朝着安全的那一边保守。把一份公开摘要和一个密钥合到一起，得到的东西部分是密钥，
      所以它继承两个来源；而它的受众必须收窄到有权接触最受限那份输入的人，也就是交集。任何一条规则
      反过来（来源取交集，或者读者取并集），攻击者都能把密钥混进公开内容来洗白它，这正是实验里
      "mix" 那一档。`,
  },
  {
    q: `攻击者指使被劫持的智能体先把密钥做 base64 编码再发送。在 IFC 之下会发生什么？`,
    options: [
      `编码破坏了标签，因为值已经变了。`,
      `编码后的值派生自密钥，因此带着同样的标签，被以完全相同的方式拦下。`,
      `策略先把它解码，然后再拦截。`,
      `会成功，因为 IFC 只检查字面值。`,
    ],
    answer: 1,
    explain: `标签跟着派生走，不跟着字节相等走。<code>b64(secret)</code> 是<em>从</em>
      <code>secret</code> 产生的，于是继承它的来源和被收窄的读者集合，汇点用与明文一模一样的报错
      拒绝它。注意策略并没有解码任何东西。它压根不看这个值，所以整个编码空间坍缩成了一种情况。`,
  },
  {
    q: `在 CaMeL 里，哪个组件既读不可信内容<em>又</em>能动作？`,
    options: [
      `特权 LLM。`,
      `隔离 LLM。`,
      `都不是。特权 LLM 能动作，但只看得到用户查询；隔离 LLM 读不可信内容，却完全没有动作能力。`,
      `两个都是，所以才需要策略引擎。`,
    ],
    answer: 2,
    explain: `这个分离就是整个构造的全部。持有权限的组件从不读攻击者可控的文本，读攻击者可控文本的
      组件没有任何权限。解释器处理的是带标签的值，它不是语言模型，所以劝不动；策略引擎只看标签。
      没有任何一个地方同时具备"读到载荷"和"能据此动作"。`,
  },
  {
    q: `你的 IFC 部署最后把大部分正常工作都挡住了，因为几乎每个值都派生自某个不可信的东西。这是
        什么问题，靠什么解决？`,
    options: [
      `标签传播的 bug，把并集规则修好即可。`,
      `过度污染，靠降密解决：在明确的、可审计的点上降低一个值的标签，比如在人工确认之后。`,
      `模型能力不够，换一个更大的模型。`,
      `策略配错了，把读者集合放宽。`,
    ],
    answer: 1,
    explain: `过度污染是信息流系统的标准失效模式，也是好几个部署最后被悄悄关掉的原因。传播规则本身
      是对的；问题在于真实工作流本来就会混合不同的信任级别。降密把这种降低变成显式且可审计的，而不是
      隐式且看不见的；RTBAS 直接处理了这一点。全局放宽读者集合，只会在保留整套机制的同时把这个控制
      废掉。`,
  },
  {
    q: `是什么让 IFC 成为一种"给损害设上界"的控制，而不是"抬高攻击成本"的控制？`,
    options: [
      `它的漏报率比分类器低。`,
      `它的判断是数据溯源的函数，而不是语言的函数，所以不论载荷怎么写、模型被攻陷得多彻底，
       结论都一样成立。`,
      `它在模型之前运行。`,
      `它是确定性的，因此更快。`,
    ],
    answer: 1,
    explain: `这个检查从不读载荷，所以攻击者没有可以优化的目标，而这恰恰是 A19 里自适应攻击结果对
      每一种基于文本的防御所利用的东西。确定性有意义，但更深一层的性质在于：模型相信什么根本不是这个
      判断的输入。在代码文件里，每一次敌对运行智能体都被彻底劫持，结果却没有任何变化。`,
  },
  {
    q: `哪一类任务不适合 CaMeL 式的控制流提取？`,
    options: [
      `"把这十页做成摘要，然后邮件发给我的团队。"`,
      `"调查这起事件：日志指向哪里就跟到哪里。"`,
      `"把这份名单里的每个客户查一遍，标出逾期账户。"`,
      `"读这份 PDF，把发票总额提取出来。"`,
    ],
    answer: 1,
    explain: `开放式调查恰恰是控制流无法事先固定的情形：第七步真的取决于第六步发现了什么，而可信查询
      无从预料。诚实的回应要么是换一种模式，要么把任务拆细、在阶段之间加审批，要么就承认这类工作负载
      得在人工确认之下运行。另外三个的控制流，单看请求本身就能确定。`,
  },
];

export const refs = [
  { authors: 'Edoardo Debenedetti, Ilia Shumailov, Tianqi Fan, Jamie Hayes, Nicholas Carlini, Daniel Fabian, Christoph Kern, Chongyang Shi, Andreas Terzis, Florian Tramèr',
    title: 'Defeating Prompt Injections by Design (CaMeL)', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.18813' },
  { authors: 'Fangzhou Wu, Ethan Cecchetti, Chaowei Xiao',
    title: 'System-Level Defense against Indirect Prompt Injection Attacks: An Information Flow Control Perspective',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2409.19091' },
  { authors: 'Manuel Costa, Boris Köpf, Aashish Kolluri, Andrew Paverd, Mark Russinovich, Ahmed Salem, Shruti Tople, Lukas Wutschitz, Santiago Zanella-Béguelin',
    title: 'Securing AI Agents with Information-Flow Control (FIDS)', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2505.23643' },
  { authors: 'Peter Yong Zhong, Siyuan Chen, Ruiqi Wang, McKenna McCall, Ben L. Titzer, Heather Miller, Phillip B. Gibbons',
    title: 'RTBAS: Defending LLM Agents Against Prompt Injection and Privacy Leakage', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2502.08966' },
  { authors: 'Authors of AgentArmor', title: 'AgentArmor: Enforcing Program Analysis on Agent Runtime Trace to Defend Against Prompt Injection',
    venue: 'arXiv, 2025', url: 'https://www.arxiv.org/abs/2508.01249' },
  { authors: 'Kaijie Zhu, Xianjun Yang, Jindong Wang, Wenbo Guo, William Yang Wang', title: 'MELON: Provable Defense Against Indirect Prompt Injection Attacks in AI Agents',
    venue: 'ICML, 2025', url: 'https://arxiv.org/abs/2502.05174' },
  { authors: 'Shoaib Ahmed Siddiqui, Radhika Gaonkar, Boris Köpf, David Krueger, Andrew Paverd, Ahmed Salem, Shruti Tople, Lukas Wutschitz, Menglin Xia, Santiago Zanella-Béguelin', title: 'Permissive Information-Flow Analysis for Large Language Models',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2410.03055' },
  { authors: 'Juhee Kim, Woohyuk Choi, Byoungyoung Lee',
    title: 'Prompt Flow Integrity to Prevent Privilege Escalation in LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.15547' },
  { authors: 'Andrew C. Myers, Barbara Liskov', title: 'A Decentralized Model for Information Flow Control',
    venue: 'ACM SOSP, 1997', url: 'https://www.cs.cornell.edu/andru/papers/iflow-sosp97.pdf',
    note: '本章的读者／写者集合，正是对这套去中心化标签模型的简化' },
  { authors: 'Authors of "CaMeLs Can Use Computers Too"',
    title: 'CaMeLs Can Use Computers Too: System-level Security for Computer Use Agents', venue: 'arXiv, 2026',
    url: 'https://arxiv.org/pdf/2601.09923' },
];
