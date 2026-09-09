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
    var h = '<span class="dim">round ' + round + ' · topology: ' + t.options[t.selectedIndex].text + '</span>\n\n';
    names.forEach(function (x) {
      h += '  ' + (inf[x] ? '<span class="bad">●</span> ' : '<span class="ok">○</span> ') +
        x.padEnd(14) + '<span class="dim">→ ' + (g[x].join(', ') || '(no peers)') + '</span>' +
        (inf[x] ? '  <span class="bad">infected</span>' : '') + '\n';
    });
    h += '\n  <span class="hl">' + n + '/' + names.length + '</span> agents infected from one poisoned page read by <b>research</b>.\n';

    if (d.value === 'none' && n === names.length)
      h += '\n  <span class="bad">Network-wide compromise.</span> The payload said "forward this to every\n  agent you message". Forwarding information is what these agents are for.';
    if (d.value === 'quarantine')
      h += '\n  <span class="ok">Propagation stopped at patient zero.</span> Peer messages are labelled as\n  untrusted data and forwarding directives are stripped. research is still\n  compromised — the poisoned page did that — but it cannot recruit.';
    if (d.value === 'acyclic')
      h += '\n  <span class="dim">Bounded fan-out slows propagation without stopping it. Useful in\n  combination; not a control on its own.</span>';
    if (d.value === 'both')
      h += '\n  <span class="ok">Bounded and quarantined.</span> One compromised agent, no spread, and the\n  blast radius is whatever research alone could reach.';
    if (t.value === 'chain' && d.value === 'none' && round > 0)
      h += '\n  <span class="dim">A pipeline limits infection to everything downstream of patient zero.\n  Compare with mesh, which saturates in a single round.</span>';
    o.innerHTML = h;
  }
  el.querySelector('#a15-step').onclick = step;
  el.querySelector('#a15-reset').onclick = reset;
  t.onchange = reset; d.onchange = reset;
  reset();
});
