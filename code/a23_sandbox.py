#!/usr/bin/env python3
"""
A23 -- Sandboxing and Egress Control.

Assume the injection succeeded. Design for what happens next. This file builds
a correct egress allow-list (including the three checks people get wrong), a
filesystem policy, and the isolation-level comparison.

    python3 a23_sandbox.py
"""
import ipaddress
import os
import sys
from urllib.parse import urlsplit

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

# ---------------------------------------------------------------------------
# 1. an egress allow-list that survives the classic tricks
# ---------------------------------------------------------------------------

ALLOWED_HOSTS = {"api.internal.corp", "docs.internal.corp"}

BLOCKED_NETS = [ipaddress.ip_network(n) for n in (
    "127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",
    "169.254.0.0/16",          # link-local: AWS/GCP metadata lives at 169.254.169.254
    "::1/128", "fc00::/7", "fe80::/10",
)]

def egress_ok(url: str, resolve=lambda h: None) -> tuple:
    """
    Four checks, in order. Each one exists because a real system got it wrong.
    """
    try:
        u = urlsplit(url)
    except ValueError:
        return False, "unparseable URL"

    if u.scheme not in ("http", "https"):
        return False, f"scheme {u.scheme!r} not permitted"

    # 1. parse the host properly. "https://api.internal.corp@evil.example/x"
    #    has hostname 'evil.example' -- a substring check would allow it.
    host = u.hostname or ""
    if not host:
        return False, "no host"

    # 2. exact equality, never substring. 'api.internal.corp.evil.example'
    #    contains an allowed host and is not one.
    if host not in ALLOWED_HOSTS:
        return False, f"host {host!r} not on the allow-list"

    # 3. resolve and check the address -- DNS rebinding points an allowed name
    #    at an internal address between your check and your connection.
    ip = resolve(host)
    if ip is not None:
        addr = ipaddress.ip_address(ip)
        for net in BLOCKED_NETS:
            if addr in net:
                return False, f"{host} resolves into blocked range {net}"

    return True, "ok"

rule("the checks, and the attack each one exists for")
TESTS = [
 ("https://api.internal.corp/v1/write",        None,              "the legitimate case"),
 ("https://evil.example/p.png?d=sk_live",      None,              "plain exfiltration"),
 ("https://api.internal.corp.evil.example/x",  None,              "suffix trick"),
 ("https://api.internal.corp@evil.example/x",  None,              "userinfo trick"),
 ("http://169.254.169.254/latest/meta-data/",  None,              "cloud metadata service"),
 ("https://api.internal.corp/x",               "169.254.169.254", "DNS rebinding"),
 ("file:///etc/passwd",                        None,              "scheme confusion"),
 ("gopher://evil.example:6379/_SET",           None,              "protocol smuggling"),
]
for url, ip, why in TESTS:
    allowed, reason = egress_ok(url, resolve=lambda h, _ip=ip: _ip)
    print(f"  {'ALLOW' if allowed else 'DENY ':<6} {url:<46} {why}")
    if not allowed:
        print(f"            {reason}")

assert egress_ok("https://api.internal.corp/v1/write")[0]
for bad_url in ("https://api.internal.corp.evil.example/x",
                "https://api.internal.corp@evil.example/x",
                "file:///etc/passwd"):
    assert not egress_ok(bad_url)[0], bad_url
assert not egress_ok("https://api.internal.corp/x", resolve=lambda h: "169.254.169.254")[0]
ok("all four checks hold")

# ---------------------------------------------------------------------------
# 2. where to enforce it
# ---------------------------------------------------------------------------

rule("in-process checks are advisory")
print("""  The function above lives in your Python. An agent that can run code -- a
  coding agent, a data-analysis agent, anything with a shell or an interpreter
  -- opens its own socket and never calls it.

      enforcement point            can the agent bypass it?
      -------------------------    ------------------------
      a function in the agent      yes, trivially
      an HTTP client wrapper       yes, use a different client
      an egress proxy              only if it can reach the internet directly
      network policy in the pod    no
      firewall / no route          no

  Put the policy BELOW the level the agent operates at. Everything above that
  line is documentation.""")

# ---------------------------------------------------------------------------
# 3. filesystem policy
# ---------------------------------------------------------------------------

rule("filesystem containment")

WORKSPACE = "/work"
DENY_PATTERNS = (".ssh", ".env", ".aws", ".git/config", "id_rsa",
                 ".npmrc", ".netrc", "credentials")

def path_ok(path: str) -> tuple:
    real = os.path.normpath(os.path.join(WORKSPACE, path.lstrip("/")))
    if not real.startswith(WORKSPACE + os.sep) and real != WORKSPACE:
        return False, f"escapes the workspace: {real}"
    if any(p in real for p in DENY_PATTERNS):
        return False, "matches a deny pattern"
    return True, "ok"

for p in ["src/main.py", "../../../etc/passwd", "~/.ssh/id_rsa",
          "sub/../../escape.txt", ".env", "docs/readme.md"]:
    okp, why = path_ok(p)
    print(f"  {'ALLOW' if okp else 'DENY ':<6} {p:<28} {'' if okp else why}")

assert not path_ok("../../../etc/passwd")[0]
assert not path_ok(".env")[0]
assert path_ok("src/main.py")[0]
ok("normalise first, then check -- checking the raw string is the classic bug")

# ---------------------------------------------------------------------------
# 4. isolation levels
# ---------------------------------------------------------------------------

rule("choosing an isolation level")
LEVELS = [
 ("same process",     "none",                   "trivial",  "never, for untrusted code"),
 ("subprocess + user","OS user separation",     "minutes",  "weak; shares the kernel and the network"),
 ("container",        "namespaces + cgroups",   "minutes",  "the default; drop caps, read-only rootfs, no host net"),
 ("gVisor / Kata",    "syscall interception",   "hours",    "when the kernel is in your threat model"),
 ("micro-VM (Firecracker)", "hardware virt",    "hours",    "strong isolation, ~125 ms boot"),
 ("WASM",             "capability-based by design", "hours", "excellent for tools; limited runtime support"),
 ("separate machine", "physical",               "days",     "computer-use agents with real credentials"),
]
print(f"  {'level':<26}{'boundary':<28}{'setup':<10}note")
for l in LEVELS:
    print(f"  {l[0]:<26}{l[1]:<28}{l[2]:<10}{l[3]}")

print("""
  For a computer-use agent the sandbox is not one control among many -- it is
  the primary one, because the action space (click, type) is not policy-shaped
  (A08). A CUA in a disposable VM with a fresh profile and no ambient
  credentials is a different risk from a CUA on your laptop, and that
  difference is the entire mitigation.""")

ok("A23 complete -- host equality, scheme check and resolve-then-verify; all eight URLs correct")
