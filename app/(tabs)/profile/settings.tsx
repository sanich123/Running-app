import { useRouter } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';

import { View } from '../../../components/Themed';
import AvatarIcon from '../../../components/avatar/avatar';
import InputBio from '../../../components/input-bio/input-bio';
import InputDatepicker from '../../../components/input-datepicker/input-datepicker';
import InputsNameSurname from '../../../components/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '../../../components/inputs-weight-city/inputs-weight-city';
import GenderBtns from '../../../components/segmented-btns/gender-btns';
import SportsBtns from '../../../components/segmented-btns/sports-btns';
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
    birthday,
    image,
    isLoading,
    isDisabled,
    setGender,
    setSport,
    setName,
    setSurname,
    setCity,
    setWeight,
    setBio,
    setBirthday,
    setImage,
    setIsLoading,
    setIsDisabled,
  } = useGetSettings();
  const router = useRouter();
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
          birthday,
          image,
          isLoading,
          isDisabled,
          setGender,
          setSport,
          setName,
          setSurname,
          setCity,
          setWeight,
          setBio,
          setBirthday,
          setImage,
          setIsLoading,
          setIsDisabled,
        }}>
        <View style={styles.container}>
          <AvatarIcon />
          <InputsNameSurname />
          <InputsWeightCity />
          <SportsBtns sport={sport} setSport={setSport} isDisabled={isDisabled} />
          <InputBio />
          <GenderBtns />
          <InputDatepicker />
          <Button
            mode="outlined"
            style={{ width: 200, marginLeft: 15, marginRight: 15 }}
            onPress={async () => {
              try {
                setIsDisabled(true);
                setIsLoading(true);
                let profilePhoto = '';
                if (image) {
                  const blob = await getBlobFromUri(image);
                  const fileName = getInfoFromUri(image);
                  const storageRef = ref(FIREBASE_STORAGE, fileName);
                  await uploadBytes(storageRef, blob as Blob, { contentType: 'image/jpeg' });
                  ToastAndroid.show('Successfully upload photo', ToastAndroid.SHORT);
                  profilePhoto = await getDownloadURL(storageRef);
                  ToastAndroid.show('Url to file has successfully received', ToastAndroid.SHORT);
                }
                const userSettings = { gender, sport, name, surname, city, weight, bio, birthday, profilePhoto };
                await setToAsyncStorage('userSettings', userSettings);
                router.back();
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
            }}
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
