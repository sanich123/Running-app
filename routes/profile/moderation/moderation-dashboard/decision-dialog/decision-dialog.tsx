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
    pendingDecision?.kind === 'action' ? copy.action[pendingDecision.action] : copy.appealDecision;

  return (
    <Portal>
      <Dialog visible={Boolean(pendingDecision)} onDismiss={onDismiss} style={RESPONSIVE_DIALOG_STYLE}>
        <Dialog.Title>{pendingActionLabel}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{copy.confirm}</Text>
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
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSaving}>
            {copy.cancel}
          </Button>
          <Button onPress={onConfirm} loading={isSaving} disabled={isSaving}>
            {copy.confirmAction}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
