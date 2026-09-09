registerSim('a15infect', function (el) {
  var TOPO = {
    hier:  { coordinator: ['research', 'writer', 'reviewer'], research: ['writer'], writer: ['reviewer'], reviewer: [] },
    mesh:  { coordinator: ['research', 'writer', 'reviewer'], research: ['coordinator', 'writer', 'reviewer'], writer: ['coordinator', 'research', 'reviewer'], reviewer: ['coordinator', 'research', 'writer'] },
    chain: { coordinator: ['research'], research: ['writer'], writer: ['reviewer'], reviewer: [] },
    star:  { coordinator: ['research', 'writer', 'reviewer'], research: ['coordinator'], writer: ['coordinator'], reviewer: ['coordinator'] }
  };
  var t = el.querySelector('#a15-topo'), d = el.querySelector('#a15-def'), o = el.querySelector('#a15-out');
  var round = 0, inf = {};

  function reset() { round = 0; inf = { research: true }; render(); }

  function step() {
    var g = TOPO[t.value], def = d.value;
    var quarantine = (def === 'quarantine' || def === 'both');
    var acyclic = (def === 'acyclic' || def === 'both');
    round++;
    var next = Object.assign({}, inf);
    Object.keys(g).forEach(function (n) {
      if (!inf[n]) return;
      var peers = g[n];
      if (acyclic) peers = peers.slice(0, 1);          // bounded fan-out, no cycles
      peers.forEach(function (p) {
        if (quarantine) return;                        // directive stripped: no takeover
        next[p] = true;
      });
    });
    inf = next; render();
  }

  function render() {
    var g = TOPO[t.value], names = Object.keys(g);
    var n = names.filter(function (x) { return inf[x]; }).length;
    var h = '<span class="dim">第 ' + round + ' 轮 · 拓扑：' + t.options[t.selectedIndex].text + '</span>\n\n';
    names.forEach(function (x) {
      h += '  ' + (inf[x] ? '<span class="bad">●</span> ' : '<span class="ok">○</span> ') +
        x.padEnd(14) + '<span class="dim">→ ' + (g[x].join(', ') || '（无同伴）') + '</span>' +
        (inf[x] ? '  <span class="bad">已感染</span>' : '') + '\n';
    });
    h += '\n  <span class="hl">' + n + '/' + names.length + '</span> 个智能体已被感染，源头只是 <b>research</b> 读到的一个投毒页面。\n';

    if (d.value === 'none' && n === names.length)
      h += '\n  <span class="bad">全网沦陷。</span>载荷说的是“把这个转发给你发消息的每一个智能体”。\n  而转发信息正是这些智能体存在的意义。';
    if (d.value === 'quarantine')
      h += '\n  <span class="ok">传播止步于零号病人。</span>同伴消息被标记为不可信数据，转发指令被剥掉。\n  research 仍然是被攻陷的——那是投毒页面干的——但它招不到人。';
    if (d.value === 'acyclic')
      h += '\n  <span class="dim">有界扇出会拖慢传播，但拦不住它。适合组合使用，单独用不算一项控制。</span>';
    if (d.value === 'both')
      h += '\n  <span class="ok">既有界，又隔离。</span>一个智能体被攻陷，没有扩散，影响范围就是 research\n  独自能够到的那些东西。';
    if (t.value === 'chain' && d.value === 'none' && round > 0)
      h += '\n  <span class="dim">流水线把感染限制在零号病人的下游。对比网状，它一轮就饱和了。</span>';
    o.innerHTML = h;
  }
  el.querySelector('#a15-step').onclick = step;
  el.querySelector('#a15-reset').onclick = reset;
  t.onchange = reset; d.onchange = reset;
  reset();
});
