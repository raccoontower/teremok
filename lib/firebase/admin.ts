import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK — используется только на сервере (API routes, Server Components).
 * Не импортировать в клиентских компонентах!
 */
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!.trim();
  // Vercel хранит private key — убираем лишние пробелы/переносы по краям
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.trim();
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
