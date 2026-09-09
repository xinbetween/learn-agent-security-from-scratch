registerSim('a16budget', function (el) {
  var PRICE = 0.003 / 1000;   // $ per token
  var atk = el.querySelector('#a16-atk'), o = el.querySelector('#a16-out');
  var st = el.querySelector('#a16-steps'), cs = el.querySelector('#a16-cost'), sz = el.querySelector('#a16-size');
  simUtil.live(el, 'a16-steps'); simUtil.live(el, 'a16-cost', function (v) { return v + '¢'; });

  function tokensFor(mode, step, capped) {
    if (mode === 'normal') return step === 1 ? 1200 : 0;
    if (mode === 'recursive') return 1500 * step;
    if (mode === 'mcp') { var t = 800 * Math.pow(1.6, step); return capped ? Math.min(t, 4000) : t; }
    if (mode === 'fanout') return 2000;
    return 0;
  }

  function render() {
    var mode = atk.value, maxSteps = +st.value, maxCost = +cs.value / 100, capped = sz.checked;
    var total = 0, halted = null, step = 0, rows = [];
    var maxIter = mode === 'fanout' ? 500 : 60;

    for (step = 1; step <= maxIter; step++) {
      var t = tokensFor(mode, step, capped);
      total += t;
      var cost = total * PRICE;
      if (step > maxSteps) { halted = ['最大步数', step + ' > ' + maxSteps]; break; }
      if (cost > maxCost) { halted = ['最大花费', '$' + cost.toFixed(2) + ' > $' + maxCost.toFixed(2)]; break; }
      if (step <= 6 || step === maxSteps) rows.push([step, t, total, cost]);
      if (mode === 'normal' && step >= 1) { step++; break; }
    }

    var h = '<span class="dim">步骤        令牌           累计       花费</span>\n';
    rows.forEach(function (r) {
      h += '  ' + String(r[0]).padStart(3) + '  ' + Math.round(r[1]).toLocaleString().padStart(9) +
        '  ' + Math.round(r[2]).toLocaleString().padStart(13) + '  $' + r[3].toFixed(3).padStart(8) + '\n';
    });
    if (step > 7 && !halted) h += '  <span class="dim">…</span>\n';

    h += '\n  <span class="dim">结果</span>     ';
    if (halted) h += '<span class="ok">被' + halted[0] + '中止</span>：' + halted[1] + '，发生在第 ' + step + ' 步';
    else h += (mode === 'normal' ? '<span class="ok">正常完成</span>' : '<span class="bad">一路跑到底 —— $' + (total * PRICE).toFixed(2) + '</span>');

    h += '\n  <span class="dim">花费</span>     $' + (total * PRICE).toFixed(3) + '，本次运行';
    if (mode !== 'normal') h += '  <span class="dim">× 无限并发运行，只要没有按身份的上限</span>';

    if (mode === 'mcp' && !capped)
      h += '\n\n  <span class="bad">每一条响应单独看都很合理。</span>每轮 1.6× 的增长在任何单条消息里都\n  看不见；轨迹才是攻击。步数预算能拦住它，但拦得很晚，账单已经跑掉大半。';
    if (mode === 'mcp' && capped)
      h += '\n\n  <span class="ok">返回大小上限框住的是每轮的增量</span>，而不只是总量——所以它在损害\n  发生之前就把这个攻击拦下了。';
    if (mode === 'fanout')
      h += '\n\n  <span class="dim">扇出被步数预算框住了，但请注意这个请求是合法的：“把这些条目逐个调研\n  一遍”是用户真的会提的要求。预算必须定在不破坏真实工作的位置上，而这才是\n  难的部分。</span>';
    if (mode === 'recursive')
      h += '\n\n  <span class="dim">上下文每轮重读一次：成本随步数呈平方增长。步数预算是这里的有效控制，\n  也是大多数团队唯一有的那一个。</span>';
    o.innerHTML = h;
  }
  simUtil.bind(el, render);
});
