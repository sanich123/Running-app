import { useGetUserProfileByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import { memo } from 'react';
import { View } from 'react-native';
import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

export default memo(function UserNameSurname({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByUserIdQuery(userId);
  const { language } = useAppSelector(({ language }) => language);
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Text variant={size} style={{ fontWeight: 'bold' }}>
        {!error && profileInfo && `${profileInfo?.name} `}
        {error && `${language === LANGUAGES.english ? 'An error' : 'Ошибка'}: ${errorExtracter(error)}`}
      </Text>
      <Text variant={size} style={{ fontWeight: 'bold' }}>
        {!error && profileInfo && profileInfo?.surname}
      </Text>
    </View>
  );
});
