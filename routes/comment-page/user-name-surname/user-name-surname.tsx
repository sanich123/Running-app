import { memo } from 'react';
import { View } from 'react-native';
import type { MD3TypescaleKey } from 'react-native-paper';
import { Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import type { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

export default memo(function UserNameSurname({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Text variant={size} style={{ fontWeight: 'bold' }}>
        {!error && profileInfo && `${profileInfo?.name} `}
        {error && `${language === LANGUAGES.english ? 'An error' : 'Ошибка'}: ${getErrorMessageFromError(error)}`}
      </Text>
      <Text variant={size} style={{ fontWeight: 'bold' }}>
        {!error && profileInfo && profileInfo?.surname}
      </Text>
    </View>
  );
});
