import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, RadioButton, Text, TextInput } from 'react-native-paper';
import { useSubmitContentReportMutation } from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { CONTENT_REPORT_REASONS, REPORT_CONTENT_COPY } from './const';
import type { ReportContentDialogProps } from './types';
import type { ContentReportReason } from '@R/services/moderation/types';

export default function ReportContentDialog({ visible, targetType, targetId, onDismiss }: ReportContentDialogProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = REPORT_CONTENT_COPY[language];
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
      <Dialog visible={visible} onDismiss={dismiss} dismissable={!isLoading} dismissableBackButton={!isLoading}>
        <Dialog.Title>{copy.title}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="bodyMedium">{copy.prompt}</Text>
            <RadioButton.Group value={reason} onValueChange={(value) => setReason(value as ContentReportReason)}>
              {CONTENT_REPORT_REASONS.map((value) => (
                <RadioButton.Item key={value} label={copy.reasons[value]} value={value} />
              ))}
            </RadioButton.Group>
            <TextInput
              label={copy.details}
              value={details}
              onChangeText={setDetails}
              maxLength={1000}
              multiline
              mode="outlined"
              style={styles.details}
              testID="report-content-details"
              disabled={isLoading}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={dismiss} disabled={isLoading}>
            {copy.cancel}
          </Button>
          <Button onPress={() => void submit()} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" /> : copy.submit}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollArea: { maxHeight: 500 },
  content: { gap: 8, paddingBottom: 16 },
  details: { minHeight: 92 },
});
