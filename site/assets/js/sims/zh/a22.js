registerSim('a22token', function (el) {
  var TOK = {
    user: { name: 'alice 的 token', scopes: ['mail.send', 'mail.read', 'drive.read', 'drive.write', 'repo.admin'],
            resources: ['*'], ttl: 30 * 86400, chain: 'alice', ttlLabel: '30 天' },
    task: { name: '任务 token', scopes: ['drive.read'], resources: ['drive://projects/q3-research'],
            ttl: 600, chain: 'alice → research-agent', ttlLabel: '10 分钟' },
    sub:  { name: '子智能体 token', scopes: ['drive.read'], resources: ['drive://projects/q3-research'],
            ttl: 120, chain: 'alice → research-agent → summariser-subagent', ttlLabel: '2 分钟' }
  };
  var ATTEMPTS = [
    ['mail.send', 'mail://any', '通过邮件外泄数据'],
    ['drive.read', 'drive://finance/salaries.xlsx', '读一份无关的文档'],
    ['repo.admin', 'repo://prod', '删掉生产环境仓库'],
    ['drive.read', 'drive://projects/q3-research', '真正要做的那件事']
  ];
  var t = el.querySelector('#a22-tok'), exp = el.querySelector('#a22-expired'), o = el.querySelector('#a22-out');

  function render() {
    var tok = TOK[t.value], expired = exp.checked && tok.ttl < 900;
    var h = '<span class="dim">凭据</span>  ' + tok.name + '\n';
    h += '  scopes     [' + tok.scopes.join(', ') + ']\n';
    h += '  resources  [' + tok.resources.join(', ') + ']\n';
    h += '  ttl        ' + tok.ttlLabel + (expired ? '  <span class="ok">已过期</span>' : '') + '\n';
    h += '  chain      ' + tok.chain + '\n\n';
    h += '<span class="dim">被劫持的智能体开始尝试：</span>\n';
    var allowedCount = 0;
    ATTEMPTS.forEach(function (a) {
      var why = '', ok = true;
      if (expired) { ok = false; why = 'token 已过期'; }
      else if (tok.scopes.indexOf(a[0]) === -1) { ok = false; why = "未授予 scope '" + a[0] + "'"; }
      else if (tok.resources.indexOf('*') === -1 && tok.resources.indexOf(a[1]) === -1) { ok = false; why = "未授予该资源"; }
      if (ok) allowedCount++;
      h += '  ' + (ok ? '<span class="bad">ALLOW</span>' : '<span class="ok">DENY </span>') + '  ' +
        a[2].padEnd(30) + '<span class="dim">' + why + '</span>\n';
    });
    h += '\n  <span class="dim">攻击者能力</span>  ' + allowedCount + '/' + ATTEMPTS.length + ' 次尝试成功\n';
    if (t.value === 'user' && !expired)
      h += '\n  <span class="bad">彻底沦陷。</span>每一次尝试都成功，而且每个请求都以 alice 的身份\n  正确签名。身份层里没有任何东西被触发。';
    if (t.value !== 'user' && !expired)
      h += '\n  <span class="ok">有界的沦陷。</span>智能体被劫持的程度完全一样；这份凭据压根就\n  表达不出四个请求里的三个。';
    if (expired)
      h += '\n  <span class="ok">什么都做不了。</span>任务结束了，权限也随之消失。\n  换成长期 token，此刻，凌晨三点，无人值守，它照样能用。';
    o.innerHTML = h;
  }
  t.onchange = render; exp.onchange = render; render();
});
