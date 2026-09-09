registerSim('a23egress', function (el) {
  var TESTS = [
    ['https://api.internal.corp/v1/write', null, '正常的合法情况', true],
    ['https://evil.example/p.png?d=sk_live', null, '直白的数据外泄', false],
    ['https://api.internal.corp.evil.example/x', null, '后缀花招', false],
    ['https://api.internal.corp@evil.example/x', null, 'userinfo 花招', false],
    ['http://169.254.169.254/latest/meta-data/', null, '云元数据服务', false],
    ['https://api.internal.corp/x', '169.254.169.254', 'DNS 重绑定', false],
    ['file:///etc/passwd', null, 'scheme 混淆', false],
    ['gopher://evil.example:6379/_SET', null, '协议走私', false]
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
        (bad ? '  <span class="bad">← 判错了</span>' : '') + '\n';
    });
    h += '\n  <span class="dim">判错的次数</span>  ' + (wrong ? '<span class="bad">' + wrong + '/' + TESTS.length + '</span>' : '<span class="ok">0/' + TESTS.length + '</span>') + '\n';
    var NOTE = {
      substr: '\n  <span class="bad">"允许的主机名有没有出现在这串字符里"根本不是要问的\n  问题。</span>后缀花招和 userinfo 花招，任何拥有一个域名的人都能用。',
      regex: '\n  <span class="hl">好一些了，而 userinfo 花招照样过得去，</span>因为前缀在 @ 之前\n  就匹配上了。正则对上 URL 语法，一次又一次地输。',
      parsed: '\n  <span class="ok">按 hostname 相等比较堵住了主机名花招。</span>还没堵上的是：非 HTTP 的\n  scheme，以及把一个被允许的名字指向内网地址的 DNS 重绑定。',
      full: '\n  <span class="ok">八个全对。</span>解析，检查 scheme，按相等比较 hostname，解析出地址\n  再检查。然后把它强制在智能体所在层级之下——智能体能跳过的检查只是文档。'
    };
    h += NOTE[mode];
    o.innerHTML = h;
  }
  impl.onchange = render; render();
});
