registerSim('a01loop', function (el) {
  var SC = {
    research: {
      goal: 'Summarise what the RFC-9110 spec says about idempotent methods.',
      steps: [
        ['assistant', 'I should search for the spec text.', 0],
        ['tool', 'web_search("RFC 9110 idempotent") → 4 results, 620 tokens of page text', 1],
        ['assistant', 'Fetching the most relevant result.', 0],
        ['tool', 'web_fetch("httpwg.org/specs/rfc9110") → 3,100 tokens of HTML-derived text', 1],
        ['assistant', 'GET, HEAD, PUT and DELETE are idempotent. Answering now.', 0]
      ]
    },
    inbox: {
      goal: 'Triage my unread mail and draft replies to anything urgent.',
      steps: [
        ['assistant', 'Listing unread messages.', 0],
        ['tool', 'list_mail() → 3 messages, 180 tokens of subjects and senders', 1],
        ['assistant', 'Reading each in turn.', 0],
        ['tool', 'read_mail(1) → 740 tokens, sender: vendor@example.com', 1],
        ['tool', 'read_mail(2) → 1,220 tokens, sender: unknown@mailer.example', 1],
        ['tool', 'read_mail(3) → 460 tokens, sender: colleague@corp', 1],
        ['assistant', 'Two need replies. Drafting.', 0]
      ]
    },
    code: {
      goal: 'Fix the failing test in the payments module and open a PR.',
      steps: [
        ['assistant', 'Reading the failing test.', 0],
        ['tool', 'read_file("tests/test_payments.py") → 900 tokens', 1],
        ['tool', 'read_file("src/payments.py") → 2,400 tokens', 1],
        ['assistant', 'Checking the linked issue for context.', 0],
        ['tool', 'gh_issue(412) → 1,100 tokens, body written by an outside contributor', 1],
        ['tool', 'read_file("node_modules/x/README.md") → 3,300 tokens, third-party', 1],
        ['assistant', 'Patch written. Opening PR.', 0]
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
    html += '<span class="dim">[0] system</span>  ' + TOK.system + ' tok  <span class="ok">trusted</span> — developer prompt + tool schemas\n';
    html += '<span class="dim">[1] user</span>    ' + 40 + ' tok  <span class="ok">trusted</span> — "' + s.goal + '"\n';
    trusted += 40;
    for (var k = 0; k < i; k++) {
      var line = s.steps[k], t = tokensOf(line);
      if (line[2]) { tainted += t; } else { trusted += t; }
      html += '<span class="dim">[' + (k + 2) + '] ' + (line[0] === 'tool' ? 'tool  ' : 'model ') + '</span>' +
        String(t).padStart(5) + ' tok  ' +
        (line[2] ? '<span class="bad">tainted</span>' : '<span class="ok">trusted</span>') +
        ' — ' + simUtil.esc(line[1]) + '\n';
    }
    if (i >= s.steps.length) html += '\n<span class="hl">done.</span> The final answer was produced from a context that is ' +
      Math.round(100 * tainted / (tainted + trusted)) + '% attacker-influenceable bytes.\n';
    o.innerHTML = html;
    var pct = Math.round(100 * tainted / (tainted + trusted));
    meter.style.width = pct + '%';
    meter.parentNode.className = 'meter' + (pct > 50 ? ' danger' : '');
    ratio.innerHTML = tainted.toLocaleString() + ' tainted / ' + (tainted + trusted).toLocaleString() +
      ' total tokens — <b>' + pct + '%</b> of the prompt is outside the trust boundary' +
      (pct > 50 ? ' <span class="pill attack">majority tainted</span>' : '');
  }

  el.querySelector('#a01-step').onclick = function () { if (i < SC[scn].steps.length) i++; render(); };
  el.querySelector('#a01-run').onclick = function () { i = SC[scn].steps.length; render(); };
  el.querySelector('#a01-reset').onclick = function () { i = 0; render(); };
  sel.onchange = function () { scn = sel.value; i = 0; render(); };
  render();
});
