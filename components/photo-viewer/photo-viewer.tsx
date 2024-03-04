import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import VideoViewer from '@C/video-viewer/video-viewer';
import { useGetActivityByActivityIdQuery, useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import uuid from 'react-native-uuid';

export default function PhotoViewer() {
  const { photoUrl } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: activity } = useGetActivityByActivityIdQuery(`${photoUrl}`);
  const { data: photos } = useGetAllActivityPhotosByUserIdQuery(`${user?.id}`);
  const itemsToRender = uuid.validate(`${photoUrl}`)
    ? activity?.photoVideoUrls
    : photos
        ?.map(({ photoVideoUrls }: { photoVideoUrls: { url: string; thumbnail: string | null } }) => photoVideoUrls)
        .flat();

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <>
          {decodeURIComponent(photoUrl.toString()).includes('mp4') ? (
            <VideoViewer url={decodeURIComponent(photoUrl.toString())} />
          ) : (
            <CustomImage
              source={{ uri: decodeURIComponent(photoUrl.toString()) }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          )}
        </>
      ) : (
        <>
          {itemsToRender?.length > 0 && (
            <PagerView
              style={styles.viewPager}
              initialPage={uuid.validate(`${photoUrl}`) ? 0 : +photoUrl}
              orientation="vertical">
              {itemsToRender.map(({ url, thumbnail }: { url: string; thumbnail: string | null }, index: number) => (
                <View key={index}>
                  {url.includes('mp4') ? (
                    <VideoViewer url={url} thumbnail={thumbnail} />
                  ) : (
                    <CustomImage source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  )}
                </View>
              ))}
            </PagerView>
          )}
        </>
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
