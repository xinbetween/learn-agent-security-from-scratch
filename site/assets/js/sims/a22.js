registerSim('a22token', function (el) {
  var TOK = {
    user: { name: "alice's token", scopes: ['mail.send', 'mail.read', 'drive.read', 'drive.write', 'repo.admin'],
            resources: ['*'], ttl: 30 * 86400, chain: 'alice', ttlLabel: '30 days' },
    task: { name: 'task token', scopes: ['drive.read'], resources: ['drive://projects/q3-research'],
            ttl: 600, chain: 'alice → research-agent', ttlLabel: '10 minutes' },
    sub:  { name: 'sub-agent token', scopes: ['drive.read'], resources: ['drive://projects/q3-research'],
            ttl: 120, chain: 'alice → research-agent → summariser-subagent', ttlLabel: '2 minutes' }
  };
  var ATTEMPTS = [
    ['mail.send', 'mail://any', 'exfiltrate by email'],
    ['drive.read', 'drive://finance/salaries.xlsx', 'read an unrelated document'],
    ['repo.admin', 'repo://prod', 'delete the production repo'],
    ['drive.read', 'drive://projects/q3-research', 'the actual task']
  ];
  var t = el.querySelector('#a22-tok'), exp = el.querySelector('#a22-expired'), o = el.querySelector('#a22-out');

  function render() {
    var tok = TOK[t.value], expired = exp.checked && tok.ttl < 900;
    var h = '<span class="dim">credential</span>  ' + tok.name + '\n';
    h += '  scopes     [' + tok.scopes.join(', ') + ']\n';
    h += '  resources  [' + tok.resources.join(', ') + ']\n';
    h += '  ttl        ' + tok.ttlLabel + (expired ? '  <span class="ok">EXPIRED</span>' : '') + '\n';
    h += '  chain      ' + tok.chain + '\n\n';
    h += '<span class="dim">the hijacked agent attempts:</span>\n';
    var allowedCount = 0;
    ATTEMPTS.forEach(function (a) {
      var why = '', ok = true;
      if (expired) { ok = false; why = 'token expired'; }
      else if (tok.scopes.indexOf(a[0]) === -1) { ok = false; why = "scope '" + a[0] + "' not granted"; }
      else if (tok.resources.indexOf('*') === -1 && tok.resources.indexOf(a[1]) === -1) { ok = false; why = "resource not granted"; }
      if (ok) allowedCount++;
      h += '  ' + (ok ? '<span class="bad">ALLOW</span>' : '<span class="ok">DENY </span>') + '  ' +
        a[2].padEnd(30) + '<span class="dim">' + why + '</span>\n';
    });
    h += '\n  <span class="dim">attacker capability</span>  ' + allowedCount + '/' + ATTEMPTS.length + ' attempts succeed\n';
    if (t.value === 'user' && !expired)
      h += '\n  <span class="bad">Total compromise.</span> Every attempt succeeds, and every request is\n  correctly signed as alice. Nothing in the identity layer fires.';
    if (t.value !== 'user' && !expired)
      h += '\n  <span class="ok">Bounded compromise.</span> The agent is just as hijacked; the credential\n  cannot express three of the four requests at all.';
    if (expired)
      h += '\n  <span class="ok">Nothing at all.</span> The task finished; the authority went with it.\n  A long-lived token would still be usable right now, at 3am, unattended.';
    o.innerHTML = h;
  }
  t.onchange = render; exp.onchange = render; render();
});
