import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, range, select, toggle, button, out, pill } from '../../lib/components.mjs';

export const meta = { time: 14, attacks: '25 vulnerability classes' };
export const scripts = ['/assets/js/sims/a04.js'];

const arch = svg(760, 400, `
${svgText(12, 18, 'REFERENCE ARCHITECTURE WITH THE SIX THREAT SURFACES OVERLAID', 'd-ttl', 'start')}

${box(24, 52, 118, 46, 'user', 'the principal', 'd-sunk')}
${svgText(83, 118, 'S1 direct', 'd-attack-t')}

${box(300, 44, 160, 62, 'LLM engine', 'perception · planning')}
${svgText(380, 126, 'S3 internal', 'd-attack-t')}

${box(300, 176, 160, 46, 'orchestration', 'the agent loop')}

${box(70, 250, 130, 46, 'tools', 'APIs, shell, browser', 'd-attack')}
${box(230, 250, 130, 46, 'knowledge base', 'RAG · memory', 'd-attack')}
${box(390, 250, 130, 46, 'other agents', 'delegation', 'd-attack')}
${box(550, 250, 130, 46, 'identity / IAM', 'tokens, scopes', 'd-trust')}
${svgText(300, 316, 'S2 indirect — everything that feeds the context', 'd-attack-t')}

${box(560, 44, 176, 46, 'human oversight', 'approve · review')}
${svgText(648, 118, 'S5 oversight', 'd-attack-t')}

<rect x="18" y="336" width="722" height="46" rx="6" class="d-sunk"/>
${svgText(379, 358, 'infrastructure — host, container, network, packages, model weights', 'd-lbl')}
${svgText(379, 374, 'S4 resource', 'd-attack-t')}

${arrow(142, 75, 298, 75)}
${arrow(460, 75, 558, 75)}
${arrow(380, 106, 380, 174)}
${arrow(380, 222, 380, 248)}
${arrow(200, 248, 340, 224)}
${arrow(520, 248, 420, 224)}
${svgText(700, 200, 'S6 compound —', 'd-attack-t', 'end')}
${svgText(700, 216, 'the loop itself', 'd-attack-t', 'end')}
<path d="M470 199 C 540 199 540 150 470 150" class="d-attack-l" marker-end="url(#ah)" fill="none"/>
`, { label: 'Agent reference architecture with six threat surfaces marked' });

export const body = `
${p(`You have a definition, a boundary and a triage test. Now you need the enumeration: the list of
things that actually go wrong, so that your threat model has a shape you can defend rather than a
shape you happened to think of on the day.`)}

${p(`The taxonomy below is from the systematic review by Grimes and colleagues at Carnegie Mellon's
Software Engineering Institute, which read 64 academic studies, 109 industry sources and 36 real-world
case studies and normalised what they found into six surfaces and twenty-five vulnerability classes.
It is the most complete map the field has. The commentary and the chapter links are this course's.`)}

${figure(arch, `<b>Where each surface attaches.</b> S1 is the user's channel. S2 is everything that
writes into the context without a human typing it. S3 is the model itself. S4 is the machine
underneath. S5 is the review that was supposed to catch the rest. S6 exists because the loop runs
more than once and because agents talk to each other.`)}

${h2('The six surfaces', 'surfaces')}

${table(
  ['Surface', 'Sources', 'The one-line version', 'Chapters'],
  [
    ['<b>S1 Direct</b>', '60', 'The user is the adversary, or is being impersonated.', '<a href="/chapters/a06/">A06</a>'],
    ['<b>S2 Indirect</b>', '55', 'Something wrote into the context without a human typing it.', '<a href="/chapters/a07/">A07</a>–<a href="/chapters/a13/">A13</a>'],
    ['<b>S3 Internal</b>', '62', 'The model is wrong, backdoored, or reasoning badly.', '<a href="/chapters/a14/">A14</a>'],
    ['<b>S4 Resource</b>', '29', 'Classical attacks on the machine the agent runs on.', '<a href="/chapters/a16/">A16</a>, <a href="/chapters/a23/">A23</a>'],
    ['<b>S5 Oversight</b>', '19', 'The human review that was meant to catch all this, did not.', '<a href="/chapters/a24/">A24</a>'],
    ['<b>S6 Compound</b>', '24', 'The loop and the topology fail in ways no component does.', '<a href="/chapters/a15/">A15</a>'],
  ]
)}

${p(`Note that S3 has the highest source count. The single most commonly cited threat to LLM agents is
not prompt injection. It is the foundation model being wrong. Misalignment, hallucination and plain
inaccuracy appear in 34 of the reviewed sources, more than any other individual class. An agent that
confidently deletes the wrong branch because it misread a diff has caused a security incident with no
adversary in it at all.`)}

${h2('Explore the map', 'lab')}

${sim({
  name: 'a04map',
  title: 'Threat taxonomy · academia versus industry',
  controls: select('a04-view', 'View', [
    ['count', 'By source count'],
    ['split', 'By academia/industry split'],
    ['chapter', 'By where this course covers it'],
  ], 'count'),
  body: out('a04-out'),
  note: `Counts are numbers of sources mentioning that class, out of 173 reviewed. They measure
    attention, not frequency in the wild (nobody has that number), so read them as "what the field
    is worried about", which is itself useful information about what your threat model will
    over-weight if you read only one literature.`,
})}

${h2('The split that should change how you read', 'split')}

${p(`The review's most useful finding for a practitioner is not any individual number; it is the
systematic difference between where academia and industry look.`)}

${callout('boundary', 'Two literatures, two blind spots', `
<p><b>Academia weights internal threats.</b> Foundation-model failures, backdoors, data poisoning,
reasoning failures, deception and scheming. Novel, model-centric, publishable.</p>
<p><b>Industry weights indirect threats.</b> IAM failures, tool attacks, indirect injection, supply
chain. Operational, systems-level, learned from incidents.</p>
<p style="margin-bottom:0">Neither is wrong; they are funded to look at different things. But a threat
model assembled from only one of them has a predictable hole. Read only papers and you will
underweight identity and supply chain, the two categories that produce most real incidents. Read only
vendor guidance and you will underweight backdoors and evaluation gaming — the two categories nobody
notices until they matter enormously.</p>`)}

${h2('No source has the whole map', 'coverage')}

${p(`The review also measured how much of its own taxonomy each source covered. Across 173 documents,
not one source covered all 25 threat categories, and not one covered all 33 best-practice
categories either. Among the academic surveys the review compared side by side, the broadest reached
16 of the best-practice categories; most reached fewer than ten.`)}

${p(`The practical consequence is a process one. A threat model built by reading the best available
paper on agent security will be missing categories, and — this is the part that hurts — you will not
know which ones, because the paper does not list what it left out. Use a taxonomy as a checklist you
run against your system, not as a reading list you work through.`)}

${code(`# The check that catches the categories you would not have thought of.
for surface in TAXONOMY:
    for vuln_class in surface.classes:
        print(f"{vuln_class}: applicable to our system? [y/n/why not]")

# Twenty-five lines of output. The value is entirely in the "why not" column,
# because that is where you discover you assumed something you cannot justify.`,
  { lang: 'py', file: 'code/a04_threat_taxonomy.py' })}

${h2('Two takeaways worth arguing with', 'takeaways')}

${steps([
  ['Traditional cyber threats are the growing concern',
   `The review found that denial of service, man-in-the-middle and code injection (ordinary
    cybersecurity) appear repeatedly in the agent literature, which they did not in the earlier
    standalone-LLM literature. Agents connect to systems, and connected systems have the problems
    connected systems have had for forty years. If your agent security programme has no overlap with
    your application security programme, one of them is missing something.`],
  ['Threat modelling needs standardising more than it needs extending',
   `References to existing taxonomies were sparse and fragmented, and the terminology varied so widely
    that the review had to normalise a long tail of different names for the same thing. This is a
    field-level problem you can help with locally: pick a vocabulary, whether MAESTRO, ATLAS or
    OWASP, and use it consistently in your own threat models, so your findings are comparable across
    systems and across years.`],
])}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Name the six threat surfaces and give one example vulnerability class in each.`,
  `Explain why "the model is simply wrong" is the most-cited threat and what that implies for testing.`,
  `Predict which categories a threat model will miss given only its authors' background.`,
  `Run the taxonomy as a checklist against a system and defend each "not applicable".`,
])}
`;

export const quiz = [
  {
    q: `Which threat surface has the highest number of sources in the SEI review, and what is the most
        cited individual class within it?`,
    options: [
      `Direct threats; direct prompt injection.`,
      `Internal threats; foundation model vulnerabilities such as misalignment and hallucination.`,
      `Indirect threats; indirect prompt injection.`,
      `Compound threats; cascading failures.`,
    ],
    answer: 1,
    explain: `Internal threats lead with 62 sources, and foundation-model vulnerabilities are the
      single most-cited class at 34. This surprises people who arrive expecting prompt injection to
      dominate. Direct prompt injection is second at 52 sources within a 60-source surface. The
      implication is practical: a large share of agent incidents involve no adversary. The agent was
      wrong, acted on being wrong, and the action was irreversible. That failure mode is addressed by
      reversibility gating and evaluation, not by injection defences.`,
  },
  {
    q: `Your threat model was written entirely from academic surveys. Which categories are you most
        likely to have underweighted?`,
    options: [
      `Model backdoors and data poisoning.`,
      `Reasoning failures and deception.`,
      `IAM failures, tool attacks and supply chain threats.`,
      `Hallucination and misalignment.`,
    ],
    answer: 2,
    explain: `The review found a consistent split: academia over-indexes on model-centric and
      emerging threats, industry on system-integration threats. The three you would miss (identity
      and access management, attacks on and through tools, and supply chain) are precisely the
      operational categories that produce most disclosed incidents, and they are underrepresented in
      academic sources because they are neither novel nor publishable. The reverse holds too: a model
      built only from vendor guidance underweights backdoors and evaluation gaming.`,
  },
  {
    q: `What does it mean that no single source in the review covered all 25 threat categories?`,
    options: [
      `The taxonomy is too granular to be useful.`,
      `A threat model derived from any one source will have gaps you cannot see, so a taxonomy should be run as a checklist rather than read as a summary.`,
      `The review's methodology was inconsistent.`,
      `Most sources are low quality.`,
    ],
    answer: 1,
    explain: `No source covered all 25 threat categories, and the same held for the 33
      best-practice categories. This is not a criticism of any source, since surveys have scope, but
      it changes how you should use them. Reading the best paper leaves you with an incomplete model
      <em>and no list of what is missing</em>. Walking a full taxonomy category by category, and
      writing down why each one does not apply, surfaces exactly the assumptions you did not know
      you had made.`,
  },
  {
    q: `An agent is compromised through an injected instruction in a retrieved document, which causes
        it to call a tool with attacker-chosen arguments, which fails, which causes the agent to retry
        with escalating privileges over eight steps. Which surfaces are involved?`,
    options: [
      `S2 indirect only.`,
      `S2 indirect and S3 internal.`,
      `S2 indirect (the injection), S3 internal (tool misuse), and S6 compound (the escalating retry loop).`,
      `All six.`,
    ],
    answer: 2,
    explain: `Real incidents cross surfaces, which is why single-surface threat models under-predict
      them. The injection is S2. Calling a legitimate tool with harmful arguments is S3 tool misuse.
      The escalating retry loop, where an error at step three is amplified by every step that trusts
      it, is S6 cascading failure, and it is the part most teams have no control for at all. S4 and
      S5 would join if the retries exhausted a budget or if a human waved the escalation through.`,
  },
  {
    q: `Why does the review argue that traditional cybersecurity threats matter more for agents than
        for standalone LLMs?`,
    options: [
      `Because agents use larger models with more parameters to protect.`,
      `Because agents integrate with external systems, inheriting the denial-of-service, man-in-the-middle and code-injection surface that connected software has always had.`,
      `Because agent frameworks are written in memory-unsafe languages.`,
      `Because agents are more likely to be deployed on-premises.`,
    ],
    answer: 1,
    explain: `A chatbot's threat model is largely about what it says. An agent opens sockets, spawns
      processes, writes files and authenticates to APIs, so it inherits the entire attack surface of
      ordinary connected software on top of its AI-specific problems. The review's finding is that
      the agent literature reflects this. Classical threats appear repeatedly where the earlier LLM
      literature barely mentioned them. The organisational implication is that your agent security
      work should be visibly connected to your existing application security work, not a parallel
      programme with its own vocabulary.`,
  },
  {
    q: `The review reports "n=52" for direct prompt injection. What does that number measure?`,
    options: [
      `The number of successful direct injection attacks recorded in the wild.`,
      `The number of reviewed sources that mention direct prompt injection as a threat.`,
      `The percentage of agents vulnerable to it.`,
      `The number of distinct injection techniques catalogued.`,
    ],
    answer: 1,
    explain: `These are attention counts across 173 reviewed documents, not incidence rates. Nobody
      has reliable in-the-wild frequency data for agent attacks, and it is worth being clear about
      that when you present a taxonomy to stakeholders. The numbers tell you what the field is
      concerned about, which is genuinely useful for spotting your own blind spots, but they cannot
      be read as risk. Turning attention into risk requires your own system's exposure, which is what
      Project 1 asks you to produce.`,
  },
];

export const refs = [
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, November 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'the six-surface taxonomy, the source counts, and the academia/industry split analysis' },
  { authors: 'Zehang Deng, Yongjian Guo, Changzhou Han, Wanlun Ma, Junwu Xiong, Sheng Wen, Yang Xiang',
    title: 'AI Agents Under Threat: A Survey of Key Security Challenges and Future Pathways',
    venue: 'ACM Computing Surveys, 2025', url: 'https://dl.acm.org/doi/10.1145/3716628' },
  { authors: 'Shaina Raza, Ranjan Sapkota, Manoj Karkee, Christos Emmanouilidis',
    title: 'TRiSM for Agentic AI: Trust, Risk and Security Management in LLM-Based Agentic Multi-Agent Systems',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.04133' },
  { authors: 'Mohamed Amine Ferrag, Norbert Tihanyi, Djallel Hamouda, Leandros Maglaras, Merouane Debbah',
    title: 'From Prompt Injections to Protocol Exploits: Threats in LLM-Powered AI Agent Workflows',
    venue: 'arXiv, 2025', url: 'https://arxiv.org/abs/2506.23260' },
  { authors: 'Erik Miehling, Karthikeyan Natesan Ramamurthy, Kush R. Varshney and colleagues (IBM Research)',
    title: 'Agentic AI Needs a Systems Theory', venue: 'IBM Research, arXiv 2025',
    url: 'https://arxiv.org/abs/2503.00237' },
  { authors: 'Lilian Weng', title: 'LLM-Powered Autonomous Agents', venue: 'lilianweng.github.io, 2023',
    url: 'https://lilianweng.github.io/posts/2023-06-23-agent/',
    note: 'the component decomposition the reference architecture follows' },
  { authors: 'Ken Huang and the Cloud Security Alliance AI Safety Initiative',
    title: 'Agentic AI Threat Modeling Framework: MAESTRO', venue: 'Cloud Security Alliance, 2025',
    url: 'https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro' },
];
