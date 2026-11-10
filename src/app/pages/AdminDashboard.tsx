import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock, User, Mail, Search, RefreshCw, Filter, Lock, Unlock, Eye, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2, FileText, Paperclip, Download, BarChart, TrendingUp, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { courseData } from '@/data/course';
import { fetchWithRetry } from '@/lib/fetch';
import { projectId } from '/utils/supabase/info';

interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  date: string;
  time: string;
  createdAt: string;
  status: string;
}

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

interface UserDetails {
  progress: Record<string, 'locked' | 'unlocked' | 'completed'>;
  answers: Record<string, any>;
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Auth Check
  // Вход админа: настоящий вход Supabase, права проверяет сервер (секрет ADMIN_EMAILS).
  const openAdmin = async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const res = await fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/admin/users`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!res.ok) return false;
    const data = await res.json();
    setUsers(data.users || []);
    setIsAuthenticated(true);
    fetchBookings();
    return true;
  };

  useEffect(() => { openAdmin().catch(() => {}); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { toast.error('Неверный email или пароль'); return; }
    if (await openAdmin()) toast.success('Добро пожаловать, администратор!');
    else toast.error('У этого аккаунта нет прав администратора');
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!projectId) return;
        const response = await fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/admin/users`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        if (response && response.ok) {
            const data = await response.json();
            setUsers(data.users || []);
        }
    } catch (e) {
        console.error("Error fetching users", e);
    } finally {
        setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!projectId) return;
      const response = await fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/bookings`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (response && response.ok) {
        const data = await response.json();
        const bookingList = (data.bookings || []) as Booking[];
        bookingList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(bookingList);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUserDetails = async (userId: string) => {
      if (userDetails[userId]) return; // Cache hit
      
      setLoadingDetails(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!projectId) return;
        const response = await fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/admin/user-details/${userId}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        if (response && response.ok) {
            const data = await response.json();
            setUserDetails(prev => ({ ...prev, [userId]: data }));
        }
      } catch (e) {
          console.error("Error fetching details", e);
      } finally {
          setLoadingDetails(false);
      }
  };

  const toggleUserExpanded = (userId: string) => {
      if (expandedUserId === userId) {
          setExpandedUserId(null);
      } else {
          setExpandedUserId(userId);
          fetchUserDetails(userId);
      }
  };

  const updateModuleStatus = async (userId: string, moduleId: string, status: 'locked' | 'unlocked' | 'completed') => {
      const currentDetails = userDetails[userId];
      if (!currentDetails) return;

      const newProgress = { ...currentDetails.progress, [moduleId]: status };
      
      // Optimistic update
      setUserDetails(prev => ({
          ...prev,
          [userId]: { ...prev[userId], progress: newProgress }
      }));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!projectId) return;
        await fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/progress/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ progress: newProgress })
        });
        toast.success(`Статус обновлен: ${status}`);
      } catch (e) {
          console.error("Error updating progress", e);
          toast.error("Ошибка обновления");
      }
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastSignIn && lastSignIn > weekAgo;
    }).length;

    const totalModules = courseData.flatMap(w => w.modules).length;
    
    // Calculate average completion
    let totalCompletion = 0;
    let usersWithData = 0;
    Object.values(userDetails).forEach(details => {
      if (details.progress) {
        const completed = Object.values(details.progress).filter(s => s === 'completed').length;
        totalCompletion += (completed / totalModules) * 100;
        usersWithData++;
      }
    });
    const avgCompletion = usersWithData > 0 ? Math.round(totalCompletion / usersWithData) : 0;

    const totalAnswers = Object.values(userDetails).reduce((acc, details) => {
      return acc + (details.answers ? Object.keys(details.answers).length : 0);
    }, 0);

    return { totalUsers, activeUsers, avgCompletion, totalAnswers };
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    if (filterStatus === 'active') {
      return matchesSearch && lastSignIn && lastSignIn > weekAgo;
    } else {
      return matchesSearch && (!lastSignIn || lastSignIn <= weekAgo);
    }
  });

  const stats = getStatistics();

  if (!isAuthenticated) {
      return (
          <div className="flex h-[80vh] items-center justify-center">
              <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Панель администратора</h2>
                  <p className="text-gray-500 text-center mb-6 text-sm">Введите пароль для доступа</p>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-violet-500 outline-none"
                    autoFocus
                  />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                      Войти в систему
                  </button>
              </form>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Панель администратора</h1>
            <p className="text-gray-500 mt-1">Управление пользователями и мониторинг прогресса</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchUsers(); fetchBookings(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <button 
                  onClick={() => setActiveTab('overview')}
                  className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                      activeTab === 'overview' ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"
                  )}
              >
                  <BarChart className="w-4 h-4" />
                  Обзор
              </button>
              <button 
                  onClick={() => setActiveTab('users')}
                  className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                      activeTab === 'users' ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-50"
                  )}
              >
                  <Users className="w-4 h-4" />
                  Участники
              </button>
              <button 
                  onClick={() => setActiveTab('bookings')}
                  className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                      activeTab === 'bookings' ? "bg-fuchsia-100 text-fuchsia-700" : "text-gray-500 hover:bg-gray-50"
                  )}
              >
                  <Calendar className="w-4 h-4" />
                  Записи
                  {bookings.length > 0 && (
                    <span className="bg-fuchsia-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {bookings.length}
                    </span>
                  )}
              </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.totalUsers}</h3>
              <p className="text-violet-100 text-sm font-medium">Всего пользователей</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.activeUsers}</h3>
              <p className="text-green-100 text-sm font-medium">Активных за неделю</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-fuchsia-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Award className="w-6 h-6" />
                </div>
                <BarChart className="w-5 h-5 opacity-70" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.avgCompletion}%</h3>
              <p className="text-fuchsia-100 text-sm font-medium">Средний прогресс</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.totalAnswers}</h3>
              <p className="text-indigo-100 text-sm font-medium">Сданных заданий</p>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Последняя активность
            </h3>
            <div className="space-y-3">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Зарегистрирован {format(new Date(user.created_at), 'dd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Последний вход</p>
                    <p className="text-xs font-medium text-gray-700">
                      {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd MMM HH:mm', { locale: ru }) : 'Никогда'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
          <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по email..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={clsx(
                      "px-4 py-3 rounded-xl font-medium text-sm transition-all",
                      filterStatus === 'all' ? "bg-violet-100 text-violet-700 border-2 border-violet-500" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={clsx(
                      "px-4 py-3 rounded-xl font-medium text-sm transition-all",
                      filterStatus === 'active' ? "bg-green-100 text-green-700 border-2 border-green-500" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    Активные
                  </button>
                  <button
                    onClick={() => setFilterStatus('inactive')}
                    className={clsx(
                      "px-4 py-3 rounded-xl font-medium text-sm transition-all",
                      filterStatus === 'inactive' ? "bg-gray-100 text-gray-700 border-2 border-gray-400" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    Неактивные
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <div className="col-span-4">Email</div>
                      <div className="col-span-3">Дата регистрации</div>
                      <div className="col-span-3">Последний вход</div>
                      <div className="col-span-2 text-right">Действия</div>
                  </div>
                  
                  {loading ? (
                      <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Загрузка пользователей...
                      </div>
                  ) : filteredUsers.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        {searchQuery ? 'Пользователи не найдены' : 'Пользователей пока нет'}
                      </div>
                  ) : filteredUsers.map(user => (
                      <div key={user.id} className="border-b border-gray-100 last:border-0">
                          <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                              <div className="col-span-4 font-medium text-gray-900 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs">
                                      {user.email?.[0].toUpperCase()}
                                  </div>
                                  <span className="truncate">{user.email}</span>
                              </div>
                              <div className="col-span-3 text-sm text-gray-500">
                                  {format(new Date(user.created_at), 'dd MMM yyyy', { locale: ru })}
                              </div>
                              <div className="col-span-3 text-sm text-gray-500">
                                  {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd MMM HH:mm', { locale: ru }) : '-'}
                              </div>
                              <div className="col-span-2 text-right">
                                  <button 
                                    onClick={() => toggleUserExpanded(user.id)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                                  >
                                      {expandedUserId === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                              </div>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                              {expandedUserId === user.id && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-gray-50/50 border-t border-gray-100 overflow-hidden"
                                  >
                                      <div className="p-6">
                                          {loadingDetails && !userDetails[user.id] ? (
                                              <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-violet-500"/>
                                                <p className="text-sm">Загрузка данных пользователя...</p>
                                              </div>
                                          ) : (
                                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                  {/* Progress Management */}
                                                  <div>
                                                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                          <Lock className="w-4 h-4 text-gray-400" />
                                                          Управление доступом к модулям
                                                      </h4>
                                                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                                          {courseData.flatMap(w => w.modules).map(module => {
                                                              const status = userDetails[user.id]?.progress[module.id] || 'locked';
                                                              return (
                                                                  <div key={module.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                                      <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{module.title}</span>
                                                                      <div className="flex items-center gap-1">
                                                                          <button 
                                                                            onClick={() => updateModuleStatus(user.id, module.id, 'locked')}
                                                                            className={clsx("p-1.5 rounded hover:bg-gray-100 transition-colors", status === 'locked' ? "text-red-500 bg-red-50" : "text-gray-300")}
                                                                            title="Заблокировать"
                                                                          >
                                                                              <Lock className="w-3.5 h-3.5" />
                                                                          </button>
                                                                          <button 
                                                                            onClick={() => updateModuleStatus(user.id, module.id, 'unlocked')}
                                                                            className={clsx("p-1.5 rounded hover:bg-gray-100 transition-colors", status === 'unlocked' ? "text-blue-500 bg-blue-50" : "text-gray-300")}
                                                                            title="Открыть"
                                                                          >
                                                                              <Unlock className="w-3.5 h-3.5" />
                                                                          </button>
                                                                          <button 
                                                                            onClick={() => updateModuleStatus(user.id, module.id, 'completed')}
                                                                            className={clsx("p-1.5 rounded hover:bg-gray-100 transition-colors", status === 'completed' ? "text-green-500 bg-green-50" : "text-gray-300")}
                                                                            title="Завершить"
                                                                          >
                                                                              <CheckCircle className="w-3.5 h-3.5" />
                                                                          </button>
                                                                      </div>
                                                                  </div>
                                                              );
                                                          })}
                                                      </div>
                                                  </div>

                                                  {/* Answers */}
                                                  <div>
                                                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                          <FileText className="w-4 h-4 text-gray-400" />
                                                          Ответы на задания
                                                      </h4>
                                                      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                                          {userDetails[user.id]?.answers && Object.entries(userDetails[user.id].answers).length > 0 ? (
                                                              Object.entries(userDetails[user.id].answers).map(([key, value]) => {
                                                                  let text = '';
                                                                  let attachments: any[] = [];
                                                                  
                                                                  if (typeof value === 'string') {
                                                                      text = value;
                                                                  } else if (value && typeof value === 'object') {
                                                                      text = value.text || '';
                                                                      attachments = value.attachments || [];
                                                                  }

                                                                  // Find module name
                                                                  const module = courseData.flatMap(w => w.modules).find(m => m.id === key);

                                                                  return (
                                                                      <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                                          <div className="flex items-start justify-between mb-2">
                                                                            <p className="text-xs font-bold text-violet-600">{module?.title || key}</p>
                                                                            <span className="text-xs text-gray-400">ID: {key}</span>
                                                                          </div>
                                                                          <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2 max-h-32 overflow-y-auto">{text}</p>
                                                                          
                                                                          {attachments.length > 0 && (
                                                                              <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
                                                                                  <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                                                                      <Paperclip className="w-3 h-3" /> Вложения ({attachments.length})
                                                                                  </p>
                                                                                  <div className="grid grid-cols-1 gap-1">
                                                                                      {attachments.map((att: any, i: number) => (
                                                                                          <a 
                                                                                              key={i} 
                                                                                              href={att.url} 
                                                                                              target="_blank" 
                                                                                              rel="noopener noreferrer"
                                                                                              className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-violet-50 rounded text-xs text-gray-700 hover:text-violet-700 transition-colors group border border-gray-100"
                                                                                          >
                                                                                              <div className="bg-white p-1 rounded border border-gray-100 text-gray-400">
                                                                                                  {att.type === 'image' ? <Eye className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                                                                                              </div>
                                                                                              <span className="truncate flex-1">{att.name}</span>
                                                                                              <Download className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                                                                          </a>
                                                                                      ))}
                                                                                  </div>
                                                                              </div>
                                                                          )}
                                                                      </div>
                                                                  );
                                                              })
                                                          ) : (
                                                              <div className="text-center py-8 text-gray-400">
                                                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                                <p className="text-sm italic">Пользователь еще не отправил ответов</p>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-4">Студент</div>
                <div className="col-span-3">Дата встречи</div>
                <div className="col-span-3">Время</div>
                <div className="col-span-2 text-right">Создано</div>
            </div>
            {bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Записей пока нет</p>
                  <p className="text-sm mt-1">Записи на встречи появятся здесь</p>
                </div>
            ) : bookings.map((booking) => (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={booking.id} 
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                    <div className="col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs">
                            {booking.userEmail[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 truncate">{booking.userEmail}</p>
                        </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                            {format(new Date(booking.date), 'd MMMM yyyy', { locale: ru })}
                        </span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-100 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {booking.time}
                        </div>
                    </div>
                    <div className="col-span-2 text-right text-xs text-gray-400">
                        {format(new Date(booking.createdAt), 'dd.MM HH:mm')}
                    </div>
                </motion.div>
            ))}
          </div>
      )}
    </div>
  );
}