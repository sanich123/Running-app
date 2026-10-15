import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, useTheme } from 'react-native-paper';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { createActivityBtnStyles as styles } from './styles';

export default function CreateActivityBtn() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();

  return (
    <IconButton
      testID="createActivityIcon"
      icon="plus"
      iconColor={colors.primary}
      size={Platform.OS === 'ios' ? 22 : 26}
      style={styles.iconButton}
      onPress={() => {
        dispatch(resetActivityDraft());
        dispatch(resetFinishedActivity());
        push({
          pathname: `/${ROUTES.manualActivity}`,
          params: {
            cameraVisible: 'false',
            manualDate: new Date().toISOString(),
            manualDistance: '0',
            manualHours: '0',
            manualMinutes: '0',
            manualSeconds: '0',
            mode: 'manual',
            title: '',
            description: '',
            sport: 'run',
            emotion: 'normal',
            visibility: ACTIVITY_VISIBILITY.followers,
          },
        });
      }}
    />
  );
}
