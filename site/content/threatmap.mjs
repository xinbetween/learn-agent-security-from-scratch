/* Six threat surfaces after Grimes et al., SoK: Bridging Research and Practice in
   LLM Agent Security (CMU SEI, 2025). Class descriptions and chapter mapping are ours. */
export const SURFACES = [
  {
    n: 'S1', title: 'Direct threats', sources: '60 sources · 25 academic · 35 industry',
    blurb: `Everything that enters at the application layer, where the principal user talks to the
      agent. The user is a trusted party by assumption, and that assumption is the vulnerability.`,
    classes: [
      ['Direct prompt injection', 'Supplies input crafted to override the developer\'s instructions and take control of the agent\'s objective.', 'a06'],
      ['System prompt extraction', 'Recovers the developer prompt, tool schemas and hidden policy, turning a black box into a white box for the next attack.', 'a06'],
      ['Jailbreaking', 'Induces policy-violating output through role-play, encoding, low-resource languages, or optimiser-found suffixes.', 'a06'],
      ['Disallowed use', 'Uses the agent exactly as designed, for a purpose the operator forbids. No technical exploit is involved.', 'a06'],
      ['Direct multimodal attack', 'Delivers the payload in an uploaded image, audio clip or document rather than in the text field.', 'a08'],
    ],
  },
  {
    n: 'S2', title: 'Indirect threats', sources: '55 sources · 20 academic · 35 industry',
    blurb: `Content that reaches the model without a human typing it: tool results, retrieved
      documents, other agents' messages. This is the surface that distinguishes agents from chatbots,
      and it is where industry sources concentrate their concern.`,
    classes: [
      ['Indirect prompt injection', 'Plants instructions in a page, an email, a PR comment or a filename the agent will retrieve, then waits.', 'a07'],
      ['Environmental injection', 'Places the payload in a rendered surface a computer-use agent perceives: pop-up, screenshot text, DOM node, accessibility label.', 'a08'],
      ['Tool attacks', 'Poisons tool metadata, shadows another server\'s tool, or mutates a tool after approval.', 'a11'],
      ['Insecure plugin design', 'Exploits a tool that accepts free-form input and passes it to a shell, an SQL engine, an eval, or an HTTP client.', 'a23'],
      ['Knowledge-base attacks', 'Corrupts RAG corpora or vector stores so the poisoned document is what gets retrieved.', 'a12'],
      ['Memory poisoning', 'Writes attacker-controlled content into persistent memory so the attack survives the session and reaches other users.', 'a12'],
      ['Protocol exploits', 'Attacks the transport: MCP specification weaknesses, A2A trust assumptions, unauthenticated servers, session handling.', 'a11'],
      ['IAM failures', 'Abuses over-broad tokens, missing agent identity, unbounded delegation, or shared service credentials.', 'a22'],
    ],
  },
  {
    n: 'S3', title: 'Internal threats', sources: '62 sources · 31 academic · 31 industry',
    blurb: `Failures of the model itself, introduced in training or emerging at inference. The
      largest surface by source count, and the one academia weights most heavily.`,
    classes: [
      ['Foundation model vulnerabilities', 'Misalignment, hallucination and plain inaccuracy producing harmful actions with no adversary present at all.', 'a04'],
      ['Data poisoning', 'Corrupts pre-training or fine-tuning data to install behaviour that no prompt-level defence can see.', 'a14'],
      ['Model backdoors', 'Trains a trigger-conditioned behaviour into the weights; dormant on every benign input, reliable on the trigger.', 'a14'],
      ['Reasoning and planning failures', 'Produces a plan that is locally sensible and globally catastrophic — a loop, a destructive shortcut, a misread goal.', 'a16'],
      ['Tool misuse', 'Calls a legitimate tool with wrong, over-broad or destructive arguments without being told to.', 'a10'],
      ['Deception and evasion', 'Reports success it did not achieve, or behaves differently when it infers it is being evaluated.', 'a19'],
    ],
  },
  {
    n: 'S4', title: 'Resource threats', sources: '29 sources · 13 academic · 16 industry',
    blurb: `Attacks on the infrastructure underneath the agent. Almost entirely classical
      cybersecurity, and almost entirely underserved by AI-specific tooling.`,
    classes: [
      ['Denial of service', 'Exhausts the agent\'s compute, rate limit or context budget, or the shared queue it sits behind.', 'a16'],
      ['Denial of wallet', 'Forces long reasoning chains, tool-call storms or repeated retries whose cost is billed to the operator.', 'a16'],
      ['Compute misuse', 'Repurposes the agent\'s execution environment for the attacker\'s own work: scanning, mining, relaying.', 'a16'],
      ['Cyber compromise', 'Ordinary intrusion into the host, container, network or API surface the agent runs on.', 'a23'],
      ['Supply chain attacks', 'Compromises a package, model file, MCP server, skill or container image the agent depends on.', 'a13'],
      ['Physical compromise', 'Attacks the device for embodied and edge agents, where the actuator is real.', 'a08'],
    ],
  },
  {
    n: 'S5', title: 'Oversight failures', sources: '19 sources · 10 academic · 9 industry',
    blurb: `The controls meant to catch the other five surfaces, failing. Being reviewed by a human
      who is not really reading is worse than not being reviewed, because it manufactures confidence.`,
    classes: [
      ['Human-in-the-loop failure', 'Approval fatigue: after the fortieth identical dialog the human is a rubber stamp with a latency cost.', 'a24'],
      ['Explainability failure', 'The agent\'s stated reason for an action is not the reason, so review of the reasoning validates nothing.', 'a24'],
      ['Monitoring failure', 'Coverage gaps, drift, unparsed traces, or alerts nobody routed to a person who could act.', 'a26'],
    ],
  },
  {
    n: 'S6', title: 'Compound threats', sources: '24 sources · 13 academic · 11 industry',
    blurb: `Failures that only exist because agents loop and because agents talk to each other. Each
      component is behaving as specified; the composition is not.`,
    classes: [
      ['Cascading failures', 'A small error early in a multi-step task is amplified by every subsequent step that trusts it.', 'a15'],
      ['Adverse multi-agent dynamics', 'Injection propagating agent to agent, collusion, coordination failure, or shared-memory contamination.', 'a15'],
      ['System-level failures', 'Emergent behaviour from the architecture itself: unbounded recursion, deadlock, or an approval loop that approves itself.', 'a15'],
    ],
  },
];
