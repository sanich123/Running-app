import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SETTINGS } from '../const';
import type { ActivityLocationInfoModalProps } from './types';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export default function ActivityLocationInfoModal({ modalRef }: ActivityLocationInfoModalProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const labels = ACTIVITY_SETTINGS[language];
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <BottomSheetScrollView
        testID="activity-location-info-details"
        contentContainerStyle={styles.content}
        style={{ backgroundColor: colors.surface }}>
        <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
          {labels.locationTrackingTitle}
        </Text>
        <View style={styles.paragraphs}>
          {labels.locationTrackingDetails.split('\n\n').map((paragraph) => (
            <Text key={paragraph} variant="bodyLarge" style={[styles.paragraph, { color: colors.onSurface }]}>
              {paragraph}
            </Text>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 20, paddingBottom: 36 },
  paragraphs: { gap: 14 },
  paragraph: { textAlign: 'justify' },
});
