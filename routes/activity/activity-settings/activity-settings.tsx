import { useCallback, useRef } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { KeyboardAwareScrollView, type KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { StyleSheet, View } from 'react-native';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SETTINGS } from './const';
import RemindersSettings from './reminders-settings/reminders-settings';
import VoiceSettings from './voice-settings/voice-settings';
import type { ActivitySettingsProps } from './types';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export default function ActivitySettings({
  settingsModalRef,
  locationInfoModalRef: providedLocationInfoModalRef,
}: ActivitySettingsProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const settingsScrollViewRef = useRef<KeyboardAwareScrollViewRef>(null);
  const fallbackLocationInfoModalRef = useRef<BottomSheetModal>(null);
  const locationInfoModalRef = providedLocationInfoModalRef ?? fallbackLocationInfoModalRef;
  const labels = ACTIVITY_SETTINGS[language];

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );

  const scrollToReminderFields = useCallback(() => {
    const scrollToEnd = () => settingsScrollViewRef.current?.scrollTo({ y: 10000, animated: true });

    requestAnimationFrame(() => {
      scrollToEnd();
      requestAnimationFrame(scrollToEnd);
    });
  }, []);

  return (
    <BottomSheetModal
      ref={settingsModalRef}
      index={0}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      <KeyboardAwareScrollView
        ref={settingsScrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        mode="layout"
        bottomOffset={24}
        ScrollViewComponent={BottomSheetScrollView as never}>
        <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
          {labels.title}
        </Text>

        <VoiceSettings />
        <Divider />
        <RemindersSettings scrollToReminderFields={scrollToReminderFields} />
        <Divider />
        <TouchableRipple
          testID="activity-location-info-button"
          borderless
          onPress={() => locationInfoModalRef.current?.present()}
          style={styles.locationInfoRow}>
          <View style={styles.locationInfoRowContent}>
            <View style={styles.rowCopy}>
              <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                {labels.locationTrackingInfoTitle}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {labels.locationTrackingInfoDescription}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </View>
        </TouchableRipple>
      </KeyboardAwareScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, padding: 20, paddingBottom: 36 },
  locationInfoRow: { borderRadius: 12, overflow: 'hidden' },
  locationInfoRowContent: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 8 },
  rowCopy: { flex: 1, gap: 2 },
});
