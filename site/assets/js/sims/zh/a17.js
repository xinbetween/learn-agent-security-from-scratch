registerSim('a17rate', function (el) {
  var o = el.querySelector('#a17-out');
  simUtil.live(el, 'a17-tpr', function (v) { return v + '%'; });
  simUtil.live(el, 'a17-fpr', function (v) { return (v / 100).toFixed(2) + '%'; });
  simUtil.live(el, 'a17-base', function (v) { return v + ' / 10 万'; });

  function render() {
    var N = 1000000;
    var tpr = +el.querySelector('#a17-tpr').value / 100;
    var fpr = +el.querySelector('#a17-fpr').value / 10000;
    var rate = +el.querySelector('#a17-base').value / 100000;
    var attacks = N * rate, benign = N - attacks;
    var tp = attacks * tpr, fn = attacks - tp, fp = benign * fpr;
    var prec = tp + fp ? tp / (tp + fp) : 0;
    var f = function (x) { return Math.round(x).toLocaleString(); };

    var h = '<span class="dim">按每天 1,000,000 次请求计</span>\n\n';
    h += '  实际攻击数             ' + f(attacks).padStart(10) + '\n';
    h += '  <span class="ok">已捕获</span>                   ' + f(tp).padStart(10) + '\n';
    h += '  <span class="bad">已漏掉</span>                   ' + f(fn).padStart(10) + '   到达智能体\n';
    h += '  <span class="hl">误报</span>                     ' + f(fp).padStart(10) + '   得有人来分诊\n\n';
    h += '  <span class="dim">精确率</span>                   ' + (prec * 100).toFixed(2).padStart(9) + '%  所有告警里，这么多是真的\n';

    var perAnalyst = fp / 8 / 60;  // 8h shift
    h += '  <span class="dim">每人每分钟告警数</span>          ' + perAnalyst.toFixed(1).padStart(8) + '   按 8 小时一班计\n';

    h += '\n';
    if (prec < 0.02) h += '  <span class="bad">一个对所有告警一概不理的分析师，有 ' + (100 - prec * 100).toFixed(1) + '% 的时候是对的。</span>\n  他会学会这么做的。这就是告警疲劳以算术的形式到来。\n';
    else if (prec < 0.3) h += '  <span class="hl">勉强。</span> 大部分告警是噪声；预期这个队列只会被扫一眼。\n';
    else h += '  <span class="ok">这才是人可能真去看的队列。</span> 但注意它在漏报上付出了什么代价。\n';

    if (fn > 0) h += '\n  <span class="dim">漏掉的这 ' + f(fn) + ' 次攻击，得由你那些划定上界的控制来接住。\n  第 5 部分讲的就是这个。</span>';
    o.innerHTML = h;
  }
  simUtil.bind(el, render);
});
