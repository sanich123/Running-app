import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, useTheme } from 'react-native-paper';
import { Text } from 'react-native-paper';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { showCrossPlatformToast } from '@U/custom-toast';

export default function LocationEnabledModal({
  locationEnabledModalRef,
  setUserGetBackFromEnablingLocation,
}: {
  locationEnabledModalRef: RefObject<BottomSheetModal>;
  setUserGetBackFromEnablingLocation: (arg: boolean) => void;
}) {
  const { colors } = useTheme();

  return (
    <BottomSheetModal
      ref={locationEnabledModalRef}
      index={0}
      snapPoints={['50%']}
      // onChange={(index: number) => {
      //   if (index === -1) {
      //     setVisibilityOfLocationEnabledModal(false);
      //   }
      // }}
      handleStyle={{ borderBottomColor: colors.onBackground }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 5, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">
            Похоже, что у вас выключена геолокация телефоне. Для работы сервиса ее надо обязательно включить
          </Text>
          <Button
            mode="outlined"
            onPress={async () => {
              try {
                const request = await startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
                if (request) {
                  setUserGetBackFromEnablingLocation(true);
                  locationEnabledModalRef.current?.forceClose();
                }
              } catch (error) {
                showCrossPlatformToast(JSON.stringify(error));
              }
            }}>
            Включить геолокацию
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
