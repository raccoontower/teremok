import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Контакты — Teremok',
  description: 'Свяжитесь с командой Teremok. Мы рады ответить на ваши вопросы.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Контакты</h1>
      <p className="text-neutral-500 mb-8">Мы всегда на связи — ответим в течение суток.</p>

      {/* Контакты */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">📧</div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Email</p>
          <a href="mailto:info@teremok.live" className="text-primary-600 text-sm hover:underline">
            info@teremok.live
          </a>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">✈️</div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Telegram</p>
          <a href="https://t.me/Jenkabutko" target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm hover:underline">
            @Jenkabutko
          </a>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm text-center">
          <div className="text-3xl mb-2">🕐</div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Время ответа</p>
          <p className="text-neutral-500 text-sm">до 24 часов</p>
        </div>
      </div>

      {/* Форма */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">Написать нам</h2>
        <ContactForm />
      </div>
    </div>
  );
}
