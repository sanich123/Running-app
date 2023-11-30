import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

export default function UserBio({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  const { language } = useAppSelector(({ language }) => language);
  return (
    <Text variant={size}>
      {error && `${language === LANGUAGES.english ? 'An error' : 'Ошибка'}: ${errorExtracter(error)}`}
      {!error && profileInfo && profileInfo?.bio}
    </Text>
  );
}
