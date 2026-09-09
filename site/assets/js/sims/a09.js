registerSim('a09encode', function (el) {
  var S = 'sk_live_51H8xQ2_9fZk';
  var E = [
    ['plain', S],
    ['url-encoded', encodeURIComponent(S)],
    ['base64', btoa(S)],
    ['hex', S.split('').map(function (c) { return c.charCodeAt(0).toString(16); }).join('')],
    ['reversed', S.split('').reverse().join('')],
    ['split /7', S.match(/.{1,7}/g).join('/')],
    ['dot-separated', S.split('').join('.')],
    ['zero-width interleaved', S.split('').join('​')],
    ['spelled out', S.split('').map(function (c) { return c === '_' ? 'underscore' : c; }).join(' ')]
  ];
  var det = el.querySelector('#a09-det'), slow = el.querySelector('#a09-slow'), o = el.querySelector('#a09-out');

  function entropy(s) {
    var f = {}, n = s.length; if (!n) return 0;
    for (var i = 0; i < n; i++) f[s[i]] = (f[s[i]] || 0) + 1;
    return -Object.keys(f).reduce(function (a, k) { var p = f[k] / n; return a + p * Math.log2(p); }, 0);
  }
  function caught(text, mode) {
    var lit = text.indexOf(S) !== -1;
    var ent = entropy(text) > 3.6 && text.replace(/\s/g, '').length > 14;
    var pat = /sk_live_[A-Za-z0-9]{6,}/.test(text);
    if (mode === 'literal') return lit;
    if (mode === 'entropy') return ent;
    if (mode === 'pattern') return pat;
    return lit || ent || pat;
  }

  function render() {
    var mode = det.value, missed = 0, h = '';
    h += '<span class="dim">encoding                 verdict   payload</span>\n\n';
    E.forEach(function (r) {
      var c = caught(r[1], mode);
      if (!c) missed++;
      h += '  ' + r[0].padEnd(24) +
        (c ? '<span class="ok">caught </span>' : '<span class="bad">ESCAPES</span>') +
        '   <span class="dim">' + simUtil.esc(r[1].slice(0, 46)) + '</span>\n';
    });
    h += '\n  <span class="hl">' + missed + '/' + E.length + '</span> encodings escape this detector.\n';

    if (slow.checked) {
      h += '\n<span class="dim">slow channel — one character per session</span>\n';
      for (var i = 0; i < 4; i++) {
        var frag = S[i];
        h += '  session ' + (i + 1) + '  outbound "…?q=' + frag + '"  ' +
          (caught(frag, mode) ? '<span class="ok">caught</span>' : '<span class="bad">ESCAPES</span>') + '\n';
      }
      h += '  <span class="dim">… 17 more sessions …</span>\n';
      h += '\n  <span class="bad">No per-message detector can catch this.</span> Each message carries one\n  character. Detection needs state across sessions (A26); prevention needs\n  an egress allow-list, which stops it outright regardless of encoding.\n';
    }

    if (mode === 'literal') h += '\n  <span class="dim">The detector everybody writes first, and the one an attacker defeats\n  with a single call to base64.</span>';
    if (mode === 'entropy') h += '\n  <span class="dim">Generalises across encodings, and fires on every UUID, hash and\n  session token in normal traffic. The false-positive cost is the story.</span>';
    if (mode === 'pattern') h += '\n  <span class="dim">Precise for one key format. Says nothing about the next secret, or\n  about any transformation of this one.</span>';
    if (mode === 'combined') h += '\n  <span class="dim">Better — and still content inspection over an unbounded space.\n  Compare against an egress allow-list, which does not inspect anything.</span>';
    o.innerHTML = h;
  }
  det.onchange = render; slow.onchange = render; render();
});
