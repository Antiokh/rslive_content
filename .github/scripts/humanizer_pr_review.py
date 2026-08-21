#!/usr/bin/env python3
"""Build one advisory PR comment from humanizer_russian editorial-board findings."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

MARKER = "<!-- humanizer-russian-review -->"
CYRILLIC = re.compile(r"[А-Яа-яЁё]")
STYLE_ID = "rslive_content"
REGISTER = "general"
EVIDENCE_REQUEST = "auto"
MAX_ITEMS_TOTAL = 40
MAX_ITEMS_PER_FILE = 12


def load_humanizer(root: Path):
    scripts = root / "scripts"
    review_path = scripts / "review.py"
    if not review_path.is_file():
        raise RuntimeError(f"Cannot find humanizer_russian review.py under {root}")
    sys.path.insert(0, str(scripts))
    spec = importlib.util.spec_from_file_location("humanizer_russian_review", review_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot import humanizer_russian review from {review_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def normalize_excerpt(text: str) -> str:
    return re.sub(r"\s+", " ", str(text).strip()).lower()[:180]


def finding_signature(finding: dict) -> tuple[str, ...]:
    return (
        str(finding.get("library_id") or ""),
        str(finding.get("rule_id") or ""),
        str(finding.get("phenomenon_id") or ""),
        str(finding.get("project_class") or ""),
        str(finding.get("automation_level") or ""),
        str(finding.get("verdict") or ""),
        normalize_excerpt(finding.get("excerpt", "")),
    )


def is_russian_page(path: str, text: str) -> bool:
    normalized = path.replace("\\", "/")
    if normalized.startswith("src/content/docs/en/") or normalized.startswith("src/content/docs/sr/"):
        return False
    return len(CYRILLIC.findall(text)) >= 20


def safe_inline(text: str, limit: int = 180) -> str:
    value = re.sub(r"\s+", " ", str(text).strip()).replace("`", "ˋ")
    if len(value) > limit:
        value = value[: limit - 1].rstrip() + "…"
    return value


def humanizer_sha(root: Path) -> str:
    try:
        return subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return "unknown"


def read_paths(path: Path) -> list[str]:
    if not path.exists():
        return []
    seen: set[str] = set()
    result: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        item = line.strip()
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result


def run_report(humanizer, text: str) -> dict:
    return humanizer.run_review(
        text,
        style_id=STYLE_ID,
        evidence_ids=EVIDENCE_REQUEST,
        register=REGISTER,
    )


def delta_findings(head_report: dict, base_report: dict | None) -> list[dict]:
    base_counts = Counter(
        finding_signature(item) for item in (base_report or {}).get("findings", [])
    )
    result: list[dict] = []
    for finding in head_report.get("findings", []):
        signature = finding_signature(finding)
        if base_counts[signature]:
            base_counts[signature] -= 1
        else:
            result.append(finding)
    return result


def build_delta_board(humanizer, head_report: dict, findings: list[dict]) -> dict:
    # Evidence remains data, not an extra reviewer vote. Attaching head evidence to the
    # delta board is safe because groups themselves are built only from new findings.
    return humanizer.build_board(
        findings,
        head_report["style"],
        evidence=head_report.get("evidence", []),
    )


def reviewer_name(report: dict, reviewer_id: str) -> str:
    return report.get("reviewers", {}).get(reviewer_id, {}).get("display_name", reviewer_id)


def location(item: dict) -> str:
    line = int(item.get("line", 0) or 0)
    return f"строка {line}" if line else "метрика/весь текст"


def render_guardrail(item: dict) -> list[str]:
    lines = [
        f"- **{item.get('project_class')} · `{safe_inline(item.get('rule_id'), 90)}` · {location(item)} · `{item.get('library_id')}`**",
        f"  - Фрагмент: `{safe_inline(item.get('excerpt', ''))}`",
    ]
    if item.get("reason"):
        lines.append(f"  - Основание: {safe_inline(item['reason'], 260)}")
    if item.get("operation"):
        lines.append(f"  - Операция: `{safe_inline(item['operation'], 120)}`")
    return lines


def render_group(group: dict, report: dict) -> list[str]:
    lines = [
        f"- **`{safe_inline(group.get('phenomenon_id'), 90)}` · {group.get('status')} → {group.get('recommendation')}**",
        f"  - Фрагмент: `{safe_inline(group.get('excerpt', ''))}`",
    ]
    verdicts = []
    for reviewer_id, verdict in sorted(group.get("reviewer_verdicts", {}).items()):
        verdicts.append(f"{reviewer_name(report, reviewer_id)} — {verdict}")
    if verdicts:
        lines.append("  - Редакторы: " + "; ".join(verdicts))
    reasons: list[str] = []
    for finding in group.get("findings", []):
        reason = safe_inline(finding.get("reason") or finding.get("rule_id"), 220)
        label = reviewer_name(report, finding.get("reviewer_id") or finding.get("library_id") or "source")
        row = f"{label}: {reason}"
        if row not in reasons:
            reasons.append(row)
    for reason in reasons[:4]:
        lines.append(f"  - {reason}")
    if group.get("evidence"):
        lines.append(f"  - Evidence: {len(group['evidence'])} item(s), не голоса редколлегии")
    return lines


def summarize_board(board: dict) -> Counter:
    counts = Counter()
    counts["guardrails"] = len(board.get("guardrails", []))
    counts["groups"] = len(board.get("groups", []))
    for group in board.get("groups", []):
        counts[f"recommendation:{group.get('recommendation', 'REVIEW')}"] += 1
        counts[f"status:{group.get('status', 'REVIEW')}"] += 1
    return counts


def render_file_section(
    rel: str,
    report: dict,
    board: dict,
    global_budget: list[int],
) -> tuple[str, int]:
    guardrails = board.get("guardrails", [])
    groups = board.get("groups", [])
    items = [("guardrail", item) for item in guardrails] + [("group", item) for item in groups]
    if not items:
        return (
            f"<details><summary><code>{rel}</code> — clean delta</summary>\n\n"
            "Новых deterministic editorial findings относительно base-версии нет.\n\n</details>",
            0,
        )

    summary = summarize_board(board)
    lines = [
        f"<details open><summary><code>{rel}</code> — {summary['guardrails']} guardrails, {summary['groups']} editorial groups</summary>",
        "",
    ]
    omitted = 0
    for kind, item in items[:MAX_ITEMS_PER_FILE]:
        if global_budget[0] >= MAX_ITEMS_TOTAL:
            omitted += 1
            continue
        global_budget[0] += 1
        if kind == "guardrail":
            lines.extend(render_guardrail(item))
        else:
            lines.extend(render_group(item, report))
    if len(items) > MAX_ITEMS_PER_FILE:
        omitted += len(items) - MAX_ITEMS_PER_FILE
    lines.extend(["", "</details>"])
    return "\n".join(lines), omitted


def build_comment(
    humanizer,
    humanizer_root: Path,
    base_root: Path,
    head_root: Path,
    files_path: Path,
) -> str:
    files = read_paths(files_path)
    sha = humanizer_sha(humanizer_root)
    checked: list[str] = []
    skipped: list[str] = []
    sections: list[str] = []
    total = Counter()
    omitted_total = 0
    global_budget = [0]
    libraries_seen: set[str] = set()

    for rel in files:
        head_path = head_root / rel
        if not head_path.is_file():
            continue
        head_text = head_path.read_text(encoding="utf-8")
        if not is_russian_page(rel, head_text):
            skipped.append(rel)
            continue

        checked.append(rel)
        head_report = run_report(humanizer, head_text)
        libraries_seen.update(head_report.get("metrics", {}).keys())
        base_path = base_root / rel
        base_report = None
        if base_path.is_file():
            base_report = run_report(humanizer, base_path.read_text(encoding="utf-8"))

        new_findings = delta_findings(head_report, base_report)
        board = build_delta_board(humanizer, head_report, new_findings)
        total.update(summarize_board(board))
        section, omitted = render_file_section(rel, head_report, board, global_budget)
        omitted_total += omitted
        sections.append(section)

    repo_link = "https://github.com/Antiokh/humanizer_russian"
    commit_link = f"{repo_link}/commit/{sha}"
    body = [
        MARKER,
        "## humanizer_russian — расширенная редколлегия",
        "",
        f"Проверено по [`Antiokh/humanizer_russian@{sha[:7]}`]({commit_link}).",
        f"Режим: `editorial_board`, стиль `{STYLE_ID}`, register `{REGISTER}`, evidence `{EVIDENCE_REQUEST}`.",
        "Редколлегия получает полный deterministic output всех включённых knowledge libraries; в отличие от Compact, здесь нет фильтра только по DEFAULT mechanical findings.",
        "Model-only правила и LLM-семантическая правка в GitHub runner не выполняются. Evidence со статусом `PROJECT` режим `auto` не включает.",
        "**Это редакторская проверка, а не AI-detector и не оценка вероятности авторства.**",
        "",
    ]

    if libraries_seen:
        body.append(
            f"Активные библиотеки ({len(libraries_seen)}): "
            + ", ".join(f"`{item}`" for item in sorted(libraries_seen))
            + "."
        )
        body.append("")

    if not checked:
        body.extend(["Изменённых русскоязычных MDX-страниц для проверки нет.", ""])
    else:
        body.extend(
            [
                f"**Delta:** {total['guardrails']} guardrails, {total['groups']} editorial groups; "
                f"CHANGE {total['recommendation:CHANGE']}, KEEP {total['recommendation:KEEP']}, "
                f"REVIEW {total['recommendation:REVIEW']}, alternatives {total['recommendation:SHOW_ALTERNATIVES']}.",
                "Сравнение идёт с base-версией страницы, поэтому старый редакционный долг не приписывается текущему PR.",
                "",
            ]
        )
        body.extend(sections)
        body.append("")

    if skipped:
        body.append(
            f"Пропущено {len(skipped)} EN/SR или нерусских MDX-файлов: "
            + ", ".join(f"`{path}`" for path in skipped[:8])
            + ("…" if len(skipped) > 8 else "")
        )
        body.append("")
    if omitted_total:
        body.append(f"Ещё {omitted_total} пунктов скрыто, чтобы комментарий не превращался в простыню.")
        body.append("")

    if total["guardrails"]:
        body.append("**Рекомендация:** сначала разберите `NORM`/`ARTIFACT` guardrails, затем решения редколлегии по стилю и употреблению.")
    elif total["recommendation:CHANGE"] or total["recommendation:SHOW_ALTERNATIVES"]:
        body.append("**Рекомендация:** применяйте CHANGE только после проверки фрагмента в контексте; конфликт источников сохраняйте как альтернативы, а не усредняйте.")
    elif checked:
        body.append("Новых actionable findings в изменённых русскоязычных страницах нет.")

    return "\n".join(body).rstrip() + "\n"


def self_test(humanizer, root: Path) -> dict:
    base = "Команда проводит проверку документов. Результат публикуют после проверки фактов."
    head = "Командой осуществляется проведение проверки документов. Результат публикуют после проверки фактов."
    base_report = run_report(humanizer, base)
    head_report = run_report(humanizer, head)
    assert head_report.get("mode") == "editorial_board"
    assert head_report.get("style", {}).get("id") == STYLE_ID
    assert head_report.get("evidence_request") == EVIDENCE_REQUEST
    libraries = sorted(head_report.get("metrics", {}).keys())
    assert len(libraries) == 8, libraries
    findings = delta_findings(head_report, base_report)
    assert any(item.get("rule_id") == "ILY-M01" for item in findings), findings
    board = build_delta_board(humanizer, head_report, findings)
    assert board.get("groups") or board.get("guardrails")
    return {
        "humanizer_sha": humanizer_sha(root),
        "mode": head_report.get("mode"),
        "style": head_report.get("style", {}).get("id"),
        "register": head_report.get("register"),
        "evidence_request": head_report.get("evidence_request"),
        "libraries": libraries,
        "delta_findings": len(findings),
        "detected_rule": "ILY-M01",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--humanizer-root", type=Path, required=True)
    parser.add_argument("--base-root", type=Path)
    parser.add_argument("--head-root", type=Path)
    parser.add_argument("--files", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    humanizer = load_humanizer(args.humanizer_root)
    if args.self_test:
        print(json.dumps(self_test(humanizer, args.humanizer_root), ensure_ascii=False, indent=2))
        return 0

    missing = [
        name
        for name in ("base_root", "head_root", "files", "output")
        if getattr(args, name) is None
    ]
    if missing:
        parser.error("required outside --self-test: " + ", ".join("--" + name.replace("_", "-") for name in missing))

    comment = build_comment(
        humanizer,
        args.humanizer_root,
        args.base_root,
        args.head_root,
        args.files,
    )
    args.output.write_text(comment, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
