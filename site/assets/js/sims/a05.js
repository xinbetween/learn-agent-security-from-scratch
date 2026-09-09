registerSim('a05frameworks', function (el) {
  var F = {
    stride: ['STRIDE — six properties an attacker can violate', [
      ['Spoofing', 'Anyone in the Slack workspace can @Scout. No per-request identity check beyond Slack membership.'],
      ['Tampering', 'The vector store is written by the agent with no provenance field. Memory poisoning is a tampering finding.'],
      ['Repudiation', 'No immutable trace links a Drive write to the request that caused it.'],
      ['Information disclosure', 'read_drive plus send_slack in one session is a cross-audience leak by construction.'],
      ['Denial of service', 'Unbounded web_fetch loop; no per-user token or spend budget.'],
      ['Elevation of privilege', '30-day cached OAuth: the agent\'s authority outlives the user\'s session.']
    ]],
    owasp: ['OWASP Top 10 for LLM Applications', [
      ['LLM01 Prompt injection', 'web_fetch returns arbitrary third-party HTML straight into context. Primary finding.'],
      ['LLM02 Insecure output handling', 'write_doc content is rendered; injected markdown and HTML reach readers.'],
      ['LLM04 Data and model poisoning', 'The auto-written vector store is an unauthenticated input to future behaviour.'],
      ['LLM06 Excessive agency', 'Full Drive scope for a task that needs three folders.'],
      ['LLM07 System prompt leakage', 'A Slack bot anyone can ask to print its instructions and tool schemas.'],
      ['LLM08 Vector and embedding weaknesses', 'No access control on the store; embeddings queryable across projects.']
    ]],
    maestro: ['MAESTRO — seven layers', [
      ['L1 Foundation model', 'Hosted. You inherit its alignment and its jailbreaks and can patch neither.'],
      ['L2 Data operations', 'Vector store has no provenance, no TTL and no deletion path.'],
      ['L3 Agent frameworks', 'Tool-call parsing: does a malformed ACTION line fail closed or fail open?'],
      ['L4 Deployment infrastructure', 'Where do the OAuth tokens live at rest, and who can read that store?'],
      ['L5 Evaluation and observability', 'No adversarial evaluation before launch; no injection regression suite.'],
      ['L6 Security and compliance', 'Guardrails run on user input only — not on web_fetch results.'],
      ['L7 Agent ecosystem', 'Scout posts to Slack; other bots read Slack. An undeclared agent-to-agent edge.']
    ]],
    atlas: ['MITRE ATLAS — adversary techniques', [
      ['AML.T0051 LLM prompt injection', 'Direct via Slack mention; indirect via fetched pages.'],
      ['AML.T0057 LLM data leakage', 'Drive contents into a Slack channel with wider membership than the document.'],
      ['AML.T0053 LLM plugin compromise', 'web_fetch is the plugin, and its output is unvalidated.'],
      ['AML.T0043 Craft adversarial data', 'Pages optimised against the specific guardrail classifier deployed.'],
      ['AML.T0018 Backdoor ML model', 'Out of scope for you; in scope for your model vendor. Record it as inherited.']
    ]],
    nist: ['NIST AI RMF — organisational functions', [
      ['GOVERN', 'Who signs off on a scope change? Is there a documented risk threshold, and what triggers it?'],
      ['MAP', 'Is the full inventory of tools, data sources and downstream consumers written down anywhere?'],
      ['MEASURE', 'What is the attack success rate today, against which attack set, at what utility cost?'],
      ['MANAGE', 'What is the rollback plan? Who can disable the bot in under a minute, at 3am, without a deploy?']
    ]],
    unique: ['What each framework found that no other did', [
      ['STRIDE', 'Repudiation. No AI framework asks whether you could reconstruct who caused what.'],
      ['OWASP', 'LLM08 — the embedding store as an access-control object, not merely a data store.'],
      ['MAESTRO', 'L7. Scout posts to Slack, another bot reads Slack. Nobody had drawn that edge.'],
      ['ATLAS', 'Adversarial data crafted against your classifier specifically — the adaptive attacker.'],
      ['NIST', 'Who can turn it off, and how fast. Not a threat; the control that sets incident duration.']
    ]]
  };
  var s = el.querySelector('#a05-fw'), o = el.querySelector('#a05-out');
  function render() {
    var f = F[s.value];
    var h = '<span class="hl">' + simUtil.esc(f[0]) + '</span>\n\n';
    f[1].forEach(function (r) {
      h += '  <span class="bnd">' + simUtil.esc(r[0]) + '</span>\n     ' + simUtil.esc(r[1]) + '\n\n';
    });
    if (s.value === 'unique') h += '<span class="dim">The union is 27 findings. The set difference is 5 — and those 5 are\nwhy multi-framework exercises are worth the hour they cost.</span>';
    o.innerHTML = h;
  }
  s.onchange = render; render();
});
