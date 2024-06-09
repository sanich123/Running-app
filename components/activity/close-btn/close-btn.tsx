import { setActivityStatus, resetLastKm } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';

import { ACTIVITY_CLOSE_BTN } from './const';

export default function CloseBtn() {
  const { back } = useRouter();
  const { colors, dark } = useTheme();
  const { duration } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  async function closeBtnHandler() {
    dispatch(setActivityStatus(STATUSES.initial));
    dispatch(resetLastKm());
    back();
  }

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.layout}
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
      }}>
      <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
        {ACTIVITY_CLOSE_BTN[language].btnText}
      </Text>
    </TouchableRipple>
  );
}
const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 10,
  },
});
