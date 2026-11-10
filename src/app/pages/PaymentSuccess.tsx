import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 60_000;

const checkAccess = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: access } = await supabase
    .from('user_access')
    .select('plan, expires_at, status')
    .eq('user_id', user.id)
    .eq('project', 'simulator product')
    .eq('status', 'active')
    .maybeSingle();
  if (!access) return false;
  return (
    access.plan === 'lifetime' ||
    (access.expires_at && new Date(access.expires_at) > new Date())
  );
};

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(Date.now());

  const stopPolling = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const poll = async () => {
    if (Date.now() - startedAt.current >= TIMEOUT_MS) {
      stopPolling();
      setTimedOut(true);
      return;
    }
    const ok = await checkAccess();
    if (ok) {
      stopPolling();
      navigate('/', { replace: true });
    }
  };

  const startPolling = () => {
    stopPolling();
    setTimedOut(false);
    startedAt.current = Date.now();
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setTimedOut(true);
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    startPolling();
    return stopPolling;
  }, []);

  const handleManualCheck = async () => {
    setChecking(true);
    const ok = await checkAccess();
    setChecking(false);
    if (ok) {
      navigate('/', { replace: true });
    } else {
      startPolling();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #f0fdff 0%, #cffafe 55%, #67e8f9 100%)' }}
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/70 p-8 text-center"
        >
          <AnimatePresence mode="wait">
            {timedOut ? (
              <motion.div key="timeout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="w-7 h-7 text-amber-500" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Платёж обрабатывается</h1>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Платёж может обрабатываться чуть дольше обычного. Обновите страницу через минуту или напишите нам — разберёмся быстро.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleManualCheck}
                    disabled={checking}
                    className="w-full py-2.5 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: '#0891b2' }}
                  >
                    {checking
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Проверяем...</>
                      : <><RefreshCw className="w-4 h-4" />Проверить доступ снова</>
                    }
                  </button>
                  <a
                    href="mailto:lifesyncspace@gmail.com"
                    className="block w-full py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Написать в поддержку
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.2)' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  >
                    <Loader2 className="w-7 h-7" style={{ color: '#0891b2' }} />
                  </motion.div>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Платёж обрабатывается</h1>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Обычно доступ открывается в течение нескольких секунд. Не закрывайте страницу.
                </p>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Проверяем автоматически...</span>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <button
                    onClick={handleManualCheck}
                    disabled={checking}
                    className="text-xs font-medium transition-colors flex items-center gap-1.5 mx-auto disabled:opacity-50"
                    style={{ color: '#0891b2' }}
                  >
                    {checking
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Проверяем...</>
                      : <><RefreshCw className="w-3.5 h-3.5" />Проверить сейчас</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Есть вопросы?{' '}
          <a href="mailto:lifesyncspace@gmail.com" style={{ color: '#0891b2' }} className="underline underline-offset-2">
            lifesyncspace@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};
