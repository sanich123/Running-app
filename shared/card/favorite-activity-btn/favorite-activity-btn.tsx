import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useSetActivityFavoriteMutation } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import {
  FAVORITE_ACTIVITY_BUTTON_COPY,
  FAVORITE_ACTIVITY_BUTTON_ICONS,
  FAVORITE_ACTIVITY_BUTTON_TEST_ID,
} from './const';

export default function FavoriteActivityBtn({ activityId, isFavorite }: { activityId: string; isFavorite: boolean }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const [setActivityFavorite, { isLoading }] = useSetActivityFavoriteMutation();
  const copy = FAVORITE_ACTIVITY_BUTTON_COPY[language];
  const label = isFavorite ? copy.remove : copy.add;
  return (
    <IconButton
      testID={FAVORITE_ACTIVITY_BUTTON_TEST_ID}
      accessibilityRole="button"
      accessibilityLabel={label}
      icon={isFavorite ? FAVORITE_ACTIVITY_BUTTON_ICONS.remove : FAVORITE_ACTIVITY_BUTTON_ICONS.add}
      iconColor={isFavorite ? colors.primary : '#FFFFFF'}
      size={isFavorite ? 22 : 20}
      style={styles.button}
      disabled={isLoading}
      onPress={(event) => {
        event.stopPropagation();
        void setActivityFavorite({ id: activityId, isFavorite: !isFavorite })
          .unwrap()
          .catch((error) => errorToast(label, error));
      }}
    />
  );
}

const styles = StyleSheet.create({
  button: { height: 40, margin: 0, width: 40 },
});
