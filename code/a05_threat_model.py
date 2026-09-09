#!/usr/bin/env python3
"""
A05 -- Threat Modelling Frameworks.

Five frameworks run against the same toy agent. The point of the exercise is
not that one wins; it is that each finds threats the others miss, and you can
see exactly which.

    python3 a05_threat_model.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

SYSTEM = """
  TARGET: "Scout" -- a research agent for a consultancy.

    tools     web_search, web_fetch, read_drive(user's Google Drive),
              write_doc(creates a Drive doc), send_slack(posts to a channel)
    identity  runs as the requesting user via OAuth, tokens cached 30 days
    model     hosted API, no fine-tuning
    memory    per-user vector store of past research, written automatically
    deploy    a Slack bot; any employee can @mention it
"""

# ---------------------------------------------------------------------------
FRAMEWORKS = {

"STRIDE (1999, general software)": [
 ("Spoofing",              "Anyone in the Slack workspace can @Scout; no per-request identity check beyond Slack's."),
 ("Tampering",             "The vector store is written by the agent with no provenance field -- memory poisoning is a tampering finding."),
 ("Repudiation",           "No immutable trace linking a Drive write to the request that caused it."),
 ("Information disclosure","read_drive plus send_slack in one session is a cross-tenant leak waiting to happen."),
 ("Denial of service",     "Unbounded web_fetch loop; no per-user token budget."),
 ("Elevation of privilege","30-day cached OAuth means the agent's authority outlives the user's session."),
],

"OWASP Top 10 for LLM Applications": [
 ("LLM01 Prompt injection",  "web_fetch returns arbitrary third-party HTML into context. Primary finding."),
 ("LLM02 Insecure output",   "write_doc content is rendered; injected markdown/HTML reaches readers."),
 ("LLM04 Data poisoning",    "The auto-written vector store is an unauthenticated training-adjacent input."),
 ("LLM06 Excessive agency",  "Full Drive scope for a task that needs three folders."),
 ("LLM07 System prompt leak","Slack bot; anyone can ask it to print its instructions and tool schemas."),
 ("LLM08 Vector weaknesses", "No access control on the vector store; embeddings queryable across projects."),
],

"MAESTRO (agent-specific, 7 layers)": [
 ("L1 Foundation model",  "Hosted; you inherit its alignment and its jailbreaks and cannot patch either."),
 ("L2 Data operations",   "Vector store has no provenance, no TTL, no deletion path."),
 ("L3 Agent frameworks",  "Tool-calling parser: does a malformed ACTION line fail closed?"),
 ("L4 Deployment infra",  "Where do the OAuth tokens live at rest, and who can read that store?"),
 ("L5 Evaluation",        "No adversarial evaluation before launch; no regression suite for injection."),
 ("L6 Security controls", "Guardrails exist on user input only, not on web_fetch results."),
 ("L7 Agent ecosystem",   "Scout can post to Slack; other bots read Slack. Undeclared agent-to-agent edge."),
],

"MITRE ATLAS (adversary techniques)": [
 ("AML.T0051 LLM prompt injection", "Direct via Slack, indirect via fetched pages."),
 ("AML.T0057 LLM data leakage",     "Drive contents into a Slack channel with wider membership."),
 ("AML.T0053 LLM plugin compromise","web_fetch is the plugin; its output is unvalidated."),
 ("AML.T0018 Backdoor ML model",    "Out of scope for a hosted model -- but in scope for the vendor."),
 ("AML.T0043 Craft adversarial data","Attacker-controlled pages optimised against the guardrail classifier."),
],

"NIST AI RMF (organisational)": [
 ("GOVERN", "Who signs off on Scout's scope change? Is there a documented risk threshold?"),
 ("MAP",    "Is the full inventory of tools, data and downstream consumers written down anywhere?"),
 ("MEASURE","What is the attack success rate today, and against which attack set?"),
 ("MANAGE", "What is the rollback plan when an incident is found? Who can disable the bot in one minute?"),
],
}

print(SYSTEM)
for fw, findings in FRAMEWORKS.items():
    rule(fw)
    for cat, finding in findings:
        print(f"  {cat:<28} {finding}")

# ---------------------------------------------------------------------------
rule("what each framework found that the others did not")

UNIQUE = {
 "STRIDE":  "Repudiation. No other framework asks whether you could reconstruct who caused what.",
 "OWASP":   "LLM08 vector weaknesses -- the embedding store as an access-control object, not just a data store.",
 "MAESTRO": "L7 agent ecosystem. Scout posts to Slack; another bot reads Slack. Nobody drew that edge.",
 "ATLAS":   "Adversarial data crafted against your classifier specifically -- the adaptive attacker (A19).",
 "NIST":    "Who can turn it off, and how fast. A control question, not a threat question, and the one that matters at 3am.",
}
for k, v in UNIQUE.items():
    print(f"  {k:<9} {v}")

print("""
  Recommendation: run STRIDE first (it is fast and it is about your system, not
  about AI), then MAESTRO for the agent-specific layers, then use ATLAS to
  name what you found so other people can search for it. OWASP is the best
  checklist to hand a developer. NIST is the wrapper you need if anyone is
  going to audit you.

  Do not run all five on every change. Run one properly.""")

total = sum(len(v) for v in FRAMEWORKS.values())
assert total >= 25, "five frameworks should produce a substantial finding set"
ok(f"A05 complete -- {total} findings from five lenses on one system")
