import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { View } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { BATTERY_OPTIMIZATION } from './const';
import type { BatteryOptimizationModalProps } from '../types';

export default function BatteryOptimizationModal({
  batteryOptimizationEnabledModalRef,
  setIsNeedToRefreshPermission,
}: BatteryOptimizationModalProps) {
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
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 15, backgroundColor: colors.background }}>
        <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 5 }}>
          <Text variant="bodyLarge" style={{ textAlign: 'justify' }}>
            {BATTERY_OPTIMIZATION[language].optimizationMessage}
          </Text>
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
