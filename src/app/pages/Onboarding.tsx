import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle, BarChart3, MessageSquare, Zap, Target, Users, BookOpen } from 'lucide-react';

const slides = [
  {
    id: 1,
    icon: Target,
    tag: 'Практика',
    title: 'Реальные кейсы вместо теории',
    description: 'Решайте задачи из практики Google, Uber, Airbnb и других BigTech компаний. Каждое решение влияет на метрики и открывает следующий сценарий.',
    stat: '370+',
    statLabel: 'уникальных ситуаций',
    color: '#0891b2',
    bg: '#f0fdff',
  },
  {
    id: 2,
    icon: BarChart3,
    tag: 'Метрики',
    title: 'Видите последствия в реальном времени',
    description: 'Бюджет, мораль команды, счастье клиентов — каждый ваш выбор двигает эти числа. Научитесь балансировать между интересами бизнеса, команды и пользователей.',
    stat: '3',
    statLabel: 'симулятора на выбор',
    color: '#2e7b5e',
    bg: '#f0fdf4',
  },
  {
    id: 3,
    icon: MessageSquare,
    tag: 'ИИ-Ментор',
    title: 'Личный Senior PM в кармане',
    description: 'ИИ-ментор с опытом работы в BigTech всегда рядом. Разберёт ваши решения, объяснит фреймворки и сыграет роль скептичного CEO.',
    stat: '24/7',
    statLabel: 'поддержка ментора',
    color: '#0e7490',
    bg: '#ecfeff',
  },
];

const features = [
  { icon: Zap, text: 'Финтех, доставка, такси' },
  { icon: Users, text: 'Реальные персонажи' },
  { icon: BookOpen, text: 'База знаний PM' },
  { icon: CheckCircle, text: 'Сертификат' },
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      complete();
    }
  };

  const complete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #f0fdff 0%, #cffafe 50%, #67e8f9 100%)' }}
    >
      {/* Skip */}
      <button
        onClick={complete}
        className="absolute top-5 right-5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ color: '#9ca3af' }}
      >
        Пропустить
      </button>

      <div className="w-full max-w-sm">
        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-3xl overflow-hidden shadow-2xl mb-6"
            style={{ background: '#ffffff', border: '1px solid #cffafe' }}
          >
            {/* Visual top */}
            <div className="px-7 pt-8 pb-6 flex flex-col items-center text-center" style={{ background: slide.bg }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                style={{ background: slide.color, boxShadow: `0 8px 20px ${slide.color}30` }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              <span
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                style={{ background: `${slide.color}15`, color: slide.color }}
              >
                {slide.tag}
              </span>

              <h2 className="text-xl font-bold leading-snug mb-3" style={{ color: '#164e63' }}>
                {slide.title}
              </h2>

              <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                {slide.description}
              </p>

              {/* Stat */}
              <div
                className="mt-5 flex items-center gap-3 px-5 py-3 rounded-2xl w-full"
                style={{ background: `${slide.color}10`, border: `1px solid ${slide.color}20` }}
              >
                <span className="text-3xl font-black" style={{ color: slide.color }}>{slide.stat}</span>
                <span className="text-sm font-medium" style={{ color: '#374151' }}>{slide.statLabel}</span>
              </div>
            </div>

            {/* Bottom content */}
            {currentSlide === slides.length - 1 && (
              <div className="px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9ca3af' }}>Что вас ждёт</p>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium" style={{ color: '#374151' }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#cffafe' }}>
                        <f.icon className="w-3.5 h-3.5" style={{ color: '#0891b2' }} />
                      </div>
                      {f.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="rounded-full transition-all duration-300"
              style={{
                width: currentSlide === idx ? 24 : 8,
                height: 8,
                background: currentSlide === idx ? '#0891b2' : 'rgba(8,145,178,0.25)',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all"
          style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)' }}
        >
          {currentSlide === slides.length - 1 ? (
            <>Начать практику <CheckCircle className="w-5 h-5" /></>
          ) : (
            <>Дальше <ArrowRight className="w-5 h-5" /></>
          )}
        </motion.button>
      </div>
    </div>
  );
}
