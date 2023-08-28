import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';

import { View } from '../../../components/Themed';
import AvatarIcon from '../../../components/avatar/avatar';
import InputBio from '../../../components/input-bio/input-bio';
import InputDatepicker from '../../../components/input-datepicker/input-datepicker';
import InputsNameSurname from '../../../components/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '../../../components/inputs-weight-city/inputs-weight-city';
import { GENDER_TYPES, SPORT_TYPES } from '../../../constants/btns-props';
import { FIREBASE_STORAGE } from '../../../firebaseConfig';
import { setToAsyncStorage } from '../../../utils/async-storage-utils';
import { SaveSettingsContext } from '../../../utils/context/settings';
import { errorHandler } from '../../../utils/error-handler';
import { getBlobFromUri, getInfoFromUri } from '../../../utils/file-sending';
import useGetSettings from '../../../utils/hooks/use-get-settings';

export default function ProfileSettings() {
  const {
    gender,
    sport,
    name,
    surname,
    city,
    weight,
    bio,
    inputDate,
    image,
    photoUrl,
    setGender,
    setSport,
    setName,
    setSurname,
    setCity,
    setWeight,
    setBio,
    setInputDate,
    setImage,
    isLoading,
    isDisabled,
    setIsLoading,
    setIsDisabled,
    setPhotoUrl,
  } = useGetSettings();

  async function submitHandler() {
    try {
      setIsDisabled(true);
      setIsLoading(true);
      const blob = await getBlobFromUri(image);
      const fileName = getInfoFromUri(image);
      const storageRef = ref(FIREBASE_STORAGE, fileName);
      await uploadBytes(storageRef, blob as Blob, { contentType: 'image/jpeg' });
      ToastAndroid.show('Successfully saved data!', ToastAndroid.SHORT);
      const url = await getDownloadURL(storageRef);
      setPhotoUrl(url);

      ToastAndroid.show('Url to file has successfully received', ToastAndroid.SHORT);
      const userSettings = { gender, sport, name, surname, city, weight, bio, inputDate, photoUrl };
      await setToAsyncStorage('userSettings', userSettings);
      console.log(userSettings);
      setIsDisabled(false);
      setIsLoading(false);
    } catch (error) {
      setIsDisabled(false);
      setIsLoading(false);
      errorHandler(error);
    } finally {
      setIsLoading(false);
      setIsLoading(false);
    }
  }
  return (
    <ScrollView>
      <SaveSettingsContext.Provider
        value={{
          gender,
          sport,
          name,
          surname,
          city,
          weight,
          bio,
          inputDate,
          image,
          isDisabled,
          setGender,
          setSport,
          setName,
          setSurname,
          setCity,
          setWeight,
          setBio,
          setInputDate,
          setImage,
          setIsDisabled,
        }}>
        <View style={styles.container}>
          <AvatarIcon />
          <InputsNameSurname />
          <InputsWeightCity />
          <SegmentedButtons
            value={sport}
            onValueChange={setSport}
            buttons={SPORT_TYPES}
            style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
          />
          <InputBio />
          <SegmentedButtons
            value={gender}
            onValueChange={setGender}
            buttons={GENDER_TYPES}
            style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
          />
          <InputDatepicker />
          <Button
            mode="outlined"
            style={{ width: 200, marginLeft: 15, marginRight: 15 }}
            onPress={submitHandler}
            loading={isLoading}>
            Save
          </Button>
        </View>
      </SaveSettingsContext.Provider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
});
