import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ROUTES } from '@/lib/constants/routes';

export const metadata: Metadata = {
  title: 'Регистрация — Теремок',
};

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Создать аккаунт</h1>
        <p className="text-gray-500 mt-1">Зарегистрируйтесь бесплатно</p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-gray-500 mt-6">
        Уже есть аккаунт?{' '}
        <Link href={ROUTES.login} className="text-primary-600 hover:underline font-medium">
          Войти
        </Link>
      </p>
    </div>
  );
}
