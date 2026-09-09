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
      if (step > maxSteps) { halted = ['max steps', step + ' > ' + maxSteps]; break; }
      if (cost > maxCost) { halted = ['max spend', '$' + cost.toFixed(2) + ' > $' + maxCost.toFixed(2)]; break; }
      if (step <= 6 || step === maxSteps) rows.push([step, t, total, cost]);
      if (mode === 'normal' && step >= 1) { step++; break; }
    }

    var h = '<span class="dim">step   tokens      cumulative      cost</span>\n';
    rows.forEach(function (r) {
      h += '  ' + String(r[0]).padStart(3) + '  ' + Math.round(r[1]).toLocaleString().padStart(9) +
        '  ' + Math.round(r[2]).toLocaleString().padStart(13) + '  $' + r[3].toFixed(3).padStart(8) + '\n';
    });
    if (step > 7 && !halted) h += '  <span class="dim">…</span>\n';

    h += '\n  <span class="dim">outcome</span>  ';
    if (halted) h += '<span class="ok">HALTED by ' + halted[0] + '</span> — ' + halted[1] + ' at step ' + step;
    else h += (mode === 'normal' ? '<span class="ok">completed normally</span>' : '<span class="bad">ran to completion — $' + (total * PRICE).toFixed(2) + '</span>');

    h += '\n  <span class="dim">spend</span>    $' + (total * PRICE).toFixed(3) + ' this run';
    if (mode !== 'normal') h += '  <span class="dim">× unlimited concurrent runs if there is no per-identity cap</span>';

    if (mode === 'mcp' && !capped)
      h += '\n\n  <span class="bad">Each response is individually reasonable.</span> Growth of 1.6× per round\n  is invisible in any single message; the trajectory is the attack. The step\n  budget stops it late, after most of the bill.';
    if (mode === 'mcp' && capped)
      h += '\n\n  <span class="ok">The result-size cap bounds growth per round</span>, not just the total —\n  which is why it stops this attack early rather than after the damage.';
    if (mode === 'fanout')
      h += '\n\n  <span class="dim">Fan-out is bounded by the step budget, but note the request was legitimate:\n  "research each of these items" is a thing users actually ask. Budgets have to\n  be set where they do not break real work, which is the hard part.</span>';
    if (mode === 'recursive')
      h += '\n\n  <span class="dim">Context re-read each round: cost grows quadratically in steps. The step\n  budget is the effective control here, and it is the one most teams have.</span>';
    o.innerHTML = h;
  }
  simUtil.bind(el, render);
});
