import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, useTheme, Text } from 'react-native-paper';
import { LocationPermissionResponse } from 'expo-location';
import { showCrossPlatformToast } from '@U/custom-toast';

export default function ForegroundLocationModal({
  foregroundLocationEnableModalRef,
  requestForegroundPermission,
}: {
  foregroundLocationEnableModalRef: RefObject<BottomSheetModal>;
  requestForegroundPermission: () => Promise<LocationPermissionResponse>;
}) {
  const { colors } = useTheme();
  // const [, requestForegroundPermission] = useForegroundPermissions();
  return (
    <BottomSheetModal
      ref={foregroundLocationEnableModalRef}
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
            Для работы приложения нужно дать права на отслеживание местоположения телефона
          </Text>
          <Button
            mode="outlined"
            style={{ marginTop: 15 }}
            onPress={async () => {
              try {
                foregroundLocationEnableModalRef.current?.close();
                await requestForegroundPermission();
              } catch (error) {
                showCrossPlatformToast(JSON.stringify(error));
              }
            }}>
            Дать доступ к местоположению
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
