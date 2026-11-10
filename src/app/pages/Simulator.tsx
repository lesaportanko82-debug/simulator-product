import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Users, ChevronRight, BookOpen, X, Lightbulb, PlayCircle, Terminal, AlertCircle, CheckCircle2, Briefcase, Calculator, FileText, CheckSquare, Database, AlertTriangle, RefreshCcw, DollarSign, Heart, Smile, Share2, Crown, Zap, Skull, Ghost, ChevronDown, Sparkles, HelpCircle, Target, CheckCheck, Clock, Paperclip, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { DAY_1_SCENARIO, CHARACTERS as FINTECH_CHARACTERS, SimulationNode, SimulationTask, GameMetrics } from '@/data/simulator-scenarios';
import { TAXI_SCENARIO, TAXI_CHARACTERS } from '@/data/simulator-taxi';
import { FOOD_SCENARIO, FOOD_CHARACTERS } from '@/data/simulator-food';
import { DISCOVERY_SCENARIO, DISCOVERY_CHARACTERS } from '@/data/discovery-scenario';
import { KanbanTask } from '@/app/components/simulator/KanbanTask';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '@/lib/api';
import { toast } from 'sonner';
import { GLOSSARY } from '@/data/glossary';

// --- Configuration ---

const SCENARIOS: Record<string, { scenario: SimulationNode[], characters: any, title: string, company: string }> = {
    'fintech': {
        scenario: DAY_1_SCENARIO,
        characters: FINTECH_CHARACTERS,
        title: 'Legacy Code Crisis',
        company: 'FinTech Solutions'
    },
    'taxi': {
        scenario: TAXI_SCENARIO,
        characters: TAXI_CHARACTERS,
        title: 'Marketplace Supply Shock',
        company: 'CityCab'
    },
    'food': {
        scenario: FOOD_SCENARIO,
        characters: FOOD_CHARACTERS,
        title: 'Delivery Logistics & Unit Economics',
        company: 'YumRun'
    },
    'discovery': {
        scenario: DISCOVERY_SCENARIO,
        characters: DISCOVERY_CHARACTERS,
        title: 'Product Discovery & Validation',
        company: 'EdVance'
    }
};

// --- Tooltip Component ---

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span 
            className="relative inline-block border-b border-dotted border-gray-400 cursor-help group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)} // Mobile support
        >
            <span className="text-violet-700 font-medium bg-violet-50 px-0.5 rounded">{children}</span>
            <AnimatePresence>
                {isVisible && (
                    <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none text-left"
                    >
                        {text}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
};

const TextWithTooltips = ({ text }: { text: string }) => {
    // Simple parser to find glossary terms
    // This is a naive implementation but works for exact matches
    // We sort keys by length descending to match longest terms first
    
    if (!text) return null;

    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    const regex = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    
    const parts = text.split(regex);
    
    return (
        <span>
            {parts.map((part, i) => {
                const upperPart = part.toUpperCase(); // Normalize for lookup
                // We need to find the original key that matches this part (case-insensitive)
                const originalKey = terms.find(t => t.toUpperCase() === upperPart);
                
                if (originalKey) {
                     return <Tooltip key={i} text={GLOSSARY[originalKey]}>{part}</Tooltip>;
                }
                return part;
            })}
        </span>
    );
};

// --- Character Personality Metadata ---
// Defines communication style for realistic simulation
// Character accent colors — subtle, no emojis, just tonal variation
const CHARACTER_ACCENT: Record<string, { nameColor: string; dotColor: string }> = {
    ceo:        { nameColor: '#374151', dotColor: '#6b7280' },
    cto:        { nameColor: '#374151', dotColor: '#6b7280' },
    cmo:        { nameColor: '#374151', dotColor: '#6b7280' },
    legal:      { nameColor: '#374151', dotColor: '#6b7280' },
    digital:    { nameColor: '#374151', dotColor: '#6b7280' },
    risk:       { nameColor: '#374151', dotColor: '#6b7280' },
    board:      { nameColor: '#374151', dotColor: '#6b7280' },
    ceo_taxi:   { nameColor: '#374151', dotColor: '#6b7280' },
    cto_taxi:   { nameColor: '#374151', dotColor: '#6b7280' },
    ops:        { nameColor: '#374151', dotColor: '#6b7280' },
    ceo_food:   { nameColor: '#374151', dotColor: '#6b7280' },
    head_growth:{ nameColor: '#374151', dotColor: '#6b7280' },
};
const getAccent = (senderId: string) =>
    CHARACTER_ACCENT[senderId] ?? { nameColor: '#374151', dotColor: '#9ca3af' };

// Keep STYLE_BUBBLE stub so downstream code doesn't break
const STYLE_BUBBLE: Record<string, { borderAccent: string; nameColor: string }> = {
    assertive:    { borderAccent: '', nameColor: '#374151' },
    analytical:   { borderAccent: '', nameColor: '#374151' },
    diplomatic:   { borderAccent: '', nameColor: '#374151' },
    formal:       { borderAccent: '', nameColor: '#374151' },
    direct:       { borderAccent: '', nameColor: '#374151' },
    enthusiastic: { borderAccent: '', nameColor: '#374151' },
};

// --- Message Grouping Helpers ---

type MsgGroup = {
    senderId: string;
    nodes: SimulationNode[];
    startIdx: number;
    isMe: boolean;
    isSystem: boolean;
};

const groupMessages = (nodes: SimulationNode[]): MsgGroup[] => {
    const groups: MsgGroup[] = [];
    nodes.forEach((node, idx) => {
        const isMe = node.senderId === 'user';
        const isSystem = node.senderId === 'system';
        const last = groups[groups.length - 1];
        if (!isSystem && last && last.senderId === node.senderId && !last.isSystem) {
            last.nodes.push(node);
        } else {
            groups.push({ senderId: node.senderId, nodes: [node], startIdx: idx, isMe, isSystem });
        }
    });
    return groups;
};

const SIM_BASE_MIN = 9 * 60 + 42; // 09:42 start time
const getSimTime = (msgIndex: number): string => {
    const totalMin = SIM_BASE_MIN + Math.floor(msgIndex * 0.9);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// --- Helper: Get Psychotype ---

type Psychotype = {
    title: string;
    description: string;
    icon: any;
    color: string;
    quote: string;
};

const getPsychotype = (metrics: GameMetrics): Psychotype => {
    const { budget, morale, satisfaction } = metrics;
    
    if (budget >= 70 && morale >= 60 && satisfaction >= 60) {
        return {
            title: "CPO Material",
            description: "Вы — единорог. Вы умудрились заработать денег, сохранить команду и осчастливить клиентов. Такие PM стоят $300k/год.",
            icon: Crown,
            color: "text-amber-500 bg-amber-50 border-amber-200",
            quote: "Perfectly balanced, as all things should be."
        };
    }
    
    if (budget >= 60 && satisfaction >= 50 && morale < 40) {
        return {
            title: "Тиран-эффективщик",
            description: "Бизнес растет, но команда пишет резюме. Вы достигаете целей любой ценой. Эффективно, но в долгую вы останетесь одни.",
            icon: Zap,
            color: "text-red-600 bg-red-50 border-red-200",
            quote: "Results > Feelings."
        };
    }

    if (budget < 30 && (morale >= 60 || satisfaction >= 60)) {
        return {
            title: "Мечтатель",
            description: "Команда вас обожает, клиенты счастливы, но компания банкрот. Вы делаете классный продукт, который не умеет зарабатывать.",
            icon: Ghost,
            color: "text-blue-500 bg-blue-50 border-blue-200",
            quote: "Product > Profit?"
        };
    }

    if (budget < 40 && morale < 40 && satisfaction < 40) {
        return {
            title: "Хаос-менеджер",
            description: "Пожары везде. Вы пытались угодить всем, но в итоге все сломалось. В следующий раз сфокусируйтесь на чем-то одном.",
            icon: Skull,
            color: "text-gray-600 bg-gray-100 border-gray-300",
            quote: "This is fine 🔥"
        };
    }

    return {
        title: "Крепкий Середняк",
        description: "Вы не сломали продукт, но и не совершили прорыв. Осторожность — хорошее качество, но для роста нужен риск.",
        icon: Briefcase,
        color: "text-slate-600 bg-slate-50 border-slate-200",
        quote: "Slow and steady."
    };
};

// --- Components ---

type MetricKey = 'budget' | 'morale' | 'satisfaction';

const METRIC_META: Record<MetricKey, { icon: any; label: string; shortLabel: string; hint: string; trackColor: (v: number) => string; bgColor: (v: number) => string; }> = {
    budget: {
        icon: DollarSign,
        label: 'Бюджет',
        shortLabel: '💰',
        hint: 'Остаток финансирования проекта. Достигнет нуля — проект закроют. Растёт при правильных бизнес-решениях.',
        trackColor: (v) => v >= 60 ? 'bg-emerald-500' : v >= 30 ? 'bg-amber-400' : 'bg-red-500',
        bgColor:    (v) => v >= 60 ? 'bg-emerald-50 border-emerald-100' : v >= 30 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100',
    },
    morale: {
        icon: Users,
        label: 'Команда',
        shortLabel: '👥',
        hint: 'Доверие и мотивация вашей команды. Падает — разработчики работают медленнее, лучшие уходят. Растёт — команда идёт за вами.',
        trackColor: (v) => v >= 60 ? 'bg-[#0891b2]' : v >= 30 ? 'bg-amber-400' : 'bg-red-500',
        bgColor:    (v) => v >= 60 ? 'bg-[#f0fdff] border-[#cffafe]' : v >= 30 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100',
    },
    satisfaction: {
        icon: Smile,
        label: 'Клиенты',
        shortLabel: '😊',
        hint: 'Удовлетворённость пользователей продуктом. Падает — отток, плохие отзывы, меньше выручки. Растёт — лояльность и рост.',
        trackColor: (v) => v >= 60 ? 'bg-blue-500' : v >= 30 ? 'bg-amber-400' : 'bg-red-500',
        bgColor:    (v) => v >= 60 ? 'bg-blue-50 border-blue-100' : v >= 30 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100',
    },
};

const getStatus = (v: number) => {
    if (v >= 80) return { label: 'Отлично',  color: 'text-emerald-600' };
    if (v >= 60) return { label: 'Хорошо',   color: 'text-emerald-500' };
    if (v >= 40) return { label: 'Норма',    color: 'text-amber-600'   };
    if (v >= 20) return { label: 'Риск',     color: 'text-orange-600'  };
    return             { label: 'Критично',  color: 'text-red-600'     };
};

const MetricCard = ({ metricKey, value, change }: { metricKey: MetricKey; value: number; change: number | null }) => {
    const meta   = METRIC_META[metricKey];
    const status = getStatus(value);
    const [showHint, setShowHint] = useState(false);

    return (
        <div
            className={clsx('relative flex-1 rounded-xl px-3 py-2 cursor-default border transition-all duration-300', meta.bgColor(value))}
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
        >
            {/* Hint tooltip */}
            <AnimatePresence>
                {showHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-50 shadow-xl pointer-events-none text-center leading-snug"
                    >
                        {meta.hint}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top row: icon + label + change badge */}
            <div className="flex items-center gap-1 mb-1.5">
                <meta.icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 truncate leading-none">{meta.label}</span>
                <AnimatePresence>
                    {change !== null && change !== 0 && (
                        <motion.span
                            key={change}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            className={clsx(
                                'ml-auto text-[9px] font-black px-1 py-0.5 rounded-full leading-none',
                                change > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            )}
                        >
                            {change > 0 ? '+' : ''}{change}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Value + Status */}
            <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-base font-black text-gray-800 leading-none">{value}%</span>
                <span className={clsx('text-[9px] font-bold leading-none', status.color)}>{status.label}</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                <motion.div
                    className={clsx('h-full rounded-full', meta.trackColor(value))}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

const MetricsHUD = ({ metrics, changes }: { metrics: GameMetrics, changes: Partial<GameMetrics> | null }) => {
    return (
        <div className="px-3 py-2 flex gap-2 items-stretch z-30 sticky top-0" style={{ background: 'rgba(22,78,99,0.06)', borderBottom: '1px solid rgba(8,145,178,0.12)', backdropFilter: 'blur(4px)' }}>
            <MetricCard metricKey="budget"       value={metrics.budget}       change={changes?.budget       ?? null} />
            <MetricCard metricKey="morale"       value={metrics.morale}       change={changes?.morale       ?? null} />
            <MetricCard metricKey="satisfaction" value={metrics.satisfaction} change={changes?.satisfaction ?? null} />
        </div>
    );
};

const HintButton = ({ hint }: { hint?: string }) => {
    const [show, setShow] = useState(false);
    if (!hint) return null;
    return (
        <div className="relative inline-block ml-2">
            <button 
                onClick={() => setShow(!show)}
                className="p-1.5 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                title="Подсказка"
            >
                <Lightbulb className="w-4 h-4" />
            </button>
            {show && (
                <div className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-yellow-50 border border-yellow-200 rounded-xl shadow-xl text-xs text-yellow-900 z-10">
                    <div className="font-bold mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Подсказка:
                    </div>
                    {hint}
                </div>
            )}
        </div>
    );
};

// ... Existing Task Components (LogAnalysis, SqlTask, etc.) remain mostly the same ...
// I will include them to ensure the file is complete and working.

const LogAnalysisTask = ({ task, onComplete }: { task: SimulationTask, onComplete: (success: boolean) => void }) => {
    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 font-mono text-xs md:text-sm shadow-2xl my-4">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">logs.json</span>
                </div>
                <HintButton hint={task.hint} />
            </div>
            <div className="p-4 space-y-2">
                <p className="text-gray-400 mb-4 border-b border-gray-700 pb-2 flex items-center justify-between">
                    {task.instruction}
                </p>
                {task.data.map((log: any) => (
                    <button
                        key={log.id}
                        onClick={() => onComplete(log.id === task.correctValue)}
                        className="w-full text-left font-mono p-3 rounded hover:bg-white/10 transition-colors flex flex-col gap-1 group border border-transparent hover:border-gray-600"
                    >
                         <div className="flex items-center gap-3 text-xs opacity-70">
                            <span className="text-blue-400">
                                {log.time || log.stage || (log.lat ? `GPS: ${log.lat}, ${log.lon}` : '')}
                            </span>
                             <span className={clsx("font-bold", ((typeof log.status === 'string' && log.status.includes('CRITICAL')) || (typeof log.status === 'number' && log.status >= 400) || log.isError) ? "text-red-500" : "text-green-500")}>
                                {log.status || log.actual || (log.isError ? 'ALERT' : 'OK')}
                            </span>
                            <span className="text-gray-400">{log.ua || log.norm || log.app_version}</span>
                        </div>
                         {(log.payload || log.response || log.desc) && (
                            <div className="flex gap-2 text-xs md:text-sm mt-1">
                                 {log.method && <span className="text-purple-400 font-bold shrink-0">{log.method}</span>}
                                 {log.event && <span className="text-purple-400 font-bold shrink-0">{log.event}</span>}
                                 <span className="text-gray-300 break-all">{log.payload || log.response || log.desc}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SqlTask = ({ task, onComplete }: { task: SimulationTask, onComplete: (success: boolean) => void }) => {
    return (
        <div className="rounded-xl overflow-hidden my-3" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
                <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300">SQL</span>
                </div>
                <HintButton hint={task.hint} />
            </div>
            <div className="p-3 space-y-2">
                <p className="text-slate-400 text-xs mb-2">{task.instruction}</p>
                {task.data.map((option: any) => (
                    <button
                        key={option.id}
                        onClick={() => onComplete(option.id === task.correctValue)}
                        className="w-full text-left px-3 py-2 rounded-lg font-mono text-xs text-blue-300 transition-all"
                        style={{ background: '#1e293b', border: '1px solid #334155' }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0891b2'; (e.currentTarget as HTMLElement).style.background = '#1e3a5f'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#334155'; (e.currentTarget as HTMLElement).style.background = '#1e293b'; }}
                    >
                        <span className="opacity-40 mr-2">$</span>{option.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CalculationTask = ({ task, onComplete }: { task: SimulationTask, onComplete: (success: boolean) => void }) => {
    return (
        <div className="rounded-xl overflow-hidden my-3" style={{ border: '1px solid #cffafe', background: '#f0fdff' }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #cffafe', background: '#ffffff' }}>
                <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" style={{ color: '#0891b2' }} />
                    <span className="text-xs font-bold" style={{ color: '#0891b2' }}>Расчёт</span>
                </div>
                <HintButton hint={task.hint} />
            </div>
            <div className="p-3 flex flex-col gap-2">
                <p className="text-xs text-gray-600 mb-1">{task.instruction}</p>
                <div className="grid grid-cols-2 gap-2">
                    {task.data.options.map((option: any) => (
                        <button
                            key={option.id}
                            onClick={() => onComplete(option.id === task.correctValue)}
                            className="px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all"
                            style={{ background: '#ffffff', border: '1px solid #cffafe', color: '#374151' }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0891b2'; (e.currentTarget as HTMLElement).style.color = '#0891b2'; (e.currentTarget as HTMLElement).style.background = '#f0fdff'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#cffafe'; (e.currentTarget as HTMLElement).style.color = '#374151'; (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FeatureSpecTask = ({ task, onComplete }: { task: SimulationTask, onComplete: (success: boolean) => void }) => {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl my-4">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-900">Backlog Item</span>
                </div>
                <HintButton hint={task.hint} />
            </div>
            <div className="p-4 grid gap-4">
                <p className="text-gray-600 text-sm">{task.instruction}</p>
                <div className="grid gap-3">
                    {task.data.tickets.map((ticket: any) => (
                        <button
                            key={ticket.id}
                            onClick={() => onComplete(ticket.id === task.correctValue)}
                            className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 text-left hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
                        >
                            <div className="mt-1">
                                <CheckSquare className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">{ticket.title}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{ticket.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};



// --- AI Inline Panel Component ---

const AIInlinePanel = ({
    config,
    metrics,
    currentNode,
    projectId,
    publicAnonKey,
}: {
    config: { title: string; company: string };
    metrics: { budget: number; morale: number; satisfaction: number };
    currentNode: any;
    projectId: string;
    publicAnonKey: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current && isOpen) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isThinking, isOpen]);

    const buildContext = () => {
        const choicesText = currentNode?.choices
            ? `Доступные варианты:\n${currentNode.choices.map((c: any, i: number) => `${i + 1}. ${c.text}`).join('\n')}`
            : '';
        const taskText = currentNode?.task
            ? `Текущее задание: ${currentNode.task.instruction || currentNode.text}`
            : '';
        return `Симуляция: ${config.title} (${config.company}).
Текущие метрики: Бюджет ${metrics.budget}%, Мораль ${metrics.morale}%, Удовлетворённость клиентов ${metrics.satisfaction}%.
Текущая ситуация: ${currentNode?.text || 'начало симуляции'}
${choicesText}${taskText}`;
    };

    const sendMessage = async (question: string) => {
        if (!question.trim() || isThinking) return;
        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setIsThinking(true);
        setInput('');
        try {
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/ai/simulator-hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getAccessToken()}` },
                body: JSON.stringify({ question, context: buildContext() })
            });
            const data = await res.json();
            if (data.success && data.answer) {
                setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: 'Извините, не удалось получить ответ. Попробуйте снова.' }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Ошибка связи. Проверьте соединение.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    const QUICK_PROMPTS = [
        { icon: HelpCircle, text: 'Что здесь важно?' },
        { icon: Lightbulb, text: 'Дай подсказку' },
        { icon: Target, text: 'Как улучшить метрики?' },
    ];

    return (
        <div className="border-t bg-white" style={{ borderColor: "#cffafe" }}>
            {/* Toggle header */}
            <button
                onClick={() => setIsOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-violet-50/60 transition-colors group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "#0891b2" }}>AI Ментор</span>
                    {messages.filter(m => m.role === 'assistant').length > 0 && (
                        <span className="text-[10px] rounded-full px-1.5 py-0.5 font-bold leading-none" style={{ background: "#cffafe", color: "#0891b2" }}>
                            {messages.filter(m => m.role === 'assistant').length}
                        </span>
                    )}
                </div>
                <ChevronDown className={clsx(
                    "w-3.5 h-3.5 text-violet-400 transition-transform duration-200",
                    isOpen ? "rotate-180" : ""
                )} />
            </button>

            {/* Expandable panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-violet-100">
                            {/* Messages area */}
                            <div className="max-h-48 overflow-y-auto p-3 space-y-2 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="py-1">
                                        <p className="text-[11px] text-gray-400 mb-2 text-center font-medium">Быстрые вопросы по текущей ситуации:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {QUICK_PROMPTS.map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => sendMessage(q.text)}
                                                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-white font-medium transition-all" style={{ borderColor: "#cffafe", color: "#0891b2" }}
                                                >
                                                    <q.icon className="w-2.5 h-2.5" />
                                                    {q.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={clsx('flex gap-2 items-start', msg.role === 'user' ? 'flex-row-reverse' : '')}
                                        >
                                            <div className={clsx(
                                                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
                                                msg.role === 'user' ? 'bg-violet-600' : 'bg-gradient-to-br from-violet-100 to-indigo-200'
                                            )}>
                                                {msg.role === 'user'
                                                    ? <User className="w-2.5 h-2.5 text-white" />
                                                    : <Sparkles className="w-2.5 h-2.5 text-violet-600" />
                                                }
                                            </div>
                                            <div className={clsx(
                                                'px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed max-w-[82%]',
                                                msg.role === 'user'
                                                    ? 'bg-violet-600 text-white rounded-tr-none'
                                                    : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                                            )}>
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                {isThinking && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-2.5 h-2.5 text-violet-600" />
                                        </div>
                                        <div className="bg-white border border-gray-200 px-2.5 py-1.5 rounded-xl rounded-tl-none flex gap-1 items-center shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-2 bg-white border-t border-gray-100">
                                <form
                                    onSubmit={e => { e.preventDefault(); sendMessage(input); }}
                                    className="flex gap-1.5"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Спросите AI-ментора..."
                                        disabled={isThinking}
                                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isThinking}
                                        className="px-3 py-1.5 rounded-lg text-white hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1 text-xs font-medium" style={{ background: "#0891b2" }}
                                    >
                                        <Send className="w-3 h-3" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Ending Component (Psychotype) ---

const EndingScreen = ({ metrics, onRestart }: { metrics: GameMetrics, onRestart: () => void }) => {
    const type = getPsychotype(metrics);
    const Icon = type.icon;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-6 h-full text-center max-w-lg mx-auto"
        >
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-violet-200 blur-3xl opacity-30 rounded-full" />
                <div className={clsx("w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 rotate-3 transform transition-transform hover:rotate-0", type.color)}>
                    <Icon className="w-12 h-12" />
                </div>
            </div>
            
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-2">Ваш стиль управления</h2>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{type.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">{type.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full mb-8 italic text-gray-500 text-sm">
                "{type.quote}"
            </div>

            <div className="grid grid-cols-3 gap-4 w-full mb-8">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="text-xl font-black text-emerald-600">{metrics.budget}</div>
                    <div className="text-[10px] uppercase font-bold text-emerald-800">Бюджет</div>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <div className="text-xl font-black text-rose-600">{metrics.morale}</div>
                    <div className="text-[10px] uppercase font-bold text-rose-800">Мораль</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-xl font-black text-blue-600">{metrics.satisfaction}</div>
                    <div className="text-[10px] uppercase font-bold text-blue-800">Счастье</div>
                </div>
            </div>

            <div className="flex gap-3 w-full">
                <button
                    onClick={onRestart}
                    className="flex-1 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #164e63, #0891b2)', boxShadow: '0 4px 14px rgba(8,145,178,0.25)' }}
                >
                    <RefreshCcw className="w-4 h-4" />
                    Ещё раз
                </button>
                <button className="px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2" style={{ background: '#cffafe', color: '#0891b2' }}>
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

// --- Consequence Story Card ---
// Shows what happened after a choice: narrative + metric delta visualization

interface ConsequenceData {
  choiceText: string;
  impact: Partial<{ budget: number; morale: number; satisfaction: number }>;
  story?: string; // generated narrative
}

const generateStory = (choice: any, metrics: { budget: number; morale: number; satisfaction: number }): string => {
  const { impact = {} } = choice;
  const parts: string[] = [];

  if (choice.consequenceStory) return choice.consequenceStory;

  // Auto-generate based on impact
  const totalDelta = (impact.budget ?? 0) + (impact.morale ?? 0) + (impact.satisfaction ?? 0);
  const hasNegative = Object.values(impact).some((v: any) => v < 0);
  const hasPositive = Object.values(impact).some((v: any) => v > 0);

  if (metrics.budget <= 20 || metrics.morale <= 20 || metrics.satisfaction <= 20) {
    parts.push('Ситуация становится критической. Нужно срочно стабилизировать показатели.');
  } else if (totalDelta > 10) {
    parts.push('Команда восприняла решение позитивно. Метрики пошли вверх.');
  } else if (totalDelta < -10) {
    parts.push('Решение вызвало напряжение. Придётся работать с последствиями.');
  } else if (hasNegative && hasPositive) {
    parts.push('Компромиссное решение. Одни метрики выросли, другие просели.');
  } else {
    parts.push('Команда приняла решение к сведению. Ждём результатов.');
  }

  if (impact.morale && impact.morale < -5) {
    parts.push('Разработчики выглядят усталыми. Несколько человек попросили 1:1.');
  }
  if (impact.budget && impact.budget < -10) {
    parts.push('Финансовый директор уже прислал вопрос о расходах.');
  }
  if (impact.satisfaction && impact.satisfaction > 5) {
    parts.push('В App Store появилось несколько новых положительных отзывов.');
  }

  return parts.join(' ');
};

const ConsequenceCard = ({
  data, onDismiss,
}: {
  data: ConsequenceData;
  onDismiss: () => void;
}) => {
  const deltas = Object.entries(data.impact)
    .filter(([, v]) => v !== 0 && v !== undefined) as [string, number][];

  const metaLabels: Record<string, string> = { budget: 'Бюджет', morale: 'Команда', satisfaction: 'Клиенты' };
  const metaIcons: Record<string, string> = { budget: '💰', morale: '👥', satisfaction: '😊' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.25 }}
      className="mx-1 my-3 rounded-2xl overflow-hidden"
      style={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: '#67e8f9' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(103,232,249,0.7)' }}>Последствия решения</span>
        </div>
        <p className="text-[12px] italic mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Вы выбрали: "{data.choiceText.slice(0, 80)}{data.choiceText.length > 80 ? '...' : ''}"
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {data.story}
        </p>
      </div>

      {/* Metric deltas */}
      {deltas.length > 0 && (
        <div className="px-4 py-3 flex gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {deltas.map(([key, val]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: val > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${val > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              <span className="text-sm">{metaIcons[key]}</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{metaLabels[key]}</span>
              <span className="text-[11px] font-black" style={{ color: val > 0 ? '#4ade80' : '#f87171' }}>
                {val > 0 ? '+' : ''}{val}%
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Continue */}
      <div className="px-4 py-3 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={onDismiss}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(8,145,178,0.2)', color: '#67e8f9', border: '1px solid rgba(8,145,178,0.3)' }}
        >
          Продолжить <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

// --- Main Simulator Component ---

export function Simulator() {
    console.log("Simulator v115 Loaded — 5x Expanded Scenarios");
    const { scenarioId } = useParams<{ scenarioId: string }>();
    const activeScenarioId = scenarioId || 'fintech';
    const config = SCENARIOS[activeScenarioId] || SCENARIOS['fintech'];
    const { scenario: activeScenario, characters: activeCharacters } = config;

    const [history, setHistory] = useState<SimulationNode[]>([]);
    const [currentNodeId, setCurrentNodeId] = useState<string>(activeScenario[0].id);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<any>(null);
    const [showResource, setShowResource] = useState<SimulationNode['resource'] | null>(null);
    const [learningModal, setLearningModal] = useState<SimulationNode['learningContent'] | null>(null);
    // True while we're in the "read pause" phase (after message appears, before next typing)
    const [isReading, setIsReading] = useState(false);
    // The nextId we'll advance to when the user skips or the timer fires
    const pendingNextIdRef = useRef<string | null>(null);
    
    // --- Metrics State ---
    const [metrics, setMetrics] = useState<GameMetrics>({ budget: 50, morale: 50, satisfaction: 50 });
    const [lastChanges, setLastChanges] = useState<Partial<GameMetrics> | null>(null);

    const [taskAnswer, setTaskAnswer] = useState('');
    const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

    // --- Reply mechanic: user messages wait for explicit click ---
    const [pendingReply, setPendingReply] = useState<SimulationNode | null>(null);

    // Consequence Story: shown after each choice before advancing
    const [consequence, setConsequence] = useState<ConsequenceData | null>(null);
    const pendingChoiceNextId = useRef<string | null>(null);
    const lastChangesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    // Ref to hold the post-message "read" timer so it can be cleaned up
    const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Timing helpers ────────────────────────────────────────────────────────
    // How long the "typing…" bubble shows before the message appears.
    // Respects an explicit node.delay; otherwise scales with text length.
    const calcTypingMs = (text: string, explicitDelay?: number): number => {
        if (explicitDelay !== undefined) return explicitDelay;
        const len = text?.length ?? 60;
        return Math.max(1200, Math.min(len * 15, 2800));
    };

    // Pause AFTER the message appears, before the next typing starts.
    // Gives the user time to read (~28 ms / char, min 1.6 s, max 5.2 s).
    const calcReadMs = (text: string): number => {
        const len = text?.length ?? 60;
        return Math.max(1600, Math.min(len * 28, 5200));
    };

    // Reset on scenario change
    useEffect(() => {
        setHistory([]);
        const firstNode = config.scenario.find(n => n.type === 'intro') || config.scenario[0];
        setCurrentNodeId(firstNode.id);
        setIsTyping(false);
        setIsReading(false);
        setPendingReply(null);
        pendingNextIdRef.current = null;
        if (readTimerRef.current) { clearTimeout(readTimerRef.current); readTimerRef.current = null; }
        setLearningModal(null);
        
        // Initial Metrics
        if (firstNode.introData?.initialMetrics) {
            setMetrics(firstNode.introData.initialMetrics);
        } else {
             setMetrics({ budget: 50, morale: 50, satisfaction: 50 });
        }
        setLastChanges(null);
        setTaskAnswer('');

    }, [activeScenarioId]);

    const currentNode = activeScenario.find(n => n.id === currentNodeId);

    // Smart scroll: only auto-scroll when user is near bottom (Go Practice principle: no focus disruption)
    const isNearBottom = () => {
        if (!scrollRef.current) return true;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        return scrollHeight - scrollTop - clientHeight < 120;
    };

    useEffect(() => {
        // Only scroll on new history items (not on typing indicator) to prevent jumps
        if (scrollRef.current && isNearBottom()) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [history]);

    // Always scroll when it's user's turn (choice/reply) so they can see options
    useEffect(() => {
        if (currentNode?.type === 'choice' || pendingReply) {
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [currentNode?.type, pendingReply]);

    // Game Loop
    useEffect(() => {
        if (!currentNode) return;

        // Handle Learning Node (Show Modal)
        if (currentNode.type === 'learning' && currentNode.learningContent) {
             setLearningModal(currentNode.learningContent);
             return;
        }

        // Skip processing if it's a choice, task, ending, or intro (they wait for user input)
        if (currentNode.type === 'choice' || currentNode.type === 'task' || currentNode.type === 'intro' || currentNode.type === 'ending') {
            return;
        }

        // USER messages: add to history immediately (stays in chat), then show Reply button to advance
        if (currentNode.senderId === 'user' && currentNode.type === 'message') {
            if (readTimerRef.current) { clearTimeout(readTimerRef.current); readTimerRef.current = null; }
            setIsReading(false);
            setIsTyping(false);
            // Message appears in chat right away — no disappearing
            setHistory(prev => prev.find(n => n.id === currentNode.id) ? prev : [...prev, currentNode]);
            // pendingReply now only holds nextId — just to show the "Reply" button
            setPendingReply(currentNode);
            return;
        }

        // Clear any lingering read timer from the previous node
        if (readTimerRef.current) {
            clearTimeout(readTimerRef.current);
            readTimerRef.current = null;
        }

        // Process Message
        const sender = activeCharacters[currentNode.senderId] || activeCharacters['system'];
        const isUserOrSystem = currentNode.senderId === 'user' || currentNode.senderId === 'system';

        if (!isUserOrSystem) {
            const typingMs = calcTypingMs(currentNode.text || '', currentNode.delay);
            const readMs   = calcReadMs(currentNode.text || '');

            setIsTyping(true);
            setIsReading(false);
            setTypingUser(sender);

            const typingTimer = setTimeout(() => {
                setIsTyping(false);
                setHistory(prev => {
                    if (prev.find(n => n.id === currentNode.id)) return prev;
                    return [...prev, currentNode];
                });
                // Phase 2 — reading pause; user can skip with the "→" button
                if (currentNode.nextId) {
                    pendingNextIdRef.current = currentNode.nextId;
                    setIsReading(true);
                    readTimerRef.current = setTimeout(() => {
                        readTimerRef.current = null;
                        setIsReading(false);
                        const nxt = pendingNextIdRef.current;
                        pendingNextIdRef.current = null;
                        if (nxt) goToNode(nxt);
                    }, readMs);
                }
            }, typingMs);

            return () => {
                clearTimeout(typingTimer);
                if (readTimerRef.current) {
                    clearTimeout(readTimerRef.current);
                    readTimerRef.current = null;
                }
                setIsReading(false);
            };
        } else {
            // User / system messages — appear quickly, brief pause after
            const appearMs = currentNode.delay ?? 400;
            const readMs   = currentNode.type === 'day_change'
                ? Math.max(1800, calcReadMs(currentNode.text || ''))
                : 700;

            const timer = setTimeout(() => {
                setHistory(prev => {
                    if (prev.find(n => n.id === currentNode.id)) return prev;
                    return [...prev, currentNode];
                });
                if (currentNode.nextId) {
                    pendingNextIdRef.current = currentNode.nextId;
                    setIsReading(true);
                    readTimerRef.current = setTimeout(() => {
                        readTimerRef.current = null;
                        setIsReading(false);
                        const nxt = pendingNextIdRef.current;
                        pendingNextIdRef.current = null;
                        if (nxt) goToNode(nxt);
                    }, readMs);
                }
            }, appearMs);

            return () => {
                clearTimeout(timer);
                if (readTimerRef.current) {
                    clearTimeout(readTimerRef.current);
                    readTimerRef.current = null;
                }
                setIsReading(false);
            };
        }

    }, [currentNodeId, activeScenario]);

    const handleReply = () => {
        if (!pendingReply) return;
        const nextId = pendingReply.nextId;
        setPendingReply(null);
        // Message is already in history — just advance the story
        if (nextId) {
            goToNode(nextId);
        } else {
            // No nextId: scenario dead-end, stay in place gracefully
            console.warn('handleReply: pendingReply.nextId is undefined for node', pendingReply.id);
        }
    };

    // Финал зависит от решений: при слабых метриках «успешный» финал заменяется финалом провала.
    const metricsRef = useRef(metrics);
    useEffect(() => { metricsRef.current = metrics; }, [metrics]);
    const failEndingId = activeScenario.find((n) => n.type === 'ending' && /fail|bad/.test(n.id))?.id;
    const isCritical = (m: GameMetrics) => m.budget <= 0 || m.morale <= 0 || m.satisfaction <= 0;
    const isWeak = (m: GameMetrics) =>
        Math.min(m.budget, m.morale, m.satisfaction) <= 15 || (m.budget + m.morale + m.satisfaction) / 3 < 40;
    const goToNode = (id: string) => {
        const target = activeScenario.find((n) => n.id === id);
        if (failEndingId && target && id !== failEndingId) {
            const m = metricsRef.current;
            const endingIsFail = /fail|bad/.test(id);
            if ((target.type === 'ending' && !endingIsFail && isWeak(m)) || isCritical(m)) {
                setCurrentNodeId(failEndingId);
                return;
            }
        }
        setCurrentNodeId(id);
    };

    const handleChoice = (choice: any) => {
        // Apply Metrics Impact immediately
        let newMetrics = metrics;
        if (choice.impact) {
            const updates = choice.impact;
            newMetrics = {
                budget: Math.min(100, Math.max(0, metrics.budget + (updates.budget || 0))),
                morale: Math.min(100, Math.max(0, metrics.morale + (updates.morale || 0))),
                satisfaction: Math.min(100, Math.max(0, metrics.satisfaction + (updates.satisfaction || 0))),
            };
            setMetrics(newMetrics);
            metricsRef.current = newMetrics;
            setLastChanges(updates);
            // Use ref to avoid stale-closure race condition on rapid choices
            if (lastChangesTimerRef.current) clearTimeout(lastChangesTimerRef.current);
            lastChangesTimerRef.current = setTimeout(() => { setLastChanges(null); lastChangesTimerRef.current = null; }, 2000);
        }

        const userMsg: SimulationNode = {
            id: `choice-${Date.now()}`,
            senderId: 'user',
            type: 'message',
            text: choice.messageText || choice.text,
        };
        setHistory(prev => [...prev, userMsg]);

        // Show Consequence Story if choice has meaningful impact
        if (choice.impact && Object.values(choice.impact).some((v: any) => v !== 0)) {
            pendingChoiceNextId.current = choice.nextId;
            setConsequence({
                choiceText: choice.messageText || choice.text,
                impact: choice.impact,
                story: generateStory(choice, newMetrics),
            });
        } else {
            goToNode(choice.nextId);
        }
    };

    const handleConsequenceDismiss = () => {
        const nextId = pendingChoiceNextId.current;
        pendingChoiceNextId.current = null;
        setConsequence(null);
        if (nextId) {
            goToNode(nextId);
        } else {
            console.warn('handleConsequenceDismiss: no nextId queued');
        }
    };

    const handleTaskComplete = (success: boolean) => {
        if (!currentNode?.task) return;
        const nextId = success ? currentNode.task.onSuccessId : currentNode.task.onFailId;
        goToNode(nextId);
    };

    const handleRetry = () => {
        if (learningModal) {
            goToNode(learningModal.returnNodeId);
            setLearningModal(null);
        }
    };

    return (
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            {/* Outer wrapper — mobile: full dvh, desktop: centered window on dark bg */}
            <div className="flex items-center justify-center lg:p-6" style={{ background: '#0f172a', height: '100dvh' }}>

            {/* Stress border */}
            {currentNode?.isStressful && (
                <div className="fixed inset-0 pointer-events-none border-2 border-red-500/30 z-[55] animate-pulse" />
            )}

            {/* App Window — full height on mobile, windowed on desktop */}
            <div className="w-full flex flex-col overflow-hidden" style={{ maxWidth: 960, height: '100%', maxHeight: '100dvh', borderRadius: 0, background: '#ffffff' }}
                 data-desktop-style="border-radius:12px;height:88vh;box-shadow:0 32px 80px rgba(0,0,0,0.6);">
                <style>{`@media(min-width:1024px){[data-desktop-style]{border-radius:12px!important;height:88vh!important;box-shadow:0 32px 80px rgba(0,0,0,0.6)!important;}}`}</style>

                {/* Title bar — hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex items-center px-4 flex-shrink-0" style={{ height: 44, background: '#2d2d2d', borderBottom: '1px solid #1a1a1a' }}>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate('/')} className="w-3 h-3 rounded-full transition-opacity hover:opacity-80" style={{ background: '#ff5f57' }} title="Выйти" />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                    </div>
                    <div className="flex-1 text-center text-[12px] font-medium" style={{ color: '#888' }}>
                        {config.company} — {config.title}
                        {currentNode?.isStressful && <span className="ml-2 text-red-400">● Кризис</span>}
                    </div>
                </div>

                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between px-4 flex-shrink-0" style={{ height: 52, background: '#164e63', paddingTop: 'env(safe-area-inset-top)' }}>
                    <button onClick={() => navigate('/')} className="text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0" style={{ color: 'rgba(207,250,254,0.8)', background: 'rgba(255,255,255,0.1)' }}>
                        ← Выйти
                    </button>
                    <span className="text-[12px] font-semibold text-white truncate mx-3">{config.company}</span>
                    <button
                        onClick={() => setMobileInfoOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors"
                        style={{ background: mobileInfoOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', color: 'rgba(207,250,254,0.9)' }}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Команда</span>
                    </button>
                </div>

                {/* Mobile info panel — characters + metrics, slides in below header */}
                <AnimatePresence>
                    {mobileInfoOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="lg:hidden overflow-hidden flex-shrink-0"
                            style={{ background: '#1e2235', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="px-4 pt-3 pb-4 space-y-4">
                                {/* Characters */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Участники</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(activeCharacters)
                                            .filter(([key]: [string, any]) => key !== 'user' && key !== 'system')
                                            .map(([key, c]: [string, any]) => (
                                                <div key={key} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                    {c.avatar
                                                        ? <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                                        : <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{c.name?.[0]}</div>
                                                    }
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-white leading-tight">{c.name}</p>
                                                        <p className="text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                {/* Metrics */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Метрики</p>
                                    <div className="space-y-2">
                                        {(['budget', 'morale', 'satisfaction'] as const).map(key => {
                                            const meta = METRIC_META[key];
                                            const v = metrics[key];
                                            const ch = lastChanges?.[key] ?? null;
                                            const trackColors = { budget: '#10b981', morale: '#0891b2', satisfaction: '#0891b2' };
                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{meta.label}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            {ch !== null && ch !== 0 && (
                                                                <span className="text-[10px] font-bold" style={{ color: ch > 0 ? '#4ade80' : '#f87171' }}>{ch > 0 ? '+' : ''}{ch}</span>
                                                            )}
                                                            <span className="text-[11px] font-bold text-white">{v}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: v >= 60 ? trackColors[key] : v >= 30 ? '#f59e0b' : '#ef4444' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Body: sidebar (desktop only) + chat */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left sidebar — hidden on mobile */}
                    <div className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 220, background: '#1e2235', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

                        {/* Scenario info */}
                        <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Сценарий</p>
                            <p className="text-sm font-semibold text-white leading-tight">{config.company}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{config.title}</p>
                        </div>

                        {/* Characters list */}
                        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
                            <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Участники</p>
                            {Object.entries(activeCharacters)
                                .filter(([key]: [string, any]) => key !== 'user' && key !== 'system')
                                .map(([key, c]: [string, any]) => (
                                    <div key={key} className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        {c.avatar
                                            ? <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                            : <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{c.name?.[0]}</div>
                                        }
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold text-white truncate">{c.name}</p>
                                            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.role}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Metrics at bottom of sidebar */}
                        <div className="px-3 py-3 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Метрики</p>
                            {(['budget', 'morale', 'satisfaction'] as const).map(key => {
                                const meta = METRIC_META[key];
                                const v = metrics[key];
                                const ch = lastChanges?.[key] ?? null;
                                const trackColors = { budget: '#10b981', morale: '#0891b2', satisfaction: '#0891b2' };
                                return (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{meta.label}</span>
                                            <div className="flex items-center gap-1">
                                                {ch !== null && ch !== 0 && (
                                                    <span className="text-[9px] font-bold" style={{ color: ch > 0 ? '#10b981' : '#ef4444' }}>{ch > 0 ? '+' : ''}{ch}</span>
                                                )}
                                                <span className="text-[10px] font-bold text-white">{v}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: v >= 60 ? trackColors[key] : v >= 30 ? '#f59e0b' : '#ef4444' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main chat area */}
                    <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: '#f0f2f5' }}>

                        {/* Main Content from here — keep all existing overlays and chat */}
                        <div className="flex-1 flex overflow-hidden relative">
                
                {/* Intro Overlay */}
                <AnimatePresence>
                    {currentNode?.type === 'intro' && currentNode.introData && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(22,78,99,0.92)' }}
                        >
                            <div className="max-w-md w-full rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #cffafe' }}>
                                {/* Cinematic header */}
                                <div className="p-7 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)' }}>
                                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.15)', color: '#cffafe' }}>
                                                Симулятор
                                            </span>
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                High Stakes
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-1 text-white">{currentNode.introData.company}</h2>
                                        <p className="text-sm" style={{ color: 'rgba(207,250,254,0.7)' }}>{config.title}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#cffafe' }}>
                                            <User className="w-5 h-5" style={{ color: '#0891b2' }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#0891b2' }}>Ваша роль</p>
                                            <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{currentNode.introData.role}</h3>
                                            <p className="text-gray-500 leading-relaxed text-sm">{currentNode.introData.description}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4" style={{ borderTop: '1px solid #cffafe' }}>
                                        <button
                                            onClick={() => currentNode.nextId && goToNode(currentNode.nextId)}
                                            className="w-full text-white py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                                            style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)', boxShadow: '0 4px 14px rgba(8,145,178,0.3)' }}
                                        >
                                            Принять вызов <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Learning Modal (Correction Loop) */}
                <AnimatePresence>
                    {learningModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-red-900/20 backdrop-blur-md flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border-2 border-red-100"
                            >
                                <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-900">{learningModal.title}</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {learningModal.explanation}
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ключевой урок</p>
                                        <p className="text-gray-900 font-medium">{learningModal.takeaway}</p>
                                    </div>
                                    <button 
                                        onClick={handleRetry}
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Попробовать еще раз
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ENDING SCREEN OVERLAY OR INLINE */}
                <AnimatePresence>
                    {currentNode?.type === 'ending' ? (
                         <div className="absolute inset-0 bg-white z-40">
                             <EndingScreen metrics={metrics} onRestart={() => window.location.reload()} />
                         </div>
                    ) : (
                        <div className="w-full max-w-3xl flex flex-col shadow-xl h-full overflow-hidden" style={{ background: '#ffffff', borderLeft: '1px solid #cffafe', borderRight: '1px solid #cffafe' }}>

                            {/* Context bar — always shows current situation (Go Practice: constant orientation) */}
                            <div className="flex-shrink-0" style={{ borderBottom: '1px solid #cffafe' }}>
                                {/* Participants row */}
                                <div className="px-4 py-1.5 flex items-center gap-2" style={{ background: '#f0fdff' }}>
                                    <div className="flex -space-x-2">
                                        {Object.entries(activeCharacters)
                                            .filter(([key, c]: [string, any]) => c.avatar && key !== 'user' && key !== 'system')
                                            .slice(0, 4)
                                            .map(([key, c]: [string, any]) => (
                                                <img key={key} src={c.avatar} className="w-5 h-5 rounded-full border-2 border-white object-cover shadow-sm" alt={c.name} />
                                            ))}
                                    </div>
                                    <span className="text-[10px] font-medium truncate" style={{ color: '#9ca3af' }}>
                                        {Object.entries(activeCharacters)
                                            .filter(([key]: [string, any]) => key !== 'user' && key !== 'system')
                                            .slice(0, 3)
                                            .map(([, c]: [string, any]) => c.name)
                                            .join(', ')}
                                    </span>
                                    <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2e7b5e' }} />
                                        <span className="text-[10px] font-semibold" style={{ color: '#2e7b5e' }}>симуляция</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar" style={{ background: '#f0f2f5' }}>
                                <div className="flex flex-col px-4 py-4 gap-0.5 min-h-full">

                                    {/* Date pill */}
                                    <div className="flex items-center justify-center mb-4">
                                        <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.06)', color: '#6b7280' }}>
                                            Сегодня
                                        </span>
                                    </div>

                                    {/* Grouped messages */}
                                    {groupMessages(history).map((group, gi) => {
                                        // System / day-change message
                                        if (group.isSystem) {
                                            return (
                                                <motion.div
                                                    key={`sys-${gi}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex justify-center my-4"
                                                >
                                                    <div className={clsx(
                                                        "text-[11px] py-1 px-3.5 rounded-full font-medium max-w-xs text-center",
                                                        group.nodes[0]?.isStressful
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-white/80 text-gray-500 shadow-sm"
                                                    )}>
                                                        {group.nodes[0]?.text}
                                                    </div>
                                                </motion.div>
                                            );
                                        }

                                        const sender = activeCharacters[group.senderId] || activeCharacters['system'];
                                        const accent = getAccent(group.senderId);

                                        return (
                                            <motion.div
                                                key={`group-${gi}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.14 }}
                                                className={clsx("flex gap-2 mt-3", group.isMe ? "flex-row-reverse" : "")}
                                            >
                                                {/* Avatar */}
                                                <div className="flex-shrink-0 w-8 self-end mb-0.5">
                                                    {!group.isMe && (
                                                        sender.avatar
                                                            ? <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                                            : <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                                                                {sender.name?.[0] ?? '?'}
                                                              </div>
                                                    )}
                                                </div>

                                                {/* Bubbles */}
                                                <div className={clsx("flex flex-col gap-[3px] max-w-[72%] md:max-w-[65%]", group.isMe ? "items-end" : "items-start")}>
                                                    {/* Name row — clean, no emojis */}
                                                    {!group.isMe && (
                                                        <div className="flex items-baseline gap-1.5 ml-1 mb-0.5">
                                                            <span className="text-[11px] font-semibold" style={{ color: accent.nameColor }}>{sender.name}</span>
                                                            <span className="text-[10px]" style={{ color: '#9ca3af' }}>{sender.role}</span>
                                                        </div>
                                                    )}

                                                    {group.nodes.map((node, ni) => {
                                                        const isFirst = ni === 0;
                                                        const isLast  = ni === group.nodes.length - 1;
                                                        const msgTime = getSimTime(group.startIdx + ni);

                                                        // Bubble shape (iMessage-style grouping)
                                                        const meR = group.nodes.length === 1 ? 'rounded-[18px] rounded-tr-[4px]'
                                                                  : isFirst ? 'rounded-[18px] rounded-tr-[4px] rounded-br-[6px]'
                                                                  : isLast  ? 'rounded-[18px] rounded-br-[4px] rounded-tr-[6px]'
                                                                  : 'rounded-[18px] rounded-r-[6px]';
                                                        const npcR = group.nodes.length === 1 ? 'rounded-[18px] rounded-tl-[4px]'
                                                                   : isFirst ? 'rounded-[18px] rounded-tl-[4px] rounded-bl-[6px]'
                                                                   : isLast  ? 'rounded-[18px] rounded-bl-[4px] rounded-tl-[6px]'
                                                                   : 'rounded-[18px] rounded-l-[6px]';

                                                        return (
                                                            <div key={node.id}>
                                                                <div
                                                                    className={clsx(
                                                                        "px-3.5 py-2.5 text-[13.5px] leading-[1.5] break-words",
                                                                        group.isMe ? meR : npcR,
                                                                        group.isMe
                                                                            ? "text-white"
                                                                            : node.isStressful
                                                                                ? "text-red-900"
                                                                                : "text-gray-900"
                                                                    )}
                                                                    style={group.isMe
                                                                        ? { background: '#1a3a4a' }
                                                                        : node.isStressful
                                                                            ? { background: '#fff1f2', border: '1px solid #fecdd3' }
                                                                            : { background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }
                                                                    }
                                                                >
                                                                    <TextWithTooltips text={node.text || ''} />
                                                                </div>
                                                                {isLast && (
                                                                    <div className={clsx("flex items-center gap-1 mt-0.5 px-1", group.isMe ? "justify-end" : "justify-start")}>
                                                                        <span className="text-[10px]" style={{ color: '#9ca3af' }}>{msgTime}</span>
                                                                        {group.isMe && <CheckCheck className="w-3 h-3" style={{ color: '#9ca3af' }} />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {/* Typing Indicator — minimal, no layout shift */}
                                    <AnimatePresence>
                                        {isTyping && typingUser && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.12 }}
                                                className="flex items-end gap-2 mt-3 ml-10"
                                            >
                                                <div className="px-4 py-3 rounded-[18px] rounded-tl-[4px] flex gap-1 items-center" style={{ background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#d1d5db', animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#d1d5db', animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#d1d5db', animationDelay: '300ms' }} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Skip / Continue button — visible during read pause */}
                                    <AnimatePresence>
                                        {isReading && !isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex justify-end mt-2 pr-1"
                                            >
                                                <button
                                                    onClick={() => {
                                                        if (readTimerRef.current) {
                                                            clearTimeout(readTimerRef.current);
                                                            readTimerRef.current = null;
                                                        }
                                                        setIsReading(false);
                                                        const nxt = pendingNextIdRef.current;
                                                        pendingNextIdRef.current = null;
                                                        if (nxt) goToNode(nxt);
                                                    }}
                                                    className="flex items-center gap-1.5 text-[11px] font-medium transition-colors px-2.5 py-1 rounded-full" style={{ color: '#9ca3af' }}
                                                >
                                                    Далее
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Task Card — rendered inline like a shared work card */}
                                    {currentNode?.type === 'task' && currentNode.task && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.22 }}
                                            className="mt-4"
                                        >
                                            {/* Task card — neutral, document-like */}
                                            <div className="mt-2 mx-1 rounded-2xl overflow-hidden shadow-sm" style={{
                                                background: '#ffffff',
                                                border: currentNode.isStressful ? '1px solid #fecdd3' : '1px solid #e5e7eb',
                                            }}>
                                                {/* Minimal header strip */}
                                                <div className="px-4 py-2.5 flex items-center gap-2" style={{
                                                    background: currentNode.isStressful ? '#fff1f2' : '#fafafa',
                                                    borderBottom: currentNode.isStressful ? '1px solid #fecdd3' : '1px solid #f3f4f6',
                                                }}>
                                                    <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: currentNode.isStressful ? '#f43f5e' : '#9ca3af' }} />
                                                    <span className="text-[11px] font-semibold uppercase tracking-wide flex-1" style={{ color: currentNode.isStressful ? '#be123c' : '#6b7280' }}>
                                                        {currentNode.isStressful ? 'Срочное задание' : 'Задание'}
                                                    </span>
                                                    <span className="text-[10px] font-mono" style={{ color: '#d1d5db' }}>#{currentNode.id.slice(-4).toUpperCase()}</span>
                                                </div>
                                                <div className="p-4">
                                                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>{currentNode.text}</p>
                                                    {currentNode.task.type === 'log_analysis' && <LogAnalysisTask task={currentNode.task} onComplete={handleTaskComplete} />}
                                                    {currentNode.task.type === 'sql_query' && <SqlTask task={currentNode.task} onComplete={handleTaskComplete} />}
                                                    {currentNode.task.type === 'calculation' && <CalculationTask task={currentNode.task} onComplete={handleTaskComplete} />}
                                                    {currentNode.task.type === 'feature_spec' && <FeatureSpecTask task={currentNode.task} onComplete={handleTaskComplete} />}
                                                    {currentNode.task.type === 'kanban_sort' && <KanbanTask data={currentNode.task.data} onComplete={handleTaskComplete} />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Consequence Story Card */}
                                    <AnimatePresence>
                                        {consequence && (
                                            <ConsequenceCard
                                                data={consequence}
                                                onDismiss={handleConsequenceDismiss}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <div className="h-3" />
                                </div>
                            </div>

                            {/* Input Area — flex-shrink-0 keeps it anchored, pb for iOS home bar */}
                            <div className="z-20 flex flex-col flex-shrink-0" style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                                {currentNode?.type !== 'ending' && currentNode?.type !== 'intro' && (
                                    <AIInlinePanel
                                        config={config}
                                        metrics={metrics}
                                        currentNode={currentNode}
                                        projectId={projectId}
                                        publicAnonKey={publicAnonKey}
                                    />
                                )}
                                <div className="px-3 py-3" style={{ background: '#ffffff' }}>
                                    <AnimatePresence mode="wait">
                                        {consequence ? (
                                            <motion.div key="consequence-wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2 text-center">
                                                <span className="text-[11px]" style={{ color: '#9ca3af' }}>Посмотри на последствия выше...</span>
                                            </motion.div>
                                        ) : pendingReply ? (
                                            <motion.div
                                                key="reply"
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.18 }}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#0891b2' }} />
                                                    <span className="text-[11px] truncate italic" style={{ color: '#0891b2' }}>
                                                        Ваше сообщение отправлено — нажмите, чтобы продолжить
                                                    </span>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.04 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={handleReply}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm text-white flex-shrink-0"
                                                    style={{ background: '#0891b2' }}
                                                >
                                                    Продолжить →
                                                </motion.button>
                                            </motion.div>
                                        ) : currentNode?.type === 'choice' ? (
                                            <motion.div
                                                key="choices"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {/* "Your turn" — minimal header */}
                                                <div className="flex items-center gap-2 mb-2.5 px-0.5">
                                                    <span className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>Выберите ответ</span>
                                                    <div className="flex-1 h-px" style={{ background: '#f3f4f6' }} />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    {currentNode.choices?.map((choice: any, i: number) => {
                                                        const impact = choice.impact || {};
                                                        const totalImpact = (impact.budget || 0) + (impact.morale || 0) + (impact.satisfaction || 0);
                                                        // Subtle impact indicators using only text labels, no emoji
                                                        const impactPills: { label: string; positive: boolean }[] = [];
                                                        if (impact.budget && impact.budget !== 0) impactPills.push({ label: `Бюджет ${impact.budget > 0 ? '+' : ''}${impact.budget}%`, positive: impact.budget > 0 });
                                                        if (impact.morale && impact.morale !== 0) impactPills.push({ label: `Команда ${impact.morale > 0 ? '+' : ''}${impact.morale}%`, positive: impact.morale > 0 });
                                                        if (impact.satisfaction && impact.satisfaction !== 0) impactPills.push({ label: `Клиенты ${impact.satisfaction > 0 ? '+' : ''}${impact.satisfaction}%`, positive: impact.satisfaction > 0 });

                                                        return (
                                                            <motion.button
                                                                key={i}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: i * 0.04, duration: 0.14 }}
                                                                whileTap={{ scale: 0.99 }}
                                                                onClick={() => handleChoice(choice)}
                                                                className="w-full text-left px-3.5 py-3 rounded-xl transition-all"
                                                                style={{
                                                                    background: '#f9fafb',
                                                                    border: '1px solid #e5e7eb',
                                                                }}
                                                                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#f3f4f6'; el.style.borderColor = '#d1d5db'; }}
                                                                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#f9fafb'; el.style.borderColor = '#e5e7eb'; }}
                                                            >
                                                                <p className="text-[13.5px] leading-snug font-normal text-gray-800 mb-1.5">
                                                                    {choice.text}
                                                                </p>
                                                                {impactPills.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {impactPills.map((pill, pi) => (
                                                                            <span key={pi} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{
                                                                                background: pill.positive ? '#f0fdf4' : '#fef2f2',
                                                                                color: pill.positive ? '#15803d' : '#b91c1c',
                                                                            }}>
                                                                                {pill.label}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        ) : currentNode?.type === 'task' ? (
                                            <motion.div key="task-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 py-1">
                                                <p className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>Ваши заметки / расчёт:</p>
                                                <textarea
                                                    value={taskAnswer}
                                                    onChange={e => setTaskAnswer(e.target.value)}
                                                    placeholder="Запишите ваш анализ, формулу или расчёт здесь..."
                                                    rows={3}
                                                    className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none"
                                                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', lineHeight: 1.5 }}
                                                />
                                                <p className="text-[10px]" style={{ color: '#9ca3af' }}>Выберите ответ в задании выше, чтобы продолжить</p>
                                            </motion.div>
                                        ) : currentNode?.type === 'learning' ? (
                                            <motion.div key="learning-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-2">
                                                <BookOpen className="w-4 h-4" style={{ color: '#9ca3af' }} />
                                                <span className="text-sm" style={{ color: '#9ca3af' }}>Разбор ошибки...</span>
                                            </motion.div>
                                        ) : currentNode?.type === 'intro' ? (
                                            <motion.div key="intro-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-2">
                                                <span className="text-sm text-gray-400">Загрузка сценария...</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 py-2">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                    </div>
                    )}
                </AnimatePresence>
                    </div> {/* end main chat flex-1 */}
                </div> {/* end right chat area */}
            </div> {/* end body sidebar+chat */}
            </div> {/* end App Window */}

            {/* Resource Modal — fixed positioning works fine outside window */}
            <AnimatePresence>
                {showResource && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center flex-shrink-0">
                                <h3 className="font-bold text-amber-900 flex items-center gap-2 text-lg">
                                    <BookOpen className="w-5 h-5 text-amber-600" />
                                    {showResource.title}
                                </h3>
                                <button onClick={() => setShowResource(null)} className="p-1 hover:bg-amber-200 rounded-full text-amber-800 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="prose prose-sm prose-amber max-w-none text-gray-700">
                                    {showResource.content}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center flex-shrink-0">
                                <button
                                    onClick={() => setShowResource(null)}
                                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-gray-200"
                                >
                                    Понятно, спасибо
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            </div> {/* end desktop background */}
        </DndProvider>
    );
}