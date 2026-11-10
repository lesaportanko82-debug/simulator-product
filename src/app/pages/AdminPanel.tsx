import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SERVER_URL } from '@/lib/api';
import { loginToEmail } from '@/lib/login';
import { BarChart3, Users, Gift, LogOut, RefreshCw, Lock, Search, Ban, Trash2, KeyRound, Crown } from 'lucide-react';

/**
 * Админ-панель /admin. Вход по одному паролю (секрет ADMIN_PASSWORD в Supabase).
 * Пароль хранится только в sessionStorage вкладки и уходит в заголовке X-Admin-Password.
 */

const PW_KEY = 'pm-sim-admin-pw';
const PLAN_LABEL: Record<string, string> = { trial: 'Пробный', month: 'Месяц', lifetime: 'Навсегда', free: 'Нет доступа' };

type AdminUser = {
  id: string; email: string; login: string | null; name: string | null;
  created_at: string; last_sign_in_at: string | null; blocked: boolean;
  plan: string | null; status: string | null; expires_at: string | null;
  active_access: boolean; own: boolean;
};

type Grant = {
  at: string; login: string; email: string; user_id: string; plan: string;
  term: string; expires_at: string | null; note: string; created: boolean;
};

function getPw(): string {
  try { return sessionStorage.getItem(PW_KEY) || ''; } catch { return ''; }
}

async function api(path: string, opts: RequestInit = {}, pw = getPw()) {
  const res = await fetch(`${SERVER_URL}/admin${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Password': pw, ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.error || `Ошибка ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('ru-RU') : '—');
const card = 'bg-white rounded-2xl border border-slate-200 shadow-sm';
const btn = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-50';

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<'stats' | 'users' | 'grants'>('stats');

  const tryLogin = useCallback(async (pw: string) => {
    await api('/stats', {}, pw);
    try { sessionStorage.setItem(PW_KEY, pw); } catch { /* приватный режим */ }
    setAuthed(true);
  }, []);

  useEffect(() => {
    const pw = getPw();
    if (!pw) { setChecking(false); return; }
    tryLogin(pw).catch(() => { try { sessionStorage.removeItem(PW_KEY); } catch { /* */ } }).finally(() => setChecking(false));
  }, [tryLogin]);

  const logout = () => { try { sessionStorage.removeItem(PW_KEY); } catch { /* */ } setAuthed(false); };

  if (checking) return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка…</div>;
  if (!authed) return <AdminLogin onLogin={tryLogin} />;

  const tabs = [
    { id: 'stats' as const, label: 'Статистика', icon: BarChart3 },
    { id: 'users' as const, label: 'Пользователи', icon: Users },
    { id: 'grants' as const, label: 'Доступы без оплаты', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-slate-900">Админ-панель · Симулятор PM</div>
          <button onClick={logout} className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50`}><LogOut className="w-3.5 h-3.5" />Выйти</button>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px ${tab === t.id ? 'border-cyan-600 text-cyan-700 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'stats' && <StatsTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'grants' && <GrantsTab />}
      </main>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (pw: string) => Promise<void> }) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onLogin(pw); } catch (err: any) { toast.error(err.message || 'Не удалось войти'); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className={`${card} w-full max-w-sm p-6 space-y-4`}>
        <div className="flex items-center gap-2 text-slate-900 font-bold"><Lock className="w-5 h-5 text-cyan-600" />Вход в админ-панель</div>
        <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Пароль администратора"
          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <button disabled={loading || pw.length < 8} className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-medium disabled:opacity-50">
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
        <p className="text-xs text-slate-400">После 8 неверных попыток вход блокируется на 15 минут.</p>
      </form>
    </div>
  );
}

function StatsTab() {
  const [s, setS] = useState<any>(null);
  const load = useCallback(() => { api('/stats').then(setS).catch((e) => toast.error(e.message)); }, []);
  useEffect(load, [load]);
  if (!s) return <div className="text-slate-500 text-sm">Загрузка…</div>;
  const items = [
    ['Всего пользователей', s.total_users],
    ['Платных (месяц + навсегда)', s.paid_total],
    ['Тариф «Месяц»', s.paid_by_plan.month],
    ['Тариф «Навсегда»', s.paid_by_plan.lifetime],
    ['Активный пробный', s.paid_by_plan.trial],
    ['Активных за месяц', s.active_month],
    ['Новых за неделю', s.new_week],
    ['Заблокировано', s.blocked],
    ['С сохранённым прогрессом', s.users_with_progress],
    ['Ответов на кейсы', s.case_answers],
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={load} className={`${btn} border-slate-200 bg-white text-slate-600`}><RefreshCw className="w-3.5 h-3.5" />Обновить</button></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map(([label, value]) => (
          <div key={label as string} className={`${card} p-4`}>
            <div className="text-2xl font-bold text-slate-900">{value as number}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState('');
  const [ownOnly, setOwnOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    api(`/users${ownOnly ? '?own=1' : ''}`).then((d) => setUsers(d.users)).catch((e) => toast.error(e.message));
  }, [ownOnly]);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!users) return [];
    if (!v) return users;
    return users.filter((u) => [u.email, u.login, u.name].some((x) => x && x.toLowerCase().includes(v)));
  }, [users, q]);

  const act = async (id: string, fn: () => Promise<any>, ok: string) => {
    setBusy(id);
    try { await fn(); toast.success(ok); load(); } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по email, логину, имени"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={ownOnly} onChange={(e) => setOwnOnly(e.target.checked)} />
          только с доступом к симулятору
        </label>
        <button onClick={load} className={`${btn} border-slate-200 bg-white text-slate-600`}><RefreshCw className="w-3.5 h-3.5" />Обновить</button>
      </div>

      {!users ? <div className="text-slate-500 text-sm">Загрузка…</div> : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 border-b border-slate-200">
              <tr><th className="p-3">Пользователь</th><th className="p-3">Тариф</th><th className="p-3">До</th><th className="p-3">Регистрация</th><th className="p-3">Последний вход</th><th className="p-3">Действия</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 align-top">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{u.login || u.email}</div>
                    {u.login && <div className="text-xs text-slate-400">{u.email}</div>}
                    {u.blocked && <span className="text-xs text-red-600 font-medium">заблокирован</span>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.active_access ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.plan ? PLAN_LABEL[u.plan] || u.plan : 'Нет доступа'}{u.plan && !u.active_access ? ' (истёк)' : ''}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{u.plan && u.plan !== 'free' ? (u.expires_at ? fmtDate(u.expires_at) : 'бессрочно') : '—'}</td>
                  <td className="p-3 text-slate-600">{fmtDate(u.created_at)}</td>
                  <td className="p-3 text-slate-600">{fmtDate(u.last_sign_in_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button disabled={busy === u.id} onClick={() => setEditing(u)} className={`${btn} border-slate-200 text-slate-700 hover:bg-slate-50`}><Crown className="w-3.5 h-3.5" />Тариф / вход</button>
                      <button disabled={busy === u.id}
                        onClick={() => act(u.id, () => api(`/users/${u.id}/block`, { method: 'POST', body: JSON.stringify({ blocked: !u.blocked }) }), u.blocked ? 'Разблокирован' : 'Заблокирован')}
                        className={`${btn} border-amber-200 text-amber-700 hover:bg-amber-50`}><Ban className="w-3.5 h-3.5" />{u.blocked ? 'Разблокировать' : 'Заблокировать'}</button>
                      <button disabled={busy === u.id}
                        onClick={() => { if (confirm(`Удалить ${u.login || u.email} без возможности восстановления?`)) act(u.id, () => api(`/users/${u.id}`, { method: 'DELETE' }), 'Удалён'); }}
                        className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}><Trash2 className="w-3.5 h-3.5" />Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Никого не найдено</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [plan, setPlan] = useState(user.plan && user.plan !== 'free' ? user.plan : 'month');
  const [term, setTerm] = useState<'30d' | 'forever'>('30d');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const saveTier = async () => {
    setSaving(true);
    try { await api(`/user-tier/${user.id}`, { method: 'POST', body: JSON.stringify({ plan, term }) }); toast.success('Тариф обновлён'); onSaved(); }
    catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const saveCreds = async () => {
    if (!login && !password) { toast.error('Укажите новый логин/email или пароль'); return; }
    if (password && password.length < 6) { toast.error('Пароль — минимум 6 символов'); return; }
    setSaving(true);
    try { await api(`/users/${user.id}/credentials`, { method: 'POST', body: JSON.stringify({ login: login || undefined, password: password || undefined }) }); toast.success('Данные входа обновлены'); onSaved(); }
    catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const input = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm';
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className={`${card} w-full max-w-md p-5 space-y-5`} onClick={(e) => e.stopPropagation()}>
        <div className="font-semibold text-slate-900">{user.login || user.email}</div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Тариф</div>
          <div className="flex gap-2">
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className={input}>
              <option value="month">Месяц</option><option value="lifetime">Навсегда</option><option value="trial">Пробный</option><option value="none">Забрать доступ</option>
            </select>
            {plan !== 'none' && (
              <select value={term} onChange={(e) => setTerm(e.target.value as any)} className={input}>
                <option value="30d">30 дней</option><option value="forever">Бессрочно</option>
              </select>
            )}
          </div>
          <button disabled={saving} onClick={saveTier} className="w-full py-2 rounded-lg bg-cyan-600 text-white text-sm disabled:opacity-50">Сохранить тариф</button>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><KeyRound className="w-4 h-4" />Логин/email и пароль</div>
          <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Новый логин или email (пусто — не менять)" className={input} />
          {login && <div className="text-xs text-slate-400">Будет входить как: {login.includes('@') ? login.trim().toLowerCase() : `${login.trim()} (логин)`}</div>}
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Новый пароль (пусто — не менять)" className={input} />
          <button disabled={saving} onClick={saveCreds} className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-50">Сохранить данные входа</button>
        </div>

        <button onClick={onClose} className="w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600">Закрыть</button>
      </div>
    </div>
  );
}

function GrantsTab() {
  const [grants, setGrants] = useState<Grant[] | null>(null);
  const [form, setForm] = useState({ login: '', password: '', plan: 'month', term: '30d', note: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => { api('/grants').then((d) => setGrants(d.grants)).catch((e) => toast.error(e.message)); }, []);
  useEffect(load, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login.trim()) { toast.error('Укажите логин или email'); return; }
    setSaving(true);
    try {
      const d = await api('/grants', { method: 'POST', body: JSON.stringify(form) });
      toast.success(d.grant.created ? 'Аккаунт создан, доступ выдан' : 'Доступ выдан существующему пользователю');
      setForm({ login: '', password: '', plan: 'month', term: '30d', note: '' });
      load();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const input = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white';
  return (
    <div className="grid md:grid-cols-[360px_1fr] gap-5 items-start">
      <form onSubmit={submit} className={`${card} p-5 space-y-3`}>
        <div className="font-semibold text-slate-900">Выдать доступ</div>
        <div>
          <input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="Логин или email (как пользователь входит)" className={input} />
          {form.login.trim() && <div className="text-xs text-slate-400 mt-1">Вход: <b>{form.login.trim()}</b>{!form.login.includes('@') && <> · служебный email {loginToEmail(form.login)}</>}</div>}
        </div>
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Пароль (для нового аккаунта, от 6 символов)" className={input} />
        <div className="flex gap-2">
          <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={input}>
            <option value="month">Месяц</option><option value="lifetime">Навсегда</option><option value="trial">Пробный</option>
          </select>
          <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className={input}>
            <option value="30d">30 дней</option><option value="forever">Бессрочно</option>
          </select>
        </div>
        <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Заметка (кому, за что оплачено)" rows={2} className={input} />
        <button disabled={saving} className="w-full py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Выдаём…' : 'Создать аккаунт и выдать доступ'}</button>
        <p className="text-xs text-slate-400">Если аккаунт уже есть — ему продлится тариф, а пароль сменится, только если вы его указали.</p>
      </form>

      <div className={`${card} overflow-x-auto`}>
        <div className="p-4 font-semibold text-slate-900 border-b border-slate-100">Журнал выдач</div>
        {!grants ? <div className="p-4 text-sm text-slate-500">Загрузка…</div> : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 border-b border-slate-200">
              <tr><th className="p-3">Когда</th><th className="p-3">Логин</th><th className="p-3">Тариф</th><th className="p-3">До</th><th className="p-3">Заметка</th></tr>
            </thead>
            <tbody>
              {grants.map((g, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="p-3 text-slate-600">{new Date(g.at).toLocaleString('ru-RU')}</td>
                  <td className="p-3">{g.login}{g.created && <span className="ml-1 text-xs text-emerald-600">новый</span>}</td>
                  <td className="p-3">{PLAN_LABEL[g.plan] || g.plan}</td>
                  <td className="p-3 text-slate-600">{g.expires_at ? fmtDate(g.expires_at) : 'бессрочно'}</td>
                  <td className="p-3 text-slate-500">{g.note || '—'}</td>
                </tr>
              ))}
              {!grants.length && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Пока ничего не выдано</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
