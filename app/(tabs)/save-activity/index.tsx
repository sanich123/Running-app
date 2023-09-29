import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Checkbox from '../../../components/checkbox/checkbox';
import DeclineBtn from '../../../components/decline-btn/decline-btn';
import EmotionBtns from '../../../components/segmented-btns/emotion-btns';
import SportsBtns from '../../../components/segmented-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
import UploadPhotosBtn from '../../../components/upload-photos-btn/upload-photos-btn';
import { saveActivity } from '../../../redux/activity/activity';
import { SaveActivityContext } from '../../../utils/context/save-activity';
import useGetActivityInfo from '../../../utils/hooks/use-get-activity-info';

export default function SaveResult() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { finishedActivity } = useSelector(({ location }) => location);
  const { isNeedToSend } = useSelector(({ activity }) => activity);

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

  useEffect(() => {
    if (isNeedToSend) {
      const body = { ...finishedActivity, title, description, sport, emotion, isSwitchOn, photoUrls: images };
      setIsDisabled(true);
      dispatch(saveActivity(body));
      router.push('/(tabs)/home/');
      setIsDisabled(false);
    }
  }, [isNeedToSend]);

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
        <DeclineBtn />
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
