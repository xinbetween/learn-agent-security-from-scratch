registerSim('a27risk', function (el) {
  var A = {
    kb: {
      threat: '知识库攻击（记忆 / RAG 投毒）',
      components: ['知识库', '记忆存储', '检索路径'],
      controls: [
        ['资源控制：加密、隐私、记忆控制', 'thin'],
        ['供应链风险管理（语料溯源）', 'ok'],
        ['使用限制（谁可以往语料里写）', 'ok'],
        ['对抗训练（对被投毒检索结果的鲁棒性）', 'ok'],
        ['环境控制 + 限流（把一次劫持圈住）', 'ok'],
        ['运行时控制 / 人工确认（拦掉外泄那一步）', 'ok']
      ],
      gap: '记忆控制和隐私控制，属于文献里被引用得最少的类别，而这个脆弱点本身却被大量\n  引用。这种错位就是结论：现成的指导并不存在，只能你自己设计。预算要留够，\n  而且可以假定你的同行也跳过了它。'
    },
    dos: {
      threat: '拒绝服务 / 耗尽钱包',
      components: ['编排循环', '工具层', '共享队列'],
      controls: [
        ['限流（按运行、按身份、按工具、按租户）', 'ok'],
        ['针对异常用量的监控', 'thin'],
        ['针对资源攻击的红队演练', 'thin'],
        ['事件响应（处置正在进行的攻击）', 'ok']
      ],
      gap: '文献里关于监控和红队演练的建议，针对的是智能体的行为，而不是网络威胁，而可\n  操作的指导几乎全部来自业界资料。经典的 DoS 防御已经很成熟；把它落到智能体\n  上的那部分，你在任何地方都找不到可以引用的写法。'
    }
  };
  var s = el.querySelector('#a27-threat'), o = el.querySelector('#a27-out');
  function render() {
    var a = A[s.value];
    var h = '  <span class="dim">威胁</span>      ' + a.threat + '\n';
    h += '  <span class="dim">组件</span>      ' + a.components.join('、') + '\n\n';
    h += '  <span class="dim">控制</span>\n';
    a.controls.forEach(function (c) {
      h += '     ' + (c[1] === 'thin' ? '<span class="bad">▲</span>' : '<span class="ok">·</span>') + ' ' + simUtil.esc(c[0]) + '\n';
    });
    h += '\n  <span class="bad">缺口</span>\n  ' + simUtil.esc(a.gap) + '\n';
    h += '\n  <span class="dim">▲ = 文献几乎没覆盖的控制类别。那些是你得自己设计的，也很可能是竞争对手\n  同样跳过了的。</span>';
    o.innerHTML = h;
  }
  s.onchange = render; render();
});
