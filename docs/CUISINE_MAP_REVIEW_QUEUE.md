# Очередь проверки ресторанов Белграда

Последний проход: 2026-11-27 (Europe/Belgrade). Не публикуется на сайте; рабочие данные для агентов и редакторов. Регламент: [CUISINE_MAP_MAINTENANCE.md](CUISINE_MAP_MAINTENANCE.md). История: [Issue #462](https://github.com/Antiokh/rslive_content/issues/462), [полный архив](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

## Задание независимому ИИ — 19 исходных кандидатов

Проведи независимый поиск по каждой строке. Цель: установить, действует ли **конкретная физическая точка** сейчас, её точный адрес, специализацию, координаты и источники. Не полагайся на предварительный вывод ниже. Ищи по сербской латинице/кириллице, английскому, русскому, телефону, адресу, социальным сетям, картам, меню, отзывам, сайтам владельца и ТЦ. Используй источники с датой реального события, а не только датой индексации. Отдельно проверь переименования, соседние помещения, филиалы и доставку. Не выдавай старые карточки за подтверждение работы. Не публикуй изменения в GitHub; верни результаты редактору.

Для каждой строки верни: название; статус (действует / временно закрыт / окончательно закрыт / вероятно закрыт / не установлено / исключить по кухне / иной бренд); точный адрес и телефон; кухня; зал/самовывоз/только доставка; широта, долгота и URL исходной геометки (если подтверждены); 2–3 прямых ссылки, даты публикаций/отзывов и что именно они доказывают; противоречия; уверенность и решение для карты. Если нового доказательства нет, так и напиши. Не выдумывай координаты или звонки. Проверь совпадение с действующими маркерами в GeoJSON.

### 1. A la Grekos

[PlanPlus](https://www.planplus.rs/restoran-a-la-grekos/90091) сохраняет Svetotrojčina 22; исторический Geppetto по тому же адресу и телефону. Возврат при подтверждении текущего греческого ресторана. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [RestaurantGuru](https://ru.restaurantguru.com/A-la-Grekos-Belgrade) теперь показывает Villa Geppetto; [Geppetto Plus](https://geppetto-plus.ls.rs/rs/) совпадает по адресу и телефону. [Tripadvisor](https://www.tripadvisor.ru/Restaurant_Review-g294472-d15753542-Reviews-Geppetto_Restaurant-Belgrade.html) описывает гостевой дом. Проверить смену бренда и текущую кухню.

### 2. Indijski restoran Arab

[NaVidiku](https://www.navidiku.rs/firme/restorani-u-beogradu/indian-arab-restaurant) и [PlanPlus](https://www.planplus.rs/en/indijski-arab-indian-restaurant/143828) сохраняют Brankova 19, но актуальной отдельной точки не доказано; не дублировать Indian Arab на Maršala Birjuzova. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [NaVidiku](https://www.navidiku.rs/firme/restorani-u-beogradu/indian-arab-restaurant) сохраняет ссылку на старый business.site, [PlanPlus](https://www.planplus.rs/beograd/indijski-restorani) повторяет телефон. Свежих независимых посещений именно Brankova 19 не найдено.

### 3. Cucina d'autore Pescatore

[PlanPlus](https://www.planplus.rs/cucina-d-autore-pescatore/90118) имеет отзыв о другом городе; историческая точка Ilije Garašanina 23 не подтверждена. Нужны актуальное меню и работа. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/cucina-d-autore-pescatore/90118): единственный отзыв описывает Врбас. [Pronađi u Srbiji](https://pronadjiusrbiji.rs/listing/restoran-morske-ribe-i-plodova-pescatore/) подтверждает исторические телефоны 0659872701/0113249128, средиземноморское меню, не текущую работу.

### 4. Pasta Caffe Lupo

[NaVidiku](https://www.navidiku.rs/firme/pasta-barovi-beograd/pasta-caffe-lupo) сохраняет историческое меню; [Wolt Pobednik](https://wolt.com/sr/srb/belgrade/restaurant/pobednik-rotilj) по тому же адресу. Нужен факт текущей работы Lupo либо доказанная смена арендатора. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [NaVidiku](https://www.navidiku.rs/firme/pasta-barovi-beograd/pasta-caffe-lupo) сохраняет часы; [CompanyWall THEWOLF](https://www.companywall.rs/firma/aleksandra-trailovic-pr-thewolf/MMxArwxuR) и [THEWOLFBGD](https://www.companywall.rs/firma/thewolfbgd/MMx9t25zC) показывают регистрации ресторанного бизнеса с 2023 по тому же адресу. Проверить идентичность помещения, не приравнивать регистрацию к работе.

### 5. Piccolo Mediteraneo Cuicine

[Blic, 2012](https://www.blic.rs/zabava/italija-u-trznom-centru-piccolo/kj951y4) подтверждает историческую точку в Zira. Возврат при подтверждении текущего арендатора/работы. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: Новых независимых источников работы не найдено. Проверить текущий каталог арендаторов Zira, этаж и название.

### 6. Aperto

[Исторический сайт](https://aperto.batajnica.org/) и [регистрация](https://www.companywall.rs/firma/dejan-majstorovic-pr-aperto-home/MMx3idfq0) совпадают по телефону, но не доказывают текущую работу. Нужны текущий адрес и меню. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Aperto Batajnica](https://aperto.ls.rs/rs/kontakt.html) указывает ещё один телефон 0118488996, отличающийся от старого сайта. [История адреса](https://www.istorijaadresa.com/sr/stevana-dubaji%C4%87a-5-beograd-11273-serbia) содержит записи до 2026. Проверить идентичность двух Aperto и текущий зал, регистрацию не считать подтверждением.

### 7. Barinello

[PlanPlus](https://www.planplus.rs/cukarica/italijanski-restorani) Ratka Mitrovića 54; нет независимой актуальной карточки. Возврат при новом подтверждении. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/en/cukarica/italian-cuisine-restaurants) даёт 0637301311, 0 отзывов. Нужна независимая проверка телефона/работы.

### 8. Cinecitta

[PlanPlus](https://www.planplus.rs/restoran-cinecitta/11831) сохраняет Kneza Višeslava 88; другие рестораны в комплексе не доказывают замену конкретного помещения. Нужен актуальный факт работы/прекращения. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: **Вероятно закрыт, перенесён в список проверки закрытия.** [История адреса](https://www.istorijaadresa.com/sr/kneza-vi%C5%A1eslava-88-beograd-11090-serbia) прямо сообщает закрытие Cineccita в 2024; [PlanPlus](https://www.planplus.rs/restoran-cinecitta/11831) сохраняет историческую карточку; [Filmski Grad](https://nadjisalu.rs/sala/restoran-filmski-grad-cukarica/) содержит отзывы 2026 по тому же большому комплексу. Нужен независимый факт закрытия/возобновления.

### 9. Grazia

[Portal Srbija](https://www.portal-srbija.com/picerije-banovo-brdo) и [NaVidiku](https://www.navidiku.rs/firme/picerije-beograd/picerija-grazia) исторические сведения; разночтение Žarkovačka 60/60a. Нужны работа и адрес. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Туристический каталог](https://turistickiklub.com/objekat/grazia) содержит один недатированный отзыв и пустое расписание, совпадающий телефон 0112541697. [PlanPlus](https://www.planplus.rs/beograd/ulica/zarkovacka/14501) подтверждает старую карточку. Не доказана работа.

### 10. Italiano dassa

[PlanPlus](https://www.planplus.rs/restoran-italiano-dassa/135484) сохраняет Makedonska 11, [Wolt Yalla Yalla](https://wolt.com/sr/srb/belgrade/restaurant/yalla-yalla1234) — другая точка по тому же номеру. Нужна идентификация помещения. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/beograd/ulica/makedonska/6712) сохраняет несколько ресторанов по №11, в том числе Ma'ida и Yalla Yalla. Нужен текущий арендатор конкретного помещения.

### 11. Špageterija

[The Guide](https://theguide.tab.travel/zvmay/spageterija-dedinje/) подтверждает исторический Dedinje, но нет свежего подтверждения работы филиалов; Bulevar 144 закрыт по прежней проверке. Нужна конкретная активная точка. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Dedinje](https://www.planplus.rs/restoran-spageterija/101989), [Zemun](https://www.planplus.rs/restoran-spageterija/117677) — раздельные карточки; [Luigi](https://www.luigi.rs/) подтверждает действующий другой бренд по Bulevar kralja Aleksandra 144. Проверить каждый филиал отдельно.

### 12. Sushi Hero

[PlanPlus](https://www.planplus.rs/restoran-sushi-hero/121540) историческая карточка Ada Mall; [официальный каталог ТЦ](https://www.adamall.com/en/brendovi/susi-boks/) подтверждает Sushi Box, не Hero. Нужна идентичность или отдельная действующая точка. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/restoran-sushi-hero/121540): 0 отзывов. [Sushi Boks](https://sushiboks.rs/services/) прямо подтверждает работу своего ресторана в Ada Mall; нет доказательства, что Hero и Boks — один бизнес. Проверить текущих арендаторов/переименование.

### 13. Sushi room

[Меню 25.08.2024](https://v8.kudanaklopu.com/novi-beograd/restorani/restoran-sushi-room/jelovnik) и [PlanPlus](https://www.planplus.rs/restoran-sushi-room/133530) расходятся по телефону; актуальная работа Uroša Martinovića 6 не доказана. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Kuda na klopu](https://v8.kudanaklopu.com/novi-beograd/restorani/restoran-sushi-room/jelovnik): меню 25.08.2024, [история адреса](https://www.istorijaadresa.com/sr/uro%C5%A1a-martinovi%C4%87a-6-novi-beograd-11070-serbia) — присутствие с 2021, но не работа сейчас. Нужна актуальная карточка или прямой контакт.

### 14. Peace

[PlanPlus](https://www.planplus.rs/kineski-restoran-peace/143360) единственный содержательный источник; [Wolt Aman](https://wolt.com/sr/srb/belgrade/venue/aman-27-marta) по тому же адресу не доказывает смену помещения. Нужен независимый факт работы. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Stručnjaci](https://strucnjaci.rs/delatnost/restorani/beograd?page=358) повторяет адрес каталога, без доказательства работы. Проверить 0654346754 и конкретное помещение.

### 15. Hanan Food

[Историческое открытие 2021](https://www.lifeinbelgrade.life/Horeca_Restorani_Hanan-Food) Dositejeva 1A; актуальные отзывы Hanan относятся к Svetogorska 2. Нужна идентичность/отдельный филиал. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Реестр компании](https://hanan-food.ls.rs/rs/) указывает Bulevar despota Stefana 115 и производство хлеба/выпечки, не ресторан Dositejeva 1A. Не переносить актуальные отзывы других Hanan.

### 16. Square Burgers and Tortillas

[PlanPlus](https://www.planplus.rs/restoran-square-burgers-and-tortillas/133577) сохраняет Nemanjina 3, актуальное меню и идентичность помещения не доказаны. Возврат при новом свидетельстве. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [PlanPlus](https://www.planplus.rs/restoran-square-burgers-and-tortillas/133577) сохраняет адрес, независимого текущего меню не найдено. Проверить нынешнего арендатора и происхождение бренда.

### 17. Shaurmagedon Shawarma Bar

[RestaurantGuru](https://restaurantguru.com/SHAURMAGEDON-Shawarma-Shaurma-Belgrade-2) Nušićeva 18, отзывы о посещении и закрытой двери; [PlanPlus](https://www.planplus.rs/shaurmagedon-shawarma-bar/154523) и Яндекс дают 16, [CompanyWall](https://www.companywall.rs/firma/shaurmagedon/MMxGr4vC0) — 18. Нужны подтверждение стабильной работы, входа и национальной категории. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [RestaurantGuru](https://restaurantguru.com/SHAURMAGEDON-Shawarma-Shaurma-Belgrade-2) содержит отзыв об удачном посещении и более поздний отзыв о закрытой двери при заявленных часах; [Feruvi](https://feruvi.rs/firme/beograd/brza-hrana?page=3) заявляет проверенный контакт и русскую кухню по №16; [CompanyWall](https://www.companywall.rs/firma/shaurmagedon/MMxGr4vC0) — №18; [Glovo](https://glovoapp.com/sr/rs/belgrade/stores/shaurmagedon-shawarma-beg) сохраняет карточку. Проверить точный вход, доступность заказа и специализацию; не считать относительные даты точными без даты снимка.

### 18. URA! — Bulevar kralja Aleksandra

[Меню от 18.05.2026](https://v8.knk.rs/beograd/vracar/restorani/ura-russian-dumplings-1/Jelovnik) Bulevar 148, но [сайт](https://peljmeni.rs/en) перечисляет Kraljevića Marka 11, Wolt ранее закрыт всю неделю. Нужна текущая работа отдельного филиала. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [HappyCow](https://www.happycow.net/reviews/ura-russian-dumplings-belgrade-455295) сообщает закрытие в июле 2026 по №48, [Яндекс](https://yandex.com/maps/org/ura_russian_dumplings/193879051541/) также permanent closure №48, [Infostud](https://poslovi.infostud.com/poslodavac/ura-russian-dumplings/132736) подтверждает №48. [Старое меню](https://v8.knk.rs/beograd/vracar/restorani/ura-russian-dumplings-1/Jelovnik) даёт №148; не считать автоматически одним филиалом. Проверить ошибку номера, закрытие №48 и существование №148.

### 19. URA! — Kolubarska

[Яндекс](https://yandex.com/maps/org/ura_russian_cuisine/136739289129/) и [PlanPlus](https://www.planplus.rs/ura-ruska-hrana/148521) описывают доставку, [исторический профиль](https://poisk.rs/u/ura/) — доставку и самовывоз. Текущая работа доступного посетителям отдельного пункта не доказана; не дублировать Kraljevića Marka 11. [История проверки](https://github.com/Antiokh/rslive_content/issues/462#issuecomment-7219278139).

Повторный поиск: [Яндекс](https://yandex.com/maps/org/ura_russian_cuisine/136739289129/) и [PlanPlus](https://www.planplus.rs/ura-ruska-hrana/148521) — доставка. Доказательств актуального публичного самовывоза нет. Проверить владельца и действующую точку.

## Список проверки закрытия — не наносить на карту

Десять прежних кандидатов плюс Cinecitta. Статус вероятностный, не окончательный. При появлении новых свидетельств пересмотреть.

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
