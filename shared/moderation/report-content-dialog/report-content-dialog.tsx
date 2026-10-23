import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, RadioButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useSubmitContentReportMutation } from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { CONTENT_REPORT_REASONS, REPORT_CONTENT_COPY } from './const';
import type { ReportContentDialogProps } from './types';
import type { ContentReportReason } from '@R/services/moderation/types';

export default function ReportContentDialog({ visible, targetType, targetId, onDismiss }: ReportContentDialogProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const copy = REPORT_CONTENT_COPY[language];
  const detailsLabel = targetType === 'user' ? copy.profileDetails : copy.details;
  const [reason, setReason] = useState<ContentReportReason>('harassment');
  const [details, setDetails] = useState('');
  const [submitReport, { isLoading }] = useSubmitContentReportMutation();

  const dismiss = () => {
    if (isLoading) return;
    setDetails('');
    setReason('harassment');
    onDismiss();
  };

  const submit = async () => {
    try {
      await submitReport({
        targetType,
        targetId,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
      }).unwrap();
      successToast(copy.sent);
      setDetails('');
      setReason('harassment');
      onDismiss();
    } catch (error) {
      errorToast(copy.error, error);
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={dismiss}
        dismissable={!isLoading}
        dismissableBackButton={!isLoading}
        style={[
          styles.dialog,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            marginHorizontal: 16,
            width: Math.min(Math.max(width - 32, 0), 520),
          },
        ]}>
        <Dialog.Title style={[styles.title, { color: colors.onSurface }]}>{copy.title}</Dialog.Title>
        <Dialog.ScrollArea
          style={[
            styles.scrollArea,
            {
              borderBottomColor: colors.outlineVariant,
              borderTopColor: colors.outlineVariant,
              maxHeight: Math.min(500, Math.max(height - 220, 120)),
            },
          ]}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {copy.prompt}
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
            />
            {targetType === 'user' ? (
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {copy.profileDetailsHint}
              </Text>
            ) : null}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.actions}>
          <Button compact onPress={dismiss} disabled={isLoading} textColor={colors.onSurfaceVariant}>
            {copy.cancel}
          </Button>
          <Button compact mode="contained" onPress={() => void submit()} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" /> : copy.submit}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { alignSelf: 'center', borderRadius: 20, borderWidth: 1 },
  title: { fontSize: 20, lineHeight: 28, paddingBottom: 0, paddingTop: 4 },
  scrollArea: { maxHeight: 500 },
  content: { gap: 8, paddingBottom: 12, paddingTop: 12 },
  reason: { borderRadius: 12, borderWidth: 1, marginBottom: 4, minHeight: 44, paddingVertical: 0 },
  reasonLabel: { fontSize: 14, lineHeight: 20 },
  details: { minHeight: 84 },
  actions: { paddingHorizontal: 16, paddingBottom: 12 },
});
