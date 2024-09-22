import { View } from 'react-native';
import { RefObject } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useTheme, Text, Button } from 'react-native-paper';
import { LocationPermissionResponse } from 'expo-location';
import { useAppSelector } from '@R/typed-hooks';
import { BACKGROUND_LOCATIONS } from './const';

export default function BackgroundLocationModal({
  backgroundLocationEnabledModalRef,
  requestBackgroundPermission,
}: {
  backgroundLocationEnabledModalRef: RefObject<BottomSheetModal>;
  requestBackgroundPermission: () => Promise<LocationPermissionResponse>;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <BottomSheetModal
      ref={backgroundLocationEnabledModalRef}
      index={0}
      snapPoints={['50%']}
      handleStyle={{ borderBottomColor: colors.onBackground }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 10, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyLarge">{BACKGROUND_LOCATIONS[language].needToAllow}</Text>
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
            {BACKGROUND_LOCATIONS[language].giveAccess}
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
