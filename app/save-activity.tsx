import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { Text, View } from '../components/Themed';

export default function SaveResult() {
  const { container, title, textInput, largeInput } = styles;
  return (
    <View style={container}>
      <Text style={title}>Save Activity</Text>

      <TextInput style={textInput} placeholder="Title your ran" />
      <TextInput style={[textInput, largeInput]} placeholder="How'd it go? Share more about your activity and use @ to tag someone." multiline />
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'flex-start',
  },
  textInput: {
    borderColor: 'gray',
    width: '100%',
    borderWidth: 1,
    padding: 10,
  },
  largeInput: {
    display: 'flex',
    height: 60,
  },
});
