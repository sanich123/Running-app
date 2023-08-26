import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import AcceptDeclineBtns from '../../../components/accept-decline-btns/accept-decline-btns';
import Checkbox from '../../../components/checkbox/checkbox';
import ChoosePhotoBtn from '../../../components/choose-photo-btn/choose-photo-btn';
import TextInputs from '../../../components/text-inputs/text-inputs';
import { EMOTIONS_TYPES, SPORT_TYPES } from '../../../constants/btns-props';
import { SaveActivityContext } from '../../../utils/context/save-activity';
import useGetActivityInfo from '../../../utils/hooks/use-get-activity-info';

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
    photoUrl,
    setPhotoUrl,
  } = useGetActivityInfo();

  return (
    <ScrollView style={styles.container}>
      <SaveActivityContext.Provider
        value={{
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
          photoUrl,
          setPhotoUrl,
        }}>
        <TextInputs />
        <SegmentedButtons value={sport} onValueChange={setSport} buttons={SPORT_TYPES} style={{ marginTop: 15 }} />
        <SegmentedButtons
          value={emotion}
          onValueChange={setEmotion}
          buttons={EMOTIONS_TYPES}
          style={{ marginTop: 15 }}
        />
        <Checkbox />
        <ChoosePhotoBtn />
        <AcceptDeclineBtns />
      </SaveActivityContext.Provider>

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
