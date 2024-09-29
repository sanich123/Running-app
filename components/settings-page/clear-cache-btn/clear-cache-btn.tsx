import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { TouchableRipple, useTheme, Text, Divider } from 'react-native-paper';
import { runichApi } from '@R/runich-api/runich-api';
import { SETTINGS } from '../const';

export default function ClearCacheBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  const { dark } = useTheme();
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={() => dispatch(runichApi.util.resetApiState())}
        style={{ padding: 10 }}>
        <Text variant="titleMedium">{SETTINGS[language].cache}</Text>
      </TouchableRipple>
      <Divider />
    </>
  );
}
