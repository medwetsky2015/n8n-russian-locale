# Правила перевода строк узлов n8n

Это строки **параметров узлов и учётных данных** n8n — поля форм, подсказки,
названия операций и ресурсов. Переводятся отдельно от интерфейса.

## Формат

Вход — плоский объект `{"индекс": "английский текст"}`.
Выход — такой же объект с **теми же индексами** и русскими значениями.

Индексы — числовые строки (`"0"`, `"1"`, …). Копируй их дословно: не меняй,
не добавляй, не удаляй. Порядок сохранять не обязательно.

В файле — только валидный JSON. Без markdown-обёрток, без комментариев.

## Жёсткие правила

1. **Плейсхолдеры** сохранять дословно: `{count}`, `{name}`, `{limit}`, `{value}`,
   `{field}` и любые другие. Не переводить, не переименовывать.
2. **HTML-теги** сохранять дословно вместе с атрибутами:
   `<code>`, `<strong>`, `<b>`, `<em>`, `<br>`, `<a href="...">`.
   Переводить только текст между тегами. Атрибуты (`href`, `target`, `title`)
   не трогать. Пример:
   `Click <a href="https://docs.n8n.io">here</a> for help`
   → `Нажмите <a href="https://docs.n8n.io">здесь</a>, чтобы получить помощь`
3. **Связанные сообщения** `@:_reusableBaseText.*`, `@:_brand.name` — копировать
   дословно, не переводить.
4. **Одни и те же строки переводятся одинаково** во всех чанках. Ниже — глоссарий
   и таблица частых фраз; следуй им буквально.
5. **Естественный русский язык** интерфейса. Никаких калек с английского
   («Сделать поле», «Возвратить все» — плохо; «Добавить поле», «Вернуть все» — хорошо).

## Глоссарий

| English | Русский |
|---|---|
| workflow | рабочий процесс |
| node | узел |
| credential / credentials | учётные данные |
| trigger | триггер |
| operation | операция |
| resource | ресурс |
| field / fields | поле / поля |
| parameter | параметр |
| value | значение |
| key | ключ |
| options | параметры |
| option | вариант |
| additional fields | дополнительные поля |
| update fields | обновляемые поля |
| limit | лимит |
| authentication | аутентификация |
| scope / scopes | область доступа / области доступа |
| email | эл. почта |
| user / users | пользователь / пользователи |
| name | название |
| description | описание |
| placeholder | подсказка |
| hint | примечание |
| required | обязательное |
| optional | необязательное |
| default | по умолчанию |
| return all | вернуть все |
| max number of results | максимальное число результатов |
| whether to return all results or only up to a given limit | возвращать все результаты или только до указанного лимита |
| choose from the list, or specify an ID | выберите из списка или укажите ID |
| add field | добавить поле |
| add option | добавить вариант |
| add item | добавить элемент |
| get | получить |
| get many | получить несколько |
| get all | получить все |
| create | создать |
| update | обновить |
| delete | удалить |
| remove | убрать |
| search | поиск |
| filter / filters | фильтр / фильтры |
| sort | сортировка |
| status | статус |
| active / inactive | активен / неактивен |
| enabled / disabled | включено / отключено |
| custom | свой |
| simple | простой |
| advanced | расширенный |
| expression | выражение |
| fixed | фиксированный |
| request | запрос |
| response | ответ |
| header / headers | заголовок / заголовки |
| body | тело |
| query | запрос |
| method | метод |
| url | URL |
| timeout | тайм-аут |
| retry | повтор |
| error | ошибка |
| message | сообщение |
| attachment | вложение |
| file | файл |
| folder | папка |
| table | таблица |
| column | столбец |
| row | строка |
| sheet | лист |
| spreadsheet | таблица |
| project | проект |
| task | задача |
| comment | комментарий |
| tag / tags | тег / теги |
| label | метка |
| category | категория |
| type | тип |
| format | формат |
| source | источник |
| target | цель |
| destination | назначение |
| interval | интервал |
| schedule | расписание |
| timezone | часовой пояс |
| date | дата |
| time | время |
| day / days | день / дни |
| week / weeks | неделя / недели |
| month / months | месяц / месяцы |
| year / years | год / годы |
| hour / hours | час / часы |
| minute / minutes | минута / минуты |
| second / seconds | секунда / секунды |
| today | сегодня |
| yesterday | вчера |
| last | последний |
| first | первый |
| next | следующий |
| previous | предыдущий |
| new | новый |
| all | все |
| none | нет |
| any | любой |
| other | другое |
| number | число |
| string | строка |
| boolean | логическое значение |
| array | массив |
| object | объект |
| list | список |
| item / items | элемент / элементы |
| entry | запись |
| record | запись |
| content | содержимое |
| data | данные |
| properties | свойства |
| settings | настройки |
| permissions | разрешения |
| owner | владелец |
| member / members | участник / участники |
| team | команда |
| organization | организация |
| account | аккаунт |
| access token | токен доступа |
| refresh token | токен обновления |
| client ID | Client ID |
| client secret | Client Secret |
| API key | ключ API |
| base URL | базовый URL |
| endpoint | эндпоинт |
| host | хост |
| port | порт |
| database | база данных |
| collection | коллекция |
| document | документ |
| workspace | рабочее пространство |
| channel | канал |
| conversation | беседа |
| contact | контакт |
| company | компания |
| order | заказ |
| product | товар |
| customer | клиент |
| invoice | счёт |
| payment | платёж |
| subscription | подписка |
| event | событие |
| action | действие |
| activity | активность |
| log | журнал |
| report | отчёт |
| metric | метрика |
| template | шаблон |
| variable | переменная |
| environment | среда |
| production | продуктивная среда |
| test | тест |
| staging | промежуточная среда |
| publish | опубликовать |
| unpublish | снять с публикации |
| activate | активировать |
| deactivate | деактивировать |
| execute | выполнить |
| run | запуск |
| start | начать |
| stop | остановить |
| cancel | отмена |
| confirm | подтвердить |
| continue | продолжить |
| skip | пропустить |
| overwrite | перезаписать |
| append | добавить |
| merge | объединить |
| split | разделить |
| convert | преобразовать |
| parse | разобрать |
| encode | закодировать |
| decode | декодировать |
| upload | загрузить |
| download | скачать |
| import | импорт |
| export | экспорт |
| copy | копировать |
| paste | вставить |
| duplicate | дублировать |
| move | переместить |
| rename | переименовать |
| select | выбрать |
| deselect | снять выбор |
| clear | очистить |
| apply | применить |
| reset | сбросить |
| save | сохранить |
| load | загрузить |
| open | открыть |
| close | закрыть |
| expand | развернуть |
| collapse | свернуть |
| show | показать |
| hide | скрыть |
| enable | включить |
| disable | отключить |
| allow | разрешить |
| deny | запретить |
| include | включить |
| exclude | исключить |
| match | совпадение |
| ignore | игнорировать |
| replace | заменить |
| return | вернуть |
| require | требовать |
| use | использовать |
| specify | указать |
| enter | введите |
| provide | укажите |
| whether | указывает, |
| if | если |
| otherwise | иначе |
| e.g. | напр. |
| etc. | и т. д. |

## Частые фразы (переводить одинаково везде)

| English | Русский |
|---|---|
| Whether to return all results or only up to a given limit | Возвращать все результаты или только до указанного лимита |
| Max number of results to return | Максимальное число возвращаемых результатов |
| Choose from the list, or specify an ID using an <a href="...">expression</a> | Выберите из списка или укажите ID с помощью <a href="...">выражения</a> |
| Add Field | Добавить поле |
| Add Option | Добавить вариант |
| Additional Fields | Дополнительные поля |
| Update Fields | Обновляемые поля |
| Return All | Вернуть все |
| Operation | Операция |
| Resource | Ресурс |
| Authentication | Аутентификация |
| Options | Параметры |
| Limit | Лимит |
| Filters | Фильтры |
| Name | Название |
| Description | Описание |
| Value | Значение |
| Type | Тип |
| Status | Статус |
| User | Пользователь |
| Email | Эл. почта |
| Get | Получить |
| Get Many | Получить несколько |
| Create | Создать |
| Update | Обновить |
| Delete | Удалить |
| Search | Поиск |
| Scope | Область доступа |
| Access Token URL | URL токена доступа |
| Authorization URL | URL авторизации |
| Access Token | Токен доступа |
| API Key | Ключ API |
| Base URL | Базовый URL |

## Что НЕ переводить

Имена продуктов, сервисов, узлов и протоколов — оставлять как есть:

n8n, API, REST, GraphQL, Webhook, JSON, XML, CSV, TSV, YAML, HTML, CSS, HTTP,
HTTPS, URL, URI, ID, UUID, IP, DNS, TCP, UDP, SSL, TLS, SSH, SFTP, FTP, SMTP,
IMAP, POP3, OAuth, OAuth1, OAuth2, SSO, SAML, OIDC, LDAP, JWT, HMAC, Base64,
SDK, CLI, UI, UX, AI, ML, LLM, GPT, RAG, CRUD, SQL, NoSQL, UTC, ISO, Unix, Cron,
Regex, RegEx, MD5, SHA, AES, RSA, PEM, PGP, GPG,

Slack, GitHub, GitLab, Git, Google, Gmail, Google Sheets, Google Drive,
Google Calendar, Google Analytics, OpenAI, Anthropic, Claude, Gemini, ChatGPT,
Microsoft, Excel, Outlook, Teams, OneDrive, SharePoint, Azure, AWS, Amazon,
S3, DynamoDB, Lambda, SES, SNS, SQS, Google Cloud, Vertex AI, Bedrock,
Notion, Airtable, Asana, Trello, Jira, Confluence, Monday.com, ClickUp, Linear,
HubSpot, Salesforce, Zoho, Pipedrive, ActiveCampaign, Mailchimp, SendGrid,
Stripe, Shopify, WooCommerce, Magento, PrestaShop, Zendesk, Freshdesk,
Intercom, Discord, Telegram, WhatsApp, Twilio, Facebook, Instagram, LinkedIn,
X, Twitter, YouTube, Reddit, Pinterest, TikTok, VK, Yandex, Bitrix,
Postgres, PostgreSQL, MySQL, MariaDB, MongoDB, Redis, SQLite, Oracle, MSSQL,
Snowflake, BigQuery, Elasticsearch, OpenSearch, Kafka, RabbitMQ, AMQP, MQTT,
Docker, Kubernetes, Nginx, Apache, Caddy, Terraform, Ansible, Jenkins, CircleCI,
Prometheus, Grafana, Datadog, Sentry, OpenTelemetry, Splunk, New Relic,
Qdrant, Pinecone, Supabase, Weaviate, Milvus, Chroma, Zep, Ollama,
Hugging Face, Cohere, Mistral, Groq, Perplexity, DeepSeek, LangChain,
SeaTable, Baserow, NocoDB, Coda, Smartsheet, Box, Dropbox, Egnyte,
Salesforce, ServiceNow, Workday, BambooHR, Gusto, QuickBooks, Xero,
Klaviyo, Braze, Customer.io, Segment, Amplitude, Mixpanel, PostHog,
and all node type names as they appear on the canvas (HTTP Request, Code, Set,
IF, Switch, Merge, Filter, Wait, Split In Batches, Execute Workflow, Schedule
Trigger, Webhook, Form Trigger, Chat Trigger, AI Agent, Chat Model, Embeddings,
Vector Store, Memory, Tool, Retriever, Document Loader, Text Splitter, …).

**Важно:** названия узлов в настройках (`displayName`) переводить НЕЛЬЗЯ, если
это имя узла на холсте — иначе пользователь не найдёт узел. Но описания полей
внутри узла переводить нужно.

## Стиль

- Кнопки и действия — инфинитив: `Сохранить`, `Удалить`, `Создать`, `Обновить`.
- Названия полей — существительные: `Название`, `Описание`, `Тип`, `Статус`.
- Не заканчивать короткие метки точкой, если в оригинале её нет.
- Кавычки — «ёлочки» для русских терминов.
- Если строка — это техническое значение (имя поля API, код, регулярка,
  пример значения вроде `0 15 * 1 sun`), оставить как есть.
- Если строка состоит только из имени продукта — оставить как есть.
