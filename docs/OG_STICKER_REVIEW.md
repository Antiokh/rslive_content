# Аудит OG-стикеров

> Review-only: этот файл фиксирует предложения. Frontmatter статей в этом PR не меняется.

- Snapshot content: `08acb4125a1aa2c5d8f42e1da3efbfba03372fa9`
- Маршрутов в `CONTENT_INDEX.yml`: **292**
- Если у MD/MDX нет `ogSticker`, движок использует fallback `giant-book.svg`.
- `blogerka` по канонической семантике — сатирический образ Instagram-блогеров/монетизации аудитории; это не нейтральный маркер раздела «Блог».

## Предложения, отличающиеся от текущего OG

| Текущий стикер | Страница и объяснение | Предлагаемый стикер |
|---|---|---|
| `/about/advertising/` | `fallback: giant-book.svg` | `logo` | Страница о рекламе внутри RSLive; `logo` связывает OG с самим проектом и лучше безликой книги-fallback. |
| `/about/app/` | `letter-list` | `smartphone` | Страница посвящена приложению; `smartphone` точнее общего списка. |
| `/adaptation/birth/clinics/` | `id` | `doctor` | Страница про медицинские учреждения; `doctor` точнее идентификационного `id`. |
| `/adaptation/birth/med/` | `id` | `doctor` | Медицинское наблюдение беременности — прямая медицинская тема; `doctor` точнее `id`. |
| `/arrival/business/codes/` | `fallback: giant-book.svg` | `letter-list` | Это справочник кодов деятельности; `letter-list` соответствует структуре и содержанию лучше fallback. |
| `/arrival/business/doo/` | `looking-for-salary` | `businessman` | Регистрация и ведение компании — бизнес-тема; `businessman` точнее стикера про поиск зарплаты. |
| `/arrival/business/e-comm/` | `fallback: giant-book.svg` | `businessman` | Электронная коммерция — бизнес-инфраструктура; `businessman` лучше generic fallback. |
| `/arrival/business/efaktura/` | `looking-for-salary` | `businessman` | SEF/eFaktura — операционная часть бизнеса; `businessman` точнее стикера про зарплату. |
| `/arrival/shops/` | `burger` | `shopping-lidl` | Страница о магазинах и повседневных покупках; `shopping-lidl` — канонический shopping-сюжет. |
| `/blog/chto_izmenilos_v_rslive_za_mesjac/` | `blogerka` | `logo` | Материал об изменениях самого проекта; `logo` является прямой семантической привязкой. |
| `/blog/dobro_pozhalovat_v_instrukciju_po_serbii/` | `blogerka` | `logo` | Материал о самом RSLive; `logo` описывает проект, а `blogerka` — сатиру на блогеров. |
| `/blog/gde_dorozhe_v_rossii_ili_v_serbii/` | `blogerka` | `payment-card` | Сравнение расходов и стоимости жизни; финансовый OG соответствует предмету. |
| `/blog/javljaetsja_li_serbija_bezopasnoj_stranoj/` | `blogerka` | `internet-research` | Страница сопоставляет данные о безопасности и рисках; исследовательский OG точнее. |
| `/blog/javljaetsja_li_serbija_xoroshej_stranoj_dlja_pereezda/` | `blogerka` | `move-stuff` | Материал оценивает практические условия переезда; миграционный OG соответствует теме. |
| `/blog/kak_otnosjatsja_k_lgbt_v_serbii/` | `blogerka` | `internet-research` | Фактологический обзор права и общественных данных; нужен нейтральный исследовательский OG. |
| `/blog/kak_v_serbii_otnosjatsja_k_russkim/` | `blogerka` | `internet-research` | Обзор исторических, социальных и политических факторов; исследовательский OG без сатирического оттенка. |
| `/blog/kakaja_srednjaja_zarplata_v_serbii/` | `blogerka` | `looking-for-salary` | Тема страницы — зарплата и доходы; есть прямой тематический стикер. |
| `/blog/kogda_serbija_budet_v_es/` | `blogerka` | `internet-research` | Фактологический разбор переговоров и условий вступления; нейтральный исследовательский OG. |
| `/blog/kogo_podderzhala_serbija_v_vojne_s_ukrainoj/` | `blogerka` | `internet-research` | Фактологический разбор внешнеполитических решений; нейтральный исследовательский OG. |
| `/blog/osnovnye_nalogovye_objazatelstva_do_konca_goda_v_serbii/` | `blogerka` | `calendar` | Ключевой смысл — календарные налоговые сроки до конца года. |
| `/blog/pochemu_russkie_edut_v_serbiju/` | `blogerka` | `move-stuff` | Основной сюжет — переезд и миграция. |
| `/blog/pochemu_serbija_byla_pod_sankcijami/` | `blogerka` | `internet-research` | Историко-политический справочный материал; нейтральный исследовательский OG. |
| `/blog/pochemu_serbija_ljubit_rossiju/` | `blogerka` | `internet-research` | Историко-социальный разбор; исследовательская метафора точнее сатирической «блогерки». |
| `/blog/pochemu_serbija_luchshaja_strana_dlja_immigracii_russkix/` | `blogerka` | `move-stuff` | Основной предмет — иммиграция и переезд; `move-stuff` соответствует содержанию без блогерской сатиры. |
| `/blog/serbija_samaja_dinamichno_rastuschaja_ehkonomika_evropy/` | `blogerka` | `investments-stock` | Экономический рост и показатели; инвестиционно-экономическая метафора точнее. |
| `/children/` | `giant-book` | `child` | Раздел целиком о детях; `child` прямее общего `giant-book`. |
| `/children/birth/` | `fallback: giant-book.svg` | `child` | Рождение ребёнка — прямой сюжет `child`; сейчас страница уходит в generic fallback. |
| `/children/school/` | `giant-book` | `schoolchild` | Школьный раздел; `schoolchild` точнее общего `giant-book`. |
| `/en/about/advertising/` | `fallback: giant-book.svg` | `logo` | Английская версия страницы о рекламе RSLive; `logo` логично связывает её с проектом. |
| `/en/russians-in-serbia/` | `party` | `russian-flag` | Энциклопедический раздел о русских в Сербии; `russian-flag` точнее `party`, который означает вечеринку. |
| `/lifestyle/coffee-bakeries-desserts/` | `fallback: giant-book.svg` | `kafa-coffee` | Кофейни, пекарни и десерты; `kafa-coffee` даёт прямой тематический образ вместо fallback. |
| `/lifestyle/culture/belgrade-neighborhoods/` | `fallback: giant-book.svg` | `map` | Районы Белграда — пространственная/городская тема; `map` точнее fallback. |
| `/lifestyle/culture/books/` | `fallback: giant-book.svg` | `book-reader` | Книги и чтение; `book-reader` — прямой канонический сюжет. |
| `/lifestyle/culture/events/` | `fallback: giant-book.svg` | `calendar` | Культурные события завязаны на даты; `calendar` точнее fallback. |
| `/lifestyle/culture/museums/` | `fallback: giant-book.svg` | `book-reader` | Музеи — культурно-образовательная тема; `book-reader` ближе generic fallback. |
| `/lifestyle/ecology/recycling/` | `fallback: giant-book.svg` | `volunteer-ecology` | Переработка — экологическая тема; `volunteer-ecology` точнее generic fallback. |
| `/lifestyle/familiar-foods/` | `fallback: giant-book.svg` | `russian-food` | Страница про привычные русскоязычной аудитории продукты; `russian-food` передаёт предмет лучше fallback. |
| `/lifestyle/holidays/` | `fallback: giant-book.svg` | `calendar` | Праздники привязаны к датам; `calendar` — нейтральный и прямой вариант. |
| `/lifestyle/local-goods/` | `fallback: giant-book.svg` | `checkout` | Страница о покупке местных товаров; `checkout` обозначает покупки без привязки к конкретной сети. |
| `/lifestyle/serbian-food/` | `fallback: giant-book.svg` | `pecenje` | Сербская еда; `pecenje` — узнаваемый канонический гастрономический образ. |
| `/lifestyle/travel/events-calendar/` | `fallback: giant-book.svg` | `calendar` | Это календарь событий; `calendar` точнее fallback. |
| `/lifestyle/world-cuisines-belgrade/` | `fallback: giant-book.svg` | `menu-restorant` | Рестораны и кухни мира; `menu-restorant` передаёт ресторанную тему. |
| `/map/cuisine/` | `fallback: giant-book.svg` | `map` | Это именно карта гастрономических мест; `map` точнее generic fallback. |
| `/map/familiar-foods/` | `fallback: giant-book.svg` | `map` | Это картографический раздел с точками; `map` лучше generic fallback. |
| `/map/nosmoke/` | `no-drinking` | `gas-smoke-gray` | `no-drinking` семантически про алкоголь; канонический `gas-smoke-gray` прямо предназначен для дыма и некурящих мест. |
| `/med/` | `id` | `doctor` | Корневой медицинский раздел; `doctor` точнее идентификационного `id`. |
| `/med/blood-donation/` | `id` | `doctor` | Донорство крови — медицинская тема; `doctor` точнее `id`. |
| `/move/exchange/` | `payment-card` | `exchange` | `exchange` прямо обозначает обмен валюты и обменные пункты; точнее общего `payment-card`. |
| `/move/housing/electricity/` | `fallback: giant-book.svg` | `uplatnica` | Электричество в жилье связано с коммунальными начислениями и оплатой; `uplatnica` точнее generic fallback. |
| `/move/housing/handover/` | `fallback: giant-book.svg` | `house-keys` | Приём-передача жилья и ключей; `house-keys` — прямой сюжет. |
| `/move/housing/utilities/` | `fallback: giant-book.svg` | `uplatnica` | Коммунальные услуги и счета; `uplatnica` точнее generic fallback. |
| `/move/myths/` | `map` | `internet-research` | Разбор мифов — проверка утверждений и источников; `internet-research` точнее общей карты. |
| `/sources/` | `fallback: giant-book.svg` | `internet-research` | Страница источников и проверки информации; `internet-research` — прямой канонический сюжет. |
| `/sr/about/advertising/` | `fallback: giant-book.svg` | `logo` | Сербская версия страницы о рекламе RSLive; `logo` логично связывает её с проектом. |
| `/sr/rusi-u-srbiji/` | `party` | `russian-flag` | Энциклопедический раздел о русских в Сербии; `russian-flag` точнее `party`, который означает вечеринку. |

## Полный инвентарь

| Текущий стикер | Страница и объяснение | Предлагаемый стикер |
|---|---|---|
| 1 | `/` | `index.mdx` | `logo` | `logo` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 2 | `/404/` | `404.mdx` | `fallback: giant-book.svg` | `fallback: giant-book.svg` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 3 | `/about/` | `about/index.mdx` | `logo` | `logo` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 4 | `/about/advertising/` | `about/advertising/index.mdx` | `fallback: giant-book.svg` | `logo` | Страница о рекламе внутри RSLive; `logo` связывает OG с самим проектом и лучше безликой книги-fallback. |
| 5 | `/about/app/` | `about/app/index.mdx` | `letter-list` | `smartphone` | Страница посвящена приложению; `smartphone` точнее общего списка. |
| 6 | `/about/editorial-policy/` | `about/editorial-policy/index.mdx` | `internet-research` | `internet-research` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 7 | `/about/privacy/` | `about/privacy/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 8 | `/about/stickers/` | `about/stickers/index.mdx` | `petar` | `petar` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 9 | `/adaptation/` | `adaptation/index.mdx` | `hide-the-pain-harold` | `hide-the-pain-harold` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 10 | `/adaptation/birth/` | `adaptation/birth/index.mdx` | `child` | `child` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 11 | `/adaptation/birth/after/` | `adaptation/birth/after/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 12 | `/adaptation/birth/care/` | `adaptation/birth/care/index.mdx` | `parenting` | `parenting` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 13 | `/adaptation/birth/clinics/` | `adaptation/birth/clinics/index.mdx` | `id` | `doctor` | Страница про медицинские учреждения; `doctor` точнее идентификационного `id`. |
| 14 | `/adaptation/birth/maternity/` | `adaptation/birth/maternity/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 15 | `/adaptation/birth/med/` | `adaptation/birth/med/index.mdx` | `id` | `doctor` | Медицинское наблюдение беременности — прямая медицинская тема; `doctor` точнее `id`. |
| 16 | `/adaptation/birth/prepare/` | `adaptation/birth/prepare/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 17 | `/adaptation/cef/` | `adaptation/cef/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 18 | `/adaptation/communication/` | `adaptation/communication/index.mdx` | `queue` | `queue` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 19 | `/adaptation/consentid/` | `adaptation/consentid/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 20 | `/adaptation/ebs_jmbg_pib/` | `adaptation/ebs_jmbg_pib/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 21 | `/adaptation/eid/` | `adaptation/eid/index.mdx` | `eid` | `eid` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 22 | `/adaptation/menjacnice/` | `adaptation/menjacnice/index.mdx` | `exchange` | `exchange` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 23 | `/adaptation/psy/` | `adaptation/psy/index.mdx` | `psychology` | `psychology` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 24 | `/adaptation/russians/` | `adaptation/russians/index.mdx` | `russian-flag` | `russian-flag` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 25 | `/adaptation/russians/count/` | `adaptation/russians/count/index.mdx` | `internet-research` | `internet-research` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 26 | `/adaptation/russians/embassy/` | `adaptation/russians/embassy/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 27 | `/adaptation/russians/ksors/` | `adaptation/russians/ksors/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 28 | `/adaptation/russians/national-council/` | `adaptation/russians/national-council/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 29 | `/adaptation/russians/officials/` | `adaptation/russians/officials/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 30 | `/adaptation/russians/russian-house/` | `adaptation/russians/russian-house/index.mdx` | `solid-house` | `solid-house` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 31 | `/adaptation/srpski/` | `adaptation/srpski/index.mdx` | `srpski-teacher` | `srpski-teacher` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 32 | `/adaptation/work/` | `adaptation/work/index.mdx` | `looking-for-salary` | `looking-for-salary` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 33 | `/addressbook/` | engine-owned | `engine-owned / без MDX frontmatter` | `engine-owned / без MDX frontmatter` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 34 | `/addressbook/add/` | engine-owned | `engine-owned / без MDX frontmatter` | `engine-owned / без MDX frontmatter` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 35 | `/arrival/` | `arrival/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 36 | `/arrival/bank/` | `arrival/bank/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 37 | `/arrival/bank/adriatic/` | `arrival/bank/adriatic/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 38 | `/arrival/bank/alta/` | `arrival/bank/alta/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 39 | `/arrival/bank/apibanka/` | `arrival/bank/apibanka/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 40 | `/arrival/bank/posted/` | `arrival/bank/posted/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 41 | `/arrival/bank/raiffeisen/` | `arrival/bank/raiffeisen/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 42 | `/arrival/banks/` | `arrival/banks/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 43 | `/arrival/beli-karton/` | `arrival/beli-karton/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 44 | `/arrival/boravak/` | `arrival/boravak/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 45 | `/arrival/boravak/change-address/` | `arrival/boravak/change-address/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 46 | `/arrival/boravak/change/` | `arrival/boravak/change/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 47 | `/arrival/boravak/talent/` | `arrival/boravak/talent/index.mdx` | `trophy` | `trophy` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 48 | `/arrival/boravak/volontiranje/` | `arrival/boravak/volontiranje/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 49 | `/arrival/boravak/volontiranje/adra-serbia/` | `arrival/boravak/volontiranje/adra-serbia/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 50 | `/arrival/boravak/volontiranje/caritas-sabac/` | `arrival/boravak/volontiranje/caritas-sabac/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 51 | `/arrival/boravak/volontiranje/mladi-istrazivaci-srbije/` | `arrival/boravak/volontiranje/mladi-istrazivaci-srbije/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 52 | `/arrival/boravak/volontiranje/nof/` | `arrival/boravak/volontiranje/nof/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 53 | `/arrival/boravak/volontiranje/russian-diaspora/` | `arrival/boravak/volontiranje/russian-diaspora/index.mdx` | `internet-research` | `internet-research` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 54 | `/arrival/boravak/volontiranje/udruzenje-svetlost/` | `arrival/boravak/volontiranje/udruzenje-svetlost/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 55 | `/arrival/boravak/volontiranje/volonterski-centar-vojvodine/` | `arrival/boravak/volontiranje/volonterski-centar-vojvodine/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 56 | `/arrival/business/` | `arrival/business/index.mdx` | `businessman` | `businessman` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 57 | `/arrival/business/acquiring/` | `arrival/business/acquiring/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 58 | `/arrival/business/close/` | `arrival/business/close/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 59 | `/arrival/business/codes/` | `arrival/business/codes/index.mdx` | `fallback: giant-book.svg` | `letter-list` | Это справочник кодов деятельности; `letter-list` соответствует структуре и содержанию лучше fallback. |
| 60 | `/arrival/business/doo/` | `arrival/business/doo/index.mdx` | `looking-for-salary` | `businessman` | Регистрация и ведение компании — бизнес-тема; `businessman` точнее стикера про поиск зарплаты. |
| 61 | `/arrival/business/e-comm/` | `arrival/business/e-comm/index.mdx` | `fallback: giant-book.svg` | `businessman` | Электронная коммерция — бизнес-инфраструктура; `businessman` лучше generic fallback. |
| 62 | `/arrival/business/efaktura/` | `arrival/business/efaktura/index.mdx` | `looking-for-salary` | `businessman` | SEF/eFaktura — операционная часть бизнеса; `businessman` точнее стикера про зарплату. |
| 63 | `/arrival/business/eko/` | `arrival/business/eko/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 64 | `/arrival/business/inflow/` | `arrival/business/inflow/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 65 | `/arrival/business/prvsdoo/` | `arrival/business/prvsdoo/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 66 | `/arrival/business/register/` | `arrival/business/register/index.mdx` | `approve` | `approve` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 67 | `/arrival/business/types/` | `arrival/business/types/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 68 | `/arrival/carry/` | `arrival/carry/index.mdx` | `delivery` | `delivery` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 69 | `/arrival/freelance/` | `arrival/freelance/index.mdx` | `looking-for-salary` | `looking-for-salary` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 70 | `/arrival/jedinstvena-dozvola/` | `arrival/jedinstvena-dozvola/index.mdx` | `approve` | `approve` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 71 | `/arrival/jobs/` | `arrival/jobs/index.mdx` | `looking-for-salary` | `looking-for-salary` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 72 | `/arrival/mobile/` | `arrival/mobile/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 73 | `/arrival/nostrifikacija/` | `arrival/nostrifikacija/index.mdx` | `diploma` | `diploma` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 74 | `/arrival/post/` | `arrival/post/index.mdx` | `carina-customs` | `carina-customs` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 75 | `/arrival/prevoz/` | `arrival/prevoz/index.mdx` | `javni-prevoz` | `javni-prevoz` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 76 | `/arrival/rentacar/` | `arrival/rentacar/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 77 | `/arrival/shops/` | `arrival/shops/index.mdx` | `burger` | `shopping-lidl` | Страница о магазинах и повседневных покупках; `shopping-lidl` — канонический shopping-сюжет. |
| 78 | `/arrival/visarun/` | `arrival/visarun/index.mdx` | `travel` | `travel` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 79 | `/arrival/zdravlje/` | `arrival/zdravlje/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 80 | `/beli-karton/` | `beli-karton/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 81 | `/blog/chto_izmenilos_v_rslive_za_mesjac/` | `blog/chto_izmenilos_v_rslive_za_mesjac/index.mdx` | `blogerka` | `logo` | Материал об изменениях самого проекта; `logo` является прямой семантической привязкой. |
| 82 | `/blog/dobro_pozhalovat_v_instrukciju_po_serbii/` | `blog/dobro_pozhalovat_v_instrukciju_po_serbii/index.mdx` | `blogerka` | `logo` | Материал о самом RSLive; `logo` описывает проект, а `blogerka` — сатиру на блогеров. |
| 83 | `/blog/gde_dorozhe_v_rossii_ili_v_serbii/` | `blog/gde_dorozhe_v_rossii_ili_v_serbii/index.mdx` | `blogerka` | `payment-card` | Сравнение расходов и стоимости жизни; финансовый OG соответствует предмету. |
| 84 | `/blog/javljaetsja_li_serbija_bezopasnoj_stranoj/` | `blog/javljaetsja_li_serbija_bezopasnoj_stranoj/index.mdx` | `blogerka` | `internet-research` | Страница сопоставляет данные о безопасности и рисках; исследовательский OG точнее. |
| 85 | `/blog/javljaetsja_li_serbija_xoroshej_stranoj_dlja_pereezda/` | `blog/javljaetsja_li_serbija_xoroshej_stranoj_dlja_pereezda/index.mdx` | `blogerka` | `move-stuff` | Материал оценивает практические условия переезда; миграционный OG соответствует теме. |
| 86 | `/blog/kak_otnosjatsja_k_lgbt_v_serbii/` | `blog/kak_otnosjatsja_k_lgbt_v_serbii/index.mdx` | `blogerka` | `internet-research` | Фактологический обзор права и общественных данных; нужен нейтральный исследовательский OG. |
| 87 | `/blog/kak_v_serbii_otnosjatsja_k_russkim/` | `blog/kak_v_serbii_otnosjatsja_k_russkim/index.mdx` | `blogerka` | `internet-research` | Обзор исторических, социальных и политических факторов; исследовательский OG без сатирического оттенка. |
| 88 | `/blog/kakaja_srednjaja_zarplata_v_serbii/` | `blog/kakaja_srednjaja_zarplata_v_serbii/index.mdx` | `blogerka` | `looking-for-salary` | Тема страницы — зарплата и доходы; есть прямой тематический стикер. |
| 89 | `/blog/kogda_serbija_budet_v_es/` | `blog/kogda_serbija_budet_v_es/index.mdx` | `blogerka` | `internet-research` | Фактологический разбор переговоров и условий вступления; нейтральный исследовательский OG. |
| 90 | `/blog/kogo_podderzhala_serbija_v_vojne_s_ukrainoj/` | `blog/kogo_podderzhala_serbija_v_vojne_s_ukrainoj/index.mdx` | `blogerka` | `internet-research` | Фактологический разбор внешнеполитических решений; нейтральный исследовательский OG. |
| 91 | `/blog/osnovnye_nalogovye_objazatelstva_do_konca_goda_v_serbii/` | `blog/osnovnye_nalogovye_objazatelstva_do_konca_goda_v_serbii/index.mdx` | `blogerka` | `calendar` | Ключевой смысл — календарные налоговые сроки до конца года. |
| 92 | `/blog/pochemu_russkie_edut_v_serbiju/` | `blog/pochemu_russkie_edut_v_serbiju/index.mdx` | `blogerka` | `move-stuff` | Основной сюжет — переезд и миграция. |
| 93 | `/blog/pochemu_serbija_byla_pod_sankcijami/` | `blog/pochemu_serbija_byla_pod_sankcijami/index.mdx` | `blogerka` | `internet-research` | Историко-политический справочный материал; нейтральный исследовательский OG. |
| 94 | `/blog/pochemu_serbija_ljubit_rossiju/` | `blog/pochemu_serbija_ljubit_rossiju/index.mdx` | `blogerka` | `internet-research` | Историко-социальный разбор; исследовательская метафора точнее сатирической «блогерки». |
| 95 | `/blog/pochemu_serbija_luchshaja_strana_dlja_immigracii_russkix/` | `blog/pochemu_serbija_luchshaja_strana_dlja_immigracii_russkix/index.mdx` | `blogerka` | `move-stuff` | Основной предмет — иммиграция и переезд; `move-stuff` соответствует содержанию без блогерской сатиры. |
| 96 | `/blog/serbija_samaja_dinamichno_rastuschaja_ehkonomika_evropy/` | `blog/serbija_samaja_dinamichno_rastuschaja_ehkonomika_evropy/index.mdx` | `blogerka` | `investments-stock` | Экономический рост и показатели; инвестиционно-экономическая метафора точнее. |
| 97 | `/children/` | `children/index.mdx` | `giant-book` | `child` | Раздел целиком о детях; `child` прямее общего `giant-book`. |
| 98 | `/children/birth/` | `children/birth/index.mdx` | `fallback: giant-book.svg` | `child` | Рождение ребёнка — прямой сюжет `child`; сейчас страница уходит в generic fallback. |
| 99 | `/children/kindergarten/` | `children/kindergarten/index.mdx` | `child` | `child` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 100 | `/children/school/` | `children/school/index.mdx` | `giant-book` | `schoolchild` | Школьный раздел; `schoolchild` точнее общего `giant-book`. |
| 101 | `/drive/` | `drive/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 102 | `/drive/buy/` | `drive/buy/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 103 | `/drive/parking/` | `drive/parking/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 104 | `/drive/register_auto/` | `drive/register_auto/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 105 | `/edu/` | `edu/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 106 | `/edu/school/` | `edu/school/index.mdx` | `schoolchild` | `schoolchild` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 107 | `/edu/school/daily-life/` | `edu/school/daily-life/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 108 | `/edu/school/enrollment/` | `edu/school/enrollment/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 109 | `/edu/school/international/` | `edu/school/international/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 110 | `/edu/school/languages/` | `edu/school/languages/index.mdx` | `alphabets-mess` | `alphabets-mess` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 111 | `/edu/school/resources/` | `edu/school/resources/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 112 | `/edu/school/secondary-admission/` | `edu/school/secondary-admission/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 113 | `/edu/university/` | `edu/university/index.mdx` | `student-graduation` | `student-graduation` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 114 | `/en/` | `en/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 115 | `/en/about/` | `en/about/index.mdx` | `logo` | `logo` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 116 | `/en/about/advertising/` | `en/about/advertising/index.mdx` | `fallback: giant-book.svg` | `logo` | Английская версия страницы о рекламе RSLive; `logo` логично связывает её с проектом. |
| 117 | `/en/about/privacy/` | `en/about/privacy/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 118 | `/en/about/stickers/` | `en/about/stickers/index.mdx` | `petar` | `petar` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 119 | `/en/foreigner-residence-registration/` | `en/foreigner-residence-registration/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 120 | `/en/pig-peter/` | `en/pig-peter/index.mdx` | `petar` | `petar` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 121 | `/en/russians-in-serbia/` | `en/russians-in-serbia/index.mdx` | `party` | `russian-flag` | Энциклопедический раздел о русских в Сербии; `russian-flag` точнее `party`, который означает вечеринку. |
| 122 | `/en/russians-in-serbia/demographics/` | `en/russians-in-serbia/demographics/index.mdx` | `internet-research` | `internet-research` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 123 | `/en/russians-in-serbia/ksors/` | `en/russians-in-serbia/ksors/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 124 | `/en/russians-in-serbia/national-council/` | `en/russians-in-serbia/national-council/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 125 | `/en/russians-in-serbia/russian-house/` | `en/russians-in-serbia/russian-house/index.mdx` | `solid-house` | `solid-house` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 126 | `/gov/` | `gov/index.mdx` | `bureaucracy` | `bureaucracy` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 127 | `/gov/consul_prime/` | `gov/consul_prime/index.mdx` | `wizard` | `wizard` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 128 | `/gov/consumer-rights/` | `gov/consumer-rights/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 129 | `/gov/courts/` | `gov/courts/index.mdx` | `judge-court` | `judge-court` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 130 | `/gov/family/` | `gov/family/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 131 | `/gov/law/` | `gov/law/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 132 | `/gov/law/labor/` | `gov/law/labor/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 133 | `/gov/law/labor/russia/` | `gov/law/labor/russia/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 134 | `/gov/law/license/` | `gov/law/license/index.mdx` | `approve` | `approve` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 135 | `/gov/law/license/music/` | `gov/law/license/music/index.mdx` | `party` | `party` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 136 | `/gov/law/license/tourist/` | `gov/law/license/tourist/index.mdx` | `plane` | `plane` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 137 | `/gov/law/lost-house-documents/` | `gov/law/lost-house-documents/index.mdx` | `building-a-house` | `building-a-house` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 138 | `/gov/lawyer/` | `gov/lawyer/index.mdx` | `lawyer` | `lawyer` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 139 | `/gov/notary/` | `gov/notary/index.mdx` | `notarius` | `notarius` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 140 | `/gov/notguilty/` | `gov/notguilty/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 141 | `/gov/ombudsman/` | `gov/ombudsman/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 142 | `/gov/taxes/` | `gov/taxes/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 143 | `/gov/taxes/assets/` | `gov/taxes/assets/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 144 | `/gov/taxes/assets/capital-gains/` | `gov/taxes/assets/capital-gains/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 145 | `/gov/taxes/assets/foreign-assets/` | `gov/taxes/assets/foreign-assets/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 146 | `/gov/taxes/assets/property/` | `gov/taxes/assets/property/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 147 | `/gov/taxes/borovak/` | `gov/taxes/borovak/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 148 | `/gov/taxes/business/` | `gov/taxes/business/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 149 | `/gov/taxes/business/dividends/` | `gov/taxes/business/dividends/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 150 | `/gov/taxes/business/doo/` | `gov/taxes/business/doo/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 151 | `/gov/taxes/business/pdv/` | `gov/taxes/business/pdv/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 152 | `/gov/taxes/business/preduzetnik/` | `gov/taxes/business/preduzetnik/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 153 | `/gov/taxes/calculation/` | `gov/taxes/calculation/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 154 | `/gov/taxes/codes/` | `gov/taxes/codes/index.mdx` | `uplatnica` | `uplatnica` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 155 | `/gov/taxes/eco/` | `gov/taxes/eco/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 156 | `/gov/taxes/eporezi/` | `gov/taxes/eporezi/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 157 | `/gov/taxes/marketplace/` | `gov/taxes/marketplace/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 158 | `/gov/taxes/overpayment/` | `gov/taxes/overpayment/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 159 | `/gov/taxes/personal/` | `gov/taxes/personal/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 160 | `/gov/taxes/personal/annual-income/` | `gov/taxes/personal/annual-income/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 161 | `/gov/taxes/personal/foreign-income/` | `gov/taxes/personal/foreign-income/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 162 | `/gov/taxes/personal/freelance/` | `gov/taxes/personal/freelance/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 163 | `/gov/taxes/personal/salary/` | `gov/taxes/personal/salary/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 164 | `/gov/taxes/residency/` | `gov/taxes/residency/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 165 | `/gov/taxes/tax-free/` | `gov/taxes/tax-free/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 166 | `/gov/uverenje_boravak/` | `gov/uverenje_boravak/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 167 | `/graph/` | `graph/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 168 | `/integration/` | `integration/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 169 | `/integration/apostil/` | `integration/apostil/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 170 | `/integration/autoobuka/` | `integration/autoobuka/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 171 | `/integration/dresscode/` | `integration/dresscode/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 172 | `/integration/driver_license/` | `integration/driver_license/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 173 | `/integration/euprava/` | `integration/euprava/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 174 | `/integration/house/` | `integration/house/index.mdx` | `montage` | `montage` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 175 | `/integration/investment/` | `integration/investment/index.mdx` | `investments-stock` | `investments-stock` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 176 | `/integration/law_changes_2024/` | `integration/law_changes_2024/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 177 | `/integration/passport/` | `integration/passport/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 178 | `/integration/prijavastranca/` | `integration/prijavastranca/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 179 | `/integration/properties/` | `integration/properties/index.mdx` | `house-keys` | `house-keys` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 180 | `/integration/social/` | `integration/social/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 181 | `/integration/stalni/` | `integration/stalni/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 182 | `/integration/stalni/change-address/` | `integration/stalni/change-address/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 183 | `/integration/visas/` | `integration/visas/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 184 | `/intro/` | `intro/index.mdx` | `logo` | `logo` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 185 | `/lifestyle/` | `lifestyle/index.mdx` | `kafa-coffee` | `kafa-coffee` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 186 | `/lifestyle/coffee-bakeries-desserts/` | `lifestyle/coffee-bakeries-desserts/index.mdx` | `fallback: giant-book.svg` | `kafa-coffee` | Кофейни, пекарни и десерты; `kafa-coffee` даёт прямой тематический образ вместо fallback. |
| 187 | `/lifestyle/culture/` | `lifestyle/culture/index.mdx` | `kafana` | `kafana` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 188 | `/lifestyle/culture/belgrade-neighborhoods/` | `lifestyle/culture/belgrade-neighborhoods/index.mdx` | `fallback: giant-book.svg` | `map` | Районы Белграда — пространственная/городская тема; `map` точнее fallback. |
| 189 | `/lifestyle/culture/books/` | `lifestyle/culture/books/index.mdx` | `fallback: giant-book.svg` | `book-reader` | Книги и чтение; `book-reader` — прямой канонический сюжет. |
| 190 | `/lifestyle/culture/events/` | `lifestyle/culture/events/index.mdx` | `fallback: giant-book.svg` | `calendar` | Культурные события завязаны на даты; `calendar` точнее fallback. |
| 191 | `/lifestyle/culture/kum/` | `lifestyle/culture/kum/index.mdx` | `godfather` | `godfather` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 192 | `/lifestyle/culture/museums/` | `lifestyle/culture/museums/index.mdx` | `fallback: giant-book.svg` | `book-reader` | Музеи — культурно-образовательная тема; `book-reader` ближе generic fallback. |
| 193 | `/lifestyle/culture/slava/` | `lifestyle/culture/slava/index.mdx` | `uskrs` | `uskrs` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 194 | `/lifestyle/ecology/` | `lifestyle/ecology/index.mdx` | `volunteer-ecology` | `volunteer-ecology` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 195 | `/lifestyle/ecology/recycling/` | `lifestyle/ecology/recycling/index.mdx` | `fallback: giant-book.svg` | `volunteer-ecology` | Переработка — экологическая тема; `volunteer-ecology` точнее generic fallback. |
| 196 | `/lifestyle/familiar-foods/` | `lifestyle/familiar-foods/index.mdx` | `fallback: giant-book.svg` | `russian-food` | Страница про привычные русскоязычной аудитории продукты; `russian-food` передаёт предмет лучше fallback. |
| 197 | `/lifestyle/fishing/` | `lifestyle/fishing/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 198 | `/lifestyle/fun/` | `lifestyle/fun/index.mdx` | `party` | `party` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 199 | `/lifestyle/fun/dance/` | `lifestyle/fun/dance/index.mdx` | `party` | `party` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 200 | `/lifestyle/fun/pools/` | `lifestyle/fun/pools/index.mdx` | `swimming` | `swimming` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 201 | `/lifestyle/history/` | `lifestyle/history/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 202 | `/lifestyle/history/nato/` | `lifestyle/history/nato/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 203 | `/lifestyle/history/oluja/` | `lifestyle/history/oluja/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 204 | `/lifestyle/history/raska/` | `lifestyle/history/raska/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 205 | `/lifestyle/history/srebrenica/` | `lifestyle/history/srebrenica/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 206 | `/lifestyle/history/yugoslavia/` | `lifestyle/history/yugoslavia/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 207 | `/lifestyle/holidays/` | `lifestyle/holidays/index.mdx` | `fallback: giant-book.svg` | `calendar` | Праздники привязаны к датам; `calendar` — нейтральный и прямой вариант. |
| 208 | `/lifestyle/local-goods/` | `lifestyle/local-goods/index.mdx` | `fallback: giant-book.svg` | `checkout` | Страница о покупке местных товаров; `checkout` обозначает покупки без привязки к конкретной сети. |
| 209 | `/lifestyle/proscons/` | `lifestyle/proscons/index.mdx` | `willy-wonka` | `willy-wonka` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 210 | `/lifestyle/second-hand/` | `lifestyle/second-hand/index.mdx` | `spiderman-not-me-scam` | `spiderman-not-me-scam` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 211 | `/lifestyle/serbian-food/` | `lifestyle/serbian-food/index.mdx` | `fallback: giant-book.svg` | `pecenje` | Сербская еда; `pecenje` — узнаваемый канонический гастрономический образ. |
| 212 | `/lifestyle/travel/` | `lifestyle/travel/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 213 | `/lifestyle/travel/banje/` | `lifestyle/travel/banje/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 214 | `/lifestyle/travel/events-calendar/` | `lifestyle/travel/events-calendar/index.mdx` | `fallback: giant-book.svg` | `calendar` | Это календарь событий; `calendar` точнее fallback. |
| 215 | `/lifestyle/travel/fortresses/` | `lifestyle/travel/fortresses/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 216 | `/lifestyle/travel/fruska-gora-sremski-karlovci/` | `lifestyle/travel/fruska-gora-sremski-karlovci/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 217 | `/lifestyle/travel/ovcar-kablar-cacak/` | `lifestyle/travel/ovcar-kablar-cacak/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 218 | `/lifestyle/travel/resava/` | `lifestyle/travel/resava/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 219 | `/lifestyle/travel/rtanj/` | `lifestyle/travel/rtanj/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 220 | `/lifestyle/travel/short-nature-trips/` | `lifestyle/travel/short-nature-trips/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 221 | `/lifestyle/travel/south-banate/` | `lifestyle/travel/south-banate/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 222 | `/lifestyle/travel/stari-ras-novi-pazar/` | `lifestyle/travel/stari-ras-novi-pazar/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 223 | `/lifestyle/travel/vojvodina-cities/` | `lifestyle/travel/vojvodina-cities/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 224 | `/lifestyle/travel/wine-regions/` | `lifestyle/travel/wine-regions/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 225 | `/lifestyle/travel/winter-serbia/` | `lifestyle/travel/winter-serbia/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 226 | `/lifestyle/travel/yugoslav-spomenici/` | `lifestyle/travel/yugoslav-spomenici/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 227 | `/lifestyle/world-cuisines-belgrade/` | `lifestyle/world-cuisines-belgrade/index.mdx` | `fallback: giant-book.svg` | `menu-restorant` | Рестораны и кухни мира; `menu-restorant` передаёт ресторанную тему. |
| 228 | `/list/` | `list/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 229 | `/m25/` | `m25/index.mdx` | `pecenje` | `pecenje` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 230 | `/m26/` | `m26/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 231 | `/map/` | `map/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 232 | `/map/banje/` | `map/banje/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 233 | `/map/blacklist/` | `map/blacklist/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 234 | `/map/cuisine/` | `map/cuisine/index.mdx` | `fallback: giant-book.svg` | `map` | Это именно карта гастрономических мест; `map` точнее generic fallback. |
| 235 | `/map/dance/` | `map/dance/index.mdx` | `party` | `party` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 236 | `/map/familiar-foods/` | `map/familiar-foods/index.mdx` | `fallback: giant-book.svg` | `map` | Это картографический раздел с точками; `map` лучше generic fallback. |
| 237 | `/map/nosmoke/` | `map/nosmoke/index.mdx` | `no-drinking` | `gas-smoke-gray` | `no-drinking` семантически про алкоголь; канонический `gas-smoke-gray` прямо предназначен для дыма и некурящих мест. |
| 238 | `/map/prevodioci/` | `map/prevodioci/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 239 | `/map/ruska_ambasada/` | `map/ruska_ambasada/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 240 | `/map/ruskadusa/` | `map/ruskadusa/index.mdx` | `kafana` | `kafana` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 241 | `/map/smallrf/` | `map/smallrf/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 242 | `/map/sud/` | `map/sud/index.mdx` | `judge-court` | `judge-court` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 243 | `/map/upravazastrance/` | `map/upravazastrance/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 244 | `/med/` | `med/index.mdx` | `id` | `doctor` | Корневой медицинский раздел; `doctor` точнее идентификационного `id`. |
| 245 | `/med/blood-donation/` | `med/blood-donation/index.mdx` | `id` | `doctor` | Донорство крови — медицинская тема; `doctor` точнее `id`. |
| 246 | `/med/dms/` | `med/dms/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 247 | `/med/dms/ddor/` | `med/dms/ddor/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 248 | `/med/dms/dunav/` | `med/dms/dunav/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 249 | `/med/dms/triglav/` | `med/dms/triglav/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 250 | `/med/dms/uniqa/` | `med/dms/uniqa/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 251 | `/med/dms/wiener/` | `med/dms/wiener/index.mdx` | `payment-card` | `payment-card` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 252 | `/med/doctors/` | `med/doctors/index.mdx` | `doctor` | `doctor` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 253 | `/med/doctors/phrases/` | `med/doctors/phrases/index.mdx` | `doctor` | `doctor` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 254 | `/med/familiar-medicines/` | `med/familiar-medicines/index.mdx` | `doctor` | `doctor` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 255 | `/med/medications/` | `med/medications/index.mdx` | `doctor` | `doctor` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 256 | `/med/oms/` | `med/oms/index.mdx` | `id` | `id` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 257 | `/move/` | `move/index.mdx` | `map` | `map` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 258 | `/move/army/` | `move/army/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 259 | `/move/exchange/` | `move/exchange/index.mdx` | `payment-card` | `exchange` | `exchange` прямо обозначает обмен валюты и обменные пункты; точнее общего `payment-card`. |
| 260 | `/move/finance/` | `move/finance/index.mdx` | `atm-fee` | `atm-fee` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 261 | `/move/housing/` | `move/housing/index.mdx` | `small-font-contract` | `small-font-contract` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 262 | `/move/housing/electricity/` | `move/housing/electricity/index.mdx` | `fallback: giant-book.svg` | `uplatnica` | Электричество в жилье связано с коммунальными начислениями и оплатой; `uplatnica` точнее generic fallback. |
| 263 | `/move/housing/handover/` | `move/housing/handover/index.mdx` | `fallback: giant-book.svg` | `house-keys` | Приём-передача жилья и ключей; `house-keys` — прямой сюжет. |
| 264 | `/move/housing/quiet-hours/` | `move/housing/quiet-hours/index.mdx` | `fallback: giant-book.svg` | `fallback: giant-book.svg` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 265 | `/move/housing/utilities/` | `move/housing/utilities/index.mdx` | `fallback: giant-book.svg` | `uplatnica` | Коммунальные услуги и счета; `uplatnica` точнее generic fallback. |
| 266 | `/move/legal/` | `move/legal/index.mdx` | `paperwork` | `paperwork` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 267 | `/move/myths/` | `move/myths/index.mdx` | `map` | `internet-research` | Разбор мифов — проверка утверждений и источников; `internet-research` точнее общей карты. |
| 268 | `/move/pdd/` | `move/pdd/index.mdx` | `auto` | `auto` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 269 | `/move/pets/` | `move/pets/index.mdx` | `pets` | `pets` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 270 | `/move/prepare/` | `move/prepare/index.mdx` | `move-stuff` | `move-stuff` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 271 | `/move/risks/` | `move/risks/index.mdx` | `internet-research` | `internet-research` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 272 | `/move/travel/` | `move/travel/index.mdx` | `plane` | `plane` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 273 | `/move/travel/turkey/` | `move/travel/turkey/index.mdx` | `plane` | `plane` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 274 | `/move/visa/` | `move/visa/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 275 | `/move/visa/other-countries/` | `move/visa/other-countries/index.mdx` | `passport` | `passport` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 276 | `/ru/` | `ru/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 277 | `/sources/` | `sources/index.mdx` | `fallback: giant-book.svg` | `internet-research` | Страница источников и проверки информации; `internet-research` — прямой канонический сюжет. |
| 278 | `/sr/` | `sr/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 279 | `/sr/about/` | `sr/about/index.mdx` | `logo` | `logo` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 280 | `/sr/about/advertising/` | `sr/about/advertising/index.mdx` | `fallback: giant-book.svg` | `logo` | Сербская версия страницы о рекламе RSLive; `logo` логично связывает её с проектом. |
| 281 | `/sr/about/privacy/` | `sr/about/privacy/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 282 | `/sr/about/stickers/` | `sr/about/stickers/index.mdx` | `petar` | `petar` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 283 | `/sr/prase-petar/` | `sr/prase-petar/index.mdx` | `petar` | `petar` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 284 | `/sr/prijava-boravista-stranca/` | `sr/prijava-boravista-stranca/index.mdx` | `smartphone` | `smartphone` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 285 | `/sr/provera-stana-pre-najma/` | `sr/provera-stana-pre-najma/index.mdx` | `small-font-contract` | `small-font-contract` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 286 | `/sr/rusi-u-srbiji/` | `sr/rusi-u-srbiji/index.mdx` | `party` | `russian-flag` | Энциклопедический раздел о русских в Сербии; `russian-flag` точнее `party`, который означает вечеринку. |
| 287 | `/sr/rusi-u-srbiji/demografija/` | `sr/rusi-u-srbiji/demografija/index.mdx` | `internet-research` | `internet-research` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 288 | `/sr/rusi-u-srbiji/ksors/` | `sr/rusi-u-srbiji/ksors/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 289 | `/sr/rusi-u-srbiji/nacionalni-savet/` | `sr/rusi-u-srbiji/nacionalni-savet/index.mdx` | `letter-list` | `letter-list` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 290 | `/sr/rusi-u-srbiji/ruski-dom/` | `sr/rusi-u-srbiji/ruski-dom/index.mdx` | `solid-house` | `solid-house` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 291 | `/sr/user/petro/` | `sr/user/petro/index.mdx` | `giant-book` | `giant-book` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |
| 292 | `/uplatnica/` | `uplatnica/index.mdx` | `uplatnica` | `uplatnica` | Предлагается оставить: отдельного основания для замены по теме страницы и канонической семантике не найдено. |

## Как комментировать

Оставляйте комментарий к конкретной строке: какой стикер выбрать вместо предложенного или почему текущий лучше. После согласования изменения `ogSticker` будут сделаны отдельным проходом.

## Ограничения

- Инвентарь MD/MDX и текущие значения `ogSticker` собраны автоматически из snapshot выше.
- Engine-owned маршруты без MDX помечены отдельно: этот файл не приписывает им выдуманный frontmatter.
- Семантика предложений сверяется с каноническим `astro/config/sticker-semantics.mjs` в `Antiokh/rslive.ru`.
