# Contributing

Thank you for contributing. This is a teaching repository; changes should improve
the material's accuracy, clarity, or reproducibility.

## The most valuable contribution

**Corrections.** If a claim is wrong, misattributed, or cites a superseded
version, open an issue with the source. Accurate attribution is an important part
of the course.

**A defence that broke.** If you land an adaptive attack against one of the
controls described as *bounding damage*, please open an issue with a reproduction.

## House rules

These conventions keep the material consistent. Pull requests that do not meet
them will need revision.

- **A control "bounds damage" only if it holds when the model is fully
  compromised.** Everything else "raises cost", and the chapter says which it is.
  If the property cannot be stated precisely, classify the control as raising cost.
- **Numbers belong to the paper they came from, and the chapter names it.** No
  unattributed figures, and no rounding a paper's result into a slogan.
- **Every chapter that recommends something also says what it does not do.** A
  recommendation without a limitation is marketing.
- **Every source gets every author named.** Not "et al." in the reference list.
- **Every chapter file ends in assertions.** `code/run_all.py` runs them in CI. A
  chapter's central claims should be checkable in its adjacent example file.

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

Be respectful, assume good faith, and focus discussion on claims and evidence.
