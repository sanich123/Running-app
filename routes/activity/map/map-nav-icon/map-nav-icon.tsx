import { MarkerView } from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import UserAvatar from '@S/avatar/avatar';

export default function MapNavIcon({
  profilePhoto,
  name,
  surname,
}: {
  profilePhoto?: string | null;
  name?: string | null;
  surname?: string | null;
}) {
  const { colors } = useTheme();
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  const currentPosition = lastPosition ?? initialLocation;

  return (
    <>
      {currentPosition?.coords ? (
        <MarkerView
          coordinate={[currentPosition.coords.longitude, currentPosition.coords.latitude]}
          anchor={{ x: 0.5, y: 0.5 }}
          allowOverlap
          allowOverlapWithPuck>
          <View style={[styles.customHome, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <UserAvatar size={36} profilePhoto={profilePhoto} name={name} surname={surname} testID="map-nav-avatar" />
          </View>
        </MarkerView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  customHome: {
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
