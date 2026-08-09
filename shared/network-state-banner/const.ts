export const NETWORK_WARNING_TEXT = {
  vpn: 'Обратите внимание, у Вас включен VPN',
  noInternet: 'У Вас нет соединения с Интернет',
  maybeNoInternet: 'Возможно, у Вас нет соединения с Интернет',
  cellular: (generation: string) => `Тип Вашего подключения ${generation}`,
  airplane: 'Обратите внимание, включен режим самолета',
} as const;
