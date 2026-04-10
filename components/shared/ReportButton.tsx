'use client';

import { useState } from 'react';

interface ReportButtonProps {
  itemId: string;
  itemType: 'listing' | 'job' | 'housing' | 'service';
  itemTitle: string;
}

const TYPE_LABELS: Record<string, string> = {
  listing: 'Объявление',
  job: 'Вакансия/Резюме',
  housing: 'Жильё',
  service: 'Услуга',
};

export function ReportButton({ itemId, itemType, itemTitle }: ReportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'open' | 'loading' | 'done'>('idle');
  const [reason, setReason] = useState('');

  async function submit() {
    if (!reason.trim()) return;
    setStatus('loading');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          subject: `🚨 Жалоба: ${TYPE_LABELS[itemType]} — ${itemTitle}`,
          message: `Тип: ${TYPE_LABELS[itemType]}\nID: ${itemId}\nНазвание: ${itemTitle}\n\nПричина жалобы:\n${reason}`,
        }),
      });
      setStatus('done');
    } catch {
      setStatus('open'); // вернём форму, пусть попробует снова
    }
  }

  if (status === 'done') {
    return <span className="text-xs text-green-600">✓ Жалоба отправлена</span>;
  }

  if (status === 'open' || status === 'loading') {
    return (
      <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm">
        <p className="font-medium text-neutral-700 mb-2">Причина жалобы</p>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Опишите проблему..."
          className="w-full border border-neutral-300 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={submit}
            disabled={status === 'loading' || !reason.trim()}
            className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Отправка...' : 'Отправить'}
          </button>
          <button
            onClick={() => { setStatus('idle'); setReason(''); }}
            className="text-xs text-neutral-500 hover:text-neutral-700 px-2"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStatus('open')}
      className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
    >
      🚩 Пожаловаться
    </button>
  );
}
