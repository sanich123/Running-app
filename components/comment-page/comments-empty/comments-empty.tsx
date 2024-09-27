import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function CommentsEmptyList() {
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
      }}>
      <Text variant="bodyLarge">
        {language === LANGUAGES.russian
          ? 'К этой активности еще никто не оставил комментарий. Будь первым, как Гагарин!'
          : "Nobody commented this activity. Don't be shy, write something!"}
      </Text>
    </View>
  );
}
