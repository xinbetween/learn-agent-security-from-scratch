#!/usr/bin/env python3
"""
A16 -- Resource and Economic Attacks.

The cheapest attack on an agent is not stealing its data. It is making it think
forever. Token amplification, tool-call storms, and unbounded loops -- with the
budgets that bound each.

    python3 a16_resource_attacks.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import ok, rule

PRICE_PER_1K = 0.003   # $ per 1k tokens, round numbers

# ---------------------------------------------------------------------------
# 1. token amplification
# ---------------------------------------------------------------------------

rule("amplification -- a small input, a large bill")

def cost(tokens): return tokens / 1000 * PRICE_PER_1K

SCENARIOS = [
 ("normal request",        1,   1_200),
 ("'summarise in detail, then critique your summary, 20x'",
                            1,   340_000),
 ("recursive tool loop (each call adds context)",
                           40,   0),      # computed below
 ("fan-out: 'research each of these 500 items'",
                          500,   2_000),
]

print(f"  {'scenario':<52}{'calls':>7}{'tokens':>12}{'cost':>10}")
for name, calls, per in SCENARIOS:
    if "recursive" in name:
        # each step re-reads a growing context: 1500 * step
        tokens = sum(1500 * s for s in range(1, calls + 1))
    else:
        tokens = calls * per
    print(f"  {name:<52}{calls:>7}{tokens:>12,}{'$'+format(cost(tokens),'.2f'):>10}")

# ---------------------------------------------------------------------------
# 2. the MCP amplification result
# ---------------------------------------------------------------------------

rule("stealthy amplification via the tool loop")
print("""  'Beyond Max Tokens' (2026): a modified MCP tool server that returns
  slightly-expanded results inflates the agent's context every round. Reported
  cost inflation up to 658x, and it is stealthy -- each individual response
  looks reasonable; only the trajectory reveals the growth.

  Your max_tokens cap does not help: the attack is in the number of ROUNDS and
  the growth PER round, not in any single response.""")

# ---------------------------------------------------------------------------
# 3. the budgets that actually bound it
# ---------------------------------------------------------------------------

rule("a budget enforcer")

class Budget:
    def __init__(self, max_steps=8, max_tokens=50_000, max_cost=0.50, max_tool_calls=12):
        self.max_steps, self.max_tokens = max_steps, max_tokens
        self.max_cost, self.max_tool_calls = max_cost, max_tool_calls
        self.steps = self.tokens = self.tool_calls = 0
    def charge(self, tokens=0, tool_call=False):
        self.steps += 1
        self.tokens += tokens
        self.tool_calls += 1 if tool_call else 0
        for name, cur, cap in [("steps", self.steps, self.max_steps),
                               ("tokens", self.tokens, self.max_tokens),
                               ("cost", cost(self.tokens), self.max_cost),
                               ("tool_calls", self.tool_calls, self.max_tool_calls)]:
            if cur > cap:
                return f"BUDGET EXCEEDED: {name} {cur:.2f} > {cap}"
        return None

# simulate the recursive-loop attack against the budget
b = Budget()
halted = None
for step in range(1, 100):
    halted = b.charge(tokens=1500 * step, tool_call=True)
    if halted:
        print(f"  step {step}: {halted}")
        break
assert halted, "the budget must halt the runaway loop"
ok(f"the runaway loop was stopped at step {step}, not step 100")

print("""
  BOUNDS DAMAGE (hard caps, enforced outside the model)
    per-run: steps, wall-clock, tokens, tool calls, spend
    per-identity: requests/minute, concurrent runs, daily spend
    per-tool: call count, result-size cap (this kills the MCP amplifier)

  RAISES COST
    anomaly detection on token growth per round
    dynamic budgets tightened on suspicious trajectories

  Denial-of-wallet is the attack most teams forget because it steals nothing.
  It just runs up a bill, or exhausts the shared queue so real users are
  denied service. A per-identity spend cap is ten lines and closes it.""")

ok("A16 complete -- the runaway loop was stopped by a budget, not by a better model")
