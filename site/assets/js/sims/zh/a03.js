registerSim('a03trifecta', function (el) {
  var CFG = {
    coding: ['~/.ssh、.env，以及整个源码树', 'issue 文本、PR 正文、依赖的 README、代码注释', 'git push、安装依赖、测试里的 curl'],
    inbox:  ['整个邮箱和每一个附件', '任何陌生人发给你的任何邮件', 'send_email，以及用户将要发出的那封草稿'],
    browse: ['你已登录的每一个站点', '它访问过的每一个页面', '表单提交、页面跳转、图片请求'],
    wiki:   ['内部文档', '任何员工都能编辑的 wiki 页面', '人会读到并据此行动的答案文本'],
    support:['', '客户发来的消息', '它给出的回复'],
    report: ['生产数据库', '', '发给某个硬编码收件人的邮件']
  };
  var LOSS = [
    '智能体再也读不到任何敏感数据。代价：它无法回答任何与你的数据有关的问题。',
    '智能体只会看到第一方的、外人改不了的输入。代价：它读不了网页、读不了你的邮件，也读不了任何同事能编辑的东西。',
    '智能体产出的任何东西都到不了第三方。代价：不能发送、不能发布、不能抓取，而且输出必须先经人复核才能据此行动。'
  ];
  var cut = [false, false, false];
  var sel = el.querySelector('#a03-cfg'), o = el.querySelector('#a03-out');
  var btns = [el.querySelector('#a03-t0'), el.querySelector('#a03-t1'), el.querySelector('#a03-t2')];
  var NAMES = ['私有数据', '不可信内容', '对外通信'];

  // CJK glyphs occupy two monospace cells, so pad by display width, not by
  // character count, or the columns drift apart.
  var WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/;
  function width(s) { var n = 0; for (var i = 0; i < s.length; i++) n += WIDE.test(s[i]) ? 2 : 1; return n; }
  function pad(s, n) { var r = s; while (width(r) < n) r += ' '; return r; }

  function render() {
    var c = CFG[sel.value], html = '', legs = 0;
    for (var i = 0; i < 3; i++) {
      var present = !!c[i] && !cut[i];
      if (present) legs++;
      btns[i].style.opacity = cut[i] ? '.45' : '1';
      btns[i].textContent = (cut[i] ? '✕ ' : '') + NAMES[i];
      html += '  <span class="dim">' + pad(NAMES[i], 24) + '</span>' +
        (present ? '<span class="bad">' + pad('存在', 9) + '</span>' + simUtil.esc(c[i])
                 : '<span class="ok">' + pad('不存在', 9) + '</span>' + (c[i] ? '<span class="dim">已切断——' + simUtil.esc(LOSS[i]) + '</span>' : '<span class="dim">这个设计里本来就没有这条腿</span>')) + '\n';
    }
    html += '\n  ' + (legs === 3
      ? '<span class="bad">可利用——三条腿齐全。</span>网页上的一句话就能够到你的机密。'
      : '<span class="ok">' + legs + '/3 条腿。</span>不存在端到端的数据窃取路径。破坏性风险和拒绝服务风险是另一个维度（A01、A16）。');
    o.innerHTML = html;
  }
  btns.forEach(function (b, i) { b.onclick = function () { cut[i] = !cut[i]; render(); }; });
  sel.onchange = function () { cut = [false, false, false]; render(); };
  render();
});
