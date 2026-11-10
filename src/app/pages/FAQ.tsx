
import React, { useState } from 'react';
import { faqData } from '@/data/resources';
import { HelpCircle, Search, ArrowRight, MessageCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';
import workspaceImg from 'figma:asset/c8152f807d82f1fde04f06453f73c13867b47397.png';

export function FAQ() {
  const { faqId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaq = faqData.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeItem = faqData.find(item => item.id === faqId);

  // Compact List View
  const FAQList = () => (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col space-y-6"
      >
           {/* Compact Dark Header */}
           <div className="bg-[#1E1B4B] p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden flex-shrink-0">
               <div className="absolute inset-0 bg-gradient-to-r from-[#1E1B4B] to-[#312E81]" />
               <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 mix-blend-overlay">
                   <img src={workspaceImg} alt="" className="w-full h-full object-cover" />
               </div>

               <div className="relative z-10 flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg border border-white/10">
                       <HelpCircle className="w-5 h-5 text-violet-200" />
                   </div>
                   <div>
                       <h1 className="text-xl font-bold text-white leading-none">Частые вопросы</h1>
                       <p className="text-xs text-violet-200 mt-1 opacity-80">Поиск ответов</p>
                   </div>
               </div>

               <div className="relative z-10 w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input 
                       type="text" 
                       placeholder="Найти ответ..." 
                       className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 text-white text-sm placeholder-gray-400 backdrop-blur-sm transition-all hover:bg-white/20"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                   />
               </div>
           </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 custom-scrollbar pb-4">
            {filteredFaq.length > 0 ? (
                filteredFaq.map((item) => (
                    <motion.div 
                        key={item.id}
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/resources/faq/${item.id}`)}
                        className="bg-white p-5 rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 rounded-bl-xl -mr-6 -mt-6 transition-transform group-hover:scale-125" />
                        
                        <div className="relative z-10 flex-1">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-violet-700 transition-colors pr-4">
                                {item.question}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                {item.answer}
                            </p>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end relative z-10">
                            <span className="text-violet-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Подробнее <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                    <p>Ничего не найдено</p>
                </div>
            )}
          </div>
          
          {/* Footer Call to Action */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 flex items-center justify-between shadow-lg text-white">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-lg">
                    <MessageCircle className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm">Нужна помощь ментора?</h4>
                    <p className="text-xs text-violet-100 opacity-90">Мы отвечаем в течение 24 часов</p>
                 </div>
             </div>
             <button className="bg-white text-violet-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors shadow-sm active:scale-95">
                 Написать
             </button>
          </div>
      </motion.div>
  );

  // Detail View
  const FAQDetail = () => (
    <motion.div 
      key={activeItem!.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden"
    >
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
             <button 
                onClick={() => navigate('/resources/faq')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-violet-700 transition-colors"
             >
                <ChevronLeft className="w-4 h-4" /> К вопросам
             </button>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">FAQ #{activeItem!.id}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#F8FAFC]">
             <div className="max-w-2xl mx-auto">
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-6">
                        {activeItem!.question}
                    </h1>

                    <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 text-gray-700 leading-relaxed font-medium text-base">
                        {activeItem!.answer}
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Связанные темы</h4>
                        <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">Карьера</span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">Soft Skills</span>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
    </motion.div>
  );

  return (
    <div className="h-full overflow-hidden">
        {activeItem ? <FAQDetail /> : <FAQList />}
    </div>
  );
}
