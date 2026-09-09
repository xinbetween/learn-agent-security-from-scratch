registerSim('a27risk', function (el) {
  var A = {
    kb: {
      threat: 'Knowledge-base attack (memory / RAG poisoning)',
      components: ['knowledge base', 'memory store', 'retrieval path'],
      controls: [
        ['resource controls: encryption, privacy, MEMORY CONTROLS', 'thin'],
        ['supply chain risk management (corpus provenance)', 'ok'],
        ['usage restrictions (who may write the corpus)', 'ok'],
        ['adversarial training (robustness to poisoned retrieval)', 'ok'],
        ['environmental controls + rate limiting (contain a hijack)', 'ok'],
        ['run-time controls / HITL (block the exfiltration step)', 'ok']
      ],
      gap: 'Memory controls and privacy controls were among the LEAST-cited categories in the\n  literature despite this being a heavily-cited vulnerability. That mismatch is\n  the finding: there is no off-the-shelf guidance, and you are designing it\n  yourself. Budget accordingly — and assume your peers skipped it.'
    },
    dos: {
      threat: 'Denial of service / denial of wallet',
      components: ['orchestration loop', 'tool layer', 'shared queue'],
      controls: [
        ['rate limiting (per run, per identity, per tool, per tenant)', 'ok'],
        ['monitoring for anomalous usage', 'thin'],
        ['red-teaming against resource attacks', 'thin'],
        ['incident response (respond to an attack in progress)', 'ok']
      ],
      gap: 'Monitoring and red-teaming recommendations in the literature are aimed at AGENT\n  BEHAVIOUR rather than at cyber threats, and the operational guidance comes\n  almost entirely from industry sources. Classic DoS defence is mature; its\n  application to agents is not written down anywhere you can cite.'
    }
  };
  var s = el.querySelector('#a27-threat'), o = el.querySelector('#a27-out');
  function render() {
    var a = A[s.value];
    var h = '  <span class="dim">THREAT</span>      ' + a.threat + '\n';
    h += '  <span class="dim">COMPONENTS</span>  ' + a.components.join(', ') + '\n\n';
    h += '  <span class="dim">CONTROLS</span>\n';
    a.controls.forEach(function (c) {
      h += '     ' + (c[1] === 'thin' ? '<span class="bad">▲</span>' : '<span class="ok">·</span>') + ' ' + simUtil.esc(c[0]) + '\n';
    });
    h += '\n  <span class="bad">GAP</span>\n  ' + simUtil.esc(a.gap) + '\n';
    h += '\n  <span class="dim">▲ = a control category the literature barely covers. Those are the ones you\n  will have to design, and the ones a competitor has probably also skipped.</span>';
    o.innerHTML = h;
  }
  s.onchange = render; render();
});
