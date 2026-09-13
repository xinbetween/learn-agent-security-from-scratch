/* The cheat sheet's own content.

   SPINE is the handful of through-lines that survive the whole course; they are
   the part a reader should be able to recite. KEYS is one distilled pair per
   chapter: `claim` is what the chapter establishes, `counter` is what you do
   about it and where that runs out. Everything else on /cheatsheet/ is
   assembled from collections that already exist — the threat map, the defence
   map and the curriculum — so it cannot drift out of step with them. */

export const SPINE = [
  [`The context is one flat sequence`,
   `There is no privileged channel, no out-of-band control plane, no parameterised query for a transformer. A model cannot distinguish an instruction it was given from an instruction it read. Every defence that depends on it telling them apart raises the attacker's cost; none of them raises the ceiling.`],
  [`The loop is the vulnerability`,
   `An agent appends bytes chosen by a stranger into the same context that holds the goal, then calls tools with the principal's own authority. Find the line where those bytes enter and you have found the trust boundary. Everything else in this course is a question about that one arrow.`],
  [`Ask the four questions first`,
   `What enters the context that a stranger can write? What can the agent do, and with whose authority? What can leave, and by what route? What is irreversible? Answer those for a real system and the threat model writes itself.`],
  [`Bound the damage, do not detect the attack`,
   `A control that still holds when the model is fully compromised beats a classifier that catches ninety-nine attacks in a hundred. Detection buys the attacker's time; architecture buys a ceiling. When you read a mitigation, ask which of the two it is.`],
  [`Spend oversight on what cannot be undone`,
   `Human approval is a fixed budget, not a free control. Sort actions by how hard they are to reverse and spend the budget at the top of that list. Every needless prompt trains the operator to click through the one that mattered.`],
  [`Evaluate adaptively, or not at all`,
   `A static benchmark measures the attacks someone thought of before you shipped. Show the attacker your defence, let them try again, and report that number. A defence that has only been tested against its own test set has not been tested.`],
];

export const KEYS = {
  a01: {
    claim: `Every agent is one loop that appends tool output into the same context as the user's goal, then calls tools with the principal's own authority.`,
    counter: `Interrogate any agent with four questions: injection surface, action surface, exfiltration channels, irreversible actions. Telling the model to ignore retrieved instructions bounds nothing.`,
  },
  a02: {
    claim: `Roles are flattened into one token sequence, so system, user and tool text compete on equal terms. There is no parameterised query for a transformer.`,
    counter: `A fresh random sentinel per request cannot be forged, unlike a fixed fence. Nothing stops a payload that politely asks from inside the marked region.`,
  },
  a03: {
    claim: `An agent is exploitable for data theft only when it holds private data, exposure to untrusted content, and a way for bytes to leave.`,
    counter: `Cutting egress usually buys most: an outbound allow-list contains a total hijack. The trifecta is necessary, not sufficient; destruction and bad answers need no channel out.`,
  },
  a04: {
    claim: `The SEI taxonomy maps six threat surfaces and twenty-five vulnerability classes, so a review covers the field systematically rather than the risks you happen to recall.`,
    counter: `Run it as a checklist and defend every not-applicable in writing. No single source has the whole map; each author's background predicts what they omitted.`,
  },
  a05: {
    claim: `STRIDE, MAESTRO, OWASP, ATLAS and the kill chain applied to one agent produce different findings, because each framework's structure decides what it cannot see.`,
    counter: `Choose one lens deliberately and state what it misses, rather than stacking five. Coverage comes from naming the blind spot, not from running more frameworks.`,
  },
  a06: {
    claim: `In direct injection the attacker is the user, and the exercise shows a keyword blocklist losing to an infinite target set and a faster-iterating opponent.`,
    counter: `Keep the filter for telemetry and cheap traffic, and treat the system prompt as public. Filtering raises attacker cost; it never bounds what a success achieves.`,
  },
  a07: {
    claim: `Indirect injection plants the payload in content the agent retrieves, so one poisoned page hijacks every task that reaches it, with no attacker session required.`,
    counter: `Break the last link in code: a fixed capability set, and fetches only to URLs the user named. The model is still hijacked; the hijack yields nothing.`,
  },
  a08: {
    claim: `Computer-use agents act on screenshots, DOM dumps and accessibility trees, so instructions hide in text that the supervising human genuinely never sees on screen.`,
    counter: `A coordinate carries no semantics, so policy must be reconstructed from the accessibility tree. For these agents a disposable VM with no live sessions is the primary control.`,
  },
  a09: {
    claim: `Data leaves by eight channels — rendered images, link previews, DNS, file writes — and in most of them the client, not the agent, issues the request.`,
    counter: `An egress allow-list that survives suffix, userinfo and rebinding tricks, plus a client-side CSP on rendering. Neither stops a user clicking, nor a legitimate recipient.`,
  },
  a10: {
    claim: `A hijacked agent steals no credential; it redirects a deputy that already holds one, so the malicious requests authenticate correctly and the audit log looks clean.`,
    counter: `Narrow the grant, attenuate it per task, carry provenance into the runtime. A human gate on irreversible actions only raises cost, and degrades under fatigue.`,
  },
  a11: {
    claim: `A tool description is prompt text, so installing an MCP server edits your instructions — before the tool is ever called, and again whenever the server updates.`,
    counter: `Pin the manifest by content hash and re-prompt on change; sandbox each server with its own scoped credentials. A description must never widen its own scope.`,
  },
  a12: {
    claim: `Poisoning a corpus or a memory store buys persistence: a single edit fires on every future retrieval, for every user, until somebody notices and removes it.`,
    counter: `Provenance on each memory write, no automatic writes from tool output, per-user isolation and TTLs. Deleting the malicious source does not undo what the agent already stored.`,
  },
  a13: {
    claim: `A skill is instruction text the agent obeys, which makes it a supply-chain dependency more dangerous than a library of the same size and popularity.`,
    counter: `Pin by hash, allow-list installs, never resolve a skill by name at use time. Scanning misses composition: two safe skills chain into an exfiltration pipeline.`,
  },
  a14: {
    claim: `A backdoor lives in the weights, and its trigger need not look like an instruction, so every defence that inspects the prompt is structurally blind to it.`,
    counter: `Supply-chain hygiene — verify the weight digest, control fine-tuning data — plus containment, so that firing the trigger reaches nothing worth taking. Inspection is unavailable.`,
  },
  a15: {
    claim: `An injection that tells its host to forward itself spreads between agents, and the trifecta composes along reachable paths that every individual node passes cleanly.`,
    counter: `Score paths, not nodes, and pass provenance and stated uncertainty with every handoff. Critic agents reduce errors while widening the surface one compromise reaches.`,
  },
  a16: {
    claim: `Attacks that steal nothing still cost money. Fan-out, recursive loops and slowly expanding tool results inflate spend up to 658 times with no vulnerability involved.`,
    counter: `Budget per run, per identity, per tool and per tenant. Only the per-identity cap closes denial of wallet; a tool result-size cap kills the amplifier.`,
  },
  a17: {
    claim: `At a real base rate a detector at 99% true-positive and 1% false-positive rate yields under 1% precision, so analysts correctly learn to ignore every alert.`,
    counter: `Put the classifier on the tool-result path where the untrusted bytes arrive, and treat it as cost imposed on the attacker, never as what bounds the worst case.`,
  },
  a18: {
    claim: `A per-request random sentinel makes the untrusted region unforgeable, but the model still decides what to obey. Marking gives you a boundary, not an unbreakable rule.`,
    counter: `Datamark every untrusted span and prefer instruction-hierarchy or SecAlign training; both only raise cost. Jatmo alone removes instruction-following, at one fine-tuned model per task.`,
  },
  a19: {
    claim: `A defence scoring 0% attack success on a fixed benchmark can reach 100% against payloads written after reading its source. Benchmarks measure known attacks, not security.`,
    counter: `Run adaptive tests against your own defence with a stated attacker budget, and report utility retention on the same run; 0% is trivial if you unplug the agent.`,
  },
  a20: {
    claim: `Six patterns bound injection by removing a capability: action-selector, plan-then-execute, dual LLM, code-then-execute, map-reduce, context minimisation. Each guarantee is paid for in ability.`,
    counter: `Choose from the task shape and defend what you gave up. None makes the output trustworthy, and open-ended action on untrusted content has no secure architecture.`,
  },
  a21: {
    claim: `Tag every value with its sources and readers, taking the union of sources and the intersection of readers; the sink policy never consults the untrusted text at all.`,
    counter: `Paraphrasing, encoding and mixing cannot launder a tag. The costs are writing the policy, maintaining an interpreter, and over-tainting, which needs explicit audited declassification points.`,
  },
  a22: {
    claim: `Attenuation is intersection, so a child token can only narrow its parent. An injected demand for <code>repo.admin</code> yields fewer permissions rather than more.`,
    counter: `Mint per-run credentials narrowed by scope, resource and lifetime, and carry the delegation chain so an audit names which agent acted, not merely which user.`,
  },
  a23: {
    claim: `Blast radius is decided by the environment and its enforcement points, not by the agent's intent. An in-process egress check is documentation once the agent runs generated code.`,
    counter: `Parse the URL and compare hostnames, normalise paths before checking, enforce in the pod or proxy. Containment bounds reach; it never fixes an attacker-influenced answer.`,
  },
  a24: {
    claim: `Approval attention is a shared, depleting budget, so a confirmation on a reversible action spends from the same account that guards the irreversible one.`,
    counter: `Grade tools by reversibility and gate only what cannot be undone. Show the data leaving, the recipient, the instruction's provenance, and a stop-the-task option.`,
  },
  a25: {
    claim: `Every public benchmark shares a fixed attack set, so a good score is a statement about known attacks, and none of them covers your tools, data or policies.`,
    counter: `Build a harness that reports attack success and utility from the same run, publish the case list, and write down what the evaluation does not cover.`,
  },
  a26: {
    claim: `Four fields make a log investigable: <code>caused_by</code>, <code>provenance</code>, chained hashes and policy denials. Without causality the trace says what happened, never why.`,
    counter: `Flag actions whose causal ancestry is untrusted, compute slow-channel signals across sessions rather than per request, and keep metadata long while content stays short and redacted.`,
  },
  a27: {
    claim: `Over 60% of 36 real-world case studies described fewer than five of 33 control categories, which makes <b>industry standard</b> a low bar rather than a target.`,
    counter: `Gate each deployment phase on exit criteria and a rollback you could run today. Org-wide kill without a deploy is architecture, and provenance must predate the incident.`,
  },
};
