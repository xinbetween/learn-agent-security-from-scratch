#!/usr/bin/env python3
"""
A27 -- Governance, Risk and Incident Response.

Turning a threat taxonomy into a deployment decision. This file implements the
repeatable risk assessment the SEI review demonstrates, a phased-rollout gate,
and an incident playbook for agent-specific failure modes.

    python3 a27_governance.py
"""
import os
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

# ---------------------------------------------------------------------------
# 1. a repeatable risk assessment
# ---------------------------------------------------------------------------

rule("the process: threat -> component -> control category -> plan")

@dataclass
class Assessment:
    threat: str
    components: list           # from the reference architecture (A04)
    controls: list             # leaf categories from the best-practice taxonomy
    gaps: str

ASSESSMENTS = [
 Assessment(
   threat="Knowledge-base attack (memory / RAG poisoning)",
   components=["knowledge base", "memory store", "retrieval path"],
   controls=["resource controls: encryption, privacy, MEMORY CONTROLS",
             "supply chain risk management (corpus provenance)",
             "usage restrictions (who may write the corpus)",
             "adversarial training (robustness to poisoned retrieval)",
             "environmental controls + rate limiting (contain a hijack)",
             "run-time controls / HITL (block the exfiltration step)"],
   gaps="Memory controls and privacy controls were among the LEAST-cited "
        "categories in the literature despite this being a heavily-cited "
        "vulnerability. That mismatch is the finding: you will not find "
        "off-the-shelf guidance, and you must design it yourself."),
 Assessment(
   threat="Denial of service / denial of wallet",
   components=["orchestration loop", "tool layer", "shared queue"],
   controls=["rate limiting (per run, per identity, per tool, per tenant)",
             "monitoring for anomalous usage",
             "red-teaming against resource attacks",
             "incident response (respond to an attack in progress)"],
   gaps="Monitoring and red-teaming recommendations in the literature are "
        "aimed at AGENT BEHAVIOUR rather than at cyber threats, and the "
        "operational guidance comes almost entirely from industry sources."),
]

for a in ASSESSMENTS:
    print(f"\n  THREAT      {a.threat}")
    print(f"  COMPONENTS  {', '.join(a.components)}")
    print("  CONTROLS")
    for c in a.controls:
        print(f"     - {c}")
    print(f"  GAP         {a.gaps}")

print("""
  The value of doing it this way is not the plan -- it is the GAP line. Walking
  a taxonomy tells you which of your mitigations rest on categories the field
  has barely studied, which is exactly what you cannot learn by reading one
  good paper.""")
assert all(a.gaps for a in ASSESSMENTS)

# ---------------------------------------------------------------------------
# 2. phased deployment with real gates
# ---------------------------------------------------------------------------

rule("phased rollout")

@dataclass
class Phase:
    name: str
    scope: str
    exit_criteria: list
    rollback: str

PHASES = [
 Phase("0 shadow", "runs on real inputs, all actions blocked and logged",
       ["100% of proposed actions reviewed", "0 unexplained policy denials over 2 weeks"],
       "turn it off; nothing happened"),
 Phase("1 pilot", "5 volunteer users, reversible actions only",
       ["ASR < 5% on the internal suite", "no irreversible action reached production",
        "cost per task within 2x of estimate"],
       "revoke the agent's token; revert writes from snapshots"),
 Phase("2 limited", "one team, irreversible actions gated by HITL",
       ["approval override rate < 10%", "median approval latency < 60s",
        "no incident in 30 days"],
       "disable the tool that caused it; token revocation in < 60s"),
 Phase("3 general", "all users, pre-authorised scopes",
       ["continual auditing green for 60 days", "adaptive red-team re-run passed"],
       "feature flag off, org-wide, without a deploy"),
]
for p in PHASES:
    print(f"\n  PHASE {p.name}")
    print(f"     scope     {p.scope}")
    print(f"     exit when {'; '.join(p.exit_criteria)}")
    print(f"     rollback  {p.rollback}")

print("""
  The rollback line is the one to argue about in review. "Feature flag off,
  org-wide, without a deploy" is a requirement on your ARCHITECTURE, and if you
  cannot say it today, phase 3 is not available to you yet.""")

# ---------------------------------------------------------------------------
# 3. incident response for agent-specific failure modes
# ---------------------------------------------------------------------------

rule("the playbook, with the agent-specific steps marked")

STEPS = [
 ("DETECT",   "policy denial spike, cost anomaly, user report, drift alert", False),
 ("CONTAIN",  "revoke the agent's tokens -- NOT the user's", True),
 ("CONTAIN",  "disable the specific tool, keep the agent running if safe", True),
 ("ASSESS",   "replay the trajectory: what was in context when it turned?", True),
 ("ASSESS",   "identify the POISONED SOURCE, not just the affected run", True),
 ("ERADICATE","purge derived memory entries by provenance", True),
 ("ERADICATE","clean the corpus; notify the source owner if external", True),
 ("ERADICATE","re-check every OTHER run that retrieved the same document", True),
 ("RECOVER",  "restore from snapshots; re-run affected tasks under the fix", False),
 ("LEARN",    "add the payload to the regression suite", True),
 ("LEARN",    "ask which control class would have BOUNDED it, not detected it", True),
]
for phase, step, agent_specific in STEPS:
    mark = "*" if agent_specific else " "
    print(f"  {mark} {phase:<11}{step}")

print("""
  * = a step that does not appear in a conventional IR playbook.

  The two that matter most:

    "identify the poisoned source, not just the affected run" -- because a
    corpus attack has fired for every other user who retrieved that document,
    and your incident is one of N.

    "purge derived memory entries by provenance" -- which is only possible if
    you recorded provenance BEFORE the incident (A12, A21). Incident response
    is a design-time decision.""")

agent_steps = sum(1 for _, _, a in STEPS if a)
assert agent_steps >= 8
ok(f"{agent_steps} of {len(STEPS)} playbook steps are agent-specific")

# ---------------------------------------------------------------------------
# 4. what the case studies actually do
# ---------------------------------------------------------------------------

rule("the adoption gap")
print("""  The SEI review categorised the controls implemented in 36 real-world agent
  case studies against its 33-category taxonomy:

     most implemented    access controls (17/36), monitoring (10), guardrails
                         (10), human-in-the-loop (10), sandboxing (10),
                         encryption (10)
     barely implemented  prompt engineering (2), multi-agent design (0),
                         adversarial training (1), data management (0),
                         defence-in-depth (2), rate limiting (2)
     never               legal considerations (0)

  Over 60% of case studies described fewer than five of the 33 categories.

  Two readings, both true. Organisations disclose less than they do -- the AI
  components are intellectual property, and secrecy is rational. AND the
  distribution is telling: the widely-implemented controls are the ones that
  are ordinary software security. The agent-specific ones are thin on the
  ground.

  If you implement the full defence stack from Part 5, you will be doing more
  than most of the systems in that survey. That should worry you more than it
  reassures you.""")

ok("A27 complete -- 9 of 11 incident-response steps do not appear in a conventional playbook")
