#!/usr/bin/env python3
"""
A10 -- Excessive Agency and Confused Deputies.

The attacker never steals a credential. They redirect a component that already
holds one. Every request is correctly signed, passes every authentication check,
and is completely unauthorised.

    python3 a10_confused_deputy.py
"""
import os
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

# ---------------------------------------------------------------------------
# 1. the 1988 problem, restated
# ---------------------------------------------------------------------------

rule("Hardy's confused deputy, 1988")
print("""  A compiler on a shared mainframe runs with permission to write its own
  billing file. A user asks it to write output to the billing file's path.
  The compiler has the permission. The user does not. The compiler obliges.

  Nothing was hacked. A privileged component was persuaded to use its authority
  on behalf of someone who did not have it.

  Replace 'compiler' with 'agent', 'billing file' with 'your mailbox', and
  'a user asks' with 'a web page says', and you have 2026.""")

# ---------------------------------------------------------------------------
# 2. modelling authority properly
# ---------------------------------------------------------------------------

@dataclass
class Request:
    action: str
    args: dict
    authenticated_as: str        # whose credential signed it
    requested_by: str            # who actually caused it
    scopes: tuple = ()

def authn_only(r: Request):
    return (True, f"signed by {r.authenticated_as}")

def authz_with_provenance(r: Request):
    """The check almost nobody implements: does the CAUSER have the authority?"""
    if r.requested_by != r.authenticated_as:
        return (False, f"caused by '{r.requested_by}' but signed as "
                       f"'{r.authenticated_as}' — provenance mismatch")
    return (True, "causer and signer agree")

rule("the same request under two checks")
REQS = [
 Request("send_email", {"to": "team@corp"}, "alice", "alice", ("mail.send",)),
 Request("send_email", {"to": "attacker@evil.example"}, "alice",
         "content from https://blog.example/post", ("mail.send",)),
 Request("delete_repo", {"name": "prod"}, "alice",
         "content from github issue #412", ("repo.admin",)),
]
for r in REQS:
    a_ok, a_why = authn_only(r)
    z_ok, z_why = authz_with_provenance(r)
    print(f"\n  {r.action}({next(iter(r.args.values()))})")
    print(f"     authentication only      {'ALLOW' if a_ok else 'DENY '}  {a_why}")
    print(f"     with provenance          {'ALLOW' if z_ok else 'DENY '}  {z_why}")

print("""
  Every one of those requests is perfectly authenticated. Your IAM logs will
  show alice doing all three. The only thing that distinguishes them is who
  CAUSED them, and that field does not exist in any standard auth stack --
  which is why A21 has to build it and A22 has to carry it.""")

# ---------------------------------------------------------------------------
# 3. excessive agency, measured
# ---------------------------------------------------------------------------

rule("excessive agency: what the task needs vs what the token grants")

@dataclass
class Grant:
    tool: str
    granted: set
    needed: set
    @property
    def excess(self):
        return self.granted - self.needed

GRANTS = [
 Grant("Google Drive",  {"drive.readonly", "drive.file", "drive.metadata",
                         "drive"},                        {"drive.file"}),
 Grant("GitHub",        {"repo", "workflow", "admin:org",
                         "delete_repo"},                  {"repo:status", "public_repo"}),
 Grant("Slack",         {"channels:read", "channels:write", "users:read",
                         "files:write", "admin"},         {"channels:read"}),
 Grant("Database",      {"SELECT", "INSERT", "UPDATE", "DELETE", "DROP"},
                                                          {"SELECT"}),
]
total_excess = 0
for g in GRANTS:
    total_excess += len(g.excess)
    print(f"\n  {g.tool}")
    print(f"     needed   {sorted(g.needed)}")
    print(f"     granted  {sorted(g.granted)}")
    print(f"     EXCESS   {sorted(g.excess)}  <- what an injection gets for free")

print(f"\n  {total_excess} unnecessary capabilities across four integrations.")
print("""  None of them were granted carelessly. Each was granted because the OAuth
  consent screen offered a coarse scope, or because a scope was needed once
  during development, or because narrowing it required a conversation with a
  platform team. That is how excessive agency actually happens: not through
  negligence, but through friction.""")
assert total_excess >= 12

# ---------------------------------------------------------------------------
# 4. the four ways out
# ---------------------------------------------------------------------------

rule("mitigations, in order of how much they buy")
print("""  1. NARROW THE SCOPE            drive.file instead of drive. Removes the
                                 capability entirely; nothing can misuse it.
  2. ATTENUATE PER TASK          mint a token that can write one folder for
                                 ten minutes, from a broader parent grant.
  3. CARRY PROVENANCE            record who caused each request and refuse
                                 when the causer is untrusted content (A21).
  4. GATE THE IRREVERSIBLE       for what remains, a human confirms -- showing
                                 the recipient and the data, not the tool name.

  1 and 2 are 'bounds damage'. 3 is too, if enforcement is in the runtime
  rather than in the prompt. 4 degrades under fatigue (A24), so it is the
  last resort and it should be short.""")

ok("A10 complete -- the credential was never stolen, and that is the point")
