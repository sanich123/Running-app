import { ProfileType } from '@C/card/const ';
import { CustomImage } from '@C/custom-image/custom-image';
import { SPORTS_BTNS_VALUES } from '@C/sports-btns/const';
import { useAppSelector } from '@R/typed-hooks';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

export default function CardUserInfo({
  profile,
  sport,
  date,
  userId,
}: {
  profile: ProfileType;
  sport: SPORTS_BTNS_VALUES;
  date: Date;
  userId: string;
}) {
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple rippleColor="rgba(0, 0, 0, .08)" onPress={() => push(`/${place}/${ROUTES.profile}/${userId}`)}>
      <View className="flex flex-row items-center gap-4">
        <CustomImage
          style={{ width: 50, height: 50, borderRadius: 70 }}
          source={{ uri: profile?.profilePhoto }}
          placeholder={profile?.profilePhotoBlurhash}
          contentFit="cover"
        />
        <View>
          <View className="flex-1 flex-row">
            <Text variant="titleLarge">{`${profile?.name} ${profile?.surname}`}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="bodyMedium">
              {getIconByTypeOfSport(sport)}
              {` ${formatDate(date, language)} ${getHoursMinutes(date, language)}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
}
