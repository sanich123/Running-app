import { StyleSheet, View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { ROUTES } from '@const/enums';

export default function NotFoundScreen() {
  const { container, title, link, linkText } = styles;
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={container}>
        <Text style={title}>This screen does not exist.</Text>
        <Link href={`/${ROUTES.signIn}`} style={link}>
          <Text style={linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
