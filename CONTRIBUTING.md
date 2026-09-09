# Contributing

Thank you for considering it. This is a teaching repository, so the bar for a
change is "does it make the material more correct or more learnable", not "is it
more complete".

## The most valuable contribution

**Corrections.** If a claim is wrong, misattributed, or cites a superseded
version, open an issue with the source. Getting credit and accuracy right is the
point of the reference lists; getting them wrong is a bug of the same severity as
broken code.

**A defence that broke.** If you land an adaptive attack against one of the
controls this course describes as *bounding damage*, that is a finding the course
wants. Open an issue with a reproduction.

## House rules

These are the conventions that keep the material honest. A PR that breaks one will
be asked to change.

- **A control "bounds damage" only if it holds when the model is fully
  compromised.** Everything else "raises cost", and the chapter says which it is.
  If you cannot state the property without hedging, it raises cost.
- **Numbers belong to the paper they came from, and the chapter names it.** No
  unattributed figures, and no rounding a paper's result into a slogan.
- **Every chapter that recommends something also says what it does not do.** A
  recommendation without a limitation is marketing.
- **Every source gets every author named.** Not "et al." in the reference list.
- **Every chapter file ends in assertions.** `code/run_all.py` runs them in CI. A
  chapter whose claims are not checkable by the file next to it is not finished.

## Adding or editing a chapter

A chapter is one ES module and one Python file. See the "Adding a chapter" section
of [the README](README.md#adding-a-chapter) for the mechanics.

```bash
node build.mjs && node scripts/check.mjs   # the site must build and verify
python3 code/run_all.py                    # all 27 chapters must pass
python3 -m ruff check code/                # and lint clean
```

## Quiz questions

Six per chapter. A good question:

- has exactly one defensible answer, and distractors that a reader who
  half-understood the chapter would genuinely pick;
- has an explanation that says *why* the other options are wrong, not just which
  one is right;
- tests reasoning rather than recall. "Which framework has seven layers" is a bad
  question. "Which framework would surface this undeclared agent-to-agent edge" is
  a good one.

## Offensive material

Everything runs against the toy agent in `code/agentlib.py`, whose tools are
in-memory fakes. Contributions must keep that property: no attack in this
repository should be able to touch a real system, and no example should be a
turnkey payload for one.

## Code of conduct

Be decent. Assume good faith. Argue about the claim, not the person making it.
