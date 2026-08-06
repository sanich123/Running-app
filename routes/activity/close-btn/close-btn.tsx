import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Text, TouchableRipple } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { setActivityStatus, resetLastKm } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { ACTIVITY_CLOSE_BTN } from './const';

export default function CloseBtn() {
  const { back } = useRouter();
  const { colors, dark } = useTheme();
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const { duration } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  async function closeBtnHandler() {
    dispatch(setActivityStatus(STATUSES.initial));
    dispatch(resetLastKm());
    back();
  }

  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        style={styles.layout}
        onPress={async () => {
          dispatch(setActivityStatus(STATUSES.paused));
          if (duration > 0) {
            setIsConfirmDialogVisible(true);
          } else {
            closeBtnHandler();
          }
        }}>
        <Text variant="titleMedium" style={{ color: colors.onSurfaceVariant }}>
          {ACTIVITY_CLOSE_BTN[language].btnText}
        </Text>
      </TouchableRipple>
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={ACTIVITY_CLOSE_BTN[language].alertName}
        message={ACTIVITY_CLOSE_BTN[language].alertQuestion}
        confirmText={ACTIVITY_CLOSE_BTN[language].alertAccept}
        onDismiss={() => setIsConfirmDialogVisible(false)}
        onConfirm={() => {
          setIsConfirmDialogVisible(false);
          closeBtnHandler();
        }}
      />
    </>
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
