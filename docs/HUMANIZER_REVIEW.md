# humanizer_russian review

Для русскоязычных MDX-изменений в pull request репозиторий запускает отдельную редакторскую проверку на базе [`Antiokh/humanizer_russian`](https://github.com/Antiokh/humanizer_russian).

## Что запускается автоматически

Workflow использует **зафиксированный commit** `humanizer_russian`, а не плавающую ветку `main`. Текущий pin хранится в `.github/workflows/humanizer-russian-review.yml` как `HUMANIZER_SHA`.

Для каждого изменённого русскоязычного MDX запускается `scripts/review.py` в расширенном Editorial Board режиме:

- mode: `editorial_board`;
- style: `rslive_content`;
- register: `general`;
- evidence: `auto`;
- все 8 включённых knowledge libraries: `russian`, `native`, `gal`, `chukovsky`, `ilyakhov`, `visson`, `rosenthal`, `golub`.

Editorial Board получает полный deterministic output включённых библиотек. В отличие от Compact-проверки, результат не ограничивается только `DEFAULT_MECHANICAL`: сохраняются доступные extended/metric/editorial сигналы и несогласие источников.

Evidence providers со статусом `PROJECT` режим `auto` не включает. Когда провайдер будет переведён в `OPERATIONAL` и разрешён для auto, его данные смогут прикладываться к совпадающим editorial groups, но не станут дополнительным «голосом» редактора.

## Delta относительно base

Проверка отдельно прогоняет head- и base-версии страницы. В комментарий попадают только новые normalized findings текущего PR. Сигнатура учитывает библиотеку, правило, phenomenon, project class, automation level, verdict и нормализованный фрагмент.

После вычитания старых findings Editorial Board строится заново только для delta. Поэтому старый редакционный долг не приписывается автору текущего изменения, а consensus/conflict/recommendation считаются именно для новых замечаний.

Комментарий показывает:

- `NORM`/`ARTIFACT` guardrails;
- editorial groups по `phenomenon_id`;
- итог коллегии (`CONSENSUS`, `SOURCE_CONFLICT`, `MAJORITY`, `SINGLE_REVIEW` и т. п.);
- рекомендацию `CHANGE`, `KEEP`, `REVIEW` или `SHOW_ALTERNATIVES`;
- позиции конкретных формализованных reviewer-профилей;
- исходные reasons/operations библиотек;
- подключённые evidence items отдельно от голосов редколлегии.

Комментарий один: при новом push workflow обновляет существующий комментарий. При миграции он также распознаёт старый marker `humanizer-ru-review`, чтобы не создавать дубль.

## Что эта проверка не делает

- Не определяет авторство текста и не выдаёт «вероятность ИИ».
- Не запускает model-only карточки и LLM-семантическую правку: GitHub runner выполняет только детерминированный runtime.
- Не блокирует merge. Review остаётся advisory; технический `Content quality` отвечает за синтаксис и структуру контента.
- Не проверяет `/en/`, `/sr/` и файлы без достаточного количества русского текста.
- Не включает evidence providers со статусом `PROJECT`.

## Самопроверка интеграции

Перед каждым PR-review workflow запускает:

```bash
python3 base/.github/scripts/humanizer_pr_review.py \
  --humanizer-root /tmp/humanizer_russian \
  --self-test
```

Smoke-test проверяет, что:

1. runtime действительно работает в `editorial_board`;
2. загружен style `rslive_content`;
3. register равен `general`;
4. evidence request равен `auto`;
5. активно ровно 8 knowledge libraries;
6. контрольная редакторская проблема ловится правилом `ILY-M01`.

Если контракт `humanizer_russian` изменится несовместимо, workflow упадёт до публикации PR-комментария.

## Безопасность PR

Workflow использует событие `pull_request`. Исполняемый `.github/scripts/humanizer_pr_review.py` берётся **только из base SHA**, поэтому head-ветка не может заменить review-код и получить его выполнение с правами workflow. Head checkout используется только как источник изменённых MDX-файлов.

Комментарий публикуется только для PR внутри этого репозитория и не выполняется для `dependabot[bot]`. Для fork-PR GitHub не получает write-команду из этого шага.

Сам `humanizer_russian` также загружается по полному pinned SHA и проверяется через `git rev-parse` перед запуском.
