import { CustomImage } from '@C/custom-image/custom-image';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { Href, usePathname, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { PROFILE_MEDIA } from './const';
import { PhotoVideoType } from '@C/card/types';
import { MAX_MOBILE_WIDTH } from '@const/const';

export default function ProfileMediaPhotos({ userId }: { userId: string }) {
  const { isLoading, isError, data, error } = useGetAllActivityPhotosByUserIdQuery(
    { userId, take: 4 },
    { skip: !userId },
  );
  const { width } = useWindowDimensions();
  const { push } = useRouter();
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const widthOfScreen = width < MAX_MOBILE_WIDTH ? width : MAX_MOBILE_WIDTH;
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${place}/${ROUTES.mediaGrid}/${userId}` as Href)}
      disabled={isError || isLoading}
      borderless>
      <View
        style={[
          styles.layout,
          {
            backgroundColor: colors.onPrimary,
            width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
          (isLoading || isError) && styles.isInCenter,
        ]}>
        {isError && <Text variant="bodyLarge">{`${PROFILE_MEDIA[language].error}: ${errorExtracter(error)}`}</Text>}
        {data?.photos?.length > 0 &&
          data?.photos?.map(({ url, thumbnail, blurhash }: PhotoVideoType, index: number) => {
            if (index === 3) {
              return (
                <Fragment key={`${url}+${index}`}>
                  <View style={[styles.lastImageWrapper, { width: widthOfScreen / 4 }]}>
                    <CustomImage
                      style={{ width: widthOfScreen / 4, height: widthOfScreen / 4, position: 'absolute' }}
                      source={{ uri: thumbnail || url }}
                      placeholder={blurhash}
                    />
                    <View>
                      <Text style={{ color: 'white' }} variant="titleMedium">
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
});
