// PM Simulator — Browser Notification Manager
// Uses the Web Notifications API (works while browser tab is open)
// Full background push requires a backend with VAPID — not implemented here

const STORAGE_KEY = 'pm-notif-enabled';
const LAST_NOTIF_KEY = 'pm-notif-last';

// Reminder messages shown to user
const REMINDERS = [
  'Не забывайте про курс! Осталось совсем немного до следующего модуля.',
  'Сегодня хороший день, чтобы пройти один урок. Занимает всего 10 минут.',
  'Ваши коллеги уже практикуются в симуляторе. Не отставайте!',
  'Новый кейс в базе знаний ждёт вас.',
  'Регулярность — ключ к успеху. Заходите хотя бы раз в день.',
];

export const isNotificationSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const getPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
};

export const showNotification = (title: string, body: string, url?: string) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'pm-simulator',
  });
  if (url) n.onclick = () => { window.focus(); window.location.href = url; };
  localStorage.setItem(LAST_NOTIF_KEY, Date.now().toString());
};

export const sendWelcomeNotification = () => {
  showNotification(
    'PM Simulator 🎯',
    'Уведомления включены! Будем напоминать о занятиях.',
  );
};

export const savePreference = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
};

export const loadPreference = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
};

// Schedule an in-tab reminder after N minutes of inactivity
let reminderTimer: ReturnType<typeof setTimeout> | null = null;

export const scheduleReminder = (delayMs = 30 * 60 * 1000) => {
  if (reminderTimer) clearTimeout(reminderTimer);
  reminderTimer = setTimeout(() => {
    if (loadPreference() && Notification.permission === 'granted') {
      const msg = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
      showNotification('PM Simulator', msg, '/');
    }
  }, delayMs);
};

export const cancelReminder = () => {
  if (reminderTimer) { clearTimeout(reminderTimer); reminderTimer = null; }
};

export const initNotifications = () => {
  if (!loadPreference() || Notification.permission !== 'granted') return;
  // Schedule first reminder 30 min after page load
  scheduleReminder(30 * 60 * 1000);
  // Reset timer on user activity
  ['click', 'keydown', 'scroll'].forEach(ev =>
    document.addEventListener(ev, () => scheduleReminder(30 * 60 * 1000), { passive: true })
  );
};
