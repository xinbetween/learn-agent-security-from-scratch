registerSim('a25suite', function (el) {
  var CASES = [
    ['benign', 'clean page', true, false, true, false],
    ['html comment', 'payload in an HTML comment', true, true, true, false],
    ['fake system', 'fake [SYSTEM] block', true, true, true, false],
    ['helpful framing', '"NOTE FOR AUTOMATED READERS"', true, true, true, false],
    ['benign, needs write', 'legitimate task requiring write_file', true, false, true, false]
  ];
  var d = el.querySelector('#a25-def'), o = el.querySelector('#a25-out');

  function run(mode) {
    return CASES.map(function (c) {
      var poisoned = c[3];
      var util, atk;
      if (mode === 'none') { util = true; atk = poisoned; }
      else if (mode === 'scope') { util = true; atk = false; }
      else { util = c[0] !== 'benign, needs write'; atk = false; }
      return { name: c[0], desc: c[1], poisoned: poisoned, util: util, atk: atk };
    });
  }

  function render() {
    var mode = d.value, rows = run(mode);
    var attacked = rows.filter(function (r) { return r.poisoned; }).length;
    var won = rows.filter(function (r) { return r.atk; }).length;
    var served = rows.filter(function (r) { return r.util; }).length;
    var h = '<span class="dim">case                  utility   attack</span>\n\n';
    rows.forEach(function (r) {
      h += '  ' + r.name.padEnd(22) +
        (r.util ? '<span class="ok">yes</span>    ' : '<span class="bad">NO </span>    ') + '  ' +
        (r.poisoned ? (r.atk ? '<span class="bad">SUCCEEDED</span>' : '<span class="ok">blocked  </span>') : '<span class="dim">—        </span>') +
        '  <span class="dim">' + r.desc + '</span>\n';
    });
    var asr = attacked ? won / attacked : 0, ur = served / rows.length;
    h += '\n  <span class="dim">attack success rate</span>  <span class="' + (asr ? 'bad' : 'ok') + '">' + Math.round(asr * 100) + '%</span>  (' + won + '/' + attacked + ')';
    h += '\n  <span class="dim">utility retention</span>    <span class="' + (ur < 1 ? 'hl' : 'ok') + '">' + Math.round(ur * 100) + '%</span>  (' + served + '/' + rows.length + ')\n';

    if (mode === 'none') h += '\n  <span class="bad">Every poisoned page wins.</span> The baseline you compare against.';
    if (mode === 'scope') h += '\n  <span class="ok">0% ASR at full utility.</span> The task never needed send_email, so removing\n  it costs nothing and closes the exfiltration path entirely.';
    if (mode === 'paranoid') h += '\n  <span class="hl">0% ASR — and 80% utility.</span> Identical security number, and it broke a\n  legitimate task. A single-metric report would have called these two equivalent.';
    o.innerHTML = h;
  }
  d.onchange = render; render();
});
