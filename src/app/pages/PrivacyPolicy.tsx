import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#111827", background: "linear-gradient(160deg, #f0fdff 0%, #cffafe 55%, #67e8f9 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm transition-colors mb-6" style={{ color: "#0891b2" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="rounded-2xl shadow-sm px-8 py-8" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(207,250,254,0.8)" }}>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Политика конфиденциальности</h1>
          <p className="text-xs text-slate-400 mb-8">Последнее обновление: 6 июля 2026 г.</p>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности регулирует порядок сбора, хранения, использования и защиты персональных данных пользователей сервиса PM Simulator (далее — Сервис). Используя Сервис, вы соглашаетесь с условиями настоящей Политики.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">2. Какие данные мы собираем</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Адрес электронной почты — при регистрации и авторизации</li>
                <li>Данные об использовании Сервиса — прогресс обучения, выборы в симуляторе, результаты заданий</li>
                <li>Технические данные — тип браузера, операционная система, IP-адрес (в обезличенном виде)</li>
                <li>Платёжные данные — обрабатываются исключительно платёжным провайдером; мы не храним реквизиты карт</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">3. Цели обработки данных</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Предоставление доступа к функциям Сервиса</li>
                <li>Персонализация учебного процесса и обратной связи от AI-ментора</li>
                <li>Отслеживание прогресса и выдача сертификатов</li>
                <li>Отправка уведомлений об обновлениях и новых материалах (только с вашего согласия)</li>
                <li>Обработка платежей и выставление счетов</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">4. Хранение и защита данных</h2>
              <p>
                Данные хранятся на защищённых серверах с использованием шифрования. Мы применяем технические и организационные меры для защиты ваших данных от несанкционированного доступа, изменения или уничтожения.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">5. Передача данных третьим лицам</h2>
              <p>
                Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев, необходимых для работы Сервиса: платёжные провайдеры, инфраструктурные партнёры (Supabase, OpenAI). Все партнёры обрабатывают данные исключительно в рамках выполнения своих услуг.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">6. Ваши права</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Получить копию хранящихся о вас данных</li>
                <li>Запросить исправление неточных данных</li>
                <li>Запросить удаление своих данных (право на забвение)</li>
                <li>Отозвать согласие на получение маркетинговых уведомлений</li>
              </ul>
              <p className="mt-2">Для реализации любого из перечисленных прав обратитесь к нам по контактным данным ниже.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">7. Файлы cookie</h2>
              <p>
                Сервис использует технические cookie, необходимые для авторизации и корректной работы интерфейса. Аналитические cookie используются только в обезличенном виде для улучшения Сервиса.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">8. Изменения в Политике</h2>
              <p>
                Мы можем периодически обновлять настоящую Политику. Об существенных изменениях мы уведомим вас по электронной почте или через интерфейс Сервиса.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-2">9. Контакты</h2>
              <p>По всем вопросам, связанным с обработкой персональных данных, обращайтесь:</p>
              <p className="mt-2">
                <span className="text-slate-700 font-medium">Email: </span>
                <a
                  href="mailto:lifesyncspace@gmail.com"
                  className="underline underline-offset-2" style={{ color: "#0891b2" }}
                >
                  lifesyncspace@gmail.com
                </a>
              </p>
              <p className="mt-1 text-xs text-slate-400">Мы ответим в течение 5 рабочих дней.</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200/60 text-xs text-slate-400 text-center">
            &copy; 2026 PM Simulator. Все права защищены.
          </div>
        </div>
      </div>
    </div>
  );
};
