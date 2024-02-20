import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NeedToConfirmEmail() {
  return (
    <>
      <Stack.Screen options={{ title: 'confirm-email-notification', headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          На указанный Вами адрес электронной почты отправлено письмо со cсылкой. Для того, чтобы подтвердить свой адрес
          электронной почты, перейдите по ссылке в письме
        </Text>
      </View>
    </>
  );
}
