import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 15, attacks: 'a smaller key' };
export const scripts = ['/assets/js/sims/a22.js'];

export const body = `
${p(`Chapter A10 diagnosed the confused deputy. The agent holds your credential, so every hijacked
action is perfectly authenticated. This chapter is the treatment. Give the agent its own name, hand it
a key that opens less, and make the key expire before the meeting ends.`)}

${h2('Attenuation', 'attenuation')}

${p(`The core operation is one-way. You can narrow a grant; there is no code path that widens one.`)}

${code(`def attenuate(self, scopes=None, resources=None, ttl=None, actor=None) -> "Token":
    """You can only ever narrow. There is no widen()."""
    s = frozenset(scopes) & self.scopes if scopes else self.scopes
    r = frozenset(resources) & self.resources if resources else self.resources
    e = min(self.expires, time.time() + ttl) if ttl else self.expires
    return Token(self.subject, actor or self.actor, s, r, e,
                 self.chain + (self.actor,))`,
  { lang: 'py', file: 'code/a22_identity.py', tag: 'safe' })}

${p(`Intersection, not union. Minimum, not maximum. An agent asking for <code>repo.admin</code> when
its parent token does not carry it receives a token with no scopes, not a token with
<code>repo.admin</code>.`)}

${sim({
  name: 'a22token',
  title: 'The same hijacked agent, two credentials',
  controls: [
    select('a22-tok', 'Credential in use', [
      ['user', "The user's token (30-day, all scopes, all resources)"],
      ['task', 'A task token (10-minute, one scope, one resource)'],
      ['sub', 'A sub-agent token (2-minute, delegated)'],
    ], 'user'),
    toggle('a22-expired', 'Simulate 15 minutes later', false),
  ].join(''),
  body: out('a22-out'),
  note: `The attempts are identical in every column. This is one compromised agent trying the same
    four things. What changes is how much of the request set the credential can express at all.`,
})}

${h2('The delegation chain', 'chain')}

${p(`Attenuation gives you a second thing almost for free: an auditable record of who caused what.
Every token carries the path it came down.`)}

${code(`alice → research-agent → summariser-subagent

chain:  ('alice', 'research-agent')
actor:  'summariser-subagent'
ttl:    119s   (never longer than the parent)`, { lang: 'txt', file: 'the chain' })}

${p(`This is the field A10 said your auth stack does not have. Every downstream call carries the path,
so an audit log can say "alice, via research-agent, via summariser-subagent" rather than "alice". An
incident investigation can then answer "which agent, running which task, caused this write" without
correlating timestamps by hand.`)}

${h2('What to use in production', 'standards')}

${table(
  ['Standard', 'What it gives you'],
  [
    ['<b>OAuth 2.0 Token Exchange</b> (RFC 8693)', 'The <code>act</code> / <code>sub</code> distinction used above is a real claim set (actor and subject), not an invention. This is the most likely path for most teams.'],
    ['<b>Macaroons / Biscuits</b>', 'Caveat-based attenuation: narrowing is possible offline by anyone holding the token, widening is cryptographically impossible.'],
    ['<b>SPIFFE / SPIRE</b>', 'Workload identity, so the agent is a first-class principal with its own verifiable identity document rather than a borrowed user session.'],
    ['<b>W3C DIDs</b>', 'Decentralised identifiers, for cross-organisation agent-to-agent trust where there is no shared IdP.'],
    ['<b>OIDC + on-behalf-of</b>', 'The enterprise path. Less elegant, already deployed, and integrates with the access reviews you already run.'],
    ['<b>IETF agent-auth drafts</b>', 'Emerging work on authentication and authorisation specifically for AI agent interactions, including delegation chains and attenuating tokens.'],
  ]
)}

${h2('The three questions to answer per task', 'three-questions')}

${steps([
  ['What is the minimum scope set?',
   `Not "what does the agent do" — what does <em>this run</em> do. A research task needs
    <code>drive.read</code>, not <code>drive</code>. Most teams have never asked, because the consent
    screen never offered the choice.`],
  ['What is the minimum resource set?',
   `Scopes without resource narrowing are half the control. <code>drive.read</code> on the whole
    account still reads the salary spreadsheet; <code>drive.read</code> on
    <code>drive://projects/q3-research</code> does not.`],
  ['What is the shortest workable lifetime?',
   `A token that outlives the task is a standing authority an injection can exercise at 3am. Minutes,
    not days. Mint it at the start of the run so expiry and task completion coincide.`],
])}

${callout('defense', 'The shift that matters', `<p style="margin-bottom:0">From <em>"what may this
user do"</em> to <em>"what does this run need"</em>. Session-scoped permissions were designed for a
human sitting at a screen whose presence bounded the authority. An agent removes that bound, so the
permission model has to supply one. Per-task rather than per-session is the whole chapter, and it is
also the answer to A10's tool-misuse case, where there is no attacker at all.</p>`)}

${h2('Agent identity beyond the token', 'identity')}

${p(`Two adjacent problems the literature treats separately and you will meet together:`)}

${ul([
  `<b>Visibility.</b> Chan and colleagues argue for agent identifiers, real-time monitoring and
   activity logging as infrastructure, so that when an agent does something it is attributable to an
   agent rather than to a person. This is a precondition for everything in
   <a href="/chapters/a26/">A26</a>.`,
  `<b>Cross-organisation trust.</b> When your agent talks to someone else's, you need identity that
   does not assume a shared identity provider. This is where DIDs and the Agent Network Protocol's
   identity layer live, and where the A2A protocol security work applies.`,
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Implement one-way attenuation and explain why intersection is the only correct operation.`,
  `Mint a task-scoped credential for a real integration and state its three narrowings.`,
  `Explain what a delegation chain gives an incident investigation that a user ID does not.`,
  `Name the production standard you would actually use, and why.`,
])}
`;

export const quiz = [
  {
    q: `An agent holding a task token asks to attenuate it to include <code>repo.admin</code>, which
        the token does not carry. What does it receive?`,
    options: [
      `A token with <code>repo.admin</code> added.`,
      `A token with an empty or unchanged scope set, since attenuation is an intersection and requesting an absent scope adds nothing.`,
      `An error that halts the agent.`,
      `A token with <code>repo.admin</code> pending approval.`,
    ],
    answer: 1,
    explain: `The operation is <code>requested ∩ held</code>, so a scope the parent does not have
      cannot appear in the child. This is the property that makes the control hold against a
      compromised agent. There is no code path that widens a grant, so an injected instruction to
      "request admin access" produces a strictly less capable token rather than a more capable one.
      Failing loudly is a design choice you might also make, but the security property comes from the
      intersection.`,
  },
  {
    q: `Why is scope narrowing insufficient without resource narrowing?`,
    options: [
      `Scopes are not standardised across providers.`,
      `<code>drive.read</code> across the whole account still reaches the salary spreadsheet; only naming the specific resource bounds what a hijacked agent can read.`,
      `Resource narrowing is required by OAuth.`,
      `Scopes expire but resources do not.`,
    ],
    answer: 1,
    explain: `Scope answers "what kind of operation" and resource answers "on what". Reducing a
      coding agent from <code>drive</code> to <code>drive.read</code> stops it deleting things and
      leaves every document in the account readable, which is the entire exfiltration surface. Both
      narrowings are needed, and resource narrowing is the one consent screens rarely offer, which is
      why it usually requires minting your own tokens.`,
  },
  {
    q: `What does a delegation chain provide that a user ID in the audit log does not?`,
    options: [
      `Stronger cryptographic guarantees.`,
      `The causal path — which agent, running which task, on whose behalf — so an investigation can answer "what caused this" rather than only "who was authenticated".`,
      `Faster log queries.`,
      `Compliance with GDPR.`,
    ],
    answer: 1,
    explain: `A10's core complaint was that the auth stack records the signer and not the causer.
      "alice" appears identically for the legitimate write and the hijacked one; "alice, via
      research-agent, via summariser-subagent" narrows the investigation to a specific run with a
      specific context you can replay. It is the identity-layer half of the provenance A21 builds at
      the data layer.`,
  },
  {
    q: `Why is a 30-day cached token qualitatively worse for an agent than for an interactive
        application?`,
    options: [
      `Agents make more requests.`,
      `In an interactive app the token's use is bounded by a person at a screen; an agent turns it into a standing authority exercisable at any hour with nobody present.`,
      `Agents store tokens less securely.`,
      `Token refresh is unreliable in agents.`,
    ],
    answer: 1,
    explain: `Human presence is an implicit control that agents remove. A hijacked agent with a
      long-lived token can act at 3am on a Sunday, in a background job, on a schedule, with no one to
      notice the anomaly. Minting a task-scoped token at the start of a run and letting it expire with
      the run restores the bound. It also gives you a natural place to attach the scope, resource and
      chain information the rest of the chapter needs.`,
  },
  {
    q: `Which standard gives you offline attenuation, where a holder can narrow a token without
        contacting the issuer but cannot widen it?`,
    options: [
      `OAuth 2.0 Token Exchange (RFC 8693).`,
      `Macaroons / Biscuits.`,
      `SPIFFE / SPIRE.`,
      `OpenID Connect.`,
    ],
    answer: 1,
    explain: `Macaroons attach caveats using a chained HMAC, so anyone holding a token can append a
      restriction and no one can remove one. Narrowing is local and offline; widening is
      cryptographically impossible. RFC 8693 achieves attenuation through an exchange with the issuer,
      which is a round trip but is what most enterprise stacks already support. SPIFFE addresses
      workload identity rather than delegation; OIDC addresses authentication.`,
  },
  {
    q: `Least privilege for agents is described as a shift from "what may this user do" to "what does
        this run need". Why does that framing also help with non-adversarial failures?`,
    options: [
      `It does not; it is purely a security control.`,
      `Because a narrow credential also bounds an agent that is simply mistaken (the tool-misuse case from A10, where there is no attacker).`,
      `Because it reduces latency.`,
      `Because it forces better prompts.`,
    ],
    answer: 1,
    explain: `A read-only credential stops a misparsed <code>DELETE</code> exactly as effectively as
      it stops a malicious one, and misparsed deletes are far more frequent. This overlap is worth
      leading with when justifying the work to a team that does not yet believe injection is their
      problem: the same control addresses the failure mode they have already experienced.`,
  },
];

export const refs = [
  { authors: 'Jerome H. Saltzer, Michael D. Schroeder', title: 'The Protection of Information in Computer Systems',
    venue: 'Proceedings of the IEEE, 1975', url: 'https://www.cs.virginia.edu/~evans/cs551/saltzer/',
    note: 'least privilege, stated once and correctly' },
  { authors: 'Michael B. Jones, Anthony Nadalin, Brian Campbell, John Bradley, Chuck Mortimore',
    title: 'RFC 8693: OAuth 2.0 Token Exchange', venue: 'IETF, 2020',
    url: 'https://datatracker.ietf.org/doc/html/rfc8693' },
  { authors: 'Arnar Birgisson, Joe Gibbs Politz, Úlfar Erlingsson, Ankur Taly, Michael Vrable, Mark Lentczner',
    title: 'Macaroons: Cookies with Contextual Caveats for Decentralized Authorization in the Cloud',
    venue: 'NDSS, 2014', url: 'https://research.google/pubs/pub41892/' },
  { authors: 'Tobin South, Samuele Marro, Thomas Hardjono, Robert Mahari, Cedric Deslandes Whitney, Dazza Greenwood, Alan Chan, Alex Pentland',
    title: 'Authenticated Delegation and Authorized AI Agents', venue: 'ICML, 2025',
    url: 'https://arxiv.org/abs/2501.09674' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Alan Chan, Noam Kolt, Peter Wills, Usman Anwar, Christian Schroeder de Witt, Nitarshan Rajkumar, Lewis Hammond, David Krueger, Lennart Heim, Markus Anderljung',
    title: 'IDs for AI Systems', venue: 'NeurIPS Workshop, 2024', url: 'https://arxiv.org/abs/2406.12137' },
  { authors: 'Alan Chan, Kevin Wei, Sihao Huang, Nitarshan Rajkumar, Elija Perrier, Seth Lazar, Gillian K. Hadfield, Markus Anderljung',
    title: 'Infrastructure for AI Agents', venue: 'TMLR, 2025', url: 'https://arxiv.org/abs/2501.10114' },
  { authors: 'Tianneng Shi, Jingxuan He, Zhun Wang, Linyu Wu, Hongwei Li, Wenbo Guo, Dawn Song',
    title: 'Progent: Programmable Privilege Control for LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2504.11703' },
  { authors: 'Pieter Kasselman and colleagues', title: 'draft-klrc-aiagent-auth: AI Agent Authentication and Authorization',
    venue: 'IETF Internet-Draft, 2026', url: 'https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/' },
  { authors: 'SPIFFE community', title: 'SPIFFE: Secure Production Identity Framework for Everyone',
    venue: 'CNCF', url: 'https://spiffe.io/' },
  { authors: 'W3C', title: 'Decentralized Identifiers (DIDs) v1.1', venue: 'W3C', url: 'https://www.w3.org/TR/did-1.1/' },
];
