import { MarkerView } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { CustomImage } from '@Routes/custom-image/custom-image';

export default function MapNavIcon({ profilePhoto }: { profilePhoto?: string }) {
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
            {profilePhoto ? (
              <CustomImage style={styles.avatar} source={{ uri: profilePhoto }} contentFit="cover" />
            ) : (
              <Icon source="account-circle-outline" size={28} color={colors.primary} />
            )}
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
  avatar: { borderRadius: 18, height: 36, width: 36 },
});
