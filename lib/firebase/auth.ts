import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

/**
 * Создаёт документ пользователя в Firestore при первой регистрации
 */
export async function createUserDocument(firebaseUser: FirebaseUser): Promise<void> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  // Если документ уже существует — не перезаписываем
  if (snapshot.exists()) return;

  const userData: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'Пользователь',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL,
    createdAt: serverTimestamp(),
    listingsCount: 0,
  };

  await setDoc(userRef, userData);
}

/**
 * Регистрация нового пользователя по email и паролю
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  // Обновляем отображаемое имя
  await updateProfile(credential.user, { displayName });

  // Создаём документ в Firestore
  await createUserDocument(credential.user);

  return credential.user;
}

/**
 * Вход по email и паролю
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Вход через Google OAuth
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const credential = await signInWithPopup(auth, googleProvider);

  // Создаём документ если пользователь новый
  await createUserDocument(credential.user);

  return credential.user;
}

/**
 * Выход из системы
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Отправка письма для сброса пароля
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(auth, email);
}
