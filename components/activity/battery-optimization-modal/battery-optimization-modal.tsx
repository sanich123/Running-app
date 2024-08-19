import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useTheme, Button, Text } from 'react-native-paper';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';

export default function BatteryOptimizationModal({
  batteryOptimizationEnabledModalRef,
}: {
  batteryOptimizationEnabledModalRef: RefObject<BottomSheetModal>;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal
      ref={batteryOptimizationEnabledModalRef}
      index={0}
      snapPoints={['75%']}
      //   onChange={(index: number) => {
      //     if (index === -1) {
      //       setVisibilityOfLocationEnabledModal(false);
      //     }
      //   }}
      handleStyle={{ borderBottomColor: colors.onBackground }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyLarge">
            Ваш телефон оптимизирует батарею путем выключения приложения. Скорее всего, через 10-15 минут операционная
            система закончит выполнение приложения, и оно перестанет работать. Ваша тренировка не будет записана, а
            продолжится с того места, как вы снова войдете в приложение. Это не лучшее поведение приложения, которого
            нужно избежать. После нажатия кнопки вы увидите системные настройки телефона. Там надо выбрать приложение
            Runich, в появившемся окне выбрать контроль фоновой активности и в открывшемся окне выбрать не
            оптимизировать приложение.
          </Text>
          <Button
            mode="outlined"
            style={{ marginTop: 15 }}
            onPress={async () => {
              try {
                const request = await startActivityAsync(ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                if (request) {
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
