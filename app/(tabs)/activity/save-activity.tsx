import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';

import AcceptDeclineBtns from '../../../components/accept-decline-btns/accept-decline-btns';
import Checkbox from '../../../components/checkbox/checkbox';
import ChoosePhotoBtn from '../../../components/choose-photo-btn/choose-photo-btn';
import EmotionBtns from '../../../components/segmented-btns/emotion-btns';
import SportsBtns from '../../../components/segmented-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
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
    isDisabled,
    setIsDisabled,
  } = useGetActivityInfo();

  return (
    <ScrollView style={styles.container}>
      <SaveActivityContext.Provider
        value={{
          title,
          description,
          sport,
          emotion,
          isSwitchOn,
          photoUrl,
          isDisabled,
          setIsDisabled,
          setTitle,
          setDescription,
          setSport,
          setEmotion,
          setIsSwitchOn,
          setPhotoUrl,
        }}>
        <TextInputs />
        <SportsBtns isDisabled={isDisabled} setSport={setSport} sport={sport} />
        <EmotionBtns isDisabled={isDisabled} setEmotion={setEmotion} emotion={emotion} />
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
