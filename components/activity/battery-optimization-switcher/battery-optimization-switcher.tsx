import { View, StyleSheet } from 'react-native';

import { showCrossPlatformToast } from '@U/custom-toast';
import { Switch, Text } from 'react-native-paper';
//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { RefObject, useEffect } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function BatteryOptimizationSwitcher({
  isAppOptimizedByPhone,
  setIsAppOptimizedByPhone,
  batteryOptimizationEnabledModalRef,
  setIsNeedToRefreshPermission,
  isNeedToRefreshPermission,
}: {
  isAppOptimizedByPhone: boolean;
  setIsAppOptimizedByPhone: (arg: boolean) => void;
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
  isNeedToRefreshPermission: boolean;
}) {
  useEffect(() => {
    if (isAppOptimizedByPhone || isNeedToRefreshPermission) {
      BatteryOptEnabled().then((isEnabled: boolean) => {
        setIsAppOptimizedByPhone(isEnabled);
        setIsNeedToRefreshPermission(false);
      });
    }
  }, [isAppOptimizedByPhone, setIsAppOptimizedByPhone, isNeedToRefreshPermission, setIsNeedToRefreshPermission]);

  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${isAppOptimizedByPhone ? 'Отключить оптимизацию батареи' : 'Телефон не оптимизирует батарею'}`}</Text>
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
