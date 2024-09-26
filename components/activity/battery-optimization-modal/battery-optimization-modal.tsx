import { View } from 'react-native';
import { RefObject, useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
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
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <BottomSheetModal
      ref={batteryOptimizationEnabledModalRef}
      index={0}
      snapPoints={['75%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.onSecondary }}>
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
