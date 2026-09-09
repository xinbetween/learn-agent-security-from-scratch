import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, range, button, toggle, out, pill } from '../../../lib/components.mjs';

export const meta = { time: 12, attacks: '什么都不偷的那种攻击' };
export const scripts = ['/assets/js/sims/zh/a16.js'];

export const body = `
${p(`本部分其他每一章讲的都是攻击者拿走了什么。这一章讲的是攻击者什么都不拿，却照样让你付出很多：让智能体想上
很久、让它循环调用工具，或者让它占住真实用户在排队等的那条队列。`)}

${h2('放大效应：很小的输入，很大的账单', 'amplification')}

${table(
  ['场景', '调用数', 'token 数', '花费'],
  [
    ['正常请求', '1', '1,200', '$0.004'],
    ['“详细总结一遍，然后批评你自己的总结，重复二十次”', '1', '340,000', '$1.02'],
    ['递归工具循环 —— 每次调用都重读一遍越来越长的上下文', '40', '1,230,000', '$3.69'],
    ['扇出：“把这 500 个条目逐个调研一遍”', '500', '1,000,000', '$3.00'],
  ]
)}

${p(`这些数字是单次请求的。一个有脚本、又没被限速的攻击者会不停地跑它们，而有意思的性质在于：这一切都不需要任何
漏洞。上面每一条都是智能体在完全按设计工作，处理一个它本来就被造出来接受的请求。`)}

${callout('attack', '隐蔽的那个版本', `<p style="margin-bottom:0">“Beyond Max Tokens”（2026）描述了一个被改造过的
MCP 工具服务器，它每一轮返回的结果都略微膨胀一点，于是每次迭代都把智能体的上下文吹大一圈。报告的成本膨胀高达
<b>658×</b>，而它之所以隐蔽，是因为每一条单独的响应看上去都很合理。只有轨迹才显出这个增长。你的
<code>max_tokens</code> 上限帮不上忙，因为攻击在于轮数和每轮的增量，而不在任何单条响应里。</p>`)}

${h2('预算，以及每一种预算必须放在哪里', 'budgets')}

${sim({
  name: 'a16budget',
  title: '失控循环对上预算执行器',
  badge: '交互实验',
  controls: [
    select('a16-atk', '攻击', [
      ['recursive', '递归循环 —— 上下文每轮变长'],
      ['mcp', 'MCP 放大器 —— 工具自己把返回吹大'],
      ['fanout', '扇出 —— 500 个子任务'],
      ['normal', '一个正常请求（对照）'],
    ], 'recursive'),
    range('a16-steps', '最大步数', 2, 40, 8, 1),
    range('a16-cost', '最大花费', 5, 500, 50, 5, '¢'),
    toggle('a16-size', '把工具返回大小上限设为 4 KB', false),
  ].join(''),
  body: out('a16-out'),
  note: `注意每种攻击最先撞上哪一道上限，以及只有返回大小上限能在 MCP 放大器<em>早期</em>就把它拦住，而不是等账单
    已经跑掉大半之后。预算很便宜；选对预算则要求你了解那个攻击。`,
})}

${code(`class Budget:
    def __init__(self, max_steps=8, max_tokens=50_000,
                 max_cost=0.50, max_tool_calls=12):
        ...

    def charge(self, tokens=0, tool_call=False):
        self.steps += 1
        self.tokens += tokens
        self.tool_calls += 1 if tool_call else 0
        for name, cur, cap in [("steps", self.steps, self.max_steps),
                               ("tokens", self.tokens, self.max_tokens),
                               ("cost", cost(self.tokens), self.max_cost),
                               ("tool_calls", self.tool_calls, self.max_tool_calls)]:
            if cur > cap:
                return f"BUDGET EXCEEDED: {name} {cur:.2f} > {cap}"
        return None`, { lang: 'py', file: 'code/a16_resource_attacks.py', tag: 'safe', tagText: '已加固' })}

${h2('预算可以有的四种作用域', 'scopes')}

${kv([
  ['按运行', `步数、墙钟时间、token、工具调用数、花费。它拦住一个失控的任务。这是大多数团队唯一有的那一种，而只有
    它的话，攻击者直接起一千个运行就是了。`],
  ['按身份', `每分钟请求数、并发运行数、每日花费。这才是真正堵住钱包耗尽的那一种，而它只有十行代码。`],
  ['按工具', `调用次数，以及很关键的<b>返回大小上限</b>。大小上限才是杀死 MCP 放大器的东西，因为它框住的是每轮的
    增量，而不是总量。`],
  ['按租户', `共享队列上的准入控制，好让一个客户的失控任务没法把服务从其他客户手里拒掉。这是人们不出事就想不起来的
    那种失效模式。`],
])}

${h2('推理循环耗尽与护栏拒绝服务', 'loops')}

${p(`有两个变种值得点名，因为它们能打穿天真的预算：`)}

${ul([
  `<b>过度思考攻击。</b>CODE（2026）为带推理模型的 RAG 系统构造充满矛盾的投毒样本，导致推理 token 被大量消耗，
   <em>而任务准确率并不下降</em>。输出是对的，所以质量监控什么都看不到；动的只有 token 计量表。`,
  `<b>护栏拒绝服务。</b>如果你的安全层本身是一个模型，攻击者可以打这个护栏而不是打智能体。那些把分类器推进长推理
   循环的输入会耗尽这道防御，然后——取决于你的失效模式——要么拦住合法流量，要么直接放行。在事情发生之前，明确
   决定是哪一种。`,
])}

${callout('warn', '失效放行还是失效拦截？', `<p style="margin-bottom:0">护栏超时的时候，请求是继续走还是被拒绝？
两个答案都站得住脚，而错的那个是你没有刻意选过的那个。高负载下失效放行会把一次资源攻击变成一扇注入的窗口；失效
拦截则把它变成一次停服。把它写下来，测一遍，并确保高负载下的实际行为和你写下来的一致。</p>`)}

${h2('这一章为什么存在', 'why')}

${p(`钱包耗尽是各团队会忘掉的那种攻击，因为它什么都不偷。它表现为一张让人吃惊的账单，或者一条已经慢了一星期的
队列，而且往往被诊断成容量问题而不是攻击。它的控制措施是整门课里最便宜的几项之一（一个按身份的花费上限就是几行
代码），而它们经常压根就不存在，因为没人把这个风险指派给任何人。`)}

${h2('现在你应该能做到', 'checkpoint')}

${ul([
  `说出四种预算作用域，以及每一种堵住的是哪种攻击。`,
  `解释为什么 <code>max_tokens</code> 上限拦不住 MCP 放大攻击。`,
  `描述一种在不降低输出质量的前提下抬高成本的攻击。`,
  `刻意地说出你系统在高负载下的护栏失效模式。`,
])}
`;

export const quiz = [
  {
    q: `为什么 <code>max_tokens</code> 限制拦不住 MCP 放大攻击？`,
    options: [
      `这个攻击绕过了 token 计数器。`,
      `这个上限框住的是每一条单独的响应，而攻击靠的是轮数和每轮的增量。`,
      `MCP 服务器不受 token 限制约束。`,
      `这个限制只作用于输入 token。`,
    ],
    answer: 1,
    explain: `每条响应都稳稳地待在上限之下，孤立地看也很合理，这正是这个攻击隐蔽的原因。成本是跨迭代累积的：工具
      每次多返回一点，而变长的上下文每一轮都被重读一遍。有两项控制对得上这个攻击：覆盖整条轨迹的按运行 token 或花费
      预算，以及框住增量而非总量的按工具返回大小上限。`,
  },
  {
    q: `某团队有一个每次运行 8 步的上限，别的预算都没有。还有什么攻击是敞着的？`,
    options: [
      `单次运行内部的递归循环。`,
      `同时起一千个运行——没有任何东西约束攻击者的总消耗。`,
      `提示注入。`,
      `工具投毒。`,
    ],
    answer: 1,
    explain: `按运行的上限约束的是一个任务，对一个身份可以起多少个任务只字未提。这是最常见的缺口。最显眼的限制是
      按运行的，因为循环就在那儿，而攻击只要并行化就行了。真正堵住钱包耗尽的是一个覆盖每分钟请求数、并发运行数和
      每日花费的按身份预算，而它是坐在智能体前面、而不是里面的一小把代码。`,
  },
  {
    q: `一种攻击在不改变输出质量的情况下抬高推理 token 消耗。为什么它特别难被察觉？`,
    options: [
      `它只在夜里发生。`,
      `质量监控和正确性测试什么问题都看不出来，所以唯一的信号在成本计量表上，而那通常由另一个团队盯着。`,
      `这些 token 不计费。`,
      `它需要内鬼。`,
    ],
    answer: 1,
    explain: `这是 CODE 过度思考攻击的关键性质：任务准确率被保住了。你跑的每一项评测都报告健康，不管是正确率、延迟
      SLO 还是用户满意度。唯一的指标是每次请求的花费，而它通常住在财务看板里而不是安全看板里。这也是把每请求成本
      放进和其他智能体遥测同一个监控面（A26）的好理由。`,
  },
  {
    q: `你的护栏模型在高负载下超时了。请求应该继续走吗？`,
    options: [
      `总是继续走，因为可用性更重要。`,
      `总是拒绝，因为安全更重要。`,
      `两个都站得住脚，错的那个是你没有刻意选过、也没测过的那个。`,
      `无限重试，直到护栏响应为止。`,
    ],
    answer: 2,
    explain: `高负载下失效放行会把一次资源攻击变成一扇注入的窗口；失效拦截则把它变成一次攻击者随时能触发的停服。
      哪种取舍正确，取决于你的智能体在干什么。一个编码助手和一个支付智能体应该选得不一样。永远不正确的是在事故当中
      才发现这个行为，而无限重试不过是失效拦截外加额外的花费。`,
  },
  {
    q: `哪一种预算作用域堵住的是共享队列饥饿这种情形——一个租户的失控任务把服务从其他人手里拒掉？`,
    options: [
      `按运行。`,
      `按身份。`,
      `共享队列上按租户的准入控制。`,
      `按工具。`,
    ],
    answer: 2,
    explain: `按运行和按身份的预算约束的是消耗量，不是队列占用。一个还在花费上限之内的租户照样能把队列塞满、饿死
      其他所有人。在租户这一级做准入控制，无论是预留容量还是公平排队，才是保住其他客户服务的东西。这是各团队最后
      才加的那个作用域，通常是在第一次“某个付费客户的智能体因为别人的缘故慢了一星期”的事故之后。`,
  },
  {
    q: `为什么钱包耗尽经常被误诊？`,
    options: [
      `它不产生日志。`,
      `它什么都不偷，所以浮出水面时是一张让人吃惊的账单或一条慢队列，然后被归因为容量而不是攻击。`,
      `它只影响小规模部署。`,
      `攻击流量是加密的。`,
    ],
    answer: 1,
    explain: `没有入侵，没有数据外泄，也没有明显的受害者——只有成本。症状和有机增长或者性能回退看起来一模一样，
      于是调查转给了基础设施团队，并在有人加了容量之后停下。要让这个诊断成为可能，你的遥测里得有按身份的成本归因，
      而那恰好就是那些预算本来也需要的同一套埋点。`,
  },
];

export const refs = [
  { authors: 'Authors of "Beyond Max Tokens"', title: 'Beyond Max Tokens: Stealthy Resource Amplification via Tool Calling Chains in LLM Agents',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.10955',
    note: '通过一个兼容 MCP 的工具服务器实现最高 658× 的成本膨胀' },
  { authors: 'Authors of CODE', title: 'CODE: A Contradiction-Based Deliberation Extension Framework for Overthinking Attacks on Retrieval-Augmented Generation',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.13112' },
  { authors: 'Authors of DRAINCODE', title: 'DRAINCODE: Stealthy Energy Consumption Attacks on Retrieval-Augmented Code Generation via Context Poisoning',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.20615' },
  { authors: 'Authors of SHIELD', title: 'SHIELD: An Auto-Healing Agentic Defense Framework for LLM Resource Exhaustion Attacks',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.19174' },
  { authors: 'OWASP Top 10 for LLM Applications team', title: 'LLM10:2025 Unbounded Consumption',
    venue: 'OWASP, 2025', url: 'https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: '算力滥用 13 个来源；速率限制被 9 个来源推荐' },
];
