import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { BlogPost } from '@/types';

const POSTS_COLLECTION = 'posts';

/**
 * Получить все опубликованные посты, отсортированные по дате (новые первые)
 */
export async function getPosts(): Promise<BlogPost[]> {
  const ref = collection(db, POSTS_COLLECTION);
  const q = query(ref, orderBy('publishedAt', 'desc'));
  const snapshot = await getDocs(q);

  const posts = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as BlogPost[];

  // Клиентская фильтрация — только опубликованные
  return posts.filter((p) => p.status === 'published');
}

/**
 * Получить пост по slug
 */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const ref = collection(db, POSTS_COLLECTION);
  const q = query(ref, where('slug', '==', slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as BlogPost;
}

/**
 * Создать новый пост
 */
export async function createPost(
  data: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewsCount'>
): Promise<string> {
  const ref = collection(db, POSTS_COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    viewsCount: 0,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Увеличить счётчик просмотров поста
 */
export async function incrementPostViews(id: string): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await updateDoc(docRef, { viewsCount: increment(1) });
  } catch {
    // Ignore errors (anonymous users may not have write access)
  }
}
