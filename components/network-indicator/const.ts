import { LANGUAGES } from '../../constants/enums';

export const NETWORK_INDICATOR = {
  [LANGUAGES.english]: {
    offline: 'You are offline',
    slowNetwork: 'You have slow connection, 3g or 2g',
    type: 'Type of connection',
  },
  [LANGUAGES.russian]: {
    offline: 'Вы оффлайн',
    slowNetwork: 'You have slow connection, 3g or 2g',
    type: 'Тип соединения',
  },
};

export const MOCK_NETWORK_STATE = {
  details: {
    bssid: '04:95:e6:c1:dd:c8',
    frequency: 2457,
    ipAddress: '192.168.1.101',
    isConnectionExpensive: false,
    linkSpeed: 72,
    rxLinkSpeed: 72,
    ssid: 'Internet, bleat',
    strength: 99,
    subnet: '255.255.255.0',
    txLinkSpeed: 72,
  },
  isConnected: true,
  isInternetReachable: true,
  isWifiEnabled: true,
  type: 'wifi',
};
