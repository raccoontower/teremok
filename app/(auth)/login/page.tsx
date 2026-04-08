import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { ROUTES } from '@/lib/constants/routes';

export const metadata: Metadata = {
  title: 'Вход — Теремок',
};

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать</h1>
        <p className="text-gray-500 mt-1">Войдите в свой аккаунт</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-500 mt-6">
        Нет аккаунта?{' '}
        <Link href={ROUTES.register} className="text-primary-600 hover:underline font-medium">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
