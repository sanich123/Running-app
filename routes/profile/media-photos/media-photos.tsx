import { Fragment } from 'react';
import { Platform, View, useWindowDimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { useGetAllActivityMediaByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { PROFILE_MEDIA } from './const';
import type { ActivityMediaItem } from '@S/card/types';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const {
    isLoading,
    isError,
    data: pages,
    error,
  } = useGetAllActivityMediaByUserIdInfiniteQuery({ userId, take: 4 }, { skip: !userId });
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  const data = pages?.pages[0];
  const media = data?.media ?? [];

  if (!isLoading && !isError && !data?.media?.length) {
    return null;
  }

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${ROUTES.mediaGrid}/${userId}`)}
      disabled={isError || isLoading}
      borderless>
      <View
        style={[
          styles.layout,
          {
            backgroundColor: colors.background,
            width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
          (isLoading || isError) && styles.isInCenter,
        ]}>
        {isError && (
          <Text variant="bodyLarge">{`${PROFILE_MEDIA[language].error}: ${getErrorMessageFromError(error)}`}</Text>
        )}
        {media.length > 0 &&
          media.map(({ url, thumbnail, blurhash }: ActivityMediaItem, index: number) => {
            if (index === 3) {
              return (
                <Fragment key={`${url}+${index}`}>
                  <View style={[styles.lastImageWrapper, { width: widthOfScreen / 4 }]}>
                    <CustomImage
                      style={{ width: widthOfScreen / 4, height: widthOfScreen / 4, position: 'absolute' }}
                      source={{ uri: thumbnail || url }}
                      placeholder={blurhash}
                    />
                    <View style={styles.labelBackdrop}>
                      <Text style={styles.label} variant="labelLarge">
                        {PROFILE_MEDIA[language].label}
                      </Text>
                    </View>
                  </View>
                </Fragment>
              );
            }
            return (
              <CustomImage
                key={`${url}+${index}`}
                source={{ uri: thumbnail || url }}
                style={{ width: widthOfScreen / 4, height: widthOfScreen / 4 }}
                contentFit="cover"
                placeholder={blurhash}
              />
            );
          })}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    flexDirection: 'row',
  },
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastImageWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
