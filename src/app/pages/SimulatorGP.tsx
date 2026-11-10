import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Lightbulb,
  BarChart3, TrendingDown, TrendingUp, Minus, ChevronRight,
  Lock, BookOpen, Target, Clock, Star, RotateCcw, Layers,
  ChevronDown, Award, Zap, Send, Sparkles, Loader2
} from 'lucide-react';

import { SERVER_URL, getAccessToken } from '@/lib/api';

// ─── AI Text Evaluator ─────────────────────────────────────────────────────────

interface AIEvalResult {
  score: 'excellent' | 'good' | 'partial' | 'incorrect';
  headline: string;
  feedback: string;
  whatWorked: string;
  whatMissed: string;
  nextStep: string;
}

const AITextTask = ({
  question, context, rubric, onComplete,
}: {
  question: string;
  context: string;
  rubric: string; // what a correct answer should contain
  onComplete: () => void;
}) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIEvalResult | null>(null);
  const [streamText, setStreamText] = useState('');

  const evaluate = async () => {
    if (answer.trim().length < 20 || loading) return;
    setLoading(true);
    setStreamText('');
    setResult(null);

    const prompt = `Ты Senior Product Manager с 10+ годами опыта в BigTech. Оцени ответ студента на продуктовую задачу.

Задание: ${question}

Контекст: ${context}

Критерии правильного ответа: ${rubric}

Ответ студента: ${answer}

Дай оценку в формате JSON:
{
  "score": "excellent|good|partial|incorrect",
  "headline": "Краткая оценка одним предложением",
  "feedback": "2-3 предложения основного фидбека",
  "whatWorked": "Что было правильно в ответе",
  "whatMissed": "Чего не хватило или что было неверно",
  "nextStep": "Конкретный следующий шаг для улучшения навыка"
}

Отвечай только JSON, без markdown-обёртки.`;

    try {
      const res = await fetch(`${SERVER_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getAccessToken()}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 600,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      let accumulated = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices?.[0]?.delta?.content ?? '';
            accumulated += delta;
            setStreamText(accumulated);
          } catch {}
        }
      }

      const parsed: AIEvalResult = JSON.parse(accumulated.trim());
      setResult(parsed);
    } catch {
      setResult({
        score: 'good',
        headline: 'Ответ получен',
        feedback: 'Не удалось получить AI-оценку. Проверь свой ответ самостоятельно по критериям задания.',
        whatWorked: answer.trim().length > 50 ? 'Развёрнутый ответ — хорошо' : 'Попробуй написать подробнее',
        whatMissed: 'AI-сервис временно недоступен',
        nextStep: 'Перечитай задание и сравни свой ответ с ключевыми критериями',
      });
    } finally {
      setLoading(false);
    }
  };

  const scoreConfig = {
    excellent: { color: '#15803d', bg: '#f0fdf4', border: '#86efac', label: 'Отлично', icon: '🎯' },
    good:      { color: '#0891b2', bg: '#f0fdff', border: '#67e8f9', label: 'Хорошо', icon: '✓' },
    partial:   { color: '#b45309', bg: '#fef3c7', border: '#fcd34d', label: 'Частично', icon: '~' },
    incorrect: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Нет', icon: '✗' },
  };
  const cfg = result ? scoreConfig[result.score] : null;

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        disabled={!!result || loading}
        placeholder="Напишите ваш анализ... Минимум 20 символов. AI оценит ответ как Senior PM."
        rows={5}
        className="w-full text-[13.5px] leading-relaxed rounded-xl px-4 py-3 outline-none resize-none transition-all"
        style={{
          border: '1.5px solid #e5e7eb',
          background: result ? '#f9fafb' : '#fff',
          color: '#374151',
          fontFamily: 'inherit',
        }}
      />

      {!result && (
        <button
          onClick={evaluate}
          disabled={answer.trim().length < 20 || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: answer.trim().length >= 20 && !loading ? TEAL : '#e5e7eb',
            color: answer.trim().length >= 20 && !loading ? '#fff' : '#9ca3af',
            cursor: answer.trim().length >= 20 && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> AI оценивает ответ...</>
            : <><Sparkles className="w-4 h-4" /> Отправить на оценку AI</>
          }
        </button>
      )}

      {loading && !result && streamText && (
        <div className="text-[11px] font-mono p-3 rounded-lg" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
          {streamText.slice(0, 100)}...
        </div>
      )}

      {result && cfg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: `1.5px solid ${cfg.border}`, background: cfg.bg }}
        >
          <div className="px-5 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-lg">{cfg.icon}</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                <p className="font-bold text-sm mt-0.5" style={{ color: '#111827' }}>{result.headline}</p>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#374151' }}>{result.feedback}</p>

            <div className="grid grid-cols-1 gap-2 mb-4">
              {result.whatWorked && (
                <div className="flex gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: '#9ca3af' }}>Что сработало</p>
                    <p className="text-[12.5px]" style={{ color: '#374151' }}>{result.whatWorked}</p>
                  </div>
                </div>
              )}
              {result.whatMissed && (
                <div className="flex gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: '#9ca3af' }}>Что упущено</p>
                    <p className="text-[12.5px]" style={{ color: '#374151' }}>{result.whatMissed}</p>
                  </div>
                </div>
              )}
              {result.nextStep && (
                <div className="flex gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: TEAL }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: '#9ca3af' }}>Следующий шаг</p>
                    <p className="text-[12.5px]" style={{ color: '#374151' }}>{result.nextStep}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-5 py-3 flex justify-end" style={{ borderTop: `1px solid ${cfg.border}`, background: 'rgba(255,255,255,0.4)' }}>
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-white"
              style={{ background: TEAL }}
            >
              Продолжить <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
import clsx from 'clsx';
import {
  GP_SIMULATOR, GPModule, GPStep, GPTask, GPProgress, StepProgress,
  loadProgress, saveProgress, validateAnswer, getModuleProgress,
  getInitialProgress, TaskStatus
} from '@/data/simulator-gp';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEAL = '#0891b2';
const DARK = '#164e63';

const difficultyColor = (d: string) =>
  d === 'Начальный' ? '#2e7b5e' : d === 'Средний' ? '#b45309' : '#be185d';

// ─── Funnel Visualizer ────────────────────────────────────────────────────────

const FunnelChart = ({ funnel }: { funnel: NonNullable<GPTask['funnel']> }) => {
  const max = funnel[0].users;
  return (
    <div className="space-y-1.5 my-4">
      {funnel.map((row, i) => {
        const pct = (row.users / max) * 100;
        const isWorst = i > 0 && row.dropoff === Math.max(...funnel.slice(1).map(r => r.dropoff));
        return (
          <div key={i} className="relative">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] w-48 truncate font-medium" style={{ color: '#374151' }}>{row.stage}</span>
              <span className="text-[11px] font-bold" style={{ color: isWorst ? '#dc2626' : '#374151' }}>
                {row.users.toLocaleString()}
              </span>
              {i > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{
                  background: isWorst ? '#fee2e2' : '#f3f4f6',
                  color: isWorst ? '#dc2626' : '#6b7280'
                }}>
                  -{row.dropoff.toLocaleString()} ({(100 - row.conversion).toFixed(1)}% drop)
                  {isWorst && ' ← максимальный drop'}
                </span>
              )}
            </div>
            <div className="h-7 rounded-lg overflow-hidden flex items-center" style={{ background: '#f3f4f6' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="h-full rounded-lg flex items-center px-2"
                style={{ background: isWorst ? '#fca5a5' : i === 0 ? TEAL : '#93c5fd', minWidth: 2 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Metrics Table ────────────────────────────────────────────────────────────

const MetricsTable = ({ metrics }: { metrics: NonNullable<GPTask['metrics']> }) => (
  <div className="rounded-xl overflow-hidden my-4" style={{ border: '1px solid #e5e7eb' }}>
    <table className="w-full text-sm">
      <thead>
        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9ca3af' }}>Метрика</th>
          <th className="text-right px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9ca3af' }}>Текущее</th>
          <th className="text-right px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9ca3af' }}>Цель</th>
          <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9ca3af' }}>Тренд</th>
        </tr>
      </thead>
      <tbody>
        {metrics.map((row, i) => (
          <tr key={i} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
            <td className="px-4 py-3">
              <div className="text-[13px] font-medium" style={{ color: '#111827' }}>{row.metric}</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>{row.note}</div>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-[13px] font-bold" style={{ color: '#111827' }}>{row.current}</span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-[12px]" style={{ color: '#6b7280' }}>{row.target}</span>
            </td>
            <td className="px-4 py-3">
              {row.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
               row.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-400" /> :
               <Minus className="w-4 h-4 text-gray-400" />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Data Table ───────────────────────────────────────────────────────────────

const DataTable = ({ table }: { table: NonNullable<GPTask['table']> }) => (
  <div className="rounded-xl overflow-hidden my-4" style={{ border: '1px solid #e5e7eb' }}>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {table.headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9ca3af' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid #f3f4f6' : 'none' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-[13px]" style={{ color: ci === 0 ? '#111827' : '#374151', fontWeight: ci === 0 ? 500 : 400 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Answer Options ───────────────────────────────────────────────────────────

const AnswerOptions = ({
  task, selectedAnswer, status, onSelect,
}: {
  task: GPTask;
  selectedAnswer: string | null;
  status: TaskStatus;
  onSelect: (id: string) => void;
}) => {
  const locked = status === 'correct' || status === 'completed';
  return (
    <div className="space-y-2 mt-4">
      {task.options?.map((opt, i) => {
        const isSelected = selectedAnswer === opt.id;
        const showResult = status === 'correct' || status === 'incorrect';
        const isCorrectOpt = opt.isCorrect;
        const bgColor = !showResult
          ? isSelected ? '#eff6ff' : '#ffffff'
          : isCorrectOpt ? '#f0fdf4' : isSelected ? '#fef2f2' : '#ffffff';
        const borderColor = !showResult
          ? isSelected ? TEAL : '#e5e7eb'
          : isCorrectOpt ? '#86efac' : isSelected ? '#fca5a5' : '#e5e7eb';

        return (
          <motion.button
            key={opt.id}
            whileTap={locked ? undefined : { scale: 0.99 }}
            onClick={() => !locked && onSelect(opt.id)}
            disabled={locked}
            className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-start gap-3"
            style={{ background: bgColor, border: `1.5px solid ${borderColor}`, cursor: locked ? 'default' : 'pointer' }}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5" style={{
              borderColor: !showResult ? isSelected ? TEAL : '#d1d5db' : isCorrectOpt ? '#22c55e' : isSelected ? '#ef4444' : '#d1d5db',
              background: !showResult ? isSelected ? TEAL : 'transparent' : isCorrectOpt ? '#22c55e' : isSelected ? '#ef4444' : 'transparent',
            }}>
              {(!showResult && isSelected) && <div className="w-2 h-2 rounded-full bg-white" />}
              {showResult && isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              {showResult && isSelected && !isCorrectOpt && <XCircle className="w-3.5 h-3.5 text-white" />}
              {!showResult && !isSelected && <span className="text-[10px] font-bold" style={{ color: '#9ca3af' }}>{String.fromCharCode(65 + i)}</span>}
            </div>
            <span className="text-[13.5px] leading-snug" style={{ color: '#374151' }}>{opt.text}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

// ─── Feedback Panel ───────────────────────────────────────────────────────────

const FeedbackPanel = ({
  task, status, attempts, onRetry, onContinue,
}: {
  task: GPTask;
  status: TaskStatus;
  attempts: number;
  onRetry: () => void;
  onContinue: () => void;
}) => {
  const [showDeep, setShowDeep] = useState(false);
  if (status !== 'correct' && status !== 'incorrect') return null;
  const correct = status === 'correct';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${correct ? '#86efac' : '#fca5a5'}`, background: correct ? '#f0fdf4' : '#fef2f2' }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5 mb-2">
          {correct
            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
            : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />}
          <span className="font-bold text-sm" style={{ color: correct ? '#15803d' : '#dc2626' }}>
            {correct ? 'Верно!' : 'Не совсем'}
          </span>
        </div>
        <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: correct ? '#166534' : '#991b1b' }}>
          {correct ? task.feedback.correct : task.feedback.incorrect}
        </p>

        {!correct && attempts < 2 && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-3" style={{ background: 'rgba(0,0,0,0.04)' }}>
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#b45309' }} />
            <p className="text-[12.5px]" style={{ color: '#92400e' }}>{task.feedback.hint}</p>
          </div>
        )}

        <button
          onClick={() => setShowDeep(v => !v)}
          className="flex items-center gap-1.5 text-[12px] font-medium mb-3"
          style={{ color: correct ? '#15803d' : '#dc2626' }}
        >
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showDeep ? 'rotate-180' : '')} />
          {showDeep ? 'Скрыть разбор' : 'Показать подробный разбор'}
        </button>

        {showDeep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-[12.5px] leading-relaxed whitespace-pre-line p-3 rounded-xl mb-3"
            style={{ background: 'rgba(0,0,0,0.04)', color: correct ? '#166534' : '#991b1b' }}
          >
            {task.feedback.deepExplanation}
          </motion.div>
        )}
      </div>

      <div className="px-5 py-3 flex gap-2 justify-end" style={{ background: 'rgba(0,0,0,0.04)', borderTop: `1px solid ${correct ? '#86efac' : '#fca5a5'}` }}>
        {!correct && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Попробовать снова
          </button>
        )}
        <button
          onClick={onContinue}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: correct ? '#0891b2' : '#374151' }}
        >
          Продолжить
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ value, total }: { value: number; total: number }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: TEAL }}
        animate={{ width: `${(value / total) * 100}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
    <span className="text-[11px] font-medium flex-shrink-0" style={{ color: '#9ca3af' }}>{value}/{total}</span>
  </div>
);

// ─── Step Renderer ────────────────────────────────────────────────────────────

const StepRenderer = ({
  step, stepProgress, onAnswer, onContinue, onRetry,
}: {
  step: GPStep;
  stepProgress: StepProgress | undefined;
  onAnswer: (taskId: string, answer: string) => void;
  onContinue: () => void;
  onRetry: () => void;
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const status: TaskStatus = stepProgress?.status ?? 'not_started';

  const handleSelect = (id: string) => {
    if (status === 'correct' || status === 'completed') return;
    setSelected(id);
  };

  const handleCheck = () => {
    if (!selected || !step.task) return;
    onAnswer(step.task.id, selected);
  };

  // Reset selection on step change
  useEffect(() => {
    setSelected(null);
  }, [step.id]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Step type badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{
          background: step.type === 'task' ? '#cffafe' : step.type === 'theory' ? '#fef3c7' : step.type === 'summary' ? '#f0fdf4' : '#f3f4f6',
          color: step.type === 'task' ? '#0891b2' : step.type === 'theory' ? '#92400e' : step.type === 'summary' ? '#15803d' : '#6b7280',
        }}>
          {step.type === 'context' ? 'Контекст' : step.type === 'theory' ? 'Теория' : step.type === 'task' ? 'Задание' : step.type === 'summary' ? 'Итог' : 'Шаг'}
        </span>
        <h2 className="text-lg font-bold" style={{ color: '#111827' }}>{step.title}</h2>
      </div>

      {/* Team message */}
      {step.teamMessage && (
        <div className="flex gap-3 mb-5 p-4 rounded-2xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: DARK }}>
            {step.teamMessage.author[0]}
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#111827' }}>{step.teamMessage.author}</span>
              <span className="text-[11px]" style={{ color: '#9ca3af' }}>{step.teamMessage.role}</span>
            </div>
            <p className="text-[13px] leading-relaxed italic" style={{ color: '#374151' }}>"{step.teamMessage.text}"</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="text-[14px] leading-relaxed whitespace-pre-wrap mb-4" style={{ color: '#374151' }}>
        {step.content}
      </div>

      {/* Insight highlight */}
      {step.insight && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl mb-5" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <p className="text-[13px] font-medium" style={{ color: '#1e40af' }}>{step.insight}</p>
        </div>
      )}

      {/* Task */}
      {step.task && (
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid #f3f4f6' }}>
          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#cffafe' }}>
              <Target className="w-3.5 h-3.5" style={{ color: '#0891b2' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{step.task.question}</p>
              {step.task.description && (
                <p className="text-[12.5px] mt-0.5" style={{ color: '#6b7280' }}>{step.task.description}</p>
              )}
            </div>
          </div>

          {/* Data visualizations */}
          {step.task.funnel && <FunnelChart funnel={step.task.funnel} />}
          {step.task.metrics && <MetricsTable metrics={step.task.metrics} />}
          {step.task.table && <DataTable table={step.task.table} />}

          {/* Answer options */}
          {step.task.options && (
            <AnswerOptions
              task={step.task}
              selectedAnswer={selected}
              status={status}
              onSelect={handleSelect}
            />
          )}

          {/* Check button */}
          {status !== 'correct' && status !== 'completed' && status !== 'incorrect' && (
            <button
              onClick={handleCheck}
              disabled={!selected}
              className="mt-4 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                background: selected ? TEAL : '#e5e7eb',
                color: selected ? '#ffffff' : '#9ca3af',
                cursor: selected ? 'pointer' : 'not-allowed',
              }}
            >
              Проверить ответ
            </button>
          )}

          {/* Feedback */}
          <FeedbackPanel
            task={step.task}
            status={status}
            attempts={stepProgress?.attempts ?? 0}
            onRetry={onRetry}
            onContinue={onContinue}
          />
        </div>
      )}

      {/* AI text task */}
      {step.aiTask && (
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid #f3f4f6' }}>
          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ede9fe' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#0e7490' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#111827' }}>{step.aiTask.question}</p>
              <p className="text-[12px] mt-0.5" style={{ color: '#6b7280' }}>AI оценит ваш ответ как Senior PM</p>
            </div>
          </div>
          <AITextTask
            question={step.aiTask.question}
            context={step.aiTask.context}
            rubric={step.aiTask.rubric}
            onComplete={onContinue}
          />
        </div>
      )}

      {/* Non-task continue button */}
      {!step.task && !step.aiTask && (
        <button
          onClick={onContinue}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: TEAL }}
        >
          Продолжить
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ─── Module Card (Course Map) ─────────────────────────────────────────────────

const ModuleCard = ({
  module, progress, isCurrent, onClick,
}: {
  module: GPModule;
  progress: number;
  isCurrent: boolean;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={module.isLocked ? undefined : { y: -2 }}
    onClick={module.isLocked ? undefined : onClick}
    className={clsx('rounded-2xl p-5 transition-all', module.isLocked ? 'cursor-default' : 'cursor-pointer')}
    style={{
      background: module.isLocked ? '#f9fafb' : '#ffffff',
      border: isCurrent ? `2px solid ${TEAL}` : '1.5px solid #e5e7eb',
      opacity: module.isLocked ? 0.6 : 1,
      boxShadow: isCurrent ? `0 0 0 4px rgba(8,145,178,0.08)` : '0 1px 4px rgba(0,0,0,0.05)',
    }}
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: difficultyColor(module.difficulty) + '18', color: difficultyColor(module.difficulty) }}>
            {module.difficulty}
          </span>
          {isCurrent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#cffafe', color: '#0891b2' }}>Текущий</span>}
        </div>
        <h3 className="font-bold text-[15px] leading-tight" style={{ color: '#111827' }}>{module.title}</h3>
        <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>{module.subtitle}</p>
      </div>
      {module.isLocked
        ? <Lock className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#d1d5db' }} />
        : progress === 100
          ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#22c55e' }} />
          : <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#d1d5db' }} />
      }
    </div>

    <p className="text-[12.5px] mb-4 leading-relaxed" style={{ color: '#6b7280' }}>{module.description}</p>

    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
        <span className="text-[11px]" style={{ color: '#9ca3af' }}>{module.duration}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
        <span className="text-[11px]" style={{ color: '#9ca3af' }}>{module.steps.length} шагов</span>
      </div>
    </div>

    <div className="flex gap-1.5 flex-wrap mb-3">
      {module.tags.map(tag => (
        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>{tag}</span>
      ))}
    </div>

    {!module.isLocked && progress > 0 && (
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]" style={{ color: '#9ca3af' }}>
          <span>Прогресс</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: '#f3f4f6' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress === 100 ? '#22c55e' : TEAL }} />
        </div>
      </div>
    )}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

type View = 'course_map' | 'module';

export function SimulatorGP() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('course_map');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [progress, setProgress] = useState<GPProgress>(loadProgress);

  const activeModule = activeModuleId
    ? GP_SIMULATOR.modules.find(m => m.id === activeModuleId) ?? null
    : null;
  const activeStep = activeModule?.steps[activeStepIndex] ?? null;

  const getStepProgress = (moduleId: string, stepId: string): StepProgress | undefined =>
    progress.modules[moduleId]?.stepsProgress[stepId];

  const updateStepProgress = useCallback((moduleId: string, stepId: string, update: Partial<StepProgress>) => {
    setProgress(prev => {
      const modProg = prev.modules[moduleId] ?? { moduleId, stepsProgress: {}, score: 0 };
      const existing = modProg.stepsProgress[stepId] ?? { stepId, status: 'not_started', attempts: 0 };
      const next: GPProgress = {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...modProg,
            stepsProgress: {
              ...modProg.stepsProgress,
              [stepId]: { ...existing, ...update },
            },
          },
        },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleAnswer = useCallback((taskId: string, answer: string) => {
    if (!activeModule || !activeStep) return;
    const task = activeStep.task;
    if (!task) return;
    const correct = validateAnswer(task, answer);
    const existing = getStepProgress(activeModule.id, activeStep.id);
    const attempts = (existing?.attempts ?? 0) + 1;
    updateStepProgress(activeModule.id, activeStep.id, {
      status: correct ? 'correct' : 'incorrect',
      attempts,
      lastAnswer: answer,
    });
    setProgress(prev => ({
      ...prev,
      totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
      totalAttempts: prev.totalAttempts + 1,
    }));
  }, [activeModule, activeStep, updateStepProgress]);

  const handleRetry = useCallback(() => {
    if (!activeModule || !activeStep) return;
    updateStepProgress(activeModule.id, activeStep.id, { status: 'in_progress' });
  }, [activeModule, activeStep, updateStepProgress]);

  const handleContinue = useCallback(() => {
    if (!activeModule) return;
    // Mark step as completed
    if (activeStep) {
      const sp = getStepProgress(activeModule.id, activeStep.id);
      if (!sp || sp.status === 'not_started' || sp.status === 'in_progress') {
        updateStepProgress(activeModule.id, activeStep.id, { status: 'completed', completedAt: Date.now() });
      }
    }
    if (activeStepIndex < activeModule.steps.length - 1) {
      setActiveStepIndex(i => i + 1);
    } else {
      // Module done
      setView('course_map');
      setActiveModuleId(null);
      setActiveStepIndex(0);
    }
  }, [activeModule, activeStep, activeStepIndex, updateStepProgress]);

  const handleOpenModule = (moduleId: string) => {
    const mod = GP_SIMULATOR.modules.find(m => m.id === moduleId);
    if (!mod || mod.isLocked) return;
    setActiveModuleId(moduleId);
    setActiveStepIndex(0);
    setView('module');
  };

  const totalSteps = GP_SIMULATOR.modules.filter(m => !m.isLocked).reduce((s, m) => s + m.steps.length, 0);
  const completedSteps = Object.values(progress.modules).reduce((s, mp) =>
    s + Object.values(mp.stepsProgress).filter(sp => sp.status === 'correct' || sp.status === 'completed').length, 0);
  const overallPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // ── Course Map ──────────────────────────────────────────────────────────────

  if (view === 'course_map') {
    return (
      <div className="min-h-full pb-16" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Header */}
        <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(240,253,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: '#6b7280' }}>
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <span className="text-sm font-bold" style={{ color: '#111827' }}>{progress.totalCorrect}</span>
              <span className="text-sm" style={{ color: '#9ca3af' }}>правильных</span>
            </div>
            <div className="w-px h-4 hidden sm:block" style={{ background: '#e5e7eb' }} />
            <span className="text-sm font-semibold" style={{ color: TEAL }}>{overallPct}% курса</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Hero */}
          <div className="rounded-2xl p-7 mb-8 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK}, ${TEAL})` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5" style={{ color: '#67e8f9' }} />
                <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'rgba(207,250,254,0.8)' }}>Интерактивный симулятор</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{GP_SIMULATOR.title}</h1>
              <p className="text-sm mb-5" style={{ color: 'rgba(207,250,254,0.75)' }}>{GP_SIMULATOR.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: 'rgba(207,250,254,0.6)' }}>Общий прогресс</span>
                <span className="text-xs font-bold" style={{ color: '#67e8f9' }}>{overallPct}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <motion.div className="h-full rounded-full" style={{ background: '#67e8f9' }} animate={{ width: `${overallPct}%` }} />
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-4" style={{ color: '#111827' }}>Модули курса</h2>
            <div className="grid gap-4">
              {GP_SIMULATOR.modules.map(mod => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  progress={getModuleProgress(progress, mod.id)}
                  isCurrent={progress.currentModuleId === mod.id}
                  onClick={() => handleOpenModule(mod.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Module / Step View ──────────────────────────────────────────────────────

  if (!activeModule || !activeStep) return null;

  const modProgress = getModuleProgress(progress, activeModule.id);
  const completedInMod = Object.values(progress.modules[activeModule.id]?.stepsProgress ?? {})
    .filter(s => s.status === 'correct' || s.status === 'completed').length;

  return (
    <div className="min-h-full" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Module header */}
      <div className="sticky top-0 z-20" style={{ background: 'rgba(240,253,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: '#9ca3af' }}>
            <button onClick={() => { setView('course_map'); setActiveModuleId(null); }} className="hover:underline">Курс</button>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: '#374151' }}>{activeModule.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: TEAL }}>Шаг {activeStepIndex + 1}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setView('course_map'); setActiveModuleId(null); }}
              className="p-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ color: '#6b7280' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <ProgressBar value={completedInMod} total={activeModule.steps.length} />
            </div>
            <span className="text-[11px] font-medium flex-shrink-0" style={{ color: TEAL }}>{modProgress}%</span>
          </div>
        </div>

        {/* Step tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {activeModule.steps.map((s, i) => {
              const sp = getStepProgress(activeModule.id, s.id);
              const done = sp?.status === 'correct' || sp?.status === 'completed';
              const isActive = i === activeStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStepIndex(i)}
                  className="flex-shrink-0 w-7 h-7 rounded-full text-[10px] font-bold transition-all flex items-center justify-center"
                  style={{
                    background: isActive ? TEAL : done ? '#dcfce7' : '#f3f4f6',
                    color: isActive ? '#ffffff' : done ? '#15803d' : '#9ca3af',
                  }}
                >
                  {done && !isActive ? '✓' : i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <StepRenderer
            step={activeStep}
            stepProgress={getStepProgress(activeModule.id, activeStep.id)}
            onAnswer={handleAnswer}
            onContinue={handleContinue}
            onRetry={handleRetry}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
