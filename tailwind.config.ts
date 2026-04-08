import type { Config } from 'tailwindcss';

// Дизайн-система Teremok
// Принцип: тёплый доверительный синий, не холодный корпоратив
// Аудитория: иммигранты 30–65 лет, мобильные устройства

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Шрифт: Inter остаётся, правильный стек
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // Межсимвольные интервалы для заголовков — чуть теснее, профессиональнее
      letterSpacing: {
        tight: '-0.025em',   // заголовки h1–h2
        snug: '-0.015em',    // h3–h4
        normal: '0em',
        wide: '0.025em',     // лейблы, капслоки
        wider: '0.05em',     // badge
      },

      colors: {
        // Основной синий — чуть теплее стандартного Tailwind blue (#2563eb)
        // Смещён в сторону индиго, добавляет теплоту и глубину
        primary: {
          50:  '#eef3ff',
          100: '#dce8ff',
          200: '#bccffe',
          300: '#90acfc',
          400: '#6183f8',
          500: '#3f5ef3',
          600: '#2848e8', // основной — теплее, насыщеннее чем #2563eb
          700: '#1f38cc',
          800: '#1c2fa4',
          900: '#1b2c82',
          950: '#111a4e',
        },

        // Тёплые нейтральные серые — на основе slate с тёплым подтоном
        // Вместо холодных gray используем slate с чуть тёплым оттенком
        neutral: {
          50:  '#f8f8fa',
          100: '#f0f0f4',
          200: '#e4e4ea',
          300: '#d0d0d9',
          400: '#a8a8b5',
          500: '#7c7c8a',
          600: '#5e5e6a',
          700: '#4a4a55',
          800: '#313138',
          900: '#1c1c21',
          950: '#0e0e12',
        },

        // Успех — зелёный, тёплый (для цены "Бесплатно", подтверждений)
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        // Ошибка — красный, не агрессивный
        error: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },

        // Предупреждение — янтарный (мягче чем жёлтый)
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },

      // Скругления — системные токены
      borderRadius: {
        // Стандартные Tailwind оставляем
        button: '10px',   // кнопки
        card:   '16px',   // карточки объявлений
        input:  '10px',   // поля ввода
        pill:   '9999px', // бейджи
        // overlay: для дропдаунов и модалок
        overlay: '16px',
      },

      // Тени — мягкие, с тёплым оттенком
      boxShadow: {
        // Карточка объявления по умолчанию
        card:   '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        // Карточка при hover
        hover:  '0 8px 24px -4px rgba(0, 0, 0, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.06)',
        // Фокус-кольцо для полей ввода
        focus:  '0 0 0 3px rgba(40, 72, 232, 0.20)',
        // Фокус для кнопок
        'focus-button': '0 0 0 3px rgba(40, 72, 232, 0.25), 0 1px 3px rgba(0,0,0,0.1)',
        // Дропдаун
        dropdown: '0 10px 40px -4px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        // Кнопка primary — лёгкая тень
        button: '0 2px 8px -1px rgba(40, 72, 232, 0.30)',
      },

      // Брейкпоинты
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },

      // Анимации для дропдаунов
      keyframes: {
        'dropdown-in': {
          '0%':   { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'dropdown-in': 'dropdown-in 150ms ease-out',
        'fade-in':     'fade-in 150ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
