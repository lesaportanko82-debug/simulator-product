import { SimulationNode, GameMetrics, SimulationTask } from './simulator-scenarios';

export const DISCOVERY_SCENARIO_VERSION = 113;

// --- Characters for Discovery ---
export const DISCOVERY_CHARACTERS = {
  system: { name: "System", role: "OS", avatar: "", color: "bg-gray-100 text-gray-600" },
  user: { name: "Вы", role: "Product Manager", avatar: "", color: "bg-slate-800 text-white" },
  ceo: { name: "Марк (CEO)", role: "Founder", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  researcher: { name: "Анна (UX)", role: "Researcher", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400", color: "bg-purple-50 text-purple-900 border-purple-200" },
  tech: { name: "Ден (Tech)", role: "Lead Dev", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", color: "bg-slate-100 text-slate-800 border-slate-200" },
  sales: { name: "Кира (Sales)", role: "Head of Sales", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400", color: "bg-rose-50 text-rose-900 border-rose-200" },
  data: { name: "Олег (Analyst)", role: "Data Scientist", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", color: "bg-blue-50 text-blue-900 border-blue-200" },
  marketing: { name: "Система", role: "Platform", avatar: "", color: "bg-gray-100 text-gray-600" }
};

export const DISCOVERY_SCENARIO: SimulationNode[] = [
  // --- INTRO ---
  {
    id: 'intro',
    senderId: 'system',
    type: 'intro',
    introData: {
      company: "EdVance",
      product: "B2B Learning Platform",
      role: "Product Manager (Discovery)",
      description: "Вы пришли в EdTech стартап. Продукт продается, но им не пользуются. LTV низкий, Churn высокий. Ваша задача — провести полный цикл Discovery, найти Product-Market Fit заново или убить продукт.",
      initialMetrics: { budget: 100, morale: 70, satisfaction: 30 }
    },
    nextId: 'msg_1'
  },
  {
    id: 'msg_1',
    senderId: 'ceo',
    type: 'message',
    text: 'Привет! Ситуация критическая. Мы продали подписки 50 компаниям, но сотрудники заходят на платформу 1 раз и больше не возвращаются. Инвесторы нервничают.',
    nextId: 'msg_2'
  },
  {
    id: 'msg_2',
    senderId: 'ceo',
    type: 'message',
    text: 'Я думаю, нам нужно добавить геймификацию и AI-аватаров. Конкуренты так делают. Сколько времени займет разработка?',
    nextId: 'choice_1'
  },
  
  // --- PROBLEM 1: STAKEHOLDER MANAGEMENT ---
  {
    id: 'choice_1',
    senderId: 'system',
    type: 'choice',
    text: 'CEO предлагает решение (Solution) вместо проблемы. Ваша реакция?',
    choices: [
      {
        text: 'Взять в бэклог',
        messageText: 'Понял, Марк. Ставим геймификацию в приоритет. Оценим сроки с командой.',
        nextId: 'fail_build_trap',
        impact: { morale: +5, budget: -10 }
      },
      {
        text: 'Остановить и исследовать',
        messageText: 'Марк, AI это круто, но мы не знаем, ПОЧЕМУ они уходят. Дай мне 2 недели на Discovery, иначе мы сожжем бюджет впустую.',
        nextId: 'research_start',
        impact: { satisfaction: +10, morale: -5 }
      }
    ]
  },
  {
    id: 'fail_build_trap',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'The Build Trap',
      explanation: 'Вы согласились пилить фичи без понимания проблемы. Через 3 месяца выяснится, что геймификация раздражает взрослых людей. Вы потеряли время.',
      takeaway: 'Fall in love with the problem, not the solution.',
      returnNodeId: 'choice_1'
    }
  },

  // --- PHASE 1: DATA ANALYSIS ---
  {
    id: 'research_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЭТАП 1: Анализ данных',
    text: 'Вы получили карт-бланш на исследование. Первым делом идем к аналитику.',
    nextId: 'task_sql_intro'
  },
  {
    id: 'task_sql_intro',
    senderId: 'data',
    type: 'message',
    text: 'Я могу выгрузить что угодно. Что именно мы ищем? У нас есть таблица `user_sessions` и `course_completions`.',
    nextId: 'task_sql'
  },
  {
    id: 'task_sql',
    senderId: 'system',
    type: 'task',
    text: 'Нужно найти сегмент, который отваливается быстрее всего.',
    task: {
      type: 'sql_query',
      instruction: 'Напиши запрос, чтобы увидеть среднее время просмотра видео пользователями, которые не продлили подписку.',
      correctValue: 'correct_query',
      onSuccessId: 'sql_success',
      onFailId: 'sql_fail',
      data: [
        { id: 'wrong_1', text: 'SELECT * FROM users WHERE status = "churned"' },
        { id: 'correct_query', text: 'SELECT AVG(watch_time) FROM sessions WHERE user_id IN (SELECT id FROM churned_users)' },
        { id: 'wrong_2', text: 'DELETE FROM users WHERE watch_time < 5' }
      ]
    }
  },
  {
    id: 'sql_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Data Querying',
      explanation: 'Нам нужны агрегированные данные (AVG), чтобы увидеть паттерн, а не просто список пользователей.',
      takeaway: 'Look for patterns, not just rows.',
      returnNodeId: 'task_sql'
    }
  },
  {
    id: 'sql_success',
    senderId: 'data',
    type: 'message',
    text: 'Ого. Среднее время просмотра — 3 минуты. При том, что наши лекции длятся по 45-60 минут.',
    nextId: 'msg_insight_1'
  },
  {
    id: 'msg_insight_1',
    senderId: 'user',
    type: 'message',
    text: 'Гипотеза: Контент слишком длинный. У людей нет времени. Но нужно подтвердить это качественно.',
    nextId: 'phase_interviews'
  },

  // --- PHASE 2: CUSTDEV ---
  {
    id: 'phase_interviews',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЭТАП 2: Глубинные интервью',
    text: 'Вы назначили 5 звонков с пользователями. Готовим скрипт.',
    nextId: 'task_q_intro'
  },
  {
    id: 'task_q_intro',
    senderId: 'researcher',
    type: 'message',
    text: 'Помни про "The Mom Test". Не спрашивай про будущее и мнения. Спрашивай про прошлое.',
    nextId: 'task_question'
  },
  {
    id: 'task_question',
    senderId: 'system',
    type: 'task',
    text: 'Выберите ЛУЧШИЙ вопрос для интервью.',
    task: {
      type: 'feature_spec',
      instruction: 'Какой вопрос даст валидный инсайт?',
      correctValue: 'q_fact',
      onSuccessId: 'interview_result',
      onFailId: 'interview_fail',
      data: {
        tickets: [
          { id: 'q_fut', title: 'Вам бы понравились короткие уроки?', desc: 'Вопрос про будущее (мнение).', type: 'bad' },
          { id: 'q_pay', title: 'Сколько вы готовы платить за курсы?', desc: 'Люди врут про деньги.', type: 'bad' },
          { id: 'q_fact', title: 'Расскажите, как вы проходили последний урок?', desc: 'Вопрос про конкретный опыт в прошлом.', type: 'good' }
        ]
      }
    }
  },
  {
    id: 'interview_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Bad Question',
      explanation: 'Вы спросили про будущее. Пользователь ответил "Да, конечно!", чтобы быть вежливым. Это ложно-положительный сигнал.',
      takeaway: 'Ask about the past behavior.',
      returnNodeId: 'task_question'
    }
  },
  {
    id: 'interview_result',
    senderId: 'researcher',
    type: 'message',
    text: 'Инсайт подтвердился! Трое сказали: "Я открыл видео, увидел, что оно идет час, закрыл, потому что был на работе". Они хотят учиться "на ходу".',
    nextId: 'problem_definition'
  },

  // --- PROBLEM: DEFINITION ---
  {
    id: 'problem_definition',
    senderId: 'user',
    type: 'message',
    text: 'Проблема не в том, что контент скучный. Проблема в формате. Наш продукт не вписывается в контекст использования (рабочий день).',
    nextId: 'ai_disc_start'
  },

  // --- PHASE 3: IDEATION & PRIORITIZATION ---
  // --- ИИ-ветка (2026) ---
  {
    "id": "ai_disc_start",
    "senderId": "tech",
    "type": "message",
    "text": "Слушай, зачем нам ещё 15 интервью? Сгенерируем 500 «синтетических пользователей» в LLM, опросим их за вечер. Все так сейчас делают.",
    "nextId": "ai_disc_researcher",
    "delay": 800
  },
  {
    "id": "ai_disc_researcher",
    "senderId": "researcher",
    "type": "message",
    "text": "Синтетика пересказывает то, что модель видела в интернете. Она не знает, почему конкретно наши студенты бросают уроки. Но расшифровать и разметить реальные интервью ИИ поможет отлично.",
    "nextId": "ai_disc_choice",
    "delay": 800
  },
  {
    "id": "ai_disc_choice",
    "senderId": "system",
    "type": "choice",
    "text": "Как используем ИИ в исследовании?",
    "choices": [
      {
        "text": "Заменяем интервью синтетическими респондентами",
        "messageText": "Делаем 500 синтетических интервью вместо реальных — быстро и дёшево.",
        "nextId": "ai_disc_synth",
        "impact": {
          "satisfaction": -10,
          "budget": 5
        }
      },
      {
        "text": "ИИ расшифровывает и кластеризует реальные интервью; синтетика — только чтобы отрепетировать скрипт",
        "messageText": "Реальные интервью оставляем. ИИ делает транскрипты, ищет повторяющиеся темы с цитатами, а синтетикой только репетируем вопросы.",
        "nextId": "ai_disc_assist",
        "impact": {
          "satisfaction": 10,
          "morale": 5
        }
      },
      {
        "text": "Не используем ИИ совсем",
        "messageText": "Всё вручную, по старинке.",
        "nextId": "ai_disc_manual",
        "impact": {
          "morale": -5
        }
      }
    ]
  },
  {
    "id": "ai_disc_synth",
    "senderId": "data",
    "type": "message",
    "text": "Синтетические респонденты хором сказали, что им «не хватает геймификации» — ровно то, что хотел Марк. Реальные данные потом покажут: уходят из-за длины уроков. Две недели потеряны.",
    "nextId": "ai_disc_wrap",
    "delay": 900
  },
  {
    "id": "ai_disc_assist",
    "senderId": "researcher",
    "type": "message",
    "text": "Транскрипты и кластеры готовы за час, а не за три дня. Каждая тема подкреплена цитатами — и я проверила их вручную по записям. Главный паттерн: «смотрю в метро, урок не успеваю досмотреть».",
    "nextId": "ai_disc_wrap",
    "delay": 900
  },
  {
    "id": "ai_disc_manual",
    "senderId": "researcher",
    "type": "message",
    "text": "Сделали, но разбор занял 4 дня вместо одного. Инсайт тот же, просто позже.",
    "nextId": "ai_disc_wrap",
    "delay": 900
  },
  {
    "id": "ai_disc_wrap",
    "senderId": "data",
    "type": "message",
    "text": "Итог: ИИ ускоряет обработку данных исследования, но не заменяет источник данных — живых пользователей. Каждый вывод ИИ проверяем по исходным цитатам.",
    "nextId": "ideation_phase",
    "delay": 900
  },
  {
    id: 'ideation_phase',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЭТАП 3: Генерация решений',
    text: 'Брейншторм с командой.',
    nextId: 'msg_ideas'
  },
  {
    id: 'msg_ideas',
    senderId: 'sales',
    type: 'message',
    text: 'Может просто будем слать больше пушей с напоминаниями?',
    nextId: 'msg_ideas_2'
  },
  {
    id: 'msg_ideas_2',
    senderId: 'tech',
    type: 'message',
    text: 'Или нарежем видео нейронкой на шортсы по 3 минуты? Это сложно, но реально.',
    nextId: 'task_rice'
  },
  {
    id: 'task_rice',
    senderId: 'system',
    type: 'task',
    text: 'Посчитайте RICE Score для идеи "Micro-learning" (шортсы).',
    task: {
      type: 'calculation',
      instruction: 'Reach: 1000 (все юзеры). Impact: 3 (High). Confidence: 80% (0.8). Effort: 4 (weeks). Формула: (R * I * C) / E',
      correctValue: 'rice_600',
      onSuccessId: 'rice_success',
      onFailId: 'rice_fail',
      hint: "(1000 * 3 * 0.8) / 4 = ?",
      data: {
        options: [
          { id: 'rice_600', label: '600' },
          { id: 'rice_2400', label: '2400' },
          { id: 'rice_150', label: '150' }
        ]
      }
    }
  },
  {
    id: 'rice_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'RICE Scoring',
      explanation: 'Ошибка в расчетах. (1000 * 3 * 0.8) = 2400. Делим на Effort (4) = 600.',
      takeaway: 'RICE helps compare apples to oranges.',
      returnNodeId: 'task_rice'
    }
  },
  {
    id: 'rice_success',
    senderId: 'system',
    type: 'message',
    text: 'Score 600 — это очень высокий показатель. Это победная гипотеза.',
    nextId: 'mvp_problem'
  },

  // --- PROBLEM: MVP EXECUTION ---
  {
    id: 'mvp_problem',
    senderId: 'tech',
    type: 'message',
    text: 'Но есть проблема. Чтобы переделать плеер и нарезать контент, нам нужно 2 месяца. Бэкенд к этому не готов.',
    isStressful: true,
    nextId: 'choice_mvp'
  },
  {
    id: 'choice_mvp',
    senderId: 'system',
    type: 'choice',
    text: 'Как проверить гипотезу БЕЗ разработки?',
    choices: [
      {
        text: 'Concierge MVP',
        messageText: 'Ден, ничего не кодим. Я сам вручную нарежу 1 курс в видеоредакторе и отправлю ссылки через email-рассылку.',
        nextId: 'mvp_concierge',
        impact: { budget: 0, morale: +5 }
      },
      {
        text: 'Wizard of Oz',
        messageText: 'Сделаем лендинг "Скачай приложение с короткими уроками" и посмотрим на клики.',
        nextId: 'mvp_fake',
        impact: { budget: 0, morale: 0 }
      }
    ]
  },
  
  // --- PHASE 4: EXPERIMENT ---
  {
    id: 'mvp_concierge',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЭТАП 4: Эксперимент',
    text: 'Вы потратили выходные, нарезая видео. В понедельник ушла рассылка по сегменту "спящих" пользователей.',
    nextId: 'task_copy'
  },
  {
    id: 'mvp_fake',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЭТАП 4: Эксперимент',
    text: 'Вы запустили фейковый лендинг внутри корпоративного портала.',
    nextId: 'task_copy'
  },

  {
    id: 'task_copy',
    senderId: 'system',
    type: 'task',
    text: 'Выберите тему письма (Subject Line), которая зацепит "занятых" людей.',
    task: {
      type: 'feature_spec', // reusing selection UI
      instruction: 'Какая тема даст лучший Open Rate?',
      correctValue: 'subj_benefit',
      onSuccessId: 'metrics_analysis',
      onFailId: 'copy_fail',
      data: {
        tickets: [
          { id: 'subj_news', title: 'Новости платформы EdVance', desc: 'Скучно, игнор.', type: 'bad' },
          { id: 'subj_benefit', title: 'Выучи Excel за 5 минут (пока пьешь кофе)', desc: 'Четкая выгода + контекст (кофе).', type: 'good' },
          { id: 'subj_clickbait', title: 'СРОЧНО ОТКРОЙТЕ!', desc: 'Спам-фильтр съест это.', type: 'bad' }
        ]
      }
    }
  },
  {
    id: 'copy_fail',
    senderId: 'marketing',
    type: 'message',
    text: 'Open Rate всего 5%. Никто не открыл письмо. Эксперимент провален на входе.',
    nextId: 'task_copy'
  },

  // --- PHASE 5: ANALYSIS & PIVOT ---
  {
    id: 'metrics_analysis',
    senderId: 'data',
    type: 'message',
    text: 'Результаты пришли. Open Rate 45%. Click Rate 20%. Но самое главное — Completion Rate (досматриваемость).',
    nextId: 'task_log_ab'
  },
  {
    id: 'task_log_ab',
    senderId: 'system',
    type: 'task',
    text: 'Проанализируйте результаты эксперимента.',
    task: {
      type: 'log_analysis',
      instruction: 'Сравните старый формат и новый (по 1,200 пользователей в каждой группе, тест шёл 14 дней). Есть ли статзначимый рост?',
      correctValue: 'significant',
      onSuccessId: 'final_pitch',
      onFailId: 'analysis_fail',
      data: [
        { id: '1', time: 'Group A (Long)', method: 'Completion Rate', status: '12%', isError: true },
        { id: '2', time: 'Group B (Micro)', method: 'Completion Rate', status: '78%', statusColor: 'green' },
        { id: '3', time: 'Retention D7', method: 'Group A', status: '5%', isError: true },
        { id: '4', time: 'Retention D7', method: 'Group B', status: '35%', statusColor: 'green' },
        { id: 'sample', time: 'Sample size', method: 'A: 1,200 / B: 1,200', status: '14 дней', isError: false },
        { id: 'significant', time: 'CONCLUSION', method: 'p < 0.001 (z-тест долей)', status: 'Рост ×6, значимо', isError: false }
      ]
    }
  },
  {
    id: 'analysis_fail',
    senderId: 'system',
    type: 'message',
    text: 'Вы не видите разницы? Рост досматриваемости с 12% до 78% — это прорыв!',
    nextId: 'final_pitch'
  },

  {
    id: 'final_pitch',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ФИНАЛ: Защита стратегии',
    text: 'Вы идете к CEO с результатами.',
    nextId: 'ceo_final'
  },
  {
    id: 'ceo_final',
    senderId: 'ceo',
    type: 'message',
    text: 'Ладно, цифры впечатляют. Но как мы это назовем? Я все еще хочу слово "AI" в названии.',
    nextId: 'final_choice'
  },
  {
    id: 'final_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Финальное решение по позиционированию:',
    choices: [
      {
        text: 'Smart Micro-Learning',
        messageText: 'Назовем это "Smart Micro-Learning". Звучит умно, отражает суть, и юзерам понятно.',
        nextId: 'ending_good',
        impact: { satisfaction: +20, budget: +20 }
      },
      {
        text: 'AI Brain Implant',
        messageText: 'Назовем "AI Knowledge Boost". Пусть маркетинг радуется, главное продукт работает.',
        nextId: 'ending_compromise',
        impact: { budget: +50, satisfaction: -10 }
      }
    ]
  },

  // --- ENDINGS ---
  {
    id: 'ending_good',
    senderId: 'system',
    type: 'ending',
    text: 'Поздравляем! Вы спасли продукт. Инвесторы дали раунд B под метрики нового формата. Вы доказали, что Discovery важнее слепого копирования конкурентов.',
  },
  {
    id: 'ending_compromise',
    senderId: 'system',
    type: 'ending',
    text: 'Вы получили бюджет, но пользователи путаются, где тут AI. Впрочем, продукт работает, retention растет. Хорошая работа, продакт!',
  }
];
