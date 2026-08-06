import PagerView from 'react-native-pager-view';
import uuid from 'react-native-uuid';
import { View, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetActivityByActivityIdQuery, useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { CustomImage } from '@Routes/custom-image/custom-image';
import VideoViewer from '@Routes/video-viewer/video-viewer';

export default function PhotoViewer() {
  const { photoUrl, indexOfPhoto, userId, take } = useLocalSearchParams();
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const { data: activity } = useGetActivityByActivityIdQuery(`${photoUrl}`, {
    skip: !photoUrl || !uuid.validate(`${photoUrl}`),
  });
  const { data } = useGetAllActivityPhotosByUserIdQuery(
    {
      userId: userId ? `${userId}` : ownerId,
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
