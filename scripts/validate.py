#!/usr/bin/env python3
#
# validate.py --data-dir data/papers [--strict]
# 

import argparse
import difflib
import glob
import sys
from urllib.parse import urlparse

import yaml

REQUIRED = {"title": str, "authors": list, "institutions": list, "year": int, "venue": str, "paper": str}
OPTIONAL = {"month": int, "code": str, "slides": str, "web": str}
URL_FIELDS = {"paper", "code", "slides", "web"}
SIMILARITY_THRESHOLD = 0.9

COLOR = sys.stdout.isatty()


def paint(code, text):
    return f"\033[{code}m{text}\033[0m" if COLOR else text


def red(text):
    return paint(31, text)


def yellow(text):
    return paint(33, text)


def green(text):
    return paint(32, text)


def bold(text):
    return paint(1, text)


errors = []
warnings = []


def normalize(s):
    return " ".join(s.split()).casefold()


def load_papers(data_dir):
    papers = {}
    for path in sorted(glob.glob(f"{data_dir}/*.yml")):
        try:
            with open(path) as f:
                papers[path] = yaml.safe_load(f)
        except yaml.YAMLError as e:
            errors.append(f"{path}: could not parse YAML ({e})")
    return papers


def check_schema(path, paper):
    if not isinstance(paper, dict):
        errors.append(f"{path}: file is empty or not a YAML mapping")
        return

    for field, kind in REQUIRED.items():
        if not paper.get(field):
            errors.append(f"{path}: missing required field '{field}'")
        elif not isinstance(paper[field], kind):
            errors.append(f"{path}: '{field}' should be {kind.__name__}, got {type(paper[field]).__name__}")

    for field, kind in OPTIONAL.items():
        if paper.get(field) is not None and not isinstance(paper[field], kind):
            errors.append(f"{path}: '{field}' should be {kind.__name__}, got {type(paper[field]).__name__}")

    for field in ("authors", "institutions"):
        for item in paper.get(field) or []:
            if not isinstance(item, str) or not item.strip():
                errors.append(f"{path}: entry in '{field}' is not a non-empty string: {item!r}")

    if isinstance(paper.get("month"), int) and not 1 <= paper["month"] <= 12:
        errors.append(f"{path}: 'month' must be between 1 and 12, got {paper['month']}")

    for field in URL_FIELDS:
        url = paper.get(field)
        if isinstance(url, str):
            parsed = urlparse(url.strip())
            if parsed.scheme not in ("http", "https") or not parsed.netloc:
                errors.append(f"{path}: '{field}' doesn't look like a URL: {url!r}")


def check_consistency(papers, field, label):
    used_in = {}
    for path, paper in papers.items():
        values = paper.get(field) if isinstance(paper, dict) else None
        for v in values if isinstance(values, list) else [values] if values else []:
            if isinstance(v, str) and v.strip():
                used_in.setdefault(v.strip(), set()).add(path)

    names = sorted(used_in)
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            na, nb = normalize(a), normalize(b)
            if len(na) < 5 or len(nb) < 5:
                continue

            if na == nb:
                reason = "differs only in capitalization/whitespace"
            elif na in nb or nb in na:
                reason = "one is a prefix/suffix of the other"
            elif difflib.SequenceMatcher(None, na, nb).ratio() >= SIMILARITY_THRESHOLD:
                reason = "similar spelling"
            else:
                continue

            files = sorted(used_in[a] | used_in[b])
            warnings.append(f"{label} {a!r} vs {b!r} ({reason}) -- {', '.join(files)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", default="data/papers")
    parser.add_argument("--strict", action="store_true", help="also fail on consistency warnings")
    args = parser.parse_args()

    papers = load_papers(args.data_dir)
    for path, paper in papers.items():
        check_schema(path, paper)
    check_consistency(papers, "authors", "author")
    check_consistency(papers, "institutions", "institution")
    check_consistency(papers, "venue", "venue")

    print(bold(f"{len(papers)} files checked -- {len(errors)} errors, {len(warnings)} warnings"))
    print()
    if errors:
        print(red("Errors:"))
        print()
        for e in errors:
            print(red(f"  {e}"))
            print()
    if warnings:
        print(yellow("Warnings:"))
        print()
        for w in warnings:
            print(yellow(f"  {w}"))
            print()
    if not errors and not warnings:
        print(green("All good."))
        print()

    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
