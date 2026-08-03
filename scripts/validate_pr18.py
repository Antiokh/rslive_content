from __future__ import annotations

from pathlib import Path
import re
import sys

import yaml

ROOT = Path("src/content/docs")
CHANGED_MDX = [
    ROOT / "arrival/post/index.mdx",
    ROOT / "gov/consumer-rights/index.mdx",
    ROOT / "gov/family/index.mdx",
    ROOT / "gov/index.mdx",
    ROOT / "gov/notary/index.mdx",
    ROOT / "move/pets/index.mdx",
    ROOT / "move/prepare/index.mdx",
]

errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


index_path = ROOT / "CONTENT_INDEX.yml"
index_text = index_path.read_text(encoding="utf-8")
try:
    index_data = yaml.safe_load(index_text)
except Exception as exc:  # noqa: BLE001
    fail(f"CONTENT_INDEX.yml does not parse: {exc}")
    index_data = {}

pages = index_data.get("pages", []) if isinstance(index_data, dict) else []
urls = [page.get("url") for page in pages if isinstance(page, dict)]
for url in sorted({url for url in urls if url and urls.count(url) > 1}):
    fail(f"Duplicate CONTENT_INDEX URL: {url}")

required_index_fragments = [
    "title: Переезд и поездки с домашними животными",
    "иностранное свидетельство о браке",
    "двум иностранцам нужно использовать иностранное свидетельство в Сербии",
]
for fragment in required_index_fragments:
    if fragment not in index_text:
        fail(f"Missing CONTENT_INDEX fragment: {fragment}")

for path in CHANGED_MDX:
    if not path.exists():
        fail(f"Missing changed file: {path}")
        continue
    text = path.read_text(encoding="utf-8")
    rel = path.as_posix()

    if text.startswith("---\n"):
        try:
            _, frontmatter, _ = text.split("---", 2)
            metadata = yaml.safe_load(frontmatter)
        except Exception as exc:  # noqa: BLE001
            fail(f"Invalid frontmatter in {rel}: {exc}")
            metadata = {}
        if not isinstance(metadata, dict) or not metadata.get("title"):
            fail(f"Missing title in {rel}")
        if path != ROOT / "gov/index.mdx" and path != ROOT / "move/prepare/index.mdx":
            for key in ("description", "sourceCheckedAt", "live"):
                if not metadata.get(key):
                    fail(f"Missing {key} in {rel}")
    else:
        fail(f"Missing frontmatter fence in {rel}")

    for tag in ("Aside", "Steps"):
        if text.count(f"<{tag}") != text.count(f"</{tag}>"):
            fail(f"Unpaired {tag} in {rel}")

    if re.search(r"<https?://", text):
        fail(f"Markdown autolink found in {rel}")

    refs = set(re.findall(r"\[\^(\d+)\](?!:)", text))
    defs = set(re.findall(r"^\[\^(\d+)\]:", text, flags=re.MULTILINE))
    if refs != defs:
        fail(f"Footnote mismatch in {rel}: refs={sorted(refs)}, defs={sorted(defs)}")

    for target in re.findall(r"\]\((/[^)]+)\)", text):
        route = target.split("#", 1)[0].split("?", 1)[0]
        if route == "/":
            candidate = ROOT / "index.mdx"
        elif route.endswith("/"):
            candidate = ROOT / route.strip("/") / "index.mdx"
        else:
            candidate = ROOT / f"{route.strip('/')}.mdx"
        if not candidate.exists():
            fail(f"Broken internal link in {rel}: {target} -> {candidate}")

combined = "\n".join(path.read_text(encoding="utf-8") for path in CHANGED_MDX if path.exists())
for forbidden in (
    "В первые шесть месяцев после покупки",
    "может быть значительно выше стоимости обычной почтовой обработки",
    "регулируются тарифой",
    "актуальную тарифу",
):
    if forbidden in combined:
        fail(f"Forbidden outdated wording remains: {forbidden}")

consumer = (ROOT / "gov/consumer-rights/index.mdx").read_text(encoding="utf-8")
for required in ("35/2026", "в течение двух месяцев", "в течение первого года", "в течение 30 дней"):
    if required not in consumer:
        fail(f"Consumer article missing: {required}")

family = (ROOT / "gov/family/index.mdx").read_text(encoding="utf-8")
for required in ("Если один из супругов — гражданин Сербии", "Если оба супруга — иностранцы", "Высший суд в Белграде"):
    if required not in family:
        fail(f"Family article missing: {required}")

pets = (ROOT / "move/pets/index.mdx").read_text(encoding="utf-8")
for required in ("Птицы и другие домашние животные", "При ввозе в Сербию", "При вывозе из Сербии"):
    if required not in pets:
        fail(f"Pets article missing: {required}")

if errors:
    print("Validation failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"Validated {len(CHANGED_MDX)} MDX files and CONTENT_INDEX.yml")
