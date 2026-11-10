Нужно подключить оплату через ЮKassa к приложению, которое уже связано с Supabase.

ВАЖНО:
1. Не добавляй ключи ЮKassa во фронтенд.
2. Не храни YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY или любые секретные ключи в коде приложения.
3. Оплата должна работать только через Supabase Edge Functions.
4. Доступ открывается только после подтверждения оплаты через webhook, не сразу после клика на кнопку.
5. В таблице Supabase user_access для этого продукта project всегда должен быть: simulator product.

У нас уже будут созданы Supabase Edge Functions:

1. create-simulator-yookassa-payment
   Используется для создания платежа в ЮKassa.
   Принимает body:
   {
     plan: "month" | "lifetime"
   }

   Возвращает:
   {
     ok: true,
     payment_id: "...",
     confirmation_url: "..."
   }

2. start-simulator-trial
   Используется для активации бесплатного пробного периода.
   Принимает пустой body: {}
   Возвращает данные trial-доступа.

3. simulator-yookassa-webhook
   Эта функция вызывается ЮKassa, из фронтенда её не вызывать.

Тарифы на странице:

1. Месячная подписка
   Цена: 1000 ₽/мес
   plan: "month"
   Кнопка должна вызывать Supabase Function create-simulator-yookassa-payment с body { plan: "month" }.
   После получения confirmation_url нужно перенаправить пользователя:
   window.location.href = data.confirmation_url

2. Вечный доступ
   Цена: 2500 ₽
   plan: "lifetime"
   Кнопка должна вызывать Supabase Function create-simulator-yookassa-payment с body { plan: "lifetime" }.
   После получения confirmation_url нужно перенаправить пользователя:
   window.location.href = data.confirmation_url

3. Бесплатный пробный период
   Текст кнопки: Попробовать 7 дней бесплатно
   plan: "trial"
   Кнопка должна вызывать Supabase Function start-simulator-trial с body {}.
   После успешной активации нужно перевести пользователя в основное приложение /app или на главный экран CRM.

Нужно добавить обработчики кликов для кнопок:

Для кнопки месячного тарифа:
- setLoading(true)
- вызвать supabase.functions.invoke("create-simulator-yookassa-payment", { body: { plan: "month" } })
- если есть error — показать alert или toast "Не удалось создать платеж. Попробуйте ещё раз."
- если есть data.confirmation_url — сделать window.location.href = data.confirmation_url
- в finally setLoading(false)

Для кнопки вечного доступа:
- setLoading(true)
- вызвать supabase.functions.invoke("create-simulator-yookassa-payment", { body: { plan: "lifetime" } })
- если есть error — показать alert или toast "Не удалось создать платеж. Попробуйте ещё раз."
- если есть data.confirmation_url — сделать window.location.href = data.confirmation_url
- в finally setLoading(false)

Для кнопки trial:
- setLoading(true)
- вызвать supabase.functions.invoke("start-simulator-trial", { body: {} })
- если успех — обновить состояние доступа пользователя и перейти в приложение
- если ошибка 409 или сообщение Trial already used — показать "Пробный период уже был использован. Выберите тариф для продолжения."
- остальные ошибки — "Не удалось активировать пробный доступ. Попробуйте ещё раз."
- в finally setLoading(false)

Нужно добавить проверку доступа пользователя через таблицу user_access.

Проверка доступа:
1. Получить текущего авторизованного пользователя Supabase.
2. Найти запись в public.user_access:
   user_id = currentUser.id
   project = "simulator product"
   status = "active"

Пример логики:

const { data: access, error } = await supabase
  .from("user_access")
  .select("*")
  .eq("user_id", currentUser.id)
  .eq("project", "simulator product")
  .eq("status", "active")
  .maybeSingle();

const hasAccess =
  access &&
  (
    access.plan === "lifetime" ||
    (access.expires_at && new Date(access.expires_at) > new Date())
  );

Если hasAccess = true:
- пускать пользователя в приложение.

Если hasAccess = false:
- показывать страницу тарифов.

Если plan = "lifetime":
- доступ считается активным всегда, expires_at может быть null.

Если plan = "month" или "trial":
- доступ активен только если expires_at больше текущей даты.

Нужно добавить страницу /payment-success.

На странице /payment-success:
1. Показать текст:
   "Платёж обрабатывается"
   "Обычно доступ открывается в течение нескольких секунд. Не закрывайте страницу."
2. Каждые 2–3 секунды проверять user_access для текущего пользователя:
   user_id = currentUser.id
   project = "simulator product"
   status = "active"
3. Если доступ появился и он активен — перенаправить пользователя в /app.
4. Если прошло больше 60 секунд и доступа нет — показать:
   "Платёж может обрабатываться чуть дольше. Обновите страницу через минуту или напишите в поддержку."
5. Добавить кнопку "Проверить доступ снова", которая повторяет проверку.

Нужно добавить loading-состояния:
- когда пользователь нажимает кнопку оплаты, кнопка должна становиться disabled;
- текст кнопки можно заменить на "Создаём платёж...";
- для trial — "Активируем доступ...".

Нужно добавить обработку неавторизованного пользователя:
- если пользователь не авторизован и нажимает оплату или trial, сначала отправить его на регистрацию/логин;
- после логина вернуть на страницу тарифов.

Нужно ничего не менять в ценах и названиях:
- Месячная подписка — 1000 ₽/мес
- Вечный доступ — 2500 ₽
- Бесплатный период — 7 дней

Нужно использовать именно эти значения plan:
- "trial"
- "month"
- "lifetime"

Нужно использовать именно этот project:
- "simulator product"

Не создавай прямые запросы к API ЮKassa из фронтенда.
Не добавляй секретные ключи в код приложения.
Не открывай доступ пользователю сразу после redirect из ЮKassa.
Доступ должен проверяться только через Supabase user_access.