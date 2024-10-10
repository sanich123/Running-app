import { useWindowDimensions, View } from 'react-native';
import React from 'react';
import { IconButton, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { INTRO } from './const';

export default function Intro() {
  const { height } = useWindowDimensions();
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ height: height * 0.5, padding: 10 }}>
      <IconButton icon="run" size={100} style={{ marginTop: 70, marginHorizontal: 'auto' }} />
      <Text variant="titleLarge" style={{ marginTop: 20, marginHorizontal: 'auto' }}>
        {INTRO[language].welcome}
      </Text>
      <Text variant="titleMedium" style={{ marginTop: 20, marginHorizontal: 'auto' }}>
        {INTRO[language].features}
      </Text>
      <Text variant="titleLarge" style={{ marginTop: 30, marginHorizontal: 'auto', fontStyle: 'italic' }}>
        {INTRO[language].coolSlogan}
      </Text>
    </View>
  );
}
