import AcceptDeclineBtns from '@c/accept-decline-btns/accept-decline-btns';
import Checkbox from '@c/checkbox/checkbox';
import EmotionBtns from '@c/segmented-btns/emotion-btns';
import SportsBtns from '@c/segmented-btns/sports-btns';
import TextInputs from '@c/text-inputs/text-inputs';
import UploadPhotosBtn from '@c/upload-photos-btn/upload-photos-btn';
import { SaveActivityContext } from '@u/context/save-activity';
import useGetActivityInfo from '@u/hooks/use-get-activity-info';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';

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
    isDisabled,
    setIsDisabled,
    images,
    setImages,
    isLoading,
    setIsLoading,
  } = useGetActivityInfo();

  return (
    <ScrollView style={styles.container}>
      <SaveActivityContext.Provider
        value={{
          title,
          setTitle,
          description,
          sport,
          emotion,
          isSwitchOn,
          isDisabled,
          images,
          setIsDisabled,
          setDescription,
          setSport,
          setEmotion,
          setIsSwitchOn,
          setImages,
          isLoading,
          setIsLoading,
        }}>
        <TextInputs />
        <SportsBtns isDisabled={isDisabled} setSport={setSport} sport={sport} />
        <EmotionBtns isDisabled={isDisabled} setEmotion={setEmotion} emotion={emotion} />
        <Checkbox />
        <UploadPhotosBtn />
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
