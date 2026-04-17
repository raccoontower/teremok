'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FirebaseError } from 'firebase/app';
import { signIn, signInWithGoogle, sendPasswordReset } from '@/lib/firebase/auth';
import { loginSchema, type LoginFormData } from '@/lib/utils/validators';
import { ROUTES } from '@/lib/constants/routes';

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await signIn(data.email, data.password);
      router.push(ROUTES.listings);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          setServerError('Неверный email или пароль');
        } else if (error.code === 'auth/too-many-requests') {
          setServerError('Слишком много попыток. Попробуйте позже.');
        } else {
          setServerError('Произошла ошибка. Попробуйте ещё раз.');
        }
      } else {
        setServerError('Произошла ошибка. Попробуйте ещё раз.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push(ROUTES.listings);
    } catch {
      setServerError('Не удалось войти через Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetError('');
    if (!resetEmail.trim()) { setResetError('Введите email'); return; }
    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetSent(true);
    } catch {
      setResetError('Email не найден или произошла ошибка');
    } finally {
      setResetLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-800">Восстановление пароля</h3>
        {resetSent ? (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-green-700 text-sm">✅ Письмо отправлено на <strong>{resetEmail}</strong>. Проверьте почту (и папку «Спам»).</p>
          </div>
        ) : (
          <>
            <Input
              label="Ваш email"
              type="email"
              placeholder="your@email.com"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
            />
            {resetError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{resetError}</p>}
            <Button type="button" variant="primary" fullWidth loading={resetLoading} onClick={handlePasswordReset}>
              Отправить письмо
            </Button>
          </>
        )}
        <button type="button" onClick={() => { setShowReset(false); setResetSent(false); setResetError(''); }}
          className="text-sm text-primary-600 hover:underline">
          ← Вернуться ко входу
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Кнопка Google */}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={googleLoading}
        onClick={handleGoogleSignIn}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Войти через Google
      </Button>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="px-3 text-xs text-gray-400">или</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Пароль"
        type="password"
        placeholder="••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
        Войти
      </Button>

      <div className="text-center">
        <button type="button" onClick={() => setShowReset(true)}
          className="text-sm text-primary-600 hover:underline">
          Забыли пароль?
        </button>
      </div>
    </form>
  );
}
