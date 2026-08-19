import { Platform } from 'react-native';
import { MOCK_MARKET_URLS } from './const';

export function getMarketUrl() {
  return Platform.select({
    ios: MOCK_MARKET_URLS.ios,
    android: MOCK_MARKET_URLS.android,
    default: MOCK_MARKET_URLS.default,
  });
}
