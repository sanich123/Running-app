import { Fragment } from 'react';
import { View } from 'react-native';
import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';
import { useSelector } from 'react-redux';

import { LANGUAGES } from '../../constants/enums';
import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';
import { errorExtracter } from '../../utils/error-handler';

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
