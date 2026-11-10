import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { courseData } from '@/data/course';
import { CheckCircle, ChevronRight, BookOpen, Lightbulb, Dumbbell, PenTool, Lock, ArrowLeft, Clock, Paperclip, X, File, Loader2, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ─── Amplitude Dashboard Embed ────────────────────────────────────────────────

const amplitudeData = [
  { date: '1 июн', DAU: 1240, WAU: 5800, MAU: 21000 },
  { date: '5 июн', DAU: 1380, WAU: 6100, MAU: 20600 },
  { date: '9 июн', DAU: 1520, WAU: 6400, MAU: 20100 },
  { date: '13 июн', DAU: 1690, WAU: 6800, MAU: 19400 },
  { date: '17 июн', DAU: 1850, WAU: 7100, MAU: 18700 },
  { date: '21 июн', DAU: 2010, WAU: 7300, MAU: 17900 },
  { date: '25 июн', DAU: 2200, WAU: 7500, MAU: 17100 },
  { date: '30 июн', DAU: 2380, WAU: 7800, MAU: 16200 },
];

const AmplitudeDashboard = () => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'DAU' | 'WAU' | 'MAU'>('all');
  const last = amplitudeData[amplitudeData.length - 1];
  const stickiness = Math.round((last.DAU / last.MAU) * 100);

  const metrics = [
    { key: 'DAU', label: 'DAU', value: last.DAU.toLocaleString(), delta: '+92%', color: '#0891b2', up: true },
    { key: 'WAU', label: 'WAU', value: last.WAU.toLocaleString(), delta: '+34%', color: '#059669', up: true },
    { key: 'MAU', label: 'MAU', value: last.MAU.toLocaleString(), delta: '-23%', color: '#dc2626', up: false },
  ] as const;

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Amplitude topbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100" style={{ background: '#1a1a2e' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
        </div>
        <span className="text-[11px] font-semibold text-white/70 ml-2">Amplitude — Active Users · Jun 2024</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(8,145,178,0.3)', color: '#67e8f9' }}>DEMO DATA</span>
      </div>

      {/* Chart area */}
      <div style={{ background: '#0f1117' }} className="px-5 pt-4 pb-2">
        {/* Metric tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'DAU', 'WAU', 'MAU'] as const).map(m => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className="text-[11px] font-semibold px-3 py-1 rounded-full transition-all"
              style={{
                background: activeMetric === m ? '#0891b2' : 'rgba(255,255,255,0.06)',
                color: activeMetric === m ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              {m === 'all' ? 'Все метрики' : m}
            </button>
          ))}
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {metrics.map(m => (
            <div key={m.key} className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.label} (30 дней)</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-white">{m.value}</span>
                <span className="text-[11px] font-bold" style={{ color: m.up ? '#4ade80' : '#f87171' }}>{m.delta}</span>
              </div>
            </div>
          ))}
          <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Stickiness (DAU/MAU)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black" style={{ color: stickiness > 20 ? '#4ade80' : '#f87171' }}>{stickiness}%</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>норма &gt;20%</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={amplitudeData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={45} />
            <Tooltip
              contentStyle={{ background: '#1e2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, color: '#fff' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 8 }} />
            {(activeMetric === 'all' || activeMetric === 'DAU') && (
              <Line type="monotone" dataKey="DAU" stroke="#0891b2" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0891b2' }} />
            )}
            {(activeMetric === 'all' || activeMetric === 'WAU') && (
              <Line type="monotone" dataKey="WAU" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#059669' }} />
            )}
            {(activeMetric === 'all' || activeMetric === 'MAU') && (
              <Line type="monotone" dataKey="MAU" stroke="#dc2626" strokeWidth={2.5} dot={false} strokeDasharray="5 3" activeDot={{ r: 5, fill: '#dc2626' }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-start gap-2.5 bg-amber-50">
        <span className="text-base flex-shrink-0">⚠️</span>
        <p className="text-[12px] leading-relaxed text-amber-900">
          <strong>Аналитический инсайт:</strong> DAU вырос на 92% — пользователи возвращаются чаще. Но MAU упал на 23% — каждый месяц приходит всё меньше уникальных людей. Stickiness {stickiness}% означает: из всей базы ежедневно активна только {stickiness}% — это тревожный сигнал оттока новых пользователей.
        </p>
      </div>
    </div>
  );
};

interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
}

interface ModuleViewProps {
  progress: Record<string, 'locked' | 'unlocked' | 'completed'>;
  onComplete: (moduleId: string) => void;
}

const sections = [
  { id: 'theory', label: 'Теория', icon: BookOpen, color: 'indigo', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', num: '01' },
  { id: 'example', label: 'Пример', icon: Lightbulb, color: 'amber', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', num: '02' },
  { id: 'practice', label: 'Практика', icon: Dumbbell, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', num: '03' },
  { id: 'task', label: 'Задание', icon: PenTool, color: 'violet', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-200', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', num: '04' },
] as const;

const weekImages: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1759159347914-88541fa4bd14?auto=format&fit=crop&w=1200&q=80",
  2: "https://images.unsplash.com/photo-1590402494628-9b9acf0b90ae?auto=format&fit=crop&w=1200&q=80",
  3: "https://images.unsplash.com/photo-1585123607190-72ec2979a269?auto=format&fit=crop&w=1200&q=80",
  4: "https://images.unsplash.com/photo-1671163377628-a1542b9de075?auto=format&fit=crop&w=1200&q=80",
  5: "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?auto=format&fit=crop&w=1200&q=80",
  6: "https://images.unsplash.com/photo-1720962158937-7ea890052166?auto=format&fit=crop&w=1200&q=80",
};

export function ModuleView({ progress, onComplete }: ModuleViewProps) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState('theory');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const week = courseData.find(w => w.modules.some(m => m.id === moduleId));
  const module = week?.modules.find(m => m.id === moduleId);

  // Load saved answer
  useEffect(() => {
    const loadAnswer = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !module?.id) return;

      const localKey = `pm-answer-${session.user.id}-${module.id}`;
      const localAnswer = localStorage.getItem(localKey);
      
      if (localAnswer) {
        try {
          const parsed = JSON.parse(localAnswer);
          setAssignment(parsed.text || '');
          setAttachments(parsed.attachments || []);
        } catch (e) {
          console.error("Failed to parse local answer", e);
        }
      }

      if (projectId && session.access_token) {
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/case-answers/${session.user.id}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }).then(res => {
          if (res.ok) return res.json();
        }).then(data => {
          if (data?.answers?.[module.id]) {
            const saved = data.answers[module.id];
            if (typeof saved === 'string') {
              setAssignment(saved);
              localStorage.setItem(localKey, JSON.stringify({ text: saved, attachments: [] }));
            } else {
              setAssignment(saved.text || '');
              setAttachments(saved.attachments || []);
              localStorage.setItem(localKey, JSON.stringify(saved));
            }
          }
        }).catch(e => {
          console.warn('Background answer sync failed:', e);
        });
      }
    };
    
    if (module?.id) loadAnswer();
  }, [module?.id]);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(s => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [module?.id]);

  if (!module || !week) return <Navigate to="/" />;
  if (progress[module.id] === 'locked') return <Navigate to={`/week/${week.id}`} />;

  const isCompleted = progress[module.id] === 'completed';
  const coverImage = weekImages[week.id] || weekImages[1];

  const allModules = courseData.flatMap(w => w.modules);
  const currentIndex = allModules.findIndex(m => m.id === module.id);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const { data: { session } } = await supabase.auth.getSession();

    try {
      const formData = new FormData();
      formData.append('file', file);
      const userId = session?.user?.id || 'demo-user';

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/upload-attachment/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${await getAccessToken()}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");

      setAttachments(prev => [...prev, {
        url: data.publicUrl,
        name: data.fileName || file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      }]);
      toast.success('Файл прикреплен');
    } catch (e: any) {
      console.error(e);
      toast.error('Ошибка загрузки: ' + e.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (assignment.length < 10) {
      toast.error('Пожалуйста, напишите чуть больше в вашем ответе.');
      return;
    }
    
    const answerData = { text: assignment, attachments };
    setIsSaving(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id;
      if (userId && module.id) {
        const localKey = `pm-answer-${userId}-${module.id}`;
        localStorage.setItem(localKey, JSON.stringify(answerData));
      }
      if (userId && projectId && session?.access_token) {
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/case-answers/${userId}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` 
          },
          body: JSON.stringify({ caseId: module.id, answer: answerData })
        }).catch(err => console.warn('Background sync failed:', err));
      }
    }).catch(err => console.warn('Session fetch failed:', err));
    
    setTimeout(() => setIsSaving(false), 100);
    onComplete(module.id);
    
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#a855f7', '#ec4899'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#a855f7', '#ec4899'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    toast.success('Задание принято! Переход к следующему модулю...', { duration: 2000 });

    setTimeout(() => {
      if (nextModule) {
        navigate(`/module/${nextModule.id}`);
        setAssignment('');
        setAttachments([]);
        window.scrollTo({ top: 0 });
      } else {
        navigate('/');
        toast.success('Поздравляем! Вы завершили весь курс!');
      }
    }, 3000);
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${i}`} className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs my-3 overflow-x-auto border border-slate-700">
              <pre className="whitespace-pre-wrap">{codeBlockContent.join('\n')}</pre>
            </div>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) { codeBlockContent.push(line); continue; }

      // ### headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-sm font-bold text-gray-900 mt-5 mb-2 tracking-tight leading-tight">
            {line.replace('### ', '')}
          </h3>
        );
        continue;
      }
      
      // ## headings
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-base font-bold text-gray-900 mt-5 mb-2 tracking-tight">
            {line.replace('## ', '')}
          </h2>
        );
        continue;
      }
      
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        elements.push(
          <figure key={i} className="my-3 rounded-xl overflow-hidden border border-gray-100 group">
            <div className="relative overflow-hidden">
              <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            {imgMatch[1] && <figcaption className="bg-gray-50 text-center text-sm text-gray-500 py-3 italic border-t border-gray-100">{imgMatch[1]}</figcaption>}
          </figure>
        );
        continue;
      }

      // **bold** standalone lines → section heading
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) { 
        elements.push(
          <p key={i} className="font-semibold text-gray-800 mt-4 mb-1.5 text-sm leading-snug">
            {line.replace(/\*\*/g, '')}
          </p>
        );
        continue;
      }

      // Heuristic: plain-text section headings —
      // a line that: doesn't start with special chars, is <= 120 chars,
      // doesn't end with period/comma/semicolon, has some content
      const isPlainHeading = (
        line.trim().length >= 5 &&
        line.trim().length <= 120 &&
        !line.trim().startsWith('-') &&
        !line.trim().startsWith('*') &&
        !line.trim().startsWith('>') &&
        !line.trim().startsWith('!') &&
        !line.trim().match(/^\d+\./) &&
        !line.trim().match(/^\d+\)/) &&
        !line.trim().endsWith('.') &&
        !line.trim().endsWith(',') &&
        !line.trim().endsWith(';') &&
        // Must look like a heading: has a capital letter or common PM term
        (line.trim().match(/^[А-ЯA-Z]/) || line.includes(':')) &&
        // Prev line is blank (context check)
        (i === 0 || lines[i - 1].trim() === '') &&
        // Next line is blank or starts a new section (not continuation of sentence)
        (i >= lines.length - 1 || lines[i + 1].trim() === '' || lines[i + 1].trim().startsWith('-') || lines[i + 1].trim().match(/^\d+\./))
      );

      if (isPlainHeading) {
        elements.push(
          <h3 key={i} className="text-sm font-semibold text-gray-800 mt-4 mb-1.5 tracking-tight border-l-3 border-[#0891b2] pl-2.5"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
        continue;
      }

      // - dash bullets (same as * bullets)
      if (line.trim().startsWith('- ')) {
        elements.push(
          <li key={i} className="ml-4 list-none text-gray-600 pl-1 mb-1 text-[13px] leading-relaxed flex gap-2 items-start">
            <span className="text-indigo-400 font-bold mt-1 flex-shrink-0">—</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^(\s*)-\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-sm border border-indigo-100">$1</code>') }} />
          </li>
        );
        continue;
      }

      // * asterisk bullets
      if (line.trim().startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-5 list-disc text-gray-600 pl-1 mb-1 text-[13px] leading-relaxed marker:text-[#0891b2]">
            <span dangerouslySetInnerHTML={{ __html: line.replace('* ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-sm border border-indigo-100">$1</code>') }} />
          </li>
        );
        continue;
      }

      if (line.trim().match(/^\d\./)) {
        elements.push(
          <div key={i} className="flex gap-2.5 mb-2 text-gray-700 group items-start">
            <span className="font-bold text-[#0891b2] bg-[#cffafe] w-5 h-5 flex items-center justify-center rounded-lg text-[10px] flex-shrink-0 mt-0.5">
              {line.split('.')[0]}
            </span>
            <span className="leading-relaxed text-[13px] flex-1" dangerouslySetInnerHTML={{ __html: line.split('.').slice(1).join('.').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>') }} />
          </div>
        );
        continue;
      }
      
      if (line.trim().startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="relative pl-4 py-2 my-3 bg-[#f0fdff] rounded-r-xl">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0891b2] rounded-full"></div>
            <p className="text-gray-600 italic text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace('> ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>') }} />
          </blockquote>
        );
        continue;
      }

      // Amplitude chart embed
      if (line.trim() === '[[AMPLITUDE_CHART]]') {
        elements.push(<AmplitudeDashboard key={`amp-${i}`} />);
        continue;
      }

      if (line.trim() === '') { elements.push(<div key={i} className="h-1" />); continue; }
      
      elements.push(
        <p key={i} className="text-gray-600 mb-2 leading-relaxed text-[13px]" dangerouslySetInnerHTML={{ 
          __html: line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
            .replace(/`(.*?)`/g, '<code class="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-sm border border-indigo-100">$1</code>') 
        }} />
      );
    }

    return elements;
  };

  return (
    <>
      {/* Hero Header */}
      <div className="relative h-48 lg:h-56 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 mb-0 group overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={coverImage} alt="Module Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30" />
          <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay" />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 z-20 flex justify-between items-start">
          <Link 
            to={`/week/${week.id}`} 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад к программе</span>
          </Link>
          
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-400 bg-green-900/30 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/30 shadow-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Пройден</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 text-indigo-300 font-bold uppercase tracking-wider text-xs mb-2">
              <span className="bg-indigo-500/20 px-2.5 py-1 rounded-md text-indigo-200 border border-indigo-500/30">Неделя {week.id}</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="truncate">{week.title.split(':')[1] || week.title}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight max-w-3xl">
              {module.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Sticky mini-nav */}
      <div className="sticky top-16 lg:top-0 z-30 -mx-4 lg:-mx-8 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                  isActive
                    ? `bg-gradient-to-r ${s.gradient} text-white shadow-md`
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
          
          {/* Module counter */}
          <div className="ml-auto hidden lg:flex items-center gap-1 text-xs text-gray-400 pl-4">
            {prevModule && (
              <Link to={`/module/${prevModule.id}`} className="hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-indigo-50">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
            <span className="font-medium text-gray-500">
              {currentIndex + 1}/{allModules.length}
            </span>
            {nextModule && (
              <Link to={`/module/${nextModule.id}`} className="hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-indigo-50">
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* All sections stacked vertically */}
      <div className="max-w-4xl mx-auto py-8 lg:py-10 space-y-12 lg:space-y-16">
        
        {sections.map((s) => {
          const Icon = s.icon;
          const content = s.id === 'task' ? module.tabs.task : module.tabs[s.id as 'theory' | 'example' | 'practice'];
          
          if (!content || content.trim() === '') return null;

          return (
            <motion.section
              key={s.id}
              id={s.id}
              ref={(el) => { sectionRefs.current[s.id] = el; }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="scroll-mt-20"
            >
              {/* Section header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={clsx("flex items-center justify-center w-11 h-11 rounded-2xl", s.iconBg)}>
                  <Icon className={clsx("w-5 h-5", s.iconColor)} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.num}</p>
                  <h2 className="text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight">{s.label}</h2>
                </div>
                <div className="flex-1 h-px bg-gray-200 ml-4" />
              </div>

              {s.id !== 'task' ? (
                <div className={clsx("rounded-2xl border p-6 lg:p-8", s.bg, s.border, "bg-opacity-30")}>
                  <article className="space-y-1">
                    {renderContent(content)}
                  </article>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Task Description */}
                  <div className={clsx("rounded-2xl border p-6 lg:p-8", s.bg, s.border)}>
                    <div className="text-gray-800 text-base lg:text-lg leading-[1.8]">
                      {renderContent(content)}
                    </div>
                  </div>

                  {/* Answer Area */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Ваш ответ</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isCompleted || isUploading}
                          className="text-sm font-bold flex items-center gap-2 transition-all px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                          Прикрепить
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                    <textarea
                      value={assignment}
                      onChange={(e) => setAssignment(e.target.value)}
                      disabled={isCompleted}
                      className="w-full min-h-[280px] lg:min-h-[360px] p-5 lg:p-6 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 resize-y text-base lg:text-lg leading-relaxed bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
                      placeholder="Напишите ваш ответ здесь... Минимум 10 символов для отправки."
                    />

                    {/* Attachments */}
                    {attachments.length > 0 && (
                      <div className="space-y-3 mt-5">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Вложения ({attachments.length}):</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors group relative shadow-sm">
                              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                {file.type === 'image' ? (
                                  <img src={file.url} alt="" className="w-8 h-8 object-cover rounded" />
                                ) : (
                                  <File className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate hover:text-violet-600 underline-offset-2 hover:underline">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-400 uppercase mt-0.5">{file.type === 'image' ? 'Изображение' : 'Документ'}</p>
                              </a>
                              {!isCompleted && (
                                <button 
                                  onClick={() => removeAttachment(idx)}
                                  className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all absolute right-2 top-2 bg-white shadow-sm border border-gray-100"
                                  title="Удалить"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{isCompleted ? "Задание выполнено" : "Время: ~15 мин"}</span>
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={isCompleted || assignment.length < 10 || isSaving}
                        className={clsx(
                          "px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transform text-base",
                          isCompleted 
                            ? "bg-green-500 cursor-default shadow-green-500/20" 
                            : assignment.length < 10 
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                        )}
                      >
                        {isSaving ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Сохранение...</>
                        ) : isCompleted ? (
                          <><CheckCircle className="w-5 h-5" /> Задание принято</>
                        ) : (
                          <>Отправить на проверку <ChevronRight className="w-5 h-5" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          );
        })}

        {/* Bottom module navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          {prevModule ? (
            <Link to={`/module/${prevModule.id}`} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors px-4 py-3 rounded-xl hover:bg-indigo-50">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevModule.title}</span>
              <span className="sm:hidden">Предыдущий</span>
            </Link>
          ) : <div />}
          {nextModule ? (
            <Link to={`/module/${nextModule.id}`} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-3 rounded-xl hover:bg-indigo-50">
              <span className="hidden sm:inline">{nextModule.title}</span>
              <span className="sm:hidden">Следующий</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </>
  );
}