import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function EmailRegistrationRestriction() {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;

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
          {isRussian
            ? '* Регистрация по email — только с адресом российского почтового оператора (.ru или .рф).'
            : '* Email registration is available only with an address from a Russian email provider (.ru or .рф).'}
        </Text>
      </Pressable>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ backgroundColor: colors.surface }}>
          <Dialog.Title>{isRussian ? 'Ограничение регистрации' : 'Email registration restriction'}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {isRussian
                ? 'С 1 декабря 2023 года Федеральный закон от 31 июля 2023 г. № 406-ФЗ запретил российским сайтам регистрировать пользователей, находящихся в РФ, с использованием иностранной электронной почты. Поэтому Runich принимает email для регистрации только в российских доменных зонах .ru и .рф. Правило применяется ко всей регистрации по email; вход и восстановление доступа к ранее созданным аккаунтам не ограничиваются.'
                : 'From 1 December 2023, Federal Law No. 406-FZ of 31 July 2023 prohibited Russian websites from registering users located in Russia with foreign email. Therefore Runich accepts only .ru and .рф addresses for email registration. The rule applies to all email registrations; sign-in and recovery for existing accounts are not restricted.'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor={colors.primary} onPress={() => setVisible(false)}>
              {isRussian ? 'Закрыть' : 'Close'}
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
});
