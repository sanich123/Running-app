import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { StyleSheet, View } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
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
  );
}

const styles = StyleSheet.create({
  handle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheet: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 },
  title: { fontWeight: '800' },
  paragraphs: { gap: 14, marginTop: 16 },
  button: { marginTop: 28 },
});
