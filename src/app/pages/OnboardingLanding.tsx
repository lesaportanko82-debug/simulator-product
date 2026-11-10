import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Brain,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  Lightbulb,
  BarChart3,
  Zap,
  Clock,
  Trophy,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const OnboardingLanding = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingLifetime, setLoadingLifetime] = useState(false);
  const [loadingTrial, setLoadingTrial] = useState(false);

  const handleStart = () => {
    navigate('/login');
  };

  const requireAuth = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Онлайн-оплата временно отключена: подключение — через поддержку в Telegram.
  const SUPPORT_URL = 'https://t.me/ohh_lessya';
  const openSupport = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(SUPPORT_URL, '_blank', 'noopener');
  };
  const handleMonthlyPay = openSupport;
  const handleLifetimePay = openSupport;

  const handleTrialStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!(await requireAuth())) return;
    setLoadingTrial(true);
    try {
      const { data, error } = await supabase.functions.invoke('start-simulator-trial', {
        body: {},
      });
      if (error) {
        const msg: string = error.message ?? '';
        if (error.context?.status === 409 || msg.includes('Trial already used') || msg.includes('already')) {
          toast.error('Пробный период уже был использован. Выберите тариф для продолжения.');
        } else {
          toast.error('Не удалось активировать пробный доступ. Попробуйте ещё раз.');
        }
        return;
      }
      if (data) {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Trial error:', err);
      toast.error('Не удалось активировать пробный доступ. Попробуйте ещё раз.');
    } finally {
      setLoadingTrial(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#111827", background: "linear-gradient(160deg, #f0fdff 0%, #cffafe 55%, #67e8f9 100%)" }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #0891b2, #0e7490)" }}>
                Симулятор продуктовых процессов
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Реальные сценарии. Живые ситуации. Практический опыт управления продуктом без риска для настоящего бизнеса.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <button
                onClick={handleStart}
                className="group px-6 py-2.5 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2" style={{ background: "#0891b2" }} onMouseOver={e=>(e.currentTarget.style.background="#0e7490")} onMouseOut={e=>(e.currentTarget.style.background="#0891b2")}
              >
                Начать обучение
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2.5 bg-white text-slate-600 rounded-xl font-medium text-sm shadow-sm hover:shadow-md hover:bg-slate-50 border border-slate-200 transition-all duration-200"
              >
                Посмотреть тарифы
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Знакомая ситуация?
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Мы знаем, с чем сталкиваются начинающие продакт-менеджеры
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: 'Теория без практики', description: 'Прочитали десятки статей и книг, но не знаете, как применить это в реальной работе' },
              { icon: Users, title: 'Страх первого шага', description: 'Боитесь начать карьеру в PM, потому что нет опыта работы с реальными продуктами' },
              { icon: Target, title: 'Дорогие ошибки', description: 'В реальном бизнесе каждая ошибка стоит денег, времени и репутации' },
              { icon: Clock, title: 'Нет времени на курсы', description: 'Хотите учиться в своем темпе, без жёстких дедлайнов и групповых занятий' },
              { icon: Brain, title: 'Непонятно, с чего начать', description: 'Слишком много информации, не ясно, какие навыки развивать в первую очередь' },
              { icon: TrendingUp, title: 'Нет обратной связи', description: 'Учитесь самостоятельно и не понимаете, правильно ли принимаете решения' }
            ].map((pain, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-white/70">
                <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center mb-4">
                  <pain.icon className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{pain.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{pain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 backdrop-blur-sm px-3 py-1.5 rounded-full" style={{ background: "rgba(207,250,254,0.6)", border: "1px solid rgba(14,116,144,0.2)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#0891b2" }} />
              <span className="text-xs font-medium" style={{ color: "#164e63" }}>Решение всех проблем</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              PM Simulator: ваш безопасный полигон для роста
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Получите реальный опыт управления продуктом без риска и последствий
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {(() => {
              const colorMap: Record<string, { icon: string; dot: string }> = {
                teal:    { icon: '#0891b2', dot: 'rgba(8,145,178,0.15)' },
                cyan:    { icon: '#0e7490', dot: 'rgba(14,116,144,0.15)' },
                blue:    { icon: '#2563eb', dot: 'rgba(37,99,235,0.12)' },
                emerald: { icon: '#059669', dot: 'rgba(5,150,105,0.12)' },
              };
              const leftItems = [
                { icon: Rocket,   color: 'teal',    title: '3 реалистичных сценария', description: 'Финтех (GreenBank/NeoBlack, 8 недель), Фудтех (YumRun, 2 недели), Такси (CityCab, 2 недели). Более 370+ уникальных ситуаций из реальной практики.', features: ['Реальные рабочие ситуации и дилеммы', 'Последствия ваших решений', 'Динамическое изменение метрик', 'Взаимодействие с командой и стейкхолдерами'] },
                { icon: Brain,    color: 'cyan',    title: 'Умный AI-ментор', description: 'Интеграция с OpenAI для персонализированной обратной связи на ваши решения и ответы на вопросы в режиме 24/7.', features: ['Анализ ваших решений', 'Объяснение последствий', 'Рекомендации по улучшению', 'Ответы на вопросы о продукте'] },
              ];
              const rightItems = [
                { icon: BookOpen, color: 'blue',    title: 'Структурированный курс', description: 'Полный курс «Продуктовый маркетинг» с модульной структурой, практическими заданиями и проверкой знаний.', features: ['Теория + практика в одном месте', 'Задания с обратной связью', 'Отслеживание прогресса', 'База знаний и кейсы'] },
                { icon: BarChart3,color: 'emerald', title: 'Метрики и прогресс', description: 'Отслеживайте ключевые показатели: команда, пользователи, бизнес, стейкхолдеры. Видите влияние своих решений в реальном времени.', features: ['Динамические метрики продукта', 'Визуализация прогресса', 'Статистика по решениям', 'Достижения и награды'] },
              ];
              const renderCol = (items: typeof leftItems) => (
                <div className="space-y-5">
                  {items.map((item, idx) => {
                    const c = colorMap[item.color];
                    return (
                      <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/70">
                        <div className="w-10 h-10 bg-white/90 rounded-xl shadow-sm flex items-center justify-center mb-4 border border-white/80">
                          <item.icon className="w-5 h-5" style={{ color: c.icon }} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">{item.description}</p>
                        <div className="space-y-2">
                          {item.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.dot }}>
                                <Check className="w-2.5 h-2.5" style={{ color: c.icon }} />
                              </div>
                              <span className="text-xs text-slate-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              return (
                <>
                  {renderCol(leftItems)}
                  {renderCol(rightItems)}
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Всё необходимое для старта карьеры
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Lightbulb, title: 'Q&A сессии', description: 'Запись на живые сессии с экспертами и получение ответов на вопросы' },
              { icon: Target, title: 'Практические задания', description: 'Реальные задачи с offline-first подходом и моментальным сохранением' },
              { icon: MessageSquare, title: 'База знаний', description: 'Библиотека статей, шаблонов и лучших практик PM' },
              { icon: Trophy, title: 'Система достижений', description: 'Мотивация через прогресс, бейджи и отслеживание роста' },
              { icon: Users, title: 'Реальные кейсы', description: 'Разбор успешных и провальных продуктов с практическими выводами' },
              { icon: Zap, title: 'Быстрый старт', description: 'Начните учиться сразу после регистрации, без ожидания' },
              { icon: Clock, title: 'В своём темпе', description: 'Учитесь когда удобно, без жёстких дедлайнов и расписания' },
              { icon: Award, title: 'Сертификат', description: 'Подтверждение навыков для вашего портфолио и резюме' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/70 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(207,250,254,0.6)" }}>
                  <feature.icon className="w-4 h-4" style={{ color: "#0891b2" }} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-20 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Начните прямо сейчас
            </h2>
            <p className="text-sm text-slate-500">
              Выберите тариф, который подходит вам
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            Онлайн-оплата временно не работает из-за сбоя платёжного сервиса.
            По вопросам подключения пишите в поддержку в Telegram:{' '}
            <a href="https://t.me/ohh_lessya" target="_blank" rel="noopener noreferrer" className="font-semibold underline">@ohh_lessya</a>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl p-7 shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedPlan === 'monthly' ? 'border-[#0891b2] ring-4 ring-[#cffafe]' : 'border-slate-100 hover:border-[#67e8f9]'
              }`}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/70 mb-4">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">Гибкий план</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Месячная подписка</h3>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-extrabold text-slate-900">1000</span>
                  <span className="text-base text-slate-400 font-medium">₽/мес</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Без долгосрочных обязательств</p>
              </div>

              <div className="space-y-2.5 mb-6">
                {[
                  'Полный доступ ко всем сценариям',
                  'Курс «Продуктовый маркетинг»',
                  'AI-ментор с обратной связью',
                  'База знаний и кейсы',
                  'Q&A сессии с экспертами',
                  'Практические задания',
                  'Отслеживание прогресса',
                  'Отмена в любой момент'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-slate-600" />
                    </div>
                    <span className="text-xs text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleTrialStart}
                  disabled={loadingTrial || loadingMonth}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm shadow hover:bg-slate-800 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingTrial ? <><Loader2 className="w-4 h-4 animate-spin" />Активируем доступ...</> : 'Попробовать 7 дней бесплатно'}
                </button>
                <button
                  onClick={handleMonthlyPay}
                  disabled={loadingMonth || loadingTrial}
                  className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingMonth ? <><Loader2 className="w-4 h-4 animate-spin" />Создаём платёж...</> : 'Подключить 1 000 ₽/мес через поддержку'}
                </button>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div
              onClick={() => setSelectedPlan('lifetime')}
              className={`bg-slate-900 text-white rounded-2xl p-7 shadow-lg border-2 transition-all cursor-pointer hover:shadow-xl relative ${
                selectedPlan === 'lifetime' ? 'border-[#67e8f9] ring-4 ring-[#164e63]/40' : 'border-transparent'
              }`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-semibold text-xs shadow-md" style={{ background: "linear-gradient(90deg, #67e8f9, #cffafe)", color: "#164e63" }}>
                💎 Лучшее предложение
              </div>

              <div className="text-center mb-6 mt-2">
                <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 mb-4">
                  <Trophy className="w-3.5 h-3.5" style={{ color: "#67e8f9" }} />
                  <span className="text-xs font-medium" style={{ color: "#cffafe" }}>Максимальная выгода</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Вечный доступ</h3>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-extrabold text-white">2500</span>
                  <span className="text-base text-slate-400 font-medium">₽</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Разовый платёж, навсегда ваш</p>
                <div className="mt-3 inline-block bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                  <p className="text-xs">
                    <span className="line-through text-slate-500">3000₽/мес × 12 мес</span>
                    <span className="ml-2 font-semibold" style={{ color: "#67e8f9" }}>Экономия 33 500₽</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                {[
                  'Всё из месячного тарифа',
                  'Доступ навсегда ко всему контенту',
                  'Все будущие обновления бесплатно',
                  'Новые сценарии и модули',
                  'Приоритетная поддержка',
                  'Эксклюзивные материалы',
                  'Доступ к закрытому комьюнити',
                  'Индивидуальные консультации'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5" style={{ color: "#67e8f9" }} />
                    </div>
                    <span className="text-xs text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLifetimePay}
                disabled={loadingLifetime}
                className="w-full py-2.5 text-white rounded-xl font-medium text-sm shadow transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "#0891b2" }}
              >
                {loadingLifetime ? <><Loader2 className="w-4 h-4 animate-spin" />Создаём платёж...</> : 'Подключить вечный доступ через поддержку'}
              </button>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/70">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#0891b2" }} />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">7 дней гарантии возврата денег</p>
                <p className="text-xs text-slate-500">Не подошло? Вернём 100% без вопросов</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Что говорят наши студенты
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: 'Анна Соколова',
                role: 'Junior PM в Fintech стартапе',
                avatar: 'АС',
                text: 'После прохождения симулятора я получила оффер на позицию Junior PM. Работодатель был впечатлён тем, что я могу говорить о реальных кейсах и метриках.'
              },
              {
                name: 'Дмитрий Козлов',
                role: 'Перешёл из разработки в PM',
                avatar: 'ДК',
                text: 'Как разработчик, я понимал техническую часть, но не знал, как принимать продуктовые решения. PM Simulator дал мне этот опыт без риска сломать реальный продукт.'
              },
              {
                name: 'Мария Иванова',
                role: 'PM в крупной корпорации',
                avatar: 'МИ',
                text: 'Использую симулятор для практики перед важными встречами со стейкхолдерами. Прорабатываю разные сценарии и чувствую себя увереннее на переговорах.'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/70 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-xs flex-shrink-0" style={{ background: "#cffafe", color: "#0e7490" }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-2.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Частые вопросы
            </h2>
          </div>
          <div className="space-y-2">
            {[
              { q: 'Нужен ли опыт в PM для начала?', a: 'Нет! PM Simulator разработан для начинающих. Мы начинаем с базовых концепций и постепенно усложняем задачи.' },
              { q: 'Сколько времени занимает обучение?', a: 'В среднем студенты проходят основной курс за 2-3 месяца, уделяя 5-7 часов в неделю. Но вы можете учиться в своём темпе.' },
              { q: 'Что делать, если у меня возникнут вопросы?', a: 'У вас есть AI-ментор 24/7, регулярные Q&A сессии с экспертами и база знаний с ответами на типичные вопросы.' },
              { q: 'Можно ли вернуть деньги?', a: 'Да, у нас есть 7-дневная гарантия возврата денег. Если курс вам не подойдёт, мы вернём 100% без лишних вопросов.' },
              { q: 'Чем отличается от обычных онлайн-курсов?', a: 'PM Simulator это не просмотр видео. Это интерактивный RPG-симулятор, где вы принимаете решения и видите последствия в реальном времени.' },
              { q: 'Получу ли я сертификат?', a: 'Да, после прохождения курса и симуляторов вы получите сертификат, который можно добавить в портфолио и LinkedIn.' }
            ].map((faq, idx) => (
              <details key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/70 group">
                <summary className="text-sm font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.q}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 md:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(8,145,178,0.4) 0%, #164e63 50%, #111827 100%)" }} />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Начните свой путь в продукте сегодня
          </h2>
          <p className="text-sm text-slate-400">
            Присоединяйтесь к 500+ студентам, которые уже строят карьеру в PM
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <button
              onClick={handleStart}
              className="group px-6 py-2.5 text-white rounded-xl font-medium text-sm shadow-lg transition-all duration-200 flex items-center gap-2" style={{ background: "#0891b2" }}
            >
              Начать бесплатно
              <Rocket className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-xs text-slate-500">Кредитная карта не требуется</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 bg-slate-950 text-slate-600 text-center text-xs">
        <p>&copy; 2026 PM Simulator. Все права защищены.</p>
        <p className="mt-1.5">
          <a
            href="/privacy"
            className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Политика конфиденциальности
          </a>
        </p>
      </footer>
    </div>
  );
};
