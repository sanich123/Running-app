import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SegmentedButtons, Button, Switch, Text } from 'react-native-paper';

import { View } from '../components/Themed';
import TextInputs from '../components/text-inputs/text-inputs';
import { EMOTIONS_TYPES, SPORT_TYPES } from '../constants/btns-props';
import UseGetActivityInfo from '../hooks/use-get-activity-info';
import { getFromAsyncStorage, setToAsyncStorage } from '../utils/async-storage-utils';

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
      <TextInputs title={title} description={description} setTitle={setTitle} setDescription={setDescription} />
      <SegmentedButtons value={sport} onValueChange={setSport} buttons={SPORT_TYPES} style={marginTop} />
      <SegmentedButtons value={emotion} onValueChange={setEmotion} buttons={EMOTIONS_TYPES} style={marginTop} />
      <View style={switcherWrapper}>
        <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(!isSwitchOn)} />
        <Text variant="titleSmall">Don't publish on Home or Club feeds</Text>
      </View>

      <Button
        icon="hand-okay"
        mode="contained"
        onPress={async () => setToAsyncStorage('userData', { title, description, sport, emotion, isSwitchOn })}
        style={marginTop}>
        Save
      </Button>
      <Button
        icon="delete-outline"
        mode="outlined"
        onPress={async () => getFromAsyncStorage('userData')}
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
