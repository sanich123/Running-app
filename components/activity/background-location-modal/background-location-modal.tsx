import { View } from 'react-native';
import { RefObject, useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
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
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <BottomSheetModal
      ref={backgroundLocationEnabledModalRef}
      index={0}
      snapPoints={['50%']}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <BottomSheetView style={{ flex: 1, padding: 10, backgroundColor: colors.onSecondary }}>
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
