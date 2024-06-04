import { setCameraIsVisible } from '@R/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { View } from 'react-native';
import { useTheme, Icon, TouchableRipple } from 'react-native-paper';

export default function CloseBtn() {
  const { colors, dark } = useTheme();
  const dispatch = useAppDispatch();

  return (
    <View style={{ marginLeft: 'auto', marginTop: 50, marginRight: 10 }}>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={() => dispatch(setCameraIsVisible(false))}
        testID="CloseBtn">
        <Icon source="close" size={50} color={colors.primaryContainer} />
      </TouchableRipple>
    </View>
  );
}
