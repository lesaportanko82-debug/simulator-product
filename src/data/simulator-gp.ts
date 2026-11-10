// GoPractice-style Interactive Simulator Data
// Architecture: module -> steps -> tasks with auto-validation

export type TaskType =
  | 'single_choice'
  | 'multiple_choice'
  | 'text_answer'
  | 'funnel_analysis'
  | 'metric_analysis'
  | 'product_decision'
  | 'prioritization'
  | 'data_interpretation';

export type StepType = 'context' | 'theory' | 'task' | 'feedback' | 'summary';
export type TaskStatus = 'not_started' | 'in_progress' | 'submitted' | 'correct' | 'incorrect' | 'completed';

export interface FunnelRow {
  stage: string;
  users: number;
  conversion: number; // to previous step
  dropoff: number;
}

export interface MetricRow {
  metric: string;
  current: string | number;
  target: string | number;
  trend: 'up' | 'down' | 'flat';
  note: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface GPTask {
  id: string;
  type: TaskType;
  question: string;
  description?: string;
  funnel?: FunnelRow[];
  metrics?: MetricRow[];
  table?: { headers: string[]; rows: (string | number)[][] };
  options?: Option[];
  correctKeywords?: string[]; // for text_answer
  correctOrder?: string[]; // for prioritization
  feedback: {
    correct: string;
    incorrect: string;
    hint: string;
    deepExplanation: string;
  };
}

export interface AITaskDef {
  question: string;
  context: string;
  rubric: string; // criteria for correct answer
}

export interface GPStep {
  id: string;
  type: StepType;
  title: string;
  content: string;
  teamMessage?: { author: string; role: string; avatar?: string; text: string };
  task?: GPTask;
  aiTask?: AITaskDef;
  insight?: string; // highlighted takeaway
}

export interface GPModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Начальный' | 'Средний' | 'Продвинутый';
  duration: string;
  tags: string[];
  isLocked: boolean;
  steps: GPStep[];
}

export interface GPSimulator {
  id: string;
  title: string;
  description: string;
  company: string;
  role: string;
  modules: GPModule[];
}

// ─── Simulator Data ───────────────────────────────────────────────────────────

export const GP_SIMULATOR: GPSimulator = {
  id: 'pm-simulator',
  title: 'Product Manager Simulator',
  description: 'Реальные кейсы, данные и решения. Учитесь думать как Senior PM.',
  company: 'LearnFlow',
  role: 'Product Manager',

  modules: [
    // ── MODULE 1: Онбординг ──────────────────────────────────────────────────
    {
      id: 'm1',
      title: 'Анализ онбординга',
      subtitle: 'Найди узкое место в воронке',
      description: 'Пользователи регистрируются, но не доходят до первого целевого действия. Найди проблему и предложи решение.',
      difficulty: 'Начальный',
      duration: '15 мин',
      tags: ['Воронка', 'Онбординг', 'UX'],
      isLocked: false,
      steps: [
        {
          id: 'm1s1',
          type: 'context',
          title: 'Ситуация',
          content: `Ты — продуктовый менеджер в приложении для онлайн-обучения LearnFlow. Уже третью неделю команда видит одно и то же: трафик растёт, регистрации идут, но до первого урока доходит катастрофически мало пользователей.

CEO поставил задачу: разобраться, где теряются люди, и предложить конкретный следующий шаг. На встрече через 2 часа.`,
          teamMessage: {
            author: 'Марина (CEO)',
            role: 'Chief Executive Officer',
            text: 'Смотри на данные по воронке за последние 30 дней. Что-то явно сломано на пути от регистрации до первого урока. Нам нужно понять, где именно, прежде чем мы начнём что-то чинить.',
          },
        },
        {
          id: 'm1s2',
          type: 'theory',
          title: 'Что такое drop-off анализ',
          content: `Drop-off анализ показывает, на каком этапе воронки пользователи уходят и в каком объёме.

Ключевое правило: сначала найди шаг с максимальной потерей в абсолютных числах — именно там прячется главная проблема.

Конверсия в процентах бывает обманчивой: если на каком-то шаге конверсия 90%, но через него проходят 100 000 человек, то потеря 10 000 — это огромная дыра. А 50% конверсия при 100 пользователях — просто 50 человек.

Смотри в первую очередь на абсолютный drop-off, а потом на относительный.`,
          insight: 'Правило: ищи максимальный абсолютный drop-off, не процентный.',
        },
        {
          id: 'm1s3',
          type: 'task',
          title: 'Анализ воронки',
          content: 'Изучи данные воронки за последние 30 дней и ответь на вопрос.',
          task: {
            id: 't1',
            type: 'funnel_analysis',
            question: 'На каком этапе самый критичный drop-off?',
            description: 'Проанализируй воронку. Найди этап с наибольшей абсолютной потерей пользователей.',
            funnel: [
              { stage: 'Посетители сайта',           users: 10000, conversion: 100,  dropoff: 0    },
              { stage: 'Начали регистрацию',          users: 4200,  conversion: 42.0, dropoff: 5800 },
              { stage: 'Завершили регистрацию',       users: 3100,  conversion: 73.8, dropoff: 1100 },
              { stage: 'Начали онбординг',            users: 2900,  conversion: 93.5, dropoff: 200  },
              { stage: 'Завершили онбординг',         users: 1350,  conversion: 46.6, dropoff: 1550 },
              { stage: 'Первое целевое действие',     users: 620,   conversion: 45.9, dropoff: 730  },
            ],
            options: [
              { id: 'a', text: 'Посетители → Начали регистрацию (потеря 5800)', isCorrect: false },
              { id: 'b', text: 'Завершили регистрацию → Начали онбординг (потеря 200)', isCorrect: false },
              { id: 'c', text: 'Начали онбординг → Завершили онбординг (потеря 1550)', isCorrect: true },
              { id: 'd', text: 'Завершили онбординг → Первое целевое действие (потеря 730)', isCorrect: false },
            ],
            feedback: {
              correct: 'Именно. Онбординг — главная дыра: из 2900 пользователей 1550 уходят не дойдя до конца.',
              incorrect: 'Посмотри внимательнее на абсолютные числа, не только на процентные.',
              hint: 'Сложи потери на каждом шаге и найди максимум в абсолютных числах.',
              deepExplanation: `Этап "Начали онбординг → Завершили онбординг" теряет 1550 пользователей при конверсии 46.6%. Это самый большой абсолютный drop-off в воронке.

Потеря посетителей на входе (5800) — это отдельная задача для маркетинга. Проблема онбординга — продуктовая: слишком много шагов, непонятная ценность, обязательные поля или friction в UI.

Senior PM смотрит на абсолютные числа. 1550 реальных пользователей в месяц — это и потеря денег, и сигнал о плохом UX.`,
            },
          },
        },
        {
          id: 'm1s4',
          type: 'task',
          title: 'Выбор следующего шага',
          content: 'Ты нашёл проблемный этап. Теперь реши, что делать первым.',
          task: {
            id: 't2',
            type: 'product_decision',
            question: 'Какое действие нужно предпринять в первую очередь?',
            description: 'У тебя есть гипотеза: проблема в онбординге. Выбери правильный следующий шаг PM-а.',
            options: [
              { id: 'a', text: 'Увеличить рекламный бюджет для привлечения большего трафика', isCorrect: false },
              { id: 'b', text: 'Провести пользовательские сессии и сократить онбординг до 3 шагов', isCorrect: true },
              { id: 'c', text: 'Добавить больше push-уведомлений после регистрации', isCorrect: false },
              { id: 'd', text: 'Изменить цвет кнопки "Продолжить" в онбординге', isCorrect: false },
            ],
            feedback: {
              correct: 'Верно. Сначала нужно понять причину drop-off через качественные данные, затем протестировать сокращение шагов.',
              incorrect: 'Вспомни: мы нашли проблему в онбординге, а не в привлечении или нотификациях.',
              hint: 'Проблема точечная — в конкретном сценарии. Решение должно быть тоже точечным.',
              deepExplanation: `Увеличение бюджета — это лечение симптома, а не причины. Если онбординг плохой, больше пользователей = больше уходящих.

Push-уведомления помогут только тем, кто уже знает, что хочет вернуться. Проблема в том, что они уходят не зная ценности продукта.

Цвет кнопки — это микро-оптимизация. При конверсии 46% она даст +1-2% в лучшем случае.

Правильный алгоритм PM-а:
1. Качественное исследование (записи сессий, интервью) — понять ПОЧЕМУ уходят
2. Гипотеза: слишком много шагов, нет быстрой ценности
3. Прототип сокращённого онбординга (3 шага вместо 7)
4. A/B тест
5. Замер метрики`,
            },
          },
        },
        {
          id: 'm1s4b',
          type: 'task',
          title: 'Открытый анализ',
          content: 'Это задание проверяется AI. Напишите развёрнутый ответ — система оценит качество вашего мышления как Senior PM.',
          aiTask: {
            question: 'Напиши краткий action plan (3-5 пунктов) для починки онбординга в LearnFlow на ближайшие 2 спринта.',
            context: 'LearnFlow: образовательное приложение. Онбординг теряет 1550 из 2900 пользователей. Команда: 4 разработчика, 1 дизайнер. Известно: верификация email убрана (Quick Win уже сделан). Следующий шаг — сам онбординг.',
            rubric: `Правильный action plan должен включать:
1. Качественное исследование (сессионные записи / интервью) ДО написания кода
2. Конкретную гипотезу (например: сократить с N до M шагов)
3. A/B тест для проверки
4. Метрику успеха (конкретную: "onboarding completion rate > X%")
5. Временные рамки или приоритизацию по Quick Win vs Long Term
Минус балл за: "сделать онбординг лучше" без конкретики, за отсутствие исследования, за UI-решения без данных.`,
          },
        },
        {
          id: 'm1s5',
          type: 'summary',
          title: 'Итог модуля',
          content: `Отличная работа. Ты прошёл первый модуль.

Что ты сделал правильно:
1. Нашёл проблемный этап через анализ абсолютных drop-off, а не только процентов.
2. Выбрал точечное решение, направленное на источник проблемы.
3. Не поддался соблазну "быстрых" решений — рекламы или пушей.

Ключевой вывод: Drop-off в онбординге — сигнал о friction в сценарии. Сначала качественные данные (сессии, интервью), потом количественный тест.`,
          insight: 'PM-инсайт: лечи причину, а не симптом. Больший трафик в плохой онбординг = больше потерь.',
        },
      ],
    },

    // ── MODULE 2: Приоритизация ──────────────────────────────────────────────
    {
      id: 'm2',
      title: 'Приоритизация гипотез',
      subtitle: 'RICE, ICE и здравый смысл',
      description: 'Бэклог переполнен, команда тянет в разные стороны. Научись выбирать, что делать первым.',
      difficulty: 'Средний',
      duration: '20 мин',
      tags: ['RICE', 'Приоритизация', 'Roadmap'],
      isLocked: false,
      steps: [
        {
          id: 'm2s1',
          type: 'context',
          title: 'Ситуация',
          content: `Три недели прошло с анализа онбординга. Ты подготовил список гипотез для его улучшения. Но разработчики заняты, дизайнер один, и спринт только 2 недели.

Нужно выбрать, что брать в работу первым. CEO хочет сразу всё. Разработчики говорят, что не успеют. Нужно принять решение и защитить его.`,
          teamMessage: {
            author: 'Кирилл (Tech Lead)',
            role: 'Engineering Lead',
            text: 'У нас 4 человека на спринт 2 недели. Всё что в списке — это 3 месяца. Надо выбрать 1-2 задачи максимум. Давай разберём.',
          },
        },
        {
          id: 'm2s2',
          type: 'theory',
          title: 'Фреймворк RICE',
          content: `RICE — простой способ объективно расставить приоритеты.

RICE Score = (Reach × Impact × Confidence) ÷ Effort

Reach — сколько пользователей затронет изменение за квартал.
Impact — насколько сильно изменится целевая метрика (0.25 / 0.5 / 1 / 2 / 3).
Confidence — уверенность в оценках (25% / 50% / 80% / 100%).
Effort — человеко-месяцы на реализацию.

Чем выше Score — тем выше приоритет.

Важно: RICE это инструмент для структурирования мышления, не замена суждению. Учитывай стратегический контекст.`,
          insight: 'RICE убирает эмоции из приоритизации. Но финальное решение всегда за PM-ом.',
        },
        {
          id: 'm2s3',
          type: 'task',
          title: 'Расчёт RICE Score',
          content: 'Команда подготовила 4 гипотезы. Рассчитай RICE и выбери приоритет.',
          task: {
            id: 't3',
            type: 'prioritization',
            question: 'Какую гипотезу взять в работу первой?',
            description: 'Используй данные таблицы и логику RICE Score.',
            table: {
              headers: ['Гипотеза', 'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score'],
              rows: [
                ['Сократить онбординг с 7 до 3 шагов', '2900', '2', '80%', '2', '2320'],
                ['Добавить видео-туториал на главный экран', '2900', '1', '50%', '3', '483'],
                ['Убрать обязательную верификацию email', '3100', '2', '80%', '0.5', '9920'],
                ['Push-уведомление "Продолжи регистрацию"', '1100', '1', '50%', '1', '550'],
              ],
            },
            options: [
              { id: 'a', text: 'Сократить онбординг с 7 до 3 шагов (RICE: 2320)', isCorrect: false },
              { id: 'b', text: 'Добавить видео-туториал (RICE: 483)', isCorrect: false },
              { id: 'c', text: 'Убрать обязательную верификацию email (RICE: 9920)', isCorrect: true },
              { id: 'd', text: 'Push-уведомление "Продолжи регистрацию" (RICE: 550)', isCorrect: false },
            ],
            feedback: {
              correct: 'Верно. Убрать обязательный email — это быстро (0.5 чел/мес), затрагивает 3100 человек и высокая уверенность (80%).',
              incorrect: 'Обрати внимание на RICE Score. Высокий Reach + высокий Confidence + низкий Effort = максимальный Score.',
              hint: 'RICE Score уже посчитан в таблице. Найди максимальное значение.',
              deepExplanation: `Убрать обязательную верификацию email — это "Quick Win" с огромным рычагом:

Reach: 3100 (все кто завершил регистрацию)
Impact: 2 (высокий — убираем friction прямо перед онбордингом)
Confidence: 80% (данные показывают падение именно здесь)
Effort: 0.5 мес (технически несложно — просто убрать шаг)

Score = 3100 × 2 × 0.8 / 0.5 = 9920

Это в 4 раза выше следующего варианта. Сначала делаем это, потом — сокращение онбординга. Это правило: начинай с самых высоких RICE при низком Effort.`,
            },
          },
        },
        {
          id: 'm2s4',
          type: 'task',
          title: 'Аргументация решения',
          content: 'CEO спрашивает: почему не делаем видео-туториал? Он считает, что это "важнее".',
          task: {
            id: 't4',
            type: 'single_choice',
            question: 'Как правильно ответить CEO?',
            options: [
              { id: 'a', text: 'Потому что я так решил как PM', isCorrect: false },
              { id: 'b', text: 'Видео даст в 20 раз меньший RICE Score при в 6 раз большем Effort — это значит меньше результата за больше ресурсов', isCorrect: true },
              { id: 'c', text: 'Видео — это слишком сложно для команды', isCorrect: false },
              { id: 'd', text: 'Сначала спросим пользователей, нужно ли им видео', isCorrect: false },
            ],
            feedback: {
              correct: 'Идеальный ответ. Данные + логика + конкретные цифры = убедительная аргументация.',
              incorrect: 'PM защищает решения через данные и бизнес-логику, не через авторитет или неопределённость.',
              hint: 'CEO хочет понять, почему конкретно это решение лучше. Ответь на языке ROI и ресурсов.',
              deepExplanation: `Правильный ответ CEO всегда строится на: данные + логика + конкретные числа.

"Я так решил" — это отсутствие аргументации. Доверие подрывается.
"Слишком сложно" — субъективно. CEO может сказать: "Наймите ещё одного разработчика".
"Спросим пользователей" — правильный инстинкт, но не как аргумент для откладывания. Говорит об отсутствии данных сейчас.

Правильный ответ: "Видео даёт RICE 483 против 9920 у верификации. Это значит при 6x большем времени мы получим 20x меньший эффект. Давай сначала сделаем быструю победу, замерим результат, и вернёмся к видео-туториалу в следующем спринте."`,
            },
          },
        },
        {
          id: 'm2s5',
          type: 'summary',
          title: 'Итог модуля',
          content: `Ты освоил основы приоритизации.

Главные выводы:
1. RICE Score — это инструмент объективной сравнительной оценки, не истина в последней инстанции.
2. Ищи "Quick Wins" с высоким Reach и низким Effort в первую очередь.
3. Защищай решения через данные и логику, не авторитет.
4. Приоритизация — это не однократное действие, а непрерывный процесс.`,
          insight: 'Данные убеждают лучше, чем авторитет. Учись говорить языком цифр.',
        },
      ],
    },

    // ── MODULE 3: Юнит-экономика ─────────────────────────────────────────────
    {
      id: 'm3',
      title: 'Unit Economics',
      subtitle: 'Сходится ли бизнес-модель',
      description: 'Инвесторы хотят понять, зарабатываете ли вы на клиенте. Научись считать LTV, CAC и объяснять экономику.',
      difficulty: 'Средний',
      duration: '25 мин',
      tags: ['LTV', 'CAC', 'Экономика'],
      isLocked: false,
      steps: [
        {
          id: 'm3s1',
          type: 'context',
          title: 'Ситуация',
          content: `LearnFlow готовится к раунду инвестиций. Инвестор задал прямой вопрос: "Покажите юнит-экономику."

Твоя задача — собрать данные и показать, что бизнес сходится.`,
          teamMessage: {
            author: 'Алексей (CFO)',
            role: 'Chief Financial Officer',
            text: 'У меня все цифры по расходам и выручке. Помоги мне правильно посчитать LTV и CAC и объяснить инвестору, почему мы сходимся.',
          },
        },
        {
          id: 'm3s2',
          type: 'theory',
          title: 'Основы юнит-экономики',
          content: `Юнит-экономика показывает: зарабатываем ли мы на одном клиенте больше, чем тратим на его привлечение?

Ключевые формулы:

CAC (Customer Acquisition Cost) = Расходы на маркетинг / Новые платящие клиенты

LTV (Lifetime Value) = ARPU × Gross Margin / Churn Rate

Где Churn Rate = % клиентов, которые уходят за период.

Золотое правило: LTV / CAC > 3.
Если LTV / CAC = 1 — работаете в ноль.
Если < 1 — каждый клиент приносит убыток.`,
          insight: 'LTV/CAC < 1 = каждый новый клиент делает тебя беднее. Масштабировать убыточную модель — катастрофа.',
        },
        {
          id: 'm3s3',
          type: 'task',
          title: 'Расчёт LTV и CAC',
          content: 'Используй данные LearnFlow для расчёта ключевых метрик.',
          task: {
            id: 't5',
            type: 'metric_analysis',
            question: 'Какое соотношение LTV/CAC у LearnFlow?',
            description: 'Используй данные компании и выбери правильный ответ.',
            metrics: [
              { metric: 'Ежемесячный маркетинговый бюджет', current: '500 000 ₽', target: '—', trend: 'flat', note: 'Включая зарплату команды маркетинга' },
              { metric: 'Новых платящих клиентов в месяц', current: '250', target: '400', trend: 'up', note: 'Рост за последние 3 месяца +15%/мес' },
              { metric: 'Средняя ежемесячная подписка (ARPU)', current: '1 490 ₽', target: '—', trend: 'flat', note: 'После вычета комиссии App Store/Google Play' },
              { metric: 'Gross Margin', current: '72%', target: '75%', trend: 'up', note: 'Серверы + поддержка + платёжные комиссии' },
              { metric: 'Ежемесячный Churn Rate', current: '4%', target: '3%', trend: 'down', note: 'Снижаем — в Q3 было 6%' },
            ],
            options: [
              { id: 'a', text: 'LTV = 26 820₽, CAC = 2 000₽, LTV/CAC = 13.4 — отличный результат', isCorrect: true },
              { id: 'b', text: 'LTV = 14 900₽, CAC = 2 000₽, LTV/CAC = 7.45 — хороший результат', isCorrect: false },
              { id: 'c', text: 'LTV = 8 940₽, CAC = 5 000₽, LTV/CAC = 1.8 — слабый результат', isCorrect: false },
              { id: 'd', text: 'Недостаточно данных для расчёта', isCorrect: false },
            ],
            feedback: {
              correct: 'Верно! LTV = 1490 × 0.72 / 0.04 = 26 820₽. CAC = 500 000 / 250 = 2 000₽. LTV/CAC = 13.4.',
              incorrect: 'Попробуй пересчитать: LTV = ARPU × Gross Margin / Churn. CAC = Бюджет / Новые клиенты.',
              hint: 'LTV = 1490 × 0.72 / 0.04 = ? CAC = 500 000 / 250 = ?',
              deepExplanation: `LTV = ARPU × Gross Margin / Churn Rate
LTV = 1 490 × 0.72 / 0.04 = 1 072.8 / 0.04 = 26 820 ₽

CAC = Маркетинговый бюджет / Новые клиенты
CAC = 500 000 / 250 = 2 000 ₽

LTV/CAC = 26 820 / 2 000 = 13.4

Это отличный показатель. Норма для SaaS — LTV/CAC > 3.
При 13.4 компания зарабатывает на каждом клиенте в 13 раз больше, чем тратит на привлечение.

Важно также смотреть на Payback Period:
Payback = CAC / (ARPU × Gross Margin) = 2000 / (1490 × 0.72) = 2000 / 1072.8 ≈ 1.9 месяца

Это превосходный результат — клиент окупается менее чем за 2 месяца.`,
            },
          },
        },
        {
          id: 'm3s4',
          type: 'task',
          title: 'Интерпретация данных',
          content: 'Инвестор смотрит на Churn 4% и говорит: "Это много." Как ты ответишь?',
          task: {
            id: 't6',
            type: 'data_interpretation',
            question: 'Как правильно интерпретировать Churn 4% для инвестора?',
            options: [
              { id: 'a', text: 'Да, это проблема, нам нужно срочно это починить', isCorrect: false },
              { id: 'b', text: '4% в месяц — это Lifetime 25 месяцев. При среднем чеке 1490₽ и Gross Margin 72% это LTV 26 820₽ при CAC 2000₽. Соотношение 13.4x — выдающийся показатель для EdTech', isCorrect: true },
              { id: 'c', text: 'По рынку EdTech норма — 8-10%, у нас лучше среднего', isCorrect: false },
              { id: 'd', text: 'Мы работаем над снижением, цель — 3% к Q4', isCorrect: false },
            ],
            feedback: {
              correct: 'Блестяще. Ты перевёл Churn в контекст полной экономики, а не просто сравнил с нормой.',
              incorrect: 'Инвестор слышит цифру и боится. Твоя задача — показать контекст через всю цепочку цифр.',
              hint: 'Churn — не изолированная метрика. Покажи его значение в контексте LTV и всей юнит-экономики.',
              deepExplanation: `Правило: никогда не отвечай на страхи инвестора отдельной цифрой. Покажи экосистему метрик.

4% Churn в месяц = Lifetime 1/0.04 = 25 месяцев. Это хорошо для B2C SaaS.
При этом Payback Period всего 1.9 месяца, LTV/CAC = 13.4.

Вариант A — признание проблемы без контекста. Это подрывает доверие.
Вариант C — сравнение с рынком без цифр. Слабо.
Вариант D — обещание, но без объяснения текущей ситуации.

Лучший ответ: переводи любую метрику в бизнес-контекст. 4% Churn в связке с LTV 26 820₽ и CAC 2000₽ — это история успеха, а не тревоги.`,
            },
          },
        },
        {
          id: 'm3s5',
          type: 'summary',
          title: 'Итог модуля',
          content: `Ты научился считать и интерпретировать юнит-экономику.

Ключевые формулы на память:
• LTV = ARPU × Gross Margin / Churn Rate
• CAC = Marketing Spend / New Paying Customers
• Payback Period = CAC / (ARPU × Gross Margin)
• LTV/CAC > 3 = бизнес масштабируем

Помни: метрики всегда нужно интерпретировать в контексте, а не изолированно.`,
          insight: 'Инвестор вкладывает деньги в бизнес-модель, а не в продукт. Умение объяснить экономику — суперсила PM.',
        },
      ],
    },

    // ── MODULE 4: A/B тест (locked) ──────────────────────────────────────────
    {
      id: 'm4',
      title: 'A/B тестирование',
      subtitle: 'Статзначимость и правильные выводы',
      description: 'Когда можно доверять результатам теста, а когда нет. Как не обмануть себя данными.',
      difficulty: 'Продвинутый',
      duration: '25 мин',
      tags: ['A/B тест', 'Статистика', 'Эксперименты'],
      isLocked: true,
      steps: [],
    },

    // ── MODULE 5: Product Strategy (locked) ──────────────────────────────────
    {
      id: 'm5',
      title: 'Продуктовая стратегия',
      subtitle: 'Vision, OKR и roadmap',
      description: 'Как построить стратегию на год, защитить её перед советом директоров и следовать ей в условиях хаоса.',
      difficulty: 'Продвинутый',
      duration: '30 мин',
      tags: ['OKR', 'Стратегия', 'Vision'],
      isLocked: true,
      steps: [],
    },
  ],
};

// ─── Progress Types ───────────────────────────────────────────────────────────

export interface StepProgress {
  stepId: string;
  status: TaskStatus;
  attempts: number;
  lastAnswer?: string | string[];
  completedAt?: number;
}

export interface ModuleProgress {
  moduleId: string;
  stepsProgress: Record<string, StepProgress>;
  completedAt?: number;
  score: number; // 0-100
}

export interface GPProgress {
  simulatorId: string;
  modules: Record<string, ModuleProgress>;
  currentModuleId: string;
  currentStepId: string;
  startedAt: number;
  lastActiveAt: number;
  totalCorrect: number;
  totalAttempts: number;
}

export const getInitialProgress = (): GPProgress => ({
  simulatorId: 'pm-simulator',
  modules: {},
  currentModuleId: 'm1',
  currentStepId: 'm1s1',
  startedAt: Date.now(),
  lastActiveAt: Date.now(),
  totalCorrect: 0,
  totalAttempts: 0,
});

export const PROGRESS_KEY = 'gp-simulator-progress';

export const loadProgress = (): GPProgress => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : getInitialProgress();
  } catch {
    return getInitialProgress();
  }
};

export const saveProgress = (progress: GPProgress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...progress, lastActiveAt: Date.now() }));
  } catch {}
};

// ─── Validation Engine ────────────────────────────────────────────────────────

export const validateAnswer = (task: GPTask, answer: string | string[]): boolean => {
  if (task.type === 'single_choice' || task.type === 'product_decision' ||
      task.type === 'metric_analysis' || task.type === 'data_interpretation' ||
      task.type === 'funnel_analysis' || task.type === 'prioritization') {
    const correct = task.options?.find(o => o.isCorrect);
    return correct?.id === answer;
  }
  if (task.type === 'multiple_choice') {
    const correctIds = task.options?.filter(o => o.isCorrect).map(o => o.id).sort() ?? [];
    const given = [...(answer as string[])].sort();
    return JSON.stringify(correctIds) === JSON.stringify(given);
  }
  if (task.type === 'text_answer' && task.correctKeywords) {
    const lower = (answer as string).toLowerCase();
    return task.correctKeywords.some(kw => lower.includes(kw.toLowerCase()));
  }
  return false;
};

export const getModuleProgress = (progress: GPProgress, moduleId: string): number => {
  const mod = progress.modules[moduleId];
  if (!mod) return 0;
  const module = GP_SIMULATOR.modules.find(m => m.id === moduleId);
  if (!module || module.steps.length === 0) return 0;
  const completed = Object.values(mod.stepsProgress).filter(
    s => s.status === 'correct' || s.status === 'completed'
  ).length;
  return Math.round((completed / module.steps.length) * 100);
};
