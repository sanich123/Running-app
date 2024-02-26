import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { getPhotosWithoutMaps } from '@U/get-photos-without-maps';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';

export default function PhotoViewer() {
  const { photoUrl } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: photos, isSuccess } = useGetAllActivityPhotosByUserIdQuery(`${user?.id}`);
  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <CustomImage
          source={{ uri: decodeURIComponent(photoUrl.toString()) }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />
      ) : (
        <PagerView style={styles.viewPager} initialPage={+photoUrl} orientation="vertical">
          {isSuccess &&
            getPhotosWithoutMaps(photos)?.length > 0 &&
            getPhotosWithoutMaps(photos).map((url, index) => (
              <View style={styles.page} key={index}>
                <CustomImage source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
            ))}
        </PagerView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
