import { TouchableRipple, Text, Divider } from 'react-native-paper';
import { runichApi } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { SETTINGS } from '../const';

export default function ClearCacheBtn() {
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  return (
    <>
      <TouchableRipple borderless onPress={() => dispatch(runichApi.util.resetApiState())} style={{ padding: 10 }}>
        <Text variant="titleMedium">{SETTINGS[language].cache}</Text>
      </TouchableRipple>
      <Divider />
    </>
  );
}
