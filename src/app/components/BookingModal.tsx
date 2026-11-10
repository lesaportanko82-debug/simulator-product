import React, { useState } from 'react';
import { format, addMonths, addDays, startOfMonth, startOfDay, startOfWeek, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { projectId } from '/utils/supabase/info';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [telegram, setTelegram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const today = new Date();
  const maxDate = addMonths(startOfDay(today), 2);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    return day !== 1 && day !== 3 && day !== 5;
  };

  const step = !selectedDate ? 1 : !selectedTime ? 2 : 3;
  const canSubmit = selectedDate && selectedTime && telegram.trim().length >= 3 && !isSubmitting;

  const resetAndClose = () => {
    onClose();
    setIsSuccess(false);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setTelegram('');
  };

  const handleBooking = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const tg = telegram.trim().replace(/^@/, '');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || !session?.access_token) {
        toast.error('Войдите в аккаунт, чтобы записаться');
        return;
      }
      const d = selectedDate!;
      const bookingData = {
        date: format(d, 'yyyy-MM-dd'),
        time: selectedTime,
        userId: user.id,
        userEmail: user.email,
        telegram: tg,
      };
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      try {
        const local = JSON.parse(localStorage.getItem('pm-bookings') || '[]');
        local.push({ ...bookingData, id: `local-${Date.now()}`, createdAt: new Date().toISOString() });
        localStorage.setItem('pm-bookings', JSON.stringify(local));
      } catch { /* ignore */ }
      setIsSuccess(true);
      toast.success('Запись создана! Ждём вас 🎉');
      setTimeout(resetAndClose, 2500);
    } catch {
      toast.error('Не удалось записаться. Попробуйте ещё раз или напишите в Telegram @ohh_lessya');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto" style={{ background: 'rgba(22,78,99,0.6)', backdropFilter: 'blur(6px)', height: '100dvh' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row rounded-t-2xl sm:rounded-2xl"
        style={{ maxHeight: '95dvh' }}
      >
        {/* Left panel */}
        <div className="md:w-[220px] flex-shrink-0 flex flex-col justify-between p-7 text-white relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #164e63 0%, #0e7490 100%)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(103,232,249,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1.5">Запись на Q&A</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(207,250,254,0.75)' }}>
              Разберём ваши вопросы с ментором в живом формате.
            </p>
          </div>

          <div className="relative z-10 space-y-3 mt-6">
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#67e8f9' }}>Доступные дни</p>
              <p className="text-sm font-semibold">Пн, Ср, Пт</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#67e8f9' }}>Время (МСК)</p>
              <p className="text-sm font-semibold">09:00 — 14:00</p>
            </div>

            {/* Step indicators */}
            <div className="pt-2 space-y-2">
              {[
                { n: 1, label: 'Выберите дату' },
                { n: 2, label: 'Выберите время' },
                { n: 3, label: 'Ваш Telegram' },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all"
                    style={{
                      background: step > n ? '#2e7b5e' : step === n ? '#67e8f9' : 'rgba(255,255,255,0.1)',
                      color: step > n || step === n ? '#164e63' : 'rgba(255,255,255,0.4)',
                    }}>
                    {step > n ? '✓' : n}
                  </div>
                  <span className="text-xs transition-colors" style={{ color: step >= n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#f0fdff' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid #cffafe' }}>
            <div className="flex items-center gap-3">
              {selectedDate && (
                <span className="text-sm font-semibold" style={{ color: '#0891b2' }}>
                  {format(selectedDate, 'd MMMM', { locale: ru })}
                </span>
              )}
              {selectedTime && (
                <>
                  <span style={{ color: '#9ca3af' }}>·</span>
                  <span className="text-sm font-semibold" style={{ color: '#0891b2' }}>{selectedTime}</span>
                </>
              )}
              {!selectedDate && <span className="text-sm" style={{ color: '#9ca3af' }}>Выберите дату и время</span>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9ca3af' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: '#d1fae5' }}>
                  <CheckCircle className="w-8 h-8" style={{ color: '#2e7b5e' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#164e63' }}>Вы записаны!</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  Ждём вас{' '}
                  <strong>{selectedDate && format(selectedDate, 'd MMMM', { locale: ru })}</strong> в <strong>{selectedTime}</strong>.
                  <br />Напишем в Telegram <strong>@{telegram.replace(/^@/, '')}</strong> для подтверждения.
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6">
                {/* Calendar */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#0891b2' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: '#0891b2' }}>1</span>
                    Выберите дату
                  </p>
                  <MiniCalendar
                    month={viewMonth}
                    onMonthChange={setViewMonth}
                    minMonth={startOfMonth(today)}
                    maxMonth={startOfMonth(maxDate)}
                    selected={selectedDate}
                    isDisabled={(d) => d < startOfDay(today) || d > maxDate || isDateDisabled(d)}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                  />
                </div>

                {/* Time + Telegram */}
                <div className="flex-1 flex flex-col gap-5">
                  {/* Time */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: selectedDate ? '#0891b2' : '#9ca3af' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: selectedDate ? '#0891b2' : '#9ca3af' }}>2</span>
                      Выберите время
                    </p>
                    {!selectedDate ? (
                      <div className="rounded-2xl p-6 text-center text-sm" style={{ border: '2px dashed #cffafe', color: '#9ca3af' }}>
                        Сначала выберите дату
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all"
                            style={selectedTime === time
                              ? { background: '#0891b2', color: '#ffffff', border: '1.5px solid #0891b2' }
                              : { background: '#ffffff', color: '#374151', border: '1.5px solid #cffafe' }
                            }
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Telegram */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: selectedTime ? '#0891b2' : '#9ca3af' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: selectedTime ? '#0891b2' : '#9ca3af' }}>3</span>
                      Ваш Telegram
                    </p>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#0891b2' }}>@</span>
                      <input
                        type="text"
                        value={telegram}
                        onChange={e => setTelegram(e.target.value.replace(/^@/, ''))}
                        placeholder="username"
                        disabled={!selectedTime}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-40"
                        style={{
                          background: '#ffffff',
                          border: telegram.length >= 3 ? '1.5px solid #0891b2' : '1.5px solid #cffafe',
                          color: '#374151',
                        }}
                      />
                    </div>
                    <p className="text-[11px] mt-1.5" style={{ color: '#9ca3af' }}>
                      Напишем вам для подтверждения записи
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    disabled={!canSubmit}
                    onClick={handleBooking}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-auto"
                    style={canSubmit
                      ? { background: '#0891b2', color: '#ffffff', boxShadow: '0 4px 12px rgba(8,145,178,0.3)' }
                      : { background: '#cffafe', color: '#9ca3af', cursor: 'not-allowed' }
                    }
                  >
                    {isSubmitting
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>
                          <Send className="w-4 h-4" />
                          Подтвердить запись
                        </>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface MiniCalendarProps {
  month: Date;
  onMonthChange: (m: Date) => void;
  minMonth: Date;
  maxMonth: Date;
  selected?: Date;
  isDisabled: (d: Date) => boolean;
  onSelect: (d: Date) => void;
}

function MiniCalendar({ month, onMonthChange, minMonth, maxMonth, selected, isDisabled, onSelect }: MiniCalendarProps) {
  const canPrev = month > minMonth;
  const canNext = month < maxMonth;
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfMonth(month);
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd || days.length % 7 !== 0; d = addDays(d, 1)) days.push(d);
  const today = new Date();
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const title = format(month, 'LLLL yyyy', { locale: ru });

  return (
    <div className="rounded-2xl bg-white border border-cyan-100 p-3 sm:p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => canPrev && onMonthChange(addMonths(month, -1))}
          disabled={!canPrev}
          aria-label="Предыдущий месяц"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-700 hover:bg-cyan-50 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-cyan-900 capitalize">{title}</span>
        <button
          type="button"
          onClick={() => canNext && onMonthChange(addMonths(month, 1))}
          disabled={!canNext}
          aria-label="Следующий месяц"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-700 hover:bg-cyan-50 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[10px] font-semibold uppercase text-gray-400 py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = isSameMonth(d, month);
          if (!inMonth) return <div key={d.toISOString()} />;
          const disabled = isDisabled(d);
          const isSel = selected && isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={clsx(
                'aspect-square w-full rounded-lg text-sm font-medium flex items-center justify-center transition-colors',
                isSel && 'bg-cyan-600 text-white shadow-sm',
                !isSel && !disabled && 'text-cyan-900 bg-cyan-50 hover:bg-cyan-100',
                disabled && 'text-gray-300 cursor-not-allowed',
                isToday && !isSel && 'ring-1 ring-cyan-400',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 mt-3 text-center">Доступны Пн, Ср, Пт на ближайшие 2 месяца</p>
    </div>
  );
}
