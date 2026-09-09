registerSim('a03trifecta', function (el) {
  var CFG = {
    coding: ['~/.ssh, .env, the whole source tree', 'issue text, PR bodies, dependency READMEs, code comments', 'git push, package install, curl inside a test'],
    inbox:  ['the entire mailbox and every attachment', 'any email any stranger sends you', 'send_email, and the draft the user will send'],
    browse: ['every site you are authenticated to', 'every page it visits', 'form submission, navigation, image fetches'],
    wiki:   ['internal documents', 'wiki pages any employee can edit', 'the answer text a human reads and acts on'],
    support:['', 'the customer message', 'its reply'],
    report: ['the production database', '', 'email to one hard-coded recipient']
  };
  var LOSS = [
    'The agent can no longer read anything sensitive. Cost: it cannot answer questions about your data.',
    'The agent only ever sees first-party, non-writable input. Cost: it cannot read the web, your mail, or anything a colleague can edit.',
    'Nothing the agent produces can reach a third party. Cost: no sending, no publishing, no fetching, and the output must be reviewed before it is acted on.'
  ];
  var cut = [false, false, false];
  var sel = el.querySelector('#a03-cfg'), o = el.querySelector('#a03-out');
  var btns = [el.querySelector('#a03-t0'), el.querySelector('#a03-t1'), el.querySelector('#a03-t2')];
  var NAMES = ['private data', 'untrusted content', 'external communication'];

  function render() {
    var c = CFG[sel.value], html = '', legs = 0;
    for (var i = 0; i < 3; i++) {
      var present = !!c[i] && !cut[i];
      if (present) legs++;
      btns[i].style.opacity = cut[i] ? '.45' : '1';
      btns[i].textContent = (cut[i] ? '✕ ' : '') + NAMES[i];
      html += '  <span class="dim">' + NAMES[i].padEnd(24) + '</span>' +
        (present ? '<span class="bad">present</span>  ' + simUtil.esc(c[i])
                 : '<span class="ok">absent</span>   ' + (c[i] ? '<span class="dim">cut — ' + simUtil.esc(LOSS[i]) + '</span>' : '<span class="dim">not present in this design</span>')) + '\n';
    }
    html += '\n  ' + (legs === 3
      ? '<span class="bad">EXPLOITABLE — 3/3 legs.</span> One sentence on a page reaches your secrets.'
      : '<span class="ok">' + legs + '/3 legs.</span> No end-to-end data-theft path. Destructive and denial-of-service risk is a separate axis (A01, A16).');
    o.innerHTML = html;
  }
  btns.forEach(function (b, i) { b.onclick = function () { cut[i] = !cut[i]; render(); }; });
  sel.onchange = function () { cut = [false, false, false]; render(); };
  render();
});
