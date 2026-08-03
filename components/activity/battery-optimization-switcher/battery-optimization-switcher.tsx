import { useEffect } from 'react';
//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import type { BatteryOptimizationSwitcherProps } from '../types';

export default function BatteryOptimizationSwitcher({
  isAppOptimizedByPhone,
  setIsAppOptimizedByPhone,
  batteryOptimizationEnabledModalRef,
  setIsNeedToRefreshPermission,
  isNeedToRefreshPermission,
}: BatteryOptimizationSwitcherProps) {
  useEffect(() => {
    if (isAppOptimizedByPhone || isNeedToRefreshPermission) {
      BatteryOptEnabled().then((isEnabled: boolean) => {
        setIsAppOptimizedByPhone(isEnabled);
        setIsNeedToRefreshPermission(false);
      });
    }
  }, [isAppOptimizedByPhone, setIsAppOptimizedByPhone, isNeedToRefreshPermission, setIsNeedToRefreshPermission]);
  const { language } = useAppSelector(({ language }) => language);

  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${language === LANGUAGES.russian ? 'Отключить оптимизацию батареи' : 'Turn off battery optimization'}`}</Text>
      <Switch
        value={!isAppOptimizedByPhone}
        onValueChange={async () => {
          try {
            batteryOptimizationEnabledModalRef.current?.present();
          } catch (error) {
            showCrossPlatformToast(JSON.stringify(error));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
});
