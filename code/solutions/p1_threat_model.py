#!/usr/bin/env python3
"""
P1 solution -- Threat-Model a Real Agent.

The finished threat model for the target P1 names as its fallback: a research
agent with a web tool, a file tool and an email tool, running under the user's
own credentials. Architecture inventory, the four questions answered per tool,
the trifecta scored over paths rather than nodes, all 31 vulnerability classes
marked applicable or not with the reason, and a ranked risk register.

It deliberately does not measure whether any named control works: P4 builds the
controls and P5 evaluates them. This file only says what to build, and why.

    python3 code/solutions/p1_threat_model.py
"""
import os
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentlib import ok, rule

# ---------------------------------------------------------------------------
# 1. the architecture, on one page (step 1)
# ---------------------------------------------------------------------------

rule("step 1 -- architecture and trust boundaries")

print("""
  TARGET: the Project 2 lab agent -- a research agent run from a terminal on the
  user's own laptop. One loop, four tools, one identity, no controls.

      user ---- goal ----> [ orchestration loop ] <--- reply --- hosted model
                                  |         ^                    (vendor API)
  . . . . . . . . . . . . . . . . | . . . . | . . . . . . . . . TRUST BOUNDARY
                                  v         |
            http_get      read_file      write_file      send_email
               |              |               |               |
           the open web   ~/.ssh, .env    ./notes.txt     any recipient
           anyone writes  all the user    tomorrow's run  speaks as the user,
           it             can read        reads it        irreversibly
""")

# name, kind, zone, identity it acts under, why it is on the diagram
COMPONENTS = [
    ("orchestration loop", "code", "trusted", "the user's shell", "8 steps, no plan validation"),
    ("hosted model", "third party", "boundary", "vendor API key", "weights we cannot inspect"),
    ("context window", "data", "boundary", "n/a", "goal and attacker text share one channel"),
    ("http_get", "tool", "untrusted", "no credential", "returns bytes strangers wrote"),
    ("read_file", "tool", "trusted", "the user's uid", "every file the user can read"),
    ("write_file", "tool", "trusted", "the user's uid", "persists between runs"),
    ("send_email", "tool", "trusted", "the user's mail identity", "irreversible, any recipient"),
    ("terminal / client", "human", "trusted", "the user", "renders answers, fetches their URLs"),
    ("tomorrow's run", "downstream", "boundary", "the user again", "trusts notes.txt as memory"),
]
for name, kind, zone, identity, note in COMPONENTS:
    print(f"  {name:<20} {kind:<12} {zone:<10} {identity:<24} {note}")

# ---------------------------------------------------------------------------
# 2. the four questions of A01, answered per tool (step 2)
# ---------------------------------------------------------------------------

rule("step 2 -- the four questions")


@dataclass
class ToolFacts:
    name: str
    bytes_from: str      # Q1  who writes what enters context ("" = nobody outside)
    authority: str       # Q2  credential, and the blast radius of the worst call
    exit_route: str      # Q3  how bytes leave through this tool ("" = they do not)
    reversibility: str   # Q4  free | costly | irreversible


TOOLS = [
    ToolFacts("http_get", "any site operator, and anyone who can edit their pages or their CDN",
              "no credential -- but the request leaves from the user's network",
              "the URL: a hostname or query string carries the secret out unaided", "free"),
    ToolFacts("read_file", "any process that has ever written the user's home directory",
              "the user's uid: every file the user can read, with no path allow-list", "", "free"),
    ToolFacts("write_file", "", "the user's uid: any path, including ones something else runs later",
              "the file: a synced directory, and tomorrow's run", "costly"),
    ToolFacts("send_email", "", "the user's mail identity: speaks as them to any address on earth",
              "the message body, to a recipient the model chose", "irreversible"),
]
GATE = {"free": "log only", "costly": "log + notify, undo", "irreversible": "BLOCKING CONFIRM"}

# Q3 is the question people answer too narrowly, so the routes that are not
# tool calls at all are enumerated beside the ones that are (A09).
CHANNELS = [
    ("markdown image in the answer", "the client fetches evil.example/?d=... -- no tool call"),
    ("notes.txt in a synced folder", "an unrelated process does the upload for you"),
    ("a DNS lookup", "SECRET.evil.example never needs a 200; resolvers log"),
    ("the answer text itself", "a human reads it and acts on it"),
]

for question, field in [("Q1 injection surface -- what enters context a stranger can write", "bytes_from"),
                        ("Q2 action surface -- what it can do, and with whose authority", "authority")]:
    print(f"\n  {question}")
    for t in TOOLS:
        if getattr(t, field):
            print(f"     {t.name:<12} {getattr(t, field)}")
print("\n  Q3 exfiltration surface -- what can leave, and by what route")
for t in TOOLS:
    if t.exit_route:
        print(f"     {t.name:<30} tool call   {t.exit_route}")
for name, how in CHANNELS:
    print(f"     {name:<30} no tool     {how}")
print("\n  Q4 reversibility -- the interruption budget is spent at the bottom of this list")
for t in sorted(TOOLS, key=lambda t: list(GATE).index(t.reversibility)):
    print(f"     {t.name:<12} {t.reversibility:<14} {GATE[t.reversibility]}")

# ---------------------------------------------------------------------------
# 3. the trifecta, scored over paths and not over nodes (step 3, A03 + A15)
# ---------------------------------------------------------------------------

rule("step 3 -- the trifecta, scored over paths")

# node -> the legs it contributes: U untrusted input, P private data, E egress
NODES = {
    "stranger's page": "U",       # anyone who can edit a page the agent may fetch
    "user goal": "",              # trusted, and the only input anyone remembers to model
    "ctx": "",                    # the context window before any file is read
    "read secrets": "P",          # read_file(~/.ssh, .env)
    "ctx+secret": "",             # the same window, now carrying it
    "notes.txt": "",              # write_file, which is not egress by itself
    "next run": "",               # tomorrow's run, reading notes.txt as memory
    "send_email": "E",
    "rendered answer": "E",       # the client fetches the URLs in it, not the agent
}
EDGES = [
    ("stranger's page", "ctx"), ("user goal", "ctx"), ("ctx", "read secrets"), ("ctx", "ctx+secret"),
    ("read secrets", "ctx+secret"), ("ctx+secret", "send_email"), ("ctx+secret", "rendered answer"),
    ("ctx+secret", "notes.txt"), ("notes.txt", "next run"), ("next run", "send_email"),
    ("next run", "rendered answer"),
]


def enumerate_paths(cut=frozenset()):
    """Every simple source-to-sink data-flow path surviving the cut."""
    edges = [(a, b) for a, b in EDGES if a not in cut and b not in cut]
    onward: dict[str, list[str]] = {}
    for a, b in edges:
        onward.setdefault(a, []).append(b)
    found: list[list[str]] = []

    def walk(key, sofar):
        if not onward.get(key):
            found.append(sofar)
        for nxt in onward.get(key, []):
            if nxt not in sofar:
                walk(nxt, sofar + [nxt])

    for start in [k for k in NODES if k not in cut and k not in {b for _, b in edges}]:
        walk(start, [start])
    return found


def legs(path):
    """The legs a whole path holds. No node has to hold more than one."""
    return {leg for key in path for leg in NODES[key]}


ALL_PATHS = enumerate_paths()
for path in ALL_PATHS:
    held = legs(path)
    print(f"  {''.join(c if c in held else '-' for c in 'UPE')}  "
          f"{'LETHAL' if len(held) == 3 else str(len(held)) + '/3':<7} {' -> '.join(path)}")

LETHAL = [p for p in ALL_PATHS if len(legs(p)) == 3]
print(f"""
  {len(LETHAL)} of {len(ALL_PATHS)} paths hold all three legs, and no single node holds more than one
  of them. Scored node by node this system looks safe. Score the paths.""")

# which leg is cheapest to cut, and what the cut costs in capability
rule("which leg to cut")

CUTS = [
    ("private data -- own uid, ./research only, no home directory", {"read secrets"},
     "loses reading the user's own dotfiles. Usually affordable, rarely offered."),
    ("untrusted input -- allow-listed research domains", {"stranger's page"},
     "loses the point of a research agent. Narrows the surface, never closes it."),
    ("network egress -- proxy allow-list on http_get and send_email", {"send_email"},
     "loses almost nothing, and does NOT close the rendered-output channel."),
    ("every egress, rendering included -- plain text, no remote fetch", {"send_email", "rendered answer"},
     "loses images and clickable citations. Cheap, effective, and unpopular."),
]
for label, cut, cost in CUTS:
    left = [p for p in enumerate_paths(frozenset(cut)) if len(legs(p)) == 3]
    print(f"\n  cut {label}\n      lethal paths remaining: {len(left)}\n      {cost}")

NETWORK_ONLY = [p for p in enumerate_paths(frozenset({"send_email"})) if len(legs(p)) == 3]

# ---------------------------------------------------------------------------
# 4. the taxonomy walk -- the "because" column is the deliverable (step 4)
# ---------------------------------------------------------------------------

rule("step 4 -- all 31 vulnerability classes, applicable or not, with the reason")

# surface, class, applicable, because
TAXONOMY = [
    ("S1", "Direct prompt injection", True, "the principal types the goal, and a scripted caller is a stranger with a keyboard"),
    ("S1", "System prompt extraction", True, "we assume extraction rather than prevent it -- but only after checking nothing in the prompt is a secret"),
    ("S1", "Jailbreaking", True, "hosted weights inherit every published jailbreak and we can patch none of them"),
    ("S1", "Disallowed use", True, "nothing constrains what the user researches or who the agent mails"),
    ("S1", "Direct multimodal attack", False, "text-only input; there is no image, audio or document upload path"),
    ("S2", "Indirect prompt injection", True, "http_get returns bytes nobody here controls. The primary finding"),
    ("S2", "Environmental injection", True, "HTML comments and white-on-white text survive the fetch; the human reads the summary"),
    ("S2", "Tool attacks", False, "four Python functions fixed at import, no dynamic registry -- applicable the day an MCP server is added"),
    ("S2", "Insecure plugin design", True, "read_file and write_file take a model-chosen path straight from the parsed ACTION line"),
    ("S2", "Knowledge-base attacks", False, "no corpus and no vector store; notes.txt is scored under memory poisoning instead"),
    ("S2", "Memory poisoning", True, "write_file today and read_file tomorrow is a memory whatever we call it"),
    ("S2", "Protocol exploits", False, "in-process calls only, with no MCP or A2A transport to attack yet"),
    ("S2", "IAM failures", True, "one identity -- the user's -- unattenuated and shared by all four tools"),
    ("S3", "Foundation model vulnerabilities", True, "a confidently wrong summary sent under the user's name is harm with no adversary present"),
    ("S3", "Data poisoning", False, "we neither train nor fine-tune; the exposure is the vendor's to disclose"),
    ("S3", "Model backdoors", False, "hosted weights we cannot inspect -- recorded as accepted and untestable, not as absent"),
    ("S3", "Reasoning and planning failures", True, "an eight-step loop with no plan validation reads the wrong file for the right reason"),
    ("S3", "Tool misuse", True, "recipient and path are guessed from prose; a wrong address needs no attacker"),
    ("S3", "Deception and evasion", True, "'sent' is the tool's own return string, and nothing independently confirms the effect"),
    ("S4", "Denial of service", True, "the step limit is the only cap, and a slow fetch target holds the run open"),
    ("S4", "Denial of wallet", True, "tokens are billed per step and the step count is attacker-influenced"),
    ("S4", "Compute misuse", True, "http_get makes the agent a request relay for whoever wrote the page it read"),
    ("S4", "Cyber compromise", True, "it runs on a laptop with the user's real home directory; ordinary intrusion inherits all of it"),
    ("S4", "Supply chain attacks", True, "the model API today, and the first package or skill anyone adds tomorrow"),
    ("S4", "Physical compromise", False, "no actuator and no device -- nothing embodied to attack"),
    ("S5", "Human-in-the-loop failure", True, "there is no gate at all, so the failure is total rather than merely fatigued"),
    ("S5", "Explainability failure", True, "the printed reasoning is generated text, not a record of why the tool was chosen"),
    ("S5", "Monitoring failure", True, "no trajectory survives the process, so after a leak there is nothing to read"),
    ("S6", "Cascading failures", True, "step N+1 trusts step N's tool result with no re-validation"),
    ("S6", "Adverse multi-agent dynamics", False, "one agent, one loop -- the notes.txt hand-off is the same shape and is scored above"),
    ("S6", "System-level failures", True, "the loop can re-enter the same fetch, and the step limit is the only thing that stops it"),
]
for surface, name, applicable, because in TAXONOMY:
    print(f"  {surface}  {name:<34} {'applicable    ' if applicable else 'not applicable'}  {because}")

IN_SCOPE = [t for t in TAXONOMY if t[2]]
print(f"\n  {len(IN_SCOPE)}/{len(TAXONOMY)} classes in scope, for an agent of 200 lines and four tools.")

# ---------------------------------------------------------------------------
# 5. the ranked risk register (step 5)
# ---------------------------------------------------------------------------

rule("step 5 -- ranked risk register")

# threat, components, likelihood, blast, control (defence map), class, first step
REGISTER = [
    ("Injected page drives read_file then send_email", "stranger's page -> ctx -> read secrets -> send_email",
     5, 5, "Egress allow-listing", "bounds damage",
     "outbound proxy: research domains and mail to the requesting user only, deny by default"),
    ("Ambient authority: the user's uid and mail identity", "all four tools",
     4, 5, "Agent identity and delegation", "bounds damage",
     "its own principal, on-behalf-of token scoped to ./research and one recipient, expiring"),
    ("Exfiltration through the rendered answer", "ctx+secret -> rendered answer, with no tool call",
     4, 5, "Output guardrails", "raises cost",
     "strip remote image and link targets before rendering -- the client makes that request"),
    ("notes.txt poisoned for tomorrow's run", "write_file -> next run", 3, 5, "Memory controls", "bounds damage", ""),
    ("Irreversible send with no confirmation", "send_email", 3, 5, "Human-in-the-loop gates", "raises cost", ""),
    ("No trajectory log to investigate with", "orchestration loop", 3, 4, "Runtime and endpoint detection", "raises cost", ""),
    ("Model-chosen path reaches an executed file", "write_file", 2, 5, "Action policy engines", "bounds damage", ""),
    ("Unbounded loop burns tokens and wall clock", "orchestration loop", 3, 3, "Rate limiting", "bounds damage", ""),
    ("Direct override and prompt extraction", "user input -> ctx", 4, 2, "Defensive prompting", "raises cost", ""),
    ("Vendor API, and the first dependency added", "hosted model, packages", 2, 4, "Supply chain risk management", "bounds damage", ""),
]
REGISTER.sort(key=lambda r: -(r[2] * r[3]))
for i, (threat, comps, likely, blast, control, strength, _step) in enumerate(REGISTER, 1):
    print(f"  {i:>2}. {likely * blast:>2}  {threat:<48} {control:<30} {strength}")
    print(f"          {comps}")

rule("top three -- the first concrete step for each")
for i, (threat, _c, _l, _b, control, strength, step) in enumerate(REGISTER[:3], 1):
    print(f"\n  {i}. {threat}  ({control}, {strength})\n     {step}")

print("""
  Read the top three together: two bound damage, one only raises cost, and the
  one that only raises cost is the channel that needs no tool call. The path
  scoring found that asymmetry before any control had been chosen.""")

# 6. what makes the model complete rather than merely written down
rule("checks")
assert all(t.authority and t.reversibility in GATE for t in TOOLS), "Q2 or Q4 unanswered"
assert any(t.bytes_from for t in TOOLS) and any(t.exit_route for t in TOOLS), "Q1 or Q3 empty"
assert [t.name for t in TOOLS if t.reversibility == "irreversible"] == ["send_email"]
assert len(CHANNELS) >= 3, "an exfiltration surface listing only tool calls is incomplete"
assert len({name for _s, name, _a, _b in TAXONOMY}) == 31, "walk the whole map, once each"
assert all(because for *_head, because in TAXONOMY), "every row needs its 'because'"
assert len(ALL_PATHS) == 16 and len(LETHAL) == 4, "every source-to-sink path must be scored"
assert all(len(flags) < 3 for flags in NODES.values()), "no node holds the trifecta alone"
assert NETWORK_ONLY, "cutting network egress alone leaves the rendered channel lethal"
assert not [p for p in enumerate_paths(frozenset({"send_email", "rendered answer"})) if len(legs(p)) == 3], \
    "cutting every egress route must close every lethal path"
scores = [r[2] * r[3] for r in REGISTER]
assert scores == sorted(scores, reverse=True), "the register must be ranked"
assert all(c and s in ("bounds damage", "raises cost") for *_x, c, s, _y in REGISTER), \
    "every entry needs a named control, classified as bounding or cost-raising"
assert all(r[6] for r in REGISTER[:3]), "the top three each need a concrete first step"

ok(f"P1 complete -- {len(COMPONENTS)} components, {len(LETHAL)}/{len(ALL_PATHS)} lethal paths, "
   f"{len(IN_SCOPE)}/{len(TAXONOMY)} classes in scope, {len(REGISTER)} risks ranked")
