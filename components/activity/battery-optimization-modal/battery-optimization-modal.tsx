import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useTheme, Button, Text } from 'react-native-paper';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { BATTERY_OPTIMIZATION } from './const';
import { useAppSelector } from '@R/typed-hooks';

export default function BatteryOptimizationModal({
  batteryOptimizationEnabledModalRef,
  setIsNeedToRefreshPermission,
}: {
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  return (
    <BottomSheetModal
      ref={batteryOptimizationEnabledModalRef}
      index={0}
      snapPoints={['75%']}
      handleStyle={{ borderBottomColor: colors.onBackground }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.background }}>
        <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 5 }}>
          <Text variant="bodyLarge">{BATTERY_OPTIMIZATION[language].optimizationMessage}</Text>
          <Button
            mode="outlined"
            style={{ marginTop: 15 }}
            onPress={async () => {
              try {
                const request = await startActivityAsync(ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                if (request) {
                  setIsNeedToRefreshPermission(true);
                  batteryOptimizationEnabledModalRef.current?.close();
                }
              } catch (error) {
                showCrossPlatformToast(JSON.stringify(error));
              }
            }}>
            {BATTERY_OPTIMIZATION[language].unoptimizeApp}
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
