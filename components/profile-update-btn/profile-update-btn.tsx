import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { setIsNeedUpdateProfile } from '../../redux/user-info-slice/user-info-slice';

export default function ProfileUpdateBtn() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        setIsLoading(true);
        dispatch(setIsNeedUpdateProfile(true));
        setIsLoading(false);
      }}
      disabled={isLoading}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginRight: 15 }}>
        Update
      </Text>
    </Pressable>
  );
}
