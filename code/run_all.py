"""
Run every chapter file and report which ones passed.

Each file ends in assertions that verify the claims made in its chapter. If
they all pass, the course's claims held on your machine.

    python code/run_all.py
    python code/run_all.py --quiet     # only the summary
"""

from __future__ import annotations

import pathlib
import subprocess
import sys
import time

HERE = pathlib.Path(__file__).parent
GREEN, RED, DIM, RESET, BOLD = "\033[32m", "\033[31m", "\033[2m", "\033[0m", "\033[1m"


def main() -> int:
    quiet = "--quiet" in sys.argv
    files = sorted(HERE.glob("a[0-9][0-9]_*.py"))
    results = []

    for f in files:
        t0 = time.perf_counter()
        proc = subprocess.run([sys.executable, f.name], cwd=HERE,
                              capture_output=True, text=True, timeout=600)
        ms = (time.perf_counter() - t0) * 1000
        passed = proc.returncode == 0
        results.append((f.name, passed, ms, proc.stderr))

        mark = f"{GREEN}pass{RESET}" if passed else f"{RED}FAIL{RESET}"
        print(f"  {mark}  {f.name:<32} {ms:7.0f} ms")
        if not passed and not quiet:
            print(f"{DIM}{proc.stderr.strip()[-1200:]}{RESET}")

    failed = [r for r in results if not r[1]]
    total_ms = sum(r[2] for r in results)
    print()
    print(f"  {BOLD}{len(results) - len(failed)}/{len(results)} passed{RESET} "
          f"in {total_ms / 1000:.1f}s")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
