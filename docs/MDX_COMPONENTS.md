# MDX-компоненты RSLive

Этот файл описывает компоненты, доступные в статьях `src/content/docs/**/*.mdx` без локальных импортов.

## Источник истины

Перед использованием или изменением компонента проверяйте актуальную ветку `main` репозитория `Antiokh/rslive.ru`:

- список автоимпортов: `astro/astro.config.mjs`;
- исходники кастомных компонентов: `astro/src/components/`;
- реестр кастомизаций: `astro/CUSTOMIZATION_INVENTORY.md`;
- общие рабочие решения: `astro/README.md`.

При расхождении этого файла с кодом приоритет имеет текущий код компонента.

## Автоимпорт

Текущий список Starlight-компонентов:

```text
Aside
Badge
Card
CardGrid
FileTree
Icon
LinkButton
LinkCard
Steps
Tabs
TabItem
```

Текущий список RSLive-компонентов:

```text
Accordion
AccordionItem
ContentInclude
Countdown
DiasporaChart
EmbedFrame
MapEmbed
MermaidGraph
SanityTable
SmartTable
Spoiler
StructTable
SupabaseTable
UplatnicaGenerator
YouTube
```

Не добавляйте локальные `import` для этих компонентов в обычную статью.

## Aside

Используйте для семантического примечания, совета или предупреждения.

```mdx
<Aside type="note" title="Обратите внимание">
  Нейтральное пояснение.
</Aside>

<Aside type="tip" title="Практический совет">
  Полезное действие, которое упрощает процедуру.
</Aside>

<Aside type="caution" title="Проверьте перед подачей">
  Условие может различаться по основанию или учреждению.
</Aside>

<Aside type="danger" title="Не делайте этого">
  Действие может привести к утрате срока или статуса.
</Aside>
```

Правила:

- Используйте `note`, `tip`, `caution` или `danger`.
- Не используйте `Aside` как декоративную рамку для обычного текста.
- Для юридического ограничения чаще подходит `caution`, для непосредственного серьёзного риска — `danger`.
- Неподдерживаемые типы `primary`, `success`, `warning`, `info`, `question` не переносите механически: выберите ближайший поддерживаемый смысл.

## Steps

Используйте только для последовательных действий, где порядок имеет значение.

```mdx
<Steps>
1. Подготовьте документы.
2. Запишитесь на приём.
3. Подайте заявление.
4. Сохраните подтверждение подачи.
</Steps>
```

Не используйте `Steps` для перечня равноправных вариантов или обычного списка документов.

## Accordion и AccordionItem

Исходники:

- `astro/src/components/Accordion.astro`;
- `astro/src/components/AccordionItem.astro`.

Props:

```text
Accordion:
  title?: string

AccordionItem:
  title: string
  open?: boolean = false
```

Пример:

```mdx
<Accordion title="Частые вопросы">
  <AccordionItem title="Нужна ли предварительная запись?" open>
    Проверьте правила конкретного учреждения перед визитом.
  </AccordionItem>

  <AccordionItem title="Можно ли подать документы через представителя?">
    Возможность зависит от процедуры и доверенности.
  </AccordionItem>
</Accordion>
```

Правила:

- Используйте `Accordion` для группы связанных вопросов или блоков.
- Каждый `AccordionItem` обязан иметь `title`.
- `open` — логический prop без строки: пишите `open`, а не `open="true"`.
- Не помещайте в аккордеон ключевое условие, без которого читатель может выполнить процедуру неправильно. Критическое условие должно быть видно без раскрытия.

## Spoiler

Исходник: `astro/src/components/Spoiler.astro`.

Props:

```text
title?: string = "Показать"
open?: boolean = false
```

```mdx
<Spoiler title="Показать пример заполнения">
  Дополнительный пример, который не обязателен для понимания основной процедуры.
</Spoiler>
```

Используйте для одного необязательного скрываемого блока. Для нескольких связанных блоков используйте `Accordion`.

## UplatnicaGenerator

Исходник: `astro/src/components/UplatnicaGenerator.astro`.

Этот компонент обязателен для интерактивной платёжной квитанции. Не заменяйте его изображением, Markdown-таблицей или вручную нарисованным HTML.

Props:

```text
payer?: string
address?: string
subject?: string
recipient?: string
code?: string = "153"
sum?: string | number = "0.00"
account?: string
model?: string
target?: string
```

`address` сохранён как совместимый запасной источник значения плательщика. Для новых вызовов используйте `payer`.

Ниже показан реалистичный пример заполнения, чтобы были понятны формат суммы, счёта, модели и назначения платежа. Это **не актуальная платёжная инструкция**: перед публикацией статьи замените все значения реквизитами конкретной процедуры и укажите дату их проверки.

```mdx
<UplatnicaGenerator
  payer="Имя Фамилия, адрес"
  subject="Републичка административна такса"
  recipient={`Министарство унутрашњих послова Републике Србије
Булевар Михајла Пупина 2`}
  code="153"
  sum="11745.00"
  account="840-1848-16"
  model="97"
  target="индивидуални позив на број"
/>
```

Правила:

- Сохраняйте точные официальные значения полей и их сербское написание.
- Для многострочного `recipient` используйте template literal `{` + `` `...` `` + `}` либо проверенный многострочный JSX-атрибут.
- Не удаляйте дефисы и форматирование счёта из отображаемого `account` без причины.
- Проверяйте `code`, `model`, `target`, сумму и счёт по актуальному официальному платёжному поручению.
- Не придумывайте контрольный номер. Если он индивидуален, прямо укажите это в окружающем тексте или поле.
- Не подставляйте в исходный MDX реальные данные плательщика: `payer` отображается как редактируемое поле и может заполняться пользователем на странице.
- Текущая реализация получает изображение QR-кода через внешний сервис `api.qrserver.com` и передаёт платёжный payload в URL запроса. Перед размещением чувствительных данных оцените допустимость такой передачи; локальная генерация QR требует изменения компонента в `Antiokh/rslive.ru`.
- Не добавляйте отдельный внешний QR без необходимости.

## ContentInclude

Исходник: `astro/src/components/ContentInclude.astro`.

Props:

```text
page: string
section?: string
noHeader?: boolean = false
label?: string
```

```mdx
<ContentInclude page="move:visa" section="безвизовое-пребывание" noHeader />
```

Правила:

- `page` использует двоеточие как разделитель пути: `move:visa` → `src/content/docs/move/visa/index.mdx`.
- Перед использованием проверьте существование исходной страницы.
- `section` должен соответствовать реально распознаваемому заголовку исходной страницы. Проверяйте конкретный заголовок, а не придумывайте slug по аналогии.
- Используйте включение, когда один фрагмент должен иметь единый источник истины.
- Не создавайте циклические включения.
- Если включённый фрагмент содержит сноски, проверьте итоговый HTML и уникальность идентификаторов.
- Компонент читает исходный файл и отдельно обрабатывает выбранный фрагмент Markdown. Не полагайтесь без сборки на автоимпорты и MDX/JSX-компоненты, находящиеся внутри включаемого фрагмента.
- Для юридически критичного текста проверяйте собранную страницу, а не только исходный MDX.

## Countdown

Исходник: `astro/src/components/Countdown.astro`.

Props:

```text
date?: string
month?: number | string
day?: number | string
annual?: boolean = false
label?: string = "осталось ##DATE##"
doneLabel?: string = "дата наступила"
```

Фиксированная дата:

```mdx
<Countdown date="2027-03-14" label="до события ##DATE##" />
```

Ежегодная дата:

```mdx
<Countdown date="04-30" annual label="до ежегодного срока ##DATE##" />
```

`##DATE##` заменяется рассчитанным количеством дней или сообщением о наступившей дате.

Не используйте `Countdown` как подтверждение юридического срока без текста с точной датой и источником.

## EmbedFrame

Исходник: `astro/src/components/EmbedFrame.astro`.

Props:

```text
src: string
title?: string = "Встроенный материал"
aspect?: string = "16 / 9"
height?: string
caption?: string
allow?: string
```

```mdx
<EmbedFrame
  src="https://example.com/embed"
  title="Интерактивная схема"
  caption="Откройте отдельно, если встроенная версия не загружается."
  aspect="16 / 9"
/>
```

- Всегда задавайте осмысленный `title`.
- Не встраивайте произвольные или ненадёжные страницы.
- Для карт используйте `MapEmbed`, для YouTube — `YouTube`.

## MapEmbed

Исходник: `astro/src/components/MapEmbed.astro`.

Props:

```text
src: string
title?: string = "Карта"
caption?: string
aspect?: string = "16 / 10"
height?: string
```

```mdx
<MapEmbed
  src="https://www.google.com/maps/d/embed?mid=..."
  title="Подразделения МВД"
  caption="Проверьте адрес и часы работы перед визитом."
/>
```

Карта должна дополнять текстовый адрес, а не заменять его.

## YouTube

Исходник: `astro/src/components/YouTube.astro`.

Props:

```text
id?: string
src?: string
title?: string = "YouTube video"
size?: "small" | "default" | "full" = "default"
start?: number | string
privacy?: boolean = true
caption?: string
```

```mdx
<YouTube
  id="NHkCfZjIEV4"
  title="Название видео"
  size="default"
  start={90}
  caption="Фрагмент начинается с нужного раздела."
/>
```

Можно передать ID или поддерживаемый YouTube URL. По умолчанию используется privacy-enhanced домен.

## MermaidGraph

Исходник: `astro/src/components/MermaidGraph.astro`.

Prop:

```text
code: string
```

```mdx
<MermaidGraph code={`flowchart TD
  A[Подготовить документы] --> B[Подать заявление]
  B --> C[Получить решение]`} />
```

Не вставляйте непроверенный Mermaid-код. Компонент использует `securityLevel: strict`.

## DiasporaChart

Исходник: `astro/src/components/DiasporaChart.astro`.

Текущая реализация не принимает props и содержит встроенный набор миграционной статистики.

```mdx
<DiasporaChart />
```

Не используйте компонент как универсальный график. Данные и годы зашиты в исходник компонента, поэтому страница с графиком должна отдельно указывать источник и дату проверки. Для другого или обновлённого набора данных измените реализацию в `Antiokh/rslive.ru` и синхронно обновите документацию.

## SmartTable

Исходник: `astro/src/components/SmartTable.astro`.

Обязательные props:

```text
id: string
columns: Column[]
```

Дополнительные props:

```text
title?: string
rows?: Record<string, string | number>[] = []
src?: string
note?: string
pageSize?: number = 50
showTitle?: boolean = true
stretchColumn?: string
loadingLabel?: string
emptyLabel?: string
```

Column:

```text
key: string
label: string
numeric?: boolean
stretch?: boolean
link?: boolean
hrefKey?: string
icon?: "telegram" | "whatsapp" | "website" | "facebook" | "email" | "link"
iconOnly?: boolean
longText?: boolean
```

```mdx
<SmartTable
  id="branches-demo"
  title="Подразделения"
  stretchColumn="address"
  pageSize={25}
  columns={[
    { key: 'name', label: 'Название' },
    { key: 'address', label: 'Адрес', stretch: true },
    { key: 'city', label: 'Город' },
    { key: 'queue', label: 'Очередь', numeric: true },
    { key: 'website', label: 'Сайт', icon: 'website', iconOnly: true },
  ]}
  rows={[
    {
      name: 'GTC',
      address: 'Bulevar Zorana Đinđića 64a',
      city: 'Beograd',
      queue: 18,
      website: 'https://example.com',
    },
  ]}
/>
```

Правила:

- `id` должен быть уникальным на странице.
- Для URL используйте `link`, `hrefKey` или поддерживаемую `icon`-колонку.
- Не вставляйте HTML в значения строк: компонент экранирует содержимое.
- Для длинного текста используйте `longText`.
- Для внешнего JSON/API можно использовать `src`, но сначала проверьте формат ответа по исходнику компонента и доступность endpoint из браузера.

## SupabaseTable

Исходник: `astro/src/components/SupabaseTable.astro`.

Props:

```text
table: string
title?: string
select?: string = "*"
limit?: number = 100
pageSize?: number = 50
showTitle?: boolean = true
order?: string
ascending?: boolean = true
columns?: Column[]
stretchColumn?: string
```

```mdx
<SupabaseTable
  table="data_banks_raiffeisen"
  title="Отделения Raiffeisen"
  select="id,name,address,city"
  order="name"
  limit={200}
  pageSize={25}
  stretchColumn="address"
/>
```

Используйте только существующую таблицу и проверенную публичную схему. Не раскрывайте приватные поля через `select="*"`, если таблица содержит служебные данные.

## StructTable

Исходник: `astro/src/components/StructTable.astro`.

Props:

```text
schema: string
title?: string
showTitle?: boolean = false
table?: string
select?: string
limit?: number
pageSize?: number
order?: string
ascending?: boolean
columns?: Column[]
stretchColumn?: string
```

```mdx
<StructTable schema="banks_raiffeisen" pageSize={25} />
```

Компонент содержит реестр известных схем и их колонок. Перед использованием проверьте, что `schema` существует в текущем исходнике. Не придумывайте имя схемы по аналогии и не полагайтесь на автоматический fallback `data_<schema>` без проверки таблицы.

## SanityTable

Исходник: `astro/src/components/SanityTable.astro`.

Props:

```text
tableId: string
title?: string
limit?: number = 100
pageSize?: number = 50
projectId?: string
dataset?: string
apiVersion?: string
perspective?: string
stretchColumn?: string
```

```mdx
<SanityTable
  tableId="banks_raiffeisen"
  title="Список подразделений Raiffeisen"
  limit={100}
  pageSize={25}
/>
```

Используйте только существующий `tableId`. Не переносите данные из Sanity вручную в статью, если таблица должна оставаться управляемой.

## Card, CardGrid, Badge, FileTree, Icon, LinkButton, LinkCard, Tabs, TabItem

Эти Starlight-компоненты автоимпортируются, но их подробные props не дублируются здесь, чтобы документация не расходилась с установленной версией Starlight.

Перед использованием редкого компонента:

1. проверьте его существующее применение в `Antiokh/rslive.ru`;
2. проверьте установленную версию Starlight и текущую сигнатуру;
3. используйте компонент только при реальной пользе для читателя;
4. не заменяйте обычный заголовок, список или ссылку декоративным компонентом без необходимости.

## Добавление нового компонента

Новый компонент считается доступным для статей только после того, как в `Antiokh/rslive.ru`:

1. добавлен исходник в `astro/src/components/`;
2. компонент включён в `localMdxComponents` в `astro/astro.config.mjs` либо предусмотрен явный импорт;
3. обновлён `astro/CUSTOMIZATION_INVENTORY.md`;
4. выполнена сборка;
5. обновлён этот файл.

Не используйте предполагаемый компонент в контенте заранее.
