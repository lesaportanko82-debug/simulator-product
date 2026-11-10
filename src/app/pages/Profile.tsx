import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    User, Camera, Save, BarChart3, CheckCircle2,
    Target, BookOpen, Award, Shield, LogOut, Bell,
    Lock, ChevronRight, Zap, TrendingUp, Clock,
    Star, PlayCircle, Edit3, Mail, Calendar, Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '@/lib/api';
import {
  isNotificationSupported, getPermission, requestPermission,
  sendWelcomeNotification, savePreference, loadPreference,
  scheduleReminder, cancelReminder,
} from '@/lib/notifications';
import { toast } from 'sonner';
import { courseData } from '@/data/course';
import { GP_SIMULATOR, loadProgress } from '@/data/simulator-gp';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface ProfileProps {
    progress: Record<string, 'locked' | 'unlocked' | 'completed'>;
}

type Tab = 'overview' | 'settings' | 'notifications';

const TEAL = '#0891b2';
const DARK = '#164e63';

// ─── Achievements ─────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
    { id: 'first_module',  icon: '🎯', title: 'Первый модуль',    desc: 'Завершите любой модуль курса',     threshold: (pct: number) => pct >= 5  },
    { id: 'quarter',       icon: '⚡', title: 'Четверть пути',    desc: 'Пройдите 25% курса',               threshold: (pct: number) => pct >= 25 },
    { id: 'halfway',       icon: '🏆', title: 'Экватор',          desc: 'Пройдите 50% курса',               threshold: (pct: number) => pct >= 50 },
    { id: 'almost',        icon: '🔥', title: 'Почти финиш',      desc: 'Пройдите 75% курса',               threshold: (pct: number) => pct >= 75 },
    { id: 'complete',      icon: '🎓', title: 'Завершение курса',  desc: 'Пройдите весь курс',               threshold: (pct: number) => pct >= 100 },
    { id: 'simulator',     icon: '🕹', title: 'Первый симулятор', desc: 'Запустите любой симулятор',        threshold: (_: number, sims: number) => sims > 0 },
    { id: 'analyst',       icon: '📊', title: 'Аналитик',         desc: 'Пройдите модуль "Метрики"',        threshold: (pct: number) => pct >= 30 },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) => (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: '#f0fdff', border: '1px solid #cffafe' }}>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#cffafe' }}>
                {icon}
            </div>
            <span className="text-[11px] font-medium" style={{ color: '#9ca3af' }}>{label}</span>
        </div>
        <div>
            <div className="text-2xl font-bold" style={{ color: '#164e63' }}>{value}</div>
            {sub && <div className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>{sub}</div>}
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export function Profile({ progress }: ProfileProps) {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifPush, setNotifPush] = useState(() => loadPreference());
    const [pushPermission, setPushPermission] = useState<string>(() => getPermission());
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [changingPwd, setChangingPwd] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Course stats
    const totalModules = courseData.reduce((s, w) => s + w.modules.length, 0);
    const completedModules = Object.values(progress).filter(s => s === 'completed').length;
    const coursePct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    // GP simulator stats
    const gpProgress = loadProgress();
    const gpCompleted = Object.values(gpProgress.modules).reduce((s, mp) =>
        s + Object.values(mp.stepsProgress).filter(sp => sp.status === 'correct' || sp.status === 'completed').length, 0);

    // Joined date
    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
        : '';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);
            setName(user.user_metadata?.full_name || '');
            setRole(user.user_metadata?.role || '');
            setCompany(user.user_metadata?.company || '');

            if (projectId) {
                const res = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/profile/${user.id}`,
                    { headers: { Authorization: `Bearer ${await getAccessToken()}` } }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile?.goal) setGoal(data.profile.goal);
                }
            }
        } catch (e) {
            console.error('fetchProfile:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await supabase.auth.updateUser({ data: { full_name: name, role, company } });
            if (projectId) {
                await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/profile/${user.id}`,
                    { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getAccessToken()}` }, body: JSON.stringify({ goal }) }
                );
            }
            toast.success('Профиль сохранён');
        } catch (e: any) {
            toast.error('Ошибка: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !user || !projectId) return;
        const file = e.target.files[0];
        try {
            toast.info('Загрузка фото...');
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/upload-avatar/${user.id}`,
                { method: 'POST', headers: { Authorization: `Bearer ${await getAccessToken()}` }, body: formData }
            );
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
            await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
            setUser((u: any) => ({ ...u, user_metadata: { ...u.user_metadata, avatar_url: data.publicUrl } }));
            toast.success('Фото обновлено');
        } catch (e: any) {
            toast.error('Ошибка загрузки: ' + e.message);
        }
    };

    const handleChangePassword = async () => {
        if (!newPwd || newPwd.length < 6) { toast.error('Минимум 6 символов'); return; }
        setChangingPwd(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPwd });
            if (error) throw error;
            toast.success('Пароль изменён');
            setCurrentPwd(''); setNewPwd('');
        } catch (e: any) {
            toast.error('Ошибка: ' + e.message);
        } finally {
            setChangingPwd(false);
        }
    };

    const handlePushToggle = async () => {
        if (notifPush) {
            // Disable
            setNotifPush(false);
            savePreference(false);
            cancelReminder();
            toast.info('Push-уведомления отключены');
            return;
        }
        // Enable — request permission first
        if (!isNotificationSupported()) {
            toast.error('Ваш браузер не поддерживает уведомления');
            return;
        }
        const perm = await requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
            setNotifPush(true);
            savePreference(true);
            scheduleReminder(30 * 60 * 1000);
            sendWelcomeNotification();
            toast.success('Push-уведомления включены!');
        } else if (perm === 'denied') {
            toast.error('Доступ к уведомлениям запрещён. Разрешите его в настройках браузера.');
        } else {
            toast('Разрешите уведомления во всплывающем окне браузера');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#cffafe', borderTopColor: TEAL }} />
        </div>
    );

    const displayName = name || user?.email?.split('@')[0] || 'Пользователь';
    const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

    const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'overview',      label: 'Обзор',      icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'settings',      label: 'Настройки',  icon: <Edit3 className="w-4 h-4" /> },
        { id: 'notifications', label: 'Уведомления и безопасность', icon: <Bell className="w-4 h-4" /> },
    ];

    return (
        <div className="pb-16 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Profile Hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden mb-6 shadow-sm"
                style={{ border: '1px solid #cffafe' }}
            >
                {/* Banner */}
                <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${DARK}, ${TEAL})` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(103,232,249,0.07) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                </div>

                {/* Avatar + info */}
                <div className="bg-white px-6 pb-5">
                    <div className="flex items-end justify-between -mt-10 mb-4">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl ring-4 ring-white overflow-hidden shadow-lg cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {user?.user_metadata?.avatar_url
                                    ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${DARK}, ${TEAL})` }}>{initials}</div>
                                }
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                            style={{ color: '#6b7280', border: '1px solid #e5e7eb' }}
                        >
                            <LogOut className="w-3.5 h-3.5" /> Выйти
                        </button>
                    </div>

                    <div>
                        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{displayName}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            {user?.email && (
                                <span className="flex items-center gap-1 text-[12px]" style={{ color: '#9ca3af' }}>
                                    <Mail className="w-3 h-3" />{user.email}
                                </span>
                            )}
                            {role && (
                                <span className="flex items-center gap-1 text-[12px]" style={{ color: '#9ca3af' }}>
                                    <Briefcase className="w-3 h-3" />{role}{company ? ` · ${company}` : ''}
                                </span>
                            )}
                            {joinedDate && (
                                <span className="flex items-center gap-1 text-[12px]" style={{ color: '#9ca3af' }}>
                                    <Calendar className="w-3 h-3" />С {joinedDate}
                                </span>
                            )}
                        </div>
                        {goal && <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>{goal}</p>}
                    </div>
                </div>
            </motion.div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#f3f4f6' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-medium transition-all"
                        style={{
                            background: activeTab === tab.id ? '#ffffff' : 'transparent',
                            color: activeTab === tab.id ? TEAL : '#6b7280',
                            boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard
                                icon={<BookOpen className="w-4 h-4" style={{ color: TEAL }} />}
                                label="Модулей"
                                value={`${completedModules}/${totalModules}`}
                                sub="завершено"
                            />
                            <StatCard
                                icon={<TrendingUp className="w-4 h-4" style={{ color: '#2e7b5e' }} />}
                                label="Прогресс"
                                value={`${coursePct}%`}
                                sub="курса пройдено"
                            />
                            <StatCard
                                icon={<PlayCircle className="w-4 h-4" style={{ color: '#0e7490' }} />}
                                label="PM Simulator"
                                value={gpCompleted}
                                sub="шагов выполнено"
                            />
                            <StatCard
                                icon={<Star className="w-4 h-4" style={{ color: '#b45309' }} />}
                                label="Правильных"
                                value={gpProgress.totalCorrect}
                                sub="ответов в тренажёре"
                            />
                        </div>

                        {/* Course progress */}
                        <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e5e7eb' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Прогресс по курсу</h2>
                                <span className="text-sm font-bold" style={{ color: TEAL }}>{coursePct}%</span>
                            </div>
                            <div className="h-2 rounded-full mb-4" style={{ background: '#f3f4f6' }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${TEAL}, #0e7490)` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${coursePct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {courseData.map(week => {
                                    const wCompleted = week.modules.filter(m => progress[m.id] === 'completed').length;
                                    const wTotal = week.modules.length;
                                    const wPct = Math.round((wCompleted / wTotal) * 100);
                                    return (
                                        <div key={week.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                                            {wPct === 100
                                                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#2e7b5e' }} />
                                                : <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: wPct > 0 ? TEAL : '#e5e7eb' }} />
                                            }
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-medium truncate" style={{ color: '#374151' }}>
                                                    {week.title.replace(/Неделя \d+: /, '')}
                                                </p>
                                                <p className="text-[10px]" style={{ color: '#9ca3af' }}>{wCompleted}/{wTotal} модулей</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e5e7eb' }}>
                            <h2 className="text-sm font-bold mb-4" style={{ color: '#111827' }}>Достижения</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {ACHIEVEMENTS.map(ach => {
                                    const unlocked = ach.threshold(coursePct, gpCompleted);
                                    return (
                                        <div
                                            key={ach.id}
                                            className="flex flex-col items-center text-center p-3 rounded-xl gap-2 transition-all"
                                            style={{
                                                background: unlocked ? '#f0fdff' : '#f9fafb',
                                                border: `1px solid ${unlocked ? '#cffafe' : '#f3f4f6'}`,
                                                opacity: unlocked ? 1 : 0.55,
                                            }}
                                        >
                                            <span className="text-2xl">{ach.icon}</span>
                                            <div>
                                                <p className="text-[11px] font-bold" style={{ color: unlocked ? '#164e63' : '#9ca3af' }}>{ach.title}</p>
                                                <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{ach.desc}</p>
                                            </div>
                                            {unlocked && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#cffafe', color: TEAL }}>Открыто</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #e5e7eb' }}>
                            <div className="px-5 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <p className="text-sm font-bold" style={{ color: '#111827' }}>Быстрый доступ</p>
                            </div>
                            {[
                                { label: 'Продолжить курс', icon: <BookOpen className="w-4 h-4" />, path: '/' },
                                { label: 'PM Simulator (новый)', icon: <Zap className="w-4 h-4" />, path: '/simulator/gp/course' },
                                { label: 'База знаний', icon: <BarChart3 className="w-4 h-4" />, path: '/resources/knowledge' },
                            ].map(({ label, icon, path }) => (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left"
                                    style={{ borderBottom: '1px solid #f9fafb', color: '#374151' }}
                                    onMouseOver={e => (e.currentTarget.style.background = '#f9fafb')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ color: TEAL }}>{icon}</span>
                                    <span className="text-sm font-medium flex-1">{label}</span>
                                    <ChevronRight className="w-4 h-4" style={{ color: '#d1d5db' }} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── SETTINGS ── */}
                {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="rounded-2xl bg-white p-6 space-y-5" style={{ border: '1px solid #e5e7eb' }}>

                        <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Редактировать профиль</h2>

                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm cursor-pointer relative group flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                                {user?.user_metadata?.avatar_url
                                    ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg" style={{ background: `linear-gradient(135deg, ${DARK}, ${TEAL})` }}>{initials}</div>
                                }
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium" style={{ color: TEAL }}>Изменить фото</button>
                                <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>JPG, PNG до 5 МБ</p>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Имя и Фамилия', value: name,    setter: setName,    icon: <User className="w-4 h-4" />,      placeholder: 'Иван Иванов' },
                                { label: 'Email',          value: user?.email || '', setter: () => {}, icon: <Mail className="w-4 h-4" />, placeholder: '', readonly: true },
                                { label: 'Должность',      value: role,    setter: setRole,    icon: <Briefcase className="w-4 h-4" />, placeholder: 'Product Manager' },
                                { label: 'Компания',       value: company, setter: setCompany, icon: <Shield className="w-4 h-4" />,    placeholder: 'Яндекс, Авито...' },
                            ].map(({ label, value, setter, icon, placeholder, readonly }) => (
                                <div key={label} className="space-y-1.5">
                                    <label className="text-[12px] font-semibold" style={{ color: '#374151' }}>{label}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>{icon}</span>
                                        <input
                                            type="text"
                                            value={value}
                                            readOnly={readonly}
                                            onChange={e => !readonly && setter(e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                                            style={{
                                                border: '1.5px solid #e5e7eb',
                                                background: readonly ? '#f9fafb' : '#fff',
                                                color: readonly ? '#9ca3af' : '#374151',
                                            }}
                                            onFocus={e => { if (!readonly) e.target.style.borderColor = TEAL; }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Goal */}
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: '#374151' }}>
                                <Target className="w-3.5 h-3.5" style={{ color: TEAL }} /> Цель обучения
                            </label>
                            <textarea
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                rows={3}
                                placeholder="Хочу стать Product Manager в FinTech компании..."
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                                style={{ border: '1.5px solid #e5e7eb', color: '#374151' }}
                                onFocus={e => { e.target.style.borderColor = TEAL; }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                            />
                            <p className="text-[11px]" style={{ color: '#9ca3af' }}>Помогает менторам лучше понять ваши потребности.</p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                                style={{ background: TEAL }}
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── NOTIFICATIONS & SECURITY ── */}
                {activeTab === 'notifications' && (
                    <motion.div key="notif" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                        {/* Notifications */}
                        <div className="rounded-2xl bg-white p-6" style={{ border: '1px solid #e5e7eb' }}>
                            <h2 className="text-sm font-bold mb-4" style={{ color: '#111827' }}>Уведомления</h2>
                            <div className="space-y-3">
                                {/* Email toggle */}
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: '#374151' }}>Email-уведомления</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>Новые материалы, напоминания о курсе</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifEmail(v => !v)}
                                        className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
                                        style={{ background: notifEmail ? TEAL : '#e5e7eb' }}
                                    >
                                        <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: notifEmail ? 22 : 4 }} />
                                    </button>
                                </div>

                                {/* Push toggle — with real permission flow */}
                                <div className="flex items-start justify-between py-2 gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium" style={{ color: '#374151' }}>Push-уведомления</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                                            Напоминания в браузере, когда вкладка открыта
                                        </p>
                                        {pushPermission === 'denied' && (
                                            <p className="text-[11px] mt-1 font-medium" style={{ color: '#dc2626' }}>
                                                Доступ запрещён. Разрешите в настройках браузера (🔒 слева от адреса).
                                            </p>
                                        )}
                                        {!isNotificationSupported() && (
                                            <p className="text-[11px] mt-1" style={{ color: '#dc2626' }}>Браузер не поддерживает уведомления</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handlePushToggle}
                                        disabled={pushPermission === 'denied' || !isNotificationSupported()}
                                        className="relative w-10 h-6 rounded-full transition-all flex-shrink-0 disabled:opacity-40"
                                        style={{ background: notifPush ? TEAL : '#e5e7eb' }}
                                    >
                                        <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: notifPush ? 22 : 4 }} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password change */}
                        <div className="rounded-2xl bg-white p-6" style={{ border: '1px solid #e5e7eb' }}>
                            <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                                <Lock className="w-4 h-4" style={{ color: TEAL }} /> Изменить пароль
                            </h2>
                            <div className="space-y-3 max-w-sm">
                                <input
                                    type="password"
                                    value={newPwd}
                                    onChange={e => setNewPwd(e.target.value)}
                                    placeholder="Новый пароль (мин. 6 символов)"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ border: '1.5px solid #e5e7eb', color: '#374151' }}
                                    onFocus={e => { e.target.style.borderColor = TEAL; }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                                />
                                <button
                                    onClick={handleChangePassword}
                                    disabled={changingPwd || newPwd.length < 6}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
                                    style={{ background: TEAL }}
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    {changingPwd ? 'Сохранение...' : 'Изменить пароль'}
                                </button>
                            </div>
                        </div>

                        {/* Danger zone */}
                        <div className="rounded-2xl p-6" style={{ border: '1.5px solid #fecdd3', background: '#fff5f5' }}>
                            <h2 className="text-sm font-bold mb-1" style={{ color: '#be123c' }}>Выход из аккаунта</h2>
                            <p className="text-[12px] mb-4" style={{ color: '#9ca3af' }}>Вы будете перенаправлены на страницу входа.</p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                                style={{ background: '#dc2626' }}
                            >
                                <LogOut className="w-4 h-4" /> Выйти из аккаунта
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
