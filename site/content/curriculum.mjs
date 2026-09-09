/* The spine of the course. Everything else (nav, maps, pagers, the index) is
   derived from this file. */

export const PARTS = [
  {
    id: 1, key: 'foundations',
    title: 'Foundations',
    range: 'A01–A05',
    blurb: `What an agent actually is, why giving a language model hands changes the
            security problem, and the vocabulary the rest of the course uses. Nothing here
            is an attack yet; it is the map you will be attacking.`,
    bridge: `…which gives you a threat model. Now watch someone walk straight through it. So:`,
    project: 'p1',
  },
  {
    id: 2, key: 'perimeter',
    title: 'Attacking the Perimeter',
    range: 'A06–A10',
    blurb: `The four attacks every agent faces on day one: text that pretends to be an
            instruction, text that arrives through a tool, text hidden in a pixel, and the
            channel that carries the loot back out.`,
    bridge: `…which compromises the reasoning. Now compromise the parts it reasons over. So:`,
    project: 'p2',
  },
  {
    id: 3, key: 'components',
    title: 'Attacking the Components',
    range: 'A11–A16',
    blurb: `An agent is a model plus tools plus memory plus skills plus other agents. Each
            of those is a separate supply chain with its own trust assumptions, and each has
            been broken in public.`,
    bridge: `…which is the full attack surface. Defences start where the model does. So:`,
    project: 'p3',
  },
  {
    id: 4, key: 'model-defense',
    title: 'Defence at the Model Layer',
    range: 'A17–A19',
    blurb: `Guardrails, defensive prompting, and training the model to keep instructions
            and data apart. These are the defences people reach for first. Worth
            understanding precisely, including where each one stops working.`,
    bridge: `…which raises the cost of an attack without bounding the damage. For bounds, leave the model. So:`,
    project: null,
  },
  {
    id: 5, key: 'system-defense',
    title: 'Defence at the System Layer',
    range: 'A20–A24',
    blurb: `The defences with guarantees. Control- and data-flow design patterns, taint
            tracking, capability-scoped identity, sandboxing, and approval interfaces people
            can actually read.`,
    bridge: `…which is a system you can argue about. Now prove it, watch it, and run it. So:`,
    project: 'p4',
  },
  {
    id: 6, key: 'operations',
    title: 'Evaluation and Operations',
    range: 'A25–A27',
    blurb: `Measuring whether any of it worked: benchmarks and adaptive red-teaming,
            runtime detection and audit, and the governance wrapper that decides what an
            agent is permitted to be.`,
    bridge: `…which is everything. Assemble it once, end to end. So:`,
    project: 'p5',
  },
];

/* code: [filename, approximate line count], filled in by the build from disk */
export const CHAPTERS = [
  // ---------------------------------------------------------------- Part 1
  { id: 'a01', part: 1, title: 'The Agent Loop',
    sub: 'Perceive, reason, act — and where security enters',
    desc: `An agent is a while-loop around a model that is allowed to call functions. Write
           the loop in forty lines and every attack in this course becomes a question about
           one arrow in it.`,
    code: 'a01_agent_loop.py' },

  { id: 'a02', part: 1, title: 'The Trust Boundary',
    sub: 'Why a model cannot tell an instruction from data',
    desc: `A prompt is one flat token sequence. There is no privileged channel, no
           out-of-band control plane, no equivalent of a parameterised query. This is the
           single fact the rest of the course is organised around.`,
    code: 'a02_trust_boundary.py' },

  { id: 'a03', part: 1, title: 'The Lethal Trifecta',
    sub: 'Private data, untrusted content, external communication',
    desc: `Not every agent is exploitable. The ones that are almost always hold all three
           of these properties at once. Learn to spot the combination before you build it.`,
    code: 'a03_trifecta.py' },

  { id: 'a04', part: 1, title: 'The Threat Landscape',
    sub: 'Six surfaces, twenty-five classes of vulnerability',
    desc: `A systematic map of what can go wrong, drawn from a review of 173 academic and
           industry sources: direct, indirect, internal, resource, oversight and compound
           threats.`,
    code: 'a04_threat_taxonomy.py' },

  { id: 'a05', part: 1, title: 'Threat Modelling Frameworks',
    sub: 'OWASP, MAESTRO, ATLAS, STRIDE and NIST, applied to an agent',
    desc: `Five frameworks, each answering a different question. Run all five against the
           same toy agent and watch which threats only one of them finds.`,
    code: 'a05_threat_model.py' },

  // ---------------------------------------------------------------- Part 2
  { id: 'a06', part: 2, title: 'Direct Prompt Injection',
    sub: 'The user as adversary',
    desc: `System-prompt extraction, instruction override, encoding tricks and the
           optimiser-driven attacks that make manual patching hopeless. Includes why
           "ignore previous instructions" still works in 2026.`,
    code: 'a06_direct_injection.py' },

  { id: 'a07', part: 2, title: 'Indirect Prompt Injection',
    sub: 'The web page as adversary',
    desc: `The defining attack on agents. Untrusted content enters through a tool result
           and is executed as intent. Build the attack, measure it, and understand why it is
           structurally different from a jailbreak.`,
    code: 'a07_indirect_injection.py' },

  { id: 'a08', part: 2, title: 'Multimodal and Environmental Injection',
    sub: 'Pixels, pop-ups, DOM and accessibility trees',
    desc: `Computer-use and web agents perceive a rendered surface. Anything that can place
           a pixel or a node in that surface can place an instruction in the prompt.`,
    code: 'a08_environmental.py' },

  { id: 'a09', part: 2, title: 'Exfiltration Channels',
    sub: 'How the data actually leaves',
    desc: `An injection that cannot phone home is a nuisance. Markdown images, link
           rendering, DNS, tool arguments and side channels, plus the CSP and egress rules
           that close each one.`,
    code: 'a09_exfiltration.py' },

  { id: 'a10', part: 2, title: 'Excessive Agency and Confused Deputies',
    sub: 'When the agent is authorised and the instruction is not',
    desc: `The agent holds your OAuth token, so every action it takes is perfectly
           authenticated and completely unauthorised. The classic confused-deputy problem,
           rediscovered with a language model in the middle.`,
    code: 'a10_confused_deputy.py' },

  // ---------------------------------------------------------------- Part 3
  { id: 'a11', part: 3, title: 'Tool Poisoning and MCP',
    sub: 'The description is part of the prompt',
    desc: `Tool metadata is attacker-controlled text that reaches the model before any tool
           runs. Line jumping, rug pulls, tool shadowing, and what the Model Context Protocol
           does and does not guarantee.`,
    code: 'a11_tool_poisoning.py' },

  { id: 'a12', part: 3, title: 'Memory and Knowledge-Base Poisoning',
    sub: 'Attacks that persist after the session ends',
    desc: `RAG corpora and agent memory are write surfaces. Poison one document and the
           attack fires on every future query that retrieves it, including for other users.`,
    code: 'a12_memory_poisoning.py' },

  { id: 'a13', part: 3, title: 'The Skill Supply Chain',
    sub: 'Marketplaces, plugins, and 42,000 skills nobody read',
    desc: `Agent skills are executable prose distributed like npm packages, with none of
           npm's tooling. Empirical studies of real marketplaces, and how to scan a skill
           before installing it.`,
    code: 'a13_skill_supply_chain.py' },

  { id: 'a14', part: 3, title: 'Model-Level Threats',
    sub: 'Backdoors, data poisoning and weight provenance',
    desc: `A trigger phrase baked into the weights survives every prompt-level defence you
           will build. What backdoors in agents look like, and what supply-chain controls
           actually address them.`,
    code: 'a14_model_backdoor.py' },

  { id: 'a15', part: 3, title: 'Multi-Agent Attacks',
    sub: 'Infection, collusion and cascading failure',
    desc: `An injection that instructs the victim to repeat itself becomes a worm. Add
           delegation chains and shared memory and the blast radius is the whole topology.`,
    code: 'a15_multi_agent.py' },

  { id: 'a16', part: 3, title: 'Resource and Economic Attacks',
    sub: 'Denial of wallet, loops and amplification',
    desc: `The cheapest attack on an agent is not stealing its data — it is making it think
           forever. Token amplification, tool-call storms, and unbounded reasoning loops.`,
    code: 'a16_resource_attacks.py' },

  // ---------------------------------------------------------------- Part 4
  { id: 'a17', part: 4, title: 'Guardrails and Detectors',
    sub: 'Classifiers, and the arithmetic of their failure',
    desc: `Input and output filters, from regex to fine-tuned classifiers to LLM judges.
           What detection rates mean at real base rates, and why an adaptive attacker changes
           the number you care about.`,
    code: 'a17_guardrails.py' },

  { id: 'a18', part: 4, title: 'Defensive Prompting',
    sub: 'Spotlighting, delimiters, and the instruction hierarchy',
    desc: `Marking untrusted content so the model treats it as data. Cheap, genuinely
           helpful, and never sufficient on its own. Includes the training-time versions:
           StruQ, SecAlign and instruction-hierarchy fine-tuning.`,
    code: 'a18_defensive_prompting.py' },

  { id: 'a19', part: 4, title: 'Evaluating a Defence Honestly',
    sub: 'Adaptive attacks, and why static benchmarks flatter you',
    desc: `Most published defences report near-perfect numbers against fixed attacks and
           collapse against attacks tuned to them. How to run an adaptive evaluation and how
           to read someone else's.`,
    code: 'a19_adaptive_eval.py' },

  // ---------------------------------------------------------------- Part 5
  { id: 'a20', part: 5, title: 'Secure Design Patterns',
    sub: 'Six architectures that bound the damage',
    desc: `Action-selector, plan-then-execute, dual LLM, code-then-execute, context
           minimisation, map-reduce. Each trades some capability for a property you can state
           and defend.`,
    code: 'a20_design_patterns.py' },

  { id: 'a21', part: 5, title: 'Capabilities and Information-Flow Control',
    sub: 'CaMeL, taint tracking, and provable non-interference',
    desc: `Stop asking the model to be trustworthy and start tracking where every value
           came from. Build a small capability-tagged interpreter that refuses to send
           tainted data to an untrusted sink.`,
    code: 'a21_ifc.py' },

  { id: 'a22', part: 5, title: 'Identity, Delegation and Least Privilege',
    sub: 'Giving an agent its own name and a smaller key',
    desc: `Agent identity, scoped and attenuated tokens, on-behalf-of delegation chains,
           and per-task permission sets. The control that turns a total compromise into a
           bounded one.`,
    code: 'a22_identity.py' },

  { id: 'a23', part: 5, title: 'Sandboxing and Egress Control',
    sub: 'Containment when the model is already lost',
    desc: `Process, container and WASM isolation; filesystem and network policy; the
           allow-list that makes exfiltration fail. Assume the injection succeeded and design
           for what happens next.`,
    code: 'a23_sandbox.py' },

  { id: 'a24', part: 5, title: 'Human Oversight That Works',
    sub: 'Approval interfaces, fatigue, and irreversibility',
    desc: `A confirmation dialog nobody reads is not a control. Classify actions by
           reversibility, budget the interruptions, and show the human the argument rather
           than the JSON.`,
    code: 'a24_oversight.py' },

  // ---------------------------------------------------------------- Part 6
  { id: 'a25', part: 6, title: 'Red-Teaming and Benchmarks',
    sub: 'AgentDojo, ASB, InjecAgent and building your own',
    desc: `What the public agent-security benchmarks measure, what they miss, and how to
           write a harness for your own agent that produces a number you would bet on.`,
    code: 'a25_red_teaming.py' },

  { id: 'a26', part: 6, title: 'Monitoring, Logging and Runtime Detection',
    sub: 'Trace-level telemetry and the endpoint as control point',
    desc: `Everything an agent does is a syscall, an HTTP request, or a token. Log the
           trajectory, detect drift, and understand why endpoint telemetry has become the
           enforcement layer for desktop agents.`,
    code: 'a26_monitoring.py' },

  { id: 'a27', part: 6, title: 'Governance, Risk and Incident Response',
    sub: 'From a threat taxonomy to a deployment decision',
    desc: `Risk assessment you can repeat, phased rollout, containment and recovery
           playbooks, and the organisational scaffolding that keeps the technical controls
           from decaying.`,
    code: 'a27_governance.py' },
];

export const PROJECTS = [
  { id: 'p1', after: 1, title: 'Threat-Model a Real Agent',
    tag: 'Project 1',
    desc: `Take an agent you actually use (a coding assistant, a browsing agent, an inbox
           triager) and produce a complete threat model: reference architecture, trust
           boundaries, surfaces, and a ranked risk register.`,
    hours: '3–4 hours' },

  { id: 'p2', after: 2, title: 'Build the Injection Lab',
    tag: 'Project 2',
    desc: `Stand up a deliberately vulnerable agent with a web tool, an email tool and a
           file tool, then land four end-to-end attacks against it: direct override, indirect
           injection, an environmental injection and a working exfiltration.`,
    hours: '5–6 hours' },

  { id: 'p3', after: 3, title: 'Red-Team the Supply Chain',
    tag: 'Project 3',
    desc: `Write a malicious-but-inert MCP server and a poisoned skill, land a persistent
           memory attack, propagate an injection across two agents, then build the scanner
           that would have caught each one.`,
    hours: '6–8 hours' },

  { id: 'p4', after: 5, title: 'Harden It',
    tag: 'Project 4',
    desc: `Rebuild the lab agent behind a defence stack: spotlighting, a capability-tagged
           data layer, scoped credentials, an egress allow-list and a reversibility-graded
           approval gate. Re-run every Project 2 and 3 attack and account for each outcome.`,
    hours: '8–10 hours' },

  { id: 'p5', after: 6, title: 'Measure and Operate',
    tag: 'Project 5',
    desc: `Write an AgentDojo-style harness for your hardened agent, run an adaptive
           red-team against your own defences, ship trajectory logging with a drift detector,
           and write the incident-response runbook.`,
    hours: '6–8 hours' },
];

export const CAPSTONE = {
  id: 'capstone',
  title: 'The Capstone: Sentinel',
  sub: 'A full agent, a full attack suite, a full defence stack, and the numbers',
  desc: `One repository containing a real tool-using agent, thirty-two attacks drawn from
         every chapter, a six-layer defence stack, and an evaluation harness that reports
         attack success rate against utility retention. It is the whole course, executable.`,
  hours: '15–25 hours',
};

/* helpers ---------------------------------------------------------------- */
export const partOf = (ch) => PARTS.find(p => p.id === ch.part);
export const chaptersOfPart = (pid) => CHAPTERS.filter(c => c.part === pid);
export const chapterIndex = (id) => CHAPTERS.findIndex(c => c.id === id);
export const chapterNum = (id) => chapterIndex(id) + 1;
