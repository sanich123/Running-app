import { View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { INTRO } from './const';

export default function Intro() {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ flex: 1, padding: 15, justifyContent: 'center' }}>
      <IconButton icon="run" size={100} style={{ marginTop: 70, marginHorizontal: 'auto' }} />
      <Text variant="titleLarge" style={{ marginTop: 20, marginHorizontal: 'auto', textAlign: 'center' }}>
        {INTRO[language].welcome}
      </Text>
      <Text variant="titleMedium" style={{ marginTop: 20, marginHorizontal: 'auto', textAlign: 'center' }}>
        {INTRO[language].features}
      </Text>
      <Text
        variant="titleLarge"
        style={{ marginTop: 30, marginHorizontal: 'auto', fontStyle: 'italic', textAlign: 'center' }}>
        {INTRO[language].coolSlogan}
      </Text>
    </View>
  );
}
