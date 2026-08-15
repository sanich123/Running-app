export const SIGN_IN_FIELDS = {
  email: 'Электронная почта',
  password: 'Пароль',
} as const;

export const YANDEX_AUTH_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/auth/yandex`;
export const VK_AUTH_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/auth/vk`;

export const REGISTERED_USERS_ONLY_LABEL = {
  english: 'Available for registered users',
  russian: 'Доступно для зарегистрированных пользователей',
} as const;
