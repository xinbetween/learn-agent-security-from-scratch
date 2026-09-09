/* Terms a reader meets in the course, defined once. `ch` links to where it is taught. */
export const TERMS = [
  ['Agent', 'core', `A system whose perception, planning and action selection are driven by an LLM,
    and which can act on the world without a human mediating each step. The four properties usually
    cited are: pursuing underspecified objectives, acting directly, goal-directed behaviour, and
    long-horizon planning.`, 'a01'],
  ['Agent loop', 'core', `The while-loop at the centre of every agent: build a prompt from context,
    call the model, parse an action, execute it, append the result, repeat until done.`, 'a01'],
  ['Trust boundary', 'core', `The line across which data changes trust level. In an agent the critical
    one sits at the tool-result: content authored by someone other than the principal enters the same
    token stream as the principal's instructions.`, 'a02'],
  ['Instruction/data confusion', 'core', `The root cause of prompt injection. A transformer consumes
    one flat sequence with no channel that structurally distinguishes commands from content.`, 'a02'],
  ['Lethal trifecta', 'core', `Simon Willison's shorthand for the combination that makes an agent
    exploitable: access to private data, exposure to untrusted content, and an ability to communicate
    externally. Remove any one and the exfiltration path breaks.`, 'a03'],
  ['Threat surface', 'core', `A grouping of vulnerabilities by where they enter the system. The SoK
    taxonomy uses six: direct, indirect, internal, resource, oversight and compound.`, 'a04'],
  ['MAESTRO', 'framework', `A seven-layer threat-modelling framework built specifically for agentic
    systems, from foundation model up through agent ecosystem.`, 'a05'],
  ['MITRE ATLAS', 'framework', `Adversarial Threat Landscape for AI Systems: an ATT&CK-style matrix of
    tactics and techniques observed against ML and AI systems.`, 'a05'],
  ['OWASP ASI', 'framework', `The OWASP Agentic Security Initiative, which publishes agentic threat and
    mitigation guidance alongside the OWASP Top 10 for LLM Applications.`, 'a05'],

  ['Direct prompt injection', 'attack', `The principal user supplies input designed to override the
    developer\'s instructions. Overlaps with, but is not identical to, jailbreaking.`, 'a06'],
  ['Jailbreak', 'attack', `Input that induces a model to violate its own safety policy. A content-safety
    failure; prompt injection is an authority failure.`, 'a06'],
  ['Indirect prompt injection', 'attack', `Instructions planted in content the agent retrieves — a web
    page, an email, a document, a code comment — that the agent then executes as intent.`, 'a07'],
  ['Environmental injection', 'attack', `Indirect injection delivered through a rendered surface a
    computer-use agent perceives: a pop-up, an image, a DOM node, an accessibility label.`, 'a08'],
  ['Exfiltration channel', 'attack', `Any agent-controllable path that carries data to an attacker:
    a rendered markdown image URL, an outbound tool call, a DNS lookup, a link the user clicks.`, 'a09'],
  ['Confused deputy', 'attack', `A privileged component induced to misuse its authority on behalf of a
    less-privileged party. An agent holding a user\'s OAuth token is a textbook deputy.`, 'a10'],
  ['Excessive agency', 'attack', `OWASP LLM06: the agent holds more permission, autonomy or
    functionality than its task requires, so a single compromise does more damage.`, 'a10'],
  ['Tool poisoning', 'attack', `Malicious instructions placed in tool metadata, such as the name, the
    description or the parameter docs, reaching the model before the tool is ever invoked.`, 'a11'],
  ['Line jumping', 'attack', `A poisoned MCP server influencing an agent at the tool-listing stage,
    before the user has approved or called anything from it.`, 'a11'],
  ['Rug pull', 'attack', `A tool or skill that is benign when approved and mutates afterwards, since
    most clients re-read metadata without re-prompting.`, 'a11'],
  ['Tool shadowing', 'attack', `A malicious server describing a tool in a way that changes how the agent
    uses a different, trusted server\'s tool.`, 'a11'],
  ['Memory poisoning', 'attack', `Writing attacker-controlled content into an agent\'s persistent memory
    or knowledge base so the attack replays on future, unrelated sessions.`, 'a12'],
  ['PoisonedRAG', 'attack', `Knowledge-corruption attack on retrieval-augmented generation. Craft a few
    documents that both rank highly for a target query and dictate the answer.`, 'a12'],
  ['Skill', 'core', `A packaged bundle of instructions (and often code) an agent loads to gain a
    capability. Executable prose distributed like a package, usually without package tooling.`, 'a13'],
  ['Model backdoor', 'attack', `A behaviour trained into weights that activates on a trigger and is
    invisible to prompt-level inspection.`, 'a14'],
  ['Prompt infection', 'attack', `A multi-agent injection whose payload instructs each victim to
    forward the payload, giving worm-like propagation across a topology.`, 'a15'],
  ['Denial of wallet', 'attack', `Resource exhaustion measured in money: forcing an agent into long
    reasoning chains or tool-call storms that bill the operator.`, 'a16'],

  ['Guardrail', 'defense', `A filter on agent input, output or actions. May be a regex, a classifier,
    a policy engine or another model. Probabilistic, and bypassable by construction.`, 'a17'],
  ['Spotlighting', 'defense', `Marking untrusted content so the model can distinguish it: delimiters,
    datamarking (a marker interleaved through the span), or encoding. Microsoft\'s framing of defensive prompting.`, 'a18'],
  ['Instruction hierarchy', 'defense', `Training a model to rank instruction sources by privilege (system over developer
    over user over tool output) and to refuse lower-privilege overrides.`, 'a18'],
  ['StruQ / SecAlign', 'defense', `Training-time defences that teach a model to treat a structured data
    channel as data: StruQ via structured instruction tuning, SecAlign via preference optimisation.`, 'a18'],
  ['Adaptive attack', 'defense', `An attack tuned against the specific defence being evaluated. The only
    honest way to measure a defence; static benchmarks systematically overstate protection.`, 'a19'],
  ['Attack success rate (ASR)', 'defense', `Fraction of attempts that achieve the attacker objective.
    Only meaningful when reported alongside utility retention and the attacker\'s budget.`, 'a19'],
  ['Utility retention', 'defense', `How much benign task performance survives a defence. A defence with
    0% ASR and 40% utility has not solved the problem.`, 'a19'],
  ['Action-selector pattern', 'defense', `The agent may only choose among a fixed set of pre-approved
    actions and never sees tool output. No feedback loop, so no injection path.`, 'a20'],
  ['Plan-then-execute', 'defense', `Every step of the plan is fixed before any untrusted content is
    retrieved, so injected text can influence arguments but not the control flow.`, 'a20'],
  ['Dual LLM', 'defense', `A privileged model that never sees untrusted content orchestrates a
    quarantined model that does, exchanging only opaque variable references.`, 'a20'],
  ['CaMeL', 'defense', `Capabilities for Machine Learning: extract control flow into a Python-subset
    program from the trusted user query, then enforce capability policies on every value the
    quarantined model produces.`, 'a21'],
  ['Information-flow control (IFC)', 'defense', `Tagging every value with its provenance and integrity
    level, then refusing operations that would move a tainted value to a sink it may not reach.`, 'a21'],
  ['Taint tracking', 'defense', `The practical form of IFC, marking data from untrusted sources and
    propagating the mark through every derived value.`, 'a21'],
  ['Attenuated token', 'defense', `A credential deliberately narrowed by scope, audience, resource and
    lifetime before being handed to an agent, so a stolen token is worth less.`, 'a22'],
  ['Least privilege', 'defense', `Saltzer and Schroeder\'s principle: every component operates with the
    minimum authority needed. For agents, per-task rather than per-session permission sets.`, 'a22'],
  ['Egress allow-list', 'defense', `Network policy permitting only named destinations. The single most
    effective control against exfiltration, because it breaks the third leg of the trifecta.`, 'a23'],
  ['Sandboxing', 'defense', `Executing agent-driven code or tools in an isolated environment with
    minimal filesystem, network and process privilege.`, 'a23'],
  ['Human-in-the-loop (HITL)', 'defense', `A required human decision before an action executes. Its
    value collapses under approval fatigue, so it must be budgeted.`, 'a24'],
  ['Reversibility class', 'defense', `Grading actions by how hard they are to undo, from reversible through costly to
    irreversible, and spending your interruption budget on the last group.`, 'a24'],
  ['AgentDojo', 'eval', `A dynamic benchmark of realistic tasks and injection attacks that measures
    both utility and attack success for tool-calling agents.`, 'a25'],
  ['Agent Security Bench (ASB)', 'eval', `A formalised benchmark covering ten scenarios, many tools and
    a matrix of attacks and defences on LLM agents.`, 'a25'],
  ['InjecAgent', 'eval', `A benchmark for indirect prompt injection in tool-integrated agents,
    separating direct-harm from data-stealing attacker goals.`, 'a25'],
  ['Trajectory', 'ops', `The complete ordered record of an agent run: prompts, model outputs, tool calls,
    tool results, and the decisions between them. The unit of agent forensics.`, 'a26'],
  ['Task drift', 'ops', `Divergence between what the user asked for and what the agent is now pursuing.
    Detectable from activation deltas or from trace-level analysis.`, 'a26'],
  ['Defence in depth', 'ops', `Layering heterogeneous controls so an attack missed by one is caught by
    another. The consensus recommendation across the entire literature.`, 'a27'],
  ['Phased deployment', 'ops', `Widening an agent\'s scope in stages as safety metrics are met, with a
    rollback path at each stage.`, 'a27'],
];
