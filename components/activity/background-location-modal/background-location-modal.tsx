import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useTheme, Text, Button } from 'react-native-paper';
import { LocationPermissionResponse } from 'expo-location';

export default function BackgroundLocationModal({
  backgroundLocationEnabledModalRef,
  requestBackgroundPermission,
}: {
  backgroundLocationEnabledModalRef: RefObject<BottomSheetModal>;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
}) {
  const { colors } = useTheme();

  return (
    <BottomSheetModal
      ref={backgroundLocationEnabledModalRef}
      index={0}
      snapPoints={['50%']}
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
            Необходимо дать разрешение на получение данных о местоположении все время. Не волнуйтесь, Ваши данные нам
            совершенно не нужны. Это делается из-за особенностей опеационной системы Android, когда вы выходите из
            приложения оно перестает работать, и перестает получать данные о локации, нужные приложению для сохранения
            данных о маршруте и метрик
          </Text>
          <Button
            mode="outlined"
            style={{ marginTop: 15 }}
            onPress={async () => {
              try {
                await requestBackgroundPermission();
                backgroundLocationEnabledModalRef.current?.close();
              } catch (error) {
                showCrossPlatformToast(JSON.stringify(error));
              }
            }}>
            Дать доступ к местоположению в фоне
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
