/* Control taxonomy after Grimes et al. (CMU SEI, 2025), three lifecycle stages.
   `strength`: bound = holds even if the model is fully compromised
               raise = increases attacker cost, ceiling unchanged
               support = enables the others, stops nothing alone */
export const CONTROLS = [
  {
    stage: 'Design', title: 'Core agent design',
    blurb: `Architecture decisions made before any code exists. The cheapest place to buy a security
      property, and the only place some of them are available at all.`,
    items: [
      ['Defensive prompting', 'Explicit instructions plus clear demarcation of untrusted content so the model has a chance of treating data as data.', 'raise', 'a18'],
      ['Spotlighting / datamarking', 'Delimiting, sentinel-token marking or encoding of every span of retrieved content.', 'raise', 'a18'],
      ['Control-flow constraints', 'Fixing the sequence of actions before untrusted content is read, so injected text cannot add a step.', 'bound', 'a20'],
      ['Planner–executor separation', 'A privileged planner that never reads untrusted content directing an unprivileged executor that does.', 'bound', 'a20'],
      ['Multi-agent critique', 'Independent agents cross-validating a plan or an output. Reduces error; can also enlarge the attack surface.', 'raise', 'a15'],
      ['Grounding', 'Answering from trusted retrieved sources rather than parametric memory, chiefly against hallucination.', 'support', 'a12'],
    ],
  },
  {
    stage: 'Design', title: 'Run-time controls',
    blurb: `Filters and monitors in the request path. The most-recommended category in the literature
      and the most over-trusted in practice.`,
    items: [
      ['Input guardrails', 'Classifier or heuristic detection of injection attempts before the content reaches the model.', 'raise', 'a17'],
      ['Output guardrails', 'Checking generated text and tool arguments before they leave the system.', 'raise', 'a17'],
      ['Action policy engines', 'Deterministic rules on which tool may be called with which arguments in which state.', 'bound', 'a22'],
      ['Sanitisation', 'Stripping active content, control characters, invisible Unicode and markup from retrieved data.', 'raise', 'a09'],
      ['Behavioural monitoring', 'Watching the trajectory for drift from the stated task rather than inspecting single messages.', 'support', 'a26'],
    ],
  },
  {
    stage: 'Design', title: 'Environmental and resource controls',
    blurb: `What the agent is physically able to reach. Where the guarantees live.`,
    items: [
      ['Least-privilege access control', 'Per-task, not per-session, permission sets; granular scopes; partitioned data sources.', 'bound', 'a22'],
      ['Agent identity and delegation', 'The agent has its own principal and an attenuated on-behalf-of credential, not the user\'s token.', 'bound', 'a22'],
      ['Sandboxing', 'Process, container or WASM isolation with a minimal filesystem, no ambient credentials, and no host network.', 'bound', 'a23'],
      ['Egress allow-listing', 'Outbound network policy naming permitted destinations. The control that breaks exfiltration outright.', 'bound', 'a23'],
      ['Encryption in transit and at rest', 'Standard practice for agent data, prompts, traces and model artefacts.', 'support', 'a27'],
      ['Rate limiting', 'Caps on run time, tool calls, tokens, spend and retries, dynamically tightened on anomaly.', 'bound', 'a16'],
      ['Memory controls', 'Provenance on every memory write, scans for poisoned entries, TTLs, and user-visible deletion.', 'bound', 'a12'],
      ['Privacy controls', 'Minimising retention, redacting before storage, and processing locally where possible.', 'support', 'a27'],
    ],
  },
  {
    stage: 'Design', title: 'Human–agent interaction',
    blurb: `Where a person is in the loop, and whether their presence is worth anything.`,
    items: [
      ['Human-in-the-loop gates', 'Explicit confirmation before irreversible or high-blast-radius actions, with an always-available interrupt.', 'raise', 'a24'],
      ['Reversibility grading', 'Classifying actions by how hard they are to undo and spending the interruption budget on the worst class.', 'support', 'a24'],
      ['Transparency', 'Showing the user the plan, the provenance of each input, and what a confirmation actually authorises.', 'support', 'a24'],
      ['Defence in depth', 'Layering heterogeneous controls so an attack missed by one is caught by another. The consensus position.', 'support', 'a20'],
    ],
  },
  {
    stage: 'Develop', title: 'Training strategies',
    blurb: `Making the model itself harder to redirect. Available to you only if you train, but you
      inherit the results whenever you pick a model.`,
    items: [
      ['Instruction hierarchy training', 'Teaching the model to rank instruction sources by privilege and refuse lower-privilege overrides.', 'raise', 'a18'],
      ['Structured-query training (StruQ)', 'Fine-tuning on a separated instruction/data format so the data channel is never executed.', 'raise', 'a18'],
      ['Preference alignment (SecAlign)', 'Preference optimisation against injected versus clean responses; the strongest published training defence.', 'raise', 'a18'],
      ['Adversarial training', 'Training on generated attacks; effective in-distribution, weak against attacks invented afterwards.', 'raise', 'a18'],
      ['Training data management', 'Filtering poisoned data, provenance on corpora, differential privacy where the data is sensitive.', 'support', 'a14'],
    ],
  },
  {
    stage: 'Develop', title: 'Evaluation',
    blurb: `Finding out whether any of it works before an attacker does.`,
    items: [
      ['Adaptive red-teaming', 'Attacks tuned against your specific defence, run continuously rather than once at launch.', 'support', 'a19'],
      ['Benchmarks', 'AgentDojo, ASB, InjecAgent, WASP and RedTeamCUA as a floor, never as a ceiling.', 'support', 'a25'],
      ['Capability elicitation', 'Drawing out the agent\'s full behaviour under permissive threat models so risk is not underestimated.', 'support', 'a25'],
      ['Paired metrics', 'Reporting attack success rate and utility retention together; either alone is marketing.', 'support', 'a19'],
    ],
  },
  {
    stage: 'Develop', title: 'Secure system development',
    blurb: `The parts that have nothing to do with AI and cause a large share of real incidents.`,
    items: [
      ['Defensive cybersecurity', 'DevSecOps as normal: version control, patching, SAST/DAST, config management, API hardening.', 'support', 'a27'],
      ['Supply chain risk management', 'Pinning, scanning, vendor review, model provenance, and review of every skill and MCP server before install.', 'bound', 'a13'],
    ],
  },
  {
    stage: 'Operate', title: 'Deployment',
    blurb: `Running the thing, and finding out about problems from your telemetry rather than from a
      customer.`,
    items: [
      ['Trajectory logging', 'Immutable, tamper-evident records of prompts, tool calls, results and decisions. The unit of agent forensics.', 'support', 'a26'],
      ['Continual auditing', 'Ongoing evaluation against drift, new attacks and edge cases, feeding results back into policy.', 'support', 'a26'],
      ['Runtime and endpoint detection', 'Watching what the agent actually does at the process, file and network layer where it executes.', 'raise', 'a26'],
      ['Phased deployment', 'Widening scope in stages against safety metrics, with a rollback path at every stage.', 'bound', 'a27'],
      ['Incident response', 'Tested containment, eradication and recovery playbooks written for agent-specific failure modes.', 'support', 'a27'],
    ],
  },
  {
    stage: 'Operate', title: 'Governance',
    blurb: `The organisational layer that decides what gets built and keeps the technical controls
      from quietly decaying.`,
    items: [
      ['Risk management', 'Structured threat modelling, explicit risk thresholds, and proportional mitigation requirements.', 'support', 'a27'],
      ['Usage restrictions', 'Access control on the humans as well as the agents, and minimised internal access to weights and user data.', 'bound', 'a27'],
      ['Oversight infrastructure', 'Centralised enforcement of monitoring, guardrails and access policy across every agent in the organisation.', 'support', 'a27'],
      ['Organisational management', 'AI-security literacy, an updated security team, a safety culture, and published policy.', 'support', 'a27'],
      ['Legal and compliance', 'Data protection obligations, liability allocation, and the audit trail regulators will ask for.', 'support', 'a27'],
    ],
  },
];
