# Симулятор для продакт-менеджеров

Фронтенд: React + Vite (экспорт из Figma Make). Бэкенд: Supabase-проект **pm-simulator** (`arwqiyvtvajgfpdnstsu`, eu-central-1).

## Запуск
```bash
npm ci
npm run dev     # разработка
npm run build   # сборка в dist/
```

## Хостинг
Timeweb Cloud App Platform, фронтенд из этого репозитория (ветка `main`, сборка `npm run build`, каталог `dist`). Каждый пуш в `main` пересобирает сайт.

## Supabase
- Таблицы: `kv_store_23af9177` (профили, прогресс, ответы, закладки, записи), `user_access` (доступ, project = `simulator product`), `yookassa_payments`.
- Функции (`supabase/functions/`): `make-server-0610b5e4` (API + AI), `start-simulator-trial`, `create-simulator-yookassa-payment`, `simulator-yookassa-webhook`.
- Деплой функций: workflow `deploy-server.yml` (нужен секрет репозитория `SUPABASE_ACCESS_TOKEN`).

### Секреты функций (Supabase → Edge Functions → Secrets)
| Секрет | Зачем |
|---|---|
| `OPENAI_API_KEY` | AI-ментор, подсказки, проверка кейсов |
| `ADMIN_EMAILS` | email админов через запятую — доступ к `/admin` |
| `YOOKASSA_SHOP_ID_SIMULATOR`, `YOOKASSA_SECRET_KEY_SIMULATOR` | оплата |
| `SITE_URL_SIMULATOR` | адрес сайта для возврата после оплаты |

Webhook ЮKassa: `https://arwqiyvtvajgfpdnstsu.supabase.co/functions/v1/simulator-yookassa-webhook` (события `payment.succeeded`, `payment.canceled`).

## Безопасность
Ключ OpenAI только на сервере; все запросы к API идут с токеном сессии пользователя, сервер проверяет владельца данных; админ-доступ проверяется на сервере по `ADMIN_EMAILS`.
