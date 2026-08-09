import { Switch } from 'react-native-paper';
import { setisNeedToPrefetchActivities } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { SETTINGS } from '../const';
import SettingsRow from '../settings-row/settings-row';

export default function PrefetchActivitiesBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const dispatch = useAppDispatch();

  return (
    <SettingsRow
      title={language === 'russian' ? 'Предзагрузка тренировок' : 'Preload workouts'}
      description={`${isNeedToPrefetchActivities ? SETTINGS[language].switchOn : SETTINGS[language].switchOff} ${SETTINGS[language].prefetch}`}
      leading={
        <Switch
          testID="prefetch-activities-switch"
          value={isNeedToPrefetchActivities}
          onValueChange={() => {
            dispatch(setisNeedToPrefetchActivities());
          }}
        />
      }
    />
  );
}
