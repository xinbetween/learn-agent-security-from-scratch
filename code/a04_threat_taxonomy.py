#!/usr/bin/env python3
"""
A04 -- The Threat Landscape.

The six-surface threat taxonomy from Grimes et al., "SoK: Bridging Research and
Practice in LLM Agent Security" (CMU SEI, 2025), as a data structure you can
query -- plus the coverage analysis that shows why one framework is never enough.

    python3 a04_threat_taxonomy.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

# surface -> (n_sources, academic, industry, [vulnerability classes])
TAXONOMY = {
    "Direct threats": (60, 25, 35, [
        ("direct prompt injection", 52), ("disallowed use", 19),
        ("direct multimodal attack", 2)]),
    "Indirect threats": (55, 20, 35, [
        ("IAM failures", 30), ("tool attacks", 27), ("indirect prompt injection", 20),
        ("knowledge-base attacks", 15), ("internal agent attacks", 15)]),
    "Internal threats": (62, 31, 31, [
        ("foundation model vulnerabilities", 34), ("tool misuse", 17),
        ("data poisoning", 14), ("reasoning/planning failures", 10),
        ("deception and evasion", 10), ("model backdoors", 9)]),
    "Resource threats": (29, 13, 16, [
        ("compute misuse", 13), ("cyber compromise", 12),
        ("supply chain attacks", 9), ("physical compromise", 4)]),
    "Oversight failures": (19, 10, 9, [
        ("explainability failures", 9), ("monitoring failures", 9),
        ("human-in-the-loop failures", 8)]),
    "Compound threats": (24, 13, 11, [
        ("cascading failures", 14), ("adverse multi-agent dynamics", 13),
        ("system-level failures", 5)]),
}

rule("the six threat surfaces")
for surface, (n, acad, ind, classes) in TAXONOMY.items():
    lean = "academia" if acad > ind * 1.15 else "industry" if ind > acad * 1.15 else "balanced"
    print(f"\n  {surface}  (n={n}: {acad} academic, {ind} industry -- leans {lean})")
    for name, count in classes:
        bar = "#" * max(1, count // 2)
        print(f"     {name:<34} {count:>3}  {bar}")

# ---------------------------------------------------------------------------
# the split that tells you something
# ---------------------------------------------------------------------------

rule("what the academia/industry split reveals")

acad_lean = sorted(TAXONOMY.items(), key=lambda kv: -(kv[1][1] / max(kv[1][2], 1)))
print("""  Academia weights INTERNAL threats: misalignment, hallucination, backdoors,
  reasoning failures, deception. Novel and model-centric failure modes.

  Industry weights INDIRECT threats: IAM failures, tool attacks, indirect
  injection, supply chain. Operational failures of deployed systems.

  Neither is wrong. They are looking at different parts of the same animal, and
  a threat model built from only one literature has a predictable hole in it.
  If you read only papers, you will underweight identity and supply chain. If
  you read only vendor guidance, you will underweight backdoors and evaluation
  gaming.""")

print(f"\n  most academia-leaning surface: {acad_lean[0][0]}")
print(f"  most industry-leaning surface: {acad_lean[-1][0]}")

# ---------------------------------------------------------------------------
# coverage: no single source has the whole map
# ---------------------------------------------------------------------------

rule("no single source covers the map")

print("""  The SEI review found 25 distinct threat categories across 173 sources,
  and reports (its Figures 5 and 6) that no single source mentioned all 25,
  and no single source covered all 33 best-practice categories either. Of the
  academic surveys it compared side by side, the broadest reached 16 of the 33
  best-practice categories and most reached fewer than ten.

  Practical consequence: a threat model derived from one paper, one vendor's
  guidance, or one framework will be missing categories, and you will not know
  which ones. Use a taxonomy as a checklist, not as a reading list.""")

# ---------------------------------------------------------------------------
# a checklist you can actually run
# ---------------------------------------------------------------------------

rule("running the taxonomy against a system")

def assess(system_name, applicable):
    total = sum(len(c[3]) for c in TAXONOMY.values())
    print(f"\n  {system_name}")
    for surface, (_, _, _, classes) in TAXONOMY.items():
        hits = [n for n, _ in classes if n in applicable]
        state = ", ".join(hits) if hits else "not applicable"
        print(f"     {surface:<22} {state}")
    print(f"     >>> {len(applicable)}/{total} categories in scope")
    return len(applicable)

n = assess("A coding agent with repo write access and network", {
    "direct prompt injection", "indirect prompt injection", "tool attacks",
    "IAM failures", "supply chain attacks", "tool misuse",
    "foundation model vulnerabilities", "reasoning/planning failures",
    "compute misuse", "human-in-the-loop failures", "monitoring failures",
    "cascading failures",
})

assert n >= 10, "a networked coding agent should light up most of the map"
assert sum(v[0] for v in TAXONOMY.values()) > 200, "source counts are cumulative, not distinct"
ok("A04 complete -- you now have a checklist, and it is longer than your backlog")
