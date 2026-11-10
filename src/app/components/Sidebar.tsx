import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { courseData } from '@/data/course';
import { Book, CheckCircle, LayoutDashboard, Briefcase, HelpCircle, ChevronDown, ChevronRight, FileText, User, Sparkles, MessageCircle, X, PlayCircle, Car, Pizza, Search, Mail } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { knowledgeBase, faqData } from '@/data/resources';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  progress: Record<string, 'locked' | 'unlocked' | 'completed'>;
  onClose?: () => void;
}

export function Sidebar({ progress, onClose }: SidebarProps) {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  useEffect(() => { onClose?.(); }, [location.pathname]);

  const getWeekStatus = (weekModules: any[]) => {
    const completed = weekModules.filter(m => progress[m.id] === 'completed').length;
    return Math.round((completed / weekModules.length) * 100);
  };

  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isSimulatorsOpen, setIsSimulatorsOpen] = useState(true);

  useEffect(() => {
    if (location.pathname.includes('/resources/knowledge')) setIsKnowledgeOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes('/resources/faq')) setIsFAQOpen(true);
  }, [location.pathname]);

  // #164E63 bg, #0E7490 active, #67E8F9 accent, #CFFAFE light text
  const navActive = "bg-[#0e7490]/60 ring-1 ring-[#67e8f9]/20 text-[#cffafe] shadow-sm";
  const navIdle   = "text-[#cffafe]/60 hover:text-[#cffafe] hover:bg-[#0e7490]/40";
  const subActive = "border-[#67e8f9] text-[#67e8f9] bg-[#0e7490]/30";
  const subIdle   = "border-transparent text-[#cffafe]/50 hover:text-[#cffafe] hover:bg-[#0e7490]/20";

  return (
    <div
      className="w-72 border-r h-full flex flex-col shadow-2xl flex-shrink-0 relative overflow-hidden"
      style={{ background: "#164e63", borderColor: "rgba(103,232,249,0.12)" }}
    >
      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(103,232,249,0.06) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Header */}
      <div className="p-5 relative z-10 flex justify-between items-center" style={{ borderBottom: "1px solid rgba(103,232,249,0.12)" }}>
        <h1 className="text-lg font-extrabold flex items-center gap-3" style={{ color: "#f0fdff" }}>
          <div className="p-2 rounded-lg shadow-lg" style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)" }}>
            <Book className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          PM Simulator
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: "#67e8f9" }}
          onMouseOver={e => (e.currentTarget.style.background = "rgba(14,116,144,0.4)")}
          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-5 relative z-10 custom-scrollbar">

        {/* Main Links */}
        <div className="space-y-1">
          <NavLink to="/" className={({ isActive }) => clsx("flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm group", isActive && location.pathname === "/" ? navActive : navIdle)}>
            <LayoutDashboard strokeWidth={2.5} className="w-4 h-4" style={{ color: location.pathname === "/" ? "#67e8f9" : undefined }} />
            Дашборд
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => clsx("flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm group", isActive ? navActive : navIdle)}>
            <User strokeWidth={2.5} className="w-4 h-4" style={{ color: location.pathname === "/profile" ? "#67e8f9" : undefined }} />
            Личный кабинет
          </NavLink>

          {/* Simulators Accordion */}
          <div className="rounded-xl overflow-hidden mt-1">
            <button
              onClick={() => setIsSimulatorsOpen(!isSimulatorsOpen)}
              className={clsx("w-full flex items-center justify-between px-4 py-2.5 transition-all font-semibold text-sm group rounded-xl", location.pathname.includes('/simulator') ? navActive : navIdle)}
            >
              <div className="flex items-center gap-3">
                <PlayCircle strokeWidth={2.5} className="w-4 h-4" style={{ color: location.pathname.includes('/simulator') ? "#67e8f9" : undefined }} />
                <span>Симуляторы</span>
              </div>
              {isSimulatorsOpen
                ? <ChevronDown strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#67e8f9", opacity: 0.6 }} />
                : <ChevronRight strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#67e8f9", opacity: 0.6 }} />}
            </button>
            <AnimatePresence>
              {isSimulatorsOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pl-4 pr-2 py-1.5 space-y-0.5">
                    {[
                      { to: "/simulator/fintech",    icon: Briefcase, label: "FinTech (Start)" },
                      { to: "/simulator/taxi",       icon: Car,       label: "Taxi Aggregator" },
                      { to: "/simulator/food",       icon: Pizza,     label: "Food Delivery" },
                      { to: "/simulator/discovery",  icon: Search,    label: "Discovery Skills" },
                      { to: "/simulator/gp/course",  icon: LayoutDashboard, label: "PM Simulator (New)" },
                    ].map(({ to, icon: Icon, label }) => (
                      <NavLink key={to} to={to} className={({ isActive }) => clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-l-2", isActive ? subActive : subIdle)}>
                        <Icon strokeWidth={2.5} className="w-3 h-3" />{label}
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Resources */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#67e8f9", opacity: 0.6 }}>Ресурсы</p>

          {/* Knowledge Base */}
          <div className="rounded-xl overflow-hidden">
            <button onClick={() => setIsKnowledgeOpen(!isKnowledgeOpen)} className={clsx("w-full flex items-center justify-between px-4 py-2.5 transition-all font-semibold text-sm group rounded-xl", location.pathname.includes('/resources/knowledge') ? navActive : navIdle)}>
              <div className="flex items-center gap-3">
                <Book strokeWidth={2.5} className="w-4 h-4" style={{ color: location.pathname.includes('/resources/knowledge') ? "#67e8f9" : undefined }} />
                <span>База знаний</span>
              </div>
              {isKnowledgeOpen ? <ChevronDown strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#67e8f9", opacity: 0.5 }} /> : <ChevronRight strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#67e8f9", opacity: 0.5 }} />}
            </button>
            <AnimatePresence>
              {isKnowledgeOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pl-4 pr-2 py-1.5 space-y-0.5">
                    <NavLink to="/resources/knowledge" end className={({ isActive }) => clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-l-2", isActive ? subActive : subIdle)}>
                      <LayoutDashboard strokeWidth={2.5} className="w-3 h-3" /> Все статьи
                    </NavLink>
                    {knowledgeBase.map(article => (
                      <NavLink key={article.id} to={`/resources/knowledge/${article.id}`} className={({ isActive }) => clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-l-2", isActive ? subActive : subIdle)}>
                        <FileText strokeWidth={2.5} className="w-3 h-3" /><span className="truncate">{article.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAQ */}
          <div className="rounded-xl overflow-hidden">
            <button onClick={() => setIsFAQOpen(!isFAQOpen)} className={clsx("w-full flex items-center justify-between px-4 py-2.5 transition-all font-semibold text-sm group rounded-xl", location.pathname.includes('/resources/faq') ? navActive : navIdle)}>
              <div className="flex items-center gap-3">
                <HelpCircle strokeWidth={2.5} className="w-4 h-4" style={{ color: location.pathname.includes('/resources/faq') ? "#67e8f9" : undefined }} />
                <span>FAQ</span>
              </div>
              {isFAQOpen ? <ChevronDown strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#67e8f9", opacity: 0.5 }} /> : <ChevronRight strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#67e8f9", opacity: 0.5 }} />}
            </button>
            <AnimatePresence>
              {isFAQOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pl-4 pr-2 py-1.5 space-y-0.5">
                    <NavLink to="/resources/faq" end className={({ isActive }) => clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-l-2", isActive ? subActive : subIdle)}>
                      <LayoutDashboard strokeWidth={2.5} className="w-3 h-3" /> Все вопросы
                    </NavLink>
                    {faqData.map(item => (
                      <NavLink key={item.id} to={`/resources/faq/${item.id}`} className={({ isActive }) => clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-l-2", isActive ? subActive : subIdle)}>
                        <HelpCircle strokeWidth={2.5} className="w-3 h-3" /><span className="truncate">{item.question}</span>
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink to="/resources/case-practice" className={({ isActive }) => clsx("w-full flex items-center gap-3 px-4 py-2.5 transition-all font-semibold text-sm group rounded-xl", isActive || location.pathname.includes('/resources/cases') ? navActive : navIdle)}>
            <Briefcase strokeWidth={2.5} className="w-4 h-4" style={{ color: location.pathname.includes('/resources/case') ? "#67e8f9" : undefined }} />
            <span>Кейс-практика</span>
          </NavLink>
        </div>

        {/* Useful Chats */}
        <div className="space-y-1 pt-3" style={{ borderTop: "1px solid rgba(103,232,249,0.1)" }}>
          <p className="px-4 text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#67e8f9", opacity: 0.6 }}>Полезные чаты</p>
          {[
            { href: "https://t.me/Analytic_Insights", label: "Analytic Insights" },
            { href: "https://t.me/secretux",          label: "Secret UX" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={clsx("flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm", navIdle)}>
              <div className="p-1.5 rounded-lg transition-colors" style={{ background: "rgba(14,116,144,0.4)", color: "#67e8f9" }}>
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              {label}
            </a>
          ))}
        </div>

        {/* Course Weeks */}
        <div className="space-y-2 pt-3" style={{ borderTop: "1px solid rgba(103,232,249,0.1)" }}>
          <p className="px-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "#67e8f9", opacity: 0.6 }}>Программа</p>
          {courseData.map((week) => {
            const percent = getWeekStatus(week.modules);
            return (
              <div key={week.id} className="relative group">
                <NavLink
                  to={`/week/${week.id}`}
                  className={({ isActive }) => clsx(
                    "flex flex-col gap-1.5 px-4 py-3 rounded-xl transition-all border",
                    isActive
                      ? "shadow-md"
                      : "border-transparent"
                  )}
                  style={({ isActive }) => isActive
                    ? { background: "rgba(14,116,144,0.5)", borderColor: "rgba(103,232,249,0.2)" }
                    : { background: "rgba(14,116,144,0.15)" }
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg" style={{ background: "rgba(8,145,178,0.3)", color: percent === 100 ? "#67e8f9" : isActive ? "#67e8f9" : "#cffafe80" }}>
                            <week.icon strokeWidth={2.5} className="w-3 h-3" />
                          </div>
                          <span className="font-semibold text-xs" style={{ color: isActive ? "#f0fdff" : "#cffafe80" }}>
                            Неделя {week.id}
                          </span>
                        </div>
                        {percent === 100
                          ? <CheckCircle strokeWidth={2.5} className="w-3 h-3" style={{ color: "#2e7b5e" }} />
                          : <span className="text-[10px] font-bold" style={{ color: "#67e8f9", opacity: 0.6 }}>{percent}%</span>}
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(103,232,249,0.1)" }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${percent}%`, background: percent === 100 ? "#2e7b5e" : "linear-gradient(90deg, #0891b2, #67e8f9)" }}
                        />
                      </div>
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 relative z-10 space-y-3" style={{ borderTop: "1px solid rgba(103,232,249,0.1)", background: "rgba(8,145,178,0.15)" }}>
        {userEmail && (
          <div className="rounded-xl p-3" style={{ background: "rgba(14,116,144,0.4)", border: "1px solid rgba(103,232,249,0.12)" }}>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#67e8f9" }} />
              <p className="text-xs font-medium truncate" style={{ color: "#cffafe" }}>{userEmail}</p>
            </div>
          </div>
        )}
        <div className="rounded-xl p-4 text-white shadow-lg relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)" }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: "rgba(255,255,255,0.1)", transform: "translate(50%,-50%)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles strokeWidth={2.5} className="w-3.5 h-3.5" style={{ color: "#cffafe" }} />
              <p className="text-sm font-bold">Продолжай!</p>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: "rgba(207,250,254,0.8)" }}>Регулярность — ключ к успеху. Ты отлично справляешься!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
