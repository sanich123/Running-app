import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { errorExtracter } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';
import { useSelector } from 'react-redux';

export default function UserCityAge({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  const { language } = useSelector(({ language }) => language);
  return (
    <Text variant={size}>
      {!error && profileInfo && profileInfo?.city}
      {error && `${language === LANGUAGES.english ? 'An error' : 'Ошибка'}: ${errorExtracter(error)}`}
    </Text>
  );
}
