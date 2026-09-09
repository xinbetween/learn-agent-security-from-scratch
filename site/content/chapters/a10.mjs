import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 14, attacks: 'authenticated and unauthorised' };
export const scripts = ['/assets/js/sims/a10.js'];

const deputy = svg(740, 300, `
${svgText(12, 18, 'THE CONFUSED DEPUTY, 1988 AND 2026', 'd-ttl', 'start')}

${svgText(180, 46, 'HARDY, 1988', 'd-lbl')}
${box(30, 60, 110, 44, 'user', 'no permission', 'd-sunk')}
${box(180, 60, 130, 44, 'compiler', 'may write billing', 'd-trust')}
${box(180, 140, 130, 44, 'billing file', '', 'd-attack')}
${arrow(140, 82, 178, 82, 'asks')}
${arrow(245, 104, 245, 138, 'writes', 'd-attack-l')}
${svgText(180, 214, 'nothing was hacked.', 'd-sub')}
${svgText(180, 230, 'the compiler had the right.', 'd-sub')}

<line x1="370" y1="40" x2="370" y2="270" stroke="var(--border-strong)" stroke-dasharray="4 4"/>

${svgText(560, 46, 'YOUR AGENT, 2026', 'd-lbl')}
${box(400, 60, 120, 44, 'web page', 'anyone', 'd-attack')}
${box(560, 60, 140, 44, 'agent', 'holds your token', 'd-trust')}
${box(560, 140, 140, 44, 'your mailbox', '', 'd-attack')}
${arrow(520, 82, 558, 82, 'says')}
${arrow(630, 104, 630, 138, 'sends', 'd-attack-l')}
${svgText(560, 214, 'nothing was hacked.', 'd-sub')}
${svgText(560, 230, 'the agent had the right.', 'd-sub')}
${svgText(560, 254, 'every request perfectly signed as you.', 'd-attack-t')}
`, { label: 'The confused deputy problem in 1988 and in an agent' });

export const body = `
${p(`The attacker never steals a credential. They redirect a component that already holds one. Every
request the compromised agent makes is correctly signed, passes every authentication check, and appears
in your audit log as legitimate activity by a real user. Nothing in your identity stack fires, which
is why the incident is usually discovered by someone else.`)}

${h2('The 1988 problem, restated', 'hardy')}

${p(`Norm Hardy's paper describes a compiler on a shared mainframe with permission to write its own
billing file. A user asks the compiler to write output to the billing file's path. The compiler has the
permission. The user does not. The compiler obliges.`)}

${figure(deputy, `<b>Thirty-eight years apart, identical shape.</b> Replace "compiler" with "agent",
"billing file" with "your mailbox", and "a user asks" with "a web page says". The novelty in 2026 is
not the vulnerability class; it is that the deputy now accepts instructions in English from anyone who
can get text into its context.`)}

${h2('The field your auth stack does not have', 'provenance')}

${p(`Here is the check every system implements, and the check almost none do:`)}

${code(`@dataclass
class Request:
    action: str
    args: dict
    authenticated_as: str    # whose credential signed it
    requested_by: str        # who actually CAUSED it   <-- this field does not exist

def authn_only(r):
    return True, f"signed by {r.authenticated_as}"

def authz_with_provenance(r):
    if r.requested_by != r.authenticated_as:
        return False, (f"caused by '{r.requested_by}' but signed as "
                       f"'{r.authenticated_as}' — provenance mismatch")
    return True, "causer and signer agree"`,
  { lang: 'py', file: 'code/a10_confused_deputy.py' })}

${sim({
  name: 'a10deputy',
  title: 'The same requests under two checks',
  controls: select('a10-check', 'Authorisation check', [
    ['authn', 'Authentication only (what you have)'],
    ['prov', 'Authentication + causal provenance'],
    ['prov_scope', 'Provenance + per-task capability scope'],
  ], 'authn'),
  body: out('a10-out'),
  note: `Every request in this list is perfectly authenticated. Your IAM logs will show the same user
    performing all of them, in the same session, seconds apart. The only thing distinguishing the
    legitimate ones is who caused them. That is not a field any standard auth stack carries,
    which is why A21 has to construct it and A22 has to propagate it.`,
})}

${h2('Excessive agency: measuring the gap', 'excessive')}

${p(`OWASP calls this LLM06. The mechanism is not carelessness. It is friction. Each of these grants
was made for a reason:`)}

${table(
  ['Integration', 'What the task needs', 'What the token grants', 'Free for an injection'],
  [
    ['Google Drive', '<code>drive.file</code>', '<code>drive</code>', 'read and delete every file in the account'],
    ['GitHub', '<code>repo:status</code>, <code>public_repo</code>', '<code>repo</code>, <code>workflow</code>, <code>admin:org</code>, <code>delete_repo</code>', 'push to private repos, edit CI, delete repositories'],
    ['Slack', '<code>channels:read</code>', '<code>channels:write</code>, <code>files:write</code>, <code>admin</code>', 'post as the user anywhere, upload files'],
    ['Database', '<code>SELECT</code>', '<code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, <code>DROP</code>', 'modify or destroy production data'],
  ]
)}

${callout('note', 'Why this happens to careful teams', `<p style="margin-bottom:0">The OAuth consent
screen offered a coarse scope and no finer one existed. A scope was needed once during development and
never removed. Narrowing it required a ticket to a platform team with a two-week queue. Excessive
agency is a friction outcome, not a judgement failure, so the fix is partly organisational:
make the narrow path the easy path, and audit grants on a schedule rather than at review time.</p>`)}

${h2('Tool misuse without an attacker', 'no-attacker')}

${p(`Worth separating from injection, because it needs a different control. The SEI review counts tool
misuse at 17 sources under internal threats. The agent calls a legitimate tool with wrong,
over-broad or destructive arguments because it misunderstood the task. No adversary is involved.`)}

${ul([
  `<code>DELETE FROM users</code> with a <code>WHERE</code> clause the model got wrong.`,
  `<code>git push --force</code> to <code>main</code> because the branch name was misparsed.`,
  `An email to a distribution list because "the team" resolved to the wrong alias.`,
  `A file write to a path that expanded differently than expected.`,
])}

${p(`Injection defences do nothing here. What helps is the same thing that helps against injection at
link 4: narrow scopes, typed and validated arguments, dry-run-then-confirm for destructive operations,
and reversibility gating. Which is convenient, because the controls that bound an attacker also
bound a mistake, and mistakes are far more common.`)}

${h2('Four ways out, in order of what they buy', 'mitigations')}

${steps([
  ['Narrow the scope', `<code>drive.file</code> instead of <code>drive</code>. The capability is gone,
    so nothing can misuse it. ${pill('defense', 'bounds damage')}`],
  ['Attenuate per task', `Mint a credential that can write one folder for ten minutes, derived from a
    broader parent grant. The blast radius is the attenuation.
    ${pill('defense', 'bounds damage')} (<a href="/chapters/a22/">A22</a>)`],
  ['Carry provenance', `Record who caused each request and refuse when the causer is untrusted content.
    ${pill('defense', 'bounds damage')} if enforced in the runtime (<a href="/chapters/a21/">A21</a>)`],
  ['Gate the irreversible', `For what remains, a human confirms. Show them the recipient and the data,
    not the tool name. ${pill('warn', 'raises cost')}, and it degrades under fatigue
    (<a href="/chapters/a24/">A24</a>)`],
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Explain why a hijacked agent's requests pass every authentication check.`,
  `Name the field standard auth stacks lack and describe what it would have to carry.`,
  `Audit an OAuth grant against what the task actually needs, and quantify the excess.`,
  `Distinguish tool misuse from injection and name a control that addresses both.`,
])}
`;

export const quiz = [
  {
    q: `A hijacked agent sends an email to an attacker using the user's OAuth token. Which security
        control detects this?`,
    options: [
      `Authentication: the request is not properly signed.`,
      `Authorisation: the token lacks the required scope.`,
      `None of the standard controls; the request is correctly authenticated and within scope.`,
      `Rate limiting: the volume is anomalous.`,
    ],
    answer: 2,
    explain: `This is the whole point of the confused-deputy framing. The token is valid, the scope
      includes <code>mail.send</code>, and the request is one email. Authentication passes because the
      signature is genuine; authorisation passes because sending mail is exactly what the token is
      for; rate limiting sees a single message. The distinguishing fact — that the instruction
      originated in a web page rather than from the user — is not represented anywhere in the request.`,
  },
  {
    q: `What does the <code>requested_by</code> field have to carry to be useful, and why is it hard?`,
    options: [
      `The user's IP address; hard because of NAT.`,
      `The causal origin of the instruction (which context message it derives from), propagated through every intermediate step; hard because nothing in the stack tracks it.`,
      `A timestamp; hard because of clock skew.`,
      `The model version; hard because providers change it.`,
    ],
    answer: 1,
    explain: `The field must answer "which piece of context caused this call", and it must survive
      transformations: the model read a page, summarised it, planned from the summary, and emitted a
      call. Provenance has to flow through all of that, which means tagging values and propagating
      tags. That is information-flow control, built in A21. It is hard precisely because no existing
      layer does it: HTTP has no such header, OAuth has no such claim, and the model itself cannot be
      trusted to report it honestly.`,
  },
  {
    q: `A team grants their agent the full <code>repo</code> GitHub scope because the fine-grained
        alternative required a platform-team ticket. How should this be characterised?`,
    options: [
      `A judgement failure that should be addressed in code review.`,
      `A friction outcome: excessive agency usually arises from the narrow path being harder, so the fix is partly organisational.`,
      `An acceptable trade-off, since the agent is trusted.`,
      `A licensing problem.`,
    ],
    answer: 1,
    explain: `Treating this as carelessness leads to more review and more training, which is the wrong
      remediation, and it will recur. The grant was rational under the constraints the engineer faced.
      The durable fixes are structural: make narrow grants self-service, provide a credential-minting
      service that attenuates from a parent grant, and audit grants on a schedule so that the
      "temporary" broad scope from six months ago is found by a process rather than by an incident.`,
  },
  {
    q: `An agent runs <code>DELETE FROM users</code> with a malformed <code>WHERE</code> clause. No
        attacker is involved. Which control would have helped?`,
    options: [
      `An injection classifier on the input path.`,
      `Spotlighting of retrieved content.`,
      `A read-only database credential, or dry-run-then-confirm for destructive statements.`,
      `A better-aligned model.`,
    ],
    answer: 2,
    explain: `Injection defences are irrelevant here because there is no injection. This is tool
      misuse, which the SEI review counts at 17 sources as an internal threat. What helps is the same
      link-4 control that bounds an attacker: a credential that cannot delete, or a gate that shows
      the affected row count before executing. This overlap is a genuinely useful property to notice
      when justifying the work, since mistakes are far more frequent than attacks.`,
  },
  {
    q: `Which mitigation for excessive agency does <em>not</em> hold when the model is fully
        compromised?`,
    options: [
      `Narrowing the OAuth scope so the capability does not exist.`,
      `Minting a task-scoped credential valid for ten minutes.`,
      `A human-in-the-loop confirmation on irreversible actions.`,
      `Runtime provenance checks that refuse calls caused by untrusted content.`,
    ],
    answer: 2,
    explain: `The human gate is the only one whose effectiveness depends on a judgement made under
      pressure, and A24 covers how quickly that judgement degrades: after the fortieth identical
      dialog the human is a rubber stamp with a latency cost. The other three are enforced by systems
      that hold regardless of what the model believes — the scope removes the capability, the
      attenuation bounds the window, and the provenance check is code. Keep the gate; place it last
      and use it sparingly.`,
  },
  {
    q: `Why does a 30-day cached OAuth token matter more for an agent than for a normal application?`,
    options: [
      `Agents make more requests, so the token is exposed more often.`,
      `The agent can act as the user at times when the user is absent and would not notice, so the authority is standing rather than session-bounded.`,
      `Cached tokens are stored less securely.`,
      `Token refresh is unreliable in agents.`,
    ],
    answer: 1,
    explain: `In an interactive application a session token is implicitly bounded by a person at a
      screen. An agent turns it into a standing authority: an injected instruction can exercise it at
      3am on a Sunday, in a background job, with nobody watching. The mitigation is short-lived
      task-scoped credentials minted at the start of a run and expiring with it. That also gives you
      a natural place to attach the provenance and scope information the previous questions were
      about.`,
  },
];

export const refs = [
  { authors: 'Norm Hardy', title: 'The Confused Deputy (or why capabilities might have been invented)',
    venue: 'ACM SIGOPS Operating Systems Review, 1988',
    url: 'https://cap-lore.com/CapTheory/ConfusedDeputy.html',
    note: 'the original statement of the problem, and the capability answer to it' },
  { authors: 'Jerome H. Saltzer, Michael D. Schroeder', title: 'The Protection of Information in Computer Systems',
    venue: 'Proceedings of the IEEE, 1975', url: 'https://www.cs.virginia.edu/~evans/cs551/saltzer/' },
  { authors: 'OWASP Top 10 for LLM Applications team', title: 'LLM06:2025 Excessive Agency',
    venue: 'OWASP, 2025', url: 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/' },
  { authors: 'Tobin South, Samuele Marro, Thomas Hardjono, Robert Mahari, Cedric Deslandes Whitney, Dazza Greenwood, Alan Chan, Alex Pentland',
    title: 'Authenticated Delegation and Authorized AI Agents', venue: 'ICML, 2025',
    url: 'https://arxiv.org/abs/2501.09674' },
  { authors: 'Tianneng Shi, Jingxuan He, Zhun Wang, Linyu Wu, Hongwei Li, Wenbo Guo, Dawn Song',
    title: 'Progent: Programmable Privilege Control for LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2504.11703' },
  { authors: 'Juhee Kim, Woohyuk Choi, Byoungyoung Lee',
    title: 'Prompt Flow Integrity to Prevent Privilege Escalation in LLM Agents', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2503.15547' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'tool misuse counted at 17 sources under internal threats' },
];
