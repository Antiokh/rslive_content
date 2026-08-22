#!/usr/bin/env bash
set -euo pipefail

BRANCH='agent/turkey-transit-housing-checklist'
OLD_HEAD="$(git rev-parse HEAD)"
git fetch origin main

mkdir -p /tmp/pr207
preserve() {
  local path="$1"
  mkdir -p "/tmp/pr207/$(dirname "$path")"
  git show "$OLD_HEAD:$path" > "/tmp/pr207/$path"
}

preserve src/content/docs/CONTENT_INDEX.yml
preserve src/content/docs/move/housing/index.mdx
preserve src/content/docs/move/travel/turkey/index.mdx
preserve src/content/docs/sr/index.mdx
preserve src/content/docs/sr/provera-stana-pre-najma/index.mdx

git reset --hard origin/main

for path in \
  src/content/docs/CONTENT_INDEX.yml \
  src/content/docs/move/housing/index.mdx \
  src/content/docs/move/travel/turkey/index.mdx \
  src/content/docs/sr/index.mdx \
  src/content/docs/sr/provera-stana-pre-najma/index.mdx
do
  mkdir -p "$(dirname "$path")"
  cp "/tmp/pr207/$path" "$path"
done

python3 <<'PY'
from pathlib import Path
import re

path = Path('src/content/docs/sr/provera-stana-pre-najma/index.mdx')
text = path.read_text()
text = text.replace(
    'description: "Екран који страни станар може да покаже власнику или агенту приликом разгледања: власништво, уговор, депозит, рачуни, грејање, кварови, пријава странца и услови исељења."',
    'description: "Екран који страни станар може да покаже власнику или агенту приликом разгледања: власништво, уговор, депозит, рачуни, грејање, кварови, правила становања, пријава странца и услови исељења."'
)

def after(needle, addition):
    global text
    if text.count(needle) != 1:
        raise SystemExit(f'Expected exactly one match: {needle!r}')
    text = text.replace(needle, needle + '\n' + addition)

after('38. **Који тип грејања има стан?**', '0. **Ако је грејање централно, да ли се плаћа током целе године, по потрошњи или на други начин?**')
after('42. **Да ли постоји познат проблем са притиском воде или прекидима воде?**', '0. **Да ли топла вода ради стално или постоје познати прекиди/ограничења?**')
after('44. **Да ли постоје познати кварови грејања, бојлера или клима-уређаја?**', '0. **Када је клима-уређај последњи пут сервисиран, ако то знате?**')
after('54. **Колико брзо обично можете да организујете мајстора када је квар хитан?**', '0. **Колико комплета кључева добија закупац и ко још има резервни кључ?**\n0. **Да ли власник улази у стан само по претходном договору са закупцем, осим у хитној ситуацији?**')
after('55. **Да ли је интернет већ уведен и који је провајдер?**', '0. **Која је уговорена брзина интернета (download/upload)?**')
text = text.replace('56. **На чије име је уговор за интернет?**', '56. **На чије име је уговор за интернет и ко га плаћа?**')
after('59. **Да ли се у згради или непосредној близини тренутно изводе велики радови?**', '0. **Да ли је стан окренут ка прометној улици, кафићу, клубу, школи или градилишту, или постоји други познат извор буке?**')
after('60. **Ако је у огласу наведен приватни паркинг или гаража, које тачно место припада стану и по ком основу се користи?**', '0. **Ако нема сопственог места, да ли је улица у платној паркинг зони и како станари обично паркирају?**')
old_heading = '## 8. Пријава странца, усељење и исељење'
new_block = '''## 8. Кућни љубимци, пушење, гости и правила зграде

0. **Да ли су кућни љубимци дозвољени и под којим условима?**
0. **Да ли је пушење дозвољено у стану?**
0. **Постоје ли посебна правила зграде која закупац треба да зна?**
0. **Постоје ли ограничења за госте или дужи боравак члана породице?**

## 9. Пријава странца, бројила, усељење и исељење'''
if text.count(old_heading) != 1:
    raise SystemExit('Missing section 8 heading')
text = text.replace(old_heading, new_block)
after('64. **Да ли ћемо при усељењу заједно записати и фотографисати стање бројила и број кључева?**', '0. **Ко пријављује стање бројила и ко чува потврду о пријављеном стању?**')
after('65. **Колики је отказни рок за закупца и колики за закуподавца?**', '0. **Шта се дешава ако закупац мора да се исели пре истека уговора?**')

counter = 0
lines = []
for line in text.splitlines():
    if re.match(r'^\d+\. \*\*', line):
        counter += 1
        line = re.sub(r'^\d+\.', f'{counter}.', line, count=1)
    lines.append(line)
if counter != 80:
    raise SystemExit(f'Expected 80 questions, got {counter}')
path.write_text('\n'.join(lines) + '\n')

sr_index = Path('src/content/docs/sr/index.mdx')
s = sr_index.read_text().replace('актуелна често постављана питања за угоститеље', 'актуелна често постављена питања за угоститеље')
sr_index.write_text(s)
PY

python3 <<'PY'
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import json, re, subprocess

def show_main(path):
    return subprocess.check_output(['git', 'show', f'origin/main:{path}'], text=True)

turkey = {
    'repo_path': 'src/content/docs/move/travel/turkey/index.mdx',
    'title': 'Пересадка через Турцию: аэропорты IST и SAW',
    'live_url': 'https://rslive.ru/move/travel/turkey/',
    'summaries': [
        'Добавили офлайн-гайд по пересадке через IST и SAW: схемы действий в терминалах, Wi-Fi с аварийными сценариями, Havaist и рельсовые/автобусные резервы, оплату, багаж, ночёвку и турецкий разговорник',
        'Перепроверили практические схемы IST↔SAW: добавили второй полностью рельсовый маршрут через Gayrettepe и Yenikapı, конкретные обходы M11/M4 и предупреждение о перронных автобусах SAW при коротких пересадках',
        'Убрали зависимость офлайн-сценария от внешних интерактивных карт и встроили локальные схемы терминалов IST и SAW в WebP q80 с сохранённым указанием источника'
    ]
}
sr = {
    'repo_path': 'src/content/docs/sr/provera-stana-pre-najma/index.mdx',
    'title': 'Контролна листа за преглед стана пре закупа',
    'live_url': 'https://rslive.ru/sr/provera-stana-pre-najma/',
    'summaries': ['Добавили сербоязычный экран с подробными вопросами владельцу или агенту: собственник и документы, регистрация иностранца, договор, депозит и комиссия, реальные счета, отопление, известные проблемы, доступ владельца, интернет, парковка, домашние животные, гости, ремонт и условия выезда; самостоятельные проверки арендатора оставили в русской версии']
}
housing = {
    'repo_path': 'src/content/docs/move/housing/index.mdx',
    'title': 'Поиск жилья',
    'live_url': 'https://rslive.ru/move/housing/',
    'summaries': [
        'Расширили русскую статью словарём сербских терминов для просмотра и договора: собственник, кадастр, депозит, комиссия, долги, плесень, отопление, акт приёма-передачи и регистрация иностранца',
        'Добавили двуязычный чек-лист: русский смысл каждого вопроса и готовая сербская фраза для владельца или агента; отдельно вынесли проверки, которые арендатор делает сам без перевода'
    ]
}
json_path = Path('docs/updates/daily/2026-08-22.json')
data = json.loads(show_main(json_path.as_posix()))
existing = {a['repo_path'] for a in data.get('articles', [])}
for article in (turkey, sr, housing):
    if article['repo_path'] not in existing:
        data['articles'].append(article)
data['generated_at'] = datetime.now(ZoneInfo('Europe/Belgrade')).isoformat(timespec='seconds')
data['commit_count'] = int(data.get('commit_count', 0)) + 1
json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

md_path = Path('docs/updates/daily/2026-08-22.md')
md = show_main(md_path.as_posix())
md = re.sub(r'article_count:\s*\d+', f"article_count: {len(data['articles'])}", md, count=1)
additions = '''

## Пересадка через Турцию: аэропорты IST и SAW

[Открыть статью](/move/travel/turkey/)

- Добавили офлайн-гайд по пересадке через IST и SAW: схемы действий в терминалах, Wi-Fi с аварийными сценариями, Havaist и рельсовые/автобусные резервы, оплату, багаж, ночёвку и турецкий разговорник.
- Перепроверили практические схемы IST↔SAW: добавили второй полностью рельсовый маршрут через Gayrettepe и Yenikapı, конкретные обходы M11/M4 и предупреждение о перронных автобусах SAW при коротких пересадках.
- Убрали зависимость офлайн-сценария от внешних интерактивных карт и встроили локальные схемы терминалов IST и SAW в WebP q80 с сохранённым указанием источника.

## Контролна листа за преглед стана пре закупа

[Открыть статью](/sr/provera-stana-pre-najma/)

- Добавили сербоязычный экран с подробными вопросами владельцу или агенту: собственник и документы, регистрация иностранца, договор, депозит и комиссия, реальные счета, отопление, известные проблемы, доступ владельца, интернет, парковка, домашние животные, гости, ремонт и условия выезда; самостоятельные проверки арендатора оставили в русской версии.

## Поиск жилья

[Открыть статью](/move/housing/)

- Расширили русскую статью словарём сербских терминов для просмотра и договора: собственник, кадастр, депозит, комиссия, долги, плесень, отопление, акт приёма-передачи и регистрация иностранца.
- Добавили двуязычный чек-лист: русский смысл каждого вопроса и готовая сербская фраза для владельца или агента; отдельно вынесли проверки, которые арендатор делает сам без перевода.
'''
md_path.write_text(md.rstrip() + additions + '\n')

monthly_path = Path('docs/updates/monthly/2026-08.md')
monthly = show_main(monthly_path.as_posix()).rstrip()
bullets = '''
- [Пересадка через Турцию: аэропорты IST и SAW](/move/travel/turkey/) — Добавили офлайн-гайд по пересадке через IST и SAW: схемы действий в терминалах, Wi-Fi с аварийными сценариями, Havaist и рельсовые/автобусные резервы, оплату, багаж, ночёвку и турецкий разговорник; Перепроверили практические схемы IST↔SAW: добавили второй полностью рельсовый маршрут через Gayrettepe и Yenikapı, конкретные обходы M11/M4 и предупреждение о перронных автобусах SAW при коротких пересадках; Убрали зависимость офлайн-сценария от внешних интерактивных карт и встроили локальные схемы терминалов IST и SAW в WebP q80 с сохранённым указанием источника
- [Контролна листа за преглед стана пре закупа](/sr/provera-stana-pre-najma/) — Добавили сербоязычный экран с подробными вопросами владельцу или агенту: собственник и документы, регистрация иностранца, договор, депозит и комиссия, реальные счета, отопление, известные проблемы, доступ владельца, интернет, парковка, домашние животные, гости, ремонт и условия выезда; самостоятельные проверки арендатора оставили в русской версии
- [Поиск жилья](/move/housing/) — Расширили русскую статью словарём сербских терминов для просмотра и договора: собственник, кадастр, депозит, комиссия, долги, плесень, отопление, акт приёма-передачи и регистрация иностранца; Добавили двуязычный чек-лист: русский смысл каждого вопроса и готовая сербская фраза для владельца или агента; отдельно вынесли проверки, которые арендатор делает сам без перевода
'''
monthly_path.write_text(monthly + '\n' + bullets)
PY

sudo apt-get update -qq
sudo apt-get install -y -qq webp
mkdir -p src/content/docs/move/travel/turkey/assets
curl --fail --location --silent --show-error https://allairportmaps.com/maps/imgs/IST.png -o /tmp/IST.png
curl --fail --location --silent --show-error https://allairportmaps.com/maps/imgs/SAW.png -o /tmp/SAW.png
echo '22e14b26f25b49f4e43a0b577cf4c9a2b5db18dcf4bba216ef7a82c04198bce3  /tmp/IST.png' | sha256sum -c -
echo '27b9d5c957c3448621327661f450f9fa92e22cdf6ad032aa2b7a1ff9ff000f92  /tmp/SAW.png' | sha256sum -c -
cwebp -quiet -q 80 -m 6 /tmp/IST.png -o src/content/docs/move/travel/turkey/assets/ist-terminal-map.webp
cwebp -quiet -q 80 -m 6 /tmp/SAW.png -o src/content/docs/move/travel/turkey/assets/saw-terminal-map.webp

rm -f .github/workflows/repair-pr207.yml .github/workflows/repair-pr207-run.yml scripts/repair-pr207.sh .repair-pr207-trigger

python3 <<'PY'
from pathlib import Path
import json, re
json.load(open('docs/updates/daily/2026-08-22.json'))
daily = Path('docs/updates/daily/2026-08-22.md').read_text()
monthly = Path('docs/updates/monthly/2026-08.md').read_text()
for needle in ('/arrival/nostrifikacija/', '/move/travel/turkey/', '/sr/provera-stana-pre-najma/', '/move/housing/'):
    assert needle in daily and needle in monthly, needle
sr = Path('src/content/docs/sr/provera-stana-pre-najma/index.mdx').read_text()
questions = sum(1 for line in sr.splitlines() if re.match(r'^\d+\. \*\*', line))
assert questions == 80, questions
for needle in ('кућни љубимци', 'пушење', 'резервни кључ', 'уговорена брзина интернета', 'пре истека уговора', 'платној паркинг зони', 'пријављује стање бројила'):
    assert needle in sr.lower(), needle
for image in ('ist-terminal-map.webp', 'saw-terminal-map.webp'):
    p = Path('src/content/docs/move/travel/turkey/assets') / image
    b = p.read_bytes()
    assert len(b) > 50000, (image, len(b))
    assert b[:4] == b'RIFF' and b[8:12] == b'WEBP', image
assert 'актуелна често постављена питања' in Path('src/content/docs/sr/index.mdx').read_text()
PY

git add -A
git config user.name 'Anton Nazarov'
git config user.email 'antiokh@yandex.ru'
git commit -m 'Добавить офлайн-карты и восстановить чек-лист аренды'
git push --force-with-lease origin "HEAD:$BRANCH"
