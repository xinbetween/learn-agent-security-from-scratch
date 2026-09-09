#!/usr/bin/env python3
"""
A22 -- Identity, Delegation and Least Privilege.

Give the agent its own name and a smaller key. This file builds token
attenuation, a delegation chain that can be verified, and per-task capability
sets -- the controls that turn a total compromise into a bounded one.

    python3 a22_identity.py
"""
import hashlib
import hmac
import json
import os
import sys
import time
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

SECRET = b"demo-signing-key-not-a-real-one"

# ---------------------------------------------------------------------------
# 1. an attenuable token
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Token:
    subject: str                # who this acts as
    actor: str                  # who is actually running (the agent)
    scopes: frozenset
    resources: frozenset        # narrowed to specific objects
    expires: float
    chain: tuple = ()           # the delegation path

    def attenuate(self, scopes=None, resources=None, ttl=None, actor=None) -> "Token":
        """You can only ever narrow. There is no widen()."""
        s = frozenset(scopes) & self.scopes if scopes else self.scopes
        # "*" is the top element: narrowing from it yields whatever was asked for.
        if resources is None:
            r = self.resources
        elif "*" in self.resources:
            r = frozenset(resources)
        else:
            r = frozenset(resources) & self.resources
        e = min(self.expires, time.time() + ttl) if ttl else self.expires
        return Token(self.subject, actor or self.actor, s, r, e,
                     self.chain + (self.actor,))

    def sign(self) -> str:
        body = json.dumps({"sub": self.subject, "act": self.actor,
                           "scp": sorted(self.scopes), "res": sorted(self.resources),
                           "exp": int(self.expires), "chain": list(self.chain)},
                          sort_keys=True)
        return body + "." + hmac.new(SECRET, body.encode(), hashlib.sha256).hexdigest()[:16]

    def permits(self, scope, resource):
        if time.time() > self.expires:
            return False, "expired"
        if scope not in self.scopes:
            return False, f"scope {scope!r} not granted"
        if "*" not in self.resources and resource not in self.resources:
            return False, f"resource {resource!r} not granted"
        return True, "ok"

rule("the token the user has, and the token the agent should get")

user_token = Token(
    subject="alice", actor="alice",
    scopes=frozenset({"mail.send", "mail.read", "drive.read", "drive.write", "repo.admin"}),
    resources=frozenset({"*"}),
    expires=time.time() + 30 * 86400,
)
print(f"  user token     scopes={sorted(user_token.scopes)}")
print(f"                 resources={sorted(user_token.resources)}  ttl=30 days")

task_token = user_token.attenuate(
    scopes={"drive.read"},
    resources={"drive://projects/q3-research"},
    ttl=600,
    actor="research-agent",
)
print(f"\n  task token     scopes={sorted(task_token.scopes)}")
print(f"                 resources={sorted(task_token.resources)}  ttl=10 min")
print(f"                 chain={task_token.chain}")
print(f"\n  signed: {task_token.sign()[:96]}...")

# ---------------------------------------------------------------------------
# 2. what an injection can do with each
# ---------------------------------------------------------------------------

rule("the same hijacked agent, two tokens")

ATTEMPTS = [
 ("mail.send", "mail://any",                       "exfiltrate by email"),
 ("drive.read", "drive://finance/salaries.xlsx",   "read an unrelated document"),
 ("repo.admin", "repo://prod",                     "delete the production repo"),
 ("drive.read", "drive://projects/q3-research",    "the actual task"),
]
for tok_name, tok in (("user token", user_token), ("task token", task_token)):
    print(f"\n  with the {tok_name}:")
    for scope, res, what in ATTEMPTS:
        allowed, why = tok.permits(scope, res)
        print(f"     {'ALLOW' if allowed else 'DENY '}  {what:<34} {'' if allowed else why}")

assert user_token.permits("repo.admin", "*")[0]
assert not task_token.permits("repo.admin", "repo://prod")[0]
assert task_token.permits("drive.read", "drive://projects/q3-research")[0]
ok("the task token permits exactly the task and nothing else")

# ---------------------------------------------------------------------------
# 3. attenuation is one-way
# ---------------------------------------------------------------------------

rule("an agent cannot widen its own grant")
widened = task_token.attenuate(scopes={"repo.admin", "mail.send"})
print("  agent asks for repo.admin and mail.send")
print(f"  result: {sorted(widened.scopes)}")
assert widened.scopes == frozenset({"drive.read"}) or not widened.scopes
ok("intersection, not union -- there is no code path that adds a scope")

# ---------------------------------------------------------------------------
# 4. the delegation chain
# ---------------------------------------------------------------------------

rule("delegation you can audit")
sub_token = task_token.attenuate(scopes={"drive.read"}, ttl=120,
                                 actor="summariser-subagent")
print("  alice -> research-agent -> summariser-subagent")
print(f"  chain: {' -> '.join(sub_token.chain + (sub_token.actor,))}")
print(f"  ttl:   {int(sub_token.expires - time.time())}s (never longer than the parent)")
print("""
  The chain answers the question A10 said your auth stack cannot: WHO CAUSED
  this. Every downstream call carries the path, so an audit log can say
  'alice, via research-agent, via summariser-subagent' rather than 'alice'.""")
assert len(sub_token.chain) == 2

# ---------------------------------------------------------------------------
# 5. the standards this maps onto
# ---------------------------------------------------------------------------

rule("what to use in production instead of this toy")
print("""  OAuth 2.0 Token Exchange (RFC 8693)   the actor/subject distinction above is
                                        `act` and `sub` -- this is a real claim
                                        set, not an invention.
  Macaroons / biscuits                  caveat-based attenuation; narrowing is
                                        possible offline, widening is not.
  SPIFFE / SPIRE                        workload identity, so the agent is a
                                        first-class principal with its own SVID.
  W3C DIDs                              decentralised identity for cross-org
                                        agent-to-agent trust.
  OIDC + on-behalf-of                   the enterprise path most teams will
                                        actually take.

  The principle underneath all of them is Saltzer and Schroeder's least
  privilege, applied per TASK rather than per SESSION. That shift -- from 'what
  may this user do' to 'what does this run need' -- is the entire chapter.""")

ok("A22 complete -- the task token permits the task and refuses the other three attempts")
