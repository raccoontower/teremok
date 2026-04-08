'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { BlogPost } from '@/types';

function formatDate(ts: string | undefined): string {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`)
      .then((r) => { if (!r.ok) throw new Error('not_found'); return r.json() as Promise<{ post: BlogPost }>; })
      .then((d) => { setPost(d.post ?? null); if (!d.post) setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-4 bg-neutral-200 rounded w-20 mb-8" />
        <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-neutral-200 rounded w-full mb-3" />
        ))}
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🏠</p>
        <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
          Статья не найдена
        </h1>
        <p className="text-neutral-500 mb-6">
          Возможно, она была удалена или перемещена.
        </p>
        <Link href="/blog" className="text-primary-600 font-medium hover:underline">
          ← Вернуться в блог
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-neutral-500 hover:text-primary-600 text-sm mb-8 transition-colors"
        >
          ← Блог
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          {/* Category & date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-neutral-400 text-sm">{formatDate(post.publishedAt as unknown as string)}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-3 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <p className="text-neutral-500 text-sm mb-8">
            Автор: <span className="font-medium text-neutral-700">{post.authorName}</span>
          </p>

          {/* Content */}
          <div className="text-neutral-700 leading-relaxed text-base whitespace-pre-line">
            {post.content}
          </div>
        </article>

        {/* Bottom back link */}
        <div className="mt-8">
          <Link href="/blog" className="text-primary-600 font-medium hover:underline">
            ← Назад в блог
          </Link>
        </div>
      </div>
    </div>
  );
}
