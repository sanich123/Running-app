import { useCallback, useRef } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { View, StyleSheet } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import MapControlButton from '@S/map-control-button/map-control-button';
import { BATTERY_OPTIMIZATION } from './const';
import { useActivityMapContext } from '../map/activity-map-context';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export default function BatteryOptimizationModal() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    batteryOptimization: { isActive, setIsNeedToRefreshPermission },
  } = useActivityMapContext();
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <>
      {isActive ? (
        <MapControlButton
          testID="battery-optimization-info"
          androidIcon="information-outline"
          iosSymbol="info.circle"
          iconColor={colors.primary}
          onPress={() => batteryOptimizationEnabledModalRef.current?.present()}
          accessibilityLabel="Информация об оптимизации батареи"
        />
      ) : null}
      <BottomSheetModal
        ref={batteryOptimizationEnabledModalRef}
        index={0}
        snapPoints={['60%']}
        backdropComponent={renderBackdrop}
        handleStyle={[styles.handle, { backgroundColor: colors.surface }]}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.outline }}>
        <BottomSheetView style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Text variant="titleMedium" style={styles.title}>
            {language === 'russian' ? 'Оптимизация батареи' : 'Battery optimization'}
          </Text>
          <View style={styles.paragraphs}>
            {BATTERY_OPTIMIZATION[language].optimizationMessage.split('\n\n').map((paragraph) => (
              <Text key={paragraph} variant="bodyLarge" style={{ color: colors.onSurface }}>
                {paragraph}
              </Text>
            ))}
          </View>
          <Button
            testID="battery-optimization-open-settings"
            mode="contained"
            style={styles.button}
            onPress={async () => {
              try {
                const request = await startActivityAsync(ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                if (request) {
                  setIsNeedToRefreshPermission(true);
                  batteryOptimizationEnabledModalRef.current?.close();
                }
              } catch (error) {
                errorToast('Не удалось изменить оптимизацию батареи', error);
              }
            }}>
            {BATTERY_OPTIMIZATION[language].unoptimizeApp}
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  handle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheet: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 },
  title: { fontWeight: '800' },
  paragraphs: { gap: 14, marginTop: 16 },
  button: { marginTop: 28 },
});
