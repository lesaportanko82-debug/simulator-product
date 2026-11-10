// Глубина симуляций: флаги решений, отложенные последствия, настоящие ветки и разные финалы.
// Модуль дорабатывает исходные сценарии на месте (один раз при импорте).
import { DAY_1_SCENARIO, type SimulationNode as N } from './simulator-scenarios';
import { TAXI_SCENARIO } from './simulator-taxi';
import { FOOD_SCENARIO } from './simulator-food';
import { DISCOVERY_SCENARIO } from './discovery-scenario';

type Choice = NonNullable<N['choices']>[number];

function kit(S: N[]) {
  const get = (id: string): N => {
    const n = S.find((x) => x.id === id);
    if (!n) throw new Error(`scenario-depth: нет узла ${id}`);
    return n;
  };
  const add = (...ns: N[]) => {
    for (const n of ns) {
      if (S.some((x) => x.id === n.id)) throw new Error(`scenario-depth: дубль ${n.id}`);
      S.push(n);
    }
  };
  const msg = (id: string, senderId: string, text: string, nextId: string): N => ({ id, senderId, type: 'message', text, nextId });
  const day = (id: string, text: string, nextId: string): N => ({ id, senderId: 'system', type: 'day_change', text, nextId });
  const router = (id: string, flagRoutes: { flag: string; nextId: string }[], nextId: string): N => ({ id, senderId: 'system', type: 'router', flagRoutes, nextId });
  const choice = (id: string, text: string, choices: Choice[]): N => ({ id, senderId: 'system', type: 'choice', text, choices });
  const ending = (id: string, senderId: string, endingTitle: string, text: string): N => ({ id, senderId, type: 'ending', endingTitle, text });
  const flags = (nodeId: string, idx: number, f: string[]) => {
    const c = get(nodeId).choices![idx];
    c.setFlags = [...(c.setFlags || []), ...f];
  };
  const title = (id: string, t: string) => { get(id).endingTitle = t; };
  return { get, add, msg, day, router, choice, ending, flags, title };
}

function once(S: N[], fn: () => void) {
  const anyS = S as any;
  if (anyS.__depth) return;
  anyS.__depth = true;
  fn();
}

// ─────────────────────────── TAXI (CityCab) ───────────────────────────
once(TAXI_SCENARIO, () => {
  const k = kit(TAXI_SCENARIO);
  k.flags('strategy_choice', 0, ['commission_cut']);
  k.flags('strategy_choice', 1, ['surge']);
  k.flags('strategy_choice', 2, ['guarantee']);

  // Реактивация: третий вариант с нагрузочным тестом смягчает будущий инцидент
  k.flags('d2_tech_choice', 0, ['hardcoded']);
  k.get('d2_tech_choice').choices!.push({
    text: 'Хардкод к среде, но с feature flag и ночным нагрузочным тестом',
    nextId: 'd2_loadtest',
    impact: { morale: -5, satisfaction: 6, budget: -3 },
    setFlags: ['load_tested'],
  });
  k.add(k.msg('d2_loadtest', 'dev', 'Ночью прогнали нагрузку x5. Нашли узкое место в сервисе бонусов, подняли лимиты и поставили флаг — если что, отрежем трафик за минуту.', 'day_3_start'));
  k.get('day_3_start').nextId = 'r_d3_load';
  k.get('d3_delay_pain').nextId = 'r_d3_load';
  k.add(
    k.router('r_d3_load', [{ flag: 'load_tested', nextId: 'd3_minor_alert' }], 'load_alert'),
    k.msg('d3_minor_alert', 'dev', 'Пик в 07:05: 3 000 водителей открыли бонус одновременно. Нагрузка выросла в 4 раза, но лимиты выдержали. Время ответа +300 мс, без падений. Тест окупился.', 'd3_post_incident'),
  );

  // Откат больше не обрывает игру: отдельная ветка с восстановлением доверия
  const inc = k.get('incident_choice').choices!;
  inc[0].nextId = 'd3_rollback';
  inc[0].setFlags = ['rolled_back'];
  k.add(
    k.msg('d3_rollback', 'dev', 'Откатили за 3 минуты. Сервис жив, но бонус, который мы вчера анонсировали, исчез у водителей прямо на глазах.', 'd3_rollback_2'),
    k.msg('d3_rollback_2', 'support', 'В чатах водителей: «Опять обманули». 300 жалоб за час. Те, кто вернулся вчера, снова смотрят на FastRide.', 'd3_rollback_choice'),
    k.choice('d3_rollback_choice', 'Как вернуть доверие водителей после отката?', [
      { text: 'Вернуть бонус через 24 часа — с извинением и удвоенной суммой', nextId: 'd3_rb_double', impact: { budget: -10, satisfaction: 10, morale: 5 } },
      { text: 'Персонально позвонить 1 847 рисковым водителям и объяснить, что случилось', nextId: 'd3_rb_calls', impact: { morale: -5, satisfaction: 8 } },
      { text: 'Ничего не делать: стабильность важнее, бонусы потом', nextId: 'd3_rb_none', impact: { satisfaction: -12 }, setFlags: ['trust_broken'] },
    ]),
    k.msg('d3_rb_double', 'support', 'Сработало: «Ошиблись — признали — исправили». Возвраты водителей восстановились к вечеру, но бюджет на кампанию вырос вдвое.', 'd3_post_incident'),
    k.msg('d3_rb_calls', 'support', 'Команда сделала 600 звонков за день. Водители ценят, что с ними говорят люди, а не пуши. Возвращаются медленнее, но надёжнее.', 'd3_post_incident'),
    k.msg('d3_rb_none', 'analytics', 'За сутки ушли ещё 320 водителей. В отзывах: «CityCab обещает и забирает». Это запомнят.', 'd3_post_incident'),
  );

  // Утечка: третий вариант и отложенное последствие у регулятора
  k.flags('d4_response_choice', 0, ['silent_leak']);
  k.get('d4_response_choice').choices!.push({
    text: 'Уведомить Роскомнадзор в течение суток по 152-ФЗ, затем письмо водителям и публичное заявление',
    nextId: 'd4_regulator_first',
    impact: { budget: -5, satisfaction: 12, morale: 5 },
    setFlags: ['leak_reported'],
  });
  k.add(k.msg('d4_regulator_first', 'legal', 'Уведомили регулятора в срок, как требует закон, и только потом вышли публично. Когда журналисты пришли с вопросами, у нас уже были хронология и план мер.', 'day_5_start'));

  // Фокус недели 2: настоящие ветки вместо одного узла
  const w1 = k.get('d5_w1_choice').choices!;
  w1[0].nextId = 'w2_ml_focus'; w1[0].setFlags = ['focus_ml'];
  w1[1].nextId = 'w2_loyalty_focus'; w1[1].setFlags = ['focus_loyalty'];
  w1.push({ text: 'Оба направления, по половине команды', nextId: 'w2_split_focus', impact: { morale: -10, satisfaction: 3 }, setFlags: ['focus_split'] });
  k.add(
    k.msg('w2_ml_focus', 'dev', 'Вся ML-команда на диспетчеризации. A/B-тест на 30% водителей будет ко вторнику.', 'w2_start'),
    k.msg('w2_loyalty_focus', 'support', 'Запускаем Bronze/Silver/Gold. Gold — приоритет в аэропорту и сниженная комиссия. Водители уже спрашивают, как туда попасть.', 'w2_loyalty_2'),
    k.msg('w2_loyalty_2', 'analytics', 'Важно: Gold получат 15% водителей, но они делают 40% поездок. Комиссия для них снизится — посмотрим, окупится ли это удержанием.', 'w2_start'),
    k.msg('w2_split_focus', 'dev', 'Делим команду. Честно: и тест алгоритма, и ранги будут вдвое медленнее. Посмотрим, хватит ли нас.', 'w2_start'),
  );

  // Отложенное: скрытая утечка всплывает у регулятора
  k.get('w2_start').nextId = 'r_w2_leak';
  k.add(
    k.router('r_w2_leak', [{ flag: 'silent_leak', nextId: 'd6_leak_probe' }], 'd6_regulator'),
    k.msg('d6_leak_probe', 'legal', 'Плохая новость. Регулятор узнал об утечке данных водителей из статьи, а не от нас. Кроме запроса о минимальной оплате пришёл запрос о сокрытии инцидента.', 'd6_leak_choice'),
    k.choice('d6_leak_choice', 'Как отвечаем регулятору об утечке?', [
      { text: 'Признать, предоставить хронологию, логи и план мер', nextId: 'd6_leak_admit', impact: { budget: -8, satisfaction: 5 } },
      { text: 'Настаивать, что утечки не было', nextId: 'd6_leak_deny', impact: { budget: -15, satisfaction: -10, morale: -5 }, setFlags: ['trust_broken'] },
    ]),
    k.msg('d6_leak_admit', 'legal', 'Штраф будет, но меньше, и нас не записали в компании, которые скрывают инциденты. Урок: молчание стоило дороже честности.', 'd6_regulator'),
    k.msg('d6_leak_deny', 'legal', 'Регулятор запросил логи — они показали выгрузку. Штраф, предписание и вторая волна статей. Теперь к любым нашим данным будет недоверие.', 'd6_regulator'),
  );

  // Отложенное: выбранный фокус недели 2 меняет результаты вторника
  k.get('w2_tue').nextId = 'r_w2_tue';
  k.add(
    k.router('r_w2_tue', [
      { flag: 'focus_loyalty', nextId: 'd7_loyalty_results' },
      { flag: 'focus_split', nextId: 'd7_split_results' },
    ], 'd7_oleg_results'),
    k.msg('d7_loyalty_results', 'analytics', 'Ранги работают: отток Gold-водителей за неделю — 2% против 9% у остальных. Но ML-тест запустили только на 10% водителей, выводы по нему пока слабее.', 'd7_oleg_results'),
    k.msg('d7_split_results', 'dev', 'Успели оба направления, но наполовину: ранги без приоритета в аэропорту, тест — только на 15% водителей. Двое в команде просят отгул.', 'd7_oleg_results'),
  );

  // Отложенное: персональные цены и сниженная комиссия всплывают перед советом
  k.flags('ai_taxi_choice', 0, ['personal_pricing']);
  k.get('w2_thu').nextId = 'r_w2_thu';
  k.add(
    k.router('r_w2_thu', [{ flag: 'personal_pricing', nextId: 'd9_fas_letter' }], 'd9_sara_final'),
    k.msg('d9_fas_letter', 'legal', 'Пришёл запрос антимонопольной службы: проверка ценообразования по данным пассажиров. Скриншоты с разницей в 40% приложили к жалобе.', 'd9_fas_choice'),
    k.choice('d9_fas_choice', 'Что делаем с персональным ценообразованием?', [
      { text: 'Отключить модель, вернуть разницу пассажирам и опубликовать правила цены', nextId: 'd9_fas_fix', impact: { budget: -10, satisfaction: 10 } },
      { text: 'Оставить и доказывать, что это «динамическая цена»', nextId: 'd9_fas_fight', impact: { budget: -5, satisfaction: -15 }, setFlags: ['trust_broken'] },
    ]),
    k.msg('d9_fas_fix', 'legal', 'Проверку закрыли с предупреждением. Пассажиры оценили возврат денег — в соцсетях пишут «признали ошибку».', 'd9_sara_final'),
    k.msg('d9_fas_fight', 'legal', 'Проверка продлена на 3 месяца. Это будет висеть над раундом и над каждой нашей пресс-новостью.', 'd9_sara_final'),
  );

  k.get('d10_investor_q').nextId = 'r_d10_q';
  k.add(
    k.router('r_d10_q', [{ flag: 'commission_cut', nextId: 'd10_margin_q' }], 'd10_final_choice'),
    k.msg('d10_margin_q', 'investor', 'И ещё вопрос. Вы навсегда снизили комиссию до 12%. При текущем объёме это минус к марже каждой поездки. Как вы собираетесь зарабатывать через год?', 'd10_margin_choice'),
    k.choice('d10_margin_choice', 'Ваш ответ о марже:', [
      { text: 'Показать расчёт: рост загрузки водителей и меньше простоев окупают комиссию к 6-му месяцу', nextId: 'd10_margin_calc', impact: { satisfaction: 5 } },
      { text: 'Предложить вернуть комиссию к 18% для новых водителей, сохранив 12% для текущих', nextId: 'd10_margin_tier', impact: { budget: 10, morale: -5 } },
    ]),
    k.msg('d10_margin_calc', 'investor', 'Расчёт убедительный, если загрузка удержится. Я буду смотреть на неё каждый месяц.', 'd10_final_choice'),
    k.msg('d10_margin_tier', 'investor', 'Разумный компромисс по марже. Но водители узнают, что новичкам хуже, — готовьтесь объяснять это в чатах.', 'd10_final_choice'),
  );

  // Финал: последствия всей игры
  const fin = k.get('d10_final_choice').choices!;
  fin[0].nextId = 'r_end_hero';
  fin.push({ text: 'Показать честно: что работает, какие риски и при каких метриках мы остановим рост', nextId: 'r_end_hero', impact: { satisfaction: 8, morale: 5 } });
  k.add(k.router('r_end_hero', [
    { flag: 'trust_broken', nextId: 'ending_stable' },
    { flag: 'rolled_back', nextId: 'ending_stable' },
  ], 'ending_hero'));
  k.title('ending_hero', 'Технология стала рвом');
  k.title('ending_bold', 'Ставка на масштаб');
  k.title('ending_stable', 'Выжили, но упустили окно');
  k.title('ending_bad', 'Рынок потерян');
  k.get('ending_stable').text = 'CityCab выжил, но совет одобрил только половину плана. Инвесторы помнят откат бонуса и истории, которые подорвали доверие водителей и пассажиров. Технология сильная, но репутацию придётся восстанавливать дольше, чем строился алгоритм.';
});

// ─────────────────────────── FINTECH (GreenBank) ───────────────────────────
once(DAY_1_SCENARIO, () => {
  const k = kit(DAY_1_SCENARIO);

  // Третий вариант: скрыть проблему — всплывёт через 4 недели
  k.get('p0_crisis_choice').choices!.push({
    text: 'Промолчать: до запуска 8 недель, успеем дотестировать тихо',
    nextId: 'p0_hide',
    impact: { morale: 5 },
    setFlags: ['hid_uat'],
  });
  k.add(k.msg('p0_hide', 'cto', 'Понял. Не буду поднимать шум. Но если CEO узнает сам — разговор будет тяжёлым. И для меня тоже.', 'p0_end'));

  k.flags('w1_design_choice', 0, ['stealth_risk']);

  // Carbon: настоящие ветки
  const cb = k.get('w1_carbon_choice').choices!;
  cb[0].nextId = 'w1_carbon_yes'; cb[0].setFlags = ['carbon_delay'];
  cb[1].nextId = 'w1_carbon_no';
  k.add(
    k.msg('w1_carbon_yes', 'cto', 'Подписал поставщика в Германии. Первая партия через 4 недели после согласования образцов. Сдвигаю план релиза.', 'w1_carbon_yes_2'),
    k.msg('w1_carbon_yes_2', 'marketing', 'Переношу дату в листе ожидания. Часть людей точно остынет — нужен контент, чтобы удержать интерес эти 4 недели.', 'w2_start'),
    k.msg('w1_carbon_no', 'marketing', 'Принято, Premium Classic. Carbon оставим на лимитированную серию к Новому году — будет повод для второй волны.', 'w2_start'),
  );

  // Отложенное: Mastercard и Stealth
  k.get('w3_start').nextId = 'r_w3_mps';
  k.add(
    k.router('r_w3_mps', [{ flag: 'stealth_risk', nextId: 'w3_mps_review' }], 'w3_aml_task_intro'),
    k.msg('w3_mps_review', 'legal', 'Mastercard вернул макет Stealth: имя микрошрифтом на ребре не проходит требования. Тираж для листа ожидания уже заказан.', 'w3_mps_choice'),
    k.choice('w3_mps_choice', 'Что делаем с тиражом Stealth?', [
      { text: 'Перепечатать тираж с именем на обороте', nextId: 'w3_mps_reprint', impact: { budget: -12, morale: -5 } },
      { text: 'Сделать Stealth коллекционной карточкой-подарком, а платёжную — Premium Classic', nextId: 'w3_mps_gift', impact: { budget: -5, satisfaction: 5 } },
    ]),
    k.msg('w3_mps_reprint', 'marketing', 'Перепечатаем за 10 дней. Unboxing-видео с «той самой» картой уже набрали просмотры — придётся объяснять подписчикам, почему карта выглядит иначе.', 'w3_aml_task_intro'),
    k.msg('w3_mps_gift', 'marketing', 'Отличный ход: «Stealth Collector Card» в коробке вместе с платёжной. Инфлюенсеры восприняли это как бонус, а не как отказ.', 'w3_aml_task_intro'),
  );

  // Отложенное: CEO узнаёт о скрытом UAT; Carbon охлаждает лист ожидания
  k.get('w4_start').nextId = 'r_w4_a';
  k.add(
    k.router('r_w4_a', [{ flag: 'hid_uat', nextId: 'w4_ceo_found' }], 'r_w4_b'),
    k.msg('w4_ceo_found', 'ceo', 'Мне сегодня сказал член совета: UAT был на 60% ещё в твой первый день. Почему я узнаю об этом последним?', 'w4_ceo_choice'),
    k.choice('w4_ceo_choice', 'Ответ CEO:', [
      { text: 'Признать ошибку и показать план: что дотестировали, что осталось, какие риски', nextId: 'w4_ceo_admit', impact: { satisfaction: -5, morale: 5 } },
      { text: 'Сослаться на предыдущего PM: «Это было до меня»', nextId: 'w4_ceo_blame', impact: { morale: -10, satisfaction: -10 }, setFlags: ['trust_damage'] },
    ]),
    k.msg('w4_ceo_admit', 'ceo', 'Неприятно, но план толковый. Договоримся: плохие новости я узнаю от тебя первым. Всегда.', 'r_w4_b'),
    k.msg('w4_ceo_blame', 'ceo', 'Это было до тебя, но молчал уже ты. Теперь каждую твою цифру я буду перепроверять.', 'r_w4_b'),
    k.router('r_w4_b', [{ flag: 'carbon_delay', nextId: 'w4_carbon_wait' }], 'w4_apple_reject'),
    k.msg('w4_carbon_wait', 'marketing', 'Из-за переноса ради Carbon 18% листа ожидания отписались от рассылки. Зато у оставшихся конверсия в предзаказ выше — карта стала объектом желания.', 'w4_apple_reject'),
  );

  // Триаж: решение о безопасности возвращается через неделю
  k.flags('w5_triage_choice', 2, ['skip_security']);
  k.flags('w5_triage_choice', 1, ['skip_security']);
  k.get('w6_start').nextId = 'r_w6_sec';
  k.add(
    k.router('r_w6_sec', [{ flag: 'skip_security', nextId: 'w6_breach' }], 'w6_influencer'),
    k.msg('w6_breach', 'risk', 'Card enumeration, который мы отложили, сработал: злоумышленники подобрали данные 312 карт и провели мелкие списания. Клиенты пишут в поддержку и в соцсети.', 'w6_breach_choice'),
    k.choice('w6_breach_choice', 'Реакция на компрометацию карт:', [
      { text: 'Перевыпустить 312 карт, вернуть деньги сразу и сообщить клиентам лично', nextId: 'w6_breach_fix', impact: { budget: -10, satisfaction: 5 } },
      { text: 'Вернуть деньги только по заявлениям', nextId: 'w6_breach_slow', impact: { budget: -3, satisfaction: -15 }, setFlags: ['trust_damage'] },
    ]),
    k.msg('w6_breach_fix', 'risk', 'Закрыли за 2 дня, rate limiting и токенизацию включили. Клиенты пишут: «Банк сам вернул деньги — редкость». Но урок усвоен: безопасность не откладывают.', 'w6_influencer'),
    k.msg('w6_breach_slow', 'marketing', 'В соцсетях тред «NeoBlack не возвращает украденные деньги» — 40 000 репостов. Перед запуском влиятельной рекламы это худший фон.', 'w6_influencer'),
  );

  // ИИ без ограничений — интерес ЦБ и партнёра
  k.flags('ai_fin_choice', 1, ['ai_unsafe', 'trust_damage']);
  k.get('w7_start').nextId = 'r_w7_ai';
  k.add(
    k.router('r_w7_ai', [{ flag: 'ai_unsafe', nextId: 'w7_cb_letter' }], 'w7_eu_offer'),
    k.msg('w7_cb_letter', 'legal', 'ЦБ запросил информацию об инциденте с ИИ-агентом и разблокировкой украденных карт. N26 узнал из новостей и теперь требует аудит наших ИИ-процессов до любых переговоров.', 'w7_eu_offer'),
  );

  // Финал: репутационные последствия меняют итог
  const fin = k.get('w8_final_choice').choices!;
  fin[1].nextId = 'r_end_fin';
  k.get('w8_bold_ask').nextId = 'r_end_fin';
  k.get('w8_eu_announce').nextId = 'r_end_fin';
  k.add(
    k.router('r_end_fin', [{ flag: 'trust_damage', nextId: 'ending_fragile' }], 'ending_success'),
    k.ending('ending_fragile', 'ceo', 'Рост есть, доверия нет', 'NeoBlack вырос до 85 000 пользователей, но совет одобрил продолжение только с условием: внешний аудит безопасности, ИИ и процессов работы с инцидентами. Ты остаёшься PM, но каждое большое решение теперь проходит через комитет. Рост можно купить, доверие — только заработать.'),
  );
  k.title('ending_success', 'NeoBlack взлетел');
  k.title('ending_fail', 'Запуск не удался');
});

// ─────────────────────────── FOOD (YumRun) ───────────────────────────
once(FOOD_SCENARIO, () => {
  const k = kit(FOOD_SCENARIO);
  const st = k.get('d1_strategy_choice').choices!;
  const tags = ['small_fee', 'batching', 'commission_up', 'paid_delivery'];
  st.forEach((c, i) => { if (tags[i]) c.setFlags = [tags[i]]; });

  // Требования курьеров зависят от выбранной в первый день стратегии
  k.get('d3_karen_strike').nextId = 'r_d3_demands';
  k.add(
    k.router('r_d3_demands', [
      { flag: 'small_fee', nextId: 'd3_karen_strike_2' },
      { flag: 'batching', nextId: 'd3_demands_batch' },
    ], 'd3_demands_generic'),
    k.msg('d3_demands_batch', 'sales', 'Они требуют: оплату за каждую точку в батче, а не за поездку, гарантированный минимум $12/час и право отказаться от батча без штрафа. Говорят, что батчинг — это «два заказа за одни деньги».', 'd3_max_view'),
    k.msg('d3_demands_generic', 'sales', 'Они требуют: часть от новой выручки компании — курьерам, гарантированный минимум $12/час и прозрачный расчёт оплаты. «Компания зарабатывает больше — а мы нет».', 'd3_max_view'),
  );

  // Zone Bonus: третий вариант и отложенный перерасход
  k.flags('d2_launch_choice', 0, ['zone_rushed']);
  k.get('d2_launch_choice').choices!.push({
    text: 'Запустить везде утром, но с дневным лимитом бюджета и дашбордом',
    nextId: 'day_3_start',
    impact: { morale: -3, satisfaction: 4, budget: -2 },
  });
  k.get('day_4_start').nextId = 'r_d4_zone';
  k.add(
    k.router('r_d4_zone', [{ flag: 'zone_rushed', nextId: 'd4_zone_overspend' }], 'd4_max_tired'),
    k.msg('d4_zone_overspend', 'analytics', 'Zone Bonus, запущенный без лимитов, за 2 дня съел $18k: курьеры выяснили, что можно «заходить» в зону и сразу выходить. Закрыл лазейку, но деньги не вернуть.', 'd4_max_tired'),
  );

  // Забастовка: увольнение аукнется на переговорах с ресторанами
  k.flags('d3_strike_choice', 2, ['fired_strikers', 'trust_damage']);
  k.get('w2_wed').nextId = 'r_w2_wed';
  k.add(
    k.router('r_w2_wed', [{ flag: 'fired_strikers', nextId: 'd8_pr_pressure' }], 'd8_restaurant_call'),
    k.msg('d8_pr_pressure', 'sales', 'Перед созвоном три сети прислали письмо: после истории с увольнением бастующих курьеров они хотят пункт в договоре о стандартах работы с курьерами. Иначе — пауза в сотрудничестве.', 'd8_pr_choice'),
    k.choice('d8_pr_choice', 'Что ответить ресторанам?', [
      { text: 'Принять: опубликовать стандарты для курьеров и вернуть часть уволенных', nextId: 'd8_pr_accept', impact: { budget: -8, satisfaction: 8, morale: 10 } },
      { text: 'Отказать: это внутренние дела YumRun', nextId: 'd8_pr_refuse', impact: { satisfaction: -10, budget: -5 } },
    ]),
    k.msg('d8_pr_accept', 'sales', 'Сети сняли паузу. Двое уволенных курьеров вернулись и рассказали об этом в чатах — настроение в профсоюзе заметно мягче.', 'd8_restaurant_call'),
    k.msg('d8_pr_refuse', 'sales', 'Одна сеть поставила сотрудничество на паузу, две ждут, чем закончатся переговоры. Начинаем созвон с минусом.', 'd8_restaurant_call'),
  );

  // Стратегия недели 2: настоящие ветки
  const w = k.get('d5_w1_choice').choices!;
  w[0].nextId = 'w2_ai_routing'; w[0].setFlags = ['w2_ai'];
  w[1].nextId = 'w2_partners'; w[1].setFlags = ['w2_partners'];
  w.push({ text: 'Корпоративный сегмент: обеды для офисов по подписке', nextId: 'w2_b2b_focus', impact: { budget: 6, morale: -3 }, setFlags: ['w2_b2b'] });
  k.add(
    k.msg('w2_ai_routing', 'dev', 'Начинаю ИИ-роутинг: модель предсказывает время готовности и пробки. Первые результаты — к четвергу.', 'w2_start'),
    k.msg('w2_partners', 'sales', 'Иду к 30 ресторанам из «длинного хвоста» с условием: 18% комиссии в обмен на эксклюзив в районе. Пять уже готовы.', 'w2_start'),
    k.msg('w2_b2b_focus', 'sales', 'Офисные обеды — это 200–400 заказов в день по расписанию. Курьеры загружены в обед, а не только вечером. Готовлю пилот с тремя бизнес-центрами.', 'w2_start'),
  );

  // Star Courier: настоящие ветки и отложенное последствие тихого запуска
  const sc = k.get('d7_choice').choices!;
  sc[0].nextId = 'd7_quiet'; sc[0].setFlags = ['star_quiet'];
  sc[1].nextId = 'd7_open';
  sc.push({ text: 'Открыто, с прозрачными критериями и понятным путём в Star для любого курьера', nextId: 'd7_fair', impact: { morale: 12, budget: -5, satisfaction: 3 } });
  k.add(
    k.msg('d7_quiet', 'dev', 'Перенастроил распределение. Никаких объявлений. Звёздные курьеры получают на 30% больше заказов, остальные — меньше, и не знают почему.', 'ai_food_start'),
    k.msg('d7_open', 'analytics', 'Объявили программу. Звёздные курьеры довольны, остальные спрашивают, как туда попасть. Нужно ответить им до конца недели.', 'ai_food_start'),
    k.msg('d7_fair', 'dev', 'Опубликовали критерии: рейтинг, доля батчей, пунктуальность. Любой может попасть в Star через месяц. 300 курьеров уже подтянули показатели.', 'ai_food_start'),
  );
  k.get('w2_thu').nextId = 'r_w2_thu';
  k.add(
    k.router('r_w2_thu', [{ flag: 'star_quiet', nextId: 'd9_courier_leak' }], 'r_w2_thu_b'),
    k.msg('d9_courier_leak', 'sales', 'Курьеры сравнили заказы в чатах и вычислили, что поток перераспределили втихую. Профсоюз пишет: «Скрытая дискриминация». Журналист уже звонил.', 'd9_courier_choice'),
    k.choice('d9_courier_choice', 'Как реагировать?', [
      { text: 'Признать, опубликовать критерии и открыть путь в программу всем', nextId: 'd9_courier_admit', impact: { budget: -5, morale: 5, satisfaction: 3 } },
      { text: 'Отрицать: «алгоритм просто оптимизирует»', nextId: 'd9_courier_deny', impact: { morale: -15, satisfaction: -8 }, setFlags: ['trust_damage'] },
    ]),
    k.msg('d9_courier_admit', 'dev', 'Опубликовали критерии. Профсоюз отозвал жалобу, журналист написал короткую заметку «YumRun исправил ошибку».', 'r_w2_thu_b'),
    k.msg('d9_courier_deny', 'sales', 'Статья вышла с заголовком «Алгоритм YumRun тайно урезает заработок курьеров». Инвесторы уже переслали её Елене.', 'r_w2_thu_b'),
    k.router('r_w2_thu_b', [
      { flag: 'w2_ai', nextId: 'd9_ai_bonus' },
      { flag: 'w2_partners', nextId: 'd9_partner_bonus' },
      { flag: 'w2_b2b', nextId: 'd9_b2b_bonus' },
    ], 'd9_timur_model'),
    k.msg('d9_ai_bonus', 'analytics', 'ИИ-роутинг добавил ещё $0.15 к CM: курьеры меньше ждут у ресторанов. Включаю в модель.', 'd9_timur_model'),
    k.msg('d9_partner_bonus', 'analytics', 'Эксклюзивы с «длинным хвостом» дали +6% заказов в спальных районах, где курьеры раньше простаивали. Включаю в модель.', 'd9_timur_model'),
    k.msg('d9_b2b_bonus', 'analytics', 'Пилот с офисами: 320 заказов в день в обед с CM +$1.40 — это лучшие заказы в системе. Включаю в модель отдельной строкой.', 'd9_timur_model'),
  );

  // Финал: третий аргумент и репутационный финал
  k.get('d10_elena_close').nextId = 'r_end_food';
  k.get('ending_choice').choices!.push({
    text: 'Показать риски и план: что будет, если DeliverX продержится 6 месяцев, и при каких цифрах мы сокращаем расходы',
    nextId: 'ending_success_3',
    impact: { satisfaction: 10, budget: 10 },
  });
  k.add(
    k.router('r_end_food', [{ flag: 'trust_damage', nextId: 'ending_partial' }], 'ending_choice'),
    k.ending('ending_success_3', 'director', 'Раунд на честных цифрах', 'Инвестор сказал: «Впервые мне показали не только план, но и сценарий провала с точками остановки». Раунд $3.5M закрыт на хороших условиях, а инвестор попросил приводить тебя на все будущие встречи.'),
    k.ending('ending_partial', 'director', 'Раунд с жёсткими условиями', 'Экономика сошлась, но истории с курьерами дошли до инвесторов. Раунд закрыт на $1.5M вместо $3M, с условием независимого аудита работы с курьерами. Бизнес жив, но репутационный долг придётся отдавать.'),
  );
  k.title('ending_success_1', 'Инвестор стал союзником');
  k.title('ending_success_2', 'Цифры говорят сами');
  k.title('ending_fail', 'Раунд не закрыт');
});

// ─────────────────────────── DISCOVERY (EdVance) ───────────────────────────
once(DISCOVERY_SCENARIO, () => {
  const k = kit(DISCOVERY_SCENARIO);

  // Выбор респондентов — влияет на качество интервью
  k.get('msg_insight_1').nextId = 'choice_sample';
  k.add(
    k.choice('choice_sample', 'Кого позвать на интервью?', [
      { text: 'Самых активных пользователей — им есть что рассказать', nextId: 'sample_active', impact: { satisfaction: -5 }, setFlags: ['biased_sample'] },
      { text: '«Спящих» из сегмента с 3-минутными сессиями и пару активных для контраста', nextId: 'sample_right', impact: { satisfaction: 8, morale: 3 } },
      { text: 'HR-директоров компаний-клиентов — они платят', nextId: 'sample_buyers', impact: { budget: 3, satisfaction: -5 }, setFlags: ['biased_sample'] },
    ]),
    k.msg('sample_active', 'researcher', 'Активные — это 8% пользователей. Они как раз смотрят длинные лекции. Риск: услышим, что всё отлично, и не поймём, почему уходят остальные.', 'phase_interviews'),
    k.msg('sample_right', 'researcher', 'Правильно. Спящие расскажут, почему бросают, а активные покажут, что работает. Пять звонков назначены.', 'phase_interviews'),
    k.msg('sample_buyers', 'researcher', 'HR покупает, но не учится. Они расскажут про отчёты и KPI, а не про то, почему сотрудники закрывают видео.', 'phase_interviews'),
  );
  k.get('interview_result').nextId = 'r_interview';
  k.add(
    k.router('r_interview', [{ flag: 'biased_sample', nextId: 'interview_biased' }], 'choice_problem'),
    k.msg('interview_biased', 'researcher', 'Честно: из-за выборки картина смазана. Двое из пяти сказали про длину видео, остальные — про отчёты для HR. Я доберу ещё три звонка со спящими, это +2 дня.', 'choice_problem'),
  );

  // Формулировка проблемы
  k.add(
    k.choice('choice_problem', 'Как сформулировать проблему для команды?', [
      { text: '«Пользователям скучно — нужно больше развлечений»', nextId: 'problem_bad', impact: { satisfaction: -8 } },
      { text: '«Когда у сотрудника есть 5–10 минут между задачами, он хочет быстро научиться одному навыку, но наши уроки идут час»', nextId: 'problem_jtbd', impact: { satisfaction: 10, morale: 5 } },
      { text: '«Нужно сделать мобильное приложение»', nextId: 'problem_solution', impact: { budget: -5 } },
    ]),
    k.msg('problem_bad', 'researcher', 'Это снова наша догадка, а не то, что говорили люди. Никто не сказал «скучно» — говорили «нет часа».', 'problem_definition'),
    k.msg('problem_jtbd', 'researcher', 'Вот это проблема в формате Jobs To Be Done: ситуация, мотивация, барьер. С ней можно проверять любые решения.', 'problem_definition'),
    k.msg('problem_solution', 'tech', 'Это решение, а не проблема. Может, приложение и нужно, но сначала давай поймём, что именно мешает учиться.', 'problem_definition'),
  );

  // Что берём в оценку
  k.get('msg_ideas_2').nextId = 'choice_ideas';
  k.add(
    k.choice('choice_ideas', 'Какие идеи берём в оценку RICE?', [
      { text: 'Только идею CEO — геймификацию, чтобы не спорить', nextId: 'ideas_ceo', impact: { morale: 3, satisfaction: -8 } },
      { text: 'Все три: пуши, шортсы, геймификацию — и сравним по RICE', nextId: 'ideas_all', impact: { satisfaction: 8 } },
      { text: 'Сразу шортсы — и так ясно', nextId: 'ideas_short', impact: { satisfaction: -3, budget: 2 } },
    ]),
    k.msg('ideas_ceo', 'data', 'Геймификация: Reach 1000, Impact 1, Confidence 30% — у нас нет данных, что проблема в мотивации. Это слабая ставка. Давай всё же посчитаем шортсы.', 'task_rice'),
    k.msg('ideas_all', 'data', 'Пуши: высокий охват, но Impact низкий — напоминание не делает урок короче. Геймификация: Confidence 30%. Давай посчитаем шортсы.', 'task_rice'),
    k.msg('ideas_short', 'data', 'Возможно, ты прав, но без сравнения мы не объясним CEO, почему не геймификация. Ладно, считаем шортсы.', 'task_rice'),
  );

  // Дизайн эксперимента — контрольная группа
  k.get('mvp_concierge').nextId = 'choice_segment';
  k.get('mvp_fake').nextId = 'choice_segment';
  k.add(
    k.choice('choice_segment', 'На ком запускаем эксперимент?', [
      { text: 'На всех пользователях сразу — быстрее увидим результат', nextId: 'segment_all', impact: { budget: -3 }, setFlags: ['no_control'] },
      { text: 'На «спящих» из 3 компаний, случайно поделив их на тестовую и контрольную группы', nextId: 'segment_ab', impact: { satisfaction: 8, morale: 3 } },
      { text: 'Только на самых активных — они точно откроют', nextId: 'segment_active', impact: { satisfaction: -5 }, setFlags: ['no_control'] },
    ]),
    k.msg('segment_all', 'data', 'Запустим, но без контрольной группы мы не узнаем, что изменилось из-за формата, а что — из-за новизны письма.', 'task_copy'),
    k.msg('segment_ab', 'data', 'По 1 200 человек в группе, 14 дней. Это даст честный ответ.', 'task_copy'),
    k.msg('segment_active', 'data', 'Активные и так досматривают лекции. Если увидим рост — это не докажет, что формат помогает спящим.', 'task_copy'),
  );
  k.get('metrics_analysis').nextId = 'r_control';
  k.add(
    k.router('r_control', [{ flag: 'no_control', nextId: 'control_missing' }], 'task_log_ab'),
    k.msg('control_missing', 'ceo', 'Красивые цифры, но с чем сравнивать? Может, люди просто открыли новое письмо из любопытства?', 'choice_control'),
    k.choice('choice_control', 'Что делаем без контрольной группы?', [
      { text: 'Перезапустить ещё на 2 недели с контрольной группой', nextId: 'control_rerun', impact: { budget: -10, satisfaction: 5 } },
      { text: 'Показать как есть — цифры же хорошие', nextId: 'task_log_ab', impact: { satisfaction: -8 }, setFlags: ['weak_evidence'] },
    ]),
    k.msg('control_rerun', 'data', 'Перезапустили с честным делением 50/50 по 1 200 человек. Две недели — и у нас доказательства, а не впечатления.', 'task_log_ab'),
  );

  // Стейкхолдер после результатов
  k.get('final_pitch').nextId = 'sales_pressure';
  k.add(
    k.msg('sales_pressure', 'sales', 'Крупный клиент на 800 лицензий прописал в продлении договора «геймификацию до конца квартала». Если не сделаем — уйдут.', 'choice_client'),
    k.choice('choice_client', 'Что ответить клиенту?', [
      { text: 'Пообещать геймификацию, чтобы сохранить договор', nextId: 'client_promise', impact: { budget: 10, morale: -10, satisfaction: -5 } },
      { text: 'Показать данные эксперимента и предложить пилот микро-уроков с их цифрами в отчёте', nextId: 'client_data', impact: { satisfaction: 10, budget: 5 } },
      { text: 'Отказать без объяснений', nextId: 'client_refuse', impact: { budget: -15 } },
    ]),
    k.msg('client_promise', 'tech', 'Значит, квартал уйдёт на бейджи и очки вместо формата, который работает. Сделаем, но микро-уроки сдвигаются.', 'ceo_final'),
    k.msg('client_data', 'sales', 'Клиент согласился на пилот: их HR важнее рост досматриваемости в отчёте, чем бейджи. Продление подписано.', 'ceo_final'),
    k.msg('client_refuse', 'sales', 'Клиент ушёл к конкуренту. Минус 800 лицензий. Можно было сохранить, если бы мы показали данные.', 'ceo_final'),
  );

  // Финал: честное «AI» и слабые доказательства
  const fc = k.get('final_choice').choices!;
  fc[0].nextId = 'r_end_disc';
  fc.push({ text: 'Micro-Learning с ИИ-подбором следующего урока — «AI» в названии там, где он реально работает', nextId: 'r_end_disc_best', impact: { satisfaction: 15, budget: 15, morale: 5 } });
  k.add(
    k.router('r_end_disc', [{ flag: 'weak_evidence', nextId: 'ending_pilot' }], 'ending_good'),
    k.router('r_end_disc_best', [{ flag: 'weak_evidence', nextId: 'ending_pilot' }], 'ending_best'),
    k.ending('ending_best', 'system', 'Формат, который выбрали пользователи', 'Микро-уроки с ИИ-подбором следующего шага: каждый урок 5–7 минут, а ИИ предлагает продолжение по пройденному. Досматриваемость выросла в 6 раз, продления подписок — на 40%. CEO получил «AI» в названии, а пользователи — продукт, который вписывается в их день.'),
    k.ending('ending_pilot', 'ceo', 'Только пилот', 'Совет не поверил цифрам без контрольной группы и дал деньги только на пилот в трёх компаниях. Идея правильная, но доказательства слабые — придётся пройти эксперимент заново.'),
  );
  k.add(k.ending('ending_fail', 'ceo', 'Продукт закрыт', 'Ресурсы закончились раньше, чем мы получили доказательства. Компании-клиенты не продлили подписки, совет закрыл направление. Проблема была найдена верно, но решения по дороге стоили слишком дорого.'));
  k.title('ending_good', 'Продукт спасён');
  k.title('ending_compromise', 'Бюджет есть, ясности нет');
});

export const SCENARIO_DEPTH_APPLIED = true;
