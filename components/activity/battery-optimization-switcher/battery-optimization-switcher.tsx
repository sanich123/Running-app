import { View, StyleSheet } from 'react-native';

import { showCrossPlatformToast } from '@U/custom-toast';
import { Switch, Text } from 'react-native-paper';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
export default function BatteryOptimizationSwitcher({
  isAppOptimizedByPhone,
  setIsAppOptimizedByPhone,
}: {
  isAppOptimizedByPhone: boolean;
  setIsAppOptimizedByPhone: (arg: boolean) => void;
}) {
  return (
    <View style={styles.switcherWrapper}>
      <Text variant="titleSmall">{`${isAppOptimizedByPhone ? 'Отключить оптимизацию батареи' : 'Телефон не оптимизирует батарею'}`}</Text>
      <Switch
        value={!isAppOptimizedByPhone}
        onValueChange={async () => {
          try {
            const request = await startActivityAsync(ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            if (request) {
              BatteryOptEnabled().then((isEnabled: boolean) => setIsAppOptimizedByPhone(isEnabled));
            }
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
