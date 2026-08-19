export const AUTH_STEP_INTRO_CONTENT = {
  russian: {
    login: {
      title: 'Тренируйся и общайся',
      description: 'Российский сервис Runich: тренировки, прогресс и социальная сеть без VPN.',
    },
    register: {
      title: 'Создай аккаунт',
      description: 'Заполни данные — мы отправим ссылку и код подтверждения на почту.',
    },
    reset: { title: 'Изменение пароля', description: 'Укажи почту, и мы отправим инструкции для смены пароля.' },
    emailLink: { title: 'Вход по ссылке', description: 'Отправим безопасную ссылку для входа на твою почту.' },
  },
  english: {
    login: {
      title: 'Train and connect',
      description: 'Runich is a Russian fitness and social service that works without a VPN.',
    },
    register: {
      title: 'Create an account',
      description: 'Fill in your details and we will send a confirmation link and code.',
    },
    reset: {
      title: 'Change your password',
      description: 'Enter your email and we will send instructions to change it.',
    },
    emailLink: { title: 'Sign in with a link', description: 'We will send a secure sign-in link to your email.' },
  },
} as const;

export const SIGN_IN_FIELDS = {
  email: 'Электронная почта',
  password: 'Пароль',
} as const;

const AUTH_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export const YANDEX_AUTH_URL = `${AUTH_BASE_URL}/auth/yandex`;
export const VK_AUTH_URL = `${AUTH_BASE_URL}/auth/vk`;

export const REGISTERED_USERS_ONLY_LABEL = {
  english: 'Available for registered users',
  russian: 'Доступно для зарегистрированных пользователей',
} as const;
