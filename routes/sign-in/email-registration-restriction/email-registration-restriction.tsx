import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import { EMAIL_REGISTRATION_RESTRICTION_COPY } from './const';

export default function EmailRegistrationRestriction() {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = EMAIL_REGISTRATION_RESTRICTION_COPY[language];

  return (
    <>
      <Pressable
        testID="registration-email-restriction"
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={styles.trigger}>
        <Text
          variant="bodySmall"
          style={[styles.triggerText, { color: colors.primary, textDecorationLine: 'underline' }]}>
          {copy.trigger}
        </Text>
      </Pressable>

      <Portal>
        <Dialog
          testID="registration-email-restriction-dialog"
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={[RESPONSIVE_DIALOG_STYLE, { backgroundColor: colors.surface }]}>
          <Dialog.Title>{copy.title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.modalText}>
              {copy.description}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              testID="registration-email-restriction-dialog-close"
              textColor={colors.primary}
              onPress={() => setVisible(false)}>
              {copy.close}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignSelf: 'stretch',
    paddingHorizontal: 4,
  },
  triggerText: {
    textAlign: 'left',
  },
  modalText: {
    textAlign: 'justify',
  },
});
