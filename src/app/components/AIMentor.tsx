import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SERVER_URL, getAccessToken } from '@/lib/api';

const SYSTEM_PROMPT = `Ты — Senior Product Manager с опытом работы в ведущих BigTech компаниях мира: Google, Amazon, Meta, Uber, Airbnb, Netflix, Apple. Ты выступаешь в роли личного ментора и наставника для начинающих продакт-менеджеров на платформе PM Simulator.

Твои задачи:
• Помогать решать продуктовые кейсы — конкретно и практично
• Объяснять методологии и фреймворки (JTBD, OKR, North Star Metric, RICE, Kano, и др.)
• Моделировать реальные рабочие ситуации: стендапы, встречи со стейкхолдерами, ревью метрик, продуктовые дискавери
• Задавать глубокие вопросы, как опытный PM на интервью или в реальной работе
• Давать честную обратную связь по решениям студента
• Иногда играть роль скептичного стейкхолдера, требовательного CEO или сомневающегося разработчика — чтобы тренировать навыки убеждения

Всегда отвечай на русском языке. Будь конкретным — избегай общих слов. Используй примеры из реальных компаний. Если задаёшь вопрос — жди ответа перед тем как продолжить. Ответы держи компактными (3-5 предложений максимум), если не нужно детально разбирать.

ВАЖНО: Никогда не используй markdown-разметку в ответах. Не пиши звёздочки (**жирный**), решётки (# заголовок), дефисы в виде списков (- пункт), нижние подчёркивания (_курсив_) и любые другие markdown-символы. Пиши обычным текстом, как в живом разговоре. Если нужно перечислить пункты — пиши их через запятую или с новой строки без символов.`;

const STARTERS = [
  'Разбери со мной кейс: как вырастить retention в мобильном приложении?',
  'Сыграй роль CEO — я защищаю roadmap на квартал',
  'Как правильно формулировать OKR для продуктовой команды?',
  'Помоги подготовиться к продуктовому интервью в Яндекс',
  'Объясни разницу между output и outcome в PM-работе',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIMentorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIMentor({ isOpen, onClose }: AIMentorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Greeting on first open
      setMessages([{
        role: 'assistant',
        content: 'Привет! Я твой ИИ-ментор — Senior PM с опытом в BigTech. Готов помочь с кейсами, разобрать фреймворки или сыграть роль стейкхолдера для тренировки. С чего начнём?'
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${SERVER_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages,
          ],
          temperature: 0.8,
          max_tokens: 800,
        }),
      });

      if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? 'Что-то пошло не так. Попробуй ещё раз.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError('Ошибка соединения. Проверь интернет и попробуй снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: 'Привет! Я твой ИИ-ментор — Senior PM с опытом в BigTech. Готов помочь с кейсами, разобрать фреймворки или сыграть роль стейкхолдера для тренировки. С чего начнём?'
    }]);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 w-full sm:w-[420px] z-50 flex flex-col shadow-2xl"
            style={{ background: '#ffffff', borderLeft: '1px solid #cffafe', height: '100dvh', bottom: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #164e63, #0891b2)', borderBottom: '1px solid rgba(103,232,249,0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">ИИ Ментор</p>
                  <p className="text-[10px]" style={{ color: 'rgba(207,250,254,0.7)' }}>Senior PM • BigTech опыт</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(207,250,254,0.7)' }}
                  title="Начать заново"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(207,250,254,0.7)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar" style={{ background: '#f0fdff' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={msg.role === 'assistant'
                      ? { background: '#ffffff', color: '#374151', border: '1px solid #cffafe', borderBottomLeftRadius: 4 }
                      : { background: '#0891b2', color: '#ffffff', borderBottomRightRadius: 4 }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid #cffafe', borderBottomLeftRadius: 4 }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#0891b2', animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-center py-2 px-4 rounded-xl" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              {/* Starters — show when only greeting */}
              {messages.length === 1 && !loading && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider px-1" style={{ color: '#9ca3af' }}>Попробуй спросить</p>
                  {STARTERS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{ background: '#ffffff', border: '1px solid #cffafe', color: '#0e7490' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex-shrink-0" style={{ background: '#ffffff', borderTop: '1px solid #cffafe', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спроси ментора... (Enter — отправить)"
                  rows={1}
                  className="flex-1 resize-none text-sm rounded-xl px-4 py-3 outline-none transition-all"
                  style={{
                    background: '#f0fdff',
                    border: '1px solid #cffafe',
                    color: '#374151',
                    maxHeight: 120,
                    lineHeight: '1.5',
                  }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: input.trim() && !loading ? '#0891b2' : '#cffafe' }}
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0891b2' }} />
                    : <Send className="w-4 h-4" style={{ color: input.trim() ? '#ffffff' : '#0891b2' }} />
                  }
                </button>
              </div>
              <p className="text-[10px] text-center mt-2" style={{ color: '#9ca3af' }}>
                Shift+Enter — новая строка
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating trigger button
export function AIMentorButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #0891b2, #164e63)', boxShadow: '0 8px 24px rgba(8,145,178,0.35)' }}
        >
          <Sparkles className="w-4 h-4" />
          ИИ Ментор
          <span className="w-2 h-2 rounded-full bg-[#67e8f9] animate-pulse" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
