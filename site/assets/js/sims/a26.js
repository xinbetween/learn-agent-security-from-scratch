registerSim('a26trace', function (el) {
  var TRACE = [
    [1, 'user_request', 'text="Summarise https://c.example/g"', '—', 'trusted', '3f9ac1b2'],
    [2, 'tool_call', 'http_get(url="https://c.example/g")', 'user_request', 'trusted', 'b17c4e29'],
    [3, 'tool_result', 'http_get → 3100 bytes, sha=9f2c…', 'tool_call#2', 'untrusted_web', 'd0f3a866'],
    [4, 'tool_call', 'read_file(path=".env")', 'tool_result#3', 'untrusted_web', '4a1e77b3'],
    [5, 'policy_decision', 'send_email → DENY (not in capability set)', 'tool_result#3', 'untrusted_web', 'e92b05cc']
  ];
  var v = el.querySelector('#a26-view'), o = el.querySelector('#a26-out');

  function render() {
    var mode = v.value, h = '';
    if (mode === 'trace') {
      h += '<span class="dim">step  kind             action                                       caused_by       provenance</span>\n';
      TRACE.forEach(function (r) {
        var t = r[4] === 'untrusted_web';
        h += '  ' + String(r[0]).padEnd(5) + r[1].padEnd(17) + simUtil.esc(r[2]).slice(0, 44).padEnd(45) +
          r[3].padEnd(16) + '<span class="' + (t ? 'bad' : 'ok') + '">' + r[4] + '</span>\n';
      });
      h += '\n  <span class="dim">Read step 4 and 5: a file read and an email attempt, both caused by\n  content that arrived from a fetched page. That is the whole finding, and it\n  is a database query rather than an inference.</span>';
    } else if (mode === 'tamper') {
      h += '<span class="dim">chain verification</span>\n\n';
      TRACE.forEach(function (r) { h += '  step ' + r[0] + '  hash ' + r[5] + '  <span class="ok">verifies</span>\n'; });
      h += '\n<span class="dim">after an attacker edits step 4 to hide the .env read</span>\n\n';
      TRACE.forEach(function (r) {
        var broken = r[0] >= 4;
        h += '  step ' + r[0] + '  hash ' + r[5] + '  ' + (broken ? '<span class="bad">CHAIN BROKEN</span>' : '<span class="ok">verifies</span>') + '\n';
      });
      h += '\n  <span class="ok">A silent edit is impossible.</span> Every subsequent hash is invalidated.\n  <span class="dim">Note what this does NOT prevent: truncation, or discarding the log entirely.\n  Ship records off-host promptly.</span>';
    } else if (mode === 'drift') {
      h += '<span class="dim">user request implies:</span>  {http_get}\n\n';
      TRACE.filter(function (r) { return r[1] === 'tool_call' || r[1] === 'policy_decision'; }).forEach(function (r) {
        var tool = r[2].split('(')[0].split(' ')[0];
        var flagged = r[4] === 'untrusted_web';
        h += '  step ' + r[0] + '  ' + tool.padEnd(18) +
          (flagged ? '<span class="bad">DRIFT — not implied by the request, caused by ' + r[3] + '</span>' : '<span class="ok">within the implied plan</span>') + '\n';
      });
      h += '\n  <span class="ok">Two drift events, detected with no model and no threshold.</span>\n  <span class="dim">The stronger version (Abdelnabi et al.) reads activation deltas before and\n  after untrusted content enters context — robust to phrasing, needs white-box access.</span>';
    } else {
      h += '<span class="dim">outbound destinations across 100 sessions</span>\n\n';
      h += '  api.internal.corp        60 sessions   ~400 bytes each  <span class="ok">normal</span>\n';
      h += '  cdn.example              40 sessions   <span class="bad">12 bytes each</span>   <span class="bad">← every session, uniformly tiny</span>\n';
      h += '\n  <span class="dim">per-request view</span>    12 bytes to a CDN. <span class="ok">Unremarkable.</span>\n';
      h += '  <span class="dim">aggregate view</span>     one rare destination, 40 sessions, uniform tiny payloads.\n                       <span class="bad">This distribution does not occur naturally.</span>\n';
      h += '\n  <span class="dim">This is the A09 slow channel. No per-message detector can see it, because\n  no message contains enough of the secret to be suspicious. Note the honest\n  ordering: an egress allow-list would have prevented it outright.</span>';
    }
    o.innerHTML = h;
  }
  v.onchange = render; render();
});
