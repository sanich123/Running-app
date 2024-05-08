import { useAuth } from '@A/context/auth-context';
import { useSendOrDeleteLikeMutation } from '@R/runich-api/runich-api';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { useContext, useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { CARD_LIKE_BTN_ICON_NOT_LIKED } from './const';

export default function ActivityCardLikeBtnSimple({ activityId }: { activityId: string }) {
  const toast = useToast();
  const { user } = useAuth();
  const [sendLike, { data, error }] = useSendOrDeleteLikeMutation();

  const { isDisabled, isLoading } = useContext(ActivityCardBtnsContext);

  useEffect(() => {
    if (data) {
      if (Platform.OS === 'web') {
        toast.show('Action completed');
      } else {
        showCrossPlatformToast('Action completed', ToastDuration.short);
      }
    }
    if (error) {
      if (Platform.OS === 'web') {
        toast.show('An error while sending like');
      } else {
        showCrossPlatformToast('An error while sending like', ToastDuration.long);
      }
    }
  }, [data, error]);

  return (
    <IconButton
      icon={CARD_LIKE_BTN_ICON_NOT_LIKED}
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={async () => {
        if (user) {
          await sendLike({ activityId, authorId: user?.id }).unwrap();
        }
      }}
      disabled={isLoading || isDisabled}
      style={Platform.OS === 'web' && styles.isInCenter}
    />
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
