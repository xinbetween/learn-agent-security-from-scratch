registerSim('a24fatigue', function (el) {
  var o = el.querySelector('#a24-out');
  simUtil.live(el, 'a24-n'); simUtil.live(el, 'a24-mal', function (v) { return '#' + v; });
  function attention(n) { return Math.max(0.03, Math.pow(0.82, n - 1)); }

  function render() {
    var n = +el.querySelector('#a24-n').value;
    var mal = Math.min(+el.querySelector('#a24-mal').value, n);
    var h = '<span class="dim">一天的确认弹窗里，注意力如何衰减</span>\n\n';
    var marks = [1, Math.max(1, Math.round(n * 0.25)), Math.max(1, Math.round(n / 2)), n];
    marks.forEach(function (i) {
      var a = attention(i);
      var bar = '█'.repeat(Math.max(1, Math.round(a * 34)));
      h += '  第 ' + String(i).padEnd(5) + (a * 100).toFixed(0).padStart(3) + '%  ' +
        '<span class="' + (a > 0.5 ? 'ok' : a > 0.15 ? 'hl' : 'bad') + '">' + bar + '</span>\n';
    });
    var pa = attention(mal);
    h += '\n  <span class="dim">恶意请求出现在第 ' + mal + ' 个弹窗</span>\n';
    h += '  它真的被看进去的概率   <span class="' + (pa > 0.5 ? 'ok' : pa > 0.15 ? 'hl' : 'bad') + '">' + (pa * 100).toFixed(0) + '%</span>\n';
    h += '\n  <span class="dim">预期结果</span>  ';
    if (pa > 0.5) h += '<span class="ok">这道闸门大概率是有效的</span>';
    else if (pa > 0.15) h += '<span class="hl">一次抛硬币，而你把它叫作一项控制</span>';
    else h += '<span class="bad">这道闸门只是一份带合规说辞的延迟成本</span>';

    h += '\n\n';
    if (n > 20) h += '  <span class="bad">每天 ' + n + ' 个弹窗，审批的人在上午过半时就已经变成橡皮图章。</span>\n  每一个低价值弹窗，花的都是和这一个同一份预算。\n';
    else h += '  <span class="ok">每天 ' + n + ' 个弹窗，真正要紧的时候预算还在。</span>\n  这就是“只把它花在不可逆操作上”换来的东西。\n';
    h += '\n  <span class="dim">试试每天 200 个、恶意的那个排在第 150——再试试一共 4 个、恶意的排第 3。\n  防御本身没有变，变的是它周围的算术。</span>';
    o.innerHTML = h;
  }
  simUtil.bind(el, render);
});
