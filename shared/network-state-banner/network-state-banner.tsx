import { useEffect, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { Platform, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { NETWORK_WARNING_TEXT } from './const';
import { checkAirplaneMode, checkVpn } from './utils';

export default function NetworkStateBanner() {
  const [isVpnEnabled, setIsVpnEnabled] = useState(false);
  const [isAirplaneMode, setIsAirplaneMode] = useState(false);
  const { colors } = useTheme();
  const { type, isConnected, isInternetReachable, details } = useNetInfo();

  useEffect(() => {
    if (!process.env.IS_TESTING) {
      if (Platform.OS !== 'web') {
        checkVpn(setIsVpnEnabled);
      }
      if (Platform.OS === 'android') {
        checkAirplaneMode(setIsAirplaneMode);
      }
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
          {isVpnEnabled && <Text variant="bodyMedium">{NETWORK_WARNING_TEXT.vpn}</Text>}
          {!isInternetReachable && (
            <Text variant="bodyMedium">
              {isConnected ? NETWORK_WARNING_TEXT.maybeNoInternet : NETWORK_WARNING_TEXT.noInternet}
            </Text>
          )}
          {isCellularWarning && (
            <Text variant="bodyMedium">{NETWORK_WARNING_TEXT.cellular(`${details?.cellularGeneration}`)}</Text>
          )}
          {Platform.OS === 'android' && isAirplaneMode && (
            <Text variant="bodyMedium">{NETWORK_WARNING_TEXT.airplane}</Text>
          )}
        </View>
      )}
    </>
  );
}
