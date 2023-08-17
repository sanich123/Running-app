import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons, Button, Switch, Text } from 'react-native-paper';

import { View } from '../components/Themed';
import { EMOTIONS_TYPES, SPORT_TYPES } from '../constants/btns-props';
import UseGetActivityInfo from '../hooks/use-get-activity-info';

export default function SaveResult() {
  const { container, switcherWrapper, marginTop } = styles;
  const {
    title,
    setTitle,
    description,
    setDescription,
    sport,
    setSport,
    emotion,
    setEmotion,
    isSwitchOn,
    setIsSwitchOn,
  } = UseGetActivityInfo();
  return (
    <View style={container}>
      <TextInput
        mode="outlined"
        value={title}
        onChangeText={(title) => setTitle(title)}
        placeholder="Title your run"
        left={<TextInput.Icon icon="pencil" />}
        style={marginTop}
      />
      <TextInput
        mode="outlined"
        value={description}
        onChangeText={(description) => setDescription(description)}
        placeholder="How'd it go? Share more about your activity"
        multiline
        style={[marginTop, { minHeight: 150 }]}
        left={<TextInput.Icon icon="pencil" />}
      />
      <SegmentedButtons value={sport} onValueChange={setSport} buttons={SPORT_TYPES} style={marginTop} />
      <SegmentedButtons value={emotion} onValueChange={setEmotion} buttons={EMOTIONS_TYPES} style={marginTop} />
      <View style={switcherWrapper}>
        <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(!isSwitchOn)} />
        <Text variant="titleSmall">Don't publish on Home or Club feeds</Text>
      </View>

      <Button
        icon="hand-okay"
        mode="contained"
        onPress={async () => {
          try {
            await AsyncStorage.setItem('userData', JSON.stringify({ title, description, sport, emotion, isSwitchOn }));
          } catch (error) {
            console.log(`During saving to the async storage an error occured`, error);
          }
        }}
        style={marginTop}>
        Save
      </Button>
      <Button
        icon="delete-outline"
        mode="outlined"
        onPress={async () => {
          try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              console.log(JSON.parse(userData));
            }
          } catch (error) {
            console.log(`During parsing from the async storage an error occured`, error);
          }
        }}
        style={marginTop}>
        Discard
      </Button>

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
  switcherWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  marginTop: {
    marginTop: 15,
  },
});
