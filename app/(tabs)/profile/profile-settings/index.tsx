import AvatarIconEditable from '@C/avatar/editable/editable';
import GenderBtns from '@C/save-activity-page/gender-btns/gender-btns';
import InputBio from '@C/save-activity-page/input-bio/input-bio';
import InputsNameSurname from '@C/save-activity-page/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '@C/save-activity-page/inputs-weight-city/inputs-weight-city';
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
    gap: 15,
    marginTop: 40,
    marginRight: 15,
    marginLeft: 15,
  },
});
