import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 14, attacks: '0% → 100% in twenty minutes' };
export const scripts = ['/assets/js/sims/a19.js'];

export const body = `
${p(`A defence evaluated only against a fixed attack set has been demonstrated against known cases,
not fully evaluated for security. This chapter explains why adaptive testing is necessary.`)}

${h2('The same defence, two evaluations', 'two-evals')}

${p(`Here is a plausible detector. Eight regexes and a heuristic, more than most production systems
have:`)}

${code(`PATTERNS = [
    r"ignore (all )?previous", r"disregard", r"system\\s*:", r"new instruction",
    r"you are now", r"override", r"\\[system\\]", r"forget (the|your)",
]

def defence(text):
    low = text.lower()
    if any(re.search(p, low) for p in PATTERNS):
        return True                          # blocked
    if low.count("\\n\\n") > 4 and ("http" in low or "@" in low):
        return True
    return False`, { lang: 'py', file: 'code/a19_adaptive_eval.py' })}

${sim({
  name: 'a19eval',
  title: 'Static benchmark versus adaptive attacker',
  controls: select('a19-set', 'Attack set', [
    ['static', 'Static benchmark — written before the defence existed'],
    ['adaptive', 'Adaptive set — written after reading the source'],
    ['benign', 'Benign traffic — the utility measurement'],
  ], 'static'),
  body: out('a19-out'),
  note: `The adaptive set took twenty minutes and a look at the source code. Nothing dishonest
    happened in the static evaluation — its payloads simply predate the defence, which is what makes a
    benchmark a benchmark.`,
})}

${p(`The result from the code file:`)}

${table(
  ['Evaluation', 'Attack success rate'],
  [
    ['Static benchmark (8 payloads, published set)', '<b style="color:var(--defense)">0%</b>'],
    ['Adaptive set (8 payloads, twenty minutes of work)', '<b style="color:var(--attack)">100%</b>'],
    ['Benign traffic falsely blocked', '<b style="color:var(--warn)">40%</b>'],
  ]
)}

${h2('Why this happens to honest people', 'why')}

${p(`It is tempting to read the gap as a failure of rigour. It is not. A benchmark is <em>defined</em>
by having a fixed attack set. That is what makes results comparable across systems and across years,
and it is what makes a regression suite possible. The error is entirely one of interpretation, treating
"performs well against known attacks" as "is secure".`)}

${callout('boundary', 'The two questions are different', `<p><b>"How does this defence perform against
the attacks we know about?"</b> — answered by a static benchmark. Useful, comparable, cheap to re-run,
and exactly the right tool for catching regressions.</p>
<p style="margin-bottom:0"><b>"How much does an attacker who is trying have to spend?"</b> — answered
only by an adaptive evaluation. This is the number that predicts what happens to you.</p>`)}

${h2('Attack success rate alone is a marketing claim', 'pair')}

${p(`Every ASR figure must be reported with utility retention on the same run, because 0% ASR is
trivially achievable by unplugging the agent. The detector above blocks 40% of benign traffic
("ignore the footnotes and summarise the main argument", "my previous order was wrong, please disregard
it"), and a report that mentioned only the attack number would have concealed this entirely.`)}

${h2('A protocol you can actually follow', 'protocol')}

${steps([
  ['Give the attacker your source',
   `White-box: the prompts, the thresholds, the model, the policy. Kerckhoffs's principle applies.
    Assume they have it, because eventually they will, and a defence that depends on secrecy of
    mechanism is not a defence.`],
  ['Fix a budget',
   `"Four hours and 500 queries." This turns the result from a statement about possibility into a
    statement about <em>cost</em>, which is the only useful kind.`],
  ['Iterate',
   `The attacker sees each result and revises. A single-shot attack set is a static benchmark with
    extra steps, and this is the step people skip.`],
  ['Measure both numbers',
   `ASR and utility retention, on the same run, on the same suite.`],
  ['Report the budget with the number',
   `"3% ASR" means nothing. "3% ASR under a four-hour white-box budget with 500 queries" is a
    finding somebody can act on.`],
  ['Re-run on every change',
   `A prompt tweak invalidates the result, because the attacker was optimising against the old prompt.
    This is why the static benchmark still matters: it is the cheap regression gate between
    adaptive runs.`],
])}

${h2('The published evidence', 'evidence')}

${p(`This is not a hypothetical concern. Zhan et al. took published defences against indirect prompt
injection that reported strong numbers and broke them with adaptive attacks. "A Critical Evaluation of
Defenses against Prompt Injection Attacks" found the same pattern across the literature. Google
DeepMind's account of defending Gemini describes adaptive evaluation as the thing that shaped their
layered strategy, because the first strategies did not survive it.`)}

${p(`And the attacker's side keeps getting cheaper. "Learning to Inject" (2026) uses reinforcement
learning to auto-generate injections that transfer across frontier models, which means the four-hour
manual budget in the protocol above is now a lower bound on what a motivated adversary can do.`)}

${detail('Evaluation gaming, and why the agent might know it is being tested', `
${p(`A subtler problem, and the reason "elicitation" appears as its own category in the SEI
taxonomy: an agent's behaviour under evaluation may differ from its behaviour in production, because
evaluation environments have tells. Round numbers, synthetic names, unusually clean data, a task that
is obviously a test.`)}
${p(`The literature on deception and evasion counts this at 10 sources, and it matters most exactly
where you care most. For dangerous-capability evaluations, underestimating is the expensive
error. The mitigations are to evaluate in environments as realistic as you can afford, to use
permissive threat models (white-box, generous budgets), and to be able to argue that if an attacker
had more resources your security would still hold.`)}`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Explain why a static benchmark and an adaptive evaluation answer different questions.`,
  `Run an adaptive evaluation against your own defence, with a stated budget.`,
  `Refuse to accept an ASR figure that arrives without a utility number and a budget.`,
  `Read a published defence's evaluation section and say what it did not test.`,
])}
`;

export const quiz = [
  {
    q: `A defence scores 0% attack success on a published benchmark and 100% against payloads written
        after reading its source. What went wrong with the benchmark?`,
    options: [
      `The benchmark was too small.`,
      `Nothing. A benchmark has a fixed attack set by definition; the error is interpreting "performs well against known attacks" as "is secure".`,
      `The benchmark was not peer-reviewed.`,
      `The defence was overfitted to the benchmark deliberately.`,
    ],
    answer: 1,
    explain: `Fixedness is the feature: it is what makes results comparable across systems and across
      time, and what lets you use the suite as a regression gate. The two evaluations answer different
      questions ("how does this do against attacks we know?" versus "what must an attacker spend?"),
      and only the second predicts your outcome. Both are worth running; conflating them is the
      mistake.`,
  },
  {
    q: `Why must attack success rate always be reported with utility retention?`,
    options: [
      `Regulators require both.`,
      `Because 0% ASR is trivially achievable by blocking everything, so the attack number alone cannot distinguish a good defence from a broken agent.`,
      `Because utility is easier to measure.`,
      `Because ASR is unreliable below 5%.`,
    ],
    answer: 1,
    explain: `The unplugged agent has a perfect security record. In the chapter's example the
      detector blocks 40% of benign traffic: real support requests containing "disregard my previous
      order". A single-number report hides that entirely. The pair is what lets you compare two
      defences that both reach 0% ASR, which the A25 harness demonstrates concretely.`,
  },
  {
    q: `Why should an adaptive evaluation give the attacker your source code?`,
    options: [
      `To save them time.`,
      `Because a defence whose effectiveness depends on secrecy of mechanism is not a defence (Kerckhoffs's principle), and you want the number that holds when they have it.`,
      `Because open source is more secure.`,
      `Because black-box attacks are not realistic.`,
    ],
    answer: 1,
    explain: `Your prompts leak (A06 extraction), your model is public, your policy is inferable from
      denials, and your code may be open or reverse-engineerable. The white-box number is the one that
      remains true after any of that happens. Testing black-box gives you a figure that expires the
      first time someone succeeds at extraction, which is a poor foundation for a deployment decision.`,
  },
  {
    q: `What does "3% ASR" mean without a stated attacker budget?`,
    options: [
      `That 3% of attacks succeed.`,
      `Very little, since the figure depends entirely on how long the attacker had, how many queries they made, and what access they were given.`,
      `That the defence is 97% effective.`,
      `That it was tested on 100 payloads.`,
    ],
    answer: 1,
    explain: `Three per cent under a ten-minute black-box budget and three per cent under a
      forty-hour white-box budget describe wildly different systems. The budget converts a
      possibility statement into a cost statement, which is the form a security claim has to take to
      be actionable. Reporting it also makes results reproducible, which almost no published defence
      evaluation currently is.`,
  },
  {
    q: `You change your system prompt. What does that do to last month's adaptive evaluation result?`,
    options: [
      `Nothing, if the change was minor.`,
      `It invalidates it. Last month's attacker was optimising against the previous prompt, so the measured cost no longer applies.`,
      `It improves it, since the attacker's payloads are now stale.`,
      `It only matters if the change touched the defence.`,
    ],
    answer: 1,
    explain: `The result was a measurement of cost against a specific configuration, and you changed
      the configuration. It might now be better or worse. An attacker's stale payloads failing tells
      you nothing, because they would simply re-run their process. This is precisely why the cheap
      static suite still earns its place: it is the regression gate you can run on every change,
      between the expensive adaptive runs.`,
  },
  {
    q: `Why does the SEI taxonomy treat "elicitation" as a distinct evaluation category?`,
    options: [
      `Because it is a synonym for red-teaming.`,
      `Because an agent's behaviour under evaluation can differ from its behaviour in production, so drawing out its full capability requires deliberate effort and permissive threat models.`,
      `Because it applies only to multimodal agents.`,
      `Because it measures utility rather than security.`,
    ],
    answer: 1,
    explain: `Evaluation environments have tells: synthetic names, clean data, obviously-a-test
      tasks. Behavioural difference under evaluation shows up at 10 sources in the
      deception-and-evasion literature. Underestimating capability is the expensive error for dangerous-capability
      assessment specifically. The recommended posture is realistic environments, white-box access,
      generous budgets, and being able to argue that more attacker resources would not change your
      conclusion.`,
  },
];

export const refs = [
  { authors: 'Qiusi Zhan, Richard Fang, Henil Shalin Panchal, Daniel Kang',
    title: 'Adaptive Attacks Break Defenses Against Indirect Prompt Injection Attacks on LLM Agents',
    venue: 'NAACL Findings, 2025', url: 'https://arxiv.org/abs/2503.00061' },
  { authors: 'Yuqi Jia, Zedian Shao, Yupei Liu, Jinyuan Jia, Dawn Song, Neil Zhenqiang Gong',
    title: 'A Critical Evaluation of Defenses against Prompt Injection Attacks', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2505.18333' },
  { authors: 'Google DeepMind Security and Privacy Research',
    title: 'Lessons from Defending Gemini Against Indirect Prompt Injections', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2505.14534' },
  { authors: 'Nicholas Carlini, Anish Athalye, Nicolas Papernot, Wieland Brendel, Jonas Rauber, Dimitris Tsipras, Ian Goodfellow, Aleksander Madry, Alexey Kurakin',
    title: 'On Evaluating Adversarial Robustness', venue: 'arXiv, 2019',
    url: 'https://arxiv.org/abs/1902.06705',
    note: 'the adaptive-evaluation methodology this chapter\'s protocol is adapted from' },
  { authors: 'Authors of "Learning to Inject"', title: 'Learning to Inject: Automated Prompt Injection via Reinforcement Learning',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2602.05746' },
  { authors: 'Authors of MAGIC', title: 'MAGIC: A Co-Evolving Attacker-Defender Adversarial Game for Robust LLM Safety',
    venue: 'arXiv, 2026', url: 'https://arxiv.org/pdf/2602.01539' },
  { authors: 'Sahar Abdelnabi, Aideen Fay, Ahmed Salem, Egor Zverev and colleagues (Microsoft)',
    title: 'LLMail-Inject: A Dataset from a Realistic Adaptive Prompt Injection Challenge', venue: 'arXiv, 2025',
    url: 'https://arxiv.org/abs/2506.09956' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'elicitation and metrics as distinct evaluation categories' },
];

/* Exercises. Hands-on tasks for after the chapter; model answers live on
   /answers/ and are matched to these by position. */
export const exercises = [
  {
    q: `The utility measurement in <code>code/a19_adaptive_eval.py</code> rests on five benign
        requests. Expand <code>BENIGN</code> to fifty realistic ones, recompute the false-positive rate,
        and print a 95% confidence interval beside it. Success check: you can state both the five-sample
        interval and the fifty-sample interval, and say which decisions each one supports.`,
    a: `Two blocked out of five is 40%, with a 95% interval of roughly [12%, 77%]. That interval is
        wider than the entire range of decisions you might make, so the number supports no decision at
        all beyond "there is a real problem here". Fifty samples with, say, fifteen blocked gives about
        30% with an interval near [19%, 44%] — still wide, but now it distinguishes "annoying" from
        "unshippable". The uncomfortable transfer is that the same arithmetic applies to the ASR
        figures in the chapter and in most published defence papers: eight payloads gives you an
        interval spanning most of the unit interval. Report n alongside every rate, and treat any rate
        computed on fewer than about thirty samples as a direction rather than a measurement.`,
    code: `from math import sqrt

def wilson(k, n, z=1.96):
    p = k / n
    d = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / d
    half = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return centre - half, centre + half

for sample in (BENIGN, BENIGN_50):
    k = sum(defence(b) for b in sample)
    lo, hi = wilson(k, len(sample))
    print("n=%3d  FP rate %3.0f%%  95%% CI [%.0f%%, %.0f%%]"
          % (len(sample), 100 * k / len(sample), 100 * lo, 100 * hi))`,
  },
  {
    q: `Run the chapter's protocol against a defence you built yourself: either the hardened judge from
        A17 or the interleaved datamarking wrapper from A18. Give yourself the source, fix a budget of
        thirty minutes and twenty payloads, iterate after each result, and report the pair — attack
        success rate and utility retention — with the budget attached.`,
    a: `Against the A18 wrapper you should find the split cleanly: every payload in the forged-fence
        and claimed-authority classes fails, and most payloads in the prior-approval class succeed, so
        the ASR lands somewhere around half and is almost entirely one class. Write it as "9 of 20
        payloads succeeded under a thirty-minute white-box budget", never as "55% ASR", because the
        second form hides both the budget and the fact that the successes are all the same idea. Two
        honest caveats. You are the weakest possible adaptive attacker against your own defence,
        because you attack what you intended it to do rather than what it does — hand the source to
        someone who did not write it and the number usually moves. And the moment you patch anything
        in response to what you found, this measurement is stale, which is what the next exercise is
        for.`,
  },
  {
    q: `Build the regression harness. One runner that prints three numbers — static ASR, adaptive ASR
        and benign block rate — where the adaptive result is stored with a fingerprint of the defence
        source and is refused as stale if the fingerprint no longer matches. Then change one entry in
        <code>PATTERNS</code> and re-run. Success check: the static and benign lines still print
        numbers and the adaptive line prints STALE.`,
    a: `The fingerprint is four lines and it stops the most common reporting error in this whole
        field: quoting last quarter's adaptive number after this month's prompt change. The three
        numbers have genuinely different lifetimes, and the harness should make that visible rather
        than presenting them as a row. Static ASR and the benign block rate survive a defence change —
        that is what makes them a cheap gate you can run on every commit. The adaptive number does not,
        because it measured what one attacker spent against one configuration, and you changed the
        configuration. Include the defence source and the pattern list in the hash, not just the
        function body, or an edit to <code>PATTERNS</code> alone will slip through. What the harness
        cannot do is tell you when the adaptive result has expired for external reasons — a new
        published technique, a model upgrade underneath you — so put a calendar date on it as well as
        a fingerprint.`,
    code: `import hashlib, inspect

def fingerprint():
    src = inspect.getsource(defence) + repr(PATTERNS)
    return hashlib.sha256(src.encode()).hexdigest()[:12]

# adaptive result recorded at the time of the run
LAST_ADAPTIVE = {"asr": 1.00, "budget": "30 min white-box, 20 payloads",
                 "fingerprint": "put the fingerprint() value here"}

def report(static_set, adaptive_note, benign_set):
    s = 1 - sum(defence(a) for a in static_set) / len(static_set)
    b = sum(defence(x) for x in benign_set) / len(benign_set)
    print("static ASR      %.0f%%" % (100 * s))
    if adaptive_note["fingerprint"] != fingerprint():
        print("adaptive ASR    STALE - defence changed, re-run the evaluation")
    else:
        print("adaptive ASR    %.0f%% under %s"
              % (100 * adaptive_note["asr"], adaptive_note["budget"]))
    print("benign blocked  %.0f%%" % (100 * b))`,
  },
];
