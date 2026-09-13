import { useEffect, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { Platform, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { NETWORK_WARNING_COPY } from './const';
import { checkAirplaneMode, checkVpn } from './utils';

export default function NetworkStateBanner() {
  const [isVpnEnabled, setIsVpnEnabled] = useState(false);
  const [isAirplaneMode, setIsAirplaneMode] = useState(false);
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = NETWORK_WARNING_COPY[language];
  const { type, isConnected, isInternetReachable, details } = useNetInfo();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkVpn(setIsVpnEnabled);
    }
    if (Platform.OS === 'android') {
      checkAirplaneMode(setIsAirplaneMode);
    }
  }, [type, isConnected, isInternetReachable, details]);

  const isCellularWarning = type === 'cellular' && ['2g', '3g'].includes(`${details?.cellularGeneration}`);
  const isAirplaneModeOnAndroid = Platform.OS === 'android' && isAirplaneMode;
  const isNeedToRenderWarning = isVpnEnabled || !isInternetReachable || isCellularWarning || isAirplaneModeOnAndroid;

  return (
    <>
      {isNeedToRenderWarning && Platform.OS !== 'web' && (
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            rowGap: 5,
            backgroundColor: colors.surfaceVariant,
          }}>
          {isVpnEnabled && <Text variant="bodyMedium">{copy.vpn}</Text>}
          {!isInternetReachable && (
            <Text variant="bodyMedium">{isConnected ? copy.maybeNoInternet : copy.noInternet}</Text>
          )}
          {isCellularWarning && <Text variant="bodyMedium">{copy.cellular(`${details?.cellularGeneration}`)}</Text>}
          {Platform.OS === 'android' && isAirplaneMode && <Text variant="bodyMedium">{copy.airplane}</Text>}
        </View>
      )}
    </>
  );
}
