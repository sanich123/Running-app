import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import AcceptDeclineBtns from '../../../components/accept-decline-btns/accept-decline-btns';
import Checkbox from '../../../components/checkbox/checkbox';
import EmotionBtns from '../../../components/segmented-btns/emotion-btns';
import SportsBtns from '../../../components/segmented-btns/sports-btns';
import TextInputs from '../../../components/text-inputs/text-inputs';
import UploadPhotosBtn from '../../../components/upload-photos-btn/upload-photos-btn';
import { saveActivity, setIsNeedToSendActivity } from '../../../redux/activity/activity';
import { useAddActivityByUserIdMutation } from '../../../redux/runich-api/runich-api';
import { SaveActivityContext } from '../../../utils/context/save-activity';
import { errorHandler } from '../../../utils/error-handler';
import useGetActivityInfo from '../../../utils/hooks/use-get-activity-info';

export default function SaveResult() {
  const { user } = useAuth();
  const [sendActivity] = useAddActivityByUserIdMutation();
  const router = useRouter();
  const { finishedActivity } = useSelector(({ location }) => location);
  const { isNeedToSend } = useSelector(({ activity }) => activity);
  const dispatch = useDispatch();

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
    if (isNeedToSend) submitHandler();
  }, [isNeedToSend]);

  async function submitHandler() {
    try {
      const body = { ...finishedActivity, title, description, sport, emotion, isSwitchOn, photoUrls: images };
      setIsDisabled(true);
      dispatch(saveActivity(body));
      await sendActivity({ body, id: user.id })
        .unwrap()
        .then((data) => {
          console.log(data);
          ToastAndroid.show('Successfully sended data to server!', ToastAndroid.SHORT);
          router.push('/(tabs)/home/');
          dispatch(setIsNeedToSendActivity(false));
        })
        .catch((error) => {
          ToastAndroid.show('Some error occured', ToastAndroid.SHORT);
          console.log(error);
        });
    } catch (error) {
      errorHandler(error);
    } finally {
      setIsDisabled(false);
    }
  }
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
