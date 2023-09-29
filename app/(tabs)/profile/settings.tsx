import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import { View } from '../../../components/Themed';
import AvatarIconEditable from '../../../components/avatar/avatar-editable';
import InputBio from '../../../components/input-bio/input-bio';
import InputDatepicker from '../../../components/input-datepicker/input-datepicker';
import InputsNameSurname from '../../../components/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '../../../components/inputs-weight-city/inputs-weight-city';
import GenderBtns from '../../../components/segmented-btns/gender-btns';
import SportsBtns from '../../../components/segmented-btns/sports-btns';
import { useSendProfileInfoMutation } from '../../../redux/runnich-api/runnich-api';
import { saveSettingsInfo, setIsNeedUpdateProfile } from '../../../redux/user-info-slice/user-info-slice';
import { SaveSettingsContext } from '../../../utils/context/settings';
import { errorHandler } from '../../../utils/error-handler';
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
    photoUrl,
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
    setPhotoUrl,
  } = useGetSettings();
  const { user } = useAuth();
  const [sendProfileInfo] = useSendProfileInfoMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isNeedToUpdateSettings } = useSelector(({ userInfo }) => userInfo);

  async function sendProfile() {
    try {
      const userSettings = {
        gender,
        sport,
        name,
        surname,
        city,
        weight,
        bio,
        birthday: birthday ? new Date(birthday).toString() : null,
        profilePhoto: photoUrl ? photoUrl : image,
      };
      setIsDisabled(true);
      setIsLoading(true);
      dispatch(saveSettingsInfo(userSettings));
      return await sendProfileInfo({
        body: { ...userSettings, birthday: birthday ? new Date(birthday) : null },
        id: user.id,
      })
        .unwrap()
        .then((data) => {
          console.log(data);
          router.back();
          dispatch(setIsNeedUpdateProfile(false));
        })
        .catch((error) => errorHandler(error))
        .finally(() => {
          setIsDisabled(false);
          setIsLoading(false);
        });
    } catch (error) {
      errorHandler(error);
    }
  }
  useEffect(() => {
    if (isNeedToUpdateSettings) {
      sendProfile();
    }
  }, [isNeedToUpdateSettings]);

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
          photoUrl,
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
          setPhotoUrl,
        }}>
        <View style={styles.container}>
          <AvatarIconEditable />
          <InputsNameSurname />
          <InputsWeightCity />
          <SportsBtns sport={sport} setSport={setSport} isDisabled={isDisabled} />
          <InputBio />
          <GenderBtns />
          <InputDatepicker />
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
