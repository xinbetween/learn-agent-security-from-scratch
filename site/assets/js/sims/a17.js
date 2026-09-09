registerSim('a17rate', function (el) {
  var o = el.querySelector('#a17-out');
  simUtil.live(el, 'a17-tpr', function (v) { return v + '%'; });
  simUtil.live(el, 'a17-fpr', function (v) { return (v / 100).toFixed(2) + '%'; });
  simUtil.live(el, 'a17-base', function (v) { return v + ' / 100k'; });

  function render() {
    var N = 1000000;
    var tpr = +el.querySelector('#a17-tpr').value / 100;
    var fpr = +el.querySelector('#a17-fpr').value / 10000;
    var rate = +el.querySelector('#a17-base').value / 100000;
    var attacks = N * rate, benign = N - attacks;
    var tp = attacks * tpr, fn = attacks - tp, fp = benign * fpr;
    var prec = tp + fp ? tp / (tp + fp) : 0;
    var f = function (x) { return Math.round(x).toLocaleString(); };

    var h = '<span class="dim">on 1,000,000 requests per day</span>\n\n';
    h += '  attacks present          ' + f(attacks).padStart(10) + '\n';
    h += '  <span class="ok">caught</span>                   ' + f(tp).padStart(10) + '\n';
    h += '  <span class="bad">MISSED</span>                   ' + f(fn).padStart(10) + '   reach the agent\n';
    h += '  <span class="hl">false alarms</span>             ' + f(fp).padStart(10) + '   a human must triage these\n\n';
    h += '  <span class="dim">precision</span>                ' + (prec * 100).toFixed(2).padStart(9) + '%  of all alerts, this many are real\n';

    var perAnalyst = fp / 8 / 60;  // 8h shift
    h += '  <span class="dim">alerts per analyst-minute</span> ' + perAnalyst.toFixed(1).padStart(8) + '   over an 8-hour shift\n';

    h += '\n';
    if (prec < 0.02) h += '  <span class="bad">An analyst who ignores every alert is right ' + (100 - prec * 100).toFixed(1) + '% of the time.</span>\n  They will learn to. This is alert fatigue arriving as arithmetic.\n';
    else if (prec < 0.3) h += '  <span class="hl">Marginal.</span> Most alerts are noise; expect the queue to be skimmed.\n';
    else h += '  <span class="ok">A queue a human might actually read.</span> Note what it cost in misses.\n';

    if (fn > 0) h += '\n  <span class="dim">The ' + f(fn) + ' missed attacks are the ones your bounding controls\n  have to handle. That is what Part 5 is for.</span>';
    o.innerHTML = h;
  }
  simUtil.bind(el, render);
});
