import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuth } from '../auth/context/auth-context';

export default function Page() {
  const { user } = useAuth();

  if (!user) {
    console.log('redirecting to login');
    return <Redirect href="/sign-in" />;
  } else if (user) {
    console.log('redirect to home');
    return <Redirect href="/home" />;
  }

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
