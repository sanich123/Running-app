import { Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { getHeaderIconSource, HEADER_ICON_SIZE } from '@S/header-icon-source';
import { createActivityBtnStyles as styles } from './styles';
import useCreateActivityAction from './use-create-activity-action';

export default function CreateActivityBtn() {
  const { colors } = useTheme();
  const isIOS = Platform.OS === 'ios';
  const createActivity = useCreateActivityAction();

  return (
    <IconButton
      testID="createActivityIcon"
      icon={getHeaderIconSource('plus', 'plus', colors.onSurface)}
      iconColor={isIOS ? colors.onSurface : colors.primary}
      size={isIOS ? HEADER_ICON_SIZE : 26}
      style={styles.iconButton}
      onPress={createActivity}
    />
  );
}
