import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function YearMonthTitle({ year, month }: { year: string; month: string }) {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
      <Text variant="headlineLarge">{`${new Date(+year, +month).toLocaleDateString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}`}</Text>
    </View>
  );
}
