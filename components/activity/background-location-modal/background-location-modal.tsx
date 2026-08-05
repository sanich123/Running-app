import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
import { errorToast } from '@C/shared/error-toast/error-toast';
import { useAppSelector } from '@R/typed-hooks';
import { BACKGROUND_LOCATIONS } from './const';
import type { BackgroundLocationModalProps } from '../types';

export default function BackgroundLocationModal({
  backgroundLocationEnabledModalRef,
  requestBackgroundPermission,
}: BackgroundLocationModalProps) {
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
      handleStyle={[styles.handle, { backgroundColor: colors.surface }]}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.outline }}>
      <BottomSheetView style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={styles.title}>
          {language === 'russian' ? 'Фоновая геолокация' : 'Background location'}
        </Text>
        <View style={styles.paragraphs}>
          {BACKGROUND_LOCATIONS[language].needToAllow.split('\n\n').map((paragraph) => (
            <Text key={paragraph} variant="bodyLarge" style={{ color: colors.onSurface }}>
              {paragraph}
            </Text>
          ))}
        </View>
        <Button
          mode="contained"
          style={styles.button}
          onPress={async () => {
            try {
              await requestBackgroundPermission();
              backgroundLocationEnabledModalRef.current?.close();
            } catch (error) {
              errorToast('Не удалось получить доступ к фоновой геолокации', error);
            }
          }}>
          {BACKGROUND_LOCATIONS[language].giveAccess}
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
