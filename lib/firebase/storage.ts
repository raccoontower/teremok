import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import { MAX_PHOTO_SIZE_MB, ALLOWED_PHOTO_TYPES } from '@/lib/constants/limits';

/**
 * Загрузить фото в Firebase Storage
 * @param file - файл для загрузки
 * @param userId - ID пользователя (для структуры папок)
 * @param onProgress - колбэк для отображения прогресса (0-100)
 * @returns URL загруженного фото
 */
export async function uploadPhoto(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Валидация типа файла
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error(`Разрешены только форматы: JPEG, PNG, WebP`);
  }

  // Валидация размера файла
  const maxBytes = MAX_PHOTO_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Размер файла не должен превышать ${MAX_PHOTO_SIZE_MB} МБ`);
  }

  // Генерируем уникальное имя файла
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `${timestamp}-${randomSuffix}.${extension}`;

  // Путь: listings/{userId}/photos/{fileName}
  const storageRef = ref(storage, `listings/${userId}/photos/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Вычисляем прогресс и передаём в колбэк
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        reject(new Error(`Ошибка загрузки: ${error.message}`));
      },
      async () => {
        // Загрузка завершена — получаем URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Удалить фото из Firebase Storage по URL
 * @param photoURL - полный URL фото
 */
export async function deletePhoto(photoURL: string): Promise<void> {
  try {
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
  } catch (error) {
    // Игнорируем ошибку если файл уже не существует
    console.warn('Не удалось удалить фото:', error);
  }
}
