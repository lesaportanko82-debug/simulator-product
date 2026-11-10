import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { casesData, CaseStudy } from '@/data/cases';
import { ArrowLeft, ChevronRight, Clock, Send, CheckCircle, Loader2, Paperclip, X, File, BarChart3, Target, FileText, AlertTriangle, Sparkles, HelpCircle, RefreshCw, Lightbulb, BookOpen, Compass, Award } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const difficultyConfig = {
  Junior: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  Middle: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  Senior: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

// ──────────────────────── Case List ────────────────────────

function CaseList() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const stored = localStorage.getItem(`pm-case-status-${session.user.id}`);
      if (stored) { try { setAnswers(JSON.parse(stored)); } catch {} }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-400 font-bold mb-2 md:mb-3">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Дашборд</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">Кейс-практика</span>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Кейс-практика</h1>
        <p className="text-gray-500 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed">
          10 реальных бизнес-кейсов из разных индустрий. Проанализируйте данные, найдите корневые причины и предложите продуктовое решение. AI-ментор поможет и проверит ваш ответ.
        </p>
      </div>

      <div className="flex gap-3 md:gap-4 flex-wrap">
        <div className="bg-white border border-gray-200 rounded-xl px-4 md:px-5 py-3 flex items-center gap-3 shadow-sm flex-1 min-w-[140px]">
          <FileText className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold">Всего кейсов</p>
            <p className="text-base md:text-lg font-extrabold text-gray-900">{casesData.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 md:px-5 py-3 flex items-center gap-3 shadow-sm flex-1 min-w-[140px]">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold">Решено</p>
            <p className="text-base md:text-lg font-extrabold text-gray-900">{Object.keys(answers).filter(k => answers[k]).length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 md:px-5 py-3 flex items-center gap-3 shadow-sm flex-1 min-w-[140px]">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-violet-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold">AI-ревью</p>
            <p className="text-base md:text-lg font-extrabold text-gray-900">Доступно</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4">
        {casesData.map((c, idx) => {
          const Icon = c.icon;
          const diff = difficultyConfig[c.difficulty];
          const isSolved = answers[c.id];

          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Link to={`/resources/cases/${c.id}`} className="group block bg-white rounded-xl md:rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all p-4 md:p-5 lg:p-6">
                <div className="flex items-start gap-3 md:gap-4 lg:gap-5">
                  <div className={clsx("w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br text-white shadow-lg", c.gradient)}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1 md:mb-1.5">
                      <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{c.company} · {c.market}</span>
                      {isSolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Решено
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg lg:text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">{c.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx("px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold border", diff.bg, diff.text, diff.border)}>{c.difficulty}</span>
                      <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">{c.metric}</span>
                      <span className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 font-medium"><Clock className="w-3 h-3" /> {c.timeEstimate}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-1.5 mt-2 md:mt-3">
                      {c.tags.map(tag => (
                        <span key={tag} className="text-[9px] md:text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 md:px-2 py-0.5 rounded-md border border-gray-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1 md:mt-2 hidden sm:block" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────── AI Review Card ────────────────────────

interface ReviewData {
  score: number;
  grade: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missed: string[];
  criteria: Record<string, { score: number; comment: string }>;
  recommendation: string;
}

const criteriaLabels: Record<string, { label: string; icon: any }> = {
  analytics: { label: 'Аналитика', icon: BarChart3 },
  structure: { label: 'Структура', icon: FileText },
  creativity: { label: 'Креативность', icon: Lightbulb },
  feasibility: { label: 'Реалистичность', icon: Target },
  depth: { label: 'Глубина', icon: BookOpen },
};

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}
function getBarColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}
function getGradeColor(grade: string) {
  if (grade === 'Отлично') return 'bg-green-100 text-green-700 border-green-200';
  if (grade === 'Хорошо') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (grade === 'Неплохо') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (grade === 'Нужна доработка') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function AIReviewCard({ review }: { review: ReviewData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
      {/* Score header */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-200 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">
        <div className="flex items-start gap-3 md:gap-5">
          <div className="relative flex-shrink-0">
            <div className={clsx("text-4xl md:text-5xl lg:text-6xl font-black", getScoreColor(review.score))}>{review.score}</div>
            <div className="text-[10px] md:text-xs text-gray-400 font-bold text-center">/100</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
              <span className={clsx("px-2.5 md:px-3 py-0.5 md:py-1 rounded-lg text-xs md:text-sm font-bold border", getGradeColor(review.grade))}>{review.grade}</span>
              <div className="flex items-center gap-1.5 text-violet-600">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-xs font-bold">AI Ревью</span>
              </div>
            </div>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">{review.summary}</p>
          </div>
        </div>
      </div>

      {/* Criteria bars */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
        <h4 className="font-extrabold text-gray-900 text-xs md:text-sm uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-2">
          <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500" /> Оценка по критериям
        </h4>
        <div className="space-y-3 md:space-y-4">
          {Object.entries(review.criteria || {}).map(([key, val]) => {
            const info = criteriaLabels[key];
            if (!info) return null;
            const CIcon = info.icon;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-bold text-gray-700">{info.label}</span>
                  </div>
                  <span className={clsx("text-xs md:text-sm font-extrabold", getScoreColor(val.score))}>{val.score}</span>
                </div>
                <div className="w-full h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${val.score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={clsx("h-full rounded-full", getBarColor(val.score))} />
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">{val.comment}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl md:rounded-2xl p-4 md:p-5">
          <h4 className="font-extrabold text-green-800 text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Сильные стороны</h4>
          <ul className="space-y-1.5 md:space-y-2">
            {review.strengths?.map((s, i) => (
              <li key={i} className="text-xs md:text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> <span className="flex-1">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-5">
          <h4 className="font-extrabold text-red-800 text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Слабые стороны</h4>
          <ul className="space-y-1.5 md:space-y-2">
            {review.weaknesses?.map((w, i) => (
              <li key={i} className="text-xs md:text-sm text-red-800 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span> <span className="flex-1">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missed */}
      {review.missed && review.missed.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl md:rounded-2xl p-4 md:p-5">
          <h4 className="font-extrabold text-amber-800 text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Что вы упустили</h4>
          <ul className="space-y-1.5 md:space-y-2">
            {review.missed.map((m, i) => (
              <li key={i} className="text-xs md:text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">!</span> <span className="flex-1">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl md:rounded-2xl p-4 md:p-5">
        <h4 className="font-extrabold text-indigo-800 text-xs md:text-sm mb-2 flex items-center gap-2"><Compass className="w-3.5 h-3.5 md:w-4 md:h-4" /> Рекомендация</h4>
        <p className="text-xs md:text-sm text-indigo-800 leading-relaxed">{review.recommendation}</p>
      </div>
    </motion.div>
  );
}

// ──────────────────────── AI Hint Bubble ────────────────────────

function HintBubble({ hint, isLoading }: { hint: string | null; isLoading: boolean }) {
  if (!hint && !isLoading) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-5 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-violet-600 mb-1">AI Ментор</p>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Думаю...
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{hint}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────── Section Header ────────────────────────

function SectionHeader({ icon: Icon, label, num, color }: { icon: any; label: string; num: string; color: string }) {
  const colorMap: Record<string, { iconBg: string; iconText: string }> = {
    indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
    red: { iconBg: 'bg-red-100', iconText: 'text-red-600' },
    blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
    violet: { iconBg: 'bg-violet-100', iconText: 'text-violet-600' },
    emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="flex items-center gap-4 mb-5">
      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", c.iconBg)}>
        <Icon className={clsx("w-5 h-5", c.iconText)} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{num}</p>
        <h2 className="text-xl font-extrabold text-gray-900">{label}</h2>
      </div>
      <div className="flex-1 h-px bg-gray-200 ml-4" />
    </div>
  );
}

// ──────────────────────── Markdown Renderer ────────────────────────

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-extrabold text-gray-900 mt-6 mb-2 text-lg">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.trim().startsWith('* ')) {
      return (
        <li key={i} className="ml-5 list-disc text-gray-700 mb-1.5 text-base leading-relaxed marker:text-indigo-400">
          <span dangerouslySetInnerHTML={{ __html: line.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700">$1</code>') }} />
        </li>
      );
    }
    if (line.trim().match(/^\d\./)) {
      return (
        <div key={i} className="flex gap-3 mb-2 text-gray-700 items-start">
          <span className="font-bold text-indigo-600 bg-indigo-50 w-7 h-7 flex items-center justify-center rounded-lg text-xs flex-shrink-0 border border-indigo-100">{line.split('.')[0]}</span>
          <span className="leading-relaxed text-base pt-0.5 flex-1" dangerouslySetInnerHTML={{ __html: line.split('.').slice(1).join('.').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>') }} />
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-gray-600 mb-2 leading-[1.8] text-base" dangerouslySetInnerHTML={{
        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700">$1</code>')
      }} />
    );
  });
}

// ──────────────────────── Case Detail ────────────────────────

function CaseDetail({ caseData }: { caseData: CaseStudy }) {
  const [answer, setAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: 'image' | 'file' }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('context');

  // AI state
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const Icon = caseData.icon;

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const localKey = `pm-case-answer-${session.user.id}-${caseData.id}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAnswer(parsed.text || '');
          setAttachments(parsed.attachments || []);
          if (parsed.submitted) setIsSubmitted(true);
          if (parsed.review) setReview(parsed.review);
        } catch {}
      }
    };
    // Reset AI state first
    setHint(null);
    setReview(null);
    setIsSubmitted(false);
    setAnswer('');
    setAttachments([]);
    // Then load will override if there's data
    load();
  }, [caseData.id]);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) setActiveSection(e.target.id); } },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    ['context', 'problem', 'data', 'task', 'answer'].forEach(id => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const formData = new FormData();
      formData.append('file', file);
      const userId = session?.user?.id || 'demo-user';
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/upload-attachment/${userId}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${await getAccessToken()}` }, body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setAttachments(prev => [...prev, { url: data.publicUrl, name: data.fileName || file.name, type: file.type.startsWith('image/') ? 'image' : 'file' }]);
      toast.success('Файл прикреплён');
    } catch (err: any) { toast.error('Ошибка: ' + err.message); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const saveLocally = (data: any) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem(`pm-case-answer-${session.user.id}-${caseData.id}`, JSON.stringify(data));
      }
    });
  };

  const handleSubmit = async () => {
    if (answer.length < 20) { toast.error('Напишите более развёрнутый ответ (минимум 20 символов).'); return; }
    setIsSaving(true);
    const answerData = { text: answer, attachments, submitted: true, review: null as any };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        localStorage.setItem(`pm-case-answer-${userId}-${caseData.id}`, JSON.stringify(answerData));
        const statusKey = `pm-case-status-${userId}`;
        const existing = JSON.parse(localStorage.getItem(statusKey) || '{}');
        existing[caseData.id] = true;
        localStorage.setItem(statusKey, JSON.stringify(existing));
      }
      if (userId && projectId && session?.access_token) {
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/case-answers/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ caseId: caseData.id, answer: answerData })
        }).catch(err => console.warn('Sync failed:', err));
      }
    } catch {}

    setIsSaving(false);
    setIsSubmitted(true);
    toast.success('Ответ сохранён! Запускаем AI-ревью...');

    // Trigger AI review
    requestAIReview();
  };

  const requestAIReview = async () => {
    setIsReviewing(true);
    setReview(null);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/ai/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getAccessToken()}` },
        body: JSON.stringify({
          caseContext: caseData.context,
          caseProblem: caseData.problem,
          caseData: caseData.data,
          caseTask: caseData.task,
          userAnswer: answer
        })
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReview(data.review);
        // Save review locally
        const answerData = { text: answer, attachments, submitted: true, review: data.review };
        saveLocally(answerData);
      } else {
        console.error('AI review failed:', data.error);
        toast.error('Не удалось получить AI-ревью: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('AI review error:', err);
      toast.error('Ошибка AI-ревью: ' + err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  const requestHint = async (hintType: string) => {
    setIsHintLoading(true);
    setHint(null);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/ai/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getAccessToken()}` },
        body: JSON.stringify({
          caseContext: caseData.context,
          caseProblem: caseData.problem,
          caseData: caseData.data,
          caseTask: caseData.task,
          userAnswer: answer || '',
          hintType
        })
      });
      const data = await res.json();
      if (data.success && data.hint) {
        setHint(data.hint);
      } else {
        toast.error('Не удалось получить подсказку');
      }
    } catch (err: any) {
      toast.error('Ошибка: ' + err.message);
    } finally {
      setIsHintLoading(false);
    }
  };

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItems = [
    { id: 'context', label: 'Контекст', icon: FileText },
    { id: 'problem', label: 'Проблема', icon: AlertTriangle },
    { id: 'data', label: 'Данные', icon: BarChart3 },
    { id: 'task', label: 'Задание', icon: Target },
    { id: 'answer', label: 'Ответ', icon: Send },
  ];

  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className={clsx("relative -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 px-4 md:px-6 lg:px-10 pt-5 md:pt-6 pb-6 md:pb-8 bg-gradient-to-br text-white overflow-hidden", caseData.gradient)}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-4xl">
          <Link to="/resources/case-practice" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs md:text-sm font-medium mb-4 md:mb-6">
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Все кейсы
          </Link>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 flex-wrap">
                <span className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-wider">{caseData.company} · {caseData.market}</span>
                <span className="px-1.5 md:px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold border bg-white/20 border-white/30 text-white">{caseData.difficulty}</span>
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight mb-2">{caseData.title}</h1>
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-white/70 font-medium flex-wrap">
                <span className="flex items-center gap-1 md:gap-1.5"><Target className="w-3 h-3 md:w-4 md:h-4" /> {caseData.metric}</span>
                <span className="flex items-center gap-1 md:gap-1.5"><Clock className="w-3 h-3 md:w-4 md:h-4" /> {caseData.timeEstimate}</span>
                <span className="flex items-center gap-1 md:gap-1.5"><Sparkles className="w-3 h-3 md:w-4 md:h-4" /> AI-ревью</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div className="sticky top-0 z-30 -mx-4 lg:-mx-8 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-0.5 md:gap-1 px-3 md:px-4 py-1.5 md:py-2 overflow-x-auto no-scrollbar">
          {navItems.map(n => {
            const NIcon = n.icon;
            const isActive = activeSection === n.id;
            return (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                className={clsx("flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3.5 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0",
                  isActive ? `bg-gradient-to-r ${caseData.gradient} text-white shadow-md` : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                )}>
                <NIcon className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto py-6 md:py-8 lg:py-10 space-y-8 md:space-y-12">
        <motion.section id="context" ref={el => { sectionRefs.current['context'] = el; }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-16 md:scroll-mt-20">
          <SectionHeader icon={FileText} label="Контекст" num="01" color="indigo" />
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">{renderMarkdown(caseData.context)}</div>
        </motion.section>

        <motion.section id="problem" ref={el => { sectionRefs.current['problem'] = el; }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-16 md:scroll-mt-20">
          <SectionHeader icon={AlertTriangle} label="Проблема" num="02" color="red" />
          <div className="bg-red-50/50 border border-red-100 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">{renderMarkdown(caseData.problem)}</div>
        </motion.section>

        <motion.section id="data" ref={el => { sectionRefs.current['data'] = el; }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-16 md:scroll-mt-20">
          <SectionHeader icon={BarChart3} label="Данные и аналитика" num="03" color="blue" />
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">{renderMarkdown(caseData.data)}</div>
        </motion.section>

        <motion.section id="task" ref={el => { sectionRefs.current['task'] = el; }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-16 md:scroll-mt-20">
          <SectionHeader icon={Target} label="Задание" num="04" color="violet" />
          <div className="bg-violet-50/50 border border-violet-100 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">{renderMarkdown(caseData.task)}</div>
        </motion.section>

        <motion.section id="answer" ref={el => { sectionRefs.current['answer'] = el; }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-16 md:scroll-mt-20">
          <SectionHeader icon={Send} label="Ваш ответ" num="05" color="emerald" />

          {/* AI Mentor Hints */}
          <div className="mb-3 md:mb-4">
            <AnimatePresence>
              {(hint || isHintLoading) && <HintBubble hint={hint} isLoading={isHintLoading} />}
            </AnimatePresence>

            {!isSubmitted && (
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                <p className="text-[10px] md:text-xs font-bold text-gray-400 w-full mb-0.5 md:mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-violet-500" /> AI Ментор — попросите подсказку:
                </p>
                {[
                  { type: 'start', label: 'С чего начать?', icon: Compass },
                  { type: 'stuck', label: 'Застрял', icon: HelpCircle },
                  { type: 'check', label: 'Проверь', icon: Target },
                  { type: 'framework', label: 'Фреймворк', icon: BookOpen },
                ].map(h => (
                  <button
                    key={h.type}
                    onClick={() => requestHint(h.type)}
                    disabled={isHintLoading}
                    className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold border border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors disabled:opacity-50 active:scale-95"
                  >
                    <h.icon className="w-3 h-3 md:w-3.5 md:h-3.5" /> {h.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={isSubmitted}
              className="w-full min-h-[250px] md:min-h-[300px] lg:min-h-[400px] p-3 md:p-4 lg:p-5 rounded-lg md:rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 resize-y text-sm md:text-base leading-relaxed bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
              placeholder="Напишите ваше решение кейса здесь. Структурируйте ответ по пунктам задания. После отправки AI проверит ваш ответ и даст обратную связь."
            />

            {/* Attachments */}
            <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4">
              <button onClick={() => fileInputRef.current?.click()} disabled={isSubmitted || isUploading}
                className="text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95">
                {isUploading ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Paperclip className="w-3.5 h-3.5 md:w-4 md:h-4" />} Прикрепить
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={handleFileUpload} />
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-3 md:mt-4">
                {attachments.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl border border-gray-200 bg-white group relative">
                    <div className="p-1.5 md:p-2 bg-gray-50 rounded-lg flex-shrink-0">{f.type === 'image' ? <img src={f.url} alt="" className="w-7 h-7 md:w-8 md:h-8 object-cover rounded" /> : <File className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />}</div>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-xs md:text-sm font-medium text-gray-700 truncate hover:text-indigo-600">{f.name}</a>
                    {!isSubmitted && (
                      <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit / Re-review */}
            <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:justify-between md:items-center mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
              <p className="text-xs md:text-sm text-gray-400 flex items-center gap-1.5 md:gap-2">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {isSubmitted ? 'Ответ отправлен' : `Рекомендуемое время: ${caseData.timeEstimate}`}
              </p>
              <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                {isSubmitted && (
                  <button onClick={requestAIReview} disabled={isReviewing}
                    className="px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm disabled:opacity-50 active:scale-95 flex-1 md:flex-initial">
                    <RefreshCw className={clsx("w-3.5 h-3.5 md:w-4 md:h-4", isReviewing && "animate-spin")} /> Перепроверить
                  </button>
                )}
                <button onClick={handleSubmit} disabled={isSubmitted || answer.length < 20 || isSaving}
                  className={clsx("px-4 md:px-8 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-bold text-white transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-lg hover:shadow-xl active:scale-95 text-xs md:text-base flex-1 md:flex-initial",
                    isSubmitted ? "bg-green-500 cursor-default" : answer.length < 20 ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : `bg-gradient-to-r ${caseData.gradient} hover:opacity-90`
                  )}>
                  {isSaving ? (<><Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Сохранение...</>) :
                   isSubmitted ? (<><CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Ответ принят</>) :
                   (<><Send className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Отправить и получить</span> AI-ревью</>)}
                </button>
              </div>
            </div>
          </div>

          {/* AI Review */}
          {isReviewing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 md:mt-8 flex flex-col items-center py-8 md:py-12 gap-3 md:gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-white animate-pulse" />
              </div>
              <p className="text-base md:text-lg font-bold text-gray-900 text-center">AI анализирует ваш ответ...</p>
              <p className="text-xs md:text-sm text-gray-500 text-center">Обычно это занимает 10-20 секунд</p>
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-violet-500" />
            </motion.div>
          )}

          {review && !isReviewing && (
            <div className="mt-6 md:mt-8">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">AI</p>
                  <h2 className="text-base md:text-xl font-extrabold text-gray-900">Результат проверки</h2>
                </div>
                <div className="hidden md:block flex-1 h-px bg-gray-200 ml-4" />
              </div>
              <AIReviewCard review={review} />
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

// ──────────────────────── Main Component ────────────────────────

export function CasePractice() {
  const { caseId } = useParams();

  if (caseId) {
    const caseData = casesData.find(c => c.id === caseId);
    if (!caseData) return <div className="text-center py-20 text-gray-500">Кейс не найден</div>;
    return <CaseDetail caseData={caseData} />;
  }

  return <CaseList />;
}