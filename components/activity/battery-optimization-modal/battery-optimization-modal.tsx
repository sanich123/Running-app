import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useTheme, Button, Text } from 'react-native-paper';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';

export default function BatteryOptimizationModal({
  batteryOptimizationEnabledModalRef,
  setIsNeedToRefreshPermission,
}: {
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal>;
  setIsNeedToRefreshPermission: (arg: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={batteryOptimizationEnabledModalRef}
      index={0}
      snapPoints={['75%']}
      onChange={(index: number) => {
        if (index === -1) {
          setIsNeedToRefreshPermission(true);
        }
      }}
      handleStyle={{ borderBottomColor: colors.onBackground }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyLarge">Ваш телефон оптимизирует батарею. </Text>
          <Text variant="bodyLarge">
            Несмотря на то, что приложению предоставлено разрешение отслеживать местоположение в фоновом режиме, через
            10-15 минут операционная система в целях экономии энергии закончит выполнение приложения и приложение
            перестанет получать данные о местоположении, тренировка не будет записана.
          </Text>
          <Text variant="bodyLarge">
            Чтобы этого избежать, надо снять все ограничения по оптимизации батареи телефоном
          </Text>
          <Text variant="bodyLarge">
            После нажатия кнопки появится окно системных настроек, в котором надо будет выбрать приложение Runich,
            появится меню настроек из 2х пунктов. Надо нажать на пункт фоновая активность. В появившемся меню снять все
            ограничения телефона
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
            Снять оптимизации батареи
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
