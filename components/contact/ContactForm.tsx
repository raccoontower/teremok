'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const WEB3FORMS_KEY = '9a5c27b2-17ae-4b52-8c59-204fdef2a0d9';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: name || 'Аноним',
          email: email || 'не указан',
          message,
          subject: '📬 Новое сообщение с Teremok.live',
          from_name: 'Teremok Contact Form',
        }),
      });

      const data = await res.json() as { success?: boolean };
      if (!data.success) throw new Error('Ошибка отправки');

      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setErrorMsg('Не удалось отправить. Напишите нам напрямую: info@teremok.live');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-lg font-semibold text-neutral-900 mb-1">Сообщение отправлено!</p>
        <p className="text-neutral-500 text-sm">Мы ответим в течение 24 часов.</p>
        <button onClick={() => setStatus('idle')} className="mt-5 text-primary-600 text-sm hover:underline">
          Отправить ещё одно
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Ваше имя <span className="text-neutral-400 font-normal">(необязательно)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email <span className="text-neutral-400 font-normal">(для ответа)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ivan@example.com"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Сообщение <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ваш вопрос, предложение или сообщение об ошибке..."
          className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          ⚠️ {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !message.trim()}
        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 h-11 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Отправляем...
          </>
        ) : '📬 Отправить сообщение'}
      </button>
    </form>
  );
}
