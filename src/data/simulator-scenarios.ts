import { LucideIcon, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert, DollarSign, Users, Activity } from 'lucide-react';

// --- Types ---
export const SIMULATOR_VERSION = 117; // 2026: отложенные последствия, штрафы за ошибки, разбор финала
export type Character = {
  name: string;
  role: string;
  avatar: string;
  color: string;
};

export type GameMetrics = {
  budget: number; // Revenue / Resources
  morale: number; // Team Morale
  satisfaction: number; // Customer Loyalty
};

export type SimulationTask = {
  type: 'kanban_sort' | 'priority_drag' | 'code_review' | 'sql_query' | 'calculation' | 'log_analysis' | 'feature_spec';
  instruction: string;
  correctValue: string | string[];
  onSuccessId: string;
  onFailId: string;
  hint?: string;
  data?: any;
  /** Цена ошибки: применяется при каждом неверном ответе (по умолчанию −4 бюджет, −4 удовлетворённость). */
  failImpact?: Partial<GameMetrics>;
};

export type SimulationNode = {
  id: string;
  senderId: string;
  /** 'router' не показывается: при входе выбирает следующий узел по флагам (flagRoutes) или идёт в nextId. */
  type: 'message' | 'choice' | 'task' | 'ending' | 'intro' | 'day_change' | 'learning' | 'router';
  text?: string;
  introData?: {
    company: string;
    product: string;
    role: string;
    description: string;
    initialMetrics: GameMetrics;
  };
  choices?: {
    text: string;
    nextId: string;
    impact?: Partial<GameMetrics>;
    messageText?: string;
    /** Флаги решений: позже меняют ход истории (отложенные последствия). */
    setFlags?: string[];
    /** Текст карточки последствий вместо автоматического. */
    consequenceStory?: string;
  }[];
  /** Маршруты по флагам для узла 'router': первый подходящий выигрывает. */
  flagRoutes?: { flag: string; nextId: string }[];
  /** Заголовок финала. */
  endingTitle?: string;
  task?: SimulationTask;
  resource?: {
    title: string;
    type: 'article' | 'video' | 'doc';
    content: string;
  };
  learningContent?: {
    title: string;
    explanation: string;
    takeaway: string;
    returnNodeId: string;
  };
  nextId?: string;
  delay?: number;
  isStressful?: boolean;
  dayTitle?: string;
  image?: string;
  impact?: Partial<GameMetrics>;
};

// --- Characters ---
export const CHARACTERS: Record<string, Character> = {
  system: { name: "System", role: "OS", avatar: "", color: "bg-gray-100 text-gray-600" },
  user: { name: "Вы", role: "Product Manager", avatar: "", color: "bg-slate-800 text-white" },
  ceo: {
    name: "Александр (CEO)",
    role: "CEO",
    avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXR1cmUlMjBtYW4lMjBzdWl0fGVufDF8fHx8MTc2OTQ4MDAwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-emerald-50 text-emerald-900 border-emerald-200"
  },
  cto: {
    name: "Виктор (CTO)",
    role: "Tech Lead",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBnbGFzc2VzfGVufDF8fHx8MTc2OTQ4MDAxMHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-cyan-50 text-cyan-900 border-cyan-200"
  },
  marketing: {
    name: "Алина (CMO)",
    role: "Marketing Head",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwgd29tYW58ZW58MXx8fHwxNzY5NDgwMDIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-rose-50 text-rose-900 border-rose-200"
  },
  legal: {
    name: "София (Legal)",
    role: "Compliance",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFufGVufDF8fHx8MTc2OTQ4MDA0MHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-slate-200 text-slate-800 border-slate-300"
  },
  digital: {
    name: "Дмитрий (Digital)",
    role: "Head of Digital",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwgeW91bmclMjBtYW58ZW58MXx8fHwxNzY5NDgwMDgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-violet-50 text-violet-900 border-violet-200"
  },
  risk: {
    name: "Игорь (Risk)",
    role: "Risk Manager",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk0ODAxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-amber-50 text-amber-900 border-amber-200"
  },
  investor: {
    name: "Майкл (Board)",
    role: "Investor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzdWl0fGVufDF8fHx8MTc2OTQ4MDE1MHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-indigo-50 text-indigo-900 border-indigo-200"
  }
};

// ============================================================
// СЦЕНАРИЙ: GreenBank — Project NeoBlack
// 8 недель, 160+ узлов
// ============================================================

export const DAY_1_SCENARIO: SimulationNode[] = [

  // ==========================================
  // ПРОЛОГ: ПЕРВЫЙ ДЕНЬ
  // ==========================================
  {
    id: 'intro_node',
    senderId: 'system',
    type: 'intro',
    introData: {
      company: "GreenBank Financial Group",
      product: "Project NeoBlack",
      role: "Product Manager",
      description: "Вы — новый Product Manager в GreenBank. Вам доверили запуск NeoBlack — премиальной металлической карты. Прошлый PM ушёл за 3 недели до вашего прихода — никто не знает почему. У вас 8 недель, команда с амбициями и $2M бюджета. Сделайте лучший финтех-продукт страны.",
      initialMetrics: { budget: 70, morale: 60, satisfaction: 45 }
    },
    nextId: 'p0_ceo_welcome'
  },

  // --- День 0: Первый день ---
  {
    id: 'p0_ceo_welcome',
    senderId: 'ceo',
    type: 'message',
    text: 'Добро пожаловать на борт. Я Александр. Рад, что ты с нами. NeoBlack — наш самый амбициозный проект за пять лет. Расскажи мне: как ты обычно начинаешь в новом продукте?',
    nextId: 'p0_first_choice',
    delay: 1000
  },
  {
    id: 'p0_first_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как вы начинаете первый день?',
    choices: [
      {
        text: 'Читать документацию и бэклог прошлого PM',
        messageText: 'Хочу сначала разобраться в контексте. Где материалы прошлого PM?',
        nextId: 'p0_read_docs',
        impact: { satisfaction: +5 }
      },
      {
        text: 'Провести All-Hands встречу команды',
        messageText: 'Начнём с общего собрания. Хочу познакомиться со всеми и задать тон.',
        nextId: 'p0_all_hands',
        impact: { morale: +10 }
      },
      {
        text: 'Поговорить 1-на-1 с каждым лидом',
        messageText: 'Сначала личные разговоры. Хочу услышать реальное состояние без аудитории.',
        nextId: 'p0_one_on_ones',
        impact: { satisfaction: +3, morale: +3 }
      }
    ]
  },

  // --- Path A: Документация ---
  {
    id: 'p0_read_docs',
    senderId: 'cto',
    type: 'message',
    text: 'Документация? Хм. Предыдущий PM... мало что задокументировал. Есть Notion, но там каша. Нашёл кое-что интересное?',
    nextId: 'p0_docs_discovery',
    delay: 800
  },
  {
    id: 'p0_docs_discovery',
    senderId: 'user',
    type: 'message',
    text: 'Нашёл заметку с пометкой "URGENT — не показывать CEO". Там написано: "Карта прошла UAT на 60%, остальные 40% — критические user flows. Дата запуска нереалистична."',
    nextId: 'p0_crisis_reveal',
    isStressful: true
  },
  {
    id: 'p0_crisis_reveal',
    senderId: 'cto',
    type: 'message',
    text: 'Да. Именно поэтому предыдущий PM ушёл. Он не хотел сообщать плохие новости. Мы все это знали, но... молчали.',
    nextId: 'p0_crisis_choice',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'p0_crisis_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Что делать с этой информацией?',
    choices: [
      {
        text: 'Немедленно сообщить CEO',
        messageText: 'Александр, нужно поговорить. Нашёл важную информацию о статусе продукта.',
        nextId: 'p0_honest_ceo',
        impact: { satisfaction: +10, morale: -5 }
      },
      {
        text: 'Сначала разобраться самому — не паниковать',
        messageText: 'Прежде чем бить тревогу, хочу понять масштаб. Виктор, покажи мне реальный статус тестирования.',
        nextId: 'p0_investigate_first',
        impact: { satisfaction: +5, morale: +5 }
      }
    ]
  },
  {
    id: 'p0_honest_ceo',
    senderId: 'ceo',
    type: 'message',
    text: 'Значит, 40% критических flows не протестированы. Это... серьёзно. Я ценю честность. Большинство людей пытались бы это скрыть.',
    nextId: 'p0_ceo_continues',
    delay: 1000
  },
  {
    id: 'p0_ceo_continues',
    senderId: 'ceo',
    type: 'message',
    text: 'Хорошо. Давай смотреть на это как на точку А. Ты — тот, кто придёт к точке Б. Что тебе нужно?',
    nextId: 'p0_end',
    delay: 800
  },
  {
    id: 'p0_investigate_first',
    senderId: 'cto',
    type: 'message',
    text: 'Разумно. Смотри: 60% UAT — это базовый флоу карты. Критические проблемы в транзакциях выше $5,000 и в международных переводах.',
    nextId: 'p0_cto_2',
    delay: 800
  },
  {
    id: 'p0_cto_2',
    senderId: 'cto',
    type: 'message',
    text: 'Я рад, что ты разобрался сам. CEO узнает от тебя — но ты придёшь с фактами и планом, а не просто "всё плохо".',
    nextId: 'p0_end',
    delay: 800
  },

  // --- Path B: All Hands ---
  {
    id: 'p0_all_hands',
    senderId: 'user',
    type: 'message',
    text: 'Коллеги, привет! Я ваш новый PM. Хочу сразу сказать: мне интересен ваш честный взгляд на состояние продукта. Что вас больше всего беспокоит?',
    nextId: 'p0_ah_marketing',
    impact: { morale: +5 }
  },
  {
    id: 'p0_ah_marketing',
    senderId: 'marketing',
    type: 'message',
    text: 'Маркетинг уже запустил тизер-кампанию. 50,000 человек в листе ожидания. Люди ждут карту — если мы задержим релиз, это удар по репутации.',
    nextId: 'p0_ah_cto',
    delay: 800
  },
  {
    id: 'p0_ah_cto',
    senderId: 'cto',
    type: 'message',
    text: '(тихо) Продукт не готов к этому листу ожидания. Тестирование не завершено. Но говорить об этом публично...',
    nextId: 'p0_ah_legal',
    delay: 800
  },
  {
    id: 'p0_ah_legal',
    senderId: 'legal',
    type: 'message',
    text: 'Есть риски по комплаенс. Нам нужно разрешение ЦБ по нескольким пунктам. Оно может прийти через 2 недели — а может через 6.',
    nextId: 'p0_end',
    delay: 800
  },

  // --- Path C: 1-on-1 ---
  {
    id: 'p0_one_on_ones',
    senderId: 'cto',
    type: 'message',
    text: '(конфиденциально) Виктор, честно: мы не готовы к дате запуска. Тестирование на 60%. CTO, которого уволили 3 недели назад, скрывал это от CEO.',
    nextId: 'p0_oo_marketing',
    delay: 800
  },
  {
    id: 'p0_oo_marketing',
    senderId: 'marketing',
    type: 'message',
    text: 'Алина здесь. Смотри, я уже трачу медиабюджет. Если перенесём запуск — все мои вложения горят. Очень прошу: найди способ запустить в срок.',
    nextId: 'p0_oo_legal',
    delay: 800
  },
  {
    id: 'p0_oo_legal',
    senderId: 'legal',
    type: 'message',
    text: 'София. У меня хорошие новости: ЦБ прислал предварительное одобрение. Ожидаем финальное в течение 10 дней.',
    nextId: 'p0_end',
    delay: 800
  },

  // --- Общий узел после пролога ---
  {
    id: 'p0_end',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 1: Стратегия',
    text: 'Первый день позади. Ты знаешь правду о состоянии проекта. Теперь — работать.',
    nextId: 'prologue_call'
  },

  // ==========================================
  // НЕДЕЛЯ 1: DISCOVERY & STRATEGY
  // ==========================================
  {
    id: 'prologue_call',
    senderId: 'ceo',
    type: 'message',
    text: 'Хорошо. Ты освоился. NeoBlack — это не просто карта. Это заявление о том, что GreenBank играет в высшей лиге. Я рассчитываю на тебя.',
    nextId: 'prologue_call_2',
    delay: 1000
  },
  {
    id: 'prologue_call_2',
    senderId: 'ceo',
    type: 'message',
    text: 'Конкуренты выпустили свои металлические карты год назад. У них преимущество по времени — но не по качеству продукта. Это наш шанс.',
    nextId: 'w1_competitor_brief',
    delay: 800
  },
  {
    id: 'w1_competitor_brief',
    senderId: 'marketing',
    type: 'message',
    text: 'Я провела анализ конкурентов. TitanCard (от Альфа) — 4.2 звезды, жалуются на поддержку. BlackEdge (Тинькофф) — красивый, но нет мобильных платежей для iOS.',
    nextId: 'w1_competitor_2',
    delay: 1000
  },
  {
    id: 'w1_competitor_2',
    senderId: 'marketing',
    type: 'message',
    text: 'Наша opportunity: Apple Pay + Google Pay с первого дня, реальная консьерж-служба (не бот), и вес карты 18 граммов — тяжелее всех на рынке.',
    nextId: 'prologue_choice',
    delay: 800
  },
  {
    id: 'prologue_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Главный фокус первой недели:',
    choices: [
      {
        text: 'All-Hands: зарядить команду и синхронизировать видение',
        messageText: 'Собираю общую встречу. Хочу представить видение, услышать риски и создать общий контекст.',
        nextId: 'w1_all_hands',
        impact: { morale: +8 }
      },
      {
        text: '1-на-1 глубокий аудит каждого стрима',
        messageText: 'Начну с личных встреч с лидами. Нужно детально понять статус без фильтров.',
        nextId: 'w1_one_on_one',
        impact: { satisfaction: +5 }
      }
    ]
  },

  // --- All Hands path ---
  {
    id: 'w1_all_hands',
    senderId: 'user',
    type: 'message',
    text: 'Коллеги, спасибо за работу до моего прихода. У нас сильный продукт и реальный шанс изменить рынок. Расскажите мне: что мешает нам запустить NeoBlack идеально?',
    nextId: 'w1_all_hands_cto',
    impact: { morale: +3 }
  },
  {
    id: 'w1_all_hands_cto',
    senderId: 'cto',
    type: 'message',
    text: 'Честно? Технический долг. Легаси HSM-модуль не тянет пиковые нагрузки. Нужно либо рефакторинг (долго), либо облако (требует согласования ЦБ).',
    nextId: 'w1_audit_start',
    delay: 800
  },

  // --- 1-on-1 path ---
  {
    id: 'w1_one_on_one',
    senderId: 'user',
    type: 'message',
    text: 'Виктор, скажи откровенно: где самые большие риски?',
    nextId: 'w1_one_on_one_reply',
    delay: 500
  },
  {
    id: 'w1_one_on_one_reply',
    senderId: 'cto',
    type: 'message',
    text: 'HSM — Hardware Security Module для генерации CVV. Старый модуль падает под нагрузкой выше 500 операций в секунду. На старте у нас будет 2,000+.',
    nextId: 'w1_audit_start',
    delay: 800
  },

  // --- Shared: Audit Start ---
  {
    id: 'w1_audit_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 1. День 2: Финансовая модель',
    text: 'Инвестор Майкл запросил встречу по unit economics. Он смотрел ваши прогнозы.',
    nextId: 'w1_eco_alert'
  },
  {
    id: 'w1_eco_alert',
    senderId: 'investor',
    type: 'message',
    text: 'Привет. Я смотрел spreadsheet. Планируете тратить $200 на привлечение клиента, зарабатывать $150 LTV. Кто-нибудь вообще проверял эту математику?',
    nextId: 'w1_eco_alert_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'w1_eco_alert_2',
    senderId: 'investor',
    type: 'message',
    text: 'При LTV $150 и CAC $200 — каждый привлечённый клиент стоит нам $50 убытка. При плане в 100,000 клиентов это $5M в минус. Покажи мне как ты исправишь это.',
    nextId: 'w1_eco_task',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'w1_eco_task',
    senderId: 'system',
    type: 'task',
    text: 'Найдите путь к положительной Unit Economics.',
    task: {
      type: 'calculation',
      instruction: 'Сейчас: CAC=$200, LTV=$150 (подписка $10/мес × 15 мес). Два варианта: A) Поднять цену подписки до $15/мес (LTV=$225). Б) Добавить доп. услуги: страховка путешественника $5/мес (LTV=$225+$75=$300). Что даёт лучший margin при CAC=$200?',
      correctValue: 'insurance_bundle',
      onSuccessId: 'w1_eco_success',
      onFailId: 'w1_eco_fail',
      hint: "A: LTV $225, маржа $25. Б: LTV $300, маржа $100. Но страховка требует партнёрства — это дополнительный риск.",
      data: {
        options: [
          { id: 'price_hike', label: 'A) Поднять подписку до $15/мес (LTV=$225, маржа $25)' },
          { id: 'insurance_bundle', label: 'Б) Пакет со страховкой (LTV=$300, маржа $100)' },
          { id: 'cut_cac', label: 'В) Снизить CAC до $100 через органику (маржа $50)' },
          { id: 'do_nothing', label: 'Г) Оставить как есть — модель выправится со временем' }
        ]
      }
    }
  },
  {
    id: 'w1_eco_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Unit Economics: CAC vs LTV',
      explanation: 'Снизить CAC органикой звучит хорошо, но непредсказуемо. Поднять цену — простое улучшение. Страховка путешественника — лучший вариант: LTV растёт до $300, маржа $100. Страховка на оптовом рынке стоит $3-5/клиент/мес для банка, а клиент ценит её на $20+.',
      takeaway: 'Лучшая unit economics — это добавление ценности, а не снижение цены.',
      returnNodeId: 'w1_eco_task'
    }
  },
  {
    id: 'w1_eco_success',
    senderId: 'marketing',
    type: 'message',
    text: 'Страховка путешественника — это золото. Я могу это продать. "Металлическая карта + страховка для путешественников" — это premium proposition.',
    nextId: 'w1_eco_success_investor',
    delay: 800
  },
  {
    id: 'w1_eco_success_investor',
    senderId: 'investor',
    type: 'message',
    text: 'Хорошо. Маржа $100 на клиента — это уже разговор. Но мне нужен партнёр по страховке. Есть конкретное имя?',
    nextId: 'w1_day3_packaging',
    delay: 1000
  },

  {
    id: 'w1_day3_packaging',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 1. День 4: Дизайн',
    text: 'Маркетинг принёс образцы карт. Это важное решение — визуальная идентичность на годы.',
    nextId: 'w1_design_conflict'
  },
  {
    id: 'w1_design_conflict',
    senderId: 'marketing',
    type: 'message',
    text: 'Три концепта. Вариант "Stealth": полностью матовая чёрная, без номера, без имени. Только чип. Концерт в кармане.',
    nextId: 'w1_design_2',
    delay: 800
  },
  {
    id: 'w1_design_2',
    senderId: 'marketing',
    type: 'message',
    text: 'Вариант "Premium Classic": номер лазерной гравировкой на обороте, имя светло-серым. Дорого, но безопасно. Вариант "Carbon": карбоновая текстура, максимальный вес.',
    nextId: 'w1_legal_interject',
    delay: 800
  },
  {
    id: 'w1_legal_interject',
    senderId: 'legal',
    type: 'message',
    text: 'Нюанс по "Stealth": МПС (Mastercard/Visa) требуют имя держателя на карте. Без него карту не примут в ряде терминалов Европы и США.',
    nextId: 'w1_cto_interject',
    delay: 800
  },
  {
    id: 'w1_cto_interject',
    senderId: 'cto',
    type: 'message',
    text: 'Кстати, "Carbon" весит 23 грамма — самая тяжёлая карта на рынке. Это технически сложно в производстве, плюс затраты x3 к алюминию.',
    nextId: 'w1_design_choice',
    delay: 800
  },
  {
    id: 'w1_design_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Финальное решение по дизайну карты:',
    choices: [
      {
        text: '"Stealth" + имя микрошрифтом на ребре (риск МПС)',
        messageText: 'Рискуем ради дизайна. Имя на ребре — технически присутствует. Эффект WOW важнее.',
        nextId: 'w1_design_risky',
        impact: { satisfaction: +20, budget: -10 }
      },
      {
        text: '"Premium Classic" — лазерная гравировка, безопасно',
        messageText: 'Гравируем имя на обороте тёмно-серым по чёрному. Видно только под углом. Красиво и безопасно.',
        nextId: 'w1_design_safe',
        impact: { satisfaction: +8, budget: 0 }
      },
      {
        text: '"Carbon" — максимальный wow-эффект, высокий бюджет',
        messageText: 'Карбон — это дифференциация. Ни у кого нет. Платим за производство.',
        nextId: 'w1_design_carbon',
        impact: { satisfaction: +15, budget: -20 }
      }
    ]
  },
  {
    id: 'w1_design_risky',
    senderId: 'legal',
    type: 'message',
    text: 'Это смело. Я попробую защитить это перед МПС. Но готовься к вопросам от Mastercard.',
    nextId: 'w1_design_risky_2',
    delay: 800
  },
  {
    id: 'w1_design_risky_2',
    senderId: 'marketing',
    type: 'message',
    text: 'А "инсайдеры" в соцсетях уже сняли unboxing на предварительном образце. 200k просмотров за ночь. Хайп есть.',
    nextId: 'w2_start',
    delay: 800
  },
  {
    id: 'w1_design_safe',
    senderId: 'marketing',
    type: 'message',
    text: 'Отличный компромисс. Утверждаем макет. Я могу сделать ограниченную серию "Stealth Edition" позже — как reward для топ-клиентов.',
    nextId: 'w2_start',
    delay: 800
  },
  {
    id: 'w1_design_carbon',
    senderId: 'cto',
    type: 'message',
    text: 'Карбон потребует нового поставщика. Я знаю одного в Германии — но это ещё +4 недели на логистику.',
    nextId: 'w1_carbon_choice',
    delay: 800
  },
  {
    id: 'w1_carbon_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Принять задержку ради Carbon?',
    choices: [
      {
        text: 'Да — Carbon стоит 4 недель задержки',
        messageText: 'Запускаем переговоры с немецким поставщиком. Дата сдвигается.',
        nextId: 'w2_start',
        impact: { satisfaction: +5, morale: -10, budget: -15 }
      },
      {
        text: 'Нет — переходим на Premium Classic',
        messageText: 'Задержка не вариант. Идём с Premium Classic, Carbon в следующей итерации.',
        nextId: 'w2_start',
        impact: { satisfaction: -5, morale: +5 }
      }
    ]
  },

  // ==========================================
  // НЕДЕЛЯ 2: ТЕХНИЧЕСКИЙ КРИЗИС
  // ==========================================
  {
    id: 'w2_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2: Технические вызовы',
    text: 'Дизайн согласован. Нагрузочное тестирование выявило проблемы с инфраструктурой.',
    nextId: 'w2_cto_panic'
  },
  {
    id: 'w2_cto_panic',
    senderId: 'cto',
    type: 'message',
    text: 'Плохие новости. HSM модуль — аппаратный генератор ключей — не тянет пиковую нагрузку. При 2,000 операций в секунду он начинает давать timeout-ы.',
    nextId: 'w2_cto_panic_2',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'w2_cto_panic_2',
    senderId: 'cto',
    type: 'message',
    text: 'Замена физического HSM — 3 месяца плюс $500k. Это не вариант. Нужно программное решение. У меня есть два варианта, оба рискованные.',
    nextId: 'w2_tech_choice',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'w2_tech_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как масштабировать криптографию без нового железа?',
    choices: [
      {
        text: 'Облачный HSM (AWS CloudHSM)',
        messageText: 'Используем AWS CloudHSM. Масштабируемо, сертифицировано, но требует согласования с ЦБ по хранению ключей.',
        nextId: 'w2_cloud_path',
        impact: { budget: -8, satisfaction: 0 }
      },
      {
        text: 'Пре-генерация CVV (кэш-пул)',
        messageText: 'Генерируем CVV ночью в тихое время, храним в зашифрованном пуле. Дёшево, но CVV не 100% уникальные.',
        nextId: 'w2_cache_path',
        impact: { budget: 0, morale: -5 }
      },
      {
        text: 'Горизонтальное масштабирование (кластер старых HSM)',
        messageText: 'Берём 5 старых HSM и балансируем нагрузку между ними. Дорого, но надёжно.',
        nextId: 'w2_cluster_path',
        impact: { budget: -15, morale: +5 }
      }
    ]
  },
  {
    id: 'w2_cloud_path',
    senderId: 'legal',
    type: 'message',
    text: 'Облака — хорошо, но ключи шифрования не могут покидать Россию по требованию ЦБ. Нам нужен CloudHSM в российском регионе.',
    nextId: 'w2_cloud_2',
    delay: 800
  },
  {
    id: 'w2_cloud_2',
    senderId: 'cto',
    type: 'message',
    text: 'AWS есть в Москве. Я могу настроить за неделю. Стоимость: $8,000/месяц. Масштабируется автоматически.',
    nextId: 'w2_log_task_intro',
    delay: 800
  },
  {
    id: 'w2_cache_path',
    senderId: 'risk',
    type: 'message',
    text: 'Есть риск: если кэш CVV утечёт до использования — карты будут скомпрометированы. Нужна дополнительная encryption layer.',
    nextId: 'w2_cache_2',
    delay: 800
  },
  {
    id: 'w2_cache_2',
    senderId: 'cto',
    type: 'message',
    text: 'Принял. Добавим AES-256 с ротацией ключей каждые 4 часа. Это управляемо.',
    nextId: 'w2_log_task_intro',
    delay: 800
  },
  {
    id: 'w2_cluster_path',
    senderId: 'cto',
    type: 'message',
    text: 'Кластер из 5 HSM даст нам 2,500 операций/сек с запасом. Надёжно. Но $60k единоразово — ударит по бюджету.',
    nextId: 'w2_cluster_2',
    delay: 800
  },
  {
    id: 'w2_cluster_2',
    senderId: 'investor',
    type: 'message',
    text: 'Шестьдесят тысяч на железо, которое устареет через 3 года? Нет. Облако дешевле и масштабируемо.',
    nextId: 'w2_log_task_intro',
    delay: 800
  },

  {
    id: 'w2_log_task_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. День 3: Безопасность',
    text: 'Мониторинг зафиксировал подозрительную активность в ночных логах.',
    nextId: 'w2_log_task'
  },
  {
    id: 'w2_log_task',
    senderId: 'system',
    type: 'task',
    text: 'Найдите аномалию в логах API-доступа.',
    isStressful: true,
    task: {
      type: 'log_analysis',
      instruction: 'Запросы должны идти только с мобильных приложений GreenBank iOS/Android. Найдите подозрительный User-Agent — возможно, кто-то сканирует наши эндпоинты.',
      correctValue: 'bot_attack',
      onSuccessId: 'w2_log_success',
      onFailId: 'w2_log_fail',
      hint: "Обычные юзеры: iPhone/Android. Боты: python-requests, curl, Postman.",
      data: [
        { id: '1', time: '03:14:10', ip: '188.12.44.1', ua: 'GreenBank iOS/2.1.3 iPhone 14', status: 200, action: 'GET /api/balance' },
        { id: '2', time: '03:14:12', ip: '95.32.11.2', ua: 'GreenBank Android/2.0.9 Samsung S22', status: 200, action: 'POST /api/transfer' },
        { id: 'bot_attack', time: '03:14:15', ip: '45.11.22.9', ua: 'python-requests/2.28.1', status: 401, action: 'POST /api/cards/generate x200', isError: true },
        { id: '4', time: '03:14:18', ip: '178.90.11.5', ua: 'GreenBank iOS/2.1.3 iPhone 13', status: 200, action: 'GET /api/transactions' }
      ]
    }
  },
  {
    id: 'w2_log_success',
    senderId: 'risk',
    type: 'message',
    text: 'Отлично. Поймали брутфорс на /api/cards/generate. Похоже, кто-то пытался собрать данные о наших API-схемах. Блокируем IP, добавляем rate limiting.',
    nextId: 'w2_risk_2',
    delay: 800
  },
  {
    id: 'w2_risk_2',
    senderId: 'risk',
    type: 'message',
    text: 'Это мог быть конкурент или security researcher. В любом случае — хорошо, что поймали до продакшна.',
    nextId: 'w2_kanban_intro',
    delay: 800
  },
  {
    id: 'w2_log_fail',
    senderId: 'risk',
    type: 'message',
    text: 'Пропустили бота. Он собрал схему нашего API. Придётся обновлять все эндпоинты и добавлять обфускацию.',
    nextId: 'w2_kanban_intro',
    isStressful: true,
    delay: 1000
  },

  {
    id: 'w2_kanban_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. День 5: MVP Скоп',
    text: 'Бэклог на 80 задач. Нужно жёстко приоритизировать — что войдёт в первый релиз.',
    nextId: 'w2_kanban_task'
  },
  {
    id: 'w2_kanban_task',
    senderId: 'system',
    type: 'task',
    text: 'Расставьте задачи по приоритету для MVP. Capacity: 18 SP.',
    task: {
      type: 'kanban_sort',
      instruction: 'Capacity: 18 SP. Выберите задачи с максимальным impact для первого релиза.',
      correctValue: 'ignored',
      onSuccessId: 'w3_start',
      onFailId: 'w2_kanban_fail',
      data: {
        capacity: 18,
        minImpact: 25,
        tickets: [
          { id: 't1', title: 'Core Banking API', desc: 'Балансы, переводы, история транзакций. Без этого — не банк.', type: 'feature', urgency: 'critical', effort: 8, impact: 20 },
          { id: 't2', title: 'KYC & Onboarding', desc: 'Верификация клиента. Без этого нельзя открыть счёт.', type: 'feature', urgency: 'critical', effort: 5, impact: 15 },
          { id: 't3', title: 'Apple Pay / Google Pay', desc: 'Мобильные платежи — ключевое отличие от конкурентов.', type: 'feature', urgency: 'high', effort: 5, impact: 12 },
          { id: 't4', title: 'Instagram Stories', desc: 'Маркетинговые сторис внутри приложения. Красиво, но не нужно при старте.', type: 'design', urgency: 'low', effort: 4, impact: 3 },
          { id: 't5', title: 'Crypto Wallet', desc: 'Покупка криптовалюты. Хайповая фича, но не MVP.', type: 'feature', urgency: 'medium', effort: 7, impact: 6 },
          { id: 't6', title: 'Push-уведомления', desc: 'Уведомления о транзакциях. Без этого клиенты не поймут статус карты.', type: 'feature', urgency: 'high', effort: 2, impact: 8 }
        ]
      }
    }
  },
  {
    id: 'w2_kanban_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'MVP приоритизация',
      explanation: 'Core Banking (8 SP, impact 20) + KYC (5 SP, impact 15) + Push (2 SP, impact 8) = 15 SP, impact 43. Или Core + KYC + Apple Pay (5 SP, impact 12) = 18 SP, impact 47. Instagram Stories и Crypto Wallet — nice-to-have, не MVP. Без Core Banking и KYC продукт не работает.',
      takeaway: 'MVP = минимальный набор фич, без которых продукт не работает как заявлено.',
      returnNodeId: 'w2_kanban_task'
    }
  },

  // ==========================================
  // НЕДЕЛЯ 3: COMPLIANCE
  // ==========================================
  {
    id: 'w3_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 3: Регуляторный лабиринт',
    text: 'Продукт обретает форму. Теперь — самое нудное и важное: проверки.',
    nextId: 'w3_aml_task_intro'
  },
  {
    id: 'w3_aml_task_intro',
    senderId: 'risk',
    type: 'message',
    text: 'Нам нужно настроить правила AML — Anti-Money Laundering. Это не опционально, это ФЗ-115. Без этого ЦБ не даст лицензию на операции.',
    nextId: 'w3_aml_2',
    delay: 800
  },
  {
    id: 'w3_aml_2',
    senderId: 'legal',
    type: 'message',
    text: 'Конкретно: нам нужно блокировать транзакции в санкционные страны и автоматически флаговать операции выше $10,000 для ручной проверки.',
    nextId: 'w3_aml_task',
    delay: 800
  },
  {
    id: 'w3_aml_task',
    senderId: 'system',
    type: 'task',
    text: 'Напишите SQL-правило для блокировки транзакций в санкционные страны.',
    task: {
      type: 'sql_query',
      instruction: 'Нужно: обновить статус транзакций на "blocked", если страна получателя находится в чёрном списке. Данные из таблицы blacklist.',
      correctValue: 'correct_sql',
      onSuccessId: 'w3_legal_tos',
      onFailId: 'w3_sql_fail',
      data: [
        { id: 'correct_sql', text: 'UPDATE transactions SET status="blocked", blocked_reason="AML_SANCTION" WHERE recipient_country IN (SELECT country_code FROM blacklist WHERE active=true)' },
        { id: 'wrong_1', text: 'DELETE FROM transactions WHERE recipient_country = "IR"' },
        { id: 'wrong_2', text: 'SELECT * FROM transactions JOIN blacklist ON country' },
        { id: 'wrong_3', text: 'INSERT INTO blocked_log SELECT * FROM transactions WHERE country IN blacklist' }
      ]
    }
  },
  {
    id: 'w3_sql_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'SQL в банковских системах',
      explanation: 'В банке нельзя удалять данные (DELETE) — это нарушение регуляторных требований и потеря доказательной базы. Правильно: UPDATE статус. Также важно добавлять blocked_reason для аудита. SELECT INTO blocked_log не меняет статус оригинала.',
      takeaway: 'В финансовых системах данные никогда не удаляются — только помечаются.',
      returnNodeId: 'w3_aml_task'
    }
  },

  {
    id: 'w3_legal_tos',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 3. День 2: KYC и онбординг',
    text: 'Юридическая команда готова к следующей задаче: оформление онбординга.',
    nextId: 'w3_kyc_intro'
  },
  {
    id: 'w3_kyc_intro',
    senderId: 'legal',
    type: 'message',
    text: 'KYC — Know Your Customer — это верификация личности. По закону банк должен убедиться, что клиент — это клиент. Нужно решить: как собирать документы.',
    nextId: 'w3_tos_conflict',
    delay: 800
  },
  {
    id: 'w3_tos_conflict',
    senderId: 'marketing',
    type: 'message',
    text: 'Текущая схема: 4 шага, каждый шаг — загрузка фото. Конверсия в тесте: 31%. Это катастрофа. Половина пользователей уходит на шаге "сфотографируйте паспорт".',
    nextId: 'w3_tos_conflict_2',
    delay: 800
  },
  {
    id: 'w3_tos_conflict_2',
    senderId: 'cto',
    type: 'message',
    text: 'Я смотрел на решения других: можно интегрировать сторонний KYC-провайдер (SUMSUB, Onfido). Они делают это красиво — 2 минуты, видеосэлфи, распознавание паспорта автоматом.',
    nextId: 'w3_tos_choice',
    delay: 800
  },
  {
    id: 'w3_tos_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как организовать KYC?',
    choices: [
      {
        text: 'Свой KYC — четыре шага с загрузкой фото',
        messageText: 'Остаёмся на своём решении. Дешевле, но конверсия ниже.',
        nextId: 'w3_hard_tos',
        impact: { satisfaction: -15, budget: +5 }
      },
      {
        text: 'Сторонний провайдер SUMSUB ($3/верификация)',
        messageText: 'Интегрируем SUMSUB. $3 за клиента, но конверсия вырастет с 31% до 70%+.',
        nextId: 'w3_simple_tos',
        impact: { satisfaction: +15, budget: -8 }
      },
      {
        text: 'Гибрид: SUMSUB для новых, свой — для возвратных',
        messageText: 'Новые клиенты идут через SUMSUB, клиенты с историей — через наш быстрый флоу.',
        nextId: 'w3_hybrid_tos',
        impact: { satisfaction: +10, budget: -5 }
      }
    ]
  },
  {
    id: 'w3_simple_tos',
    senderId: 'marketing',
    type: 'message',
    text: 'SUMSUB даёт конверсию 73% в их бенчмарках. При нашем плане 100,000 клиентов — это 42,000 дополнительных активаций vs нашего KYC. Окупается за 2 недели.',
    nextId: 'w4_start',
    delay: 800
  },
  {
    id: 'w3_hard_tos',
    senderId: 'marketing',
    type: 'message',
    text: 'Ладно. Но я хочу A/B тест: 50% — наш KYC, 50% — SUMSUB. Потратим $15k на тест, сэкономим потом миллионы.',
    nextId: 'w4_start',
    delay: 800
  },
  {
    id: 'w3_hybrid_tos',
    senderId: 'cto',
    type: 'message',
    text: 'Хитро. Гибрид даёт нам данные по обоим подходам. Я могу сделать A/B флаги на уровне инфраструктуры.',
    nextId: 'w4_start',
    delay: 800
  },

  // ==========================================
  // НЕДЕЛЯ 4: ФИНИШНАЯ ПРЯМАЯ
  // ==========================================
  {
    id: 'w4_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 4: Финишная прямая',
    text: 'До запуска осталось 4 недели. App Store review и финальные тесты.',
    nextId: 'w4_apple_reject'
  },
  {
    id: 'w4_apple_reject',
    senderId: 'digital',
    type: 'message',
    text: 'Проблема. Apple отклонил наш app. Причина: "иконка слишком похожа на системную иконку Wallet". Дают 3 дня на исправление.',
    nextId: 'w4_apple_reject_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'w4_apple_reject_2',
    senderId: 'digital',
    type: 'message',
    text: 'Плюс в бинарном ревью нашли: мы читаем clipboard без явного разрешения. Это нарушение App Store Guidelines 5.1.1.',
    nextId: 'w4_icon_choice',
    isStressful: true,
    delay: 800
  },
  {
    id: 'w4_icon_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как реагировать на отказ Apple?',
    choices: [
      {
        text: 'Апелляция: у нас права на бренд',
        messageText: 'Подаём апелляцию. У нас зарегистрированный товарный знак. Будем доказывать.',
        nextId: 'w4_appeal_path',
        impact: { satisfaction: +5, budget: 0 }
      },
      {
        text: 'Быстрый редизайн иконки за 48 часов',
        messageText: 'Не тратим время на апелляцию. Меняем иконку сегодня же.',
        nextId: 'w4_redesign_path',
        impact: { satisfaction: -5, morale: -5 }
      },
      {
        text: 'Исправить clipboard + апелляция по иконке',
        messageText: 'Разделяем задачи: быстро фиксим clipboard (это точно нарушение), по иконке — апелляция.',
        nextId: 'w4_smart_path',
        impact: { satisfaction: +5, morale: +5 }
      }
    ]
  },
  {
    id: 'w4_appeal_path',
    senderId: 'ceo',
    type: 'message',
    text: 'Рискованно. Апелляция занимает 7 дней. Если проиграем — потеряем 10 дней вместо 2.',
    nextId: 'w4_last_bug',
    delay: 1000
  },
  {
    id: 'w4_redesign_path',
    senderId: 'marketing',
    type: 'message',
    text: 'Новая иконка хуже первой, честно. Но мы прошли ревью за 36 часов.',
    nextId: 'w4_last_bug',
    delay: 1000
  },
  {
    id: 'w4_smart_path',
    senderId: 'digital',
    type: 'message',
    text: 'Апелляция по иконке одобрена. Apple нашёл наш trademark и согласился, что иконки разные. Clipboard пофиксили — обновление принято.',
    nextId: 'w4_last_bug',
    delay: 1000
  },

  {
    id: 'w4_last_bug',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 4. День 5: Последний баг',
    text: 'Завтра ночью релиз. QA нашёл критическую ошибку.',
    nextId: 'w4_critical_bug'
  },
  {
    id: 'w4_critical_bug',
    senderId: 'cto',
    type: 'message',
    text: 'Если баланс аккаунта равен 0, приложение падает с NullPointerException. Это происходит при первом входе нового клиента — у них всегда 0 на старте.',
    nextId: 'w4_critical_bug_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'w4_critical_bug_2',
    senderId: 'cto',
    type: 'message',
    text: 'Проблема в типизации: код проверяет `balance == null`, но 0 это не null. Нужна правильная проверка типа.',
    nextId: 'w4_spec_task',
    delay: 800
  },
  {
    id: 'w4_spec_task',
    senderId: 'system',
    type: 'task',
    text: 'Выберите правильный способ проверки баланса.',
    task: {
      type: 'feature_spec',
      instruction: 'Как правильно проверить, что баланс является корректным числом (в том числе 0)?',
      correctValue: 't2',
      onSuccessId: 'w4_launch_moment',
      onFailId: 'w4_launch_moment_buggy',
      data: {
        tickets: [
          { id: 't1', title: 'if (balance == null)', desc: 'Не поймает 0 — ошибка останется. NullPointerException при balance=0.', type: 'bug' },
          { id: 't2', title: 'if (typeof balance !== "number" || isNaN(balance))', desc: 'Правильная проверка типа. Поймает null, undefined, NaN и нечисловые значения.', type: 'fix' },
          { id: 't3', title: 'try { render(balance) } catch(e) { render(0) }', desc: 'Работает, но скрывает ошибку. Плохая практика для финансового приложения.', type: 'lazy' },
          { id: 't4', title: 'if (!balance)', desc: 'Не работает: !0 === true, то есть 0 тоже попадёт в блок ошибки.', type: 'bug' }
        ]
      }
    }
  },

  {
    id: 'w4_launch_moment',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ДЕНЬ X: МЯГКИЙ ЗАПУСК',
    text: 'Ночью — релиз для 5,000 VIP-клиентов из листа ожидания. Soft launch.',
    nextId: 'w4_first_reviews'
  },
  {
    id: 'w4_launch_moment_buggy',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ДЕНЬ X: ЗАПУСК С ПРОБЛЕМАМИ',
    text: 'Релиз состоялся. Но каждый новый пользователь видит ошибку при первом входе.',
    nextId: 'w4_first_reviews_bad'
  },

  {
    id: 'w4_first_reviews',
    senderId: 'marketing',
    type: 'message',
    text: '4.7 звёзды за первые 6 часов! 3,200 скачиваний без единой рекламы — только waitlist. Люди рекомендуют друзьям.',
    nextId: 'w4_vip_feedback',
    delay: 800
  },
  {
    id: 'w4_vip_feedback',
    senderId: 'digital',
    type: 'message',
    text: 'VIP-сегмент активен. Средний чек первой транзакции — $340. Карту уже использовали в ресторанах, Apple Pay работает.',
    nextId: 'w5_start',
    delay: 800
  },
  {
    id: 'w4_first_reviews_bad',
    senderId: 'marketing',
    type: 'message',
    text: 'Рейтинг 1.8 звезды. Каждый второй отзыв: "Не могу войти, приложение падает". TechCrunch написал заметку.',
    nextId: 'w4_bad_hotfix',
    isStressful: true,
    delay: 800
  },
  {
    id: 'w4_bad_hotfix',
    senderId: 'cto',
    type: 'message',
    text: 'Выкатываю hotfix прямо сейчас. Apple fast-track для критических багов — 4 часа. Держитесь.',
    nextId: 'w5_start',
    isStressful: true,
    delay: 1000
  },

  // ==========================================
  // НЕДЕЛЯ 5: МЯГКИЙ ЗАПУСК — ШТОРМ
  // ==========================================
  {
    id: 'w5_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 5: Жизнь после запуска',
    text: 'Мягкий запуск позади. Реальные клиенты — реальные проблемы.',
    nextId: 'w5_feedback_flood'
  },
  {
    id: 'w5_feedback_flood',
    senderId: 'marketing',
    type: 'message',
    text: 'За первые 48 часов: 12,000 установок, 847 отзывов. Главный запрос: "Где тёмная тема?" (312 раз) и "Когда Android?" (198 раз).',
    nextId: 'w5_cto_infra',
    delay: 1000
  },
  {
    id: 'w5_cto_infra',
    senderId: 'cto',
    type: 'message',
    text: 'Серверная нагрузка: 340 RPS при расчётных 200. Держимся, но с запасом 20%. Если это число удвоится при полном запуске — начнутся проблемы.',
    nextId: 'w5_risk_alert',
    delay: 800
  },
  {
    id: 'w5_risk_alert',
    senderId: 'risk',
    type: 'message',
    text: 'Зафиксировали попытку card enumeration — кто-то перебирает номера карт через API. Предположительно финтех-стартап ищет нашу схему нумерации.',
    nextId: 'w5_triage_choice',
    delay: 800,
    isStressful: true
  },
  {
    id: 'w5_triage_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Триаж проблем первой недели — на что фокусироваться?',
    choices: [
      {
        text: 'Безопасность: закрыть card enumeration',
        messageText: 'Сначала безопасность. Пока не закроем дыру — рисковать нельзя.',
        nextId: 'w5_security_focus',
        impact: { budget: +5, satisfaction: -3 }
      },
      {
        text: 'Scale: расширить инфраструктуру до полного запуска',
        messageText: 'Если сервер ляжет при полном запуске — будет катастрофа. Масштабируемся сейчас.',
        nextId: 'w5_scale_focus',
        impact: { budget: -8, morale: -5 }
      },
      {
        text: 'UX: тёмная тема и первые фичи по запросам',
        messageText: 'Клиенты ждут. Дадим им быстрые победы — покажем, что слышим.',
        nextId: 'w5_ux_focus',
        impact: { satisfaction: +15, morale: +10 }
      }
    ]
  },
  {
    id: 'w5_security_focus',
    senderId: 'risk',
    type: 'message',
    text: 'Правильное решение. Добавили CAPTCHA, rate limiting по IP и tokenization карточных номеров. Card enumeration закрыт.',
    nextId: 'w5_log_task',
    delay: 800
  },
  {
    id: 'w5_scale_focus',
    senderId: 'cto',
    type: 'message',
    text: 'Добавили 8 серверных инстансов. Теперь можем держать 2,000 RPS. К полному запуску готовы.',
    nextId: 'w5_log_task',
    delay: 800
  },
  {
    id: 'w5_ux_focus',
    senderId: 'marketing',
    type: 'message',
    text: 'Тёмная тема вышла за 3 дня. В App Store появились отзывы: "Наконец-то команда слышит пользователей!" Рейтинг вырос с 4.1 до 4.6.',
    nextId: 'w5_log_task',
    delay: 800
  },

  {
    id: 'w5_log_task',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 5. День 3: Инцидент с платежами',
    text: 'Мониторинг зафиксировал: 3% транзакций выше $1,000 завершаются с ошибкой.',
    nextId: 'w5_log_analysis_task',
    isStressful: true
  },
  {
    id: 'w5_log_analysis_task',
    senderId: 'system',
    type: 'task',
    text: 'Найдите причину ошибок в высоких транзакциях.',
    isStressful: true,
    task: {
      type: 'log_analysis',
      instruction: 'Найдите паттерн в логах — почему транзакции выше $1,000 падают. Обратите внимание на коды ошибок и временны́е метки.',
      correctValue: 'timeout_error',
      onSuccessId: 'w5_log_success',
      onFailId: 'w5_log_fail',
      hint: "Ошибки в конкретный интервал времени могут указывать на timeout внешнего сервиса.",
      data: [
        { id: '1', time: '14:02:11', ip: '192.168.1.5', ua: 'GreenBank iOS/2.1.3', status: 200, action: 'PAYMENT $250 → OK, resp_time: 180ms' },
        { id: '2', time: '14:02:44', ip: '192.168.1.9', ua: 'GreenBank Android/2.0.9', status: 200, action: 'PAYMENT $500 → OK, resp_time: 220ms' },
        { id: 'timeout_error', time: '14:03:01', ip: '192.168.1.12', ua: 'GreenBank iOS/2.1.3', status: 504, action: 'PAYMENT $1500 → AML_CHECK timeout after 5000ms', isError: true },
        { id: '4', time: '14:03:12', ip: '192.168.1.7', ua: 'GreenBank iOS/2.1.3', status: 200, action: 'PAYMENT $300 → OK, resp_time: 190ms' }
      ]
    }
  },
  {
    id: 'w5_log_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Анализ платёжных логов',
      explanation: 'Ключевой признак: status 504 (Gateway Timeout) + "AML_CHECK timeout after 5000ms". Транзакции выше $1,000 автоматически проходят AML-проверку. AML-сервис не успевает ответить за 5 секунд — это его лимит. Нужно либо увеличить timeout, либо оптимизировать AML.',
      takeaway: '504 = внешний сервис не ответил вовремя. Ищите зависимость от третьей стороны.',
      returnNodeId: 'w5_log_analysis_task'
    }
  },
  {
    id: 'w5_log_success',
    senderId: 'user',
    type: 'message',
    text: 'Нашли: AML-проверка для крупных транзакций работает синхронно и истекает по таймауту. Нужно или асинхронизировать проверку, или оптимизировать AML-сервис.',
    nextId: 'w5_fix_choice',
    impact: { budget: +5 }
  },
  {
    id: 'w5_fix_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как исправить AML timeout?',
    choices: [
      {
        text: 'Риск-ориентированно: санкционный скрининг синхронно по кэшу, мониторинг — асинхронно',
        messageText: 'Делим проверку: санкционный скрининг — до списания, по локальному кэшу списков (<200 мс). Поведенческий мониторинг и ML-скоринг — асинхронно, подозрительные суммы ставим на холд.',
        nextId: 'w5_riskbased_fix',
        impact: { satisfaction: +10, budget: -5 }
      },
      {
        text: 'Асинхронный AML — транзакция проходит, проверка после',
        messageText: 'Делаем AML асинхронным: транзакция идёт, проверка следом. Если нарушение — откатим.',
        nextId: 'w5_async_fix',
        impact: { satisfaction: +5, budget: -15, morale: -5 }
      },
      {
        text: 'Увеличить timeout AML до 15 секунд',
        messageText: 'Простое решение: даём AML больше времени. Транзакция подождёт.',
        nextId: 'w5_timeout_fix',
        impact: { satisfaction: -5, budget: 0 }
      }
    ]
  },
  {
    id: 'w5_riskbased_fix',
    senderId: 'legal',
    type: 'message',
    text: 'Правильно: санкционная проверка до списания обязательна, а остальной мониторинг может идти после — так делают все крупные банки. Зафиксируем в политике и покажем ЦБ.',
    nextId: 'w5_week_results',
    delay: 800
  },
  {
    id: 'w5_async_fix',
    senderId: 'legal',
    type: 'message',
    text: 'Стоп. Деньги, ушедшие в санкционную юрисдикцию, не «откатишь» — это прямое нарушение 115-ФЗ и риск отзыва лицензии. Асинхронным может быть только мониторинг, но не санкционный скрининг. Переделываем, а это ещё неделя работы.',
    nextId: 'w5_week_results',
    delay: 800
  },
  {
    id: 'w5_timeout_fix',
    senderId: 'cto',
    type: 'message',
    text: 'Работает, но UX плохой: клиент ждёт 15 секунд с крутилкой. Это терпимо краткосрочно, но нужно решить фундаментально.',
    nextId: 'w5_week_results',
    delay: 800
  },
  {
    id: 'w5_week_results',
    senderId: 'digital',
    type: 'message',
    text: 'Недельный итог: 28,000 активных пользователей, NPS 67, средний чек $285, retention Day-7 = 61%. Это сильные цифры для soft launch.',
    nextId: 'ai_fin_start',
    delay: 1000
  },

  // ==========================================
  // НЕДЕЛЯ 6: РОСТ И ПАРТНЁРСТВА
  // ==========================================
  // --- ИИ-ветка (2026) ---
  {
    "id": "ai_fin_start",
    "senderId": "system",
    "type": "day_change",
    "dayTitle": "НЕДЕЛЯ 5½: ИИ в поддержке",
    "text": "После soft launch поддержка не справляется. Пора решать, как использовать ИИ.",
    "nextId": "ai_fin_support"
  },
  {
    "id": "ai_fin_support",
    "senderId": "digital",
    "type": "message",
    "text": "4,200 обращений в день, очередь в чате — 6 часов, CSAT поддержки упал до 3.1. Александр хочет «ИИ-агента как у всех» до конца месяца.",
    "nextId": "ai_fin_cto",
    "delay": 800
  },
  {
    "id": "ai_fin_cto",
    "senderId": "cto",
    "type": "message",
    "text": "Агента на LLM поднимем за две недели. Но сначала посчитай экономику и реши, что ему разрешено делать. Модель ошибается, а у нас деньги клиентов.",
    "nextId": "ai_fin_calc",
    "delay": 800
  },
  {
    "id": "ai_fin_calc",
    "senderId": "system",
    "type": "task",
    "text": "Посчитайте стоимость обращения с ИИ-агентом.",
    "task": {
      "type": "calculation",
      "instruction": "Оператор: $2.40 за обращение. ИИ-агент: инференс $0.18 за диалог + $0.05 на автоматическую проверку качества (evals). Агент решает 60% обращений сам, 40% уходят оператору (+$2.40). Сколько в среднем стоит одно обращение с агентом?",
      "correctValue": "ai_119",
      "onSuccessId": "ai_fin_calc_ok",
      "onFailId": "ai_fin_calc_fail",
      "hint": "Каждый диалог проходит через агента ($0.23), а 40% ещё и через оператора: 0.4 × $2.40.",
      "data": {
        "options": [
          {
            "id": "ai_023",
            "label": "$0.23 — только инференс и проверка"
          },
          {
            "id": "ai_119",
            "label": "$1.19 — с учётом эскалаций на оператора"
          },
          {
            "id": "ai_144",
            "label": "$1.44 — 60% от стоимости оператора"
          },
          {
            "id": "ai_263",
            "label": "$2.63 — дороже оператора"
          }
        ]
      }
    }
  },
  {
    "id": "ai_fin_calc_fail",
    "senderId": "system",
    "type": "learning",
    "learningContent": {
      "title": "Юнит-экономика ИИ-агента",
      "explanation": "Агент участвует в каждом диалоге: $0.18 + $0.05 = $0.23. Но 40% диалогов он не решает, и они доходят до оператора: 0.4 × $2.40 = $0.96. Итого $0.23 + $0.96 = $1.19 — экономия 50%, а не 90%, как обещают продавцы ИИ.",
      "takeaway": "Считайте стоимость ИИ с эскалациями и контролем качества. Главный рычаг экономии — доля решённых без человека, а не цена токенов.",
      "returnNodeId": "ai_fin_calc"
    }
  },
  {
    "id": "ai_fin_calc_ok",
    "senderId": "user",
    "type": "message",
    "text": "$1.19 против $2.40 — экономия 50%. Каждые +10 п.п. к доле решённых агентом дают ещё −$0.24. Значит, мерить будем долю решённых без человека и CSAT, а не «количество диалогов с ботом».",
    "nextId": "ai_fin_choice",
    "impact": {
      "budget": 5
    }
  },
  {
    "id": "ai_fin_choice",
    "senderId": "system",
    "type": "choice",
    "text": "Что разрешаем ИИ-агенту?",
    "choices": [
      {
        "text": "Ответы, статусы и подсказки; любые операции с деньгами и картой — только с подтверждением клиента в приложении или через оператора",
        "messageText": "Агент отвечает и готовит действие, но деньги и блокировки — только с подтверждением клиента или человеком. Все диалоги логируем, качество проверяем ежедневно на выборке.",
        "nextId": "ai_fin_safe",
        "impact": {
          "satisfaction": 10,
          "budget": 5
        }
      },
      {
        "text": "Полная автономия: агент сам делает возвраты и разблокирует карты",
        "messageText": "Даём агенту полный доступ к операциям — так быстрее всего.",
        "nextId": "ai_fin_unsafe",
        "impact": {
          "satisfaction": 5,
          "budget": -20,
          "morale": -5
        }
      },
      {
        "text": "Без ИИ: нанимаем ещё 40 операторов",
        "messageText": "ИИ — рискованно. Нанимаем людей.",
        "nextId": "ai_fin_noai",
        "impact": {
          "budget": -15,
          "morale": 5
        }
      }
    ]
  },
  {
    "id": "ai_fin_safe",
    "senderId": "risk",
    "type": "message",
    "text": "Через две недели: агент закрывает 58% обращений, очередь — 4 минуты, CSAT 4.4. Были 3 попытки «уговорить» агента разблокировать чужую карту — все упёрлись в подтверждение в приложении.",
    "nextId": "ai_fin_wrap",
    "delay": 900
  },
  {
    "id": "ai_fin_unsafe",
    "senderId": "risk",
    "type": "message",
    "text": "Инцидент: мошенники через prompt injection в чате убедили агента разблокировать 17 украденных карт. Списано $41,000, пишем объяснение в ЦБ. Агента откатываем до режима «только ответы».",
    "nextId": "ai_fin_wrap",
    "delay": 900,
    "isStressful": true
  },
  {
    "id": "ai_fin_noai",
    "senderId": "digital",
    "type": "message",
    "text": "Наняли, но обучение операторов заняло 5 недель. Конкуренты с ИИ-поддержкой отвечают за минуты, у нас по-прежнему час. Фонд оплаты труда вырос на 30%.",
    "nextId": "ai_fin_wrap",
    "delay": 900
  },
  {
    "id": "ai_fin_wrap",
    "senderId": "legal",
    "type": "message",
    "text": "На будущее: для ИИ в финтехе — человек в контуре для операций с деньгами, журнал решений модели, понятное клиенту указание, что он общается с ИИ, и персональные данные только в рамках 152-ФЗ. А если пойдём в Европу — ещё и требования EU AI Act.",
    "nextId": "w6_start",
    "delay": 900
  },
  {
    id: 'w6_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 6: Рост',
    text: 'Soft launch закончился. Время полного запуска и роста.',
    nextId: 'w6_influencer'
  },
  {
    id: 'w6_influencer',
    senderId: 'marketing',
    type: 'message',
    text: 'Influencer-предложение: Блогер с 2.3M подписчиков хочет сделать обзор NeoBlack. Запрашивает эксклюзивность на 2 недели — $50k и 1,000 free-карт для giveaway.',
    nextId: 'w6_influencer_2',
    delay: 800
  },
  {
    id: 'w6_influencer_2',
    senderId: 'marketing',
    type: 'message',
    text: 'По нашей модели: если конверсия от обзора хотя бы 1% — это 23,000 новых клиентов. При CAC $200 от обычных каналов — это $4.6M ценности за $50k.',
    nextId: 'w6_cto_concern',
    delay: 800
  },
  {
    id: 'w6_cto_concern',
    senderId: 'cto',
    type: 'message',
    text: 'Риск: если мы не готовы к 23,000 новым регистрациям за 48 часов — сервер ляжет. Нужно предварительно масштабироваться.',
    nextId: 'w6_influencer_choice',
    delay: 800
  },
  {
    id: 'w6_influencer_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Решение по influencer-партнёрству:',
    choices: [
      {
        text: 'Принять: $50k + 1,000 карт',
        messageText: 'Берём. Масштабируем инфраструктуру перед публикацией. ROI очевиден.',
        nextId: 'w6_influencer_accept',
        impact: { budget: -8, satisfaction: +20 }
      },
      {
        text: 'Торговаться: $25k + 500 карт без эксклюзива',
        messageText: 'Предлагаем $25k и 500 карт, но снимаем эксклюзивность.',
        nextId: 'w6_influencer_negotiate',
        impact: { budget: -3, satisfaction: +10 }
      },
      {
        text: 'Отказать: органический рост важнее',
        messageText: 'Не платим за охват. Пусть рост будет органическим и качественным.',
        nextId: 'w6_influencer_decline',
        impact: { budget: +5, satisfaction: -5 }
      }
    ]
  },
  {
    id: 'w6_influencer_accept',
    senderId: 'marketing',
    type: 'message',
    text: 'Видео вышло. 4.8M просмотров за 24 часа. 18,000 новых регистраций. Сервер держится — хорошо масштабировались.',
    nextId: 'w6_apple_pay_news',
    delay: 1000
  },
  {
    id: 'w6_influencer_negotiate',
    senderId: 'marketing',
    type: 'message',
    text: 'Блогер согласился. 4.1M просмотров, 12,000 регистраций. Немного меньше без эксклюзива, но ROI всё равно 40x.',
    nextId: 'w6_apple_pay_news',
    delay: 1000
  },
  {
    id: 'w6_influencer_decline',
    senderId: 'marketing',
    type: 'message',
    text: 'Оk. Блогер написал обзор бесплатно — карта его так впечатлила. 1.2M просмотров органически.',
    nextId: 'w6_apple_pay_news',
    delay: 1000
  },

  {
    id: 'w6_apple_pay_news',
    senderId: 'cto',
    type: 'message',
    text: 'Интеграция Apple Pay работает. Google Pay — следующий спринт. Но есть кое-что интересное: Samsung Pay запросил партнёрство напрямую.',
    nextId: 'w6_kanban_intro',
    delay: 800
  },
  {
    id: 'w6_kanban_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 6. День 4: Roadmap на Q2',
    text: 'Команда просит чёткость по roadmap. Бэклог снова разбух.',
    nextId: 'w6_kanban_task'
  },
  {
    id: 'w6_kanban_task',
    senderId: 'system',
    type: 'task',
    text: 'Расставьте приоритеты Q2. Capacity: 20 Story Points.',
    task: {
      type: 'kanban_sort',
      instruction: 'Q2 capacity: 20 SP. Что даст максимальный рост активации и retention?',
      correctValue: 'ignored',
      onSuccessId: 'w7_start',
      onFailId: 'w6_kanban_fail',
      data: {
        capacity: 20,
        minImpact: 30,
        tickets: [
          { id: 't1', title: 'Google Pay', desc: 'Android-пользователи ждут. 40% нашей аудитории — Android.', type: 'feature', urgency: 'critical', effort: 6, impact: 18 },
          { id: 't2', title: 'Реферальная программа', desc: '"Пригласи друга — оба получат $10". Лучший CAC-снизитель.', type: 'feature', urgency: 'high', effort: 4, impact: 14 },
          { id: 't3', title: 'Уведомления о тратах', desc: 'Персональная аналитика расходов. Retention-фича.', type: 'feature', urgency: 'high', effort: 3, impact: 10 },
          { id: 't4', title: 'Crypto Trading', desc: 'Популярно, но сложно технически и по комплаенсу.', type: 'feature', urgency: 'medium', effort: 9, impact: 8 },
          { id: 't5', title: 'Concierge чат', desc: '24/7 поддержка в приложении. Дифференциатор для премиум.', type: 'feature', urgency: 'medium', effort: 5, impact: 12 },
          { id: 't6', title: 'Международные переводы', desc: 'Swift + SEPA. Долго по комплаенсу, высокий impact.', type: 'feature', urgency: 'low', effort: 8, impact: 10 }
        ]
      }
    }
  },
  {
    id: 'w6_kanban_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Q2 Roadmap: Growth vs Features',
      explanation: 'Google Pay (6 SP, impact 18) + Реферал (4 SP, impact 14) + Concierge (5 SP, impact 12) + Уведомления (3 SP, impact 10) = 18 SP, суммарный impact 54. Crypto слишком дорого за impact. Международные переводы — хорошо, но медленно. Focus на retention + activation.',
      takeaway: 'Выбирайте задачи с высоким impact/effort ratio. Crypto красивое, но не Q2-задача.',
      returnNodeId: 'w6_kanban_task'
    }
  },

  // ==========================================
  // НЕДЕЛЯ 7: МАСШТАБ И СОВЕТ ДИРЕКТОРОВ
  // ==========================================
  {
    id: 'w7_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 7: Масштабирование',
    text: 'Продукт живёт. 85,000 активных пользователей. Пришло предложение из Берлина.',
    nextId: 'w7_eu_offer'
  },
  {
    id: 'w7_eu_offer',
    senderId: 'investor',
    type: 'message',
    text: 'Нам поступило предложение: немецкий банк N26 предлагает white-label сделку. Мы даём им нашу технологию металлической карты — они берут нас на рынок Европы. Revenue share 30/70 в нашу пользу.',
    nextId: 'w7_eu_2',
    delay: 1000
  },
  {
    id: 'w7_eu_2',
    senderId: 'investor',
    type: 'message',
    text: 'Это потенциально $5M ARR в первый год. Но требует 6 месяцев имплементации и полного фокуса команды.',
    nextId: 'w7_ceo_view',
    delay: 800
  },
  {
    id: 'w7_ceo_view',
    senderId: 'ceo',
    type: 'message',
    text: 'Я сторонник этой сделки. Но я хочу твоё мнение как PM: мы готовы к такой нагрузке? Что это сделает с продуктом?',
    nextId: 'w7_eu_choice',
    delay: 1000
  },
  {
    id: 'w7_eu_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Ваша позиция по EU-партнёрству:',
    choices: [
      {
        text: 'Принять: $5M ARR — это стратегически важно',
        messageText: 'Соглашаемся. Это выводит нас на международный уровень. Найдём ресурсы.',
        nextId: 'w7_accept_eu',
        impact: { budget: +20, morale: -10 }
      },
      {
        text: 'Отложить: сначала вырастить домашний рынок до 200k',
        messageText: 'Не готовы. У нас ещё 85k пользователей — нужно сначала стать лидером дома.',
        nextId: 'w7_decline_eu',
        impact: { budget: -5, morale: +5 }
      },
      {
        text: 'Провести технический due diligence перед решением',
        messageText: 'Три недели на оценку: что реально нужно для EU-локализации? Потом решим.',
        nextId: 'w7_diligence_eu',
        impact: { satisfaction: +5 }
      }
    ]
  },
  {
    id: 'w7_accept_eu',
    senderId: 'cto',
    type: 'message',
    text: 'Отлично. Мне нужно нанять ещё двух senior engineers. EU-локализация — это GDPR, немецкий IBAN, другие форматы карт.',
    nextId: 'w7_sql_task',
    delay: 1000
  },
  {
    id: 'w7_decline_eu',
    senderId: 'ceo',
    type: 'message',
    text: 'Понял. Это зрелое решение. Вернёмся к этому предложению через 6 месяцев с более сильной позиции.',
    nextId: 'w7_sql_task',
    delay: 1000
  },
  {
    id: 'w7_diligence_eu',
    senderId: 'cto',
    type: 'message',
    text: 'Правильно. Я начну оценку. За 2 недели поймём scope и можем принять обоснованное решение.',
    nextId: 'w7_sql_task',
    delay: 1000
  },

  {
    id: 'w7_sql_task',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 7. День 3: Аналитика роста',
    text: 'Данные — основа решений. Нужно выгрузить аналитику по лучшим клиентам.',
    nextId: 'w7_sql_intro'
  },
  {
    id: 'w7_sql_intro',
    senderId: 'risk',
    type: 'message',
    text: 'Для partnership pitch в N26 нам нужен срез нашей "топ-аудитории" — клиенты с высоким LTV и стабильным использованием.',
    nextId: 'w7_sql_query_task'
  },
  {
    id: 'w7_sql_query_task',
    senderId: 'system',
    type: 'task',
    text: 'Напишите SQL для выборки VIP-клиентов.',
    task: {
      type: 'sql_query',
      instruction: 'Найти клиентов: использование карты > 6 месяцев, средний месячный оборот > $2,000, отсутствие просроченных платежей, NPS-оценка > 8.',
      correctValue: 'query_vip',
      onSuccessId: 'w7_board_prep',
      onFailId: 'w7_sql_fail',
      data: [
        { id: 'query_all', text: 'SELECT * FROM clients WHERE monthly_spend > 2000' },
        { id: 'query_vip', text: 'SELECT id, name, monthly_spend FROM clients WHERE tenure_months > 6 AND avg_monthly_spend > 2000 AND overdue_payments = 0 AND nps_score > 8' },
        { id: 'query_wrong', text: 'SELECT id FROM clients ORDER BY monthly_spend DESC LIMIT 500' }
      ]
    }
  },
  {
    id: 'w7_sql_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'SQL: Многомерная сегментация',
      explanation: 'VIP — это не просто "много тратит". Нам нужна комбинация: длительность (tenure > 6 мес), оборот (avg spend > $2k), надёжность (overdue = 0), лояльность (NPS > 8). ORDER BY LIMIT просто выберет богатых новых клиентов — это не VIP.',
      takeaway: 'Качественная сегментация требует нескольких измерений, не только одного.',
      returnNodeId: 'w7_sql_query_task'
    }
  },

  {
    id: 'w7_board_prep',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 7. День 5: Подготовка к борду',
    text: 'Завтра — ежеквартальный совет директоров. Вы готовите презентацию.',
    nextId: 'w7_board_prep_msg'
  },
  {
    id: 'w7_board_prep_msg',
    senderId: 'ceo',
    type: 'message',
    text: 'Майкл (investor) всегда задаёт три вопроса: CAC и тренд, retention по когортам, и "что может убить продукт". Будь готов.',
    nextId: 'w7_board_prep_2',
    delay: 1000
  },
  {
    id: 'w7_board_prep_2',
    senderId: 'investor',
    type: 'message',
    text: 'Смотрю ваши метрики: 85k пользователей — хорошо. CAC снизился с $200 до $145 через рефералы — очень хорошо. Churn 4% — нужно снизить до 2%.',
    nextId: 'w8_start',
    delay: 1000
  },

  // ==========================================
  // НЕДЕЛЯ 8: ФИНАЛЬНЫЙ АКТ
  // ==========================================
  {
    id: 'w8_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 8: Финальная неделя',
    text: 'Восемь недель работы. Сегодня — совет директоров и решение о будущем продукта.',
    nextId: 'w8_board_meeting'
  },
  {
    id: 'w8_board_meeting',
    senderId: 'ceo',
    type: 'message',
    text: 'Совет директоров. Александр. Это момент истины — за 8 недель ты довёл NeoBlack от "проект в панике" до живого продукта.',
    nextId: 'w8_your_presentation',
    delay: 1000
  },
  {
    id: 'w8_your_presentation',
    senderId: 'user',
    type: 'message',
    text: '85,000 активных пользователей. NPS 67. CAC снизился с $200 до $145. Day-30 retention 55%. Первый месяц — положительный Contribution Margin.',
    nextId: 'w8_investor_q',
    impact: { satisfaction: +10 }
  },
  {
    id: 'w8_investor_q',
    senderId: 'investor',
    type: 'message',
    text: 'Впечатляет. Мой вопрос: что мешает вам вырасти до 1 миллиона пользователей? Что главный риск?',
    nextId: 'w8_spec_task',
    delay: 1000
  },
  {
    id: 'w8_spec_task',
    senderId: 'system',
    type: 'task',
    text: 'Выберите главный риск для масштабирования NeoBlack до 1M пользователей.',
    task: {
      type: 'feature_spec',
      instruction: 'Что является реальным главным ограничителем роста?',
      correctValue: 'tech_debt',
      onSuccessId: 'w8_spec_success',
      onFailId: 'w8_spec_fail',
      data: {
        tickets: [
          { id: 'tech_debt', title: 'Технический долг: HSM не готов к 1M пользователей', desc: 'При x10 нагрузке текущая инфраструктура ляжет. Это нужно решать сейчас, пока есть время, а не в кризис.', type: 'fix' },
          { id: 'competition', title: 'Конкуренция: Т-Банк выпустит аналог через 6 месяцев', desc: 'Это риск, но у нас уже лояльная база. Копирование карты не копирует опыт.', type: 'lazy' },
          { id: 'regulation', title: 'Регулятор: ЦБ может ужесточить требования к KYC', desc: 'Реальный риск, но мы уже работаем с SUMSUB — это индустриальный стандарт.', type: 'lazy' },
          { id: 'talent', title: 'Кадры: нужно нанять 20 инженеров', desc: 'Важно, но вторично. Без решения технических проблем новые инженеры не помогут.', type: 'lazy' }
        ]
      }
    }
  },
  {
    id: 'w8_spec_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Риск-менеджмент для совета директоров',
      explanation: 'Главный риск — тот, который может убить продукт быстро. Технический долг (HSM) — это бомба: при x10 нагрузке сервис упадёт, и уйти будет не к кому — конкуренты будут в выигрыше. Конкуренция управляема, регуляция предсказуема, найм растягивается. Инфраструктурный коллапс — нет.',
      takeaway: 'Совет директоров хочет видеть, что PM понимает фундаментальные технические риски, не только рыночные.',
      returnNodeId: 'w8_spec_task'
    }
  },
  {
    id: 'w8_spec_success',
    senderId: 'user',
    type: 'message',
    text: 'Главный риск — технический. При x10 нагрузке наш HSM-кластер не выдержит. Нам нужно вложить $300k в инфраструктуру до 1M пользователей. Это не расход — это страховка.',
    nextId: 'w8_investor_impressed',
    impact: { satisfaction: +10 }
  },
  {
    id: 'w8_investor_impressed',
    senderId: 'investor',
    type: 'message',
    text: 'Хороший ответ. PM, который понимает технические ограничения — редкость. Я вижу, что ты не просто управляешь фичами — ты управляешь бизнесом.',
    nextId: 'w8_final_choice',
    delay: 1000
  },
  {
    id: 'w8_final_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Финальный аккорд — ваш запрос к совету:',
    choices: [
      {
        text: 'Просить $500k на tech infra + marketing для x10',
        messageText: 'Прошу $500k. $300k на инфраструктуру, $200k на growth marketing. Через 6 месяцев — 500k пользователей.',
        nextId: 'w8_bold_ask',
        impact: { budget: +30, morale: +5 }
      },
      {
        text: 'Предложить IPO-подготовку через 12 месяцев',
        messageText: 'У нас есть данные и метрики для публичного рынка. Готовим к IPO через год.',
        nextId: 'ending_success',
        impact: { satisfaction: +20 }
      },
      {
        text: 'Объявить о приёме EU-сделки с N26',
        messageText: 'Принимаем N26. Международный запуск через 6 месяцев — это наш следующий уровень.',
        nextId: 'w8_eu_announce',
        impact: { budget: +20, morale: -10 }
      }
    ]
  },
  {
    id: 'w8_bold_ask',
    senderId: 'ceo',
    type: 'message',
    text: 'Совет одобрил. $500k выделено. Александр сказал: "Впервые за пять лет у нас PM, который не боится говорить правду и просить ресурсы на реальные проблемы."',
    nextId: 'ending_success',
    delay: 1000
  },
  {
    id: 'w8_eu_announce',
    senderId: 'investor',
    type: 'message',
    text: 'Интересно. Совет поддержал с условием: нанять VP of International до начала имплементации.',
    nextId: 'ending_success',
    delay: 1000
  },

  // --- ENDINGS ---
  {
    id: 'ending_success',
    senderId: 'ceo',
    type: 'ending',
    text: 'Восемь недель назад я не знал, сможет ли NeoBlack выжить. Сегодня — 85,000 пользователей, NPS 67, положительная unit economics, и совет верит в команду. Это блестящий запуск. Добро пожаловать в GreenBank навсегда.',
  },
  {
    id: 'ending_fail',
    senderId: 'ceo',
    type: 'ending',
    text: 'К сожалению, запуск не оправдал ожиданий. Технические проблемы и слабая unit economics заставили нас переосмыслить стратегию. Но каждый провальный запуск — это самый ценный урок в карьере PM. Возвращайся через год.',
  }
];
