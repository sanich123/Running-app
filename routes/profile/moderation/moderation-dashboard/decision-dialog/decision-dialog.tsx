import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import { styles } from './decision-dialog.styles';
import type { ModerationDecisionDialogProps } from '../types';

export default function DecisionDialog({
  pendingDecision,
  isSaving,
  decisionNote,
  onDecisionNoteChange,
  suspensionDays,
  onSuspensionDaysChange,
  language,
  copy,
  onDismiss,
  onConfirm,
}: ModerationDecisionDialogProps) {
  const pendingActionLabel =
    pendingDecision?.kind === 'action'
      ? copy.action[pendingDecision.action]
      : pendingDecision?.kind === 'delete-report'
        ? copy.deleteReport
        : copy.appealDecision;

  return (
    <Portal>
      <Dialog visible={Boolean(pendingDecision)} onDismiss={onDismiss} style={RESPONSIVE_DIALOG_STYLE}>
        <Dialog.Title>{pendingActionLabel}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            {pendingDecision?.kind === 'delete-report' ? copy.deleteReportWarning : copy.confirm}
          </Text>
          {pendingDecision?.kind === 'action' && pendingDecision.action === 'temporary_suspend' ? (
            <TextInput
              label={language === LANGUAGES.russian ? 'Срок блокировки, дней' : 'Suspension days'}
              value={suspensionDays}
              onChangeText={onSuspensionDaysChange}
              keyboardType="number-pad"
              style={styles.input}
              testID="moderation-suspension-days"
            />
          ) : null}
          {pendingDecision?.kind !== 'delete-report' ? (
            <TextInput
              label={copy.note}
              placeholder={copy.noteHint}
              value={decisionNote}
              onChangeText={onDecisionNoteChange}
              multiline
              maxLength={1000}
              style={styles.input}
              testID="moderation-decision-note"
            />
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSaving}>
            {copy.cancel}
          </Button>
          <Button onPress={onConfirm} loading={isSaving} disabled={isSaving}>
            {pendingDecision?.kind === 'delete-report' ? copy.deleteReportConfirm : copy.confirmAction}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
