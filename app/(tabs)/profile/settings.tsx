import { ScrollView, StyleSheet } from 'react-native';

import { View } from '../../../components/Themed';
import AvatarIcon from '../../../components/avatar/avatar';
import InputBio from '../../../components/input-bio/input-bio';
import InputDatepicker from '../../../components/input-datepicker/input-datepicker';
import InputsNameSurname from '../../../components/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '../../../components/inputs-weight-city/inputs-weight-city';
import SaveSettingsBtn from '../../../components/save-settings-btn/save-settings-btn';
import GenderBtns from '../../../components/segmented-btns/gender-btns';
import SportsBtns from '../../../components/segmented-btns/sports-btns';
import { SaveSettingsContext } from '../../../utils/context/settings';
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
          <SaveSettingsBtn />
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
