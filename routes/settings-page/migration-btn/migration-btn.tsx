import { useRouter } from 'expo-router';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import SettingsRow from '../settings-row/settings-row';

export default function MigrationBtn() {
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);

  const isRussian = language === LANGUAGES.russian;
  return (
    <SettingsRow
      testID="migration-settings-row"
      icon="run"
      title={isRussian ? 'Перенести тренировки из другого сервиса' : 'Import workouts from another service'}
      description={isRussian ? 'Импортируйте историю тренировок' : 'Import your workout history'}
      onPress={() => push(`/${ROUTES.migration}`)}
    />
  );
}
