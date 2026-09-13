/* Page prose for the English locale.

   site/lib/pages.mjs is one shared template for every language: it holds the
   HTML structure, the ids, the data- attributes and the diagrams, and takes
   every piece of human-readable text from this bundle. A translation is a copy
   of this file under site/content/<code>/pagecopy.mjs with the same keys.

   Values are grouped by the page they appear on. A value that needs a number,
   or a link whose URL is locale-dependent, is a function; the URL is passed in
   already prefixed for the locale, so a translator never writes a path. Line
   breaks inside a value are the ones the rendered HTML has today. */

export const COPY = {
  /* ============================================================= home ==== */
  home: {
    eyebrow: (n, lines, events) =>
      `${n} chapters · ${lines} lines of runnable Python · ${events}-point timeline · no GPU, no API key`,
    h1: `Learn agent security<br>from scratch.`,
    lede1: `Giving a language model access to tools changes the security problem. When an agent reads a
  web page, email, or document, it processes untrusted text alongside the instructions that govern its
  actions—often while holding credentials or access to sensitive data. This course examines the attacks
  that follow from that design, the available defences, and the limits of those defences against an
  informed attacker.`,
    lede2: `Each chapter includes a mechanism diagram, an in-browser lab, a self-contained Python
  example, six graded questions, and references to the underlying research.`,
    btnStart: `Start with A01 →`,
    btnCurriculum: `See the curriculum`,
    btnCapstone: `The capstone`,

    heroFigT: `A01 · the core agent loop.`,
    heroFigB: `Parts 2 and 3 examine attacks on the numbered stages. Parts 4 and 5 introduce controls
   for those stages. The dashed line marks the trust boundary: the model should not be the final
   authority for privileged actions.`,

    claimsH2: `The course's central arguments`,
    claim1t: `Prompt injection is a privilege-separation problem.`,
    claim1b: `When untrusted content and instructions share a context, model behavior alone cannot provide a
  reliable security boundary. Architecture determines what a successful injection can reach.`,
    claim2t: `Detection is useful, but it is not containment.`,
    claim2b: `Guardrails can increase the cost of an attack. Capability scoping, information-flow control,
  and egress policy can also limit the damage an attack can cause.`,
    claim3t: `Many of the controls are established security practice.`,
    claim3b: `Least privilege, sandboxing, supply-chain review, egress control, and audit logging remain
  central. The model introduces new interfaces; the system still needs conventional controls.`,

    audienceH2: `Who this is for`,
    audienceP: `Prerequisites: you can read Python and you have used an AI agent once. You do
not need a GPU, an API key, a security background, or any machine-learning theory. Everything runs
against a deterministic stub model included in the repository.`,
    aud1t: `You are shipping an agent`,
    aud1b: `Parts 1, 4 and 5 give you a threat model, a defence stack you can justify to a reviewer, and the
  honest limits of each layer.`,
    aud1link: `A20 · design patterns →`,
    aud2t: `You are securing someone else's`,
    aud2b: `Parts 2, 3 and 6 are the offensive curriculum and the evaluation harness that turns it into a
  report.`,
    aud2link: `A25 · red-teaming →`,
    aud3t: `You are reading the literature`,
    aud3b: `Every chapter ends in a full reference list, and the site indexes 180-odd papers and reports by
  the threat they address.`,
    aud3link: `All references →`,
    aud4t: `You learn by breaking things`,
    aud4b: `Twenty-seven in-browser labs, five projects and a capstone. Land the attack yourself, then watch the same
  attack fail against the fix.`,
    aud4link: `The projects →`,

    currH2: `The curriculum`,
    currP: `The six parts are intended to be read in order. They move from the threat model through
attacks and controls to evaluation and operations. Each part ends with a project, and the capstone
brings the material together.`,
    part: (id) => `Part ${id}`,
    chLines: (n) => `${n} lines`,
    finalProject: `Final project`,

    formatH2: `In every chapter`,
    fmt1t: `A mechanism diagram`,
    fmt1b: `Trace untrusted data through the system and identify where sensitive data or actions can leave it.`,
    fmt2t: `A lab in the page`,
    fmt2b: `Try a payload or adjust a threshold, then observe how the example responds. No installation,
  API key, or network connection is needed.`,
    fmt3t: `A file you can run`,
    fmt3b: `Self-contained Python, standard library only, asserting the claims made in the text. Runs in
  under two seconds.`,
    fmt4t: `Credited references`,
    fmt4b: `Six graded questions, then the full bibliography for the chapter with every author named.`,

    startH2: `Begin with the trust boundary.`,
    startP: `Chapter A01 uses a short Python example to show where an agent loop places its credentials and
untrusted tool output. The later chapters build on that model.`,
    startBtn: `A01 · The Agent Loop →`,
  },

  /* ======================================================= curriculum ==== */
  curriculum: {
    title: `Curriculum`,
    description: (n) =>
      `All ${n} chapters of Learn Agent Security From Scratch, organised into six parts with five projects and a capstone.`,
    kicker: `The full path`,
    h1: `Curriculum`,
    sub: (n) => `${n} chapters, six parts, five projects, and a capstone.
The sequence moves from foundations to attacks, controls, evaluation, and operations.`,
    metaLines: `lines of course code`,
    metaLabs: `in-browser labs`,
    metaQuestions: `graded questions`,
    searchPlaceholder: `Filter chapters. Try “injection”, “memory”, “sandbox”, “identity”…`,
    part: (id) => `Part ${id}`,
    chLines: (n) => `${n} lines`,
    finalProject: `Final project`,
  },

  /* ========================================================= projects ==== */
  projects: {
    title: `Projects`,
    description: `Five graded projects and a capstone for the agent security course.`,
    kicker: `Build it yourself`,
    h1: `Projects`,
    sub: `The projects turn the material into practical work. Each part ends with a build exercise, and
the six exercises inform the capstone.`,
    afterPart: (id, title) => `After Part ${id} · ${title}`,
    finalProject: `Final project`,
    flowH2: `How the projects fit together`,
    flowFigT: `One agent, six passes.`,
    flowFigB: `Project 2 creates a deliberately vulnerable agent used throughout the course. Project 3
examines its dependencies, Project 4 adds a defence stack, Project 5 evaluates it, and the capstone
combines the work with an evaluation harness.`,
    prereq: `Prerequisite:`,
  },

  /* ========================================================= capstone ==== */
  capstone: {
    finalTag: `FINAL`,
    usesEvery: `Uses every chapter`,
    prereq: `Prerequisite:`,
    and: `and`,
  },

  /* ========================================================== threats ==== */
  threats: {
    title: `Threat map`,
    description: `Six threat surfaces and twenty-five vulnerability classes for LLM agents, each linked to the chapter that covers it.`,
    kicker: `Reference`,
    h1: `Threat map`,
    sub: `Six surfaces, twenty-five classes. The structure follows the
systematic review by Grimes et al. at Carnegie Mellon's Software Engineering Institute, which
categorised threats across 173 academic and industry sources; the per-class notes and chapter links
are this course's.`,
    searchPlaceholder: `Filter threats by “injection”, “memory”, “DoS”, “backdoor”…`,
    cols: [`Vulnerability class`, `What the attacker does`, `Chapter`],
    bridge: (defenses) => `Every surface here has a facing page in <a href="${defenses}">the defence map</a>.`,
  },

  /* ========================================================= defenses ==== */
  defenses: {
    title: `Defence map`,
    description: `A taxonomy of thirty-three agent security controls across design, development and operations.`,
    kicker: `Reference`,
    h1: `Defence map`,
    sub: `Thirty-three control categories across the three lifecycle stages,
following the best-practice taxonomy in the SEI systematic review. The <b>strength</b> column is this
course's judgement of what each control actually buys you against a motivated attacker.`,
    searchPlaceholder: `Filter controls by “sandbox”, “identity”, “logging”…`,
    cols: [`Control`, `What it does`, `Strength`, `Chapter`],
    pillBound: `bounds damage`,
    pillRaise: `raises cost`,
    pillSupport: `supports`,
    calloutTitle: `Reading the strength column`,
    calloutBody: `<b>Bounds damage</b> means that even a compromised model cannot reach the asset; the
property is enforced by construction. <b>Raises cost</b> means an attacker needs a more effective
payload, but the maximum possible impact is unchanged. <b>Supports</b> means the control does not
provide containment on its own but helps other controls operate. Controls that raise cost should not
be treated as a substitute for a control that bounds damage.`,
  },

  /* ========================================================= glossary ==== */
  glossary: {
    title: `Glossary`,
    description: `Definitions of the agent security terms used across the course.`,
    kicker: `Reference`,
    h1: `Glossary`,
    sub: (n) => `${n} terms, each linked to the chapter that teaches it.
Where the field uses a word inconsistently, the definition here says so.`,
    searchPlaceholder: `Filter terms…`,
    cols: [`Term`, `Definition`, `Ch.`],
    groups: {
      core: `Core concepts`,
      framework: `Frameworks`,
      attack: `Attacks`,
      defense: `Defences`,
      eval: `Evaluation`,
      ops: `Operations`,
    },
  },

  /* ========================================================= timeline ==== */
  timeline: {
    title: `Timeline`,
    description: `A dated timeline of agent security: attacks, defences, incidents, standards and benchmarks from 2022 to 2026.`,
    kicker: `Reference`,
    h1: `Timeline`,
    sub: (n) => `${n} landmarks, from 2022 to 2026. The timeline traces attacks, defences, incidents,
standards, and benchmarks as the field developed.`,
    searchPlaceholder: `Filter events…`,
    cols: [`Date`, `Kind`, `Event`, `Ch.`],
  },

  /* ======================================================= references ==== */
  references: {
    title: `References`,
    description: `The complete bibliography for the agent security course, credited to every author.`,
    kicker: `Credits`,
    h1: `References`,
    sub: (n, chapters) => `${n} distinct sources across ${chapters} chapters.
This course is a synthesis; the work is theirs.`,
    calloutTitle: `On credit`,
    calloutP1: `Every claim in this course traces to a paper, a disclosure or a
piece of production guidance written by someone else. Each chapter ends with its own reference list;
this page is the union of all of them, sorted by first author. Where a paper has a project page, the
link goes there rather than to arXiv, because the authors chose what to put on it.`,
    calloutP2: (sources) => `The curriculum was assembled from four collections in particular, and if
you read only one thing after this course, make it one of these:
<a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">Awesome-Agent-Security</a> (UCSB
MLSec: Zhun Wang, Kaijie Zhu, Yuzhou Nie, Tianneng Shi, Juhee Kim, Zeyi Liao, Ruizhe Jiang, Wenbo Guo),
<a href="https://github.com/LLMSecurity/awesome-agent-skills-security">Awesome Agent Skills Security</a>,
<a href="https://github.com/VoltAgent/awesome-ai-agent-papers">Awesome AI Agent Papers</a> (VoltAgent),
and the SEI systematisation by Grimes and colleagues. Details on <a href="${sources}">the sources page</a>.`,
    searchPlaceholder: (n) => `Search ${n} references by author, title or venue…`,
  },

  /* ========================================================== sources ==== */
  sources: {
    title: `Source collections`,
    description: `The curated lists and papers this course was built from.`,
    kicker: `Credits`,
    h1: `Source collections`,
    sub: `The collections and papers that informed this course, and the people who maintain them.`,
    intro: `This course does not contain original security research. It is a teaching path through four bodies
of work, plus the primary papers each of them points at. Where a chapter states a number — an attack
success rate, a marketplace study, a case-study count — that number belongs to the cited paper, and
the chapter says which one.`,
    collectionsH2: `The four collections`,

    ucsbH3: `Awesome-Agent-Security (UCSB MLSec)`,
    ucsbP1: `A structured taxonomy of agent security research organised as agentic systems and benchmarks,
red-teaming, and blue-teaming, with the blue-teaming branch subdivided into model-based defences and
system-level runtime defences. Its structure is the closest thing the field has to a shared map, and
Parts 2 through 5 of this course follow it closely, particularly the split between defences that act
on the model and defences that act on the system around it.`,
    ucsbP2: `Maintained by Zhun Wang, Kaijie Zhu, Yuzhou Nie, Tianneng Shi, Juhee Kim, Zeyi Liao, Ruizhe Jiang
and Wenbo Guo. <a href="https://github.com/ucsb-mlsec/Awesome-Agent-Security">github.com/ucsb-mlsec/Awesome-Agent-Security</a>`,

    skillsH3: `Awesome Agent Skills Security (LLMSecurity)`,
    skillsP: `Focused on the layer this course covers in A11 and A13: tool use, agent skills, marketplaces and
the supply chain around them. It carries the threat frameworks and standards section (OWASP ASI,
MITRE ATLAS, NIST AI RMF, the IETF agent-authentication drafts) as well as the empirical
marketplace studies that make Chapter A13 possible.
<a href="https://github.com/LLMSecurity/awesome-agent-skills-security">github.com/LLMSecurity/awesome-agent-skills-security</a>`,

    voltH3: `Awesome AI Agent Papers (VoltAgent)`,
    voltP: `A continuously updated feed of agent papers with an 82-entry AI Agent Security section covering
2026 work: agentic payment protocols, GraphRAG extraction, MCP specification analysis, skill-marketplace
studies, and the current generation of runtime control planes. It is where the most recent material in
Parts 3 and 5 comes from.
<a href="https://github.com/VoltAgent/awesome-ai-agent-papers">github.com/VoltAgent/awesome-ai-agent-papers</a>`,

    sokH3: `SoK: Bridging Research and Practice in LLM Agent Security`,
    sokP1: `Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley,
Zhiwei Steven Wu and Nathan VanHoudnos, Carnegie Mellon University Software Engineering Institute,
November 2025. A systematic review of 64 academic studies, 109 industry sources and 36 real-world case
studies, producing a six-surface threat taxonomy, a thirty-three-category best-practice taxonomy, and
a measurement of which practices deployed systems actually use.`,
    sokP2: (threats, defenses) => `This paper supplies the skeleton of <a href="${threats}">the threat map</a> and
<a href="${defenses}">the defence map</a>, and its finding that case studies implement roughly a third
of recommended controls is the reason Part 6 exists.
<a href="https://doi.org/10.1184/R1/30610928">doi:10.1184/R1/30610928</a>`,

    crowdstrikeH3: `Securing AI Where It Executes (CrowdStrike)`,
    crowdstrikeP: `An industry white paper arguing that for desktop and coding agents the endpoint is the enforcement
point, because that is where agent-initiated process execution, file modification and network activity
actually happen. Chapter A26 uses its framing for runtime telemetry and the practical problem of
distinguishing an agent's actions from a human operator's; the vendor-specific product claims are the
publisher's and are not reproduced here as course material.`,

    primaryH2: `Everything else`,
    primaryP: (n, references) => `Roughly ${n} primary sources are cited directly across the chapters —
papers, CVEs, vendor disclosures, standards drafts and blog posts by the researchers who found the
bugs. They are listed in full, sorted by author, on <a href="${references}">the references page</a>,
and again at the foot of each chapter that uses them.`,

    correctionsTitle: `Corrections`,
    correctionsBody: (issues) => `If this course misstates your work,
misattributes it, or cites a superseded version, please
<a href="${issues}">open an issue</a>. Credit and accuracy are the point of the reference
lists; getting them wrong is a bug of the same severity as broken code.`,
  },

  /* ============================================================ setup ==== */
  setup: {
    title: `Local setup`,
    description: `How to run the course code locally. Python 3.9+, standard library only.`,
    kicker: `Reference`,
    h1: `Local setup`,
    sub: `Python 3.9 or newer. No packages, no API key, no GPU, no network.`,
    intro: `Every chapter has one self-contained file in <code>code/</code>. Each runs on the standard library
alone, finishes in under two seconds, and ends with assertions that verify the claims made in the
chapter text. If a file runs clean, the chapter's claims held on your machine.`,

    noModelH2: `Why there is no model call`,
    noModelP1: `The course ships a deterministic stub model in <code>code/agentlib.py</code>: a small,
rule-driven function that behaves like an instruction-following LLM in exactly the ways that matter
for security. It follows the most recent imperative sentence it can find, regardless of which part of
the context that sentence came from.`,
    noModelP2: `That is a caricature of a real model, and deliberately so. Real models are stochastic, so an attack
that works nineteen times in twenty makes for a confusing lesson; and running the course against a
paid API would make it cost money to learn. The stub makes every attack in the course reproducible,
free, and offline. It also makes the central point honestly. The vulnerability is architectural and
survives any amount of model improvement, because it lives in the shape of the context rather than in
the quality of the reasoning.`,
    liveTitle: `Running against a real model`,
    liveBody: (a19) => `Every file takes an
optional <code>--live</code> flag. Set <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code>
and install the matching SDK, and <code>agentlib.py</code> will route through it instead of the stub.
Expect the attacks to succeed less reliably and the defences to behave the same way, which is itself
the lesson of <a href="${a19}">A19</a>.`,

    safetyH2: `Safety`,
    safetyP1: `Nothing in this repository attacks anything but itself. Tool implementations are in-memory fakes:
the "web fetch" reads from a fixture dictionary, the "send email" appends to a list, the "shell"
records a string and refuses to execute it. The exfiltration chapters build a receiver that logs to
stdout. You can run every file on a work laptop without a network connection.`,
    safetyP2: `The projects ask you to build attack payloads. Build them against your own lab agent. Landing them
against a system you do not own or have written authorisation to test is a crime in most
jurisdictions. And the part of the exercise that teaches you something is the defence you write
afterwards.`,

    siteH2: `Building the site`,
    siteP: `No dependencies, Node 18 or newer. Chapters live in <code>site/content/chapters/*.mjs</code> as
plain ES modules exporting <code>meta</code>, <code>body</code>, <code>quiz</code> and
<code>refs</code>.`,
  },

  /* Diagram labels. These sit inside fixed-width SVG frames, so a translation
     has to be about as short as the English or it will overflow the box. */
  diagrams: {
    hero: {
      aria: 'An agent turn with the four points of compromise marked',
      title: 'ONE AGENT TURN — AND THE FOUR PLACES IT BREAKS',
      task: ['user task', '"book my flight"'],
      context: ['context', 'prompt + history'],
      model: ['model', 'plan next action'],
      toolCall: ['tool call', 'runs for real'],
      world: ['world', 'web · files · APIs'],
      result: ['tool result appended to context', 'untrusted bytes, same token stream'],
      loop: 'loop',
      boundary: 'TRUST BOUNDARY',
      n1: ['① attacker text enters here', 'and is read as intent'],
      n2: ['② the model cannot', 'tell it apart'],
      n3: ['③ the tool runs with', 'your credentials'],
      n4: ['④ the result leaves on', 'an outbound call'],
    },
    flow: {
      title: 'THE SAME AGENT, CARRIED THROUGH ALL SIX',
      p1: 'threat model', p2: 'injection lab', p3: 'supply chain',
      p4: 'harden it', p5: 'measure + run',
      capstone: ['Capstone', 'Sentinel'],
      s1: 'what can go wrong', s2: 'make it go wrong',
      s3: 'stop it, then prove it', s4: 'all of it',
    },
  },
};
