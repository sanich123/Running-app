import { View } from '@c/Themed';
import AvatarIconEditable from '@c/avatar/avatar-editable';
import InputBio from '@c/input-bio/input-bio';
import InputDatepicker from '@c/input-datepicker/input-datepicker';
import InputsNameSurname from '@c/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '@c/inputs-weight-city/inputs-weight-city';
import SaveSettingsBtn from '@c/save-settings-btn/save-settings-btn';
import GenderBtns from '@c/segmented-btns/gender-btns';
import SportsBtns from '@c/segmented-btns/sports-btns';
import { SaveSettingsContext } from '@u/context/settings';
import useGetSettings from '@u/hooks/use-get-settings';
import { ScrollView, StyleSheet } from 'react-native';

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
          <SaveSettingsBtn />
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
