import StaticPage from '@/components/layout/StaticPage';

export const metadata = {
  title: 'Контакты — Теремок',
  description: 'Свяжитесь с командой Теремок',
};

export default function ContactPage() {
  return (
    <StaticPage title="Контакты" subtitle="Мы всегда на связи">
      {/* Contact info */}
      <div className="grid sm:grid-cols-3 gap-4 not-prose">
        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">📧</div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Email</p>
          <a href="mailto:info@teremok.app" className="text-primary-600 text-sm hover:underline">
            info@teremok.app
          </a>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">✈️</div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Telegram</p>
          <a href="https://t.me/teremok_support" target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm hover:underline">
            @teremok_support
          </a>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">📍</div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Адрес</p>
          <p className="text-neutral-500 text-sm">США (онлайн-платформа)</p>
        </div>
      </div>

      {/* Contact form */}
      <h2>Написать нам</h2>
      <div className="bg-white border border-neutral-100 rounded-xl p-6 shadow-sm not-prose">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Ваше имя</label>
            <input
              type="text"
              disabled
              placeholder="Иван Иванов"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              disabled
              placeholder="ivan@example.com"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Сообщение</label>
            <textarea
              disabled
              rows={4}
              placeholder="Ваш вопрос или предложение..."
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed resize-none"
            />
          </div>
          <div>
            <button
              disabled
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-amber-800 text-sm">
              ⚠️ Форма временно недоступна — напишите нам в{' '}
              <a href="https://t.me/teremok_support" target="_blank" rel="noopener noreferrer" className="font-medium underline">
                Telegram
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </StaticPage>
  );
}
