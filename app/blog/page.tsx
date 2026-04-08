'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/types';

function formatDate(ts: string | undefined): string {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 animate-pulse">
      <div className="h-5 bg-neutral-200 rounded w-1/4 mb-4" />
      <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-5/6 mb-4" />
      <div className="h-4 bg-neutral-200 rounded w-1/3" />
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((d: { posts?: BlogPost[] }) => setPosts(d.posts ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div className="bg-primary-600 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Блог Теремок</h1>
          <p className="text-primary-100 text-lg">
            Полезные статьи для русскоязычных в США
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-neutral-400 mb-2">📝</p>
            <p className="text-neutral-500 text-lg">Статьи скоро появятся</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-neutral-400 text-sm">
                    {formatDate(post.publishedAt as unknown as string)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-primary-600 font-medium text-sm hover:underline"
                >
                  Читать →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
