import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { Button } from 'react-native-paper';
import { runichApi } from '@R/runich-api/runich-api';
import { SETTINGS } from '../const';

export default function ClearCacheBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  return (
    <Button mode="outlined" icon="logout" onPress={() => dispatch(runichApi.util.resetApiState())}>
      {SETTINGS[language].cache}
    </Button>
  );
}
