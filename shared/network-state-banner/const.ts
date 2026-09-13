import { LANGUAGES } from '@const/enums';

export const NETWORK_WARNING_COPY = {
  [LANGUAGES.english]: {
    vpn: 'Please note that your VPN is enabled',
    noInternet: 'You do not have an internet connection',
    maybeNoInternet: 'You may not have an internet connection',
    cellular: (generation: string) => `Your connection type is ${generation}`,
    airplane: 'Please note that airplane mode is enabled',
  },
  [LANGUAGES.russian]: {
    vpn: 'Обратите внимание, у Вас включен VPN',
    noInternet: 'У Вас нет соединения с Интернетом',
    maybeNoInternet: 'Возможно, у Вас нет соединения с Интернетом',
    cellular: (generation: string) => `Тип Вашего подключения: ${generation}`,
    airplane: 'Обратите внимание, включен режим самолета',
  },
} as const;

export const NETWORK_WARNING_TEXT = NETWORK_WARNING_COPY[LANGUAGES.russian];
