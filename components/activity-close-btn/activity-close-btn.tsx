import { setActivityStatus, resetLastKm } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import { useRouter } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

import { ACTIVITY_CLOSE_BTN } from './const';

export default function ActivityCloseBtn() {
  const router = useRouter();
  const { colors } = useTheme();
  const { duration } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  async function closeBtnHandler() {
    dispatch(setActivityStatus(STATUSES.initial));
    dispatch(resetLastKm());
    router.back();
  }

  return (
    <Pressable
      onPress={async () => {
        dispatch(setActivityStatus(STATUSES.paused));

        if (duration > 0) {
          Alert.alert(
            ACTIVITY_CLOSE_BTN[language].alertName,
            ACTIVITY_CLOSE_BTN[language].alertQuestion,
            [
              {
                text: ACTIVITY_CLOSE_BTN[language].alertAccept,
                onPress: closeBtnHandler,
                style: 'cancel',
              },
            ],
            {
              cancelable: true,
            },
          );
        } else {
          closeBtnHandler();
        }
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Text variant="titleMedium" style={{ color: colors.primaryContainer, marginLeft: 15 }}>
        {ACTIVITY_CLOSE_BTN[language].btnText}
      </Text>
    </Pressable>
  );
}
