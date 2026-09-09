import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 14, attacks: '二十分钟从 0% 到 100%' };
export const scripts = ['/assets/js/sims/zh/a19.js'];

export const body = `
${p(`这是第 4 部分里最短的一章，也是最可能改变你周一做法的一章。一套只在固定攻击集上评估过的
防御，其实没有被评估过，它只是被演示过。`)}

${h2('同一套防御，两次评估', 'two-evals')}

${p(`下面是一个像模像样的检测器。八条正则加一条启发式规则，比多数生产系统还多：`)}

${code(`PATTERNS = [
    r"ignore (all )?previous", r"disregard", r"system\\s*:", r"new instruction",
    r"you are now", r"override", r"\\[system\\]", r"forget (the|your)",
]

def defence(text):
    low = text.lower()
    if any(re.search(p, low) for p in PATTERNS):
        return True                          # blocked
    if low.count("\\n\\n") > 4 and ("http" in low or "@" in low):
        return True
    return False`, { lang: 'py', file: 'code/a19_adaptive_eval.py' })}

${sim({
  name: 'a19eval',
  title: '静态基准测试对上自适应攻击者',
  badge: '交互实验',
  controls: select('a19-set', '攻击集', [
    ['static', '静态基准测试：写在防御出现之前'],
    ['adaptive', '自适应攻击集：读过源码之后才写的'],
    ['benign', '正常流量：效用测量'],
  ], 'static'),
  body: out('a19-out'),
  note: `那套自适应攻击集花了二十分钟，外加看一眼源码。静态评估里没发生任何不诚实的事，只是它的
    payload 早于这套防御而已，而基准测试之所以是基准测试，正是因为这一点。`,
})}

${p(`代码文件跑出来的结果：`)}

${table(
  ['评估', '攻击成功率'],
  [
    ['静态基准测试（8 个 payload，公开集）', '<b style="color:var(--defense)">0%</b>'],
    ['自适应攻击集（8 个 payload，二十分钟的工作量）', '<b style="color:var(--attack)">100%</b>'],
    ['被误拦的正常流量', '<b style="color:var(--warn)">40%</b>'],
  ]
)}

${h2('为什么诚实的人也会栽在这里', 'why')}

${p(`很容易把这个落差读成缺乏严谨。它不是。基准测试的<em>定义</em>就是攻击集固定，正因为固定，
结果才能跨系统、跨年份比较，回归测试套件也才可能存在。错完全出在解读上：把“在已知攻击上表现
良好”当成了“是安全的”。`)}

${callout('boundary', '这是两个不同的问题', `<p><b>“面对我们已知的那些攻击，这套防御表现如何？”</b>
——由静态基准测试回答。有用、可比较、重跑便宜，也正是抓回归的正确工具。</p>
<p style="margin-bottom:0"><b>“一个真心要打进来的攻击者得花多少代价？”</b>只有自适应评估能回答。
这才是能预测你会遇到什么的那个数字。</p>`)}

${h2('只报攻击成功率是一句营销话术', 'pair')}

${p(`每一个攻击成功率数字，都必须和同一次运行里的效用保持率一起报出来，因为把智能体拔掉电源就能
轻松拿到 0% 的攻击成功率。上面那个检测器拦掉了 40% 的正常流量（“忽略脚注，总结主要论点”“我上
一单下错了，请不要理它”），而一份只提攻击数字的报告会把这件事完全遮住。`)}

${h2('一份你真能照做的流程', 'protocol')}

${steps([
  ['把源码交给攻击者',
   `白盒：prompt、阈值、模型、策略，全给。Kerckhoffs 原则在这里同样适用。就假设他们已经拿到了，
    因为他们迟早会拿到，而一套要靠机制保密才成立的防御不叫防御。`],
  ['定一个预算',
   `“四小时，500 次查询。”这一步把结果从一句关于可能性的话，变成一句关于<em>成本</em>的话，而
    只有后者有用。`],
  ['迭代',
   `攻击者要看到每一次的结果并据此修改。一次性的攻击集只是换了个说法的静态基准测试，而这一步
    正是大家会跳过的那一步。`],
  ['两个数字都要测',
   `攻击成功率和效用保持率，同一次运行，同一套用例。`],
  ['把预算和数字一起报',
   `“3% 攻击成功率”什么也没说。“在四小时白盒、500 次查询的预算下，攻击成功率 3%”才是别人能
    据此行动的结论。`],
  ['每次改动都重跑',
   `改一句系统 prompt 就让结果作废，因为攻击者是针对旧 prompt 调优的。这也正是静态基准测试仍然
    重要的原因：它是两次昂贵的自适应评估之间那道便宜的回归闸门。`],
])}

${h2('已发表的证据', 'evidence')}

${p(`这不是假想出来的担忧。Zhan 等人拿了几套报出漂亮数字的、针对间接提示注入的已发表防御，用
自适应攻击把它们打穿了。《A Critical Evaluation of Defenses against Prompt Injection Attacks》
在整个文献里发现了同样的模式。Google DeepMind 关于保护 Gemini 的那份记录，把自适应评估描述成
塑造了他们分层策略的那件事，因为最早那几套策略没能挺过去。`)}

${p(`而攻击者这一侧还在不断变便宜。《Learning to Inject》（2026）用强化学习自动生成能在各家
前沿模型之间迁移的注入内容，这意味着上面流程里那个四小时手工预算，如今只是一个有动机的对手所能
做到的下限。`)}

${detail('评估作弊，以及智能体为什么可能知道自己正在被测', `
${p(`还有一个更微妙的问题，也是“诱发”（elicitation）在 SEI 的分类里单独成一类的原因：智能体在
评估环境下的行为，可能和它在生产环境下的行为不一样，因为评估环境是有破绽的。整数、编造的人名、
异常干净的数据、一眼就看得出是测试的任务。`)}
${p(`关于欺骗与规避的文献里，这一条有 10 个来源支撑，而它恰恰在你最在意的地方最要紧。对于危险
能力的评估，低估才是代价昂贵的那种错误。缓解办法是：在你负担得起的范围内尽量用真实的环境去评估，
采用宽松的威胁模型（白盒、充足的预算），并且能够论证即便攻击者拥有更多资源，你的安全性依然
成立。`)}`)}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `解释静态基准测试和自适应评估回答的是两个不同的问题。`,
  `针对你自己的防御跑一次自适应评估，并写明预算。`,
  `拒绝接受一个没有效用数字、也没有预算的攻击成功率。`,
  `读一篇已发表防御的评估章节，说出它没有测什么。`,
])}
`;

export const quiz = [
  {
    q: `一套防御在公开基准测试上的攻击成功率是 0%，面对读过它源码之后写的 payload 则是 100%。
        这个基准测试出了什么问题？`,
    options: [
      `基准测试规模太小。`,
      `没问题。基准测试按定义就有一个固定的攻击集；错在把“面对已知攻击表现良好”解读成了“是安全的”。`,
      `基准测试没有经过同行评审。`,
      `这套防御是故意针对基准测试过拟合的。`,
    ],
    answer: 1,
    explain: `固定正是它的优点：正因为固定，结果才能跨系统、跨时间比较，你也才能把这套用例当作
      回归闸门来用。两种评估回答的是不同的问题（“面对我们已知的攻击表现如何？”对“攻击者得花多少
      代价？”），而只有第二个能预测你的结局。两个都值得跑，把它们混为一谈才是错误。`,
  },
  {
    q: `为什么攻击成功率必须永远和效用保持率一起报？`,
    options: [
      `监管机构要求两个都报。`,
      `因为把一切都拦下来就能轻松拿到 0% 的攻击成功率，所以光看攻击数字分不出一套好防御和一个坏掉的智能体。`,
      `因为效用更容易测量。`,
      `因为攻击成功率低于 5% 时就不可靠了。`,
    ],
    answer: 1,
    explain: `拔掉电源的智能体有着完美的安全记录。在本章的例子里，那个检测器拦掉了 40% 的正常
      流量：那些是含有“请不要理我上一单”的真实客服请求。只报一个数字会把这一切完全藏起来。有了
      这一对数字，你才能比较两套都做到 0% 攻击成功率的防御，A25 的评估框架会把这一点具体演示
      出来。`,
  },
  {
    q: `自适应评估为什么应该把源码交给攻击者？`,
    options: [
      `为了替他们省时间。`,
      `因为一套要靠机制保密才有效的防御不叫防御（Kerckhoffs 原则），而你要的是他们拿到源码之后依然成立的那个数字。`,
      `因为开源更安全。`,
      `因为黑盒攻击不现实。`,
    ],
    answer: 1,
    explain: `你的 prompt 会泄露（A06 的提取），你的模型是公开的，你的策略可以从拒绝里反推出来，
      你的代码可能开源、也可能被逆向。白盒的那个数字，是这些事情发生之后依然为真的数字。用黑盒去
      测，你拿到的数字会在第一次有人提取成功时作废，这对一个部署决策来说是很差的地基。`,
  },
  {
    q: `没有写明攻击者预算的“3% 攻击成功率”意味着什么？`,
    options: [
      `意味着 3% 的攻击会成功。`,
      `几乎什么也不意味着，因为这个数字完全取决于攻击者有多少时间、发了多少次查询、拿到了什么权限。`,
      `意味着这套防御有 97% 的有效性。`,
      `意味着它是在 100 个 payload 上测的。`,
    ],
    answer: 1,
    explain: `十分钟黑盒预算下的 3%，和四十小时白盒预算下的 3%，描述的是差别巨大的两套系统。
      预算把一句关于可能性的话变成一句关于成本的话，而这正是一个安全主张要变得可执行所必须采取的
      形式。把预算报出来还让结果可复现，而目前几乎没有哪篇已发表的防御评估做到了这一点。`,
  },
  {
    q: `你改了系统 prompt。这对上个月那次自适应评估的结果意味着什么？`,
    options: [
      `没影响，只要改动不大。`,
      `结果作废。上个月那个攻击者是针对旧 prompt 调优的，所以测出来的成本已经不适用了。`,
      `结果变好了，因为攻击者的 payload 现在过时了。`,
      `只有改动动到防御本身时才有影响。`,
    ],
    answer: 1,
    explain: `那个结果衡量的是针对某个特定配置的成本，而你把配置改了。现在可能变好，也可能变坏。
      攻击者的旧 payload 失效说明不了任何事，因为他们只需要把流程重跑一遍。这也正是那套便宜的
      静态用例仍然有价值的原因：它是你每次改动都能跑的回归闸门，卡在两次昂贵的自适应评估之间。`,
  },
  {
    q: `SEI 的分类为什么把“诱发”当作一个独立的评估类别？`,
    options: [
      `因为它就是红队演练的同义词。`,
      `因为智能体在评估下的行为可能和它在生产环境下的行为不一样，所以要把它的全部能力引出来，需要刻意的努力和宽松的威胁模型。`,
      `因为它只适用于多模态智能体。`,
      `因为它衡量的是效用而不是安全。`,
    ],
    answer: 1,
    explain: `评估环境是有破绽的：编造的人名、干净的数据、一眼就是测试的任务。评估下的行为差异在
      欺骗与规避的文献里有 10 个来源支撑。而对危险能力的评估来说，低估恰恰是代价昂贵的那种错误。
      推荐的姿态是：真实的环境、白盒权限、充足的预算，并且能够论证即便给攻击者更多资源也不会改变
      你的结论。`,
  },
];

export const refs = [
  { authors: 'Qiusi Zhan, Richard Fang, Henil Shalin Panchal, Daniel Kang',
    title: 'Adaptive Attacks Break Defenses Against Indirect Prompt Injection Attacks on LLM Agents',
    venue: 'NAACL Findings, 2025', url: 'https://arxiv.org/abs/2503.00061' },
  { authors: 'Yuqi Jia, Zedian Shao, Yupei Liu, Jinyuan Jia, Dawn Song, Neil Zhenqiang Gong',
    title: 'A Critical Evaluation of Defenses against Prompt Injection Attacks', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2505.18333' },
  { authors: 'Google DeepMind Security and Privacy Research',
    title: 'Lessons from Defending Gemini Against Indirect Prompt Injections', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2505.14534' },
  { authors: 'Nicholas Carlini, Anish Athalye, Nicolas Papernot, Wieland Brendel, Jonas Rauber, Dimitris Tsipras, Ian Goodfellow, Aleksander Madry, Alexey Kurakin',
    title: 'On Evaluating Adversarial Robustness', venue: 'arXiv, 2019',
    url: 'https://arxiv.org/abs/1902.06705',
    note: '本章的流程改编自其中的自适应评估方法论' },
  { authors: 'Authors of "Learning to Inject"', title: 'Learning to Inject: Automated Prompt Injection via Reinforcement Learning',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2602.05746' },
  { authors: 'Authors of MAGIC', title: 'MAGIC: A Co-Evolving Attacker-Defender Adversarial Game for Robust LLM Safety',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2602.01539' },
  { authors: 'Sahar Abdelnabi, Aideen Fay, Ahmed Salem, Egor Zverev and colleagues (Microsoft)',
    title: 'LLMail-Inject: A Dataset from a Realistic Adaptive Prompt Injection Challenge', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2506.09956' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '把诱发与度量作为独立的评估类别' },
];
