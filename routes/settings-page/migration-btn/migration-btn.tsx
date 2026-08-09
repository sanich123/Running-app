import { useRouter } from 'expo-router';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import SettingsRow from '../settings-row/settings-row';

export default function MigrationBtn() {
  const { push } = useRouter();
  const { language } = useAppSelector(({ language }) => language);
  const { profileFromServer } = useAppSelector(({ profile }) => profile);
  const isRussian = language === LANGUAGES.russian;
  return profileFromServer?.id ? (
    <SettingsRow
      testID="migration-settings-row"
      icon="run"
      title={isRussian ? 'Перенести активности из Strava' : 'Migrate from Strava'}
      description={isRussian ? 'Импортируйте историю тренировок' : 'Import your workout history'}
      onPress={() => push(`/${ROUTES.migration}`)}
    />
  ) : null;
}
