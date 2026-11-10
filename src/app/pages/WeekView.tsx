import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { weekLabel, courseData } from '@/data/course';
import { CheckCircle, Lock, PlayCircle, ArrowRight, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'motion/react';

interface WeekViewProps {
  progress: Record<string, 'locked' | 'unlocked' | 'completed'>;
}

const weekImages: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1759159347914-88541fa4bd14?auto=format&fit=crop&w=1200&q=80", 
  2: "https://images.unsplash.com/photo-1590402494628-9b9acf0b90ae?auto=format&fit=crop&w=1200&q=80",
  3: "https://images.unsplash.com/photo-1585123607190-72ec2979a269?auto=format&fit=crop&w=1200&q=80",
  4: "https://images.unsplash.com/photo-1671163377628-a1542b9de075?auto=format&fit=crop&w=1200&q=80",
  5: "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?auto=format&fit=crop&w=1200&q=80",
  6: "https://images.unsplash.com/photo-1720962158937-7ea890052166?auto=format&fit=crop&w=1200&q=80",
};

export function WeekView({ progress }: WeekViewProps) {
  const { weekId } = useParams();
  const week = courseData.find(w => w.id === Number(weekId));

  if (!week) return <Navigate to="/" />;

  const total = week.modules.length;
  const completed = week.modules.filter(m => progress[m.id] === 'completed').length;
  const percent = Math.round((completed / total) * 100);
  const coverImage = weekImages[week.id] || weekImages[1];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-16"
    >
      {/* Hero Header */}
      <div className="relative h-48 lg:h-64 rounded-2xl overflow-hidden shadow-2xl group mb-10">
        <div className="absolute inset-0 z-0">
             <img 
                 src={coverImage} 
                 alt={week.title} 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gray-900/60" />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 z-20">
             <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/10"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Все недели</span>
            </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20 flex justify-between items-end">
             <div className="max-w-2xl">
                 <div className="flex items-center gap-3 font-bold uppercase tracking-wider text-xs mb-2" style={{ color: "#67e8f9" }}>
                    <span className="px-2.5 py-1 rounded-md" style={{ background: "rgba(8,145,178,0.25)", color: "#cffafe", border: "1px solid rgba(103,232,249,0.3)" }}>{weekLabel(week.id)}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60">{completed} из {total} модулей</span>
                 </div>
                 <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight mb-1">
                     {week.title.split(': ')[1] || week.title}
                 </h1>
                 <p className="text-gray-300 text-base lg:text-lg line-clamp-2 font-light hidden sm:block">
                     {week.description}
                 </p>
             </div>
             
             {/* Progress */}
             <div className="hidden md:flex flex-col items-center">
                 <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="text-white/10 stroke-current" strokeWidth="4" fill="none" />
                        <circle 
                            cx="32" cy="32" r="28" 
                            className="stroke-current" style={{ color: "#0891b2" }}
                            strokeWidth="4" 
                            fill="none" 
                            strokeDasharray={175} 
                            strokeDashoffset={175 - (175 * percent) / 100} 
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-sm font-bold text-white">{percent}%</span>
                 </div>
             </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, #cffafe, #67e8f9, #f0fdff)" }} />

          <div className="space-y-0">
            {week.modules.map((module, index) => {
                const status = progress[module.id];
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';
                const isActive = status === 'unlocked';
                const isLast = index === week.modules.length - 1;

                const content = (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="relative flex gap-5 lg:gap-7 group"
                  >
                    {/* Timeline node */}
                    <div className="relative z-10 flex-shrink-0 flex flex-col items-center">
                      <div className={clsx(
                        "w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-white",
                        isCompleted && "bg-[#2e7b5e] text-white shadow-lg shadow-[#cffafe]",
                        isActive && "bg-[#0891b2] text-white shadow-xl shadow-[#cffafe] scale-110",
                        isLocked && "bg-gray-100 text-gray-300 border-2 border-gray-200"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 lg:w-7 lg:h-7" />
                        ) : isActive ? (
                          <PlayCircle className="w-5 h-5 lg:w-7 lg:h-7" />
                        ) : (
                          <Lock className="w-4 h-4 lg:w-5 lg:h-5" />
                        )}
                      </div>
                      {/* Connector pulse for active */}
                      {isActive && (
                        <div className="absolute inset-0 w-12 h-12 lg:w-16 lg:h-16 rounded-full animate-ping opacity-20" style={{ background: "#0891b2" }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={clsx(
                      "flex-1 pb-10 lg:pb-14 min-w-0",
                      isLast && "pb-0"
                    )}>
                      {/* Module number + badges */}
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className={clsx(
                          "text-xs font-bold uppercase tracking-wider",
                          isActive ? "text-[#0891b2]" : isCompleted ? "text-[#2e7b5e]" : "text-gray-300"
                        )}>
                          Модуль {index + 1}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{ background: "#cffafe", color: "#0891b2" }}>
                            Текущий
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Пройден ✓
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={clsx(
                        "text-lg lg:text-2xl font-bold leading-snug mb-2 transition-colors",
                        isLocked ? "text-gray-300" : isActive ? "text-[#0891b2]" : "text-[#164e63]"
                      )}>
                        {module.title}
                      </h3>

                      {/* Description */}
                      <p className={clsx(
                        "text-sm lg:text-base leading-relaxed mb-4",
                        isLocked ? "text-gray-300" : "text-gray-500"
                      )}>
                        {module.description}
                      </p>

                      {/* Action area */}
                      {!isLocked && (
                        <div
                          className={clsx(
                            "inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200",
                            isActive
                              ? "text-white shadow-lg hover:shadow-xl active:scale-95"
                              : isCompleted
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-gray-50 text-gray-500"
                          )}
                          style={isActive ? { background: "#0891b2" } : undefined}
                        >
                          {isCompleted ? (
                            <>
                              <BookOpen className="w-4 h-4" />
                              Повторить
                            </>
                          ) : (
                            <>
                              Начать модуль
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </div>
                      )}

                      {isLocked && (
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Lock className="w-3 h-3" />
                          <span>Откроется после предыдущего модуля</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );

                if (isLocked) {
                  return (
                    <div key={module.id} className="cursor-not-allowed opacity-60">
                      {content}
                    </div>
                  );
                }

                return (
                  <Link key={module.id} to={`/module/${module.id}`} className="block">
                    {content}
                  </Link>
                );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
