import { ProfileType } from '@C/card/const ';
import { CustomImage } from '@C/custom-image/custom-image';
import { SPORTS_BTNS_VALUES } from '@C/sports-btns/const';
import { useAppSelector } from '@R/typed-hooks';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

type UserInfoProps = {
  profile: ProfileType;
  sport: SPORTS_BTNS_VALUES;
  date: Date;
  userId: string;
};

export default function UserInfo({ profile, sport, date, userId }: UserInfoProps) {
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor="rgba(0, 0, 0, .08)"
      onPress={() => push(`/${place}/${ROUTES.profile}/${userId}`)}
      borderless
      style={{ borderRadius: 10 }}>
      <View style={styles.userInfoWrapper}>
        <CustomImage
          style={styles.avatarImage}
          source={{ uri: profile?.profilePhoto }}
          placeholder={profile?.profilePhotoBlurhash}
          contentFit="cover"
        />
        <View>
          <View style={styles.nameSurnameWrapper}>
            <Text variant="titleLarge">{`${profile?.name} ${profile?.surname}`}</Text>
          </View>
          <View style={styles.sportDateWrapper}>
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

const styles = StyleSheet.create({
  userInfoWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarImage: { width: 50, height: 50, borderRadius: 70 },
  nameSurnameWrapper: { flex: 1, flexDirection: 'row' },
  sportDateWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
});
