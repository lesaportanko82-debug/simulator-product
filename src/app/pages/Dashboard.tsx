import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseData, Week } from '@/data/course';
import { Play, CheckCircle, Lock, Trophy, Star, ArrowRight, Activity, Calendar, Clock, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import workspaceImg from 'figma:asset/c8152f807d82f1fde04f06453f73c13867b47397.png';
import { BookingModal } from '@/app/components/BookingModal';

interface DashboardProps {
  progress: Record<string, 'locked' | 'unlocked' | 'completed'>;
  userName?: string;
}

const weekImages: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1759159347914-88541fa4bd14?auto=format&fit=crop&w=800&q=80", 
  2: "https://images.unsplash.com/photo-1590402494628-9b9acf0b90ae?auto=format&fit=crop&w=800&q=80",
  3: "https://images.unsplash.com/photo-1585123607190-72ec2979a269?auto=format&fit=crop&w=800&q=80",
  4: "https://images.unsplash.com/photo-1671163377628-a1542b9de075?auto=format&fit=crop&w=800&q=80",
  5: "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?auto=format&fit=crop&w=800&q=80",
  6: "https://images.unsplash.com/photo-1720962158937-7ea890052166?auto=format&fit=crop&w=800&q=80",
  7: "https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=800&q=80",
};

const tips = [
  "Не путайте Output и Outcome. Output — это количество фич. Outcome — это изменение поведения пользователей.",
  "Влюбитесь в проблему, а не в решение.",
  "Если вы не стесняетесь первой версии своего продукта, вы запустились слишком поздно.",
  "Ваши пользователи не знают, чего они хотят, пока вы им это не покажете.",
  "Хороший PM говорит «нет» чаще, чем «да».",
  "Данные лучше мнений. Но интуиция подсказывает, где искать данные.",
  "MVP — это не «недоделанный продукт», а минимальный способ проверить гипотезу.",
  "CustDev — это не продажа идеи, а поиск истины.",
  "Не спрашивайте маму, хороша ли ваша идея. Спросите, когда она последний раз сталкивалась с этой проблемой.",
  "Юнит-экономика должна сходиться на бумаге до того, как вы напишете первую строчку кода."
];

export function Dashboard({ progress, userName }: DashboardProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const totalModules = courseData.reduce((acc, w) => acc + w.modules.length, 0);
  const completedModules = Object.values(progress).filter(s => s === 'completed').length;
  const totalProgress = Math.round((completedModules / totalModules) * 100);

  const getPmTitle = (pct: number): string => {
    if (pct >= 100) return 'Chief Product Officer 🏆';
    if (pct >= 80)  return 'Head of Product';
    if (pct >= 60)  return 'Lead PM';
    if (pct >= 40)  return 'Senior PM';
    if (pct >= 20)  return 'Product Manager';
    return 'Junior PM';
  };
  const pmTitle = getPmTitle(totalProgress);

  const displayName = userName || 'PM';

  // Find current active module
  const currentWeek = courseData.find(w => w.modules.some(m => progress[m.id] === 'unlocked')) || courseData[0];
  const currentModule = currentWeek.modules.find(m => progress[m.id] === 'unlocked') || 
                        (completedModules === totalModules ? null : currentWeek.modules[0]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      {/* Compact Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[200px] flex items-center group" style={{ background: "#164e63" }}>
        <div className="absolute inset-0 z-0">
             <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0e7490 0%, #164e63 100%)" }} />
             <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 mix-blend-overlay">
                <img src={workspaceImg} alt="Workspace" className="w-full h-full object-cover" />
             </div>
             <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top right, rgba(103,232,249,0.15), transparent 60%)" }} />
        </div>

        <div className="relative z-10 px-8 py-8 w-full flex justify-between items-center">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border mb-3" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(103,232,249,0.2)" }}>
                    <Star className="w-3 h-3 fill-[#67e8f9]" style={{ color: "#67e8f9" }} />
                    <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "rgba(207,250,254,0.8)" }}>PM Simulator • Dashboard</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white leading-tight">
                    Добро пожаловать, <br />
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #67e8f9, #cffafe)" }}>
                        {displayName}
                    </span>
                </h1>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}>
                    <span className="text-xs font-semibold tracking-wide" style={{ color: "#cffafe" }}>{pmTitle}</span>
                </div>
            </div>

            {/* Quick Stat on Hero */}
            <div className="hidden md:block text-right">
                <div className="text-sm font-medium mb-1" style={{ color: "rgba(103,232,249,0.7)" }}>Общий прогресс</div>
                <div className="text-4xl font-black text-white tracking-tight">{totalProgress}%</div>
            </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Active Module (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Row - Darker & Distinct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl shadow-lg flex items-center justify-between group cursor-default" style={{ background: "#0e7490", border: "1px solid rgba(103,232,249,0.15)" }}
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(207,250,254,0.7)" }}>Завершено модулей</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{completedModules}</span>
                            <span className="text-sm text-gray-400">/ {totalModules}</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#164e63", color: "#67e8f9" }}>
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-xl shadow-lg flex items-center justify-between group cursor-default" style={{ background: "#0e7490", border: "1px solid rgba(103,232,249,0.15)" }}
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(207,250,254,0.7)" }}>Текущая неделя</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">Week {currentWeek.id}</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#164e63", color: "#cffafe" }}>
                        <Calendar className="w-5 h-5" />
                    </div>
                </motion.div>
            </div>

            {/* Active Module Card - Highlighted Block */}
            {currentModule && progress[currentModule.id] !== 'completed' && (
                <div className="rounded-xl p-8 text-white shadow-xl relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}>
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                     <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at bottom left, rgba(103,232,249,0.15), transparent 60%)" }} />

                     <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: "#67e8f9" }} />
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#cffafe" }}>Продолжить обучение</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{currentModule.title}</h3>
                            <p className="text-sm leading-relaxed max-w-lg mb-8" style={{ color: "rgba(207,250,254,0.8)" }}>{currentModule.description}</p>

                            <Link
                                to={`/module/${currentModule.id}`}
                                className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg font-bold text-sm shadow-md active:scale-95 transform transition-colors hover:bg-[#f0fdff]"
                                style={{ color: "#0e7490" }}
                            >
                                Перейти к уроку <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="hidden sm:block p-4 rounded-xl backdrop-blur-sm border border-white/10" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <Activity className="w-8 h-8" style={{ color: "#cffafe" }} />
                        </div>
                     </div>
                </div>
            )}
            
            {/* Course Map Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Программа курса</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {courseData.map((week) => {
                        const weekStatus = week.modules.every(m => progress[m.id] === 'completed') 
                            ? 'completed' 
                            : week.modules.some(m => progress[m.id] === 'unlocked' || progress[m.id] === 'completed')
                                ? 'active'
                                : 'locked';
                        
                        const bgImage = weekImages[week.id] || weekImages[1];

                        return (
                            <Link 
                                key={week.id} 
                                to={weekStatus === 'locked' ? '#' : `/week/${week.id}`}
                                className={clsx(
                                    "relative h-48 rounded-2xl overflow-hidden group transition-all duration-500",
                                    weekStatus === 'locked' 
                                        ? "opacity-70 grayscale cursor-not-allowed hover:opacity-70" 
                                        : "hover:shadow-2xl hover:scale-[1.02] cursor-pointer shadow-lg"
                                )}
                            >
                                {/* Background Image with Overlay */}
                                <div className="absolute inset-0">
                                    <img 
                                        src={bgImage} 
                                        alt={week.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className={clsx(
                                        "absolute inset-0 transition-opacity duration-300",
                                        weekStatus === 'active' 
                                            ? "group-hover:opacity-90"
                                            : "bg-gray-900/80 group-hover:bg-gray-900/70"
                                    )} />
                                    
                                    {/* Gradient Accent */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end relative z-10">
                                    <div className="absolute top-4 right-4 z-20">
                                        {weekStatus === 'completed' && (
                                            <div className="text-white p-2 rounded-full shadow-lg border-2 border-white/20" style={{ background: "#2e7b5e" }}>
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                        )}
                                        {weekStatus === 'locked' && (
                                            <div className="bg-black/40 backdrop-blur-md text-white/30 p-2 rounded-full border border-white/10">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        )}
                                        {weekStatus === 'active' && (
                                            <div className="flex items-center gap-1.5 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xl animate-pulse" style={{ background: "rgba(8,145,178,0.9)", border: "1px solid rgba(103,232,249,0.2)" }}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                Текущая
                                            </div>
                                        )}
                                    </div>

                                    <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm",
                                                weekStatus === 'active' 
                                                    ? "bg-[#0891b2]/20 text-[#cffafe] border-[#67e8f9]/30"
                                                    : "bg-white/10 text-gray-300 border-white/10"
                                            )}>
                                                Неделя {week.id}
                                            </span>
                                        </div>
                                        <h4 className="text-2xl font-extrabold text-white leading-tight mb-4 line-clamp-2 drop-shadow-md tracking-tight">
                                            {week.title.split(': ')[1] || week.title}
                                        </h4>
                                        <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                                <div
                                                    className="h-full transition-all duration-1000"
                                                    style={{
                                                      width: weekStatus === 'completed' ? '100%' : weekStatus === 'active' ? '40%' : '5%',
                                                      background: weekStatus === 'completed' ? '#2e7b5e' : '#0891b2',
                                                      boxShadow: '0 0 10px rgba(8,145,178,0.5)',
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-medium text-white/50 group-hover:text-white/80 transition-colors">
                                                {week.modules.length} модулей
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Right Column: Mini Widgets (1/3 width) */}
        <div className="space-y-6">
            
            {/* Daily Tip Widget */}
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h4 className="font-bold text-amber-900 text-sm">Совет дня</h4>
                </div>
                <motion.div
                    key={currentTipIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-sm text-amber-800/80 leading-relaxed font-medium min-h-[4em]">
                        "{tips[currentTipIndex]}"
                    </p>
                </motion.div>
            </div>

            {/* Next Live Event (Mockup) */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" style={{ background: "#cffafe" }} />
                 <h4 className="font-bold text-gray-900 text-sm mb-3 relative z-10">Ближайший Q&A</h4>
                 
                 <div className="flex items-start gap-3 relative z-10">
                    <div className="rounded-lg p-2 text-center min-w-[3.5rem]" style={{ background: "#cffafe", color: "#0e7490" }}>
                        <div className="text-xs font-bold uppercase">Фев</div>
                        <div className="text-lg font-black">28</div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Разбор домашек с ментором</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" /> 19:00 (МСК)
                        </div>
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full mt-4 bg-gray-50 text-gray-600 text-xs font-bold py-2 rounded-lg transition-colors border border-gray-100 hover:bg-[#cffafe] hover:text-[#0e7490] hover:border-[#67e8f9]"
                 >
                    Записаться
                 </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h4 className="font-bold text-gray-700 text-sm">Быстрый доступ</h4>
                </div>
                <div className="p-2">
                    <Link to="/resources/knowledge" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">База знаний</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0891b2] transition-colors" />
                    </Link>
                    <Link to="/resources/cases" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Симулятор кейсов</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0891b2] transition-colors" />
                    </Link>
                    <Link to="/resources/faq" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">FAQ</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0891b2] transition-colors" />
                    </Link>
                </div>
            </div>

        </div>
      </div>
    </motion.div>
  );
}