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
import { setIsNeedToResetInputs } from '../../../redux/activity/activity';
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
    isDisabled,
    setIsDisabled,
    images,
    setImages,
    isLoading,
    setIsLoading,
    setPhotoUrls,
  } = useGetActivityInfo();
  const { isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isNeedToResetInputs) {
      setTitle('');
      setDescription('');
      setSport('');
      setEmotion('');
      setIsSwitchOn(false);
      setPhotoUrls([]);
      setImages([]);
      dispatch(setIsNeedToResetInputs(false));
    }
  }, [isNeedToResetInputs]);
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
