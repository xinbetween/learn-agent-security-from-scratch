registerSim('a01loop', function (el) {
  var SC = {
    research: {
      goal: '总结 RFC 9110 规范里关于幂等方法的说法。',
      steps: [
        ['assistant', '我先去搜一下规范原文。', 0],
        ['tool', 'web_search("RFC 9110 idempotent") → 4 条结果，620 tokens 的页面文本', 1],
        ['assistant', '抓取最相关的那条结果。', 0],
        ['tool', 'web_fetch("httpwg.org/specs/rfc9110") → 3,100 tokens 的 HTML 提取文本', 1],
        ['assistant', 'GET、HEAD、PUT 和 DELETE 是幂等的。现在作答。', 0]
      ]
    },
    inbox: {
      goal: '整理我的未读邮件，给所有紧急的起草回复。',
      steps: [
        ['assistant', '列出未读消息。', 0],
        ['tool', 'list_mail() → 3 封邮件，180 tokens 的主题和发件人', 1],
        ['assistant', '逐封读取。', 0],
        ['tool', 'read_mail(1) → 740 tokens，发件人：vendor@example.com', 1],
        ['tool', 'read_mail(2) → 1,220 tokens，发件人：unknown@mailer.example', 1],
        ['tool', 'read_mail(3) → 460 tokens，发件人：colleague@corp', 1],
        ['assistant', '有两封需要回复，开始起草。', 0]
      ]
    },
    code: {
      goal: '修好 payments 模块里失败的那个测试，并开一个 PR。',
      steps: [
        ['assistant', '读取失败的测试。', 0],
        ['tool', 'read_file("tests/test_payments.py") → 900 tokens', 1],
        ['tool', 'read_file("src/payments.py") → 2,400 tokens', 1],
        ['assistant', '看一下关联的 issue 补背景。', 0],
        ['tool', 'gh_issue(412) → 1,100 tokens，正文由外部贡献者撰写', 1],
        ['tool', 'read_file("node_modules/x/README.md") → 3,300 tokens，第三方', 1],
        ['assistant', '补丁写好了，开 PR。', 0]
      ]
    }
  };
  var TOK = { assistant: 60, system: 340 };
  var i = 0, scn = 'research';
  var o = el.querySelector('#a01-out'), meter = el.querySelector('#a01-meter i'),
      ratio = el.querySelector('#a01-ratio'), sel = el.querySelector('#a01-scn');

  function tokensOf(line) {
    var m = /([\d,]+) tokens/.exec(line[1]);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : TOK.assistant;
  }

  function render() {
    var s = SC[scn], html = '', trusted = TOK.system, tainted = 0;
    html += '<span class="dim">[0] 系统  </span>' + TOK.system + ' tok  <span class="ok">可信</span> — 开发者 prompt + 工具 schema\n';
    html += '<span class="dim">[1] 用户  </span>' + 40 + ' tok  <span class="ok">可信</span> — “' + s.goal + '”\n';
    trusted += 40;
    for (var k = 0; k < i; k++) {
      var line = s.steps[k], t = tokensOf(line);
      if (line[2]) { tainted += t; } else { trusted += t; }
      html += '<span class="dim">[' + (k + 2) + '] ' + (line[0] === 'tool' ? '工具  ' : '模型  ') + '</span>' +
        String(t).padStart(5) + ' tok  ' +
        (line[2] ? '<span class="bad">已污染</span>' : '<span class="ok">可信</span>') +
        ' — ' + simUtil.esc(line[1]) + '\n';
    }
    if (i >= s.steps.length) html += '\n<span class="hl">跑完了。</span>产出最终回答的那个上下文里，有 ' +
      Math.round(100 * tainted / (tainted + trusted)) + '% 的字节是攻击者可影响的。\n';
    o.innerHTML = html;
    var pct = Math.round(100 * tainted / (tainted + trusted));
    meter.style.width = pct + '%';
    meter.parentNode.className = 'meter' + (pct > 50 ? ' danger' : '');
    ratio.innerHTML = '已污染 ' + tainted.toLocaleString() + ' / 总计 ' + (tainted + trusted).toLocaleString() +
      ' tokens —— prompt 中有 <b>' + pct + '%</b> 落在信任边界之外' +
      (pct > 50 ? ' <span class="pill attack">污染已过半</span>' : '');
  }

  el.querySelector('#a01-step').onclick = function () { if (i < SC[scn].steps.length) i++; render(); };
  el.querySelector('#a01-run').onclick = function () { i = SC[scn].steps.length; render(); };
  el.querySelector('#a01-reset').onclick = function () { i = 0; render(); };
  sel.onchange = function () { scn = sel.value; i = 0; render(); };
  render();
});
