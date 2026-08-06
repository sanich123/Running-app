import { useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import AvatarIconEditable from '@Routes/avatar/editable/editable';
import GenderBtns from '@Routes/save-activity-page/gender-btns/gender-btns';
import InputBio from '@Routes/save-activity-page/input-bio/input-bio';
import InputsNameSurname from '@Routes/save-activity-page/inputs-name-surname/inputs-name-surname';
import InputsWeightCity from '@Routes/save-activity-page/inputs-weight-city/inputs-weight-city';

export default function ProfileSettings() {
  const { colors } = useTheme();
  const [isDisabled, setIsDisabled] = useState(false);
  const { width } = useWindowDimensions();
  return (
    <View
      style={[
        { backgroundColor: colors.background },
        styles.container,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
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
    gap: 10,
    padding: 10,
  },
});
