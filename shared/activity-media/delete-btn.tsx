import { ActivityIndicator, IconButton } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function ActivityMediaDeleteBtn({
  onDelete,
  isDeleting,
}: {
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const label = language === LANGUAGES.russian ? 'Удалить медиа' : 'Delete media';

  return (
    <IconButton
      mode="contained"
      icon={isDeleting ? () => <ActivityIndicator size={18} color="#fff" /> : 'close'}
      iconColor="#fff"
      containerColor="rgba(0, 0, 0, 0.72)"
      size={20}
      style={{ height: 36, width: 36, margin: 0 }}
      onPress={onDelete}
      disabled={isDeleting}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID="activity-media-delete-button"
    />
  );
}
