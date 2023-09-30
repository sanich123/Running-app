import { ScrollView, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { View } from '../../../components/Themed';
import AvatarIconEditable from '../../../components/avatar/avatar-editable';
import InputBio from '../../../components/input-bio/input-bio';
import InputDatepicker from '../../../components/input-datepicker/input-datepicker';
import InputsNameSurname from '../../../components/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '../../../components/inputs-weight-city/inputs-weight-city';
import GenderBtns from '../../../components/segmented-btns/gender-btns';
import { saveSettings } from '../../../redux/profile/profile';
import { SaveSettingsContext } from '../../../utils/context/settings';
import useGetSettings from '../../../utils/hooks/use-get-settings';

export default function ProfileSettings() {
  const {
    gender,
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
  const dispatch = useDispatch();

  dispatch(
    saveSettings({
      gender,
      name,
      surname,
      city,
      weight,
      bio,
      birthday: birthday ? new Date(birthday).toString() : null,
      profilePhoto: photoUrl ? photoUrl : image,
    }),
  );

  return (
    <ScrollView>
      <SaveSettingsContext.Provider
        value={{
          gender,
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
