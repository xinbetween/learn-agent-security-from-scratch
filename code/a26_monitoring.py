#!/usr/bin/env python3
"""
A26 -- Monitoring, Logging and Runtime Detection.

Everything an agent does is a token, a syscall or an HTTP request. This file
builds a trajectory log worth having, a drift detector, and the aggregate
analysis that catches what per-message inspection cannot.

    python3 a26_monitoring.py
"""
import hashlib
import json
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

# ---------------------------------------------------------------------------
# 1. the trajectory record
# ---------------------------------------------------------------------------

rule("what a trajectory entry must contain")

def entry(run_id, step, kind, **fields):
    rec = {"run": run_id, "step": step, "kind": kind, "ts": 1740000000 + step, **fields}
    # tamper-evidence: each record chains to the previous one
    prev = entry.prev.get(run_id, "0" * 16)
    rec["prev"] = prev
    rec["hash"] = hashlib.sha256((prev + json.dumps(rec, sort_keys=True)).encode()).hexdigest()[:16]
    entry.prev[run_id] = rec["hash"]
    return rec
entry.prev = {}

TRACE = [
 entry("r1", 1, "user_request", text="Summarise https://c.example/g", principal="alice"),
 entry("r1", 2, "tool_call", tool="http_get", args={"url": "https://c.example/g"},
       caused_by="user_request", provenance="trusted"),
 entry("r1", 3, "tool_result", tool="http_get", bytes=3100, sha="9f2c...",
       source="untrusted_web", contains_imperative=True,
       caused_by="tool_call#2", provenance="trusted"),
 entry("r1", 4, "tool_call", tool="read_file", args={"path": ".env"},
       caused_by="tool_result#3", provenance="untrusted_web"),
 entry("r1", 5, "policy_decision", action="send_email", verdict="DENY",
       reason="not in task capability set", caused_by="tool_result#3"),
]
for r in TRACE:
    print("  " + json.dumps(r)[:118])

print("""
  The fields that matter and are usually missing:

     caused_by      which earlier record produced this one   <- A21 gives it to you
     provenance     the trust level of the causing data
     source         where tool output came from
     prev / hash    tamper-evident chaining
     policy_decision   DENIED actions, not just successful ones

  A log of successful tool calls tells you what happened. A log with
  caused_by tells you WHY, which is the only question an incident actually
  asks -- and without it a two-hour investigation becomes a two-week one.""")

assert all("caused_by" in r or r["kind"] == "user_request" for r in TRACE)
ok("every record except the root names its cause")

# ---------------------------------------------------------------------------
# 2. tamper evidence
# ---------------------------------------------------------------------------

rule("detecting a doctored log")

def verify(trace):
    prev = "0" * 16
    for r in trace:
        body = {k: v for k, v in r.items() if k != "hash"}
        expect = hashlib.sha256((prev + json.dumps(body, sort_keys=True)).encode()).hexdigest()[:16]
        if expect != r["hash"]:
            return False, r["step"]
        prev = r["hash"]
    return True, None

good, _ = verify(TRACE)
print(f"  intact chain            {'verifies' if good else 'FAILS'}")

doctored = [dict(r) for r in TRACE]
doctored[3]["args"] = {"path": "notes.txt"}     # attacker hides the .env read
okv, at = verify(doctored)
print(f"  after editing step 4    {'verifies' if okv else f'FAILS at step {at}'}")
assert good and not okv
ok("chaining makes a silent edit impossible; an attacker must break the chain visibly")

# ---------------------------------------------------------------------------
# 3. drift detection -- did the agent stop doing what it was asked?
# ---------------------------------------------------------------------------

rule("task drift")

def drift(trace):
    """
    Cheap, structural version: an action whose causal ancestry is untrusted and
    whose tool is not in the plan implied by the user's request.
    """
    request = next(r for r in trace if r["kind"] == "user_request")
    implied = {"http_get"} if "http" in request["text"] else set()
    flagged = []
    for r in trace:
        if r["kind"] in ("tool_call", "policy_decision"):
            tool = r.get("tool") or r.get("action")
            if tool not in implied and r.get("provenance") == "untrusted_web":
                flagged.append((r["step"], tool, r.get("caused_by")))
    return flagged

for step, tool, cause in drift(TRACE):
    print(f"  step {step}: {tool} — not implied by the request, caused by {cause}")
assert drift(TRACE)
ok("structural drift detection needs no model, only provenance")

print("""
  The model-based version is stronger and costlier: Abdelnabi et al. detect
  task drift from ACTIVATION deltas between the model's state before and after
  untrusted content is added -- an internal signal that does not depend on
  parsing the text. Needs white-box access.""")

# ---------------------------------------------------------------------------
# 4. the aggregate view -- what per-message inspection cannot see
# ---------------------------------------------------------------------------

rule("aggregate analysis")

SESSIONS = [{"id": i, "dest": "api.internal.corp", "out_bytes": 400} for i in range(60)]
for i in range(40):                       # the slow channel from A09
    SESSIONS.append({"id": 100 + i, "dest": "cdn.example", "out_bytes": 12})

dests = Counter(s["dest"] for s in SESSIONS)
print("  outbound destinations across 100 sessions:")
for d, n in dests.most_common():
    tiny = sum(1 for s in SESSIONS if s["dest"] == d and s["out_bytes"] < 32)
    flag = "  <- 40 sessions, all tiny payloads, one destination" if tiny > 20 else ""
    print(f"     {d:<24}{n:>4} sessions{flag}")

print("""
  No individual request here is anomalous: twelve bytes to a CDN is nothing.
  The PATTERN -- one destination, many sessions, uniformly tiny payloads -- is
  the A09 slow channel, and it is only visible in aggregate.

  Signals worth computing across sessions:
     repeated contact with the same rare destination
     uniform, small outbound payloads
     cost per request rising with no change in task mix (A16)
     the same tool-call sequence appearing across unrelated users
     a spike in policy DENIALS from one identity""")

assert dests["cdn.example"] == 40
ok("A26 complete -- a doctored log breaks its own hash chain at the edited record")
