'use client';

import Link from 'next/link';
import { useMemo } from 'react';

/**
 * Рендерит markdown-подобный текст статьи:
 * - **жирный**
 * - *курсив*
 * - [текст](ссылка) — кликабельные ссылки
 * - ## Заголовок
 * - ### Подзаголовок
 * - - пункт списка
 * - Пустая строка = новый параграф
 */

interface BlogContentProps {
  content: string;
}

function parseInline(text: string): React.ReactNode[] {
  // Парсим **bold**, *italic*, [text](url)
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[1]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-semibold text-neutral-900">{match[1]}</strong>);
    } else if (match[2]) {
      // *italic*
      parts.push(<em key={match.index}>{match[2]}</em>);
    } else if (match[3] && match[4]) {
      // [text](url)
      const href = match[4];
      const isInternal = href.startsWith('/');
      parts.push(
        isInternal ? (
          <Link key={match.index} href={href} className="text-primary-600 underline hover:text-primary-700">
            {match[3]}
          </Link>
        ) : (
          <a key={match.index} href={href} target="_blank" rel="noopener noreferrer"
            className="text-primary-600 underline hover:text-primary-700">
            {match[3]}
          </a>
        )
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function BlogContent({ content }: BlogContentProps) {
  const blocks = useMemo(() => {
    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let listItems: string[] = [];
    let key = 0;

    function flushList() {
      if (listItems.length === 0) return;
      result.push(
        <ul key={key++} className="list-disc list-outside pl-5 space-y-1.5 my-4 text-neutral-700">
          {listItems.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // ## Заголовок H2
      if (/^##\s+/.test(line)) {
        flushList();
        result.push(
          <h2 key={key++} className="text-xl font-bold text-neutral-900 mt-8 mb-3">
            {parseInline(line.replace(/^##\s+/, ''))}
          </h2>
        );
        continue;
      }

      // ### Заголовок H3
      if (/^###\s+/.test(line)) {
        flushList();
        result.push(
          <h3 key={key++} className="text-lg font-semibold text-neutral-900 mt-6 mb-2">
            {parseInline(line.replace(/^###\s+/, ''))}
          </h3>
        );
        continue;
      }

      // - пункт списка
      if (/^[-*]\s+/.test(line)) {
        listItems.push(line.replace(/^[-*]\s+/, ''));
        continue;
      }

      // Цифровой список: 1. пункт
      if (/^\d+\.\s+/.test(line)) {
        listItems.push(line.replace(/^\d+\.\s+/, ''));
        continue;
      }

      flushList();

      // Пустая строка — разделитель параграфов
      if (line.trim() === '') continue;

      // Обычный параграф
      result.push(
        <p key={key++} className="text-neutral-700 leading-relaxed mb-4">
          {parseInline(line)}
        </p>
      );
    }

    flushList();
    return result;
  }, [content]);

  return <div className="blog-content">{blocks}</div>;
}
