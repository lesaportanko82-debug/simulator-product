import { SimulationNode, GameMetrics, CHARACTERS as BASE_CHARACTERS } from './simulator-scenarios';

export const TAXI_CHARACTERS = {
  ...BASE_CHARACTERS,
  director: {
    name: "Дмитрий В.",
    role: "GM (General Manager)",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwgdG9wJTIwbWFuYWdlcnxlbnwxfHx8fDE3Njk0ODAyMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-slate-100 text-slate-900 border-slate-200"
  },
  dev: {
    name: "Олег",
    role: "Head of Algo",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk0ODAyMTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-blue-50 text-blue-800 border-blue-200"
  },
  analytics: {
    name: "Сара",
    role: "Data Scientist",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW50aXN0JTIwd29tYW58ZW58MXx8fHwxNzY5NDgwMjIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-indigo-50 text-indigo-800 border-indigo-200"
  },
  support: {
    name: "Алиса",
    role: "Head of Driver Support",
    avatar: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Njk0ODAyMzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200"
  }
};

export const TAXI_SCENARIO: SimulationNode[] = [

  // =============================================
  // INTRO
  // =============================================
  {
    id: 'intro_node',
    senderId: 'system',
    type: 'intro',
    introData: {
      company: "CityCab",
      product: "Driver & Rider App",
      role: "Product Manager",
      description: "CityCab — второй по размеру агрегатор такси в стране. Конкурент FastRide ввёл нулевую комиссию для водителей на выходные. За 48 часов мы потеряли 35% активного флота. ETA выросло с 4 до 15 минут. Пассажиры удаляют приложение. У вас 2 недели, чтобы вернуть Supply и не обанкротиться в процессе.",
      initialMetrics: { budget: 60, morale: 40, satisfaction: 40 }
    },
    nextId: 'day_1_start'
  },

  // =============================================
  // НЕДЕЛЯ 1 — ПОНЕДЕЛЬНИК: Паника
  // =============================================
  {
    id: 'day_1_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПОНЕДЕЛЬНИК: Обвал Supply',
    text: '08:15. Утренний пик. Графики красные. ETA 15 минут.',
    nextId: 'gm_panic'
  },
  {
    id: 'gm_panic',
    senderId: 'director',
    type: 'message',
    text: 'Всем доброе утро. Хотя доброе — это я преувеличил. Смотрите на цифры: активных водителей 1,200 вместо 3,400. Это коллапс.',
    nextId: 'gm_panic_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'gm_panic_2',
    senderId: 'director',
    type: 'message',
    text: 'FastRide дал водителям гарантию $20/час на выходные. Наши считают — у нас они зарабатывают $5.50 за поездку. Математика не в нашу пользу.',
    nextId: 'd1_sara_data',
    delay: 1000,
    isStressful: true
  },
  {
    id: 'd1_sara_data',
    senderId: 'analytics',
    type: 'message',
    text: 'Я сделала экспресс-анализ. Ушли преимущественно водители с рейтингом 4.8+ и стажем 6-18 месяцев. Это наш лучший флот.',
    nextId: 'd1_oleg_view',
    delay: 800
  },
  {
    id: 'd1_oleg_view',
    senderId: 'dev',
    type: 'message',
    text: 'У FastRide нет ML-диспетчеризации. Они просто кидают деньги. Долго не протянут. Но нам нужно пережить этот период.',
    nextId: 'd1_alisa_join',
    delay: 800
  },
  {
    id: 'd1_alisa_join',
    senderId: 'support',
    type: 'message',
    text: 'Я с поддержки. Водители пишут нам: "Вы не цените нас". Многие говорят, что вернутся, если мы "что-то сделаем". Они не ушли навсегда — они ждут сигнала.',
    nextId: 'd1_you_assess',
    delay: 800
  },
  {
    id: 'd1_you_assess',
    senderId: 'user',
    type: 'message',
    text: 'Прежде чем принимать решения — мне нужна точная математика. Сколько водитель получает чистыми с одной поездки у нас vs FastRide?',
    nextId: 'metric_task',
    impact: { satisfaction: +3 }
  },
  {
    id: 'metric_task',
    senderId: 'system',
    type: 'task',
    text: 'Рассчитайте чистый заработок водителя за одну поездку в CityCab.',
    task: {
      type: 'calculation',
      instruction: 'Средний чек поездки: $10. Комиссия CityCab: 25% от чека. Расходы на бензин: $2 за поездку. Сколько чистыми получает водитель?',
      correctValue: 'calc_55',
      onSuccessId: 'calc_success',
      onFailId: 'calc_fail',
      hint: "Доход водителя = $10 − 25% − $2 = $10 × 0.75 − $2",
      data: {
        options: [
          { id: 'calc_75', label: '$7.50 (не вычли расходы)' },
          { id: 'calc_55', label: '$5.50 (правильно)' },
          { id: 'calc_45', label: '$4.50 (ошиблись в комиссии)' },
          { id: 'calc_80', label: '$8.00 (FastRide уровень)' }
        ]
      }
    }
  },
  {
    id: 'calc_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Расчёт заработка водителя',
      explanation: '$10 − 25% комиссии = $7.50 (это доход водителя до расходов). Затем вычтем $2 на бензин. Итого: $7.50 − $2 = $5.50. Для сравнения: FastRide гарантирует $20/час, то есть ~$8 за поездку при средней длительности 24 мин.',
      takeaway: 'Всегда считайте экономику с точки зрения поставщика (водителя), а не платформы.',
      returnNodeId: 'metric_task'
    }
  },
  {
    id: 'calc_success',
    senderId: 'user',
    type: 'message',
    text: 'Итого: $5.50 у нас против $8.00 у FastRide. Разница 45%. Это не просто "немного дороже" — это другой уровень жизни для водителя.',
    nextId: 'd1_sara_react',
    impact: { satisfaction: +2 }
  },
  {
    id: 'd1_sara_react',
    senderId: 'analytics',
    type: 'message',
    text: 'Плюс у FastRide гарантированная ставка. Наши водители боятся "простоев" — часы без заказов. FastRide устраняет этот страх.',
    nextId: 'd1_alisa_react',
    delay: 800
  },
  {
    id: 'd1_alisa_react',
    senderId: 'support',
    type: 'message',
    text: 'Именно. Водители говорят: "Я боюсь приехать в 8 утра и стоять 2 часа без заказа." У FastRide этого страха нет.',
    nextId: 'strategy_choice',
    delay: 800
  },
  {
    id: 'strategy_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Выберите стратегию возврата водителей:',
    choices: [
      {
        text: 'Снизить комиссию с 25% до 12% навсегда',
        messageText: 'Режем комиссию в два раза. Водители сразу получат конкурентный заработок. Дорого, но честно.',
        nextId: 'finance_angry',
        impact: { budget: -20, satisfaction: +20, morale: +10 }
      },
      {
        text: 'Ввести Surge Pricing x1.5 + отдавать 80% надбавки водителю',
        messageText: 'Поднимаем цены в часы пик. 80% надбавки — водителям. Пассажиры платят больше, водители зарабатывают больше.',
        nextId: 'user_churn',
        impact: { budget: +5, satisfaction: -20, morale: +10 }
      },
      {
        text: 'Запустить "Гарантию минимума" — $15/час в пиковые часы',
        messageText: 'Вводим гарантию: если в час пик водитель заработал меньше $15, мы доплачиваем. Это таргетированная атака на главный страх.',
        nextId: 'guarantee_path',
        impact: { budget: -10, satisfaction: +15, morale: +15 }
      }
    ]
  },

  // --- Ветка: снизить комиссию ---
  {
    id: 'finance_angry',
    senderId: 'director',
    type: 'message',
    text: 'Это минус $700k EBITDA в неделю при текущих объёмах. Даю тебе 2 недели доказать, что объём восстановится и покроет потери.',
    nextId: 'd1_supply_return',
    delay: 1000
  },
  {
    id: 'd1_supply_return',
    senderId: 'analytics',
    type: 'message',
    text: 'Первые сигналы: за 6 часов после объявления 400 водителей установили CityCab обратно. ETA упало с 15 до 9 минут.',
    nextId: 'day_2_start',
    delay: 1000
  },

  // --- Ветка: Surge ---
  {
    id: 'user_churn',
    senderId: 'analytics',
    type: 'message',
    text: 'Conversion Rate пассажиров упал на 28% за утро. Водители вернулись, но возить некого — пассажиры открывают FastRide.',
    nextId: 'd1_surge_adjust',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'd1_surge_adjust',
    senderId: 'dev',
    type: 'message',
    text: 'Может, ограничим Surge x1.3 вместо x1.5? Меньший удар по пассажирам, но всё ещё привлекательно для водителей.',
    nextId: 'day_2_start',
    delay: 800
  },

  // --- Ветка: Гарантия ---
  {
    id: 'guarantee_path',
    senderId: 'support',
    type: 'message',
    text: 'Это попадает прямо в боль. Водители уже репостят наш анонс в чатах. "Цитикэб дает гарантию — это серьёзно".',
    nextId: 'd1_oleg_concern',
    delay: 800
  },
  {
    id: 'd1_oleg_concern',
    senderId: 'dev',
    type: 'message',
    text: 'Нужна система мониторинга в реальном времени — чтобы считать доплату автоматически. Я могу запустить простую версию за 2 дня.',
    nextId: 'day_2_start',
    delay: 800
  },

  // =============================================
  // ВТОРНИК: Анализ оттока
  // =============================================
  {
    id: 'day_2_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ВТОРНИК: Глубинный анализ',
    text: 'ETA стабилизировалось на 11 минутах. Нужно понять, кто именно уходил и почему.',
    nextId: 'd2_sara_cohort'
  },
  {
    id: 'd2_sara_cohort',
    senderId: 'analytics',
    type: 'message',
    text: 'Я сделала когортный анализ. Уходили "опытные новички" — стаж 3-12 месяцев, рейтинг 4.8+. Это самая ценная группа.',
    nextId: 'd2_sara_cohort_2',
    delay: 800
  },
  {
    id: 'd2_sara_cohort_2',
    senderId: 'analytics',
    type: 'message',
    text: 'Они понимают рынок, быстро принимают заказы, не конфликтуют. Их потеря в 3 раза дороже потери новичков.',
    nextId: 'd2_alisa_insight',
    delay: 800
  },
  {
    id: 'd2_alisa_insight',
    senderId: 'support',
    type: 'message',
    text: 'Я провела 15 интервью по телефону. Основная жалоба: "Я делаю по 8 часов в день, а вы не дали мне даже поздравления с Новым годом." Им важно признание, не только деньги.',
    nextId: 'd2_oleg_data',
    delay: 1000
  },
  {
    id: 'd2_oleg_data',
    senderId: 'dev',
    type: 'message',
    text: 'Кстати, у FastRide нет программы лояльности. Это наш шанс — сделать что-то, что им сложно скопировать быстро.',
    nextId: 'd2_sql_task',
    delay: 800
  },
  {
    id: 'd2_sql_task',
    senderId: 'system',
    type: 'task',
    text: 'Выгрузите список "рисковых" водителей для персональной реактивации.',
    task: {
      type: 'sql_query',
      instruction: 'Нужны водители: регистрация 3-12 месяцев назад, рейтинг > 4.8, не было поездок последние 3 дня.',
      correctValue: 'query_correct',
      onSuccessId: 'retention_action',
      onFailId: 'sql_fail',
      data: [
        { id: 'query_all', text: 'SELECT * FROM drivers WHERE status = "inactive"' },
        { id: 'query_correct', text: 'SELECT id, phone FROM drivers WHERE reg_date BETWEEN NOW()-365d AND NOW()-90d AND rating > 4.8 AND last_trip < NOW()-3d' },
        { id: 'query_old', text: 'SELECT id FROM drivers WHERE rating > 4.0 ORDER BY trips DESC' }
      ]
    }
  },
  {
    id: 'sql_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'SQL: Точный таргетинг',
      explanation: 'Нам нужны три условия: 1) reg_date: опытные, но не ветераны (3-12 мес). 2) rating > 4.8: качественные водители. 3) last_trip < NOW()-3d: именно те, кто перестал ездить. SELECT * FROM inactive слишком широко — захватит всех, включая тех, кто ушёл навсегда.',
      takeaway: 'Чёткий таргетинг экономит бюджет и повышает эффективность реактивации.',
      returnNodeId: 'd2_sql_task'
    }
  },
  {
    id: 'retention_action',
    senderId: 'user',
    type: 'message',
    text: 'Нашли 1,847 таких водителей. Алиса, запускаем персональную кампанию. Не SMS-рассылку — реальные звонки от менеджеров.',
    nextId: 'd2_alisa_plan',
    impact: { morale: +5 }
  },
  {
    id: 'd2_alisa_plan',
    senderId: 'support',
    type: 'message',
    text: 'У меня команда 12 человек. Если каждый сделает по 15 звонков в день — 180 контактов в день. За 10 дней охватим всех.',
    nextId: 'd2_oleg_suggest',
    delay: 800
  },
  {
    id: 'd2_oleg_suggest',
    senderId: 'dev',
    type: 'message',
    text: 'Параллельно я могу запустить "Welcome Back Bonus" в приложении: 50 бонусных рублей за первые 5 поездок после возврата.',
    nextId: 'd2_tech_choice',
    delay: 800
  },
  {
    id: 'd2_tech_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Технический подход к реактивационной кампании:',
    choices: [
      {
        text: 'Hardcode быстро — к утреннему пику среды',
        messageText: 'Олег, хардкодь условия прямо в конфиг. Нам нужно к 7:00 среды.',
        nextId: 'day_3_start',
        impact: { morale: -10, satisfaction: +10 }
      },
      {
        text: 'Полноценная система через неделю',
        messageText: 'Делаем правильно: конфигурируемые кампании, A/B тесты, аналитика. Запуск через 5 дней.',
        nextId: 'day_3_delayed',
        impact: { morale: +10, satisfaction: -15 }
      }
    ]
  },

  // =============================================
  // СРЕДА: Запуск и кризис
  // =============================================
  {
    id: 'day_3_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'СРЕДА: День Х',
    text: 'Welcome Back Bonus запущен в 07:00. Водители видят уведомление при открытии приложения.',
    nextId: 'load_alert'
  },
  {
    id: 'day_3_delayed',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'СРЕДА: Потеря темпа',
    text: 'Конкурент не ждёт. FastRide запустил агрессивную рекламу: "Нулевая комиссия навсегда — не только на выходные".',
    nextId: 'd3_delay_pain'
  },
  {
    id: 'd3_delay_pain',
    senderId: 'director',
    type: 'message',
    text: 'Мы потеряли ещё 200 водителей за ночь. Нам нужно что-то прямо сейчас, а не через неделю.',
    nextId: 'load_alert',
    isStressful: true,
    delay: 800
  },
  {
    id: 'load_alert',
    senderId: 'dev',
    type: 'message',
    text: 'Але! Сервис лёг. 3,000 водителей зашли проверить бонус одновременно. 502 Bad Gateway на весь Driver API.',
    nextId: 'load_alert_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'load_alert_2',
    senderId: 'dev',
    type: 'message',
    text: 'ETA на отдельных маршрутах показывает 99 минут — потому что диспетчер не может достучаться до базы. Клиенты видят это!',
    nextId: 'd3_alisa_panic',
    isStressful: true,
    delay: 800
  },
  {
    id: 'd3_alisa_panic',
    senderId: 'support',
    type: 'message',
    text: 'Тикетов за 20 минут пришло 400. Соцсети горят. Кто-то уже написал "CityCab умер".',
    nextId: 'incident_choice',
    isStressful: true,
    delay: 500
  },
  {
    id: 'incident_choice',
    senderId: 'system',
    type: 'choice',
    text: '⚡ ИНЦИДЕНТ — действуйте быстро:',
    choices: [
      {
        text: 'Rollback — отключить Welcome Back кампанию',
        messageText: 'Выключай кампанию! Возвращаем стабильность. Объявим водителям, что запуск перенесён.',
        nextId: 'ending_stable',
        impact: { satisfaction: -10, morale: -5 }
      },
      {
        text: 'Scale up — докупить облачные инстансы',
        messageText: 'Олег, докупай EC2 инстансы в AWS срочно! Автоскейлинг не успел — делаем вручную.',
        nextId: 'd3_scale_up',
        impact: { budget: -15, satisfaction: +10 }
      },
      {
        text: 'Feature flag — ограничить вход только для новых регистраций',
        messageText: 'Включаем feature flag: кампания видна только водителям, зарегистрировавшимся сегодня. Снизим нагрузку в 10 раз.',
        nextId: 'd3_flag_smart',
        impact: { budget: -3, satisfaction: +5 }
      }
    ]
  },
  {
    id: 'd3_scale_up',
    senderId: 'dev',
    type: 'message',
    text: 'Добавил 8 инстансов. Нагрузка распределилась. Сервис поднялся через 14 минут.',
    nextId: 'd3_post_incident',
    delay: 1000
  },
  {
    id: 'd3_flag_smart',
    senderId: 'dev',
    type: 'message',
    text: 'Умно. Флаг поставлен. Нагрузка упала на 70%. Сервис ожил через 4 минуты. Хирургическое решение.',
    nextId: 'd3_post_incident',
    delay: 1000
  },
  {
    id: 'd3_post_incident',
    senderId: 'analytics',
    type: 'message',
    text: 'Несмотря на инцидент: 650 водителей вернулись в приложение за утро. ETA снизился до 8 минут — лучший результат за неделю.',
    nextId: 'd3_kanban_intro',
    delay: 1000
  },
  {
    id: 'd3_kanban_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'СРЕДА ВЕЧЕР: Tech Sprint',
    text: 'Инцидент показал слабые места. Команда собирается на технический спринт.',
    nextId: 'd3_kanban_task'
  },
  {
    id: 'd3_kanban_task',
    senderId: 'system',
    type: 'task',
    text: 'Расставьте задачи по приоритетам. Capacity: 12 Story Points.',
    task: {
      type: 'kanban_sort',
      instruction: '12 SP до конца недели. Фокус: стабильность системы и удержание водителей.',
      correctValue: 'ignored',
      onSuccessId: 'day_4_start',
      onFailId: 'kanban_fail',
      data: {
        capacity: 12,
        minImpact: 18,
        tickets: [
          { id: 't1', title: 'Автоскейлинг API', desc: 'Настроить auto-scaling чтобы пиковые нагрузки обрабатывались автоматически.', type: 'feature', urgency: 'critical', effort: 5, impact: 15 },
          { id: 't2', title: 'Push-уведомления водителям', desc: 'Персональные пуши с балансом бонусов и статусом квеста.', type: 'feature', urgency: 'high', effort: 3, impact: 10 },
          { id: 't3', title: 'Водительский дашборд', desc: 'Страница "Мои заработки и бонусы". Прозрачность.', type: 'feature', urgency: 'high', effort: 4, impact: 8 },
          { id: 't4', title: 'Рефакторинг биллинга', desc: 'Переписать систему начислений. Технический долг.', type: 'feature', urgency: 'low', effort: 8, impact: 4 },
          { id: 't5', title: 'Маршрутизация ML v2', desc: 'Улучшенная ML-модель предсказания спроса.', type: 'feature', urgency: 'medium', effort: 6, impact: 9 }
        ]
      }
    }
  },
  {
    id: 'kanban_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Приоритизация под кризис',
      explanation: 'Автоскейлинг (5 SP, impact 15) + Push-уведомления (3 SP, impact 10) + Дашборд (4 SP, impact 8) = 12 SP, total impact 33. Рефакторинг биллинга — технический долг, не критичен прямо сейчас. ML v2 — улучшение, но не критичный блокер.',
      takeaway: 'В кризис: сначала стабильность, потом удержание, потом улучшения.',
      returnNodeId: 'd3_kanban_task'
    }
  },

  // =============================================
  // ЧЕТВЕРГ: Инцидент безопасности
  // =============================================
  {
    id: 'day_4_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЧЕТВЕРГ: Безопасность',
    text: 'Команда работает по спринту. Но служба безопасности подняла тревогу.',
    nextId: 'd4_security_alert'
  },
  {
    id: 'd4_security_alert',
    senderId: 'risk',
    type: 'message',
    text: 'Обнаружена утечка: в открытом Telegram-канале появились персональные данные 2,300 водителей — имена, номера телефонов, рейтинги.',
    nextId: 'd4_security_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'd4_security_2',
    senderId: 'risk',
    type: 'message',
    text: 'Предположительно — внутренняя утечка. Кто-то из сотрудников сделал выгрузку и слил. Нужно найти источник.',
    nextId: 'd4_log_intro',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'd4_log_intro',
    senderId: 'dev',
    type: 'message',
    text: 'У меня есть логи доступа к базе данных за последние 48 часов. Давайте найдём аномальный запрос.',
    nextId: 'd4_log_task'
  },
  {
    id: 'd4_log_task',
    senderId: 'system',
    type: 'task',
    text: 'Проанализируйте логи — найдите подозрительный запрос к базе данных водителей.',
    isStressful: true,
    task: {
      type: 'log_analysis',
      instruction: 'Найдите строку, которая соответствует массовой выгрузке персональных данных. Нормальный запрос — это 1-5 записей. Подозрительный — тысячи.',
      correctValue: 'bulk_export',
      onSuccessId: 'd4_log_success',
      onFailId: 'd4_log_fail',
      hint: "Обычные запросы возвращают единичные записи. Выгрузка 2,300 строк будет видна в поле rows_returned.",
      data: [
        { id: '1', time: '22:14:33', ip: '10.0.1.5', ua: 'Internal API v3', status: 200, action: 'SELECT driver WHERE id=10283, rows=1' },
        { id: '2', time: '22:15:01', ip: '10.0.1.8', ua: 'CRM Dashboard', status: 200, action: 'SELECT driver WHERE city=MSK LIMIT 20, rows=20' },
        { id: 'bulk_export', time: '23:58:44', ip: '10.0.2.99', ua: 'Postman/10.18', status: 200, action: 'SELECT * FROM drivers rows=2300 (no LIMIT)', isError: true },
        { id: '4', time: '00:02:11', ip: '10.0.1.5', ua: 'Internal API v3', status: 200, action: 'UPDATE driver SET status=active WHERE id=10284, rows=1' }
      ]
    }
  },
  {
    id: 'd4_log_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Детекция утечек в логах',
      explanation: 'Ключевые признаки: 1) SELECT * без LIMIT — это нестандартно, 2) rows=2300 — массовая выгрузка, 3) Postman/10.18 — это не продовский клиент, а инструмент ручного тестирования, 4) 23:58 — ночное время, когда меньше мониторинга.',
      takeaway: 'SELECT * без LIMIT + нестандартный клиент + нерабочее время = паттерн утечки.',
      returnNodeId: 'd4_log_task'
    }
  },
  {
    id: 'd4_log_success',
    senderId: 'user',
    type: 'message',
    text: 'Нашли. IP 10.0.2.99, Postman, ночью, 2300 строк. Это внутренний сотрудник. Нужно установить личность через IP-адрес.',
    nextId: 'd4_found',
    impact: { budget: +5 }
  },
  {
    id: 'd4_found',
    senderId: 'dev',
    type: 'message',
    text: 'IP принадлежит рабочей станции в отделе поддержки. HR уже в курсе. Сотрудник отстранён до расследования.',
    nextId: 'd4_response_choice',
    delay: 800
  },
  {
    id: 'd4_response_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как коммуницировать об инциденте?',
    choices: [
      {
        text: 'Тихо исправить, не объявлять',
        messageText: 'Закрываем дыру, увольняем виновного. Публично ничего не говорим — Telegram-канал всё равно удалят.',
        nextId: 'd4_silent_path',
        impact: { budget: 0, satisfaction: -10 }
      },
      {
        text: 'Официальное письмо всем пострадавшим водителям',
        messageText: 'Отправляем персональные уведомления всем 2,300. Объясняем ситуацию и что мы сделали.',
        nextId: 'd4_transparent_path',
        impact: { budget: -3, satisfaction: +10, morale: +5 }
      }
    ]
  },
  {
    id: 'd4_silent_path',
    senderId: 'analytics',
    type: 'message',
    text: 'Telegram-канал нашли журналисты. TechCrunch написал статью. Нам пришлось всё равно объяснять, но уже в позиции "скрывали".',
    nextId: 'day_5_start',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'd4_transparent_path',
    senderId: 'support',
    type: 'message',
    text: 'Реакция водителей удивила. Многие написали: "Спасибо, что сказали сами. Это честно." Доверие выросло.',
    nextId: 'day_5_start',
    delay: 1000
  },

  // =============================================
  // ПЯТНИЦА: Итоги недели 1
  // =============================================
  {
    id: 'day_5_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПЯТНИЦА НЕДЕЛЯ 1: Итоги',
    text: 'Конец первой недели. Время подводить итоги.',
    nextId: 'd5_sara_report'
  },
  {
    id: 'd5_sara_report',
    senderId: 'analytics',
    type: 'message',
    text: 'Финальные метрики недели: Активных водителей: 2,800 (было 1,200). ETA: 7.5 мин (было 15 мин). Conversion Rate пассажиров: 62% (было 41%).',
    nextId: 'd5_dm_react',
    delay: 1000
  },
  {
    id: 'd5_dm_react',
    senderId: 'director',
    type: 'message',
    text: 'Это серьёзный разворот за неделю. Но FastRide уже объявил, что нулевую комиссию продлевают ещё на месяц. Нам нужна вторая неделя не хуже.',
    nextId: 'd5_oleg_w2_idea',
    delay: 1000
  },
  {
    id: 'd5_oleg_w2_idea',
    senderId: 'dev',
    type: 'message',
    text: 'Предлагаю на неделю 2 сфокусироваться на ML-диспетчеризации. Это снизит "простои" водителей на 30% — реальное конкурентное преимущество.',
    nextId: 'd5_alisa_w2_idea',
    delay: 800
  },
  {
    id: 'd5_alisa_w2_idea',
    senderId: 'support',
    type: 'message',
    text: 'Я бы добавила программу лояльности. Ранги для водителей — Bronze/Silver/Gold. Лучший сервис у топ-водителей, лучшие заказы им.',
    nextId: 'd5_w1_choice',
    delay: 800
  },
  {
    id: 'd5_w1_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Главный фокус Недели 2:',
    choices: [
      {
        text: 'ML-диспетчеризация: меньше простоев для водителей',
        messageText: 'Инвестируем в алгоритм. Водители зарабатывают больше без изменения тарифов.',
        nextId: 'w2_start',
        impact: { morale: -5, budget: +5 }
      },
      {
        text: 'Программа лояльности Bronze/Silver/Gold',
        messageText: 'Строим экосистему. Лучшие водители получают лучшие заказы и бонусы.',
        nextId: 'w2_start',
        impact: { morale: +10, satisfaction: +5 }
      }
    ]
  },

  // =============================================
  // НЕДЕЛЯ 2 — ПОНЕДЕЛЬНИК: Регулятор
  // =============================================
  {
    id: 'w2_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. ПОНЕДЕЛЬНИК: Регулятор',
    text: 'Начало второй недели. Пришло письмо от Министерства транспорта.',
    nextId: 'd6_regulator'
  },
  {
    id: 'd6_regulator',
    senderId: 'legal',
    type: 'message',
    text: 'Получили предписание: Минтранс требует предоставить данные о "гарантированных минимальных выплатах" для гиг-работников. У нас 14 дней на ответ.',
    nextId: 'd6_regulator_2',
    delay: 500
  },
  {
    id: 'd6_regulator_2',
    senderId: 'legal',
    type: 'message',
    text: 'Суть: они разрабатывают закон о минимальной оплате для таксистов. Хотят знать, как работает наша модель. Это может быть риском — или возможностью.',
    nextId: 'd6_dm_view',
    delay: 800
  },
  {
    id: 'd6_dm_view',
    senderId: 'director',
    type: 'message',
    text: 'Это двоякая ситуация. Если закон о минимуме примут — FastRide с нулевой комиссией не сможет работать. Их модель нежизнеспособна при минимуме $15/час.',
    nextId: 'd6_response_choice',
    delay: 1000
  },
  {
    id: 'd6_response_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Стратегия с регулятором:',
    choices: [
      {
        text: 'Активно участвовать: предложить нашу модель гарантии как отраслевой стандарт',
        messageText: 'Едем в Минтранс сами. Показываем нашу "Гарантию $15/час" как образец для закона.',
        nextId: 'd6_proactive',
        impact: { budget: -3, satisfaction: +10 }
      },
      {
        text: 'Подождать: не привлекать внимания, ответить формально',
        messageText: 'Пишем формальный ответ с данными. Не инициируем ничего лишнего.',
        nextId: 'd6_passive',
        impact: { budget: 0, satisfaction: -5 }
      }
    ]
  },
  {
    id: 'd6_proactive',
    senderId: 'legal',
    type: 'message',
    text: 'Блестящий ход. Если наша модель станет шаблоном — FastRide придётся полностью переделывать экономику. Готовлю презентацию.',
    nextId: 'w2_tue',
    delay: 1000
  },
  {
    id: 'd6_passive',
    senderId: 'director',
    type: 'message',
    text: 'Ладно. Отправим данные. Но упустили шанс формировать повестку.',
    nextId: 'w2_tue',
    delay: 1000
  },

  // =============================================
  // ВТОРНИК: A/B тест
  // =============================================
  {
    id: 'w2_tue',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. ВТОРНИК: Эксперимент',
    text: 'ML-команда Олега запустила A/B тест нового алгоритма диспетчеризации.',
    nextId: 'd7_oleg_results'
  },
  {
    id: 'd7_oleg_results',
    senderId: 'dev',
    type: 'message',
    text: 'Группа A (новый алгоритм, 30% водителей): среднее ожидание заказа 4.2 минуты вместо 9.1. Простои снизились с 38% до 21% рабочего времени.',
    nextId: 'd7_sara_ab',
    delay: 800
  },
  {
    id: 'd7_sara_ab',
    senderId: 'analytics',
    type: 'message',
    text: 'Доход водителей группы A вырос в среднем на $2.80 за смену — без изменения тарифов. Только за счёт большего числа поездок.',
    nextId: 'd7_oleg_risk',
    delay: 800
  },
  {
    id: 'd7_oleg_risk',
    senderId: 'dev',
    type: 'message',
    text: 'Но есть нюанс: новый алгоритм требует в 3 раза больше вычислительных ресурсов. Стоимость инфраструктуры вырастет на $40k/месяц.',
    nextId: 'd7_calc_task',
    delay: 800
  },
  {
    id: 'd7_calc_task',
    senderId: 'system',
    type: 'task',
    text: 'Оцените экономическую целесообразность ML-апгрейда.',
    task: {
      type: 'calculation',
      instruction: 'ML v2: инфраструктура +$40k/мес. Эффекты: (1) отток водителей снизится на 15% — сейчас уходит 200 водителей/мес, реактивация стоит $150; (2) меньше простоев — каждый из 2,800 активных водителей сделает +6 поездок/мес, маржа платформы $2.50 с поездки. Окупается ли ML v2 за месяц?',
      correctValue: 'calc_positive',
      onSuccessId: 'd7_calc_success',
      onFailId: 'd7_calc_fail',
      hint: "Retention: 200 × 15% = 30 водителей × $150 = $4,500. Загрузка: 2,800 × 6 × $2.50 = $42,000. Итого $46,500 > $40,000 — окупается, но только за счёт роста загрузки, не за счёт удержания.",
      data: {
        options: [
          { id: 'calc_negative', label: 'Нет: $4,500 экономии на CAC меньше $40k' },
          { id: 'calc_positive', label: 'Да: $4,500 (удержание) + $42,000 (загрузка) = $46,500 > $40k' },
          { id: 'calc_unknown', label: 'Слишком мало данных для решения.' }
        ]
      }
    }
  },
  {
    id: 'd7_calc_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'ROI сложного продуктового решения',
      explanation: 'Удержание: 200 × 15% = 30 водителей × $150 = $4,500/мес. Загрузка: 2,800 водителей × 6 поездок × $2.50 = $42,000/мес. Итого $46,500 против $40,000 затрат — окупается с запасом ~16%. Вывод PM: решение держится на эффекте загрузки, значит его и надо мерить в A/B (поездок на водителя в час), а не только отток. Если загрузка вырастет меньше чем на 5.1 поездки, ML v2 уйдёт в минус.',
      takeaway: 'ROI технологических инвестиций часто не линейный. Учитывайте косвенные эффекты и масштаб.',
      returnNodeId: 'd7_calc_task'
    }
  },
  {
    id: 'd7_calc_success',
    senderId: 'user',
    type: 'message',
    text: 'Считаем: 30 удержанных водителей экономят $4,500 на реактивации, а рост загрузки даёт $42,000. Итого $46,500 против $40,000 затрат — окупается, и это без учёта конкурентного эффекта. Роллируем на 100%.',
    nextId: 'd7_dm_approve',
    impact: { budget: -5, morale: +5 }
  },
  {
    id: 'd7_dm_approve',
    senderId: 'director',
    type: 'message',
    text: 'Одобрено. Это правильная инвестиция. Технология — наш ров, который FastRide не купит за деньги.',
    nextId: 'ai_taxi_start',
    delay: 1000
  },

  // =============================================
  // СРЕДА: Партнёрство
  // =============================================
  // --- ИИ-ветка (2026) ---
  {
    "id": "ai_taxi_start",
    "senderId": "investor",
    "type": "message",
    "text": "Новости: крупный игрок расширяет роботакси на два наших района, а FastRide объявил «ИИ-диспетчера». Совет спрашивает: какой у нас ответ на ИИ?",
    "nextId": "ai_taxi_analytics",
    "delay": 800
  },
  {
    "id": "ai_taxi_analytics",
    "senderId": "analytics",
    "type": "message",
    "text": "Есть быстрый вариант: персональная цена на основе модели. Мы видим историю поездок, модель телефона, заряд батареи — модель предскажет, сколько готов заплатить каждый. +12% к выручке в симуляции.",
    "nextId": "ai_taxi_choice",
    "delay": 800
  },
  {
    "id": "ai_taxi_choice",
    "senderId": "system",
    "type": "choice",
    "text": "Как используем ИИ?",
    "choices": [
      {
        "text": "Персональная цена по данным клиента — максимум выручки",
        "messageText": "Запускаем персональную цену: модель сама решает, сколько платит каждый.",
        "nextId": "ai_taxi_personal",
        "impact": {
          "budget": 10,
          "satisfaction": -20
        }
      },
      {
        "text": "ИИ-прогноз спроса: заранее направлять водителей в районы, сёрдж — прозрачный и с потолком",
        "messageText": "ИИ прогнозирует спрос на 30 минут вперёд и подсказывает водителям, куда ехать. Повышающий коэффициент виден заранее и не выше ×1.8.",
        "nextId": "ai_taxi_forecast",
        "impact": {
          "budget": 5,
          "satisfaction": 10,
          "morale": 5
        }
      },
      {
        "text": "Срочно делаем своё роботакси",
        "messageText": "Отвечаем симметрично: запускаем программу беспилотников.",
        "nextId": "ai_taxi_robo",
        "impact": {
          "budget": -25,
          "morale": -10
        }
      }
    ]
  },
  {
    "id": "ai_taxi_personal",
    "senderId": "support",
    "type": "message",
    "text": "Пользователи сравнили цены на двух телефонах — разница 40% за одну поездку. Скриншоты в соцсетях, запрос от ФАС о дискриминационном ценообразовании. Откатываем.",
    "nextId": "ai_taxi_wrap",
    "delay": 900,
    "isStressful": true
  },
  {
    "id": "ai_taxi_forecast",
    "senderId": "dev",
    "type": "message",
    "text": "Через неделю: время подачи −22%, простой водителей −18%, жалоб на сёрдж почти нет. Модель обучается на наших данных о поездках — это то, чего у конкурента нет.",
    "nextId": "ai_taxi_wrap",
    "delay": 900
  },
  {
    "id": "ai_taxi_robo",
    "senderId": "investor",
    "type": "message",
    "text": "Беспилотники — это лицензии, 3+ года и сотни миллионов. Совет урезал бюджет на маркетинг, чтобы покрыть первую оценку. Команда в замешательстве.",
    "nextId": "ai_taxi_wrap",
    "delay": 900
  },
  {
    "id": "ai_taxi_wrap",
    "senderId": "director",
    "type": "message",
    "text": "Вывод на совет: роботакси пока закрывает узкие районы. Наш ров — данные о спросе и операционка. ИИ используем там, где он помогает водителям и пассажирам, а не там, где выжимает из них деньги. С беспилотниками — будем говорить о партнёрстве, а не строить своё.",
    "nextId": "w2_wed",
    "delay": 900
  },
  {
    id: 'w2_wed',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. СРЕДА: Большая возможность',
    text: 'Неожиданный звонок из Москвы.',
    nextId: 'd8_partnership'
  },
  {
    id: 'd8_partnership',
    senderId: 'director',
    type: 'message',
    text: 'Яндекс Go предлагает интеграцию: мы даём им наш флот в моменты пиковой нагрузки, они отдают нам переполнение из своей зоны. B2B синергия.',
    nextId: 'd8_sara_view',
    delay: 800
  },
  {
    id: 'd8_sara_view',
    senderId: 'analytics',
    type: 'message',
    text: 'Моделирование показывает: это даст нашим водителям на 15% больше заказов в непиковые часы. Именно тогда, когда они стоят без работы.',
    nextId: 'd8_oleg_concern',
    delay: 800
  },
  {
    id: 'd8_oleg_concern',
    senderId: 'dev',
    type: 'message',
    text: 'Технически нужна API-интеграция. 3-4 недели работы. Плюс вопрос: у нас разные системы оценки водителей — как будем маршрутизировать?',
    nextId: 'd8_legal_concern',
    delay: 800
  },
  {
    id: 'd8_legal_concern',
    senderId: 'legal',
    type: 'message',
    text: 'Антимонопольный риск. Если Яндекс — доминант рынка в вашем городе, коллаборация может привлечь внимание ФАС.',
    nextId: 'd8_partner_choice',
    delay: 800
  },
  {
    id: 'd8_partner_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Решение по партнёрству с Яндекс:',
    choices: [
      {
        text: 'Принять: начать интеграцию',
        messageText: 'Соглашаемся. Подписываем pilot agreement на 3 месяца. Это сразу даёт нашим водителям доп. заказы.',
        nextId: 'd8_accept',
        impact: { budget: +10, morale: +10, satisfaction: +10 }
      },
      {
        text: 'Отклонить: сохранить независимость',
        messageText: 'Риски перевешивают. Оставаться независимым важнее краткосрочного роста.',
        nextId: 'd8_decline',
        impact: { budget: -5 }
      },
      {
        text: 'Встречное предложение: только exchange данных о спросе',
        messageText: 'Не полная интеграция — только обмен данными о точках спроса. Минимальный антимонопольный риск.',
        nextId: 'd8_counter',
        impact: { budget: +5, morale: +5 }
      }
    ]
  },
  {
    id: 'd8_accept',
    senderId: 'director',
    type: 'message',
    text: 'Подписали. Первые совместные поездки уже через 2 недели. Это стратегически сильный ход.',
    nextId: 'w2_thu',
    delay: 1000
  },
  {
    id: 'd8_decline',
    senderId: 'director',
    type: 'message',
    text: 'Ладно. Сохраняем независимость. Будем бороться своими силами.',
    nextId: 'w2_thu',
    delay: 1000
  },
  {
    id: 'd8_counter',
    senderId: 'director',
    type: 'message',
    text: 'Умное решение. Яндекс принял. Получаем данные без ограничений независимости.',
    nextId: 'w2_thu',
    delay: 1000
  },

  // =============================================
  // ЧЕТВЕРГ: Финальный отчёт
  // =============================================
  {
    id: 'w2_thu',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. ЧЕТВЕРГ: Финал',
    text: 'Завтра презентация совету директоров. Готовим итоговый отчёт.',
    nextId: 'd9_sara_final'
  },
  {
    id: 'd9_sara_final',
    senderId: 'analytics',
    type: 'message',
    text: 'Итоговые данные двух недель: Водители: 3,100 активных (было 1,200 в панике). ETA: 6.8 мин (цель была <8 мин). Take Rate сохранён на 22%.',
    nextId: 'd9_alisa_final',
    delay: 1000
  },
  {
    id: 'd9_alisa_final',
    senderId: 'support',
    type: 'message',
    text: 'NPS водителей вырос с 12 до 44. Это огромный сдвиг. Говорят: "наконец-то нас слышат".',
    nextId: 'd9_feature_task',
    delay: 800
  },
  {
    id: 'd9_feature_task',
    senderId: 'system',
    type: 'task',
    text: 'Выберите главное достижение для презентации совету директоров.',
    task: {
      type: 'feature_spec',
      instruction: 'Что является самым важным результатом двух недель работы?',
      correctValue: 'algo_win',
      onSuccessId: 'd9_spec_success',
      onFailId: 'd9_spec_fail',
      data: {
        tickets: [
          { id: 'algo_win', title: 'ML-диспетчеризация: устойчивое конкурентное преимущество', desc: '+30% эффективности водителей без роста тарифов. Это то, что FastRide не скопирует за деньги — нужны данные и время.', type: 'fix' },
          { id: 'supply_win', title: 'Возврат 1,900 водителей за 2 недели', desc: 'Впечатляет, но это результат денежных стимулов. Легко обратить при изменении рынка.', type: 'lazy' },
          { id: 'cost_win', title: 'Сэкономили $200k на CAC благодаря retention', desc: 'Важно, но это следствие, а не причина успеха.', type: 'lazy' },
          { id: 'partner_win', title: 'Партнёрство с Яндекс', desc: 'Хороший тактический ход, но не стратегический прорыв.', type: 'lazy' }
        ]
      }
    }
  },
  {
    id: 'd9_spec_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Что важнее для совета директоров',
      explanation: 'Совет директоров смотрит на долгосрочную устойчивость. Возврат водителей — тактика. Деньги кончатся — водители уйдут снова. ML-алгоритм создаёт структурное преимущество: чем больше поездок, тем лучше модель. Это то, что инвесторы называют "moat" — защитный ров.',
      takeaway: 'На совете директоров показывайте структурные преимущества, а не тактические победы.',
      returnNodeId: 'd9_feature_task'
    }
  },
  {
    id: 'd9_spec_success',
    senderId: 'user',
    type: 'message',
    text: 'Наш главный результат — не цифры за 2 недели, а алгоритм. Каждая новая поездка улучшает нашу модель. FastRide стартует с нуля — мы уже на 4 миллионах поездок.',
    nextId: 'd9_dm_final',
    impact: { satisfaction: +10 }
  },
  {
    id: 'd9_dm_final',
    senderId: 'director',
    type: 'message',
    text: 'Вот это я понесу завтра в совет. Ты вытащил нас из коллапса и создал стратегическое преимущество. Завтра будет хороший разговор.',
    nextId: 'w2_fri',
    delay: 1000
  },

  // =============================================
  // ПЯТНИЦА: Совет директоров
  // =============================================
  {
    id: 'w2_fri',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПЯТНИЦА: Совет директоров',
    text: 'Презентация перед советом. Зал заполнен.',
    nextId: 'd10_board_present',
    isStressful: true
  },
  {
    id: 'd10_board_present',
    senderId: 'user',
    type: 'message',
    text: 'Две недели назад у нас было 1,200 водителей и 15-минутное ETA. Сегодня: 3,100 водителей, ETA 6.8 мин, NPS +32 пункта. И это только начало.',
    nextId: 'd10_investor_q',
    impact: { satisfaction: +5 }
  },
  {
    id: 'd10_investor_q',
    senderId: 'investor',
    type: 'message',
    text: 'FastRide объявил, что продлевает нулевую комиссию ещё на 3 месяца. Ваши деньги кончатся раньше их. Почему мы не должны закрыть CityCab прямо сейчас?',
    nextId: 'd10_final_choice',
    delay: 1000,
    isStressful: true
  },
  {
    id: 'd10_final_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Ваш ответ инвестору:',
    choices: [
      {
        text: 'Алгоритм — это ров. FastRide сжигает деньги, мы строим активы.',
        messageText: 'FastRide покупает водителей деньгами — это кончится. Мы создали алгоритм: чем больше поездок, тем лучше ML, тем меньше простои, тем выгоднее водителям. Это невозможно купить за $50M.',
        nextId: 'ending_hero',
        impact: { satisfaction: +10 }
      },
      {
        text: 'Просим ещё $5M на агрессивное масштабирование',
        messageText: 'Дайте нам $5M на 6 месяцев. Мы выйдем на 8,000 водителей и сделаем FastRide нерентабельным в нашем городе.',
        nextId: 'ending_bold',
        impact: { budget: +20, satisfaction: -5 }
      }
    ]
  },

  // --- ENDINGS ---
  {
    id: 'ending_hero',
    senderId: 'director',
    type: 'ending',
    text: 'Совет одобрил. Один инвестор вышел, двое остались и добавили $2M. FastRide через 2 месяца сдался — их модель оказалась нежизнеспособной без субсидий. Ты построил не продукт — ты построил барьер для конкурентов.',
  },
  {
    id: 'ending_bold',
    senderId: 'director',
    type: 'ending',
    text: 'Дерзко. Совет выделил $3M из $5M. Ты рискнул — и это сработало. CityCab вырос до 6,000 водителей за 4 месяца. FastRide ушёл с рынка. Ты выиграл не тактику — ты выиграл войну.',
  },
  {
    id: 'ending_stable',
    senderId: 'director',
    type: 'ending',
    text: 'Систему откатили, стабильность сохранили. Но водители разочарованы обещанным и невыполненным бонусом. ETA вернулся к 11 минутам. Мы выжили, но упустили окно возможностей. Результат — ничья.',
  },
  {
    id: 'ending_bad',
    senderId: 'director',
    type: 'ending',
    text: 'Мы потеряли выходные. FastRide взял 60% рынка. Инвесторы закрыли раунд. Собирай вещи — но запомни: иногда "правильное" решение хуже, чем быстрое.',
  }
];