import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 16, attacks: 'assume it already failed' };
export const scripts = ['/assets/js/sims/a23.js'];

const layers = svg(720, 300, `
${svgText(12, 18, 'WHERE YOU PUT THE POLICY DECIDES WHETHER IT IS A POLICY', 'd-ttl', 'start')}
${box(40, 46, 400, 34, 'a function in the agent', 'bypassed by any code the agent runs', 'd-attack')}
${box(40, 88, 400, 34, 'an HTTP client wrapper', 'bypassed by using a different client', 'd-attack')}
${box(40, 130, 400, 34, 'an egress proxy', 'holds — unless the agent can route around it', 'd-def')}
${box(40, 172, 400, 34, 'network policy in the pod', 'holds', 'd-def')}
${box(40, 214, 400, 34, 'firewall / no route to the internet', 'holds', 'd-def')}
${svgText(470, 68, 'the agent operates', 'd-attack-t', 'start')}
${svgText(470, 84, 'at this level', 'd-attack-t', 'start')}
${svgText(470, 180, 'enforcement below', 'd-def-t', 'start')}
${svgText(470, 196, 'the agent cannot be', 'd-def-t', 'start')}
${svgText(470, 212, 'argued with', 'd-def-t', 'start')}
<line x1="30" y1="126" x2="690" y2="126" stroke="var(--border-strong)" stroke-dasharray="5 4"/>
${svgText(360, 282, 'Everything above the line is documentation. Everything below it is a control.', 'd-def-t')}
`, { label: 'Enforcement points from in-process to network layer' });

export const body = `
${p(`Every chapter so far has tried to prevent something. This one assumes prevention failed. The
injection landed, the model is hostile, and the question is what the blast radius is — which is a
property of the environment, not of the agent.`)}

${h2('An egress allow-list that is actually correct', 'egress')}

${p(`Four checks, in order. Each exists because a real system got it wrong.`)}

${code(`def egress_ok(url: str, resolve) -> tuple:
    u = urlsplit(url)

    if u.scheme not in ("http", "https"):
        return False, f"scheme {u.scheme!r} not permitted"

    host = u.hostname or ""                    # 1. parse; never regex the string
    if not host:
        return False, "no host"

    if host not in ALLOWED_HOSTS:              # 2. equality, never substring
        return False, f"host {host!r} not on the allow-list"

    ip = resolve(host)                         # 3. resolve, then check the address
    if ip is not None:
        addr = ipaddress.ip_address(ip)
        for net in BLOCKED_NETS:               # 4. link-local, RFC1918, loopback
            if addr in net:
                return False, f"{host} resolves into blocked range {net}"

    return True, "ok"`, { lang: 'py', file: 'code/a23_sandbox.py', tag: 'safe' })}

${sim({
  name: 'a23egress',
  title: 'Egress policy against eight URLs',
  controls: select('a23-impl', 'Implementation', [
    ['substr', 'Substring match on the allowed host'],
    ['regex', 'Regex on the URL prefix'],
    ['parsed', 'Parse the URL, compare hostname for equality'],
    ['full', 'Parsed + scheme check + resolve and check the address'],
  ], 'substr'),
  body: out('a23-out'),
  note: `Each implementation is one somebody shipped. Step through them and notice that the naive
    versions fail on inputs an attacker produces by owning one domain — no exotic capability
    required.`,
})}

${h2('Where you enforce it decides whether it is a control', 'placement')}

${figure(layers, `<b>An in-process check is advisory.</b> An agent that can run code — a coding agent,
a data-analysis agent, anything with a shell or an interpreter — opens its own socket and never calls
your function. The dashed line is the level the agent operates at; enforcement has to sit below it.`)}

${callout('warn', 'The check that matters most is the one you cannot write in Python', `<p style="margin-bottom:0">If your agent executes model-generated code, every guard implemented in the
same process is a suggestion. Network policy in the pod, an egress proxy the container must route
through, or simply no route to the internet — these are the versions an attacker cannot skip. They
also happen to catch DNS, which an HTTP client wrapper does not.</p>`)}

${h2('Filesystem containment', 'filesystem')}

${code(`def path_ok(path: str) -> tuple:
    real = os.path.normpath(os.path.join(WORKSPACE, path.lstrip("/")))
    if not real.startswith(WORKSPACE + os.sep) and real != WORKSPACE:
        return False, f"escapes the workspace: {real}"
    if any(p in real for p in DENY_PATTERNS):
        return False, "matches a deny pattern"
    return True, "ok"`, { lang: 'py', tag: 'safe' })}

${p(`Normalise <em>first</em>, then check. Checking the raw string is the classic bug:
<code>sub/../../escape.txt</code> contains no <code>..</code> prefix and still escapes. And prefer a
real boundary where you can get one — a bind mount, a container with only the workspace visible — over
a string comparison, for the same reason as above.`)}

${h2('Choosing an isolation level', 'isolation')}

${table(
  ['Level', 'Boundary', 'Setup', 'When'],
  [
    ['Same process', 'none', 'trivial', 'Never, for untrusted code.'],
    ['Subprocess + separate user', 'OS user separation', 'minutes', 'Weak — shares the kernel and the network namespace.'],
    ['Container', 'namespaces + cgroups', 'minutes', '<b>The default.</b> Drop capabilities, read-only rootfs, no host network.'],
    ['gVisor / Kata', 'syscall interception', 'hours', 'When the kernel is in your threat model.'],
    ['Micro-VM (Firecracker)', 'hardware virtualisation', 'hours', 'Strong isolation with ~125 ms boot — practical per-task VMs.'],
    ['WASM', 'capability-based by design', 'hours', 'Excellent for tools; limited runtime and library support.'],
    ['Separate machine', 'physical', 'days', 'Computer-use agents holding real credentials.'],
  ]
)}

${p(`For a computer-use agent the sandbox is not one control among many — it is the primary one,
because the action space (<code>click</code>, <code>type</code>) is not policy-shaped, as
<a href="/chapters/a08/">A08</a> established. A CUA in a disposable VM with a fresh profile and no
ambient credentials is a categorically different risk from a CUA on your laptop, and that difference is
the entire mitigation.`)}

${h2('A checklist for a container running agent code', 'checklist')}

${ul([
  `<b>No ambient credentials.</b> No mounted <code>~/.aws</code>, no instance metadata access, no
   environment variables carrying secrets that this task does not need.`,
  `<b>Block the link-local range.</b> <code>169.254.169.254</code> is the cloud metadata service;
   reaching it is credential theft, not exfiltration, and it deserves its own explicit deny so the
   finding is legible.`,
  `<b>Read-only root filesystem</b>, with a single writable workspace volume.`,
  `<b>Drop all capabilities</b>, then add back only what is needed — usually nothing.`,
  `<b>No host network.</b> Egress through a proxy that enforces the allow-list.`,
  `<b>Resource limits</b> — CPU, memory, PIDs, disk — which is also your
   <a href="/chapters/a16/">A16</a> control.`,
  `<b>Ephemeral.</b> Destroy and recreate per task, so persistence attacks have nowhere to live.`,
])}

${h2('What sandboxing does not do', 'limits')}

${p(`It bounds what a compromised agent can reach. It does not stop the agent producing a wrong or
attacker-influenced <em>answer</em>, which a human then acts on; it does not help if the task's
legitimate capabilities are themselves the damage (an agent authorised to send email can send email);
and it does not address anything at the model layer. Containment is a floor, not a ceiling.`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Write an egress check that survives the suffix, userinfo, scheme and rebinding tricks.`,
  `Explain why an in-process check is advisory for a code-executing agent.`,
  `Choose an isolation level for a given agent and justify the cost.`,
  `List what a sandbox does not protect against.`,
])}
`;

export const quiz = [
  {
    q: `Why does <code>https://api.internal.corp@evil.example/x</code> defeat a substring check?`,
    options: [
      `The <code>@</code> is URL-encoded.`,
      `Everything before the <code>@</code> is userinfo, so the actual host is <code>evil.example</code> — but the allowed string is present in the URL.`,
      `The URL is malformed and parsers reject it.`,
      `It uses a non-standard port.`,
    ],
    answer: 1,
    explain: `Substring matching asks "does this text appear anywhere in the URL", which is not the
      question. RFC 3986 puts credentials before the <code>@</code>, so browsers and HTTP clients
      connect to <code>evil.example</code> while your check sees the allowed host and approves. The
      companion trick is the suffix form, <code>api.internal.corp.evil.example</code>. Both are
      available to anyone who owns a domain, and both are closed by parsing the URL and comparing the
      hostname for equality.`,
  },
  {
    q: `Your agent can execute model-generated Python. You add an <code>egress_ok()</code> check to
        your HTTP helper. What have you achieved?`,
    options: [
      `A working egress control.`,
      `Documentation — the generated code can open its own socket, or import a different HTTP library, and never call your helper.`,
      `Protection against everything except DNS.`,
      `A control that works if the model is not adversarial.`,
    ],
    answer: 1,
    explain: `An in-process check binds only code that chooses to call it, and model-generated code
      makes no such promise. This is the single most common false sense of security in agent
      sandboxing. Enforcement must sit below the level the agent operates at — network policy in the
      pod, a proxy the container is forced through, or no route at all — which has the side benefit of
      covering DNS and raw sockets rather than just your helper's callers.`,
  },
  {
    q: `Why does <code>path_ok</code> normalise the path before checking it?`,
    options: [
      `To handle Windows separators.`,
      `Because <code>sub/../../escape.txt</code> contains no leading <code>..</code> and still escapes the workspace — only the resolved path reveals it.`,
      `To improve performance.`,
      `Because symlinks require normalisation.`,
    ],
    answer: 1,
    explain: `Checking the raw string tests what the input looks like rather than where it points.
      Traversal sequences can be buried mid-path, URL-encoded, or produced by concatenation. Resolving
      first and then testing the prefix is the correct order. Better still, where you can afford it, is
      a real boundary — a bind mount or a container that simply cannot see anything else — so the
      question never reaches string comparison. Symlinks are a genuine additional concern that
      <code>normpath</code> alone does not resolve.`,
  },
  {
    q: `Why is <code>169.254.169.254</code> worth an explicit deny rule even though it is not on your
        allow-list?`,
    options: [
      `It is a common typo.`,
      `It is the cloud instance metadata service — reaching it is credential theft rather than exfiltration, and naming it explicitly makes the finding legible.`,
      `It bypasses DNS resolution.`,
      `Allow-lists do not cover IP literals.`,
    ],
    answer: 1,
    explain: `The allow-list already denies it, so the rule is about clarity rather than coverage: a
      denial logged as "blocked link-local metadata access" tells an investigator something a generic
      "host not allowed" does not. It also matters because DNS rebinding can point an <em>allowed</em>
      hostname at that address, which is why the resolved-address check exists as a separate step from
      the hostname check.`,
  },
  {
    q: `For which agent type is sandboxing the <em>primary</em> control rather than one layer among
        several?`,
    options: [
      `A RAG question-answering agent.`,
      `A computer-use agent, because its action space (click, type) is not policy-shaped, so capability policy is weak and the environment boundary is what remains.`,
      `A tool-calling agent with five typed tools.`,
      `A summarisation agent with no tools.`,
    ],
    answer: 1,
    explain: `For a tool-calling agent the action space is enumerable and a capability policy over it
      is a strong control (A22). For a CUA the action space is "anything a person at this machine
      could do", and <code>click(840, 210)</code> carries no semantics to write policy against. What
      is left is the boundary of the machine: a disposable VM, a fresh profile, no ambient
      credentials. That is why the deployment decision for CUAs is dominated by where they run.`,
  },
  {
    q: `An agent is fully sandboxed with a strict egress allow-list. Which risk remains essentially
        untouched?`,
    options: [
      `Exfiltration of local secrets to an attacker-controlled host.`,
      `The agent producing a confidently wrong or attacker-influenced answer that a human then acts on.`,
      `Reading files outside the workspace.`,
      `Running up unbounded compute cost.`,
    ],
    answer: 1,
    explain: `Containment bounds reach, not correctness. An injected instruction that changes what
      the agent <em>says</em> — a wrong security procedure, a plausible but false finding, a
      recommendation to run a command — travels out through the human, which no network policy sees.
      Compute cost is partly addressed by the resource limits in the checklist; the human channel needs
      output provenance and the reversibility gating of A24.`,
  },
];

export const refs = [
  { authors: 'Yuhao Wu, Franziska Roesner, Tadayoshi Kohno, Ning Zhang, Umar Iqbal',
    title: 'SecGPT: An Execution Isolation Architecture for LLM-Based Systems', venue: 'NDSS, 2025',
    url: 'https://arxiv.org/abs/2403.04960' },
  { authors: 'Alexandru Agache, Marc Brooker, Alexandra Iordache, Anthony Liguori, Rolf Neugebauer, Phil Piwonka, Diana-Maria Popa',
    title: 'Firecracker: Lightweight Virtualization for Serverless Applications', venue: 'USENIX NSDI, 2020',
    url: 'https://www.usenix.org/conference/nsdi20/presentation/agache' },
  { authors: 'Authors of MCP-SandboxScan', title: 'MCP-SandboxScan: WASM-based Secure Execution and Runtime Analysis for MCP Tools',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2601.01241' },
  { authors: 'Tong Liu, Zizhuang Deng, Guozhu Meng, Yuekang Li, Kai Chen',
    title: 'Demystifying RCE Vulnerabilities in LLM-Integrated Apps', venue: 'ACM CCS, 2024',
    url: 'https://arxiv.org/abs/2309.02926' },
  { authors: 'JFrog Security Research', title: 'When Prompts Go Rogue: Analyzing a Prompt Injection Code Execution in Vanna.AI (CVE-2024-5565)',
    venue: 'JFrog, 2024',
    url: 'https://jfrog.com/blog/prompt-injection-attack-code-execution-in-vanna-ai-cve-2024-5565/' },
  { authors: 'Nicholas Tietz-Sokolsky', title: 'Impact of the remote-code execution vulnerability in LangChain',
    venue: 'ntietz.com, 2023', url: 'https://www.ntietz.com/blog/langchain-rce/' },
  { authors: 'Chuan Yan, Mark Huasong Meng, Liuhuo Wan, Tian Yang Ooi, Ruomai Ren, Guangdong Bai',
    title: 'ARTEMIS: Analyzing LLM Application Vulnerabilities in Practice', venue: 'ACM PACMPL, 2025',
    url: 'https://dl.acm.org/doi/10.1145/3720488' },
  { authors: 'Bytecode Alliance', title: 'WebAssembly System Interface: capability-based security',
    venue: 'WASI', url: 'https://wasi.dev/' },
  { authors: 'Google', title: 'gVisor: a container runtime sandbox', venue: 'Google', url: 'https://gvisor.dev/' },
  { authors: 'Shengye Wan, Cyrus Nikolaidis, Daniel Song, David Molnar, James Crnkovich, Jayson Grace, Manish Bhatt and colleagues',
    title: 'CYBERSECEVAL 2: A Wide-Ranging Cybersecurity Evaluation Suite for Large Language Models',
    venue: 'Meta, arXiv 2024', url: 'https://arxiv.org/abs/2404.13161' },
];
