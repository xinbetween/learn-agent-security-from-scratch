registerSim('a26trace', function (el) {
  var TRACE = [
    [1, 'user_request', 'text="总结 https://c.example/g"', '—', 'trusted', '3f9ac1b2'],
    [2, 'tool_call', 'http_get(url="https://c.example/g")', 'user_request', 'trusted', 'b17c4e29'],
    [3, 'tool_result', 'http_get → 3100 bytes, sha=9f2c…', 'tool_call#2', 'untrusted_web', 'd0f3a866'],
    [4, 'tool_call', 'read_file(path=".env")', 'tool_result#3', 'untrusted_web', '4a1e77b3'],
    [5, 'policy_decision', 'send_email → DENY (not in capability set)', 'tool_result#3', 'untrusted_web', 'e92b05cc']
  ];
  var v = el.querySelector('#a26-view'), o = el.querySelector('#a26-out');

  function render() {
    var mode = v.value, h = '';
    if (mode === 'trace') {
      h += '<span class="dim">步骤  类型             动作                                         因果来源        溯源</span>\n';
      TRACE.forEach(function (r) {
        var t = r[4] === 'untrusted_web';
        h += '  ' + String(r[0]).padEnd(5) + r[1].padEnd(17) + simUtil.esc(r[2]).slice(0, 44).padEnd(45) +
          r[3].padEnd(16) + '<span class="' + (t ? 'bad' : 'ok') + '">' + r[4] + '</span>\n';
      });
      h += '\n  <span class="dim">看第 4 步和第 5 步：一次文件读取和一次发信尝试，起因都是从抓回来的页面里\n  进来的内容。这就是全部结论，而它是一次数据库查询，不是一次推断。</span>';
    } else if (mode === 'tamper') {
      h += '<span class="dim">哈希链校验</span>\n\n';
      TRACE.forEach(function (r) { h += '  step ' + r[0] + '  hash ' + r[5] + '  <span class="ok">校验通过</span>\n'; });
      h += '\n<span class="dim">攻击者改掉第 4 步、想抹掉那次 .env 读取之后</span>\n\n';
      TRACE.forEach(function (r) {
        var broken = r[0] >= 4;
        h += '  step ' + r[0] + '  hash ' + r[5] + '  ' + (broken ? '<span class="bad">链已断裂</span>' : '<span class="ok">校验通过</span>') + '\n';
      });
      h += '\n  <span class="ok">悄无声息的改动做不到了。</span>后面每一个哈希都会失效。\n  <span class="dim">注意它防不住什么：截断，或者把整份日志扔掉。\n  所以要及时把记录送出本机。</span>';
    } else if (mode === 'drift') {
      h += '<span class="dim">用户请求所蕴含的工具：</span>  {http_get}\n\n';
      TRACE.filter(function (r) { return r[1] === 'tool_call' || r[1] === 'policy_decision'; }).forEach(function (r) {
        var tool = r[2].split('(')[0].split(' ')[0];
        var flagged = r[4] === 'untrusted_web';
        h += '  step ' + r[0] + '  ' + tool.padEnd(18) +
          (flagged ? '<span class="bad">漂移：不在请求蕴含范围内，起因是 ' + r[3] + '</span>' : '<span class="ok">在蕴含的计划之内</span>') + '\n';
      });
      h += '\n  <span class="ok">两次漂移事件，不用模型，也不用阈值。</span>\n  <span class="dim">更强的那一版（Abdelnabi 等人）读的是不可信内容进入上下文前后的激活值差值，\n  对措辞很鲁棒，但需要白盒访问。</span>';
    } else {
      h += '<span class="dim">100 个会话里的出站目的地</span>\n\n';
      h += '  api.internal.corp        60 个会话   每次约 400 字节  <span class="ok">正常</span>\n';
      h += '  cdn.example              40 个会话   <span class="bad">每次 12 字节</span>    <span class="bad">← 每个会话都有，小得整齐划一</span>\n';
      h += '\n  <span class="dim">逐请求看</span>    往一个 CDN 发了 12 字节。<span class="ok">毫无异常。</span>\n';
      h += '  <span class="dim">汇总看</span>      一个罕见目的地、40 个会话、载荷小得均匀。\n              <span class="bad">这种分布在自然情况下不会出现。</span>\n';
      h += '\n  <span class="dim">这就是 A09 里那条慢速通道。任何逐消息的检测器都看不见它，因为没有哪一条\n  消息里装了足够多的秘密，能让人起疑。顺序上说句老实话：出站允许清单\n  本来可以直接把它挡在门外。</span>';
    }
    o.innerHTML = h;
  }
  v.onchange = render; render();
});
