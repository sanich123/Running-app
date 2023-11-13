import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';
import { useSelector } from 'react-redux';

import { LANGUAGES } from '../../constants/enums';
import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';
import { errorExtracter } from '../../utils/error-handler';

export default function UserBio({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  const { language } = useSelector(({ language }) => language);
  return (
    <Text variant={size}>
      {error && `${language === LANGUAGES.english ? 'An error' : 'Ошибка'}: ${errorExtracter(error)}`}
      {!error && profileInfo && profileInfo?.bio}
    </Text>
  );
}
