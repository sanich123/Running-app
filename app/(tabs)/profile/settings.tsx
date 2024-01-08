import AvatarIconEditable from '@C/avatar-editable/avatar-editable';
import GenderBtns from '@C/gender-btns/gender-btns';
import InputBio from '@C/input-bio/input-bio';
import InputsNameSurname from '@C/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '@C/inputs-weight-city/inputs-weight-city';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProfileSettings() {
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <View style={styles.container}>
      <AvatarIconEditable setIsDisabled={setIsDisabled} isDisabled={isDisabled} />
      <InputsNameSurname isDisabled={isDisabled} />
      <InputsWeightCity isDisabled={isDisabled} />
      <InputBio isDisabled={isDisabled} />
      <GenderBtns isDisabled={isDisabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    paddingTop: 40,
  },
});
