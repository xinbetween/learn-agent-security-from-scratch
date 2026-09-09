registerSim('a23egress', function (el) {
  var TESTS = [
    ['https://api.internal.corp/v1/write', null, 'the legitimate case', true],
    ['https://evil.example/p.png?d=sk_live', null, 'plain exfiltration', false],
    ['https://api.internal.corp.evil.example/x', null, 'suffix trick', false],
    ['https://api.internal.corp@evil.example/x', null, 'userinfo trick', false],
    ['http://169.254.169.254/latest/meta-data/', null, 'cloud metadata service', false],
    ['https://api.internal.corp/x', '169.254.169.254', 'DNS rebinding', false],
    ['file:///etc/passwd', null, 'scheme confusion', false],
    ['gopher://evil.example:6379/_SET', null, 'protocol smuggling', false]
  ];
  var ALLOWED = ['api.internal.corp', 'docs.internal.corp'];
  var impl = el.querySelector('#a23-impl'), o = el.querySelector('#a23-out');

  function check(url, ip, mode) {
    if (mode === 'substr') return ALLOWED.some(function (h) { return url.indexOf(h) !== -1; });
    if (mode === 'regex') return /^https?:\/\/(api|docs)\.internal\.corp/.test(url);
    var a;
    try { a = new URL(url); } catch (e) { return false; }
    if (mode !== 'substr' && mode !== 'regex') {
      if (mode === 'full' && ['http:', 'https:'].indexOf(a.protocol) === -1) return false;
      if (a.hostname !== '' && ALLOWED.indexOf(a.hostname) === -1) return false;
      if (mode === 'full' && ip && /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)) return false;
      return true;
    }
    return false;
  }

  function render() {
    var mode = impl.value, wrong = 0, h = '';
    TESTS.forEach(function (t) {
      var got = check(t[0], t[1], mode), want = t[3];
      var bad = got !== want;
      if (bad) wrong++;
      h += '  ' + (got ? '<span class="' + (want ? 'ok' : 'bad') + '">ALLOW</span>' : '<span class="' + (want ? 'bad' : 'ok') + '">DENY </span>') +
        '  ' + simUtil.esc(t[0]).padEnd(46) + '<span class="dim">' + t[2] + '</span>' +
        (bad ? '  <span class="bad">← WRONG</span>' : '') + '\n';
    });
    h += '\n  <span class="dim">incorrect decisions</span>  ' + (wrong ? '<span class="bad">' + wrong + '/' + TESTS.length + '</span>' : '<span class="ok">0/' + TESTS.length + '</span>') + '\n';
    var NOTE = {
      substr: '\n  <span class="bad">"Does the allowed host appear anywhere in this string" is not the\n  question.</span> Both the suffix and the userinfo tricks are available to\n  anyone who owns a domain.',
      regex: '\n  <span class="hl">Better — and the userinfo trick still passes,</span> because the prefix\n  matches before the @. Regexes over URLs keep losing to the URL grammar.',
      parsed: '\n  <span class="ok">Host equality closes the host tricks.</span> Still open: non-HTTP schemes,\n  and DNS rebinding pointing an allowed name at an internal address.',
      full: '\n  <span class="ok">All eight correct.</span> Parse, check the scheme, compare the hostname for\n  equality, resolve and check the address. Then enforce it below the agent —\n  a check the agent can skip is documentation.'
    };
    h += NOTE[mode];
    o.innerHTML = h;
  }
  impl.onchange = render; render();
});
