import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { Href, useRouter } from 'expo-router';
import { TouchableRipple, useTheme, Text, Divider } from 'react-native-paper';

export default function MigrationBtn() {
  const { push } = useRouter();
  const { dark } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const isRussian = language === LANGUAGES.russian;
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        style={{ padding: 10 }}
        onPress={() => push('/home/migration' as Href)}>
        <Text variant="titleMedium">{`${isRussian ? 'Перенести активности из Strava' : 'Migrate from Strava service'}`}</Text>
      </TouchableRipple>
      <Divider />
    </>
  );
}
