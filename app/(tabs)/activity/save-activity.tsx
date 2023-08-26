import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import { View } from '../../../components/Themed';
import AcceptDeclineBtns from '../../../components/accept-decline-btns/accept-decline-btns';
import Checkbox from '../../../components/checkbox/checkbox';
import ChoosePhotoBtn from '../../../components/choose-photo-btn/choose-photo-btn';
import TextInputs from '../../../components/text-inputs/text-inputs';
import { EMOTIONS_TYPES, SPORT_TYPES } from '../../../constants/btns-props';
import UseGetActivityInfo from '../../../utils/hooks/use-get-activity-info';

export default function SaveResult() {
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
    <ScrollView style={styles.container}>
      {/* <View style={styles.container}> */}
      <TextInputs title={title} description={description} setTitle={setTitle} setDescription={setDescription} />
      <SegmentedButtons value={sport} onValueChange={setSport} buttons={SPORT_TYPES} style={{ marginTop: 15 }} />
      <SegmentedButtons value={emotion} onValueChange={setEmotion} buttons={EMOTIONS_TYPES} style={{ marginTop: 15 }} />
      <Checkbox isSwitchOn={isSwitchOn} setIsSwitchOn={setIsSwitchOn} />
      <ChoosePhotoBtn />
      <AcceptDeclineBtns
        title={title}
        description={description}
        sport={sport}
        emotion={emotion}
        isSwitchOn={isSwitchOn}
      />

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
});
