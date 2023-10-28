import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { View } from '../../../components/Themed';
import AvatarIconEditable from '../../../components/avatar/avatar-editable';
import InputBio from '../../../components/input-bio/input-bio';
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
      profilePhoto: photoUrl ? photoUrl : image,
    }),
  );

  return (
    <SaveSettingsContext.Provider
      value={{
        gender,
        name,
        surname,
        city,
        weight,
        bio,
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
      </View>
    </SaveSettingsContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    paddingTop: 40,
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
});
