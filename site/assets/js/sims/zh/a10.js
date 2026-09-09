registerSim('a10deputy', function (el) {
  var R = [
    ['send_email', 'to=team@corp', 'alice', 'alice', ['mail.send'], true],
    ['send_email', 'to=attacker@evil.example', 'alice', '来自 https://blog.example/post 的内容', ['mail.send'], false],
    ['read_file', 'path=.env', 'alice', '来自 https://blog.example/post 的内容', ['fs.read'], false],
    ['delete_repo', 'name=prod', 'alice', '来自 github issue #412 的内容', ['repo.admin'], false],
    ['http_get', 'url=https://docs.internal.corp/spec', 'alice', 'alice', ['net.read'], true]
  ];
  var TASK_SCOPES = ['mail.send', 'net.read'];   // what THIS task was granted
  var c = el.querySelector('#a10-check'), o = el.querySelector('#a10-out');

  function render() {
    var mode = c.value, h = '', wrong = 0;
    h += '<span class="dim">  动作          参数                       判定    原因</span>\n\n';
    R.forEach(function (r) {
      var allow = true, why = '';
      if (mode === 'authn') { allow = true; why = '由 ' + r[2] + ' 签名'; }
      else {
        if (r[3] !== r[2]) { allow = false; why = '由 ' + r[3].slice(0, 34) + ' 引发，溯源不匹配'; }
        else { allow = true; why = '引发者与签名者一致'; }
        if (mode === 'prov_scope' && allow && TASK_SCOPES.indexOf(r[4][0]) === -1) {
          allow = false; why = 'scope ' + r[4][0] + ' 不在本次任务的能力集合里';
        }
      }
      if (allow !== r[5]) wrong++;
      h += '  ' + r[0].padEnd(14) + r[1].padEnd(27) +
        (allow ? '<span class="bad">放行</span>  ' : '<span class="ok">拒绝</span>  ') +
        '  <span class="dim">' + simUtil.esc(why) + '</span>\n';
    });
    h += '\n  <span class="dim">错误判定</span>  ' + (wrong ? '<span class="bad">' + wrong + ' / ' + R.length + '</span>' : '<span class="ok">0 / ' + R.length + '</span>');
    if (mode === 'authn') h += '\n\n  <span class="bad">每个请求都被放行了，其中三个是攻击。</span>\n  你的 IAM 日志显示 alice 在一次会话里、相隔几秒钟做完了这五件事。\n  这里没有任何东西配置错了。能把它们区分开所需的信息，\n  根本不在请求里。';
    if (mode === 'prov') h += '\n\n  <span class="ok">溯源把它们分开了。</span>OAuth 里没有这个字段，HTTP 里没有，\n  任何标准授权层里也没有。A21 通过给值打标签、并让标签跟着每一次\n  派生传播下去，把它构造了出来。';
    if (mode === 'prov_scope') h += '\n\n  <span class="ok">纵深防御。</span>就算溯源追踪被绕过，按任务限定的能力集合里\n  也没有 repo.admin，没有 fs.read，于是三个攻击里有两个在出门时\n  第二次失败。';
    o.innerHTML = h;
  }
  c.onchange = render; render();
});
