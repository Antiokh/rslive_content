#!/usr/bin/env python3
"""Build one advisory PR comment from Antiokh/humanizer--ru lint findings."""

from __future__ import annotations

import argparse
import importlib.util
import re
import subprocess
from collections import Counter
from pathlib import Path

MARKER = "<!-- humanizer-ru-review -->"
CYRILLIC = re.compile(r"[А-Яа-яЁё]")
MAX_FINDINGS_TOTAL = 40
MAX_FINDINGS_PER_FILE = 12


def load_humanizer(path: Path):
    spec = importlib.util.spec_from_file_location("humanizer_lint", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot import humanizer lint from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def normalize_excerpt(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()).lower()


def finding_signature(finding):
    kind, _line, rule, excerpt = finding
    return kind, rule, normalize_excerpt(excerpt)


def is_russian_page(path: str, text: str) -> bool:
    normalized = path.replace("\\", "/")
    if normalized.startswith("src/content/docs/en/") or normalized.startswith("src/content/docs/sr/"):
        return False
    return len(CYRILLIC.findall(text)) >= 20


def recommendation(kind: str, rule: str) -> str:
    low = rule.lower()
    if low.startswith("13 ") or "негативный параллелизм" in low:
        return "Уберите шаблон «не просто/не только…». Сформулируйте мысль прямо, без искусственного контраста."
    if low.startswith("23 ") or "мат-знаки" in low:
        return "В прозе замените кодовый или математический знак словами либо перестройте предложение."
    if low.startswith("27 ") or "рубленый драматизм" in low:
        return "Соберите стопку коротких фрагментов в обычное предложение; сохраните смысл, а не драматический ритм."
    if "разделитель" in low:
        return "Уберите горизонтальный разделитель. Для структуры используйте заголовок или обычный переход."
    if "переизбыток тире" in low:
        return "Проверьте повторяющийся синтаксический шаблон. Нормативные тире сохраняйте; лишние конструкции перепишите по смыслу."
    if "33 повтор глагола" in low:
        return "Проверьте соседние предложения: если повтор не нужен для смысла, перестройте одно из них."
    if "ритм монотонный" in low or "ритм без коротких" in low:
        return "Разнообразьте длину предложений и расставьте смысловые акценты; не дробите текст механически."
    if "жирный перебор" in low:
        return "Оставьте жирное только там, где оно действительно помогает навигации или акценту."
    if "формальное открытие" in low:
        return "Проверьте начало: можно ли быстрее поставить главный факт или действие, не добавляя искусственной разговорности."
    if "21 эмодзи" in low:
        return "Уберите декоративный эмодзи, если он не несёт функциональной роли."
    if kind == "ERROR":
        return "Это жёсткий запрет humanizer--ru: перепишите место по смыслу и прогоните линтер снова."
    return "Проверьте маркер в контексте. Если оборот не несёт факта — удалите; если несёт — замените конкретикой, а не синонимом."


def safe_inline(text: str, limit: int = 180) -> str:
    text = re.sub(r"\s+", " ", text.strip())
    text = text.replace("`", "ˋ")
    if len(text) > limit:
        text = text[: limit - 1].rstrip() + "…"
    return text


def humanizer_sha(humanizer_dir: Path) -> str:
    try:
        return subprocess.check_output(
            ["git", "-C", str(humanizer_dir), "rev-parse", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return "unknown"


def display_verdict(humanizer, errors: int, warnings: int) -> tuple[int, str]:
    score, verdict = humanizer.verdict(errors, warnings)
    if errors:
        return score, "gate-fail — есть humanizer ERROR"
    return score, verdict


def read_paths(path: Path) -> list[str]:
    if not path.exists():
        return []
    seen = set()
    result = []
    for line in path.read_text(encoding="utf-8").splitlines():
        item = line.strip()
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--humanizer", type=Path, required=True)
    parser.add_argument("--base-root", type=Path, required=True)
    parser.add_argument("--head-root", type=Path, required=True)
    parser.add_argument("--files", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    humanizer = load_humanizer(args.humanizer)
    files = read_paths(args.files)
    sha = humanizer_sha(args.humanizer.parent.parent)

    checked = []
    skipped = []
    total_errors = 0
    total_warnings = 0
    rendered_findings = 0
    omitted_findings = 0
    sections = []

    for rel in files:
        head_path = args.head_root / rel
        if not head_path.is_file():
            continue
        head_text = head_path.read_text(encoding="utf-8")
        if not is_russian_page(rel, head_text):
            skipped.append(rel)
            continue

        checked.append(rel)
        head_findings = list(humanizer.lint(head_text))

        base_path = args.base_root / rel
        if base_path.is_file():
            base_text = base_path.read_text(encoding="utf-8")
            base_counts = Counter(finding_signature(f) for f in humanizer.lint(base_text))
        else:
            base_counts = Counter()

        new_findings = []
        for finding in head_findings:
            sig = finding_signature(finding)
            if base_counts[sig]:
                base_counts[sig] -= 1
            else:
                new_findings.append(finding)

        errors = [f for f in new_findings if f[0] == "ERROR"]
        warnings = [f for f in new_findings if f[0] == "WARN"]
        total_errors += len(errors)
        total_warnings += len(warnings)

        score, verdict = display_verdict(humanizer, len(errors), len(warnings))
        if not new_findings:
            sections.append(
                f"<details><summary><code>{rel}</code> — clean</summary>\n\n"
                "Новых срабатываний относительно base-версии нет.\n\n</details>"
            )
            continue

        lines = [
            f"<details open><summary><code>{rel}</code> — severity {score}, {verdict}</summary>",
            "",
        ]
        for kind, line_no, rule, excerpt in new_findings[:MAX_FINDINGS_PER_FILE]:
            if rendered_findings >= MAX_FINDINGS_TOTAL:
                omitted_findings += 1
                continue
            rendered_findings += 1
            loc = f"строка {line_no}" if line_no else "метрика текста"
            lines.extend(
                [
                    f"- **{kind} · {loc} · `{safe_inline(rule, 100)}`**",
                    f"  - Фрагмент: `{safe_inline(excerpt)}`",
                    f"  - Рекомендация: {recommendation(kind, rule)}",
                ]
            )
        if len(new_findings) > MAX_FINDINGS_PER_FILE:
            omitted_findings += len(new_findings) - MAX_FINDINGS_PER_FILE
        lines.extend(["", "</details>"])
        sections.append("\n".join(lines))

    score, verdict = display_verdict(humanizer, total_errors, total_warnings)

    body = [
        MARKER,
        "## Humanizer RU review",
        "",
        f"Проверено по [`Antiokh/humanizer--ru@{sha[:7]}`](https://github.com/Antiokh/humanizer--ru/commit/{sha}).",
        "Автоматически запускается детерминированный `scripts/lint.py`; семантические фазы полного skill без LLM здесь не выполняются.",
        "**Это стилистический индикатор AI-слопа, а не детектор авторства и не вероятность того, что текст написал ИИ.**",
        "",
    ]

    if not checked:
        body.extend(["Изменённых русскоязычных MDX-страниц для проверки нет.", ""])
    else:
        body.extend(
            [
                f"**Delta:** {total_errors} errors, {total_warnings} warnings, severity {score} → **{verdict}**.",
                "Сравнение идёт с base-версией страницы, поэтому старый редакционный долг не приписывается текущему PR.",
                "",
            ]
        )
        body.extend(sections)
        body.append("")

    if skipped:
        body.append(
            f"Пропущено {len(skipped)} EN/SR или нерусских MDX-файлов: "
            + ", ".join(f"`{p}`" for p in skipped[:8])
            + ("…" if len(skipped) > 8 else "")
        )
        body.append("")
    if omitted_findings:
        body.append(f"Ещё {omitted_findings} срабатываний скрыто, чтобы комментарий не превращался в простыню.")
        body.append("")

    if total_errors:
        body.append(
            "**Рекомендация:** сначала исправьте `ERROR`, затем повторно посмотрите `WARN` кластерами. "
            "Одиночный warning сам по себе не требует переписывать фразу."
        )
    elif total_warnings:
        body.append(
            "**Рекомендация:** warnings оценивайте кластерами. "
            "Если формула не несёт факта — удалите; если несёт — замените конкретикой, не синонимом."
        )
    elif checked:
        body.append("Новых humanizer-срабатываний в изменённых русскоязычных страницах нет.")

    args.output.write_text("\n".join(body).rstrip() + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
