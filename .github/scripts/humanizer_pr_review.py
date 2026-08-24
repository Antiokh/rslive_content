#!/usr/bin/env python3
"""Формирует человекочитаемый отзыв редколлегии для pull request."""

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
PUBLIC_TITLE = "Отзыв редколлегии"
CYRILLIC = re.compile(r"[А-Яа-яЁё]")
STYLE_ID = "rslive_content"
REGISTER = "general"
EVIDENCE_REQUEST = "auto"
MAX_ITEMS_TOTAL = 40
FRONTMATTER_DELIMITER = "---"

EDITORS = (
    ("russian", "📚", "Русский язык", "Замечание по русскому языку"),
    ("native", "💬", "Живой русский", "Замечание по живому русскому"),
    ("chukovsky", "🪶", "Корней Чуковский", "Стилистическое замечание"),
    ("gal", "✒️", "Нора Галь", "Стилистическое замечание"),
    ("ilyakhov", "✂️", "Максим Ильяхов и Людмила Сарычева", "Редакторское замечание"),
    ("visson", "🌍", "Линн Виссон", "Замечание по естественности русской речи"),
    ("rosenthal", "📐", "Д. Э. Розенталь", "Замечание по русскому языку и стилю"),
    ("golub", "🔎", "И. Б. Голуб", "Стилистическое замечание"),
)
EDITOR_INDEX = {editor_id: item for item in EDITORS for editor_id in [item[0]]}

KNOWN_TITLES = {
    "russian.foreign_word_in_russian_prose": "Иностранное слово в русском тексте",
    "russian.unmarked_heading_candidate": "Возможный неразмеченный заголовок",
    "russian.list_case_punctuation_alignment": "Пунктуация в списке",
    "editing.action_hidden_in_nominalization": "Тяжёлая конструкция",
    "native.context_undercompression": "Повтор уже названной информации",
}

KNOWN_REASONS = {
    "editing.action_hidden_in_nominalization": (
        "В предложении несколько существительных, обозначающих действия. "
        "Проверьте, не станет ли фраза легче, если вернуть часть действий в глаголы."
    ),
    "native.context_undercompression": (
        "Соседние предложения повторяют одни и те же смысловые слова. "
        "Проверьте, можно ли сделать повтор компактнее, опираясь на уже сказанное."
    ),
}


def load_humanizer(root: Path):
    scripts = root / "scripts"
    review_path = scripts / "review.py"
    if not review_path.is_file():
        raise RuntimeError(f"Не найден humanizer_russian review.py в {root}")
    sys.path.insert(0, str(scripts))
    spec = importlib.util.spec_from_file_location("humanizer_russian_review", review_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Не удалось загрузить humanizer_russian из {review_path}")
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


def split_frontmatter(raw: str) -> tuple[str, str, bool]:
    """Возвращает служебный YAML, основной текст и признак наличия YAML-блока."""
    lines = raw.splitlines()
    if not lines or lines[0].strip() != FRONTMATTER_DELIMITER:
        return "", raw, False
    for index in range(1, len(lines)):
        if lines[index].strip() == FRONTMATTER_DELIMITER:
            frontmatter = "\n".join(lines[1:index])
            body = "\n".join(lines[index + 1 :]).lstrip("\n")
            return frontmatter, body, True
    return "", raw, False


def _decode_scalar(value: str) -> str:
    value = value.strip()
    if not value:
        return ""
    if value.startswith('"') and value.endswith('"'):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value[1:-1]
    if value.startswith("'") and value.endswith("'"):
        return value[1:-1].replace("''", "'")
    return value


def extract_frontmatter_text(frontmatter: str, key: str) -> str:
    """Извлекает одно текстовое поле верхнего уровня без YAML-зависимости."""
    lines = frontmatter.splitlines()
    pattern = re.compile(rf"^{re.escape(key)}:\s*(.*)$")
    for index, line in enumerate(lines):
        match = pattern.match(line)
        if not match:
            continue
        tail = match.group(1).strip()
        if tail not in {"|", "|-", "|+", ">", ">-", ">+"}:
            return _decode_scalar(tail)

        block: list[str] = []
        for following in lines[index + 1 :]:
            if following and not following[0].isspace():
                break
            if not following.strip():
                block.append("")
                continue
            block.append(following.lstrip())
        if tail.startswith(">"):
            return re.sub(r"\s+", " ", " ".join(block)).strip()
        return "\n".join(block).strip()
    return ""


def editorial_input(raw: str) -> tuple[str, dict]:
    """Готовит для проверки заголовок, описание и полный основной текст MDX."""
    frontmatter, body, had_frontmatter = split_frontmatter(raw)
    title = extract_frontmatter_text(frontmatter, "title") if had_frontmatter else ""
    description = (
        extract_frontmatter_text(frontmatter, "description") if had_frontmatter else ""
    )

    parts: list[str] = []
    if title:
        parts.extend([title, ""])
    if description:
        parts.extend([description, ""])
    parts.append(body.rstrip())
    text = "\n".join(parts).strip() + "\n"

    return text, {
        "scope": "whole_article",
        "frontmatter_excluded": had_frontmatter,
        "title_included": bool(title),
        "description_included": bool(description),
        "title_chars": len(title),
        "description_chars": len(description),
        "body_chars": len(body),
        "review_chars": len(text),
    }


def is_russian_page(path: str, raw: str) -> bool:
    normalized = path.replace("\\", "/")
    if normalized.startswith("src/content/docs/en/") or normalized.startswith(
        "src/content/docs/sr/"
    ):
        return False
    text, _scope = editorial_input(raw)
    return len(CYRILLIC.findall(text)) >= 20


def safe_inline(text: str, limit: int = 220) -> str:
    value = re.sub(r"\s+", " ", str(text).strip()).replace("`", "ˋ")
    if len(value) > limit:
        value = value[: limit - 1].rstrip() + "…"
    return value


def quote(text: str, limit: int = 360) -> list[str]:
    value = safe_inline(text, limit)
    return [f"> {value}"] if value else []


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


def plural(number: int, forms: tuple[str, str, str]) -> str:
    n = abs(number) % 100
    n1 = n % 10
    if 10 < n < 20:
        return forms[2]
    if n1 == 1:
        return forms[0]
    if 2 <= n1 <= 4:
        return forms[1]
    return forms[2]


def finding_editor_id(finding: dict) -> str:
    return str(finding.get("reviewer_id") or finding.get("library_id") or "")


def visible_title(finding: dict, editor_id: str) -> str:
    title = str(finding.get("display_rule_ru") or "").strip()
    if title and CYRILLIC.search(title):
        return safe_inline(title, 140)
    phenomenon = str(finding.get("phenomenon_id") or "")
    if phenomenon in KNOWN_TITLES:
        return KNOWN_TITLES[phenomenon]
    return EDITOR_INDEX.get(editor_id, ("", "", "", "Редакторское замечание"))[3]


def visible_reason(finding: dict) -> str:
    phenomenon = str(finding.get("phenomenon_id") or "")
    if phenomenon in KNOWN_REASONS:
        return KNOWN_REASONS[phenomenon]
    reason = str(finding.get("reason") or "").strip()
    if reason and CYRILLIC.search(reason):
        return safe_inline(reason, 420)
    return "Перечитайте этот фрагмент в контексте и решите, делает ли правка текст точнее или легче."


def render_finding(record: dict, editor_id: str, show_path: bool) -> list[str]:
    finding = record["finding"]
    lines = [f"**{visible_title(finding, editor_id)}**", ""]
    if show_path:
        lines.extend([f"_Файл: `{record['path']}`_", ""])
    line = int(finding.get("line", 0) or 0)
    if line:
        lines.extend([f"_Строка: {line}_", ""])
    lines.extend(quote(finding.get("excerpt", "")))
    if finding.get("excerpt"):
        lines.append("")
    lines.append(visible_reason(finding))
    return lines


def render_editor_section(
    number: int,
    editor: tuple[str, str, str, str],
    records: list[dict],
    total_count: int,
    show_path: bool,
) -> str:
    editor_id, emoji, name, _fallback = editor
    lines = [f"### {number}. {emoji} {name}", ""]
    if total_count == 0:
        lines.append("Замечаний нет. ✅")
        return "\n".join(lines)

    lines.append(
        f"Найдено {total_count} {plural(total_count, ('замечание', 'замечания', 'замечаний'))}."
    )
    if len(records) < total_count:
        lines.append(f"Ниже показаны первые {len(records)}.")
    lines.append("")

    for index, record in enumerate(records, 1):
        if total_count > 1:
            lines.extend([f"#### {index}", ""])
        lines.extend(render_finding(record, editor_id, show_path))
        lines.append("")
    return "\n".join(lines).rstrip()


def scope_line(path: str, scope: dict) -> str:
    title = "да" if scope["title_included"] else "нет"
    description = "да" if scope["description_included"] else "нет"
    yaml_note = "исключены" if scope["frontmatter_excluded"] else "не обнаружены"
    return (
        f"- `{path}` — заголовок: {title}; описание: {description}; "
        f"основной текст: {scope['body_chars']} символов; "
        f"всего проверено: {scope['review_chars']} символов; "
        f"прочие служебные поля YAML: {yaml_note}."
    )


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
    scopes: dict[str, dict] = {}
    libraries_seen: set[str] = set()
    records: list[dict] = []
    board_summaries: list[dict] = []

    for rel in files:
        head_path = head_root / rel
        if not head_path.is_file():
            continue
        head_raw = head_path.read_text(encoding="utf-8")
        if not is_russian_page(rel, head_raw):
            skipped.append(rel)
            continue

        checked.append(rel)
        head_text, head_scope = editorial_input(head_raw)
        scopes[rel] = head_scope
        head_report = run_report(humanizer, head_text)
        libraries_seen.update(head_report.get("metrics", {}).keys())

        base_path = base_root / rel
        base_report = None
        if base_path.is_file():
            base_raw = base_path.read_text(encoding="utf-8")
            base_text, _base_scope = editorial_input(base_raw)
            base_report = run_report(humanizer, base_text)

        new_findings = delta_findings(head_report, base_report)
        board = humanizer.build_board(
            new_findings,
            head_report["style"],
            evidence=head_report.get("evidence", []),
        )
        board_summaries.append(
            {
                "path": rel,
                "guardrails": len(board.get("guardrails", [])),
                "groups": len(board.get("groups", [])),
                "board": board,
            }
        )
        for finding in new_findings:
            records.append({"path": rel, "finding": finding})

    body = [MARKER, f"## 📝 {PUBLIC_TITLE}", ""]

    if not checked:
        body.extend(
            [
                "Изменённых русскоязычных MDX-страниц для проверки нет.",
                "",
                "<details>",
                "<summary>🔧 Технические сведения о проверке</summary>",
                "",
                f"Версия: [`Antiokh/humanizer_russian@{sha[:7]}`](https://github.com/Antiokh/humanizer_russian/commit/{sha}).",
                "",
                "</details>",
            ]
        )
        return "\n".join(body).rstrip() + "\n"

    counts = Counter(finding_editor_id(record["finding"]) for record in records)
    active_editors = sum(1 for editor_id, *_rest in EDITORS if counts[editor_id])
    total_findings = sum(counts[editor_id] for editor_id, *_rest in EDITORS)

    if len(checked) == 1:
        body.append("Редколлегия проверила всю изменённую русскоязычную статью.")
    else:
        body.append(
            f"Редколлегия проверила все изменённые русскоязычные страницы ({len(checked)})."
        )
    body.append(
        f"Замечания оставили {active_editors} из {len(EDITORS)} редакторов. "
        f"Всего — {total_findings} "
        f"{plural(total_findings, ('замечание', 'замечания', 'замечаний'))}."
    )
    body.append("")

    for number, editor in enumerate(EDITORS, 1):
        editor_id, emoji, name, _fallback = editor
        count = counts[editor_id]
        status = (
            f"{count} {plural(count, ('замечание', 'замечания', 'замечаний'))}"
            if count
            else "замечаний нет"
        )
        body.append(f"{number}. {emoji} **{name}** — {status}.")
    body.append("")

    visible_records = records[:MAX_ITEMS_TOTAL]
    records_by_editor: dict[str, list[dict]] = {editor_id: [] for editor_id, *_ in EDITORS}
    for record in visible_records:
        editor_id = finding_editor_id(record["finding"])
        if editor_id in records_by_editor:
            records_by_editor[editor_id].append(record)

    show_path = len(checked) > 1
    for number, editor in enumerate(EDITORS, 1):
        editor_id = editor[0]
        body.extend(
            [
                render_editor_section(
                    number,
                    editor,
                    records_by_editor[editor_id],
                    counts[editor_id],
                    show_path,
                ),
                "",
            ]
        )

    omitted = max(0, len(records) - len(visible_records))
    if omitted:
        body.extend(
            [
                f"Ещё {omitted} {plural(omitted, ('замечание', 'замечания', 'замечаний'))} "
                "не показано, чтобы комментарий оставался читаемым.",
                "",
            ]
        )

    repo_link = "https://github.com/Antiokh/humanizer_russian"
    body.extend(
        [
            "<details>",
            "<summary>🔧 Технические сведения о проверке</summary>",
            "",
            f"Проверено по [`Antiokh/humanizer_russian@{sha[:7]}`]({repo_link}/commit/{sha}).",
            f"Внутренний режим: `{STYLE_ID}` / `editorial_board`; регистр: `{REGISTER}`; дополнительные данные: `{EVIDENCE_REQUEST}`.",
            "Для каждого изменённого MDX отдельно проверяются полные версии до и после изменения. "
            "В отзыв попадают только новые находки, поэтому старый редакционный долг не приписывается текущему PR.",
            "",
            "**Область проверки:**",
            "",
        ]
    )
    body.extend(scope_line(path, scopes[path]) for path in checked)

    if libraries_seen:
        body.extend(
            [
                "",
                "**Активные внутренние библиотеки:** "
                + ", ".join(f"`{item}`" for item in sorted(libraries_seen))
                + ".",
            ]
        )

    if skipped:
        body.extend(
            [
                "",
                "Пропущены английские, сербские или нерусские MDX-файлы: "
                + ", ".join(f"`{path}`" for path in skipped[:8])
                + ("…" if len(skipped) > 8 else "")
                + ".",
            ]
        )

    body.extend(["", "**Машинные идентификаторы находок:**", ""])
    if not records:
        body.append("Новых машинных находок относительно базовой версии нет.")
    else:
        for record in records[:MAX_ITEMS_TOTAL]:
            finding = record["finding"]
            body.append(
                "- "
                f"`{record['path']}` · "
                f"`{finding.get('library_id')}` · "
                f"`{finding.get('rule_id')}` · "
                f"`{finding.get('phenomenon_id')}` · "
                f"`{finding.get('project_class')}` · "
                f"`{finding.get('verdict')}`"
            )

    body.extend(["", "**Внутренние решения коллегии:**", ""])
    any_groups = False
    for summary in board_summaries:
        board = summary["board"]
        for group in board.get("groups", [])[:MAX_ITEMS_TOTAL]:
            any_groups = True
            body.append(
                "- "
                f"`{summary['path']}` · "
                f"`{group.get('phenomenon_id')}` · "
                f"`{group.get('status')}` → `{group.get('recommendation')}`"
            )
    if not any_groups:
        body.append("Новых редакционных групп относительно базовой версии нет.")

    body.extend(
        [
            "",
            "Это редакторская проверка текста. Она не определяет авторство и не оценивает вероятность использования ИИ.",
            "",
            "</details>",
        ]
    )
    return "\n".join(body).rstrip() + "\n"


def self_test(humanizer, root: Path) -> dict:
    clean_body = (
        "Команда проводит проверку документов. "
        "Результат публикуют после проверки фактов."
    )
    title_case = f"""---
title: "Командой осуществляется проведение проверки документов."
description: "Краткое описание."
ogSticker: "passport"
sidebar:
  order: 99
live: "https://example.invalid/"
---

{clean_body}
"""
    description_case = f"""---
title: "Проверка документов"
description: "Командой осуществляется проведение проверки документов."
ogSticker: "passport"
sidebar:
  order: 99
---

{clean_body}
"""
    metadata_case = f"""---
title: "Проверка документов"
description: "Краткое описание."
hiddenNote: "Командой осуществляется проведение проверки документов."
ogSticker: "passport"
---

{clean_body}
"""

    title_text, title_scope = editorial_input(title_case)
    description_text, description_scope = editorial_input(description_case)
    metadata_text, metadata_scope = editorial_input(metadata_case)

    assert "title:" not in title_text
    assert "description:" not in title_text
    assert "ogSticker" not in title_text
    assert "sidebar" not in title_text
    assert "live:" not in title_text
    assert "hiddenNote" not in metadata_text
    assert title_scope["scope"] == "whole_article"
    assert title_scope["frontmatter_excluded"]
    assert title_scope["title_included"]
    assert title_scope["description_included"]
    assert title_scope["body_chars"] == len(clean_body)
    assert description_scope["body_chars"] == len(clean_body)
    assert metadata_scope["body_chars"] == len(clean_body)

    clean_report = run_report(
        humanizer,
        editorial_input(
            f"""---
title: "Проверка документов"
description: "Краткое описание."
ogSticker: "Командой осуществляется проведение проверки документов."
---

{clean_body}
"""
        )[0],
    )
    title_report = run_report(humanizer, title_text)
    description_report = run_report(humanizer, description_text)
    metadata_report = run_report(humanizer, metadata_text)

    assert title_report.get("mode") == "editorial_board"
    assert title_report.get("style", {}).get("id") == STYLE_ID
    assert title_report.get("evidence_request") == EVIDENCE_REQUEST
    libraries = sorted(title_report.get("metrics", {}).keys())
    assert len(libraries) == 8, libraries

    title_delta = delta_findings(title_report, clean_report)
    description_delta = delta_findings(description_report, clean_report)
    metadata_delta = delta_findings(metadata_report, clean_report)

    assert any(item.get("rule_id") == "ILY-M01" for item in title_delta), title_delta
    assert any(
        item.get("rule_id") == "ILY-M01" for item in description_delta
    ), description_delta
    assert not any(
        item.get("rule_id") == "ILY-M01" for item in metadata_delta
    ), metadata_delta

    sample = {
        "path": "src/content/docs/test/index.mdx",
        "finding": {
            "reviewer_id": "chukovsky",
            "library_id": "chukovsky",
            "rule_id": "CHUK-TEST",
            "phenomenon_id": "editing.action_hidden_in_nominalization",
            "display_rule_ru": "Тяжёлая конструкция",
            "excerpt": "Проведение проверки осуществляется комиссией.",
            "reason": "Проверьте, можно ли заменить существительное действием.",
            "verdict": "REVIEW",
        },
    }
    rendered = render_editor_section(
        3,
        EDITOR_INDEX["chukovsky"],
        [sample],
        1,
        False,
    )
    assert "### 3. 🪶 Корней Чуковский" in rendered
    assert "Тяжёлая конструкция" in rendered
    assert "SINGLE_REVIEW" not in rendered
    assert "→ REVIEW" not in rendered

    return {
        "humanizer_sha": humanizer_sha(root),
        "mode": title_report.get("mode"),
        "style": title_report.get("style", {}).get("id"),
        "register": title_report.get("register"),
        "evidence_request": title_report.get("evidence_request"),
        "libraries": libraries,
        "scope": title_scope["scope"],
        "frontmatter_excluded": title_scope["frontmatter_excluded"],
        "detected_rule": "ILY-M01",
        "title_test_rule": "ILY-M01",
        "description_test_rule": "ILY-M01",
        "metadata_false_positive": False,
        "body_chars_checked": title_scope["body_chars"],
        "review_title": PUBLIC_TITLE,
        "editor_count": len(EDITORS),
        "public_machine_status_exposed": False,
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
        parser.error(
            "обязательные параметры вне --self-test: "
            + ", ".join("--" + name.replace("_", "-") for name in missing)
        )

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
