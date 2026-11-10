import React, { useState, useEffect } from 'react';
import { knowledgeBase } from '@/data/resources';
import { Search, BookOpen, Clock, ChevronRight, Hash, Filter, ChevronLeft, Bookmark, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import workspaceImg from 'figma:asset/c8152f807d82f1fde04f06453f73c13867b47397.png';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '@/lib/api';

export function KnowledgeBase() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const userId = "demo-user";

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/bookmarks/${userId}`, {
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setBookmarks(data.bookmarks || []);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setIsLoadingBookmarks(false);
      }
    };

    fetchBookmarks();
  }, []);

  const toggleBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const isBookmarked = bookmarks.includes(id);
    const action = isBookmarked ? 'remove' : 'add';
    
    // Optimistic update
    setBookmarks(prev => 
      action === 'add' ? [...prev, id] : prev.filter(bId => bId !== id)
    );

    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/bookmarks/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({ articleId: id, action })
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // Revert on error
      setBookmarks(prev => 
        action === 'add' ? prev.filter(bId => bId !== id) : [...prev, id]
      );
    }
  };

  const categories = Array.from(new Set(knowledgeBase.map(a => a.category)));

  const filteredArticles = knowledgeBase.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'Bookmarks') {
        return matchesSearch && bookmarks.includes(article.id);
    }

    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const activeArticle = knowledgeBase.find(a => a.id === articleId);

  // Compact List Layout for Knowledge Base
  const KnowledgeList = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col space-y-3"
    >
      {/* Header */}
      <div className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-3 relative overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #164e63, #0891b2)', minHeight: 72 }}>
          <div className="relative z-10 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                  <h1 className="text-base font-bold text-white leading-tight">База знаний</h1>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(207,250,254,0.7)' }}>{knowledgeBase.length} статей · PM материалы</p>
              </div>
          </div>

          <div className="relative z-10 flex gap-2 w-full md:w-auto items-center">
             <div className="relative flex-1 md:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(207,250,254,0.6)' }} />
                <input
                    type="text"
                    placeholder="Поиск статьи..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button
                onClick={() => setSelectedCategory(selectedCategory === 'Bookmarks' ? null : 'Bookmarks')}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  background: selectedCategory === 'Bookmarks' ? '#0891b2' : 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff'
                }}
                title="Закладки"
             >
                <Bookmark className={clsx("w-3.5 h-3.5", selectedCategory === 'Bookmarks' && "fill-current")} />
             </button>
          </div>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0">
        {['Все', ...categories].map(cat => {
          const active = cat === 'Все' ? !selectedCategory : selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'Все' ? null : cat)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap"
              style={{
                background: active ? '#0891b2' : '#ffffff',
                color: active ? '#ffffff' : '#374151',
                border: active ? '1px solid #0891b2' : '1px solid #cffafe',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Articles Grid - Compact & Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4 overflow-y-auto pr-1 custom-scrollbar">
         {filteredArticles.length > 0 ? (
             filteredArticles.map(article => {
                 const isBookmarked = bookmarks.includes(article.id);
                 return (
                     <motion.div
                        key={article.id}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate(`/resources/knowledge/${article.id}`)}
                        className="bg-white rounded-xl p-3.5 cursor-pointer relative group h-full flex flex-col transition-all"
                        style={{ border: '1px solid #cffafe', boxShadow: '0 1px 4px rgba(8,145,178,0.05)' }}
                        onMouseOver={e => (e.currentTarget.style.borderColor = '#0891b2')}
                        onMouseOut={e => (e.currentTarget.style.borderColor = '#cffafe')}
                     >
                        <div className="flex justify-between items-start mb-2">
                            <span className={clsx(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                article.category === 'Hard Skills' ? "bg-[#f0fdff] text-[#0891b2] border-[#cffafe]" :
                                article.category === 'Soft Skills' ? "bg-pink-50 text-pink-600 border-pink-100" :
                                article.category === 'Frameworks' ? "bg-[#cffafe]/50 text-[#0e7490] border-[#cffafe]" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {article.category}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {article.readTime}
                            </span>
                        </div>

                        <h3 className="font-semibold text-[#164e63] text-[13px] leading-snug mb-2.5 group-hover:text-[#0891b2] transition-colors line-clamp-2">
                            {article.title}
                        </h3>

                        <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f0fdff' }}>
                             <span className={clsx(
                                 "text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1",
                                 article.level === 'Junior' ? "text-[#2e7b5e] bg-[#d1fae5]" :
                                 article.level === 'Middle' ? "text-[#0891b2] bg-[#cffafe]" :
                                 "text-amber-700 bg-amber-50"
                             )}>
                                 {article.level}
                             </span>
                             <button
                                onClick={(e) => toggleBookmark(article.id, e)}
                                className={clsx(
                                    "transition-all p-1 rounded",
                                    isBookmarked ? "text-[#0891b2]" : "text-gray-300 hover:text-[#0891b2] opacity-0 group-hover:opacity-100"
                                )}
                             >
                                <Bookmark className={clsx("w-3 h-3", isBookmarked && "fill-current")} />
                             </button>
                        </div>
                     </motion.div>
                 );
             })
         ) : (
             <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-12">
                 <Bookmark className="w-12 h-12 mb-4 opacity-20" />
                 <p>{selectedCategory === 'Bookmarks' ? 'У вас пока нет закладок' : 'Ничего не найдено'}</p>
             </div>
         )}
      </div>
    </motion.div>
  );

  const ArticleDetail = () => {
      const isBookmarked = activeArticle ? bookmarks.includes(activeArticle.id) : false;
      
      return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl"
          >
             {/* Toolbar */}
             <div className="bg-white/95 backdrop-blur-md px-5 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-20" style={{ borderBottom: '1px solid #cffafe' }}>
                 <button
                    onClick={() => navigate('/resources/knowledge')}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg group"
                    style={{ color: '#9ca3af' }}
                    onMouseOver={e => { e.currentTarget.style.color = '#0891b2'; e.currentTarget.style.background = '#f0fdff'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                 >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    К списку
                 </button>
                 <button
                    onClick={() => activeArticle && toggleBookmark(activeArticle.id)}
                    className={clsx("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors")}
                    style={isBookmarked
                      ? { background: '#cffafe', color: '#0891b2' }
                      : { color: '#9ca3af' }
                    }
                 >
                     <Bookmark className={clsx("w-3.5 h-3.5", isBookmarked && "fill-current")} />
                     {isBookmarked ? "Сохранено" : "В закладки"}
                 </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="max-w-3xl mx-auto px-6 py-7">
                    {activeArticle && (
                        <>
                            {/* Article header */}
                            <div className="mb-8 p-6 rounded-2xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)' }}>
                                 <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                                 <div className="relative z-10">
                                     <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#cffafe' }}>
                                            {activeArticle.category}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#cffafe' }}>
                                            {activeArticle.level}
                                        </span>
                                     </div>
                                     <h1 className="text-xl md:text-2xl font-bold text-white leading-snug mb-4 tracking-tight">
                                        {activeArticle.title}
                                     </h1>
                                     <div className="flex items-center gap-4 text-xs pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', color: 'rgba(207,250,254,0.7)' }}>
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>PM Simulator</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{activeArticle.readTime} чтения</span>
                                        </div>
                                     </div>
                                 </div>
                            </div>
                            
                            <div className="article-content" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-8 mb-3" style={{ color: '#164e63' }} {...props} />,
                                        h2: ({node, ...props}) => (
                                            <div className="mt-8 mb-3">
                                                <h2 className="text-base font-bold" style={{ color: '#164e63' }} {...props} />
                                                <div className="h-0.5 w-10 mt-2 rounded-full" style={{ background: '#0891b2' }} />
                                            </div>
                                        ),
                                        h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-5 mb-2" style={{ color: '#0e7490' }} {...props} />,
                                        p: ({node, ...props}) => <p className="text-sm leading-6 mb-3.5 font-normal" style={{ color: '#374151' }} {...props} />,
                                        ul: ({node, ...props}) => <ul className="my-4 space-y-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="my-4 space-y-2 list-decimal pl-5" {...props} />,
                                        li: ({node, ...props}) => (
                                            <li className="flex gap-2.5 text-sm leading-relaxed" style={{ color: '#374151' }}>
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#0891b2' }} />
                                                <span>{props.children}</span>
                                            </li>
                                        ),
                                        blockquote: ({node, ...props}) => (
                                            <blockquote className="border-l-4 px-4 py-3 rounded-r-xl my-5 text-sm font-medium italic" style={{ borderColor: '#0891b2', background: '#f0fdff', color: '#164e63' }} {...props} />
                                        ),
                                        code: ({node, className, ...props}) => className
                                          ? <code className="block bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[12px] font-mono overflow-x-auto my-4 leading-relaxed" style={{ color: '#0e7490' }} {...props} />
                                          : <code className="px-1.5 py-0.5 rounded text-[12px] font-mono" style={{ background: '#f0fdff', color: '#0891b2' }} {...props} />,
                                        pre: ({node, ...props}) => <pre className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 overflow-x-auto my-4" {...props} />,
                                        a: ({node, ...props}) => <a className="font-medium underline underline-offset-2 transition-colors" style={{ color: '#0891b2' }} {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-semibold" style={{ color: '#164e63' }} {...props} />,
                                        table: ({node, ...props}) => (
                                            <div className="overflow-x-auto my-5 rounded-xl border" style={{ borderColor: '#cffafe' }}>
                                                <table className="min-w-full divide-y" style={{ borderColor: '#cffafe' }} {...props} />
                                            </div>
                                        ),
                                        thead: ({node, ...props}) => <thead style={{ background: '#f0fdff' }} {...props} />,
                                        th: ({node, ...props}) => <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0891b2' }} {...props} />,
                                        td: ({node, ...props}) => <td className="px-4 py-2.5 text-sm border-t" style={{ color: '#374151', borderColor: '#cffafe' }} {...props} />,
                                        hr: ({node, ...props}) => <hr className="my-6" style={{ borderColor: '#cffafe' }} {...props} />,
                                    }}
                                >
                                    {activeArticle.content}
                                </ReactMarkdown>
                            </div>
                        </>
                    )}
                </div>
             </div>
          </motion.div>
      );
  };

  return (
    <div className="h-full overflow-hidden">
        {activeArticle ? <ArticleDetail /> : <KnowledgeList />}
    </div>
  );
}