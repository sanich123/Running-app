import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons, Text } from 'react-native-paper';

import { View } from '../components/Themed';

export default function SaveResult() {
  const { container } = styles;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('');

  return (
    <View style={container}>
      <TextInput
        mode="outlined"
        value={title}
        onChangeText={(title) => setTitle(title)}
        placeholder="Title your run"
        left={<TextInput.Icon icon="pencil" />}
      />
      <TextInput
        mode="outlined"
        value={description}
        onChangeText={(description) => setDescription(description)}
        placeholder="How'd it go? Share more about your activity"
        multiline
        style={{ minHeight: 100 }}
        left={<TextInput.Icon icon="pencil" />}
      />
      <SegmentedButtons
        value={sport}
        onValueChange={setSport}
        buttons={[
          {
            value: 'run',
            label: 'Running',
            icon: 'run',
          },
          {
            value: 'swim',
            label: 'Swimming',
            icon: 'swim',
          },
          { value: 'Bike', label: 'Riding', icon: 'bike' },
        ]}
        style={{ marginTop: 5 }}
      />
      <Pressable
        onPress={() => console.log({ title, description, sport })}
        style={({ pressed }) => [{ backgroundColor: pressed ? 'olive' : 'green' }, styles.wrapperCustom]}>
        {({ pressed }) => (
          <Text variant="titleMedium" style={{ color: 'white' }}>
            {pressed ? 'Saving...' : 'Save'}
          </Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => console.log({ title, description, sport })}
        style={({ pressed }) => [{ backgroundColor: pressed ? 'orange' : 'red' }, styles.wrapperCustom]}>
        {({ pressed }) => (
          <Text variant="titleMedium" style={{ color: 'white' }}>
            {pressed ? 'Discarding...' : 'Discard'}
          </Text>
        )}
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'flex-start',
  },
  wrapperCustom: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 5,
    padding: 10,
    marginTop: 15,
  },
});
