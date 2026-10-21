import { MarkerView } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import UserAvatar from '@S/avatar/user-avatar/user-avatar';

export default function UserAvatarMarker({
  coordinate,
  profilePhoto,
  name,
  surname,
  placeholder,
  testID = 'user-avatar-marker-avatar',
  markerTestID,
}: {
  coordinate: [number, number];
  profilePhoto?: string | null;
  name?: string | null;
  surname?: string | null;
  placeholder?: string | null;
  testID?: string;
  markerTestID?: string;
}) {
  const { colors } = useTheme();

  return (
    <MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} allowOverlap allowOverlapWithPuck>
      <View
        style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.primary }]}
        testID={markerTestID}>
        <UserAvatar
          size={36}
          profilePhoto={profilePhoto}
          name={name}
          surname={surname}
          placeholder={placeholder}
          testID={testID}
        />
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    elevation: 5,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 44,
  },
});
