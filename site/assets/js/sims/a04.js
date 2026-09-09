registerSim('a04map', function (el) {
  var T = [
    ['Direct',    60, 25, 35, [['direct prompt injection',52,'a06'],['disallowed use',19,'a06'],['direct multimodal attack',2,'a08']]],
    ['Indirect',  55, 20, 35, [['IAM failures',30,'a22'],['tool attacks',27,'a11'],['indirect prompt injection',20,'a07'],['knowledge-base attacks',15,'a12'],['internal agent attacks',15,'a15']]],
    ['Internal',  62, 31, 31, [['foundation model vulnerabilities',34,'a04'],['tool misuse',17,'a10'],['data poisoning',14,'a14'],['reasoning/planning failures',10,'a16'],['deception and evasion',10,'a19'],['model backdoors',9,'a14']]],
    ['Resource',  29, 13, 16, [['compute misuse',13,'a16'],['cyber compromise',12,'a23'],['supply chain attacks',9,'a13'],['physical compromise',4,'a08']]],
    ['Oversight', 19, 10,  9, [['explainability failures',9,'a24'],['monitoring failures',9,'a26'],['human-in-the-loop failures',8,'a24']]],
    ['Compound',  24, 13, 11, [['cascading failures',14,'a15'],['adverse multi-agent dynamics',13,'a15'],['system-level failures',5,'a15']]]
  ];
  var v = el.querySelector('#a04-view'), o = el.querySelector('#a04-out');
  function bar(n, max, w) { var k = Math.max(1, Math.round(n / max * w)); return '█'.repeat(k); }

  function render() {
    var mode = v.value, h = '';
    if (mode === 'count') {
      h += '<span class="dim">class                                 sources of 173</span>\n\n';
      T.forEach(function (s) {
        h += '<span class="hl">' + s[0] + ' threats</span> <span class="dim">(n=' + s[1] + ')</span>\n';
        s[4].forEach(function (c) {
          h += '  ' + simUtil.esc(c[0]).padEnd(34) + String(c[1]).padStart(3) + '  <span class="bad">' + bar(c[1], 34, 26) + '</span>\n';
        });
        h += '\n';
      });
    } else if (mode === 'split') {
      h += '<span class="dim">surface        academic  industry   leans</span>\n\n';
      T.forEach(function (s) {
        var lean = s[2] > s[3] * 1.15 ? '<span class="bnd">academia</span>' : s[3] > s[2] * 1.15 ? '<span class="hl">industry</span>' : '<span class="dim">balanced</span>';
        h += '  ' + s[0].padEnd(12) + String(s[2]).padStart(6) + String(s[3]).padStart(10) + '   ' + lean + '\n';
        h += '    ' + '<span class="bnd">' + bar(s[2], 35, 22) + '</span>\n';
        h += '    ' + '<span class="hl">' + bar(s[3], 35, 22) + '</span>\n\n';
      });
      h += '<span class="dim">Read only academic sources and you underweight IAM, tools and supply chain.\nRead only vendor guidance and you underweight backdoors and evaluation gaming.</span>';
    } else {
      h += '<span class="dim">class                                 covered in</span>\n\n';
      T.forEach(function (s) {
        s[4].forEach(function (c) {
          h += '  ' + simUtil.esc(c[0]).padEnd(36) + '<span class="hl">' + c[2].toUpperCase() + '</span>\n';
        });
      });
      h += '\n<span class="dim">Every class in the taxonomy has a chapter. That is the design constraint\nthis curriculum was built under.</span>';
    }
    o.innerHTML = h;
  }
  v.onchange = render; render();
});
