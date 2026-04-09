import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase/admin';
import { serializeDoc } from '@/lib/firebase/serialize';
import type { BlogPost } from '@/types';

interface Props { params: Promise<{ slug: string }> }

function formatDate(ts: string | undefined): string {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection('posts').where('slug', '==', slug).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return serializeDoc({ id: doc.id, ...doc.data() }) as unknown as BlogPost;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Статья не найдена' };
  return {
    title: `${post.title} — Teremok`,
    description: post.excerpt ?? (post.content as string)?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt ?? (post.content as string)?.slice(0, 160),
      type: 'article',
      publishedTime: post.publishedAt as unknown as string,
      authors: [post.authorName],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center text-neutral-500 hover:text-primary-600 text-sm mb-8 transition-colors"
        >
          ← Блог
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-neutral-400 text-sm">{formatDate(post.publishedAt as unknown as string)}</span>
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-3 leading-tight">
            {post.title}
          </h1>

          <p className="text-neutral-500 text-sm mb-8">
            Автор: <span className="font-medium text-neutral-700">{post.authorName}</span>
          </p>

          <div className="text-neutral-700 leading-relaxed text-base whitespace-pre-line">
            {post.content as unknown as string}
          </div>
        </article>

        <div className="mt-8">
          <Link href="/blog" className="text-primary-600 font-medium hover:underline">
            ← Назад в блог
          </Link>
        </div>
      </div>
    </div>
  );
}
