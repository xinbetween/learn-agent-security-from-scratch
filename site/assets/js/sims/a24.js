registerSim('a24fatigue', function (el) {
  var o = el.querySelector('#a24-out');
  simUtil.live(el, 'a24-n'); simUtil.live(el, 'a24-mal', function (v) { return '#' + v; });
  function attention(n) { return Math.max(0.03, Math.pow(0.82, n - 1)); }

  function render() {
    var n = +el.querySelector('#a24-n').value;
    var mal = Math.min(+el.querySelector('#a24-mal').value, n);
    var h = '<span class="dim">attention over one day of prompts</span>\n\n';
    var marks = [1, Math.max(1, Math.round(n * 0.25)), Math.max(1, Math.round(n / 2)), n];
    marks.forEach(function (i) {
      var a = attention(i);
      var bar = '█'.repeat(Math.max(1, Math.round(a * 34)));
      h += '  prompt #' + String(i).padEnd(5) + (a * 100).toFixed(0).padStart(3) + '%  ' +
        '<span class="' + (a > 0.5 ? 'ok' : a > 0.15 ? 'hl' : 'bad') + '">' + bar + '</span>\n';
    });
    var pa = attention(mal);
    h += '\n  <span class="dim">the malicious prompt arrives at #' + mal + '</span>\n';
    h += '  probability it is actually read   <span class="' + (pa > 0.5 ? 'ok' : pa > 0.15 ? 'hl' : 'bad') + '">' + (pa * 100).toFixed(0) + '%</span>\n';
    h += '\n  <span class="dim">expected outcome</span>  ';
    if (pa > 0.5) h += '<span class="ok">the gate probably works</span>';
    else if (pa > 0.15) h += '<span class="hl">a coin flip you are calling a control</span>';
    else h += '<span class="bad">the gate is a latency cost with a compliance story</span>';

    h += '\n\n';
    if (n > 20) h += '  <span class="bad">At ' + n + ' prompts a day the reviewer is a rubber stamp by mid-morning.</span>\n  Every low-value prompt spent from the same budget as this one.\n';
    else h += '  <span class="ok">At ' + n + ' prompts a day the budget is intact when it matters.</span>\n  This is what "spend it only on irreversible actions" buys you.\n';
    h += '\n  <span class="dim">Try 200 prompts/day with the malicious one at #150 — then try 4 at #3.\n  The defence did not change. The arithmetic around it did.</span>';
    o.innerHTML = h;
  }
  simUtil.bind(el, render);
});
