import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useSubmitContentReportMutation } from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { CONTENT_REPORT_REASONS, REPORT_CONTENT_COPY } from './const';
import type { ReportContentDialogProps } from './types';
import type { ContentReportReason } from '@R/services/moderation/types';

export default function ReportContentDialog({ visible, targetType, targetId, onDismiss }: ReportContentDialogProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const isSheetPresentedRef = useRef(false);
  const { bottom: bottomInset, top: topInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = REPORT_CONTENT_COPY[language];
  const [reason, setReason] = useState<ContentReportReason>('harassment');
  const [details, setDetails] = useState('');
  const [submitReport, { isLoading }] = useSubmitContentReportMutation();
  const requiresDetails = reason === 'other';
  const detailsLabel = requiresDetails
    ? copy.requiredDetails
    : targetType === 'user'
      ? copy.profileDetails
      : copy.details;
  const detailsHint = requiresDetails
    ? copy.requiredDetailsHint
    : targetType === 'user'
      ? copy.profileDetailsHint
      : null;
  const isSubmitDisabled = isLoading || (requiresDetails && !details.trim());

  useEffect(() => {
    if (visible && !isSheetPresentedRef.current) {
      isSheetPresentedRef.current = true;
      sheetRef.current?.present();
    } else if (!visible && isSheetPresentedRef.current) {
      isSheetPresentedRef.current = false;
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={isLoading ? 'none' : 'close'}
      />
    ),
    [isLoading],
  );

  const handleDismiss = () => {
    isSheetPresentedRef.current = false;
    setDetails('');
    setReason('harassment');
    onDismiss();
  };

  const dismiss = () => {
    if (isLoading) return;
    if (sheetRef.current) {
      sheetRef.current.dismiss();
    } else {
      handleDismiss();
    }
  };

  const submit = async () => {
    if (isSubmitDisabled) return;

    try {
      await submitReport({
        targetType,
        targetId,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
      }).unwrap();
      successToast(copy.sent);
      dismiss();
    } catch (error) {
      errorToast(copy.error, error);
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={['50%', '100%']}
      enableDynamicSizing={false}
      enablePanDownToClose={!isLoading}
      topInset={topInset}
      style={styles.modal}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleStyle={[styles.handle, { backgroundColor: colors.surface }]}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      keyboardBlurBehavior="restore"
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize">
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={[styles.header, { borderBottomColor: colors.outlineVariant }]}>
          <Text variant="titleLarge" style={{ color: colors.onSurface }}>
            {copy.title}
          </Text>
        </View>
        <BottomSheetScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {copy.prompt[targetType]}
          </Text>
          <RadioButton.Group value={reason} onValueChange={(value) => setReason(value as ContentReportReason)}>
            {CONTENT_REPORT_REASONS.map((value) => (
              <RadioButton.Item
                key={value}
                label={copy.reasons[value]}
                value={value}
                labelVariant="bodyMedium"
                labelStyle={styles.reasonLabel}
                color={colors.primary}
                uncheckedColor={colors.outline}
                rippleColor={colors.primaryContainer}
                style={[
                  styles.reason,
                  {
                    backgroundColor: reason === value ? colors.primaryContainer : colors.surface,
                    borderColor: reason === value ? colors.primary : colors.outlineVariant,
                  },
                ]}
              />
            ))}
          </RadioButton.Group>
          <TextInput
            label={detailsLabel}
            value={details}
            onChangeText={setDetails}
            maxLength={1000}
            multiline
            mode="outlined"
            outlineColor={colors.outlineVariant}
            activeOutlineColor={colors.primary}
            style={[styles.details, { backgroundColor: colors.surface }]}
            testID="report-content-details"
            disabled={isLoading}
            render={Platform.OS === 'web' ? undefined : (inputProps) => <BottomSheetTextInput {...inputProps} />}
          />
          {detailsHint ? (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {detailsHint}
            </Text>
          ) : null}
        </BottomSheetScrollView>
        <View
          style={[styles.actions, { borderTopColor: colors.outlineVariant, paddingBottom: Math.max(bottomInset, 12) }]}>
          <Button compact onPress={dismiss} disabled={isLoading} textColor={colors.onSurfaceVariant}>
            {copy.cancel}
          </Button>
          <Button compact mode="contained" onPress={() => void submit()} disabled={isSubmitDisabled}>
            {isLoading ? <ActivityIndicator size="small" /> : copy.submit}
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modal: { maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', width: '100%' },
  handle: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  sheet: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  scrollArea: { flex: 1 },
  content: { gap: 8, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12 },
  reason: { borderRadius: 12, borderWidth: 1, marginBottom: 4, minHeight: 44, paddingVertical: 0 },
  reasonLabel: { fontSize: 14, lineHeight: 20 },
  details: { minHeight: 100 },
  actions: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
