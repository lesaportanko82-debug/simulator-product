import { SimulationNode, GameMetrics, CHARACTERS as BASE_CHARACTERS } from './simulator-scenarios';

export const FOOD_CHARACTERS = {
  ...BASE_CHARACTERS,
  investor: {
    name: "Павел (Инвестор)",
    role: "Lead Investor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzdWl0fGVufDF8fHx8MTc2OTQ4MDE1MHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-indigo-50 text-indigo-900 border-indigo-200"
  },
  director: {
    name: "Елена П.",
    role: "COO (Операционный директор)",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwgd29tYW58ZW58MXx8fHwxNzY5NDgwMzAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-orange-50 text-orange-900 border-orange-200"
  },
  dev: {
    name: "Макс",
    role: "Logistics Lead",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBidWlsZGVyfGVufDF8fHx8MTc2OTQ4MDMxMHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-slate-100 text-slate-800 border-slate-200"
  },
  sales: {
    name: "Карен",
    role: "Head of Partnerships",
    avatar: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHlsaXNoJTIwd29tYW58ZW58MXx8fHwxNzY5NDgwMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-red-50 text-red-900 border-red-200"
  },
  analytics: {
    name: "Тимур",
    role: "Data Analyst",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzbWlsaW5nfGVufDF8fHx8MTc2OTQ4MDM1MHww&ixlib=rb-4.1.0&q=80&w=1080",
    color: "bg-blue-50 text-blue-800 border-blue-200"
  }
};

export const FOOD_SCENARIO: SimulationNode[] = [

  // =============================================
  // INTRO
  // =============================================
  {
    id: 'intro_node',
    senderId: 'system',
    type: 'intro',
    introData: {
      company: "YumRun Delivery",
      product: "Logistics Platform",
      role: "Product Manager",
      description: "Мы доставляем еду за 30 минут, но теряем $2 на каждом заказе. 10 000 заказов в день = $20 000 убытков ежедневно. Инвесторы заморозили следующий раунд. У вас есть 2 недели, чтобы вывести Unit Economics в плюс — или компания закрывается.",
      initialMetrics: { budget: 20, morale: 55, satisfaction: 78 }
    },
    nextId: 'day_1_start'
  },

  // =============================================
  // НЕДЕЛЯ 1 — ПОНЕДЕЛЬНИК: Диагностика
  // =============================================
  {
    id: 'day_1_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПОНЕДЕЛЬНИК: Точка убыточности',
    text: 'Офис на нервах. Елена созвала экстренное совещание. На экране — красные цифры.',
    nextId: 'd1_elena_1'
  },
  {
    id: 'd1_elena_1',
    senderId: 'director',
    type: 'message',
    text: 'Добро пожаловать в YumRun. Я хотела бы встретить тебя с кофе и экскурсией, но сейчас не до этого. У нас горит.',
    nextId: 'd1_elena_2',
    delay: 1500,
    isStressful: true
  },
  {
    id: 'd1_elena_2',
    senderId: 'director',
    type: 'message',
    text: 'Мы сжигаем $200k в неделю. Инвесторы заморозили bridge-раунд до тех пор, пока мы не покажем положительный Contribution Margin. Это 2 недели.',
    nextId: 'd1_max_join',
    delay: 2000
  },
  {
    id: 'd1_max_join',
    senderId: 'dev',
    type: 'message',
    text: 'Привет, я Макс. Логистика. Если коротко: наш алгоритм раздачи заказов — дерьмо. Курьеры ездят с одним заказом туда-обратно вместо двух по пути.',
    nextId: 'd1_karen_join',
    delay: 1000
  },
  {
    id: 'd1_karen_join',
    senderId: 'sales',
    type: 'message',
    text: 'Карен. Партнёрства. Рестораны злятся — время доставки растёт, рейтинги падают. McDonald\'s уже угрожает уйти к конкуренту.',
    nextId: 'd1_timur_join',
    delay: 1000
  },
  {
    id: 'd1_timur_join',
    senderId: 'analytics',
    type: 'message',
    text: 'Тимур, аналитика. Я посмотрел цифры прошлой ночью. У нас три источника убытков: бесплатная доставка, неэффективный роутинг и высокая стоимость привлечения курьеров.',
    nextId: 'd1_you_react',
    delay: 1000
  },
  {
    id: 'd1_you_react',
    senderId: 'user',
    type: 'message',
    text: 'Понял. Прежде чем принимать решения, хочу видеть цифры. Тимур, покажи реальный CM на один заказ.',
    nextId: 'd1_timur_calc_intro',
    impact: { satisfaction: +2 }
  },
  {
    id: 'd1_timur_calc_intro',
    senderId: 'analytics',
    type: 'message',
    text: 'Правильный подход. Давай считать вместе. AOV = $15, комиссия ресторана 20%, бесплатная доставка для юзера, выплата курьеру $5.',
    nextId: 'calc_ue',
    delay: 1000
  },
  {
    id: 'calc_ue',
    senderId: 'system',
    type: 'task',
    text: 'Рассчитайте реальный Contribution Margin на один заказ.',
    task: {
      type: 'calculation',
      instruction: 'AOV = $15. Комиссия от ресторана = 20% от AOV. Бесплатная доставка для клиента = $0. Выплата курьеру = $5. Рассчитайте CM = (Доход от комиссии) + (Доставка от клиента) - (Выплата курьеру).',
      correctValue: 'cm_minus_2',
      onSuccessId: 'calc_success',
      onFailId: 'calc_fail',
      hint: "(15 × 0.20) + $0 − $5 = $3 − $5 = −$2",
      data: {
        options: [
          { id: 'cm_plus_1', label: '+$1.00 (Небольшая прибыль)' },
          { id: 'cm_minus_2', label: '−$2.00 (Убыток на заказ)' },
          { id: 'cm_zero', label: '$0.00 (Ноль, безубыточность)' },
          { id: 'cm_minus_5', label: '−$5.00 (Катастрофа)' }
        ]
      }
    }
  },
  {
    id: 'calc_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Ошибка в расчёте CM',
      explanation: 'Доход: $15 × 20% = $3. Расход: $5 (курьер). CM = $3 − $5 = −$2. Мы теряем $2 с каждого заказа. При 10 000 заказах в день это $20 000 ежедневных убытков.',
      takeaway: 'CM = Доходы - Переменные расходы. Если CM < 0 — бизнес-модель нежизнеспособна.',
      returnNodeId: 'calc_ue'
    }
  },
  {
    id: 'calc_success',
    senderId: 'user',
    type: 'message',
    text: 'Итого: минус два доллара на каждом заказе. При 10 тысячах заказов в день мы теряем двадцать тысяч ежедневно. Это не кризис — это структурная проблема.',
    nextId: 'd1_timur_confirm',
    impact: { satisfaction: +3 }
  },
  {
    id: 'd1_timur_confirm',
    senderId: 'analytics',
    type: 'message',
    text: 'Именно. И это без учёта маркетинга и поддержки. С ними убыток почти $4 на заказ.',
    nextId: 'd1_elena_after_calc',
    delay: 800
  },
  {
    id: 'd1_elena_after_calc',
    senderId: 'director',
    type: 'message',
    text: 'Хорошо, цифры на столе. Есть несколько рычагов. Нам нужно решение, которое даст результат быстро — у нас нет времени на долгие эксперименты.',
    nextId: 'd1_strategy_choice',
    delay: 1000,
    isStressful: true
  },
  {
    id: 'd1_strategy_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Выбор главной стратегии улучшения Unit Economics:',
    choices: [
      {
        text: 'Small Order Fee — комиссия $3 для заказов до $15',
        messageText: 'Вводим Small Order Fee: заказы меньше $15 доплачивают $3 за доставку. Это отсечёт убыточные мелкие заказы и сразу даст +$3 CM.',
        nextId: 'd1_fee_path',
        impact: { budget: +15, satisfaction: -15 }
      },
      {
        text: 'Smart Batching — склейка двух заказов по маршруту',
        messageText: 'Внедряем батчинг: один курьер везёт два заказа по близким адресам. Это режет Cost per Delivery с $5 до $2.5.',
        nextId: 'd1_batch_path',
        impact: { budget: +10, satisfaction: -8, morale: -5 }
      },
      {
        text: 'Commission Hike — поднять комиссию с 20% до 28%',
        messageText: 'Поднимаем комиссию для ресторанов с 20% до 28%. CM сразу выходит в плюс, но рестораны могут уйти.',
        nextId: 'd1_commission_path',
        impact: { budget: +20, satisfaction: -5, morale: -10 }
      },
      {
        text: 'Stop Free Delivery — ввести $1.99 с каждого заказа',
        messageText: 'Убираем бесплатную доставку. Вводим единую плату $1.99 для клиентов. Это сразу покрывает половину убытка.',
        nextId: 'd1_nodelfee_path',
        impact: { budget: +8, satisfaction: -20 }
      }
    ]
  },

  // --- Ветка A: Small Order Fee ---
  {
    id: 'd1_fee_path',
    senderId: 'user',
    type: 'message',
    text: 'Карен, как думаешь — сколько кофе и завтраков это уберёт?',
    nextId: 'd1_fee_karen'
  },
  {
    id: 'd1_fee_karen',
    senderId: 'sales',
    type: 'message',
    text: 'Около 35-40% заказов — до $15. Кофе, печенье, сэндвичи. Это "лоялисты-халявщики". Но они создают привычку у юзеров...',
    nextId: 'd1_fee_timur',
    delay: 800
  },
  {
    id: 'd1_fee_timur',
    senderId: 'analytics',
    type: 'message',
    text: 'Тест на Сан-Франциско показал: при введении $2.50 за доставку таких заказов отток был 25%, а не 40%. Люди привыкают.',
    nextId: 'd1_fee_elena',
    delay: 800
  },
  {
    id: 'd1_fee_elena',
    senderId: 'director',
    type: 'message',
    text: 'Это жёстко, но финансово верно. Запускаем с завтра. Я возьму звонок от Starbucks на себя.',
    nextId: 'day_2_start',
    delay: 1000
  },

  // --- Ветка B: Batching ---
  {
    id: 'd1_batch_path',
    senderId: 'user',
    type: 'message',
    text: 'Макс, реально ли сделать батчинг так, чтобы еда не остывала?',
    nextId: 'd1_batch_max'
  },
  {
    id: 'd1_batch_max',
    senderId: 'dev',
    type: 'message',
    text: 'Теоретически да. Но нужна умная геолокационная кластеризация. Я могу запустить прототип за 3 дня. Будет много багов, но работать будет.',
    nextId: 'd1_batch_karen',
    delay: 800
  },
  {
    id: 'd1_batch_karen',
    senderId: 'sales',
    type: 'message',
    text: 'McDonald\'s специально прописал в договоре: "доставка в течение 28 минут". Если батчинг увеличит время — они нас засудят.',
    nextId: 'd1_batch_elena',
    delay: 800
  },
  {
    id: 'd1_batch_elena',
    senderId: 'director',
    type: 'message',
    text: 'Берём на себя риск. Макс, начинай. Но только для заказов в радиусе 500 метров друг от друга.',
    nextId: 'day_2_start',
    delay: 1000
  },

  // --- Ветка C: Commission Hike ---
  {
    id: 'd1_commission_path',
    senderId: 'user',
    type: 'message',
    text: 'Карен, если мы поднимем до 28%, кто из ресторанов уйдёт точно?',
    nextId: 'd1_commission_karen'
  },
  {
    id: 'd1_commission_karen',
    senderId: 'sales',
    type: 'message',
    text: 'Крупные сети не уйдут — им нужен наш трафик. Уйдут мелкие инди-рестораны. Около 15% партнёров.',
    nextId: 'd1_commission_timur',
    delay: 800
  },
  {
    id: 'd1_commission_timur',
    senderId: 'analytics',
    type: 'message',
    text: 'Эти 15% дают нам только 8% выручки. Потеря некритична. Зато CM сразу станет +$1.20.',
    nextId: 'd1_commission_elena',
    delay: 800
  },
  {
    id: 'd1_commission_elena',
    senderId: 'director',
    type: 'message',
    text: 'Принимаем. Но Карен — лично позвони каждому крупному партнёру с объяснением. Без сюрпризов.',
    nextId: 'day_2_start',
    delay: 1000
  },

  // --- Ветка D: No Free Delivery ---
  {
    id: 'd1_nodelfee_path',
    senderId: 'user',
    type: 'message',
    text: 'Тимур, как клиенты реагировали на похожее в других городах?',
    nextId: 'd1_nodef_timur'
  },
  {
    id: 'd1_nodef_timur',
    senderId: 'analytics',
    type: 'message',
    text: 'Отток был 18% в первую неделю, потом стабилизировался. Главное — $1.99 надо показывать честно, не прятать в финальной цене.',
    nextId: 'd1_nodef_karen',
    delay: 800
  },
  {
    id: 'd1_nodef_karen',
    senderId: 'sales',
    type: 'message',
    text: 'Рестораны будут жаловаться — скажут, что мы разрушаем ценностное предложение. "Бесплатная доставка" — это было нашим главным маркетинговым аргументом.',
    nextId: 'd1_nodef_elena',
    delay: 800
  },
  {
    id: 'd1_nodef_elena',
    senderId: 'director',
    type: 'message',
    text: 'Ничто не бывает бесплатным. Запускаем честную модель. Зато потом не нужно будет придумывать хаки.',
    nextId: 'day_2_start',
    delay: 1000
  },

  // =============================================
  // ВТОРНИК: Реализация и первые проблемы
  // =============================================
  {
    id: 'day_2_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ВТОРНИК: Реализация',
    text: 'Команда начала имплементацию. Но появились первые трудности.',
    nextId: 'd2_max_morning'
  },
  {
    id: 'd2_max_morning',
    senderId: 'dev',
    type: 'message',
    text: 'Стендап: алгоритм батчинга работает в тестовой среде. Но я смотрю в реальные данные и вижу кое-что странное.',
    nextId: 'd2_max_detail',
    delay: 1000
  },
  {
    id: 'd2_max_detail',
    senderId: 'dev',
    type: 'message',
    text: '30% наших курьеров стоят на одном квадрате — центр города. Спальные районы голые. Это почему так?',
    nextId: 'd2_timur_answer',
    delay: 800
  },
  {
    id: 'd2_timur_answer',
    senderId: 'analytics',
    type: 'message',
    text: 'Это называется "hotspot clustering" — курьеры едут туда, где чаще заказывают. Это рационально для них, но убивает наш coverage.',
    nextId: 'd2_karen_problem',
    delay: 800
  },
  {
    id: 'd2_karen_problem',
    senderId: 'sales',
    type: 'message',
    text: 'Именно поэтому рестораны в пригороде жалуются, что у них "нет курьеров". Три партнёра уже написали претензии.',
    nextId: 'd2_feature_intro',
    delay: 800
  },
  {
    id: 'd2_feature_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ВТОРНИК: Задание по дизайну фичи',
    text: 'Нужно спроектировать механику, которая сбалансирует распределение курьеров.',
    nextId: 'd2_feature_task'
  },
  {
    id: 'd2_feature_task',
    senderId: 'system',
    type: 'task',
    text: 'Выберите правильный механизм балансировки курьеров по зонам.',
    task: {
      type: 'feature_spec',
      instruction: 'Как мотивировать курьеров ехать в недоохваченные зоны без принуждения?',
      correctValue: 'zone_bonus',
      onSuccessId: 'd2_feature_success',
      onFailId: 'd2_feature_fail',
      data: {
        tickets: [
          { id: 'zone_bonus', title: 'Zone Bonus', desc: '+20% к оплате за заказы в зонах с нехваткой курьеров (авто-таргетинг). Прозрачно и позитивно.', type: 'fix' },
          { id: 'force_move', title: 'Force Relocation', desc: 'Принудительно перемещать курьеров в зону. Штраф за отказ.', type: 'bug' },
          { id: 'ad_show', label: 'Courier Ads', title: 'Courier Ads', desc: 'Показывать рекламу "в этом районе много заказов" внутри приложения без гарантий.', type: 'lazy' },
          { id: 'flat_rate', title: 'Flat Rate', desc: 'Убрать переменную часть, сделать фиксированную ставку по всем зонам одинаково.', type: 'lazy' }
        ]
      }
    }
  },
  {
    id: 'd2_feature_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Дизайн механики мотивации',
      explanation: 'Принудительное перемещение и штрафы разрушают доверие. Реклама без гарантий игнорируется. Правильный вариант — прозрачный Zone Bonus, который позволяет курьеру самому принимать решение, получая при этом реальную выгоду.',
      takeaway: 'Хорошие механики мотивации: позитивны, прозрачны и дают контроль исполнителю.',
      returnNodeId: 'd2_feature_task'
    }
  },
  {
    id: 'd2_feature_success',
    senderId: 'user',
    type: 'message',
    text: 'Zone Bonus. Автоматически поднимаем ставку на 20% в зонах с нехваткой. Курьеры сами поедут туда, где выгоднее.',
    nextId: 'd2_max_approve',
    impact: { morale: +5 }
  },
  {
    id: 'd2_max_approve',
    senderId: 'dev',
    type: 'message',
    text: 'Это займёт 2 дня. Алгоритм простой — смотрим supply/demand ratio по полигонам, если < 0.5, включаем бонус.',
    nextId: 'd2_timur_warning',
    delay: 800
  },
  {
    id: 'd2_timur_warning',
    senderId: 'analytics',
    type: 'message',
    text: 'Предупреждаю: Zone Bonus увеличит Cost per Delivery на ~$0.80 в среднем. Это нужно учесть в расчётах.',
    nextId: 'd2_launch_choice',
    delay: 800
  },
  {
    id: 'd2_launch_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как запускать Zone Bonus?',
    choices: [
      {
        text: 'Жёсткий дедлайн: к завтрашнему утру',
        messageText: 'Макс, нужно к утреннему пику среды. Работаем ночью если нужно.',
        nextId: 'day_3_start',
        impact: { morale: -10, satisfaction: +5 }
      },
      {
        text: 'Сначала тест на одном районе',
        messageText: 'Запускаем пилот в центре на 24 часа, смотрим на цифры, потом масштабируем.',
        nextId: 'day_3_pilot',
        impact: { morale: +5, satisfaction: -3 }
      }
    ]
  },

  // =============================================
  // СРЕДА: Забастовка курьеров
  // =============================================
  {
    id: 'day_3_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'СРЕДА: Буря',
    text: 'Zone Bonus запущен. Но пришла новость хуже.',
    nextId: 'd3_karen_strike'
  },
  {
    id: 'day_3_pilot',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'СРЕДА: Пилот и буря',
    text: 'Пилот Zone Bonus показывает рост coverage на 18%. Но пришла плохая новость.',
    nextId: 'd3_karen_strike'
  },
  {
    id: 'd3_karen_strike',
    senderId: 'sales',
    type: 'message',
    text: 'Чрезвычайная ситуация. Профсоюз курьеров объявил предупредительную забастовку на пятницу вечером — самый пиковый час недели.',
    nextId: 'd3_karen_strike_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'd3_karen_strike_2',
    senderId: 'sales',
    type: 'message',
    text: 'Они требуют: отмену Small Order Fee (или её частичного перечисления курьерам), гарантированный минимум $15/час и медстраховку.',
    nextId: 'd3_max_view',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'd3_max_view',
    senderId: 'dev',
    type: 'message',
    text: 'Честно говоря, понимаю их. $5.50 чистыми за поездку — это мало. Особенно если делают батчинг и везут два заказа за те же деньги.',
    nextId: 'd3_timur_impact',
    delay: 800
  },
  {
    id: 'd3_timur_impact',
    senderId: 'analytics',
    type: 'message',
    text: 'Если в пятницу не будет курьеров — мы потеряем $800k выручки за вечер. И рейтинг в сторе рухнет от жалоб на "нет курьеров".',
    nextId: 'd3_elena_pressure',
    delay: 800,
    isStressful: true
  },
  {
    id: 'd3_elena_pressure',
    senderId: 'director',
    type: 'message',
    text: 'У нас два дня. Я могу выделить $50k на урегулирование. Но не больше — это последние деньги до следующего раунда.',
    nextId: 'd3_strike_choice',
    delay: 1000,
    isStressful: true
  },
  {
    id: 'd3_strike_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как реагировать на забастовку?',
    choices: [
      {
        text: 'Поднять ставку на +12% (стоит $40k/нед)',
        messageText: 'Повышаем выплату курьерам с $5 до $5.60 за поездку. Дорого, но профсоюз успокоится.',
        nextId: 'd3_raise_path',
        impact: { budget: -15, morale: +15 }
      },
      {
        text: 'Дать бонус $50 за выход в пятницу',
        messageText: 'Разовый бонус за выход в пятницу — $50 каждому, кто сделает 8+ поездок. Дешевле, чем постоянная ставка.',
        nextId: 'd3_bonus_path',
        impact: { budget: -8, morale: +10 }
      },
      {
        text: 'Жёстко: уволить организаторов',
        messageText: 'Идентифицируем и увольняем зачинщиков. У нас лист ожидания на 500 курьеров.',
        nextId: 'd3_fire_path',
        impact: { budget: +5, morale: -25, satisfaction: -15 }
      }
    ]
  },

  // --- Ветка: поднять ставку ---
  {
    id: 'd3_raise_path',
    senderId: 'user',
    type: 'message',
    text: 'Пятнадцать центов разница не убьёт нас, но сохранит supply в пятницу. Согласовываем с профсоюзом.',
    nextId: 'd3_raise_result'
  },
  {
    id: 'd3_raise_result',
    senderId: 'sales',
    type: 'message',
    text: 'Профсоюз принял. Они добавляют условие: ежеквартальный review. Это управляемо.',
    nextId: 'd3_mcd_crisis',
    delay: 1000
  },

  // --- Ветка: разовый бонус ---
  {
    id: 'd3_bonus_path',
    senderId: 'user',
    type: 'message',
    text: 'Разовый бонус — это не постоянные обязательства. Профсоюз получает деньги, мы сохраняем гибкость.',
    nextId: 'd3_bonus_result'
  },
  {
    id: 'd3_bonus_result',
    senderId: 'sales',
    type: 'message',
    text: 'Они согласились с оговоркой: "пока мы смотрим на ваши следующие шаги". Это не конец переговоров, но пятница спасена.',
    nextId: 'd3_mcd_crisis',
    delay: 1000
  },

  // --- Ветка: уволить ---
  {
    id: 'd3_fire_path',
    senderId: 'user',
    type: 'message',
    text: 'У нас лист ожидания. Бастующих увольняем. Нанимаем новых.',
    nextId: 'd3_fire_result',
    isStressful: true
  },
  {
    id: 'd3_fire_result',
    senderId: 'analytics',
    type: 'message',
    text: 'Плохо. TechCrunch написал статью "YumRun увольняет бастующих гиг-работников". Рейтинг в Google Play упал с 4.3 до 3.1 за ночь.',
    nextId: 'd3_fire_karen',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'd3_fire_karen',
    senderId: 'sales',
    type: 'message',
    text: 'KFC разрывает контракт. Они не хотят ассоциироваться с этим. Карен.',
    nextId: 'd3_mcd_crisis',
    delay: 800,
    isStressful: true
  },

  // --- McDonald's Crisis (общий путь) ---
  {
    id: 'd3_mcd_crisis',
    senderId: 'sales',
    type: 'message',
    text: 'Ещё одна проблема: McDonald\'s зафиксировал среднее время доставки 38 минут вместо обещанных 28. Они требуют $50k штрафа по SLA.',
    nextId: 'd3_mcd_2',
    isStressful: true,
    delay: 1000
  },
  {
    id: 'd3_mcd_2',
    senderId: 'dev',
    type: 'message',
    text: 'Это из-за батчинга. Мы склеиваем заказы, но алгоритм не учитывает расстояние между точками доставки.',
    nextId: 'd3_kanban_intro',
    delay: 800
  },
  {
    id: 'd3_kanban_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'СРЕДА ВЕЧЕР: Спринт по алгоритму',
    text: 'Команда собирается на экстренный технический спринт. 8 Story Points до пятницы.',
    nextId: 'kanban_task'
  },
  {
    id: 'kanban_task',
    senderId: 'system',
    type: 'task',
    text: 'Расставьте задачи по приоритету. Capacity: 8 SP.',
    task: {
      type: 'kanban_sort',
      instruction: '8 Story Points. Выберите задачи, которые максимально улучшат время доставки и удовлетворённость McDonald\'s.',
      correctValue: 'ignored',
      onSuccessId: 'day_4_start',
      onFailId: 'kanban_fail',
      data: {
        capacity: 8,
        minImpact: 12,
        tickets: [
          { id: 't1', title: 'Smart Batching 2.0', desc: 'Склейка только заказов в радиусе 400м друг от друга. Убирает главную причину задержек.', type: 'feature', urgency: 'critical', effort: 5, impact: 15 },
          { id: 't2', title: 'ETA Predictor', desc: 'Точный прогноз времени доставки с учётом трафика в реальном времени.', type: 'feature', urgency: 'high', effort: 3, impact: 8 },
          { id: 't3', title: 'Courier Chat', desc: 'Чат поддержки между курьером и клиентом.', type: 'feature', urgency: 'low', effort: 2, impact: 3 },
          { id: 't4', title: 'Dark Store Pilot', desc: 'Собственный склад в центре города. Убирает зависимость от ресторана.', type: 'feature', urgency: 'medium', effort: 8, impact: 6 },
          { id: 't5', title: 'SLA Dashboard', desc: 'Дашборд для партнёров с метриками в реальном времени.', type: 'feature', urgency: 'high', effort: 2, impact: 6 }
        ]
      }
    }
  },
  {
    id: 'kanban_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Приоритизация: Impact vs Effort',
      explanation: 'Smart Batching 2.0 (5 SP, impact 15) + ETA Predictor (3 SP, impact 8) = 8 SP, суммарный impact 23. Это напрямую влияет на McDonald\'s. Dark Store (8 SP, impact 6) — слишком дорого для такого эффекта.',
      takeaway: 'Ищите задачи с наибольшим impact/effort ratio. Сначала — критические блокеры.',
      returnNodeId: 'kanban_task'
    }
  },

  // =============================================
  // ЧЕТВЕРГ: Технический спринт
  // =============================================
  {
    id: 'day_4_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЧЕТВЕРГ: В поте лица',
    text: 'Команда Макса работала всю ночь. Smart Batching 2.0 задеплоен в продакшн.',
    nextId: 'd4_max_tired'
  },
  {
    id: 'd4_max_tired',
    senderId: 'dev',
    type: 'message',
    text: 'Всё задеплоили. Сам сплю сидя. Данные начали поступать — первые 100 батч-пар работают.',
    nextId: 'd4_timur_data',
    delay: 1000
  },
  {
    id: 'd4_timur_data',
    senderId: 'analytics',
    type: 'message',
    text: 'Смотрю в реальном времени: среднее время доставки упало с 38 до 29 минут! И Cost per Delivery снизился с $5 до $3.20.',
    nextId: 'd4_log_intro',
    delay: 800
  },
  {
    id: 'd4_log_intro',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ЧЕТВЕРГ: Аномалия в логах',
    text: 'Мониторинг показал подозрительную активность в системе.',
    nextId: 'd4_log_task'
  },
  {
    id: 'd4_log_task',
    senderId: 'system',
    type: 'task',
    text: 'Проанализируйте логи. Найдите аномальный паттерн.',
    isStressful: true,
    task: {
      type: 'log_analysis',
      instruction: 'Система регистрирует отмены заказов. Найдите строку с подозрительным поведением — возможно, скрипт-бот накручивает отмены, чтобы занять курьеров.',
      correctValue: 'bot_cancel',
      onSuccessId: 'd4_log_success',
      onFailId: 'd4_log_fail',
      hint: "Боты работают с регулярными интервалами и используют скриптовый User-Agent.",
      data: [
        { id: '1', time: '11:02:14', ip: '92.168.1.5', ua: 'YumRun iOS/4.2.1', status: 200, action: 'ORDER_CREATED' },
        { id: '2', time: '11:02:18', ip: '92.168.1.5', ua: 'YumRun iOS/4.2.1', status: 200, action: 'ORDER_CONFIRMED' },
        { id: 'bot_cancel', time: '11:02:19', ip: '185.44.11.3', ua: 'python-requests/2.29.0 CFNetwork', status: 200, action: 'ORDER_CANCEL x47 in 3sec', isError: true },
        { id: '4', time: '11:02:55', ip: '10.0.4.22', ua: 'YumRun Android/4.1.9', status: 200, action: 'ORDER_DELIVERED' }
      ]
    }
  },
  {
    id: 'd4_log_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Детекция ботов в логах',
      explanation: 'Обратите внимание на: User-Agent (python-requests — не мобильное приложение), частоту (47 отмен за 3 секунды — невозможно вручную) и IP-адрес (185.44.x.x — датацентр, не мобильная сеть).',
      takeaway: 'Боты: нечеловеческая скорость + нестандартный UA + IP датацентра.',
      returnNodeId: 'd4_log_task'
    }
  },
  {
    id: 'd4_log_success',
    senderId: 'user',
    type: 'message',
    text: 'Нашли бота. Он создавал фейковые заказы и тут же отменял — занимал курьеров и разрушал метрики. Блокируем IP.',
    nextId: 'd4_max_confirm',
    impact: { budget: +5 }
  },
  {
    id: 'd4_max_confirm',
    senderId: 'dev',
    type: 'message',
    text: 'Заблокировали. Выглядит как атака конкурента. Я добавлю rate limiting — не более 2 отмен в минуту с одного аккаунта.',
    nextId: 'd4_timur_projections',
    delay: 800
  },
  {
    id: 'd4_timur_projections',
    senderId: 'analytics',
    type: 'message',
    text: 'С учётом всех изменений прогноз на пятницу: CM = +$0.30 на заказ. Небольшой плюс, но это уже другой бизнес.',
    nextId: 'd4_final_choice',
    delay: 1000
  },
  {
    id: 'd4_final_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Вечер четверга. Как готовиться к пятнице?',
    choices: [
      {
        text: 'Пушить ещё улучшения — максимальный эффект',
        messageText: 'Есть ещё несколько фич. Пушим всё сегодня ночью, чтобы показать инвесторам максимум.',
        nextId: 'day_5_aggressive',
        impact: { morale: -10, budget: +5 }
      },
      {
        text: 'Заморозить деплои — стабильность важнее',
        messageText: 'Code freeze до понедельника. Не трогаем что работает. Инвесторам покажем стабильный рост.',
        nextId: 'day_5_stable',
        impact: { morale: +5, satisfaction: +5 }
      }
    ]
  },

  // =============================================
  // ПЯТНИЦА НЕДЕЛИ 1: Первые результаты
  // =============================================
  {
    id: 'day_5_aggressive',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПЯТНИЦА: Ставка на риск',
    text: 'Команда задеплоила ещё 3 фичи ночью. Одна вызвала баг в production.',
    nextId: 'd5_bug_1'
  },
  {
    id: 'd5_bug_1',
    senderId: 'dev',
    type: 'message',
    text: 'Алё, у нас 502 в API батчинга. 15% заказов не распределяются. Откатываем?',
    nextId: 'd5_bug_choice',
    isStressful: true,
    delay: 500
  },
  {
    id: 'd5_bug_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Продакшн-инцидент в пятницу вечером:',
    choices: [
      {
        text: 'Откат к стабильной версии',
        messageText: 'Rollback! Возвращаемся к вчерашнему коду. Теряем ночные фичи, но сохраняем стабильность.',
        nextId: 'day_5_results',
        impact: { morale: -5, satisfaction: +5 }
      },
      {
        text: 'Hotfix прямо сейчас',
        messageText: 'Макс, найди баг за 30 минут и задеплой hotfix. Все на связи.',
        nextId: 'day_5_hotfix',
        impact: { morale: -15, budget: -3 }
      }
    ]
  },
  {
    id: 'day_5_hotfix',
    senderId: 'dev',
    type: 'message',
    text: 'Нашёл! Null pointer в проверке радиуса батча. Деплоим через 20 минут.',
    nextId: 'day_5_results',
    delay: 1000
  },
  {
    id: 'day_5_stable',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПЯТНИЦА: Стабильный запуск',
    text: 'Никаких неожиданностей. Система работает. Курьеры работают. Данные льются.',
    nextId: 'day_5_results'
  },
  {
    id: 'day_5_results',
    senderId: 'analytics',
    type: 'message',
    text: 'Финальные цифры за неделю: Cost per Delivery: $3.20 (было $5). CM на заказ: +$0.30 (было −$2). Coverage rate: 87% (было 63%).',
    nextId: 'd5_elena_react',
    delay: 1000
  },
  {
    id: 'd5_elena_react',
    senderId: 'director',
    type: 'message',
    text: 'Это больше чем я ожидала за одну неделю. Но инвесторам нужен стабильный плюс, а не $0.30. Нам нужна вторая неделя сильнее первой.',
    nextId: 'd5_karen_news',
    delay: 1000
  },
  {
    id: 'd5_karen_news',
    senderId: 'sales',
    type: 'message',
    text: 'McDonald\'s отозвал претензию по SLA. 29 минут их устраивает. Но они хотят API для мониторинга времени в реальном времени.',
    nextId: 'd5_w1_choice',
    delay: 800
  },
  {
    id: 'd5_w1_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Стратегия второй недели:',
    choices: [
      {
        text: 'Технология: AI роутинг для сокращения пробегов',
        messageText: 'Вторая неделя — масштабируем технологию. ML-роутинг сократит пробег курьера на 25%.',
        nextId: 'w2_start',
        impact: { budget: +5, morale: -5 }
      },
      {
        text: 'Партнёрства: новые рестораны с лучшими условиями',
        messageText: 'Идём в B2B. Привлекаем рестораны с более высоким средним чеком — это поднимет AOV.',
        nextId: 'w2_start',
        impact: { budget: +8, satisfaction: +5 }
      }
    ]
  },

  // =============================================
  // НЕДЕЛЯ 2 — ПОНЕДЕЛЬНИК: Конкурент
  // =============================================
  {
    id: 'w2_start',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. ПОНЕДЕЛЬНИК: Удар конкурента',
    text: 'Новая неделя — новые вводные. Рынок не стоит на месте.',
    nextId: 'd6_competitor_news'
  },
  {
    id: 'd6_competitor_news',
    senderId: 'sales',
    type: 'message',
    text: 'Экстренно: DeliverX объявили "Zero Delivery Fee" на весь следующий месяц. У них раунд $50М, они готовы жечь кэш.',
    nextId: 'd6_competitor_2',
    isStressful: true,
    delay: 500
  },
  {
    id: 'd6_competitor_2',
    senderId: 'analytics',
    type: 'message',
    text: 'Уже вижу сигнал в данных: DAU упал на 8% за утро. Курьеры тоже смотрят — их приложение платит на $1 больше за поездку.',
    nextId: 'd6_competitor_3',
    delay: 800,
    isStressful: true
  },
  {
    id: 'd6_competitor_3',
    senderId: 'dev',
    type: 'message',
    text: 'Я посмотрел их APK — у них нет батчинга. Они просто жгут деньги на субсидии. Долго так не протянут.',
    nextId: 'd6_elena_pressure',
    delay: 800
  },
  {
    id: 'd6_elena_pressure',
    senderId: 'director',
    type: 'message',
    text: 'Не протянут — это хорошо. Но нам нужно пережить следующие 4 недели их атаки. Какой ответ?',
    nextId: 'd6_response_choice',
    delay: 1000,
    isStressful: true
  },
  {
    id: 'd6_response_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Ответ на атаку конкурента:',
    choices: [
      {
        text: 'Ценовая война: тоже обнулить доставку',
        messageText: 'Бьём симметрично. Убираем комиссию на следующие 2 недели. Держим клиентов.',
        nextId: 'd6_price_war',
        impact: { budget: -20, satisfaction: +10 }
      },
      {
        text: 'Качество: гарантировать 25 минут доставки',
        messageText: 'Не можем соревноваться ценой — соревнуемся скоростью. "Гарантия 25 минут или скидка 30%".',
        nextId: 'd6_quality_play',
        impact: { budget: -5, satisfaction: +15 }
      },
      {
        text: 'B2B: уйти в корпоративные обеды',
        messageText: 'Открываем корпоративное направление. Офисы, стабильные объёмы, нет гиг-зависимости.',
        nextId: 'd6_b2b_play',
        impact: { budget: +10, satisfaction: -5 }
      }
    ]
  },

  {
    id: 'd6_price_war',
    senderId: 'analytics',
    type: 'message',
    text: 'Если они жгут по $500k/нед, а мы по $300k — они сдадутся раньше. Но это риск: если у них больше runway...',
    nextId: 'w2_tue',
    delay: 800
  },
  {
    id: 'd6_quality_play',
    senderId: 'dev',
    type: 'message',
    text: 'Это интересно. Наш Smart Batching даёт нам real advantage в скорости. Нужен алгоритм мониторинга SLA в real-time.',
    nextId: 'w2_tue',
    delay: 800
  },
  {
    id: 'd6_b2b_play',
    senderId: 'sales',
    type: 'message',
    text: 'Отлично! У меня уже есть контакты в пяти компаниях. Корпораты платят стабильно и не уходят из-за $1 разницы в доставке.',
    nextId: 'w2_tue',
    delay: 800
  },

  // =============================================
  // НЕДЕЛЯ 2 — ВТОРНИК: Технологии
  // =============================================
  {
    id: 'w2_tue',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. ВТОРНИК: Данные решают',
    text: 'Тимур собрал полный аналитический отчёт по эффективности курьеров.',
    nextId: 'd7_analytics_deep'
  },
  {
    id: 'd7_analytics_deep',
    senderId: 'analytics',
    type: 'message',
    text: 'Нашёл паттерн: 20% лучших курьеров делают 55% прибыльных доставок. Их отличие — они работают в плотных зонах и принимают батчинг.',
    nextId: 'd7_analytics_2',
    delay: 1000
  },
  {
    id: 'd7_analytics_2',
    senderId: 'analytics',
    type: 'message',
    text: 'Если мы сможем направить 30% больше заказов этим "звёздным" курьерам — CM вырастет ещё на $0.50.',
    nextId: 'd7_sql_intro',
    delay: 800
  },
  {
    id: 'd7_sql_intro',
    senderId: 'dev',
    type: 'message',
    text: 'Тимур, сделай выборку этих звёздных курьеров. Нам нужен SQL-запрос для таргетирования.',
    nextId: 'd7_sql_task',
    delay: 600
  },
  {
    id: 'd7_sql_task',
    senderId: 'system',
    type: 'task',
    text: 'Напишите SQL для поиска "звёздных" курьеров.',
    task: {
      type: 'sql_query',
      instruction: 'Найти курьеров: рейтинг > 4.7, принятых батч-заказов > 50%, выполненных поездок > 100 за месяц.',
      correctValue: 'query_stars',
      onSuccessId: 'd7_sql_success',
      onFailId: 'd7_sql_fail',
      data: [
        { id: 'query_all', text: 'SELECT * FROM couriers WHERE rating > 4.7' },
        { id: 'query_stars', text: 'SELECT id FROM couriers WHERE rating > 4.7 AND batch_rate > 0.5 AND monthly_trips > 100' },
        { id: 'query_wrong', text: 'SELECT id FROM couriers ORDER BY rating DESC LIMIT 100' }
      ]
    }
  },
  {
    id: 'd7_sql_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'SQL: Составные условия',
      explanation: 'Нам нужны ВСЕ три условия одновременно: высокий рейтинг (качество), высокий batch_rate (готовность к батчингу) И большой объём поездок (опыт). ORDER BY + LIMIT выбирает только по одному критерию.',
      takeaway: 'Используйте AND для фильтрации по нескольким критериям одновременно.',
      returnNodeId: 'd7_sql_task'
    }
  },
  {
    id: 'd7_sql_success',
    senderId: 'analytics',
    type: 'message',
    text: 'Нашли 847 "звёздных" курьеров из 4 200 активных. Отправим им приоритетный поток заказов.',
    nextId: 'd7_max_concern',
    impact: { budget: +5 },
    delay: 800
  },
  {
    id: 'd7_max_concern',
    senderId: 'dev',
    type: 'message',
    text: 'Справедливо ли это? Остальные курьеры получат меньше заказов. Они уйдут.',
    nextId: 'd7_choice',
    delay: 800
  },
  {
    id: 'd7_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Как запустить программу Star Courier?',
    choices: [
      {
        text: 'Тихо: менять алгоритм без объявления',
        messageText: 'Меняем приоритизацию без объяснений. Меньше шума, проще откатить.',
        nextId: 'w2_wed',
        impact: { morale: -8 }
      },
      {
        text: 'Открыто: объявить "Программу партнёрства"',
        messageText: 'Объявляем публично: Star Couriers получают приоритет, премиум-бейдж и дополнительные бонусы. Любой может войти.',
        nextId: 'w2_wed',
        impact: { morale: +10, budget: -3 }
      }
    ]
  },

  // =============================================
  // НЕДЕЛЯ 2 — СРЕДА: Ресторанный бунт
  // =============================================
  {
    id: 'w2_wed',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. СРЕДА: Переговоры',
    text: 'Партнёрские рестораны услышали о изменениях и назначили встречу.',
    nextId: 'd8_restaurant_call'
  },
  {
    id: 'd8_restaurant_call',
    senderId: 'sales',
    type: 'message',
    text: 'Сегодня в 14:00 — созвон с 12 ключевыми ресторанами. Они злятся на повышение комиссии и хотят объяснений.',
    nextId: 'd8_karen_prep',
    delay: 800
  },
  {
    id: 'd8_karen_prep',
    senderId: 'sales',
    type: 'message',
    text: 'Я подготовила pitch: показываем им данные роста заказов после наших улучшений. Рестораны получили на 18% больше заказов за неделю благодаря нашему алгоритму.',
    nextId: 'd8_timur_data',
    delay: 800
  },
  {
    id: 'd8_timur_data',
    senderId: 'analytics',
    type: 'message',
    text: 'Подтверждаю. Средний ресторан получает 47 заказов в день vs 40 неделю назад. Рост 17.5%. Это их аргумент.',
    nextId: 'd8_partner_choice',
    delay: 800
  },
  {
    id: 'd8_partner_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Позиция на переговорах с ресторанами:',
    choices: [
      {
        text: 'Твёрдо держать повышенную комиссию (28%)',
        messageText: 'Мы вышли в плюс благодаря этим изменениям. Комиссия остаётся 28%. Данные на нашей стороне.',
        nextId: 'd8_firm_path',
        impact: { budget: +10, satisfaction: -10 }
      },
      {
        text: 'Снизить до 25% для топ-партнёров',
        messageText: 'Предложим loyalty deal: для ресторанов с объёмом >200 заказов/день — комиссия 25%.',
        nextId: 'd8_loyalty_path',
        impact: { budget: -5, satisfaction: +10 }
      },
      {
        text: 'Дать им инструменты аналитики бесплатно',
        messageText: 'Вместо скидки — бесплатный доступ к дашборду с аналитикой их заказов. Ценность без прямых затрат.',
        nextId: 'd8_data_path',
        impact: { budget: 0, satisfaction: +5, morale: +5 }
      }
    ]
  },
  {
    id: 'd8_firm_path',
    senderId: 'sales',
    type: 'message',
    text: 'Двое ушли. Восемь остались с данными роста. Хорошо держались.',
    nextId: 'w2_thu',
    delay: 1000
  },
  {
    id: 'd8_loyalty_path',
    senderId: 'sales',
    type: 'message',
    text: 'Все 12 подписали. McDonald\'s расширяет контракт на следующий год. Потеряли немного в марже, но сохранили отношения.',
    nextId: 'w2_thu',
    delay: 1000
  },
  {
    id: 'd8_data_path',
    senderId: 'sales',
    type: 'message',
    text: 'Неожиданно сработало отлично. Они хотели контроль и прозрачность. Дашборд дал им это. Все остались.',
    nextId: 'w2_thu',
    delay: 1000
  },

  // =============================================
  // НЕДЕЛЯ 2 — ЧЕТВЕРГ: Финальный расчёт
  // =============================================
  {
    id: 'w2_thu',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'НЕДЕЛЯ 2. ЧЕТВЕРГ: Финальный подсчёт',
    text: 'Завтра встреча с инвесторами. Тимур строит финальную модель.',
    nextId: 'd9_timur_model'
  },
  {
    id: 'd9_timur_model',
    senderId: 'analytics',
    type: 'message',
    text: 'Хочу показать инвесторам прогноз на 3 месяца вперёд. Нужно правильно рассчитать break-even при масштабировании.',
    nextId: 'd9_calc_task'
  },
  {
    id: 'd9_calc_task',
    senderId: 'system',
    type: 'task',
    text: 'Рассчитайте точку безубыточности для роста x3.',
    task: {
      type: 'calculation',
      instruction: 'Сейчас: 10,000 заказов/день, CM = +$0.80/заказ. Фикс. затраты: $15,000/день. При росте до 30,000 заказов — фикс. затраты вырастут лишь до $18,000/день (Scale). Что будет прибыль при 30k заказах?',
      correctValue: 'calc_6000',
      onSuccessId: 'd9_calc_success',
      onFailId: 'd9_calc_fail',
      hint: "Прибыль = (30,000 × $0.80) − $18,000 = $24,000 − $18,000 = $6,000/день",
      data: {
        options: [
          { id: 'calc_loss', label: 'Убыток $6,000/день (масштаб не помогает)' },
          { id: 'calc_zero', label: 'Ноль (безубыточность при 30k)' },
          { id: 'calc_6000', label: 'Прибыль $6,000/день (Scale работает!)' },
          { id: 'calc_24000', label: 'Прибыль $24,000/день (забыли фикс. затраты)' }
        ]
      }
    }
  },
  {
    id: 'd9_calc_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Scale Economics',
      explanation: 'При росте до 30k заказов: Переменная прибыль = 30,000 × $0.80 = $24,000. Фикс. затраты с учётом масштаба = $18,000. Итог: $24,000 − $18,000 = $6,000/день прибыли. Это и есть сила масштабирования.',
      takeaway: 'Фиксированные затраты растут медленнее выручки — это ключевой аргумент для инвесторов.',
      returnNodeId: 'd9_calc_task'
    }
  },
  {
    id: 'd9_calc_success',
    senderId: 'user',
    type: 'message',
    text: 'При x3 росте — $6,000 прибыли в день. Это $180k в месяц. Это уже хороший бизнес.',
    nextId: 'd9_timur_confirm',
    impact: { budget: +5 }
  },
  {
    id: 'd9_timur_confirm',
    senderId: 'analytics',
    type: 'message',
    text: 'И это консервативный сценарий. Если добавим корпоративный сегмент — может быть х5.',
    nextId: 'd9_elena_proud',
    delay: 800
  },
  {
    id: 'd9_elena_proud',
    senderId: 'director',
    type: 'message',
    text: 'Впервые за полгода у нас позитивный прогноз. Завтра покажем инвесторам правду — без прикрас.',
    nextId: 'w2_fri',
    delay: 1000
  },

  // =============================================
  // ПЯТНИЦА НЕДЕЛИ 2: Встреча с инвесторами
  // =============================================
  {
    id: 'w2_fri',
    senderId: 'system',
    type: 'day_change',
    dayTitle: 'ПЯТНИЦА: Совет инвесторов',
    text: 'Час X. Инвесторы в конференц-зале. Вы берёте слово.',
    nextId: 'd10_board_start',
    isStressful: true
  },
  {
    id: 'd10_board_start',
    senderId: 'user',
    type: 'message',
    text: 'Две недели назад мы теряли $2 на каждом заказе. Сегодня — зарабатываем $0.80. Вот что мы сделали и почему это масштабируется.',
    nextId: 'd10_investor_reaction',
    impact: { satisfaction: +5 }
  },
  {
    id: 'd10_investor_reaction',
    senderId: 'investor',
    type: 'message',
    text: 'Впечатляет поворот. Но мне интересно другое: как вы удержите это преимущество? DeliverX не спит.',
    nextId: 'd10_final_task',
    delay: 1000
  },
  {
    id: 'd10_final_task',
    senderId: 'system',
    type: 'task',
    text: 'Выберите главный sustainable competitive advantage для презентации инвестором.',
    task: {
      type: 'feature_spec',
      instruction: 'Что является настоящим долгосрочным конкурентным преимуществом YumRun?',
      correctValue: 'algo_moat',
      onSuccessId: 'd10_spec_success',
      onFailId: 'd10_spec_fail',
      data: {
        tickets: [
          { id: 'algo_moat', title: 'Алгоритмический ров: Smart Batching + Star Courier', desc: 'Данные и алгоритм, которые конкурент не скопирует за месяц. Каждый день собираем больше данных — алгоритм становится лучше.', type: 'fix' },
          { id: 'price_moat', title: 'Ценовое преимущество: самая дешёвая доставка', desc: 'DeliverX тоже даёт бесплатную доставку. Ценовое преимущество не длится.', type: 'bug' },
          { id: 'brand_moat', title: 'Бренд: "Мы любим курьеров"', desc: 'После конфликта с профсоюзом это слабый аргумент.', type: 'lazy' },
          { id: 'scale_moat', title: 'Масштаб: мы больше всех', desc: 'DeliverX быстро растёт на венчурные деньги. Размер не защита.', type: 'lazy' }
        ]
      }
    }
  },
  {
    id: 'd10_spec_fail',
    senderId: 'system',
    type: 'learning',
    learningContent: {
      title: 'Sustainable Competitive Advantage',
      explanation: 'Цена — легко скопировать. Бренд — сложно поддерживать при проблемах. Размер — временно. Алгоритм и данные — это настоящий ров: чем больше поездок, тем лучше ML-модель, тем эффективнее батчинг, тем ниже Cost per Delivery.',
      takeaway: 'Лучший "ров" — это то, что конкурент не может купить или скопировать быстро.',
      returnNodeId: 'd10_final_task'
    }
  },
  {
    id: 'd10_spec_success',
    senderId: 'user',
    type: 'message',
    text: 'Наш ров — данные и алгоритм. Каждые 10 000 поездок делают нашу модель лучше. DeliverX начинает с нуля — мы уже на 3 миллионах.',
    nextId: 'd10_investor_impressed',
    impact: { satisfaction: +10 }
  },
  {
    id: 'd10_investor_impressed',
    senderId: 'investor',
    type: 'message',
    text: 'Это я понимаю. Сколько нужно для выхода на 30,000 заказов в день?',
    nextId: 'd10_elena_close',
    delay: 1000
  },
  {
    id: 'd10_elena_close',
    senderId: 'director',
    type: 'message',
    text: '$3М на 6 месяцев. При выходе на unit economics +$0.80 — это последний раунд перед прибыльностью.',
    nextId: 'ending_choice',
    delay: 1000
  },
  {
    id: 'ending_choice',
    senderId: 'system',
    type: 'choice',
    text: 'Инвестор думает. Ваш финальный аргумент:',
    choices: [
      {
        text: 'Предложить co-investment board seat',
        messageText: 'Приглашаем инвестора в совет директоров. Transparency за деньги.',
        nextId: 'ending_success_1',
        impact: { budget: +20, satisfaction: +5 }
      },
      {
        text: 'Просто дать время — молчание сильнее',
        messageText: 'Данные говорят сами за себя. Ждём.',
        nextId: 'ending_success_2',
        impact: { satisfaction: +5 }
      }
    ]
  },

  // --- ENDINGS ---
  {
    id: 'ending_success_1',
    senderId: 'director',
    type: 'ending',
    text: 'Раунд закрыт. $3.5M с board seat. Инвестор стал союзником. За 2 недели ты перевернул бизнес-модель и привлёк финансирование. Это и есть работа PM уровня COO.',
  },
  {
    id: 'ending_success_2',
    senderId: 'director',
    type: 'ending',
    text: 'Инвестор позвонил утром: "Всё понял. Делаю $3M. Без условий." Иногда лучший аргумент — это тишина и данные. Блестящая работа.',
  },
  {
    id: 'ending_fail',
    senderId: 'director',
    type: 'ending',
    text: 'Мы всё ещё в убытке. Инвесторы не закрыли раунд. Проект закрывается через 30 дней. Иногда двух недель недостаточно — но это ценный опыт.',
  }
];
