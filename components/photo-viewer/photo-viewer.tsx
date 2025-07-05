import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import VideoViewer from '@C/video-viewer/video-viewer';
import { useGetActivityByActivityIdQuery, useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';
import uuid from 'react-native-uuid';

export default function PhotoViewer() {
  const { photoUrl, indexOfPhoto, userId, take } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: activity } = useGetActivityByActivityIdQuery(`${photoUrl}`, {
    skip: !photoUrl || !uuid.validate(`${photoUrl}`),
  });
  const { data } = useGetAllActivityPhotosByUserIdQuery(
    {
      userId: userId ? `${userId}` : `${user?.id}`,
      take: Number(take),
    },
    { skip: !take },
  );
  const itemsToRender = uuid.validate(`${photoUrl}`) ? activity?.photoVideoUrls : data?.photos;

  const isMapUrlExist = activity?.mapPhotoUrl ? +`${indexOfPhoto}` - 1 : +`${indexOfPhoto}`;

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <>
          {['mp4', 'avi', 'm4v'].includes(decodeURIComponent(`${photoUrl}`)) ? (
            <VideoViewer url={decodeURIComponent(`${photoUrl}`)} />
          ) : (
            <CustomImage
              source={{ uri: decodeURIComponent(`${photoUrl}`) }}
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
              initialPage={uuid.validate(`${photoUrl}`) ? isMapUrlExist : +`${photoUrl}`}
              orientation="vertical">
              {itemsToRender.map(({ url, blurhash }: { url: string; blurhash: string }, index: number) => (
                <View key={index}>
                  {['mp4', 'avi', 'm4v'].includes(url) ? (
                    <VideoViewer url={url} />
                  ) : (
                    <CustomImage
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      placeholder={blurhash}
                    />
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
