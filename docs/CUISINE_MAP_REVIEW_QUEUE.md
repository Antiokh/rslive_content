# Очередь проверки ресторанов Белграда

Последний проход: 2026-11-27 (Europe/Belgrade), получены два независимых отчёта по 19 исходным кандидатам (DeepSeek и второй аудит с прямыми ссылками). Второй аудит дал один новый перспективный бренд Rispetto и обновление источника Sushi Boks ADA; новых маркеров нет. Новых подтверждённых точек нет; отчёт не содержит прямых URL большинства заявленных источников. Ниже выводы отчёта отделены от собственной перепроверки. Для следующего прохода требуется новое первичное свидетельство, а не ещё один пересказ каталогов. Не публикуется на сайте; рабочие данные для агентов и редакторов. Регламент: [CUISINE_MAP_MAINTENANCE.md](CUISINE_MAP_MAINTENANCE.md). История: [Issue #462](https://github.com/Antiokh/rslive_content/issues/462), [полный архив](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

## Задание независимому ИИ — 19 исходных кандидатов (история двух аудитов)

Проведи независимый поиск по каждой строке. Цель: установить, действует ли **конкретная физическая точка** сейчас, её точный адрес, специализацию, координаты и источники. Не полагайся на предварительный вывод ниже. Ищи по сербской латинице/кириллице, английскому, русскому, телефону, адресу, социальным сетям, картам, меню, отзывам, сайтам владельца и ТЦ. Используй источники с датой реального события, а не только датой индексации. Отдельно проверь переименования, соседние помещения, филиалы и доставку. Не выдавай старые карточки за подтверждение работы. Не публикуй изменения в GitHub; верни результаты редактору.

Для каждой строки верни: название; статус (действует / временно закрыт / окончательно закрыт / вероятно закрыт / не установлено / исключить по кухне / иной бренд); точный адрес и телефон; кухня; зал/самовывоз/только доставка; широта, долгота и URL исходной геометки (если подтверждены); 2–3 прямых ссылки, даты публикаций/отзывов и что именно они доказывают; противоречия; уверенность и решение для карты. Если нового доказательства нет, так и напиши. Не выдумывай координаты или звонки. Проверь совпадение с действующими маркерами в GeoJSON.

### 1. A la Grekos

[PlanPlus](https://www.planplus.rs/restoran-a-la-grekos/90091) сохраняет Svetotrojčina 22; исторический Geppetto по тому же адресу и телефону. Возврат при подтверждении текущего греческого ресторана. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [RestaurantGuru](https://ru.restaurantguru.com/A-la-Grekos-Belgrade) теперь показывает Villa Geppetto; [Geppetto Plus](https://geppetto-plus.ls.rs/rs/) совпадает по адресу и телефону. [Tripadvisor](https://www.tripadvisor.ru/Restaurant_Review-g294472-d15753542-Reviews-Geppetto_Restaurant-Belgrade.html) описывает гостевой дом. Проверить смену бренда и текущую кухню.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Отчёт предполагает смену бренда на Villa Geppetto. Совпадение телефона/адреса уже известно. [Карточка отеля](https://villa-da-vittorio.visitaserbia.com/en/) отдельно упоминает A la Grekos как соседний ресторан; это может быть устаревший шаблон, не доказательство работы или смены арендатора. Статус не установлен.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Booking https://www.booking.com/hotel/rs/vila-geppetto.sr.html и Google Hotels https://www.google.com/travel/hotels/entity/ChoIiaipqeST69yLARoNL2cvMTFneTU4Ym5yNRAB?gsas=1 подтверждают гостевой дом Svetotrojčina 22 и новый контакт +381658064738. Наличие/закрытие самостоятельного греческого ресторана не доказано; не добавлять.

### 2. Indijski restoran Arab

[NaVidiku](https://www.navidiku.rs/firme/restorani-u-beogradu/indian-arab-restaurant) и [PlanPlus](https://www.planplus.rs/en/indijski-arab-indian-restaurant/143828) сохраняют Brankova 19, но актуальной отдельной точки не доказано; не дублировать Indian Arab на Maršala Birjuzova. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [NaVidiku](https://www.navidiku.rs/firme/restorani-u-beogradu/indian-arab-restaurant) сохраняет ссылку на старый business.site, [PlanPlus](https://www.planplus.rs/beograd/indijski-restorani) повторяет телефон. Свежих независимых посещений именно Brankova 19 не найдено.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek приводит Glovo и координаты 44.81438,20.45919. [Glovo](https://glovoapp.com/sr/rs/belgrade/stores/indian-arab-restaurant-beg) не устанавливает Brankova 19; [Wolt](https://wolt.com/en/srb/belgrade/restaurant/indian-arab-restaurant) даёт Maršala Birjuzova 2–4, [OSM через Mapcarta](https://mapcarta.com/N12309485965) — те же координаты, которые привёл DeepSeek, примерно в 8 м от существующего `indian-arab-marsala-birjuzova` (44.814312,20.459231). [CompanyWall](https://www.companywall.rs/firma/indian-arab-restaurant/MMx59WnHC) подтверждает Maršala Birjuzova 2. Не использовать эти сведения для Brankova 19, не дублировать; связь старого адреса с нынешним не доказана.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Новый отчёт подтверждает историческую карточку Brankova 19, но не отдельную действующую точку. Сохраняется прежнее решение, не дублировать Maršala Birjuzova.

### 3. Cucina d'autore Pescatore

[PlanPlus](https://www.planplus.rs/cucina-d-autore-pescatore/90118) имеет отзыв о другом городе; историческая точка Ilije Garašanina 23 не подтверждена. Нужны актуальное меню и работа. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/cucina-d-autore-pescatore/90118): единственный отзыв описывает Врбас. [Pronađi u Srbiji](https://pronadjiusrbiji.rs/listing/restoran-morske-ribe-i-plodova-pescatore/) подтверждает исторические телефоны 0659872701/0113249128, средиземноморское меню, не текущую работу.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Подтверждения текущей работы не найдено; повторены PlanPlus и исторический профиль. Без нового доказательства статус не меняется.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Новый аудит независимо подтверждает, что отзыв PlanPlus описывает Врбас, а не Белград. Исторические телефоны +381113249128 / +381659872701; новых доказательств работы нет.

### 4. Pasta Caffe Lupo

[NaVidiku](https://www.navidiku.rs/firme/pasta-barovi-beograd/pasta-caffe-lupo) сохраняет историческое меню; [Wolt Pobednik](https://wolt.com/sr/srb/belgrade/restaurant/pobednik-rotilj) по тому же адресу. Нужен факт текущей работы Lupo либо доказанная смена арендатора. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [NaVidiku](https://www.navidiku.rs/firme/pasta-barovi-beograd/pasta-caffe-lupo) сохраняет часы; [CompanyWall THEWOLF](https://www.companywall.rs/firma/aleksandra-trailovic-pr-thewolf/MMxArwxuR) и [THEWOLFBGD](https://www.companywall.rs/firma/thewolfbgd/MMx9t25zC) показывают регистрации ресторанного бизнеса с 2023 по тому же адресу. Проверить идентичность помещения, не приравнивать регистрацию к работе.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Отчёт предполагает закрытие/замену Lupo по соседним карточкам Wolf/Pobednik и упоминает отзывы Foursquare 2016–2018 без прямой ссылки. [Уличный каталог](https://www.planplus.rs/zvezdara/ulica/kraljice-marije/402) содержит несколько карточек по одному номеру; замена конкретного помещения не доказана. Приоритет проверки арендатора; не добавлять.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Дополнительное историческое меню https://hranadostana.com/dostava-hrane/beograd/palilula-palilulska-pijaca/395 и регистрация THEWOLFBGD по адресу не доказывают замену помещения; перевод Lupo = Wolf не доказывает переименование. Статус не установлен.

### 5. Piccolo Mediteraneo Cuicine

[Blic, 2012](https://www.blic.rs/zabava/italija-u-trznom-centru-piccolo/kj951y4) подтверждает историческую точку в Zira. Возврат при подтверждении текущего арендатора/работы. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: Новых независимых источников работы не найдено. Проверить текущий каталог арендаторов Zira, этаж и название.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek утверждает, что Tripadvisor пометил именно ресторан CLOSED, без прямой ссылки. При независимой проверке найден [Tripadvisor ТЦ Zira](https://www.tripadvisor.com/Attraction_Review-g294472-d7237693-Reviews-Zira_Shopping_Center-Belgrade.html) со статусом reported permanently closed, не карточка ресторана. [Обзор ТЦ](https://www.danubeogradu.rs/shopping/zira-shopping-center/) с Piccolo опубликован в 2013, а не в 2024. Закрытие самого ресторана не подтверждено, дополнительный сигнал для проверки закрытия; не публиковать.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Новый отчёт указывает https://www.livetheworld.com/activities/serbia/zira-belgrade (дата 27.05.2024), но описание воспроизводит старый обзор, не доказывает работу. Закрытая карточка ТЦ не равна закрытию Piccolo. Нужен текущий арендатор.

### 6. Aperto

[Исторический сайт](https://aperto.batajnica.org/) и [регистрация](https://www.companywall.rs/firma/dejan-majstorovic-pr-aperto-home/MMx3idfq0) совпадают по телефону, но не доказывают текущую работу. Нужны текущий адрес и меню. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Aperto Batajnica](https://aperto.ls.rs/rs/kontakt.html) указывает ещё один телефон 0118488996, отличающийся от старого сайта. [История адреса](https://www.istorijaadresa.com/sr/stevana-dubaji%C4%87a-5-beograd-11273-serbia) содержит записи до 2026. Проверить идентичность двух Aperto и текущий зал, регистрацию не считать подтверждением.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Новых доказательств работы не найдено. Транспортные страницы не подходят для определения координат ресторана.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Перевести в список проверки закрытия: https://www.istorijaadresa.com/sr/stevana-dubaji%C4%87a-5-beograd-11273-serbia прямо указывает закрытие Aperto Druga Kuća в 2025, но сохраняет отдельную историческую карточку Aperto Batajnica. Rispetto — новый кандидат, отдельная идентичность не доказана. Не переносить геометку; см. приоритетный кандидат ниже.

### 7. Barinello

[PlanPlus](https://www.planplus.rs/cukarica/italijanski-restorani) Ratka Mitrovića 54; нет независимой актуальной карточки. Возврат при новом подтверждении. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/en/cukarica/italian-cuisine-restaurants) даёт 0637301311, 0 отзывов. Нужна независимая проверка телефона/работы.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek не нашёл отдельную страницу, но исходная карточка PlanPlus остаётся в районном каталоге. Отсутствие результата поиска не доказывает, что ресторан никогда не существовал. Статус не установлен.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Новых доказательств нет. Телефон +381637301311 — исторический, не подтверждён звонком.

### 8. Cinecitta

[PlanPlus](https://www.planplus.rs/restoran-cinecitta/11831) сохраняет Kneza Višeslava 88; другие рестораны в комплексе не доказывают замену конкретного помещения. Нужен актуальный факт работы/прекращения. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: **Вероятно закрыт, перенесён в список проверки закрытия.** [История адреса](https://www.istorijaadresa.com/sr/kneza-vi%C5%A1eslava-88-beograd-11090-serbia) прямо сообщает закрытие Cineccita в 2024; [PlanPlus](https://www.planplus.rs/restoran-cinecitta/11831) сохраняет историческую карточку; [Filmski Grad](https://nadjisalu.rs/sala/restoran-filmski-grad-cukarica/) содержит отзывы 2026 по тому же большому комплексу. Нужен независимый факт закрытия/возобновления.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Новых доказательств открытия не найдено; остаётся в списке вероятно закрытых.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Независимый аудит согласен с вероятным закрытием; новых доказательств открытия/окончательного закрытия нет.

### 9. Grazia

[Portal Srbija](https://www.portal-srbija.com/picerije-banovo-brdo) и [NaVidiku](https://www.navidiku.rs/firme/picerije-beograd/picerija-grazia) исторические сведения; разночтение Žarkovačka 60/60a. Нужны работа и адрес. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Туристический каталог](https://turistickiklub.com/objekat/grazia) содержит один недатированный отзыв и пустое расписание, совпадающий телефон 0112541697. [PlanPlus](https://www.planplus.rs/beograd/ulica/zarkovacka/14501) подтверждает старую карточку. Не доказана работа.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek указывает закрытый Up Restoran Bar на Žarkovačka 60a (прямая ссылка отсутствует). Не переносить статус на Grazia; проверить конкретное помещение и вход.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Дополнительный каталог https://www.nadjirestoran.com/grazia-restoran-620 подтверждает исторические адрес и телефон, не текущую работу. Нужна проверка 60/60a.

### 10. Italiano dassa

[PlanPlus](https://www.planplus.rs/restoran-italiano-dassa/135484) сохраняет Makedonska 11, [Wolt Yalla Yalla](https://wolt.com/sr/srb/belgrade/restaurant/yalla-yalla1234) — другая точка по тому же номеру. Нужна идентификация помещения. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/beograd/ulica/makedonska/6712) сохраняет несколько ресторанов по №11, в том числе Ma'ida и Yalla Yalla. Нужен текущий арендатор конкретного помещения.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek упоминает объявление 4zida 2026 без прямой ссылки. Ориентиры объявлений могут происходить из старых каталогов. Не считать доказательством работы.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Исторические карточки Ma’ida и Italiano по №11 не доказывают идентичность помещения. В отчёте прямое открытие Wolt Yalla Yalla не удалось. Статус не установлен.

### 11. Špageterija

[The Guide](https://theguide.tab.travel/zvmay/spageterija-dedinje/) подтверждает исторический Dedinje, но нет свежего подтверждения работы филиалов; Bulevar 144 закрыт по прежней проверке. Нужна конкретная активная точка. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Dedinje](https://www.planplus.rs/restoran-spageterija/101989), [Zemun](https://www.planplus.rs/restoran-spageterija/117677) — раздельные карточки; [Luigi](https://www.luigi.rs/) подтверждает действующий другой бренд по Bulevar kralja Aleksandra 144. Проверить каждый филиал отдельно.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Dedinje и Zemun остаются неустановленными, исторический Bulevar 144 не переносить на них. Отсутствие поисковой выдачи не подтверждает закрытие.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Перенести исходную строку в список проверки закрытия с раздельными адресами: Dedinje — [Яндекс](https://yandex.com/maps/org/130919850075/) в поисковом снимке явно Shut down на Mladena Stojanovića 2, PlanPlus 2B и другой телефон, поэтому вероятное закрытие, не окончательное. Zemun — отчёт сообщает закрытие одной записи в 2021, но [история адреса](https://www.istorijaadresa.com/sr/glavna-13-beograd-11080-serbia) при открытии недоступна, поисковые снимки также указывают открытие в 2021 и не устанавливают закрытие именно Špageterija; сохранять неустановленный статус. Bulevar 144 — Luigi уже нанесён. Не смешивать филиалы.

### 12. Sushi Hero

[PlanPlus](https://www.planplus.rs/restoran-sushi-hero/121540) историческая карточка Ada Mall; [официальный каталог ТЦ](https://www.adamall.com/en/brendovi/susi-boks/) подтверждает Sushi Box, не Hero. Нужна идентичность или отдельная действующая точка. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/restoran-sushi-hero/121540): 0 отзывов. [Sushi Boks](https://sushiboks.rs/services/) прямо подтверждает работу своего ресторана в Ada Mall; нет доказательства, что Hero и Boks — один бизнес. Проверить текущих арендаторов/переименование.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek предполагает замену Sushi Hero на Sushi Boks. Историческое наличие Hero подтверждено [Elevate 2019](https://online.flippingbook.com/view/863170264/99/), Boks уже на карте (`sushiboks-ada`). Один ТЦ и одинаковая кухня не доказывают преемственность. Не добавлять Hero и не дублировать Boks.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Независимый аудит подтвердил текущий Sushi Boks ADA, но не связь с Sushi Hero. Официальные https://sushiboks.rs/about-us/ и https://www.adamall.com/brendovi/susi-boks/; Wolt https://wolt.com/en/srb/belgrade/restaurant/sui-boks подтверждает адрес Radnička 9. Wolt See map 44.787361,20.418494, около 82 м от старого pin; точность у входа не установлена, старую каноническую ссылку и геометку сохраняем. В PR #481 обновлены источник и RU/EN/SR существующего `sushiboks-ada`; новой точки нет. Sushi Hero остаётся неопределённым.

### 13. Sushi room

[Меню 25.08.2024](https://v8.kudanaklopu.com/novi-beograd/restorani/restoran-sushi-room/jelovnik) и [PlanPlus](https://www.planplus.rs/restoran-sushi-room/133530) расходятся по телефону; актуальная работа Uroša Martinovića 6 не доказана. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Kuda na klopu](https://v8.kudanaklopu.com/novi-beograd/restorani/restoran-sushi-room/jelovnik): меню 25.08.2024, [история адреса](https://www.istorijaadresa.com/sr/uro%C5%A1a-martinovi%C4%87a-6-novi-beograd-11070-serbia) — присутствие с 2021, но не работа сейчас. Нужна актуальная карточка или прямой контакт.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek называет PriceListo декабрём 2025 и подтверждением доставки. [PriceListo](https://rs.pricelisto.com/menu-prices/sushi-room-rs) — агрегатор меню; [Mirandre](https://www.mirandre.com/sushi-restoran/novi-beograd) подтверждает альтернативный телефон и сайт, не свежую работу. Дата меню не доказывает выполненный заказ.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Новых доказательств актуальной работы нет; подтверждены старые телефоны и меню 25.08.2024.

### 14. Peace

[PlanPlus](https://www.planplus.rs/kineski-restoran-peace/143360) единственный содержательный источник; [Wolt Aman](https://wolt.com/sr/srb/belgrade/venue/aman-27-marta) по тому же адресу не доказывает смену помещения. Нужен независимый факт работы. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Stručnjaci](https://strucnjaci.rs/delatnost/restorani/beograd?page=358) повторяет адрес каталога, без доказательства работы. Проверить 0654346754 и конкретное помещение.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Нового независимого доказательства нет; PlanPlus остаётся статическим каталогом. Статус не установлен.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Новых доказательств работы/смены арендатора нет. Исторический телефон +381654346754.

### 15. Hanan Food

[Историческое открытие 2021](https://www.lifeinbelgrade.life/Horeca_Restorani_Hanan-Food) Dositejeva 1A; актуальные отзывы Hanan относятся к Svetogorska 2. Нужна идентичность/отдельный филиал. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Реестр компании](https://hanan-food.ls.rs/rs/) указывает Bulevar despota Stefana 115 и производство хлеба/выпечки, не ресторан Dositejeva 1A. Не переносить актуальные отзывы других Hanan.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek утверждает, что существует Wolt «Hanan food restoran» по Dositejeva 1a, но URL не приводит. Проверенный [Wolt Restoran Hanan](https://wolt.com/en/srb/belgrade/restaurant/restoran-hanan) содержит Svetogorska 2 и +381113345304, соответствует существующему `hanan`; [PlanPlus](https://www.planplus.rs/restoran-hanan-food/139561) сохраняет Dositejeva 1A. Отдельную карточку Wolt на Dositejeva не удалось обнаружить. Приоритет — получить точный URL или подтверждение отдельной кухни.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Подтверждены только исторические публикации и конкурирующий адрес Turkuaz. `turkuaz-restaurant` уже на карте; проверку его текущего статуса вести отдельно, не выводить закрытие из карточки Hanan Food.

### 16. Square Burgers and Tortillas

[PlanPlus](https://www.planplus.rs/restoran-square-burgers-and-tortillas/133577) сохраняет Nemanjina 3, актуальное меню и идентичность помещения не доказаны. Возврат при новом свидетельстве. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/restoran-square-burgers-and-tortillas/133577) сохраняет адрес, независимого текущего меню не найдено. Проверить нынешнего арендатора и происхождение бренда.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Не найдено новых источников. Отсутствие результата поиска не подтверждает закрытие; исходная карточка PlanPlus сохраняется.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): PlanPlus в английской версии относит Square к интернациональной кухне; наличие тортильи недостаточно. Нужна работа и специализация.

### 17. Shaurmagedon Shawarma Bar

[RestaurantGuru](https://restaurantguru.com/SHAURMAGEDON-Shawarma-Shaurma-Belgrade-2) Nušićeva 18, отзывы о посещении и закрытой двери; [PlanPlus](https://www.planplus.rs/shaurmagedon-shawarma-bar/154523) и Яндекс дают 16, [CompanyWall](https://www.companywall.rs/firma/shaurmagedon/MMxGr4vC0) — 18. Нужны подтверждение стабильной работы, входа и национальной категории. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [RestaurantGuru](https://restaurantguru.com/SHAURMAGEDON-Shawarma-Shaurma-Belgrade-2) содержит отзыв об удачном посещении и более поздний отзыв о закрытой двери при заявленных часах; [Feruvi](https://feruvi.rs/firme/beograd/brza-hrana?page=3) заявляет проверенный контакт и русскую кухню по №16; [CompanyWall](https://www.companywall.rs/firma/shaurmagedon/MMxGr4vC0) — №18; [Glovo](https://glovoapp.com/sr/rs/belgrade/stores/shaurmagedon-shawarma-beg) сохраняет карточку. Проверить точный вход, доступность заказа и специализацию; не считать относительные даты точными без даты снимка.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: DeepSeek повторяет конфликт №16/18 и указывает отзывы/Glovo без прямых ссылок. [Glovo](https://glovoapp.com/sr/rs/belgrade/stores/shaurmagedon-shawarma-beg) при открытии показывает Privremeno zatvoreno (доставка, не обязательно зал); [RestaurantGuru](https://restaurantguru.com/SHAURMAGEDON-Shawarma-Shaurma-Belgrade-2) и [PoštoPiće](https://postopice.rs/lokal/shaurmagedon-shawarma-saurma) — №18, [PlanPlus](https://www.planplus.rs/shaurmagedon-shawarma-bar/154523) — №16. Нужны подтверждение работы и входа; текущая доставка не доказана.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Отчёт уточняет конфликт телефонов +381621766326 / +381692676711 и адресов 16/18. Даты отзывов относительные, фактический приём заказа Glovo не подтверждён. Сохранять неустановленный статус.

### 18. URA! — Bulevar kralja Aleksandra

[Меню от 18.05.2026](https://v8.knk.rs/beograd/vracar/restorani/ura-russian-dumplings-1/Jelovnik) Bulevar 148, но [сайт](https://peljmeni.rs/en) перечисляет Kraljevića Marka 11, Wolt ранее закрыт всю неделю. Нужна текущая работа отдельного филиала. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [HappyCow](https://www.happycow.net/reviews/ura-russian-dumplings-belgrade-455295) сообщает закрытие в июле 2026 по №48, [Яндекс](https://yandex.com/maps/org/ura_russian_dumplings/193879051541/) также permanent closure №48, [Infostud](https://poslovi.infostud.com/poslodavac/ura-russian-dumplings/132736) подтверждает №48. [Старое меню](https://v8.knk.rs/beograd/vracar/restorani/ura-russian-dumplings-1/Jelovnik) даёт №148; не считать автоматически одним филиалом. Проверить ошибку номера, закрытие №48 и существование №148.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Новых доказательств открытия нет. DeepSeek повторяет конфликт №48/148; прежние HappyCow/Яндекс свидетельствуют о закрытии №48, не отменяются старым меню. Координаты №48 без URL не использовать; №148 остаётся неподтверждённым.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Перенести в список проверки закрытия. https://www.happycow.net/reviews/ura-russian-dumplings-belgrade-455295 и https://yandex.com/maps/org/ura_russian_dumplings/193879051541/ в поисковых снимках подтверждают CLOSED/permanently closed по №48; https://wolt.com/en/srb/belgrade/restaurant/ura/items/meso-4 подтверждает №48 и закрытую доставку в снимке; https://peljmeni.rs/en перечисляет только Kraljevića Marka 11. Дата отзыва 08.07.2026 не дата закрытия. №148 вероятно опечатка, самостоятельная точка не доказана. Не добавлять ни один адрес.

### 19. URA! — Kolubarska

[Яндекс](https://yandex.com/maps/org/ura_russian_cuisine/136739289129/) и [PlanPlus](https://www.planplus.rs/ura-ruska-hrana/148521) описывают доставку, [исторический профиль](https://poisk.rs/u/ura/) — доставку и самовывоз. Текущая работа доступного посетителям отдельного пункта не доказана; не дублировать Kraljevića Marka 11. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Яндекс](https://yandex.com/maps/org/ura_russian_cuisine/136739289129/) и [PlanPlus](https://www.planplus.rs/ura-ruska-hrana/148521) — доставка. Доказательств актуального публичного самовывоза нет. Проверить владельца и действующую точку.

Независимая проверка DeepSeek (27.11.2026), сверка редактора: Новых доказательств самовывоза/зала нет; координаты улицы не являются pin конкретной точки. Не добавлять.

Второй независимый аудит по 19 кандидатам (27.11.2026; передан редактором): Телефон +381621910079 принадлежит бренду, не доказывает работу отдельной точки Kolubarska. Нужен подтверждённый самовывоз/доставка по адресу.

## Список проверки закрытия — не наносить на карту

14 исходных записей в списке проверки закрытия: 11 прежних плюс Aperto, Špageterija (раздельные статусы филиалов) и URA! Bulevar. Статус вероятностный, не окончательный. 15 остальных исходных записей не установлены; 7 временно закрытых остаются вне публикации. Все 19 исходных разделов выше сохраняются как история, а не как активное задание повторять те же запросы.

- **Mali Pariz** — Отложен: признаки закрытия — [Wanderlog](https://wanderlog.com/place/details/1327759), [Яндекс](https://yandex.com/maps/org/mali_pariz/9413887982/) и [Kuda na klopu](https://kudanaklopu.com/beograd/restorani/restoran-mali-pariz-le-petit-paris) дают противоречивые статусы и адреса. Не доказано постоянное закрытие. Возврат при подтверждении работы/закрытия и адреса. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Swad** — Отложен: признаки закрытия — [RestaurantGuru](https://de.restaurantguru.com/Swad-Belgrade) сообщает о возможном постоянном закрытии, отзывы исторические; [PlanPlus](https://www.planplus.rs/en/swad-indian-restaurant/128512) сохраняет карточку Đušina 10. Возврат при подтверждении открытия или окончательного закрытия. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Don Vitorre** — Отложен: признаки закрытия — Прежние снимки [RestaurantGuru](https://ru.restaurantguru.com/Don-Vitorre-Belgrade) сообщали о закрытии; [PlanPlus](https://www.planplus.rs/pasta-bar-don-vitorre/128622) сохраняет Albanske spomenice 10, другие карточки по адресу не доказывают замену. Возврат по новому свидетельству. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Tricolore** — Отложен: признаки закрытия — Историческое сообщение о закрытии [Ana.rs](https://www.ana.rs/forum/index.php?topic=90657.5070) доступно по поисковому снимку; [Kuda na klopu](https://kudanaklopu.com/beograd/zemun/picerije/restoran-tricolore) закрыто, [CompanyWall](https://www.companywall.rs/firma/tricollore-ristorante-doo-beograd-zemun/MMzx5Iv0) не подтверждает актуальную деятельность. Возврат при подтверждении работы/окончательного закрытия. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Trattoria Cicciolina** — Отложен: признаки закрытия — [История адреса](https://www.istorijaadresa.com/sr/bregalni%C4%8Dka-18-beograd-11050-serbia) в поисковом снимке сообщает закрытие в 2025; цепочка телефонов Calma/Lord указывает на вероятную смену арендатора. Не считать окончательным закрытием по одному источнику. Возврат при независимом подтверждении. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Devet zmajeva** — Отложен: признаки закрытия — [RestaurantGuru AMP](https://restaurantguru.com/amp/Devet-Zmajeva-%E4%B9%9D%E9%BE%99%E9%A5%AD%E5%BA%97-Balkanska-Belgrade) сообщает permanent closure Balkanska 23, [обычная версия](https://restaurantguru.com/Devet-Zmajeva-%E4%B9%9D%E9%BE%99%E9%A5%AD%E5%BA%97-Balkanska-Belgrade) — possible closure; [Big Daddy](https://bigdaddy.rs/) по тому же адресу. NBG: [Wolt](https://wolt.com/en/srb/belgrade/restaurant/kineski-restoran-devet-zmajeva-nbg) другой адрес, доставка закрыта всю неделю. Возврат при подтверждении отдельной действующей точки; статусы не смешивать. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Jin Yuan** — Отложен: признаки закрытия — [Cybo](https://xn--telefonknyga-quc.cybo.com/RS/belgradas/delivery-chinese-restaurant) сообщает permanent closure по Ivana Milutinovića 85 с телефоном из [PlanPlus](https://www.planplus.rs/kineski-restoran-jin-yuan/89185); независимое подтверждение окончательного закрытия отсутствует. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Food & bar Crveni rak** — Отложен: признаки закрытия — [История адреса](https://www.istorijaadresa.com/sr/brani%C4%8Devska-12a-beograd-11000-serbia) в поисковом снимке прямо сообщает закрытие в 2022; прямое открытие cache miss, [Near-place](https://rs.near-place.com/crveni-rak-food-and-bar-branicevska-12-beograd) сохраняет старые отзывы. Возврат при независимом подтверждении; не путать с пабом в Земуне. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Parapata** — Отложен: признаки закрытия — [RestaurantGuru](https://restaurantguru.com/Restoran-Parapata-Belgrade) сообщает временное закрытие Balkanska 14, историческая [публикация 2022](https://citymagazine.danas.rs/gastro/restorani/meksicka-kuhinja-parapata/) даёт Maksima Gorkog 97. Возврат при проверке конкретной точки; закрытие одного адреса не доказывает другого. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Kultura — Cara Lazara** — Отложен: признаки закрытия — [Яндекс](https://yandex.com/maps/org/132002151546/) сообщает о закрытии; [отель Capital](https://capitalhotel.rs/) не называет Kultura в описании кухни, карточка Google Hotels сохраняется. Возврат при подтверждении отдельного турецкого ресторана; не смешивать с двумя уже нанесёнными Kultura. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Cinecitta** — **Вероятно закрыт, перенесён в список проверки закрытия.** [История адреса](https://www.istorijaadresa.com/sr/kneza-vi%C5%A1eslava-88-beograd-11090-serbia) прямо сообщает закрытие Cineccita в 2024; [PlanPlus](https://www.planplus.rs/restoran-cinecitta/11831) сохраняет историческую карточку; [Filmski Grad](https://nadjisalu.rs/sala/restoran-filmski-grad-cukarica/) содержит отзывы 2026 по тому же большому комплексу. Нужен независимый факт закрытия/возобновления. [История](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

- **Aperto** — вероятно закрыт, см. §6; отдельная карточка Aperto Batajnica не доказывает работу. Rispetto — другой кандидат.
- **Špageterija** — Dedinje вероятно закрыт (№2/2B, конфликт телефонов), Zemun Glavna 13 не установлен (заявление о закрытии 2021 не удалось подтвердить для конкретной карточки); Bulevar 144 — Luigi уже нанесён. См. §11.
- **URA! — Bulevar kralja Aleksandra** — №48 признаки окончательного закрытия по HappyCow/Яндекс, №148 не подтверждён. См. §18.

## Новый кандидат высокого приоритета — Rispetto Ristorante, Batajnica

Итальянская кухня со смешанным меню, пицца, паста, ризотто. На [официальном сайте](https://rispetto.rs/) и [странице мероприятий](https://rispetto.rs/proslave) в более свежих поисковых снимках указан Katice Opačić 1A, телефон +381637288155. [Меню](https://rispetto.rs/jelovnik) и [доставка](https://rispetto.rs/dostava) по-прежнему указывают Stevana Dubajića 5 с тем же телефоном. [Moja Batajnica](https://www.mojabatajnica.com/firme/batajnica-restorani-restoran-rispetto) подтверждает старый адрес, отдельный контакт +381114400925 и оценку 01.04.2026 (оценка не доказывает посещение после переезда), ссылка карты https://www.google.com/maps?q=44.89684406894006%2C+20.290106864886788. [Alideda](https://www.alideda.com/rispetto-delivery-batajnica), [CompanyWall](https://www.companywall.rs/firma/rispetto/MMxCyEC4Y) также сохраняют Stevana Dubajića 5. [RestaurantGuru](https://restaurantguru.com/Rispetto-Belgrade) даёт этот адрес и другой телефон +381631902305, но относительные даты отзывов привязаны к старому снимку. При дополнительном поиске структурированная карточка Google place ID ChIJu0cHRgBnWkcR7NwWr3jHHaM по Stevana Dubajića 5 помечена Permanently Closed; [ссылка на карточку](https://www.google.com/maps/search/?api=1&query=Rispetto%20Batajnica&query_place_id=ChIJu0cHRgBnWkcR7NwWr3jHHaM). Это сигнал возможного переезда или закрытия старой точки, не доказательство закрытия бизнеса. Прямое открытие главной и страницы мероприятий cache miss; адрес Katice Opačić 1A подтверждён поисковыми снимками, но его геометка не установлена. **Не публиковать до подтверждения текущего физического адреса и работы.** Звонок по номеру владельца — приоритет. Не переносить старую геометку Aperto или Rispetto на новый адрес.

## Приоритет прямой проверки

Второй аудит предлагает следующие контакты (звонки не выполнялись, доступность номеров не проверена):

| Заведение | Телефон | Вопрос |
|---|---|---|
| Rispetto | +381637288155 | Текущий адрес, работает ли зал, переезд/связь с Aperto |
| Indian Arab | +381654392977 | Отдельная точка Brankova 19? |
| Pescatore | +381659872701 | Работа на Ilije Garašanina 23? |
| Barinello | +381637301311 | Работа на Ratka Mitrovića 54? |
| Grazia | +381112541697 | Работа, номер 60/60a? |
| Sushi Room | +381637879368 | Работа на Uroša Martinovića 6? |
| Peace | +381654346754 | Работа на 27. marta 36? |
| Shaurmagedon | +381621766326 | Работа, вход 16/18, кухня? |
| URA! | +381621910079 | Самовывоз Kolubarska 21, существование №148? |

Для нового прохода использовать первичные подтверждения, не повторять третий раз те же каталоги.

## Временно закрытые — не наносить на карту

Сохранены только для истории и повторной проверки при подтверждении возобновления работы. Не включать в активный список для независимого ИИ.

- **Curry & Curry** — Отложен: временное закрытие — [RestaurantGuru](https://restaurantguru.com/Curry-and-Curry-Belgrade) сообщает о временном закрытии Balkanska 26; карточка Balkanska 24 противоречива. Возврат при подтверждении работы по конкретному адресу. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Fusion Cuisine Restoran** — Отложен: временное закрытие — [PlanPlus](https://www.planplus.rs/beograd/japanski-restorani) прямо сообщает о временном закрытии, Njegoševa bb. Возврат по подтверждению открытия и точного адреса. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Lee** — Отложен: временное закрытие — [RestaurantGuru](https://restaurantguru.com/Lee-Belgrade) и [Wanderlog](https://wanderlog.com/place/details/1455718/lee) сообщают о временном закрытии Dimitrija Tucovića 1; отдельная точка от Lucky Lee. Возврат при подтверждении открытия. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Mister Wok** — Отложен: временное закрытие — [Сайт владельца](https://kineskahrana.rs/) и [контакты](https://kineskahrana.rs/kontakt) прямо сообщают Privremeno zatvoreno. Возврат после объявления о возобновлении. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Zein** — Отложен: временное закрытие — [Сайт владельца](https://www.zeinrestaurant.com/?lang=sr) прямо сообщает о временном закрытии по личным причинам; [Wanderlog](https://wanderlog.com/place/details/3972498/zein-express) подтверждает такой статус. Возврат после объявления о возобновлении. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **La casa del Burrito** — Отложен: временное закрытие — [RestaurantGuru](https://es.restaurantguru.com/La-casa-del-burrito-Belgrade) сообщает о временном закрытии; по Makedonska 11 действует карточка другого бренда. Возврат при подтверждении работы именно La casa. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).
- **Patriki** — Отложен: временное закрытие — [Uglavnom, 25.09.2026](https://www.uglavnom.rs/pochemuzakryvayutsyarusskiezavedeniyavserbii), [RestaurantGuru](https://restaurantguru.com/PATRIKI-Belgrade), [Corner, 17.10.2026](https://www.corner.inc/place/pNDmw5nunWpz) сообщают о временном закрытии. Возврат по сообщению об открытии. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

## Обновление очереди

При новой проверке добавляй дату, итог и ссылки к существующей записи. Не удаляй историю и не размножай строки по одному адресу. При подтверждённом добавлении укажи ID, SHA и PR, после чего перенеси в раздел решённых. Фиксируй переименование и замену арендатора отдельно. При отсутствии новой информации оставляй запись без повторного бессмысленного обхода.
