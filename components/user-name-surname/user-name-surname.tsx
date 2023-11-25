import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { errorExtracter } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import { View } from 'react-native';
import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';
import { useSelector } from 'react-redux';

export default function UserNameSurname({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  const { language } = useSelector(({ language }) => language);
  return (
    <>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Text variant={size} style={{ fontWeight: 'bold' }}>
          {!error && profileInfo && `${profileInfo?.name} `}
          {error && `${language === LANGUAGES.english ? 'An error' : 'Ошибка'}: ${errorExtracter(error)}`}
        </Text>
        <Text variant={size} style={{ fontWeight: 'bold' }}>
          {!error && profileInfo && profileInfo?.surname}
        </Text>
      </View>
    </>
  );
}
