registerSim('a09encode', function (el) {
  var S = 'sk_live_51H8xQ2_9fZk';
  var E = [
    ['原文                          ', S],
    ['URL 编码                      ', encodeURIComponent(S)],
    ['base64                        ', btoa(S)],
    ['十六进制                      ', S.split('').map(function (c) { return c.charCodeAt(0).toString(16); }).join('')],
    ['反转                          ', S.split('').reverse().join('')],
    ['每 7 字符一段                 ', S.match(/.{1,7}/g).join('/')],
    ['点号分隔                      ', S.split('').join('.')],
    ['零宽字符穿插                  ', S.split('').join('​')],
    ['逐字拼读                      ', S.split('').map(function (c) { return c === '_' ? 'underscore' : c; }).join(' ')]
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
    h += '<span class="dim">  编码方式                      判定     载荷</span>\n\n';
    E.forEach(function (r) {
      var c = caught(r[1], mode);
      if (!c) missed++;
      h += '  ' + r[0].padEnd(24) +
        (c ? '<span class="ok">被拦截</span>' : '<span class="bad">已逃逸</span>') +
        '   <span class="dim">' + simUtil.esc(r[1].slice(0, 46)) + '</span>\n';
    });
    h += '\n  有 <span class="hl">' + missed + '/' + E.length + '</span> 种编码逃过了这个检测器。\n';

    if (slow.checked) {
      h += '\n<span class="dim">慢速通道：每次会话一个字符</span>\n';
      for (var i = 0; i < 4; i++) {
        var frag = S[i];
        h += '  会话 ' + (i + 1) + '  出站 "…?q=' + frag + '"  ' +
          (caught(frag, mode) ? '<span class="ok">被拦截</span>' : '<span class="bad">已逃逸</span>') + '\n';
      }
      h += '  <span class="dim">… 还有 17 次会话 …</span>\n';
      h += '\n  <span class="bad">没有任何逐条消息的检测器能抓住它。</span>每条消息只带一个字符。\n  要检测它需要跨会话的状态（A26）；要预防它需要一份出站允许清单，\n  它不管你怎么编码，都能直接把这条路堵死。\n';
    }

    if (mode === 'literal') h += '\n  <span class="dim">人人都会先写的那个检测器，也是攻击者一句 base64 就能打败\n  的那个。</span>';
    if (mode === 'entropy') h += '\n  <span class="dim">它能跨编码泛化，同时也会对正常流量里的每一个 UUID、哈希和\n  会话 token 报警。误报的代价才是这里的重点。</span>';
    if (mode === 'pattern') h += '\n  <span class="dim">对一种密钥格式很精确。对下一种密钥、对这一种密钥的任何变换，\n  它都什么也说不出来。</span>';
    if (mode === 'combined') h += '\n  <span class="dim">好一些了，但仍然是在一个无穷空间上做内容检查。\n  对比一下出站允许清单：它什么内容都不用检查。</span>';
    o.innerHTML = h;
  }
  det.onchange = render; slow.onchange = render; render();
});
